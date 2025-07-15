marketing-saas/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── campaigns/
│   │   ├── social-media/
│   │   ├── email-marketing/
│   │   ├── landing-pages/
│   │   ├── analytics/
│   │   └── settings/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── campaigns/
│   │   ├── social/
│   │   ├── email/
│   │   ├── webhooks/
│   │   └── analytics/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # Reusable components
│   ├── ui/                       # Shadcn/ui components
│   ├── auth/
│   ├── dashboard/
│   ├── campaigns/
│   ├── forms/
│   └── layout/
├── lib/                          # Utilities and configurations
│   ├── supabase/
│   ├── stripe/
│   ├── validations/
│   ├── utils/
│   └── constants/
├── hooks/                        # Custom React hooks
├── stores/                       # Zustand stores
├── types/                        # TypeScript type definitions
├── public/                       # Static assets
└── supabase/                     # Supabase configuration
    ├── migrations/
    └── seed.sql