
import { AuthService } from '../lib/supabase/auth'
describe('lib/supabase/auth', () => {
  const email = 'test@example.com'
  const password = 'password123'
  const orgName = 'CognitivPulse Org'

  it('signs up a user and organization', async () => {
    const mockSupabase: any = {
      auth: {
        signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'u1', email } }, error: null })
      },
      from: jest.fn(() => ({
        insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => ({ data: { id: 'org1' }, error: null })) })) }))
      }))
    }
    const service = new AuthService(mockSupabase)
    await expect(service.signUp(email, password, orgName)).resolves.toHaveProperty('user.id', 'u1')
  })

  it('throws on signup error', async () => {
    const mockSupabase: any = {
      auth: {
        signUp: jest.fn().mockResolvedValue({ data: {}, error: new Error('signup fail') })
      }
    }
    const service = new AuthService(mockSupabase)
    await expect(service.signUp(email, password, orgName)).rejects.toThrow('signup fail')
  })

  it('signs in a user', async () => {
    const mockSupabase: any = {
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({ data: { session: 'sess' }, error: null })
      }
    }
    const service = new AuthService(mockSupabase)
    await expect(service.signIn(email, password)).resolves.toHaveProperty('session', 'sess')
  })

  it('throws on sign in error', async () => {
    const mockSupabase: any = {
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({ data: {}, error: new Error('signin fail') })
      }
    }
    const service = new AuthService(mockSupabase)
    await expect(service.signIn(email, password)).rejects.toThrow('signin fail')
  })

  it('signs out a user', async () => {
    const mockSupabase: any = {
      auth: {
        signOut: jest.fn().mockResolvedValue({ error: null })
      }
    }
    const service = new AuthService(mockSupabase)
    await expect(service.signOut()).resolves.toBeUndefined()
  })

  it('throws on sign out error', async () => {
    const mockSupabase: any = {
      auth: {
        signOut: jest.fn().mockResolvedValue({ error: new Error('signout fail') })
      }
    }
    const service = new AuthService(mockSupabase)
    await expect(service.signOut()).rejects.toThrow('signout fail')
  })

  it('gets current user', async () => {
    const mockSupabase: any = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } })
      }
    }
    const service = new AuthService(mockSupabase)
    await expect(service.getCurrentUser()).resolves.toHaveProperty('id', 'u1')
  })

  it('gets user profile', async () => {
    const mockSupabase: any = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => ({ data: { id: 'u1', organization: { id: 'org1' } }, error: null })) })) }))
      }))
    }
    const service = new AuthService(mockSupabase)
    await expect(service.getUserProfile('u1')).resolves.toHaveProperty('id', 'u1')
  })

  it('throws on get user profile error', async () => {
    const mockSupabase: any = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => ({ data: {}, error: new Error('profile fail') })) })) }))
      }))
    }
    const service = new AuthService(mockSupabase)
    await expect(service.getUserProfile('u1')).rejects.toThrow('profile fail')
  })
})
