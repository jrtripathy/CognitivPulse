import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/client'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  campaignId?: string
  contactId?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  campaignId,
  contactId
}: SendEmailOptions) {
  try {
    // Add tracking pixels and unsubscribe links
    const trackedHtml = addEmailTracking(html, campaignId, contactId)
    
    const { data, error } = await resend.emails.send({
      from: 'noreply@yourapp.com',
      to,
      subject,
      html: trackedHtml,
    })

    if (error) throw error

    // Log email sent event
    if (campaignId && contactId) {
      await logEmailEvent('sent', campaignId, contactId, to)
    }

    return data
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

function addEmailTracking(html: string, campaignId?: string, contactId?: string): string {
  if (!campaignId || !contactId) return html

  // Add open tracking pixel
  const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_SITE_URL}/api/email/track/open?c=${campaignId}&contact=${contactId}" width="1" height="1" style="display:none;" />`
  
  // Add unsubscribe link
  const unsubscribeLink = `<p style="font-size: 12px; color: #666; text-align: center; margin-top: 20px;">
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?c=${campaignId}&contact=${contactId}" style="color: #666;">Unsubscribe</a>
  </p>`

  // Replace links with tracking links
  const trackedHtml = html.replace(
    /<a\s+href="([^"]+)"([^>]*)>/gi,
    `<a href="${process.env.NEXT_PUBLIC_SITE_URL}/api/email/track/click?c=${campaignId}&contact=${contactId}&url=$1"$2>`
  )

  return trackedHtml + trackingPixel + unsubscribeLink
}

async function logEmailEvent(
  eventType: 'sent' | 'opened' | 'clicked',
  campaignId: string,
  contactId: string,
  email: string
) {
  const supabase = createAdminClient()
  
  await supabase.from('analytics_events').insert({
    event_type: `email_${eventType}`,
    event_data: {
      campaign_id: campaignId,
      contact_id: contactId,
      email: email
    }
  })
}