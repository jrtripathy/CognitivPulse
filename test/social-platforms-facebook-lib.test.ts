import * as facebook from '../lib/social/platforms/facebook'

describe('lib/social/platforms/facebook', () => {
  it('exports Facebook class', () => {
    expect(typeof facebook.Facebook).toBe('function')
    expect(typeof facebook.Facebook.publishPost).toBe('function')
  })
})
