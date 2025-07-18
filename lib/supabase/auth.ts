import { createClient } from './client'
import { AuthError, User } from '@supabase/supabase-js'


export class AuthService {
  private supabase: ReturnType<typeof createClient>

  constructor(supabaseClient?: ReturnType<typeof createClient>) {
    this.supabase = supabaseClient || createClient()
  }

  async signUp(email: string, password: string, organizationName: string) {
    try {
      // 1. Create user account
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        }
      })

      if (authError) throw authError

      // 2. Create organization
      const orgSlug = organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-')
      const { data: orgData, error: orgError } = await this.supabase
        .from('organizations')
        .insert({
          name: organizationName,
          slug: orgSlug,
        })
        .select()
        .single()

      if (orgError) throw orgError

      // 3. Create user profile
      if (authData.user) {
        const { error: profileError } = await this.supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            organization_id: orgData.id,
            email: authData.user.email!,
            role: 'owner'
          })

        if (profileError) throw profileError
      }

      return { user: authData.user, organization: orgData }
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser()
    return user
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  }
}

export const authService = new AuthService()