import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useAnalytics(timeRange: string = '7d') {
  const supabase = createClient()

  return useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: async () => {
      const endDate = new Date()
      const startDate = new Date()
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
      }

      // Get user's organization
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      // Fetch analytics data
      const [
        trafficData,
        socialEngagement,
        emailPerformance,
        conversionData
      ] = await Promise.all([
        fetchTrafficData(supabase, profile.organization_id, startDate, endDate),
        fetchSocialEngagement(supabase, profile.organization_id, startDate, endDate),
        fetchEmailPerformance(supabase, profile.organization_id, startDate, endDate),
        fetchConversionData(supabase, profile.organization_id, startDate, endDate)
      ])

      // Calculate KPIs
      const totalVisitors = trafficData.reduce((sum, day) => sum + day.visitors, 0)
      const emailOpens = emailPerformance.reduce((sum, day) => sum + day.opened, 0)
      const pageViews = trafficData.reduce((sum, day) => sum + day.page_views, 0)
      const clickRate = emailPerformance.length > 0 
        ? (emailPerformance.reduce((sum, day) => sum + day.clicked, 0) / 
           emailPerformance.reduce((sum, day) => sum + day.sent, 0)) * 100 
        : 0

      return {
        totalVisitors,
        emailOpens,
        pageViews,
        clickRate: Math.round(clickRate * 100) / 100,
        trafficData,
        socialEngagement,
        emailPerformance,
        conversionFunnel: conversionData,
        trafficSources: [
          { name: 'Direct', value: 35 },
          { name: 'Social Media', value: 25 },
          { name: 'Email', value: 20 },
          { name: 'Search', value: 20 }
        ],
        platformPerformance: [
          { platform: 'Facebook', engagement: 1250 },
          { platform: 'Instagram', engagement: 980 },
          { platform: 'Twitter', engagement: 750 },
          { platform: 'LinkedIn', engagement: 450 }
        ],
        campaignROI: [
          { campaign: 'Summer Sale', roi: 3.2 },
          { campaign: 'Welcome Series', roi: 2.8 },
          { campaign: 'Product Launch', roi: 4.1 }
        ]
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
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