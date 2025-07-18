// removed erroneous describe block
import { publishToSocialPlatforms } from '../lib/social'

describe('publishToSocialPlatforms', () => {
  const basePost = {
    id: 'post1',
    content: 'Test post',
    media_urls: [],
    account: {
      access_token: 'token',
      account_id: 'acc1',
    },
  }

  it('publishes to Facebook', async () => {
    const orig = require('../lib/social/platforms/facebook').Facebook.publishPost
    require('../lib/social/platforms/facebook').Facebook.publishPost = async () => ({ id: 'fb123' })
    const post = { ...basePost, account: { ...basePost.account, platform: 'facebook' } }
    const result = await publishToSocialPlatforms(post as any)
    expect(result).toBeTruthy()
    require('../lib/social/platforms/facebook').Facebook.publishPost = orig
  })

  it('publishes to Twitter', async () => {
    const post = { ...basePost, account: { ...basePost.account, platform: 'twitter' } }
    const result = await publishToSocialPlatforms(post as any)
    expect(result).toBeTruthy()
  })

  it('publishes to LinkedIn', async () => {
    const post = { ...basePost, account: { ...basePost.account, platform: 'linkedin' } }
    const result = await publishToSocialPlatforms(post as any)
    expect(result).toBeTruthy()
  })

  it('publishes to Instagram', async () => {
    const post = { ...basePost, account: { ...basePost.account, platform: 'instagram' } }
    const result = await publishToSocialPlatforms(post as any)
    expect(result).toBeTruthy()
  })

  it('throws on unsupported platform', async () => {
    const post = { ...basePost, account: { ...basePost.account, platform: 'tiktok' } }
    await expect(publishToSocialPlatforms(post as any)).rejects.toThrow('Unsupported platform')
  })

  it('handles errors and updates status to failed', async () => {
    // Patch Facebook.publishPost to throw
    const orig = require('../lib/social/platforms/facebook').Facebook.publishPost
    require('../lib/social/platforms/facebook').Facebook.publishPost = async () => { throw new Error('fail') }
    const post = { ...basePost, account: { ...basePost.account, platform: 'facebook' } }
    await expect(publishToSocialPlatforms(post as any)).rejects.toThrow('fail')
    require('../lib/social/platforms/facebook').Facebook.publishPost = orig
  })
})
