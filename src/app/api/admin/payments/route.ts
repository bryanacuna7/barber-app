import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/admin'

export async function GET(request: Request) {
  // Use regular client for auth check (has user session)
  const authClient = await createClient()
  const admin = await verifyAdmin(authClient)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Use service client for data queries (bypasses RLS)
  const supabase = await createServiceClient()

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'pending'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  // Build query
  let query = supabase
    .from('payment_reports')
    .select(
      `
      *,
      business:businesses(id, name, slug),
      plan:subscription_plans(name, display_name)
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  // Status filter
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  // Search by business name
  if (search) {
    // First get businesses matching search
    const { data: matchingBusinesses } = await supabase
      .from('businesses')
      .select('id')
      .ilike('name', `%${search}%`)

    if (matchingBusinesses && matchingBusinesses.length > 0) {
      query = query.in(
        'business_id',
        matchingBusinesses.map((b) => b.id)
      )
    } else {
      // No matching businesses, return empty
      return NextResponse.json({
        payments: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      })
    }
  }

  const { data: payments, error, count } = await query

  if (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    payments,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}
