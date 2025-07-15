'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

interface EmailEditorProps {
  content: string
  onChange: (content: string) => void
}

export function EmailEditor({ content, onChange }: EmailEditorProps) {
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual')

  const templates = [
    {
      id: 'welcome',
      name: 'Welcome Email',
      content: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #333;">Welcome to our platform!</h1>
          <p>Thank you for joining us. We're excited to have you on board.</p>
          <a href="#" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Get Started</a>
        </div>
      `
    },
    {
      id: 'newsletter',
      name: 'Newsletter',
      content: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #333;">Our Latest News</h1>
          <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
            <h2>Article Title</h2>
            <p>Article preview text goes here...</p>
            <a href="#" style="color: #007bff;">Read more</a>
          </div>
        </div>
      `
    }
  ]

  return (
    <div className="space-y-4">
      <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as any)}>
        <TabsList>
          <TabsTrigger value="visual">Visual Editor</TabsTrigger>
          <TabsTrigger value="html">HTML Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="visual">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <h3 className="font-semibold mb-2">Templates</h3>
              <div className="space-y-2">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => onChange(template.content)}
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="border rounded-lg p-4 min-h-[400px] bg-white">
                <div dangerouslySetInnerHTML={{ __html: content || 'Start designing your email...' }} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="html">
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your HTML content here..."
            className="min-h-[400px] font-mono"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}