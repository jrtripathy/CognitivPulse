import { Queue, Worker } from 'bullmq'
import { Redis } from 'ioredis'
import { createAdminClient } from '@/lib/supabase/client'
import { sendEmail } from '@/lib/email/sender'

const redis = new Redis(process.env.REDIS_URL!)

export const emailQueue = new Queue('email-campaigns', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
})

// Worker to process email campaigns
const emailWorker = new Worker(
  'email-campaigns',
  async (job) => {
    const { campaignId } = job.data
    
    try {
      const supabase = createAdminClient()
      
      // Get campaign details
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .select(`
          *,
          recipients:email_campaign_recipients(
            contact:email_contacts(*)
          )
        `)
        .eq('id', campaignId)
        .single()

      if (campaignError) throw campaignError

      // Send emails to all recipients
      const sendPromises = campaign.recipients.map(async (recipient: any) => {
        try {
          await sendEmail({
            to: recipient.contact.email,
            subject: campaign.subject,
            html: campaign.content,
            campaignId: campaign.id,
            contactId: recipient.contact.id
          })

          // Update sent count
          await supabase.rpc('increment_campaign_sent_count', {
            campaign_id: campaignId
          })

        } catch (error) {
          console.error(`Failed to send email to ${recipient.contact.email}:`, error)
          throw error
        }
      })

      await Promise.allSettled(sendPromises)

      // Update campaign status
      await supabase
        .from('email_campaigns')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', campaignId)

    } catch (error) {
      console.error(`Campaign ${campaignId} failed:`, error)
      throw error
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
)

emailWorker.on('completed', (job) => {
  console.log(`Email campaign ${job.data.campaignId} completed`)
})

emailWorker.on('failed', (job, err) => {
  console.error(`Email campaign ${job?.data?.campaignId} failed:`, err)
})

export { emailWorker }