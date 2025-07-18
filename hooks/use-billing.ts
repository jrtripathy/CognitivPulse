export function useBilling() {
  // Expanded stub for billing hook to match expected usage
  return {
    plan: 'free',
    subscription: {
      status: 'active',
      plan: 'free',
      currentPeriodEnd: new Date().toISOString(),
    },
    invoices: [{ status: 'paid' }],
    createCheckoutSession: async (_args?: any) => {},
    createPortalSession: async () => {},
    upgrade: () => {},
  };
}
// ...existing code...
