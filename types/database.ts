export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          plan: string
          subscription_status: 'active' | 'canceled' | 'past_due' | 'unpaid'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          plan?: string
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'unpaid'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          plan?: string
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'unpaid'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add other table types here...
    }
  }
}