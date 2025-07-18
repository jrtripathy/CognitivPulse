

describe('lib/config', () => {
  it('exports required config values', () => {
    process.env.RESEND_API_KEY = 'test-resend-key';
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-supabase-role-key';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
    jest.resetModules();
    delete require.cache[require.resolve('../lib/config')];
    const config = require('../lib/config');
    expect(config.ENV).toHaveProperty('RESEND_API_KEY');
    expect(config.ENV).toHaveProperty('STRIPE_SECRET_KEY');
    expect(config.ENV).toHaveProperty('NEXT_PUBLIC_SUPABASE_URL');
    expect(config.ENV).toHaveProperty('SUPABASE_SERVICE_ROLE_KEY');
  });
})
describe('lib/config', () => {
  it('should validate environment variables', () => {
    process.env.RESEND_API_KEY = 'test-resend-key';
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-supabase-role-key';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
    jest.resetModules();
    // Remove config from require cache to ensure fresh env is used
    delete require.cache[require.resolve('../lib/config')];
    const config = require('../lib/config');
    expect(() => config.validateEnv()).not.toThrow();
  });
})
