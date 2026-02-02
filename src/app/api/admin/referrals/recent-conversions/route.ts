import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/admin/referrals/recent-conversions?limit=50&status=all
 * Admin-only: Recent conversions timeline
 *
 * Returns: Array<{
 *   id: string
 *   referralCode: string
 *   status: 'pending' | 'active' | 'expired'
 *   createdAt: string
 *   convertedAt: string | null
 *   referrerBusiness: { id, name, slug }
 *   referredBusiness: { id, name, slug }
 * }>
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const statusFilter = searchParams.get('status') || 'all' // 'all', 'pending', 'active', 'expired'

    // Auth check - verify user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (exists in admin_users table)
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Use service client for admin queries
    const serviceClient = await createServiceClient()

    // Build query
    let query = serviceClient
      .from('referral_conversions')
      .select(
        `
        id,
        referral_code,
        status,
        created_at,
        converted_at,
        referrer_business:businesses!referral_conversions_referrer_business_id_fkey(
          id,
          name,
          slug
        ),
        referred_business:businesses!referral_conversions_referred_business_id_fkey(
          id,
          name,
          slug
        )
      `
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data: conversions } = await query

    // Format response
    const formattedConversions = conversions?.map((conversion) => ({
      id: conversion.id,
      referralCode: conversion.referral_code,
      status: conversion.status,
      createdAt: conversion.created_at,
      convertedAt: conversion.converted_at,
      referrerBusiness: {
        id: (conversion.referrer_business as any)?.id || '',
        name: (conversion.referrer_business as any)?.name || 'Unknown',
        slug: (conversion.referrer_business as any)?.slug || '',
      },
      referredBusiness: {
        id: (conversion.referred_business as any)?.id || '',
        name: (conversion.referred_business as any)?.name || 'Unknown',
        slug: (conversion.referred_business as any)?.slug || '',
      },
    }))

    return NextResponse.json({
      conversions: formattedConversions || [],
      count: formattedConversions?.length || 0,
      filter: statusFilter,
    })
  } catch (error) {
    console.error('Error fetching recent conversions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
