import { z } from 'zod';

export const createCampaignSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  content: z.string().min(1),
  contactIds: z.array(z.string()),
  scheduledAt: z.string().datetime().optional(),
});

export async function createCampaignLogic({
  supabase,
  user,
  body,
  addToEmailQueue,
}: {
  supabase: any;
  user: any;
  body: any;
  addToEmailQueue: (campaignId: string, scheduledAt: string) => Promise<void>;
}) {
  const validatedData = createCampaignSchema.parse(body);

  // Get user's organization
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { error: { error: 'Profile not found' }, status: 404 };
  }

  // Create campaign
  const { data: campaign, error: campaignError } = await supabase
    .from('email_campaigns')
    .insert({
      organization_id: profile.organization_id,
      name: validatedData.name,
      subject: validatedData.subject,
      content: validatedData.content,
      recipient_count: validatedData.contactIds.length,
      scheduled_at: validatedData.scheduledAt,
      status: validatedData.scheduledAt ? 'scheduled' : 'draft',
    })
    .select()
    .single();

  if (campaignError) throw campaignError;

  // Add recipients
  const recipients = validatedData.contactIds.map((contactId: string) => ({
    campaign_id: campaign.id,
    contact_id: contactId,
  }));

  const { error: recipientsError } = await supabase
    .from('email_campaign_recipients')
    .insert(recipients);

  if (recipientsError) throw recipientsError;

  // If scheduled, add to queue
  if (validatedData.scheduledAt) {
    await addToEmailQueue(campaign.id, validatedData.scheduledAt);
  }

  return { campaign, status: 201 };
}
