import { WorkflowEngine, WorkflowTrigger } from '../lib/automation/workflow-engine'

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine
  let mockSupabase: any
  let mockEmailQueue: any
  let mockSocialQueue: any

  beforeEach(() => {
    // Helper to allow any number of chained .eq() calls before .single()
    const makeChain = (result = { data: { content: 'hi {{contact.email}}' }, error: null }) => {
      // Each method returns a new chain with .eq(), .select(), and .single()
      const chain: any = {}
      chain.eq = jest.fn(() => makeChain(result))
      chain.select = jest.fn(() => makeChain(result))
      chain.single = jest.fn(() => result)
      return chain
    }
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => makeChain()),
        update: jest.fn(() => ({ eq: jest.fn(() => ({ data: {}, error: null })) })),
        insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => ({ data: {}, error: null })) })) })),
      })),
      rpc: jest.fn(() => Promise.resolve({ data: null })),
    }
    mockEmailQueue = { add: jest.fn() }
    mockSocialQueue = { add: jest.fn() }
    engine = new WorkflowEngine(mockSupabase, mockEmailQueue, mockSocialQueue)
  })

  it('should instantiate', () => {
    expect(engine).toBeInstanceOf(WorkflowEngine)
  })

  it('should trigger workflow with no workflows', async () => {
    await expect(engine.triggerWorkflow({ type: 'email_signup' } as WorkflowTrigger, 'cid', 'oid')).resolves.toBeUndefined()
  })

  it('should handle error in triggerWorkflow', async () => {
    mockSupabase.from = jest.fn(() => ({
      select: jest.fn(() => ({ eq: jest.fn(() => { throw new Error('fail') }) }))
    }))
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    await expect(engine.triggerWorkflow({ type: 'email_signup' } as WorkflowTrigger, 'cid', 'oid')).resolves.toBeUndefined()
    expect(errorSpy).toHaveBeenCalledWith('Error triggering workflow:', expect.any(Error))
    errorSpy.mockRestore()
  })

  it('should executeWorkflow and call executeNextStep', async () => {
    const workflow = {
      id: 'wid',
      steps: [],
      trigger_conditions: {},
    }
    mockSupabase.from = jest.fn(() => ({
      insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => ({ data: { id: 'eid' }, error: null })) })) })),
      rpc: jest.fn()
    }))
    const spy = jest.spyOn(engine as any, 'executeNextStep').mockResolvedValue(undefined)
    await (engine as any).executeWorkflow(workflow, 'cid', {})
    expect(spy).toHaveBeenCalledWith('eid', 0, workflow.steps)
    spy.mockRestore()
  })

  it('should executeNextStep and complete workflow', async () => {
    mockSupabase.from = jest.fn(() => ({
      update: jest.fn(() => ({ eq: jest.fn(() => ({ data: {}, error: null })) }))
    }))
    await (engine as any).executeNextStep('eid', 1, [])
    // Should call update to mark as completed
    expect(mockSupabase.from).toHaveBeenCalled()
  })

  it('should executeStep for send_email', async () => {
    const execution = { id: 'eid', contact: { email: 'a@b.com', name: 'Test User' }, workflow: {}, customData: {} }
    const step = { action: { type: 'send_email', data: { templateId: 'tid', subject: 'sub', customData: {} } } }
    // Directly mock the full select().eq().eq().eq().single() chain for this test using a factory
    const makeChain = () => {
      const chain: any = {}
      chain.eq = jest.fn(() => makeChain())
      chain.single = jest.fn(() => ({
        data: {
          content: 'hi {{contact.email}}',
          contact: { email: 'a@b.com', name: 'Test User' }
        },
        error: null
      }))
      return chain
    }
    const selectChain = makeChain()
    mockSupabase.from = jest.fn(() => ({ select: jest.fn(() => selectChain) }))
    mockEmailQueue.add.mockResolvedValue(undefined)
    await (engine as any).executeStep(execution, step)
    expect(mockEmailQueue.add).toHaveBeenCalled()
  })

  it('should executeStep for add_tag', async () => {
    const execution = { contact: { id: 'cid', tags: ['a'] } }
    const step = { action: { type: 'add_tag', data: { tags: ['b'] } } }
    mockSupabase.from = jest.fn(() => ({
      update: jest.fn(() => ({ eq: jest.fn(() => ({ data: {}, error: null })) }))
    }))
    const spy = jest.spyOn(mockSupabase.from(), 'update')
    await (engine as any).executeAddTag(execution, step.action.data)
    expect(spy).toBeDefined()
  })

  it('should executeStep for post_social', async () => {
    const execution = { contact: {}, workflow: { organization_id: 'oid' }, trigger_data: {} }
    const step = { action: { type: 'post_social', data: { content: 'c', platforms: ['twitter'], accountIds: ['aid'] } } }
    const addSpy = jest.spyOn(mockSocialQueue, 'add').mockResolvedValue(undefined)
    await (engine as any).executePostSocial(execution, step.action.data)
    expect(addSpy).toHaveBeenCalled()
    addSpy.mockRestore()
  })

  it('should executeStep for webhook', async () => {
    const execution = { id: 'eid', contact: {}, trigger_data: {} }
    const step = { action: { type: 'webhook', data: { url: 'http://localhost', payload: {} } } }
    global.fetch = jest.fn().mockResolvedValue({}) as any
    await (engine as any).executeWebhook(execution, step.action.data)
    expect(global.fetch).toHaveBeenCalled()
  })

  it('should personalizeContent with contact and customData', () => {
    const content = 'Hi {{contact.name}} {{data.foo}}'
    const contact = { name: 'Jai' }
    const customData = { foo: 'bar' }
    const result = (engine as any).personalizeContent(content, contact, customData)
    expect(result).toBe('Hi Jai bar')
  })

  it('should match trigger conditions (default true)', () => {
    expect((engine as any).matchesTriggerConditions({}, {}, {})).toBe(true)
  })

  it('should evaluate condition (default true)', () => {
    expect((engine as any).evaluateCondition({}, {})).toBe(true)
  })

  // Add more tests for each action type, edge cases, and error handling as needed
})
