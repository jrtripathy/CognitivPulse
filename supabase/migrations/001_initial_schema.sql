-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create custom types
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'running', 'paused', 'completed');
CREATE TYPE email_status AS ENUM ('draft', 'scheduled', 'sent', 'failed');
CREATE TYPE social_platform AS ENUM ('facebook', 'instagram', 'twitter', 'linkedin');

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) DEFAULT 'free',
    subscription_status subscription_status DEFAULT 'active',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social media accounts
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    platform social_platform NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, platform, account_id)
);

-- Social media posts
CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls TEXT[],
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    platform_post_id VARCHAR(255),
    status campaign_status DEFAULT 'draft',
    engagement_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email contacts
CREATE TABLE email_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    subscribed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, email)
);

-- Email campaigns
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    template_data JSONB DEFAULT '{}',
    recipient_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    status email_status DEFAULT 'draft',
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email automations
CREATE TABLE email_automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(100) NOT NULL, -- 'signup', 'purchase', 'tag_added', etc.
    trigger_conditions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email automation steps
CREATE TABLE email_automation_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    automation_id UUID REFERENCES email_automations(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    delay_hours INTEGER DEFAULT 0,
    email_template_id UUID,
    conditions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Landing pages
CREATE TABLE landing_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    meta_description TEXT,
    content JSONB NOT NULL, -- Page builder data
    is_published BOOLEAN DEFAULT false,
    custom_domain VARCHAR(255),
    views_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

-- Analytics events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- 'page_view', 'email_open', 'email_click', etc.
    event_data JSONB DEFAULT '{}',
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API keys for integrations
CREATE TABLE api_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    service VARCHAR(100) NOT NULL, -- 'google_analytics', 'facebook_ads', etc.
    credentials JSONB NOT NULL, -- Encrypted credentials
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, service)
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_org_id ON user_profiles(organization_id);
CREATE INDEX idx_social_posts_org_id ON social_posts(organization_id);
CREATE INDEX idx_social_posts_scheduled ON social_posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_email_contacts_org_id ON email_contacts(organization_id);
CREATE INDEX idx_email_contacts_email ON email_contacts(email);
CREATE INDEX idx_analytics_events_org_id ON analytics_events(organization_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their organization" ON organizations
    FOR ALL USING (id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can manage their profile" ON user_profiles
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Users can manage organization data" ON social_accounts
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    ));

-- Apply similar policies to other tables...