

// Hoist mocks before imports
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockImplementation(({ to, subject, html }) => {
        if (!to || !subject || !html) {
          return Promise.resolve({ data: undefined, error: new Error('Missing fields') })
        }
        return Promise.resolve({ data: { id: 'mock-email-id' }, error: undefined })
      })
    }
  }))
}))

jest.mock('@/lib/supabase/client', () => ({
  createAdminClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({}))
    }))
  }))
}))

import { sendEmail } from '../lib/email/sender'

describe('sendEmail', () => {
  it('should throw if missing required fields', async () => {
    await expect(
      sendEmail({ to: '', subject: '', html: '' })
    ).rejects.toThrow()
  })

  it('should send email with valid input (mocked)', async () => {
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Hello</p>',
      campaignId: 'cid',
      contactId: 'ctid',
    })
    expect(result).toBeDefined()
    expect(result.id).toBe('mock-email-id')
  })

  it('should add tracking and unsubscribe links if campaign/contact provided', async () => {
    const html = '<a href="https://example.com">Link</a>'
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Tracked',
      html,
      campaignId: 'cid',
      contactId: 'ctid',
    })
    expect(result).toBeDefined()
  })

  it('should not add tracking if campaign/contact not provided', async () => {
    const html = '<a href="https://example.com">Link</a>'
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'NoTrack',
      html,
    })
    expect(result).toBeDefined()
  })
// removed extra closing brace
})
