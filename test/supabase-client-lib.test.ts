import * as supabaseClient from '../lib/supabase/client'

describe('lib/supabase/client', () => {
  it('exports createClient and createAdminClient', () => {
    expect(typeof supabaseClient.createClient).toBe('function')
    expect(typeof supabaseClient.createAdminClient).toBe('function')
  })
})
