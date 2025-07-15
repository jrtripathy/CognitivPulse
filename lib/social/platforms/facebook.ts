export class Facebook {
  static async publishPost(post: any) {
    const { access_token, account_id } = post.account
    
    const payload: any = {
      message: post.content,
      access_token
    }

    // Add media if present
    if (post.media_urls && post.media_urls.length > 0) {
      if (post.media_urls.length === 1) {
        // Single image/video
        payload.url = post.media_urls[0]
      } else {
        // Multiple images - create album
        payload.attached_media = post.media_urls.map((url: string, index: number) => ({
          media_fbid: `photo_${index}`
        }))
      }
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${account_id}/feed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Facebook API error: ${error.error?.message || 'Unknown error'}`)
    }

    return await response.json()
  }

  static async getPageInsights(pageId: string, accessToken: string) {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/insights?metric=page_fans,page_impressions,page_engaged_users&access_token=${accessToken}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch Facebook insights')
    }

    return await response.json()
  }
}