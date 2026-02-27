/**
 * API Route: Notification Preferences
 * GET - Get notification preferences for current business
 * PATCH - Update notification preferences
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { NotificationPreferences } from '@/types/database'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get notification preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('business_id', business.id)
      .single()

    if (preferencesError) {
      // If not found, create default preferences
      if (preferencesError.code === 'PGRST116') {
        const { data: newPreferences, error: createError } = await supabase
          .from('notification_preferences')
          .insert({
            business_id: business.id,
            channel: 'both',
          })
          .select()
          .single()

        if (createError) {
          return NextResponse.json(
            { error: 'Failed to create preferences', details: createError.message },
            { status: 500 }
          )
        }

        return NextResponse.json(newPreferences)
      }

      return NextResponse.json(
        { error: 'Failed to fetch preferences', details: preferencesError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(preferences)
  } catch (error) {
    logger.error({ err: error }, 'Error in GET /api/notifications/preferences')
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Parse request body
    const body: Partial<NotificationPreferences> = await request.json()

    // Validate channel if provided
    if (body.channel && !['email', 'app', 'both'].includes(body.channel)) {
      return NextResponse.json(
        { error: 'Invalid channel. Must be: email, app, or both' },
        { status: 400 }
      )
    }

    // Update preferences
    const { data: updatedPreferences, error: updateError } = await supabase
      .from('notification_preferences')
      .update(body)
      .eq('business_id', business.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update preferences', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedPreferences)
  } catch (error) {
    logger.error({ err: error }, 'Error in PATCH /api/notifications/preferences')
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
