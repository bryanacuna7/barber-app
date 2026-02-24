import { evaluatePromo } from '@/lib/promo-engine'
import { createNotification } from '@/lib/notifications'
import { sendPushToUser } from '@/lib/push/sender'
import { getDayOfWeekInTimezone, getHourInTimezone } from '@/lib/utils/timezone'
import type { PromoRule } from '@/types/promo'

interface CompletedAppointmentRow {
  client_id: string | null
  service_id: string | null
  scheduled_at: string
  client: {
    id: string
    user_id: string | null
  } | null
}

interface ClientHistory {
  clientId: string
  userId: string
  appointments: Array<{
    serviceId: string | null
    scheduledAt: Date
  }>
}

interface HabitBucket {
  dow: number
  hour: number
  count: number
  serviceId: string | null
}

interface SmartNotificationStats {
  businessesProcessed: number
  clientsEvaluated: number
  candidatesFound: number
  sent: number
  skipped: number
  errors: number
}

const HISTORY_WEEKS = 12
const WINDOW_HOURS = 28
const COOLDOWN_DAYS = 7
const ATTR_TTL_DAYS = 7

export async function runSmartPromoNotifications(
  serviceClient: any,
  now: Date = new Date()
): Promise<SmartNotificationStats> {
  const stats: SmartNotificationStats = {
    businessesProcessed: 0,
    clientsEvaluated: 0,
    candidatesFound: 0,
    sent: 0,
    skipped: 0,
    errors: 0,
  }

  const { data: businesses, error: businessError } = await serviceClient
    .from('businesses')
    .select('id, slug, timezone, promotional_slots, smart_notifications_enabled')
    .eq('is_active', true)
    .eq('smart_notifications_enabled', true)
    .limit(200)

  if (businessError || !businesses?.length) {
    return stats
  }

  for (const business of businesses as any[]) {
    stats.businessesProcessed++

    const businessId = business.id as string
    const slug = business.slug as string | null
    const timezone = (business.timezone as string | null) || 'America/Costa_Rica'
    const rules = ((business.promotional_slots as PromoRule[]) || []).filter((r) => r?.enabled)

    if (!slug || rules.length === 0) {
      stats.skipped++
      continue
    }

    const historyStart = new Date(now)
    historyStart.setDate(historyStart.getDate() - HISTORY_WEEKS * 7)

    const { data: completed } = (await serviceClient
      .from('appointments')
      .select(
        'client_id, service_id, scheduled_at, client:clients!appointments_client_id_fkey(id, user_id)'
      )
      .eq('business_id', businessId)
      .eq('status', 'completed')
      .gte('scheduled_at', historyStart.toISOString())
      .not('client_id', 'is', null)
      .order('scheduled_at', { ascending: false })
      .limit(5000)) as { data: CompletedAppointmentRow[] | null }

    if (!completed?.length) {
      stats.skipped++
      continue
    }

    const clientMap = new Map<string, ClientHistory>()
    const usedServiceIds = new Set<string>()

    for (const row of completed) {
      if (!row.client_id || !row.client?.user_id) continue

      const key = row.client_id
      const existing = clientMap.get(key)
      const entry = {
        serviceId: row.service_id,
        scheduledAt: new Date(row.scheduled_at),
      }

      if (row.service_id) usedServiceIds.add(row.service_id)

      if (!existing) {
        clientMap.set(key, {
          clientId: row.client_id,
          userId: row.client.user_id,
          appointments: [entry],
        })
      } else {
        existing.appointments.push(entry)
      }
    }

    if (clientMap.size === 0) {
      stats.skipped++
      continue
    }

    const { data: prefRows } = await (serviceClient as any)
      .from('client_notification_preferences')
      .select('client_id, user_id, smart_promos_enabled, smart_promos_paused_until')
      .eq('business_id', businessId)

    const prefByUserId = new Map<string, { enabled: boolean; pausedUntil: Date | null }>()
    for (const pref of (prefRows || []) as any[]) {
      prefByUserId.set(pref.user_id, {
        enabled: pref.smart_promos_enabled !== false,
        pausedUntil: pref.smart_promos_paused_until ? new Date(pref.smart_promos_paused_until) : null,
      })
    }

    const cooldownStart = new Date(now)
    cooldownStart.setDate(cooldownStart.getDate() - COOLDOWN_DAYS)

    const { data: cooldownRows } = await (serviceClient as any)
      .from('smart_notification_attribution')
      .select('user_id')
      .eq('business_id', businessId)
      .gt('sent_at', cooldownStart.toISOString())

    const usersInCooldown = new Set<string>((cooldownRows || []).map((r: any) => r.user_id))

    const servicesById = new Map<string, { id: string; name: string; price: number; is_active: boolean }>()
    if (usedServiceIds.size > 0) {
      const { data: services } = await serviceClient
        .from('services')
        .select('id, name, price, is_active')
        .eq('business_id', businessId)
        .in('id', [...usedServiceIds])

      for (const s of (services || []) as any[]) {
        servicesById.set(s.id, {
          id: s.id,
          name: s.name,
          price: Number(s.price || 0),
          is_active: s.is_active === true,
        })
      }
    }

    for (const client of clientMap.values()) {
      stats.clientsEvaluated++

      if (usersInCooldown.has(client.userId)) {
        stats.skipped++
        continue
      }

      const pref = prefByUserId.get(client.userId)
      if (pref && !pref.enabled) {
        stats.skipped++
        continue
      }

      if (pref?.pausedUntil && pref.pausedUntil > now) {
        stats.skipped++
        continue
      }

      const habit = detectHabitBucket(client.appointments, timezone)
      if (!habit || habit.count < 3) {
        stats.skipped++
        continue
      }

      const targetSlot = findBucketSlotInWindow(habit.dow, habit.hour, timezone, now, WINDOW_HOURS)
      if (!targetSlot) {
        stats.skipped++
        continue
      }

      const habitualService = habit.serviceId ? servicesById.get(habit.serviceId) : undefined
      const evalServiceId = habitualService?.is_active ? habitualService.id : ''
      const evalPrice = habitualService?.is_active ? habitualService.price : 0

      const promoEval = evaluatePromo(rules, targetSlot, evalServiceId, evalPrice, timezone)
      if (!promoEval.applied || !promoEval.rule) {
        stats.skipped++
        continue
      }

      stats.candidatesFound++

      const token = crypto.randomUUID()
      const promoRuleId = isUuid(promoEval.rule.id) ? promoEval.rule.id : null
      const expiresAt = new Date(now)
      expiresAt.setDate(expiresAt.getDate() + ATTR_TTL_DAYS)

      const { data: attribution, error: attrError } = await (serviceClient as any)
        .from('smart_notification_attribution')
        .insert({
          token,
          business_id: businessId,
          client_id: client.clientId,
          user_id: client.userId,
          habit_bucket_dow: habit.dow,
          habit_bucket_hour: habit.hour,
          promo_rule_id: promoRuleId,
          expires_at: expiresAt.toISOString(),
          sent_at: null,
        })
        .select('id')
        .single()

      if (attrError || !attribution) {
        stats.errors++
        continue
      }

      const discountText =
        promoEval.rule.discount_type === 'percent'
          ? `${promoEval.rule.discount_value}%`
          : `₡${Number(promoEval.rule.discount_value).toLocaleString('es-CR')}`

      const serviceHint = habitualService?.is_active ? ` en ${habitualService.name}` : ''
      const title = 'Promo en tu horario habitual'
      const message = `${discountText} de descuento${serviceHint}. Reservá antes de que termine.`
      const bookingPath = `/reservar/${slug}?sn=${token}`

      const [pushResult, inAppResult] = await Promise.allSettled([
        // Phase 1 intentionally uses push + in-app only (no email channel).
        sendPushToUser(client.userId, {
          title,
          body: message,
          url: bookingPath,
          tag: `smart-promo-${businessId}-${client.userId}`,
        }),
        createNotification(serviceClient, {
          user_id: client.userId,
          business_id: businessId,
          type: 'smart_promo_offer',
          title,
          message,
          reference_type: 'smart_promo',
          metadata: {
            url: bookingPath,
            token,
            promo_rule_id: promoRuleId,
          },
        }),
      ])

      const pushSent =
        pushResult.status === 'fulfilled' && (pushResult.value?.sent as number | undefined) > 0
      const inAppId = inAppResult.status === 'fulfilled' ? inAppResult.value : null
      const inAppSent = Boolean(inAppId)

      if (pushSent || inAppSent) {
        await (serviceClient as any)
          .from('smart_notification_attribution')
          .update({
            sent_at: new Date().toISOString(),
            notification_id: inAppId,
          })
          .eq('id', attribution.id)

        stats.sent++
      } else {
        await (serviceClient as any).from('smart_notification_attribution').delete().eq('id', attribution.id)
        stats.errors++
      }
    }
  }

  return stats
}

function detectHabitBucket(appointments: Array<{ serviceId: string | null; scheduledAt: Date }>, tz: string) {
  if (!appointments.length) return null

  const buckets = new Map<
    string,
    {
      dow: number
      hour: number
      count: number
      lastSeen: number
      serviceCounts: Map<string, number>
    }
  >()

  for (const apt of appointments) {
    const dow = getDayOfWeekInTimezone(apt.scheduledAt, tz)
    const hour = getHourInTimezone(apt.scheduledAt, tz)
    const key = `${dow}-${hour}`

    const existing = buckets.get(key)
    if (!existing) {
      const serviceCounts = new Map<string, number>()
      if (apt.serviceId) serviceCounts.set(apt.serviceId, 1)
      buckets.set(key, {
        dow,
        hour,
        count: 1,
        lastSeen: apt.scheduledAt.getTime(),
        serviceCounts,
      })
      continue
    }

    existing.count += 1
    if (apt.scheduledAt.getTime() > existing.lastSeen) {
      existing.lastSeen = apt.scheduledAt.getTime()
    }
    if (apt.serviceId) {
      existing.serviceCounts.set(apt.serviceId, (existing.serviceCounts.get(apt.serviceId) || 0) + 1)
    }
  }

  const ranked = [...buckets.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return b.lastSeen - a.lastSeen
  })

  const best = ranked[0]
  if (!best) return null

  const serviceRanked = [...best.serviceCounts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1]
    return a[0].localeCompare(b[0])
  })

  return {
    dow: best.dow,
    hour: best.hour,
    count: best.count,
    serviceId: serviceRanked[0]?.[0] || null,
  } as HabitBucket
}

function findBucketSlotInWindow(
  dow: number,
  hour: number,
  timezone: string,
  from: Date,
  windowHours: number
): Date | null {
  const cursor = new Date(from)
  cursor.setMinutes(0, 0, 0)
  cursor.setHours(cursor.getHours() + 1)

  const end = new Date(from.getTime() + windowHours * 60 * 60_000)

  while (cursor <= end) {
    const localDow = getDayOfWeekInTimezone(cursor, timezone)
    const localHour = getHourInTimezone(cursor, timezone)

    if (localDow === dow && localHour === hour) {
      return new Date(cursor)
    }

    cursor.setHours(cursor.getHours() + 1)
  }

  return null
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}
