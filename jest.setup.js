require('@testing-library/jest-dom');
// Jest setup for environment variables and global mocks
process.env.RESEND_API_KEY = 'test_resend_key';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_supabase_key';

// Mock Resend
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      sendEmail: jest.fn().mockResolvedValue({ id: 'mock-email-id' })
    }))
  };
});

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    invoices: { create: jest.fn(), retrieve: jest.fn() },
    customers: { create: jest.fn(), retrieve: jest.fn() }
  }));
});

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => ({ data: {} })) })) })),
      update: jest.fn(() => ({ eq: jest.fn(() => ({})) })),
      insert: jest.fn(() => ({})),
    }))
  })),
  createAdminClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => ({ data: {} })) })) })),
      update: jest.fn(() => ({ eq: jest.fn(() => ({})) })),
      insert: jest.fn(() => ({})),
    }))
  }))
}));
