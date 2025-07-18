
import Stripe from 'stripe'
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any
})

export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '1 social media account',
      '100 email contacts',
      '1 landing page',
      'Basic analytics'
    ],
    limits: {
      socialAccounts: 1,
      emailContacts: 100,
      landingPages: 1,
      emailsPerMonth: 500
    }
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 19,
    stripePriceId: 'price_starter_monthly',
    features: [
      '3 social media accounts',
      '1,000 email contacts',
      '5 landing pages',
      'Email automation',
      'Basic integrations'
    ],
    limits: {
      socialAccounts: 3,
      emailContacts: 1000,
      landingPages: 5,
      emailsPerMonth: 5000
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 49,
    stripePriceId: 'price_professional_monthly',
    features: [
      '10 social media accounts',
      '5,000 email contacts',
      'Unlimited landing pages',
      'Advanced automation',
      'CRM integration',
      'Priority support'
    ],
    limits: {
      socialAccounts: 10,
      emailContacts: 5000,
      landingPages: -1,
      emailsPerMonth: 25000
    }
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 99,
    stripePriceId: 'price_business_monthly',
    features: [
      'Unlimited social accounts',
      '25,000 email contacts',
      'White-label options',
      'Advanced analytics',
      'API access',
      'Dedicated support'
    ],
    limits: {
      socialAccounts: -1,
      emailContacts: 25000,
      landingPages: -1,
      emailsPerMonth: 100000
    }
  }
} as const

export type PlanId = keyof typeof PLANS