import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/tours
 * Fetch all tour progress records for the current business
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get business ID
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Get all tour progress for this business
    const { data: tours, error } = await supabase
      .from('tour_progress')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching tours:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tours: tours || [] });
  } catch (error) {
    console.error('Error in GET /api/tours:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/tours
 * Update or create tour progress for a specific tour
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get business ID
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const body = await request.json();
    const { tourId, completed } = body;

    if (!tourId) {
      return NextResponse.json({ error: 'tourId is required' }, { status: 400 });
    }

    // Prepare data
    const tourData: any = {
      business_id: business.id,
      tour_id: tourId,
      completed: completed ?? false,
    };

    if (completed) {
      tourData.completed_at = new Date().toISOString();
    }

    // Upsert tour progress (insert or update)
    const { data, error } = await supabase
      .from('tour_progress')
      .upsert(tourData, {
        onConflict: 'business_id,tour_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating tour progress:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/tours:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
