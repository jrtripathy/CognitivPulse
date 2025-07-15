import { Queue, Worker } from 'bullmq'
import { Redis } from 'ioredis'
import { publishToSocialPlatforms } from '@/lib/social/publisher'
import { createAdminClient } from '@/lib/supabase/client'

const redis = new Redis(process.env.REDIS_URL!)

export const socialQueue = new Queue('social-posts', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
})

// Worker to process social media posts
const socialWorker = new Worker(
  'social-posts',
  async (job) => {
    const { postId, scheduledPost } = job.data
    
    try {
      const supabase = createAdminClient()
      
      if (postId) {
        // Process existing post
        const { data: post, error } = await supabase
          .from('social_posts')
          .select(`
            *,
            account:social_accounts(*)
          `)
          .eq('id', postId)
          .single()

        if (error) throw error
        
        await publishToSocialPlatforms(post)
      } else if (scheduledPost) {
        // Process automation post
        await publishToSocialPlatforms(scheduledPost)
      }

    } catch (error) {
      console.error(`Social post job failed:`, error)
      throw error
    }
  },
  {
    connection: redis,
    concurrency: 3,
  }
)

socialWorker.on('completed', (job) => {
  console.log(`Social post ${job.data.postId} published successfully`)
})

socialWorker.on('failed', (job, err) => {
  console.error(`Social post ${job?.data?.postId} failed:`, err)
})

export { socialWorker }