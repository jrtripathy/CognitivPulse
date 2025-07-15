'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useSocialPosts } from '@/hooks/use-social-posts'

const postSchema = z.object({
  content: z.string().min(1, 'Content is required').max(280, 'Content too long'),
  scheduledAt: z.date().optional(),
  mediaUrls: z.array(z.string()).optional(),
  platforms: z.array(z.enum(['facebook', 'instagram', 'twitter', 'linkedin'])).min(1)
})

type PostFormData = z.infer<typeof postSchema>

export function PostScheduler() {
  const [isScheduling, setIsScheduling] = useState(false)
  const { createPost, isLoading } = useSocialPosts()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      platforms: []
    }
  })

  const scheduledAt = watch('scheduledAt')
  const platforms = watch('platforms')

  const onSubmit = async (data: PostFormData) => {
    try {
      await createPost({
        ...data,
        status: data.scheduledAt ? 'scheduled' : 'draft'
      })
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const togglePlatform = (platform: string) => {
    const current = platforms || []
    const updated = current.includes(platform as any)
      ? current.filter(p => p !== platform)
      : [...current, platform as any]
    setValue('platforms', updated)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="content">Post Content</Label>
        <Textarea
          id="content"
          placeholder="What would you like to share?"
          className="min-h-[120px]"
          {...register('content')}
        />
        {errors.content && (
          <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
        )}
      </div>

      <div>
        <Label>Platforms</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {['facebook', 'instagram', 'twitter', 'linkedin'].map((platform) => (
            <Button
              key={platform}
              type="button"
              variant={platforms?.includes(platform as any) ? "default" : "outline"}
              size="sm"
              onClick={() => togglePlatform(platform)}
              className="capitalize"
            >
              {platform}
            </Button>
          ))}
        </div>
        {errors.platforms && (
          <p className="text-sm text-red-600 mt-1">{errors.platforms.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsScheduling(!isScheduling)}
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          {isScheduling ? 'Post Now' : 'Schedule Post'}
        </Button>

        {isScheduling && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !scheduledAt && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {scheduledAt ? format(scheduledAt, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={scheduledAt}
                onSelect={(date) => setValue('scheduledAt', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          Save Draft
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isScheduling ? 'Schedule Post' : 'Post Now'}
        </Button>
      </div>
    </form>
  )
}