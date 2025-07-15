'use client'

import { useState, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Trash2, 
  Mail, 
  Share2, 
  Tag, 
  Clock, 
  Webhook,
  GitBranch,
  Play,
  Pause
} from 'lucide-react'

interface WorkflowStep {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'delay'
  actionType?: string
  data: Record<string, any>
  position: { x: number; y: number }
  connections: string[]
}

export function WorkflowBuilder() {
  const [workflow, setWorkflow] = useState({
    name: '',
    description: '',
    isActive: false,
    steps: [] as WorkflowStep[]
  })

  const [selectedStep, setSelectedStep] = useState<string | null>(null)

  const stepTypes = [
    { 
      type: 'send_email', 
      label: 'Send Email', 
      icon: Mail, 
      color: 'bg-blue-500' 
    },
    { 
      type: 'add_tag', 
      label: 'Add Tag', 
      icon: Tag, 
      color: 'bg-green-500' 
    },
    { 
      type: 'post_social', 
      label: 'Social Post', 
      icon: Share2, 
      color: 'bg-purple-500' 
    },
    { 
      type: 'wait', 
      label: 'Wait', 
      icon: Clock, 
      color: 'bg-orange-500' 
    },
    { 
      type: 'condition', 
      label: 'Condition', 
      icon: GitBranch, 
      color: 'bg-yellow-500' 
    },
    { 
      type: 'webhook', 
      label: 'Webhook', 
      icon: Webhook, 
      color: 'bg-red-500' 
    }
  ]

  const addStep = (type: string) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type: 'action',
      actionType: type,
      data: getDefaultStepData(type),
      position: { x: 100, y: workflow.steps.length * 150 + 100 },
      connections: []
    }

    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }))
  }

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }))
  }

  const deleteStep = (stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }))
    setSelectedStep(null)
  }

  const saveWorkflow = async () => {
    // Implementation to save workflow
    console.log('Saving workflow:', workflow)
  }

  const selectedStepData = workflow.steps.find(step => step.id === selectedStep)

  return (
    <div className="h-screen flex">
      {/* Sidebar - Step Library */}
      <div className="w-64 bg-gray-50 p-4 border-r">
        <h3 className="font-semibold mb-4">Workflow Steps</h3>
        <div className="space-y-2">
          {stepTypes.map((stepType) => (
            <Button
              key={stepType.type}
              variant="outline"
              className="w-full justify-start h-auto p-3"
              onClick={() => addStep(stepType.type)}
            >
              <div className={`w-8 h-8 rounded mr-3 flex items-center justify-center ${stepType.color}`}>
                <stepType.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{stepType.label}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-16 bg-white border-b flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Workflow Name"
              value={workflow.name}
              onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
              className="w-64"
            />
            <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
              {workflow.isActive ? 'Active' : 'Draft'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setWorkflow(prev => ({ ...prev, isActive: !prev.isActive }))}
            >
              {workflow.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {workflow.isActive ? 'Pause' : 'Activate'}
            </Button>
            <Button onClick={saveWorkflow}>
              Save Workflow
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-gray-100 overflow-auto">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          {workflow.steps.map((step) => (
            <div
              key={step.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                selectedStep === step.id ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                left: step.position.x,
                top: step.position.y
              }}
              onClick={() => setSelectedStep(step.id)}
            >
              <WorkflowStepNode step={step} onDelete={() => deleteStep(step.id)} />
            </div>
          ))}

          {workflow.steps.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-lg font-medium mb-2">Start Building Your Workflow</div>
                <p>Add steps from the sidebar to create your automation</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Properties Panel */}
      {selectedStepData && (
        <div className="w-80 bg-white border-l p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Step Properties</h3>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteStep(selectedStep!)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <StepPropertiesPanel
            step={selectedStepData}
            onUpdate={(updates) => updateStep(selectedStep!, updates)}
          />
        </div>
      )}
    </div>
  )
}

function WorkflowStepNode({ 
  step, 
  onDelete 
}: { 
  step: WorkflowStep
  onDelete: () => void 
}) {
  const stepType = stepTypes.find(t => t.type === step.actionType)
  
  return (
    <Card className="w-48 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {stepType && (
              <div className={`w-6 h-6 rounded mr-2 flex items-center justify-center ${stepType.color}`}>
                <stepType.icon className="w-3 h-3 text-white" />
              </div>
            )}
            <CardTitle className="text-sm">{stepType?.label || 'Unknown'}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xs text-gray-600">
          {getStepDescription(step)}
        </div>
      </CardContent>
    </Card>
  )
}

function StepPropertiesPanel({ 
  step, 
  onUpdate 
}: { 
  step: WorkflowStep
  onUpdate: (updates: Partial<WorkflowStep>) => void 
}) {
  const updateData = (key: string, value: any) => {
    onUpdate({
      data: {
        ...step.data,
        [key]: value
      }
    })
  }

  switch (step.actionType) {
    case 'send_email':
      return (
        <div className="space-y-4">
          <div>
            <Label>Email Template</Label>
            <Select 
              value={step.data.templateId} 
              onValueChange={(value) => updateData('templateId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome">Welcome Email</SelectItem>
                <SelectItem value="followup">Follow-up Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Subject Line</Label>
            <Input 
              value={step.data.subject || ''} 
              onChange={(e) => updateData('subject', e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div>
            <Label>Delay (hours)</Label>
            <Input 
              type="number"
              value={step.data.delay || 0} 
              onChange={(e) => updateData('delay', parseInt(e.target.value))}
            />
          </div>
        </div>
      )

    case 'add_tag':
      return (
        <div className="space-y-4">
          <div>
            <Label>Tags to Add</Label>
            <Input 
              value={step.data.tags?.join(', ') || ''} 
              onChange={(e) => updateData('tags', e.target.value.split(',').map((t: string) => t.trim()))}
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>
      )

    case 'wait':
      return (
        <div className="space-y-4">
          <div>
            <Label>Wait Duration (hours)</Label>
            <Input 
              type="number"
              value={step.data.duration || 24} 
              onChange={(e) => updateData('duration', parseInt(e.target.value))}
            />
          </div>
        </div>
      )

    default:
      return <div>No properties available for this step type.</div>
  }
}

function getDefaultStepData(type: string): Record<string, any> {
  switch (type) {
    case 'send_email':
      return { templateId: '', subject: '', delay: 0 }
    case 'add_tag':
      return { tags: [] }
    case 'wait':
      return { duration: 24 }
    case 'webhook':
      return { url: '', method: 'POST', headers: {}, payload: {} }
    default:
      return {}
  }
}

function getStepDescription(step: WorkflowStep): string {
  switch (step.actionType) {
    case 'send_email':
      return step.data.subject || 'Send an email'
    case 'add_tag':
      return `Add tags: ${step.data.tags?.join(', ') || 'None'}`
    case 'wait':
      return `Wait ${step.data.duration || 24} hours`
    default:
      return 'Configure this step'
  }
}

const stepTypes = [
  { type: 'send_email', label: 'Send Email', icon: Mail, color: 'bg-blue-500' },
  { type: 'add_tag', label: 'Add Tag', icon: Tag, color: 'bg-green-500' },
  { type: 'post_social', label: 'Social Post', icon: Share2, color: 'bg-purple-500' },
  { type: 'wait', label: 'Wait', icon: Clock, color: 'bg-orange-500' },
  { type: 'condition', label: 'Condition', icon: GitBranch, color: 'bg-yellow-500' },
  { type: 'webhook', label: 'Webhook', icon: Webhook, color: 'bg-red-500' }
]