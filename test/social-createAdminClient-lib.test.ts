import * as createAdminClient from '../lib/social/createAdminClient'

describe('lib/social/createAdminClient', () => {
  it('exports a function', () => {
    expect(typeof createAdminClient.createAdminClient).toBe('function')
  })
})
