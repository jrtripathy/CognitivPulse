import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useSocialPosts() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['social-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          account:social_accounts(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const { data, error } = await supabase
        .from('social_posts')
        .insert(postData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] })
    }
  })

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('social_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] })
    }
  })

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] })
    }
  })

  return {
    posts,
    isLoading: isLoadingPosts,
    createPost: createPostMutation.mutateAsync,
    updatePost: updatePostMutation.mutateAsync,
    deletePost: deletePostMutation.mutateAsync,
    isCreating: createPostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isDeleting: deletePostMutation.isPending
  }
}