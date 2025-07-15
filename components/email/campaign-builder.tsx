'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmailEditor } from './email-editor'
import { ContactSelector } from './contact-selector'
import { useEmailCampaigns } from '@/hooks/use-email-campaigns'

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  subject: z.string().min(1, 'Subject line is required'),
  content: z.string().min(1, 'Email content is required'),
  contactIds: z.array(z.string()).min(1, 'Select at least one contact'),
  scheduledAt: z.date().optional()
})

type CampaignFormData = z.infer<typeof campaignSchema>

export function CampaignBuilder() {
  const [activeTab, setActiveTab] = useState('setup')
  const { createCampaign, isLoading } = useEmailCampaigns()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema)
  })

  const onSubmit = async (data: CampaignFormData) => {
    try {
      await createCampaign(data)
    } catch (error) {
      console.error('Error creating campaign:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TabsContent value="setup" className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                placeholder="My Email Campaign"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                placeholder="Your amazing subject line"
                {...register('subject')}
              />
              {errors.subject && (
                <p className="text-sm text-red-600 mt-1">{errors.subject.message}</p>
              )}
            </div>

            <Button 
              type="button" 
              onClick={() => setActiveTab('design')}
              className="w-full"
            >
              Continue to Design
            </Button>
          </TabsContent>

          <TabsContent value="design">
            <EmailEditor
              content={watch('content')}
              onChange={(content) => setValue('content', content)}
            />
            <div className="flex justify-between mt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setActiveTab('setup')}
              >
                Back
              </Button>
              <Button 
                type="button"
                onClick={() => setActiveTab('recipients')}
              >
                Continue to Recipients
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="recipients">
            <ContactSelector
              selectedIds={watch('contactIds') || []}
              onSelectionChange={(contactIds) => setValue('contactIds', contactIds)}
            />
            <div className="flex justify-between mt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setActiveTab('design')}
              >
                Back
              </Button>
              <Button 
                type="button"
                onClick={() => setActiveTab('review')}
              >
                Review Campaign
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="review">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold">Campaign Summary</h3>
                <p>Name: {watch('name')}</p>
                <p>Subject: {watch('subject')}</p>
                <p>Recipients: {watch('contactIds')?.length || 0} contacts</p>
              </div>

              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setActiveTab('recipients')}
                >
                  Back
                </Button>
                <div className="space-x-2">
                  <Button type="button" variant="outline">
                    Save Draft
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    Send Campaign
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  )
}