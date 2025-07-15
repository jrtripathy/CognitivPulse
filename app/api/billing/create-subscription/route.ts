import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/config'
import { z } from 'zod'

const createSubscriptionSchema = z.object({
  priceId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { priceId, successUrl, cancelUrl } = createSubscriptionSchema.parse(body)

    // Get user's organization
    const { data: profile } = await supabase
      .from('user_profiles')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('id', user.id)
      .single()

    if (!profile?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    let customerId = profile.organization.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: profile.organization.name,
        metadata: {
          organizationId: profile.organization.id,
          userId: user.id
        }
      })

      customerId = customer.id

      // Update organization with customer ID
      await supabase
        .from('organizations')
        .update({ stripe_customer_id: customerId })
        .eq('id', profile.organization.id)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        organizationId: profile.organization.id,
        userId: user.id
      },
      subscription_data: {
        metadata: {
          organizationId: profile.organization.id,
          userId: user.id
        }
      }
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}