import { createAdminClient } from '@/lib/supabase/client'
import { emailQueue } from '@/lib/queue/email-queue'
import { socialQueue } from '@/lib/queue/social-queue'

export interface WorkflowTrigger {
  type: 'email_signup' | 'page_visit' | 'email_open' | 'email_click' | 'tag_added' | 'purchase' | 'form_submit'
  conditions: Record<string, any>
}

export interface WorkflowAction {
  type: 'send_email' | 'add_tag' | 'post_social' | 'wait' | 'condition' | 'webhook'
  data: Record<string, any>
  delay?: number // in hours
}

export interface WorkflowStep {
  id: string
  action: WorkflowAction
  nextSteps: string[]
  conditions?: Record<string, any>
}

export interface Workflow {
  id: string
  organizationId: string
  name: string
  description: string
  trigger: WorkflowTrigger
  steps: WorkflowStep[]
  isActive: boolean
  stats: {
    triggered: number
    completed: number
    conversionRate: number
  }
}

export class WorkflowEngine {
  private supabase: any
  private emailQueue: any
  private socialQueue: any

  constructor(
    supabase?: any,
    emailQueue?: any,
    socialQueue?: any
  ) {
    this.supabase = supabase || createAdminClient()
    this.emailQueue = emailQueue || emailQueue
    this.socialQueue = socialQueue || socialQueue
  }

  async triggerWorkflow(
    trigger: WorkflowTrigger,
    contactId: string,
    organizationId: string,
    data?: Record<string, any>
  ) {
    try {
      // Find matching workflows
      const { data: workflows, error } = await this.supabase
        .from('automation_workflows')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('trigger_type', trigger.type)
        .eq('is_active', true)

      if (error) throw error

      for (const workflow of workflows) {
        if (this.matchesTriggerConditions(trigger, workflow.trigger_conditions, data)) {
          await this.executeWorkflow(workflow, contactId, data)
        }
      }
    } catch (error) {
      console.error('Error triggering workflow:', error)
    }
  }

  private async executeWorkflow(
    workflow: any,
    contactId: string,
    triggerData?: Record<string, any>
  ) {
    try {
      // Create workflow execution record
      const { data: execution, error } = await this.supabase
        .from('workflow_executions')
        .insert({
          workflow_id: workflow.id,
          contact_id: contactId,
          status: 'running',
          trigger_data: triggerData || {},
          current_step: 0
        })
        .select()
        .single()

      if (error) throw error

      // Start executing steps
      await this.executeNextStep(execution.id, 0, workflow.steps)

      // Update workflow stats
      await this.supabase.rpc('increment_workflow_triggered', {
        workflow_id: workflow.id
      })

    } catch (error) {
      console.error('Error executing workflow:', error)
    }
  }

  private async executeNextStep(
    executionId: string,
    stepIndex: number,
    steps: WorkflowStep[]
  ) {
    if (stepIndex >= steps.length) {
      // Workflow completed
      await this.supabase
        .from('workflow_executions')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', executionId)
      return
    }

    const step = steps[stepIndex]
    
    try {
      await this.executeStep(executionId, step)
      
      // Update current step
      await this.supabase
        .from('workflow_executions')
        .update({ current_step: stepIndex + 1 })
        .eq('id', executionId)

      // Schedule next step if there's a delay
      if (step.action.delay && step.action.delay > 0) {
        setTimeout(() => {
          this.executeNextStep(executionId, stepIndex + 1, steps)
        }, step.action.delay * 60 * 60 * 1000) // Convert hours to milliseconds
      } else {
        await this.executeNextStep(executionId, stepIndex + 1, steps)
      }

    } catch (error) {
      console.error(`Error executing step ${stepIndex}:`, error)
      
      // Mark execution as failed
      await this.supabase
        .from('workflow_executions')
        .update({ 
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', executionId)
    }
  }

  private async executeStep(executionId: string, step: WorkflowStep) {
    const { data: execution } = await this.supabase
      .from('workflow_executions')
      .select(`
        *,
        contact:email_contacts(*),
        workflow:automation_workflows(*)
      `)
      .eq('id', executionId)
      .single()

    if (!execution) throw new Error('Execution not found')

    switch (step.action.type) {
      case 'send_email':
        await this.executeSendEmail(execution, step.action.data)
        break
        
      case 'add_tag':
        await this.executeAddTag(execution, step.action.data)
        break
        
      case 'post_social':
        await this.executePostSocial(execution, step.action.data)
        break
        
      case 'webhook':
        await this.executeWebhook(execution, step.action.data)
        break
        
      case 'condition':
        // Handle conditional logic
        return this.evaluateCondition(execution, step.action.data)
        
      default:
        console.warn(`Unknown step action type: ${step.action.type}`)
    }
  }

  private async executeSendEmail(execution: any, actionData: any) {
    const { templateId, subject, customData } = actionData
    
    // Get email template
    const { data: template } = await this.supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (!template) throw new Error('Email template not found')

    // Personalize content
    const personalizedContent = this.personalizeContent(
      template.content,
      execution.contact,
      customData
    )

    // Add to email queue
    await this.emailQueue.add('send-automation-email', {
      to: execution.contact.email,
      subject: this.personalizeContent(subject, execution.contact, customData),
      html: personalizedContent,
      workflowExecutionId: execution.id
    })
  }

  private async executeAddTag(execution: any, actionData: any) {
    const { tags } = actionData
    
    const currentTags = execution.contact.tags || []
    const newTags = [...new Set([...currentTags, ...tags])]
    
    await this.supabase
      .from('email_contacts')
      .update({ tags: newTags })
      .eq('id', execution.contact.id)
  }

  private async executePostSocial(execution: any, actionData: any) {
    const { content, platforms, accountIds } = actionData
    
    const personalizedContent = this.personalizeContent(
      content,
      execution.contact,
      execution.trigger_data
    )

    await this.socialQueue.add('post-automation', {
      content: personalizedContent,
      platforms,
      accountIds,
      organizationId: execution.workflow.organization_id
    })
  }

  private async executeWebhook(execution: any, actionData: any) {
    const { url, method = 'POST', headers = {}, payload } = actionData
    
    const webhookPayload = {
      ...payload,
      contact: execution.contact,
      triggerData: execution.trigger_data,
      executionId: execution.id
    }

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(webhookPayload)
    })
  }

  private personalizeContent(
    content: string,
    contact: any,
    customData?: Record<string, any>
  ): string {
    let personalized = content
    
    // Replace contact fields
    personalized = personalized.replace(/\{\{contact\.(\w+)\}\}/g, (match, field) => {
      return contact[field] || match
    })
    
    // Replace custom data
    if (customData) {
      personalized = personalized.replace(/\{\{data\.(\w+)\}\}/g, (match, field) => {
        return customData[field] || match
      })
    }
    
    return personalized
  }

  private matchesTriggerConditions(
    trigger: WorkflowTrigger,
    conditions: Record<string, any>,
    data?: Record<string, any>
  ): boolean {
    // Simple condition matching - extend as needed
    if (!conditions || Object.keys(conditions).length === 0) return true
    
    // Add your condition logic here
    return true
  }

  private evaluateCondition(execution: any, conditionData: any): boolean {
    // Implement condition evaluation logic
    return true
  }
}

export const workflowEngine = new WorkflowEngine()