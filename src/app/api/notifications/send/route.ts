/**
 * API Route: Send notification
 * Handles intelligent notification sending based on user preferences
 * Sends to email, in-app, or both depending on settings
 */

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'
import { sendNotificationEmail, type EmailNotificationType } from '@/lib/email/sender'
import TrialExpiringEmail from '@/lib/email/templates/trial-expiring'
import PaymentApprovedEmail from '@/lib/email/templates/payment-approved'
import NewAppointmentEmail from '@/lib/email/templates/new-appointment'

// Secret key for internal API calls
const API_SECRET = process.env.NOTIFICATION_API_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: Request) {
  try {
    // Verify secret key
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, businessId, data } = body

    if (!type || !businessId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, businessId' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get business details
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, logo_url, brand_primary_color, owner_id')
      .eq('id', businessId)
      .single()

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get owner email
    const { data: owner } = await supabase.auth.admin.getUserById(business.owner_id)
    const ownerEmail = owner?.user?.email

    if (!ownerEmail) {
      return NextResponse.json({ error: 'Owner email not found' }, { status: 404 })
    }

    // Send notification based on type
    let emailResult
    let inAppResult

    switch (type) {
      case 'trial_expiring':
        emailResult = await sendNotificationEmail({
          businessId,
          notificationType: 'trial_expiring' as EmailNotificationType,
          to: ownerEmail,
          subject: `⏰ Te quedan ${data.daysRemaining} días de prueba Pro`,
          react: TrialExpiringEmail({
            businessName: business.name,
            daysRemaining: data.daysRemaining,
            logoUrl: business.logo_url || undefined,
            brandColor: business.brand_primary_color || undefined,
          }),
        })

        // Also create in-app notification (assuming you have a notifications table)
        inAppResult = await createInAppNotification(supabase, {
          businessId,
          type: 'trial_expiring',
          title: `Te quedan ${data.daysRemaining} días de prueba`,
          message: 'Tu período de prueba Pro está por vencer. Reporta tu pago para continuar.',
          link: '/suscripcion',
        })
        break

      case 'payment_approved':
        emailResult = await sendNotificationEmail({
          businessId,
          notificationType: 'payment_approved' as EmailNotificationType,
          to: ownerEmail,
          subject: '✅ Tu pago ha sido aprobado',
          react: PaymentApprovedEmail({
            businessName: business.name,
            planName: data.planName || 'Pro',
            amount: data.amount || '₡14,500',
            periodEnd: data.periodEnd,
            logoUrl: business.logo_url || undefined,
            brandColor: '#10b981',
          }),
        })

        inAppResult = await createInAppNotification(supabase, {
          businessId,
          type: 'payment_status',
          title: 'Pago aprobado',
          message: `Tu pago de ${data.amount} ha sido verificado. Plan ${data.planName} activo.`,
          link: '/suscripcion',
        })
        break

      case 'new_appointment':
        emailResult = await sendNotificationEmail({
          businessId,
          notificationType: 'new_appointment' as EmailNotificationType,
          to: ownerEmail,
          subject: `📅 Nueva cita: ${data.clientName} - ${data.serviceName}`,
          react: NewAppointmentEmail({
            businessName: business.name,
            clientName: data.clientName,
            serviceName: data.serviceName,
            barberName: data.barberName,
            appointmentDate: data.appointmentDate,
            duration: data.duration,
            price: data.price,
            logoUrl: business.logo_url || undefined,
            brandColor: business.brand_primary_color || undefined,
          }),
        })

        inAppResult = await createInAppNotification(supabase, {
          businessId,
          type: 'new_appointment',
          title: 'Nueva cita agendada',
          message: `${data.clientName} - ${data.serviceName}`,
          link: '/citas',
        })
        break

      default:
        return NextResponse.json({ error: `Unknown notification type: ${type}` }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      email: emailResult,
      inApp: inAppResult,
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * Create in-app notification
 */
async function createInAppNotification(
  supabase: ReturnType<typeof createServiceClient>,
  notification: {
    businessId: string
    type: string
    title: string
    message: string
    link?: string
  }
) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        business_id: notification.businessId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        read: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating in-app notification:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error creating in-app notification:', error)
    return { success: false, error: String(error) }
  }
}
