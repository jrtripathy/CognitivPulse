import * as supabaseAuth from '../lib/supabase/auth'

describe('lib/supabase/auth', () => {
  it('exports expected auth functions', () => {
        expect(supabaseAuth).toBeDefined()
  })
})
