import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createCampaignSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  content: z.string().min(1),
  contactIds: z.array(z.string()),
  scheduledAt: z.string().datetime().optional()
})

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
    const supabase = createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createCampaignSchema.parse(body)

    // Get user's organization
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .insert({
        organization_id: profile.organization_id,
        name: validatedData.name,
        subject: validatedData.subject,
        content: validatedData.content,
        recipient_count: validatedData.contactIds.length,
        scheduled_at: validatedData.scheduledAt,
        status: validatedData.scheduledAt ? 'scheduled' : 'draft'
      })
      .select()
      .single()

    if (campaignError) throw campaignError

    // Add recipients
    const recipients = validatedData.contactIds.map(contactId => ({
      campaign_id: campaign.id,
      contact_id: contactId
    }))

    const { error: recipientsError } = await supabase
      .from('email_campaign_recipients')
      .insert(recipients)

    if (recipientsError) throw recipientsError

    // If scheduled, add to queue
    if (validatedData.scheduledAt) {
      await addToEmailQueue(campaign.id, validatedData.scheduledAt)
    }

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function addToEmailQueue(campaignId: string, scheduledAt: string) {
  // Implementation for adding to background job queue
  // This would integrate with your queue system (BullMQ, etc.)
  console.log(`Campaign ${campaignId} scheduled for ${scheduledAt}`)
}