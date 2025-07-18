import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { publishToSocialPlatforms } from '@/lib/social/publisher'

const createPostSchema = z.object({
  content: z.string().min(1).max(2000),
  platforms: z.array(z.enum(['facebook', 'instagram', 'twitter', 'linkedin'])),
  mediaUrls: z.array(z.string()).optional(),
  scheduledAt: z.string().datetime().optional(),
  accountIds: z.array(z.string())
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPostSchema.parse(body)

    // Get user's organization
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Create posts for each platform/account combination
    const posts = []
    
    for (const accountId of validatedData.accountIds) {
      const { data: post, error } = await supabase
        .from('social_posts')
        .insert({
          organization_id: profile.organization_id,
          account_id: accountId,
          content: validatedData.content,
          media_urls: validatedData.mediaUrls || [],
          scheduled_at: validatedData.scheduledAt,
          status: validatedData.scheduledAt ? 'scheduled' : 'draft'
        })
        .select(`
          *,
          account:social_accounts(*)
        `)
        .single()

      if (error) throw error
      posts.push(post)
    }

    // If not scheduled, publish immediately
    if (!validatedData.scheduledAt) {
      for (const post of posts) {
        try {
          await publishToSocialPlatforms(post)
        } catch (error) {
          console.error(`Failed to publish post ${post.id}:`, error)
        }
      }
    }

    return NextResponse.json({ posts }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error creating posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}