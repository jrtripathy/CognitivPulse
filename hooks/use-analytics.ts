import { useQuery } from '@tanstack/react-query';
type DayPerformance = { opened: number; clicked: number; sent: number };
type AnalyticsData = {
  totalVisitors?: number;
  emailOpens?: number;
  pageViews?: number;
  clickRate?: number;
  trafficData?: any[];
  socialEngagement?: any[];
  emailPerformance: DayPerformance[];
  conversionFunnel?: any[];
  trafficSources?: { name: string; percent?: number; value?: number }[];
  platformPerformance?: any[];
  campaignROI?: any[];
};
// Accepts optional timeRange argument for filtering
export function useAnalytics(timeRange?: string): { data: Partial<AnalyticsData>; isLoading: boolean } {
  // Expanded stub for analytics hook to match dashboard usage
  // Optionally vary data based on timeRange
  let multiplier = 1;
  if (timeRange === '30d') multiplier = 2;
  if (timeRange === '90d') multiplier = 3;
  return {
    data: {
      totalVisitors: 1000 * multiplier,
      emailOpens: 500 * multiplier,
      pageViews: 2000 * multiplier,
      clickRate: 42,
      trafficData: [],
      socialEngagement: [],
      emailPerformance: [],
      conversionFunnel: [],
      trafficSources: [
        { name: 'Direct', value: 35 },
        { name: 'Social Media', value: 25 },
        { name: 'Email', value: 20 },
        { name: 'Search', value: 20 }
      ],
      platformPerformance: [],
      campaignROI: [],
    },
    isLoading: false
  };
}

async function fetchTrafficData(supabase: any, orgId: string, startDate: Date, endDate: Date) {
  const { data, error } = await supabase
    .from('analytics_events')
    .select('created_at, event_data')
    .eq('organization_id', orgId)
    .eq('event_type', 'page_view')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (error) throw error

  // Group by date and count visitors
  const dailyData: { [key: string]: { visitors: Set<string>, page_views: number } } = {}
  
  data.forEach((event: any) => {
    const date = new Date(event.created_at).toISOString().split('T')[0]
    if (!dailyData[date]) {
      dailyData[date] = { visitors: new Set(), page_views: 0 }
    }
    
    dailyData[date].visitors.add(event.event_data?.user_id || 'anonymous')
    dailyData[date].page_views++
  })

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    visitors: data.visitors.size,
    page_views: data.page_views
  }))
}

async function fetchSocialEngagement(supabase: any, orgId: string, startDate: Date, endDate: Date) {
  const { data, error } = await supabase
    .from('social_posts')
    .select('published_at, engagement_data')
    .eq('organization_id', orgId)
    .gte('published_at', startDate.toISOString())
    .lte('published_at', endDate.toISOString())

  if (error) throw error

  // Group by date and sum engagement
  const dailyData: { [key: string]: { likes: number, shares: number, comments: number } } = {}
  
  data.forEach((post: any) => {
    const date = new Date(post.published_at).toISOString().split('T')[0]
    if (!dailyData[date]) {
      dailyData[date] = { likes: 0, shares: 0, comments: 0 }
    }
    
    const engagement = post.engagement_data || {}
    dailyData[date].likes += engagement.likes || 0
    dailyData[date].shares += engagement.shares || 0
    dailyData[date].comments += engagement.comments || 0
  })

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    ...data
  }))
}

async function fetchEmailPerformance(supabase: any, orgId: string, startDate: Date, endDate: Date) {
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('sent_at, sent_count, open_count, click_count')
    .eq('organization_id', orgId)
    .gte('sent_at', startDate.toISOString())
    .lte('sent_at', endDate.toISOString())

  if (error) throw error

  return data.map((campaign: any) => ({
    date: new Date(campaign.sent_at).toISOString().split('T')[0],
    sent: campaign.sent_count || 0,
    opened: campaign.open_count || 0,
    clicked: campaign.click_count || 0
  }))
}

async function fetchConversionData(supabase: any, orgId: string, startDate: Date, endDate: Date) {
  // This would be more complex in a real app, tracking the full funnel
  return [
    { stage: 'Visitors', count: 1000 },
    { stage: 'Leads', count: 300 },
    { stage: 'Prospects', count: 100 },
    { stage: 'Customers', count: 25 }
  ]
}