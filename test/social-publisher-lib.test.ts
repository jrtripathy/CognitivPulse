import * as publisher from '../lib/social/publisher'

describe('lib/social/publisher', () => {
  it('exports publishToSocialPlatforms', () => {
    expect(typeof publisher.publishToSocialPlatforms).toBe('function')
  })
})
