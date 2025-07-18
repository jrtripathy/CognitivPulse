import { createCampaignLogic, createCampaignSchema } from '../lib/campaigns';
import { z } from 'zod';

describe('createCampaignLogic', () => {
  const baseUser = { id: 'user-1' };
  const baseBody = {
    name: 'Test Campaign',
    subject: 'Test Subject',
    content: 'Test Content',
    contactIds: ['c1', 'c2'],
    scheduledAt: undefined,
  };
  const mockAddToEmailQueue = jest.fn();

  function getSupabase({ profile = true, campaignError = null, recipientsError = null }: {
    profile?: boolean;
    campaignError?: Error | null;
    recipientsError?: Error | null;
  } = {}) {
    return {
      from: jest.fn((table) => {
        if (table === 'user_profiles') {
          return {
            select: () => ({
              eq: () => ({
                single: () => ({ data: profile ? { organization_id: 'org-1' } : null })
              })
            })
          };
        }
        if (table === 'email_campaigns') {
          return {
            insert: () => ({
              select: () => ({
                single: () => ({ data: { id: 'camp-1' }, error: campaignError ?? null })
              })
            })
          };
        }
        if (table === 'email_campaign_recipients') {
          return {
            insert: () => ({ error: recipientsError ?? null })
          };
        }
        return {};
      })
    };
  }

  it('creates a campaign successfully', async () => {
    const supabase = getSupabase();
    const result = await createCampaignLogic({
      supabase,
      user: baseUser,
      body: baseBody,
      addToEmailQueue: mockAddToEmailQueue,
    });
    expect(result.campaign).toBeDefined();
    expect(result.status).toBe(201);
    expect(mockAddToEmailQueue).not.toHaveBeenCalled();
  });

  it('returns 404 if profile not found', async () => {
    const supabase = getSupabase({ profile: false });
    const result = await createCampaignLogic({
      supabase,
      user: baseUser,
      body: baseBody,
      addToEmailQueue: mockAddToEmailQueue,
    });
    expect(result.error).toEqual({ error: 'Profile not found' });
    expect(result.status).toBe(404);
  });

  it('throws if campaign creation fails', async () => {
    const supabase = getSupabase({ campaignError: new Error('fail') });
    await expect(createCampaignLogic({
      supabase,
      user: baseUser,
      body: baseBody,
      addToEmailQueue: mockAddToEmailQueue,
    })).rejects.toThrow('fail');
  });

  it('throws if recipients insert fails', async () => {
    const supabase = getSupabase({ recipientsError: new Error('recipients fail') });
    await expect(createCampaignLogic({
      supabase,
      user: baseUser,
      body: baseBody,
      addToEmailQueue: mockAddToEmailQueue,
    })).rejects.toThrow('recipients fail');
  });

  it('calls addToEmailQueue if scheduledAt is set', async () => {
    const supabase = getSupabase();
    const body = { ...baseBody, scheduledAt: new Date().toISOString() };
    await createCampaignLogic({
      supabase,
      user: baseUser,
      body,
      addToEmailQueue: mockAddToEmailQueue,
    });
    expect(mockAddToEmailQueue).toHaveBeenCalled();
  });

  it('validates input with zod', () => {
    expect(() => createCampaignSchema.parse({ ...baseBody, name: '' })).toThrow(z.ZodError);
  });
});
