-- Workflow system tables
CREATE TABLE automation_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(100) NOT NULL,
    trigger_conditions JSONB DEFAULT '{}',
    steps JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT false,
    stats JSONB DEFAULT '{"triggered": 0, "completed": 0}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES email_contacts(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'running',
    current_step INTEGER DEFAULT 0,
    trigger_data JSONB DEFAULT '{}',
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    template_type VARCHAR(100) DEFAULT 'email',
    variables JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing tables
CREATE TABLE billing_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    amount INTEGER,
    currency VARCHAR(3),
    stripe_invoice_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign recipients junction table
CREATE TABLE email_campaign_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES email_contacts(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, contact_id)
);

-- Add push tokens to user profiles
ALTER TABLE user_profiles ADD COLUMN push_token TEXT;

-- Indexes for performance
CREATE INDEX idx_automation_workflows_org_id ON automation_workflows(organization_id);
CREATE INDEX idx_automation_workflows_trigger ON automation_workflows(trigger_type, is_active);
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_email_templates_org_id ON email_templates(organization_id);
CREATE INDEX idx_billing_events_org_id ON billing_events(organization_id);
CREATE INDEX idx_campaign_recipients_campaign ON email_campaign_recipients(campaign_id);

-- RLS Policies
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Workflow policies
CREATE POLICY "Users can manage organization workflows" ON automation_workflows
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can view workflow executions" ON workflow_executions
    FOR SELECT USING (workflow_id IN (
        SELECT id FROM automation_workflows WHERE organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    ));

-- Helper functions
CREATE OR REPLACE FUNCTION increment_workflow_triggered(workflow_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE automation_workflows 
    SET stats = jsonb_set(stats, '{triggered}', 
        COALESCE((stats->>'triggered')::int + 1, 1)::text::jsonb)
    WHERE id = workflow_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_campaign_sent_count(campaign_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE email_campaigns 
    SET sent_count = COALESCE(sent_count, 0) + 1
    WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql;