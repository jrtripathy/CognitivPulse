import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/config'
import { createAdminClient } from '@/lib/supabase/client'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(supabase, session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(supabase, subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(supabase, subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(supabase, invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(supabase, invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(supabase: any, session: Stripe.Checkout.Session) {
  const organizationId = session.metadata?.organizationId
  if (!organizationId) return

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
  
  await supabase
    .from('organizations')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      plan: getPlanFromPriceId(subscription.items.data[0].price.id)
    })
    .eq('id', organizationId)
}

async function handleSubscriptionUpdated(supabase: any, subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata.organizationId
  if (!organizationId) return

  await supabase
    .from('organizations')
    .update({
      subscription_status: subscription.status,
      plan: getPlanFromPriceId(subscription.items.data[0].price.id)
    })
    .eq('id', organizationId)
}

async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata.organizationId
  if (!organizationId) return

  await supabase
    .from('organizations')
    .update({
      subscription_status: 'canceled',
      plan: 'free'
    })
    .eq('id', organizationId)
}

async function handlePaymentSucceeded(supabase: any, invoice: Stripe.Invoice) {
  // Log successful payment
  const organizationId = (invoice as any).subscription_details?.metadata?.organizationId
  if (!organizationId) return

  await supabase.from('billing_events').insert({
    organization_id: organizationId,
    type: 'payment_succeeded',
    amount: invoice.amount_paid,
    currency: invoice.currency,
    stripe_invoice_id: invoice.id
  })
}

async function handlePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  // Log failed payment and potentially downgrade
  const organizationId = (invoice as any).subscription_details?.metadata?.organizationId
  if (!organizationId) return

  await supabase.from('billing_events').insert({
    organization_id: organizationId,
    type: 'payment_failed',
    amount: invoice.amount_due,
    currency: invoice.currency,
    stripe_invoice_id: invoice.id
  })
}

function getPlanFromPriceId(priceId: string): string {
  const planMap: { [key: string]: string } = {
    'price_starter_monthly': 'starter',
    'price_professional_monthly': 'professional',
    'price_business_monthly': 'business'
  }
  return planMap[priceId] || 'free'
}