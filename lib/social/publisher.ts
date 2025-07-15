import { Facebook } from './platforms/facebook'
import { Twitter } from './platforms/twitter'
import { LinkedIn } from './platforms/linkedin'
import { Instagram } from './platforms/instagram'

interface SocialPost {
  id: string
  content: string
  media_urls: string[]
  account: {
    platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin'
    access_token: string
    account_id: string
  }
}

export async function publishToSocialPlatforms(post: SocialPost) {
  const { platform } = post.account
  
  try {
    let result
    
    switch (platform) {
      case 'facebook':
        result = await Facebook.publishPost(post)
        break
      case 'twitter':
        result = await Twitter.publishPost(post)
        break
      case 'linkedin':
        result = await LinkedIn.publishPost(post)
        break
      case 'instagram':
        result = await Instagram.publishPost(post)
        break
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }

    // Update post with platform post ID
    const supabase = createAdminClient()
    await supabase
      .from('social_posts')
      .update({
        platform_post_id: result.id,
        published_at: new Date().toISOString(),
        status: 'published'
      })
      .eq('id', post.id)

    return result
  } catch (error) {
    console.error(`Failed to publish to ${platform}:`, error)
    
    // Update post status to failed
    const supabase = createAdminClient()
    await supabase
      .from('social_posts')
      .update({ status: 'failed' })
      .eq('id', post.id)
    
    throw error
  }
}