// Minimal stub for createAdminClient for type safety
export function createAdminClient() {
  return {
    from: (..._args: any[]) => ({
      select: () => ({
        eq: (..._args: any[]) => ({
          single: () => ({ data: {} })
        })
      }),
      update: (..._args: any[]) => ({ eq: (..._args: any[]) => ({}) })
    })
  };
}
