/// <reference types="node" />
// lib/config.ts
// Centralized config and env validation for CognitivPulse


// If using TypeScript, ensure @types/node is installed for process/env types
// npm i --save-dev @types/node
let assert: (value: any, message?: string) => void
try {
  // Prefer built-in assert if available
  assert = require('assert')
} catch {
  // Fallback for environments without assert
  assert = (value, message) => { if (!value) throw new Error(message) }
}


export const ENV = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  REDIS_URL: process.env.REDIS_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
}

export function validateEnv() {
  Object.entries(ENV).forEach(([key, value]) => {
    assert(value, `Missing required environment variable: ${key}`)
  })
}

// Call this at app/server startup
validateEnv()
