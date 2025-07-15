import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/config'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { returnUrl } = await request.json()

    // Get user's organization
    const { data: profile } = await supabase
      .from('user_profiles')
      .select(`
        organization:organizations(stripe_customer_id)
      `)
      .eq('id', user.id)
      .single()

    if (!profile?.organization?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found' },
        { status: 404 }
      )
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.organization.stripe_customer_id,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`
    })

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}