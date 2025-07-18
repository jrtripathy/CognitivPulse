import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createCampaignSchema, createCampaignLogic } from '@/lib/campaigns'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get campaigns for organization
    const { data: campaigns, error } = await supabase
      .from('email_campaigns')
      .select(`
        *,
        _count: email_campaign_recipients(count)
      `)
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const result = await createCampaignLogic({
      supabase,
      user,
      body,
      addToEmailQueue,
    });
    if (result.error) {
      return NextResponse.json(result.error, { status: result.status });
    }
    return NextResponse.json({ campaign: result.campaign }, { status: result.status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function addToEmailQueue(campaignId: string, scheduledAt: string) {
  // Implementation for adding to background job queue
  // This would integrate with your queue system (BullMQ, etc.)
  console.log(`Campaign ${campaignId} scheduled for ${scheduledAt}`)
}