import * as stripeConfig from '../lib/stripe/config'

describe('lib/stripe/config', () => {
  it('exports a Stripe instance and config', () => {
    expect(stripeConfig).toHaveProperty('stripe')
    expect(stripeConfig).toHaveProperty('PLANS')
  })
})
