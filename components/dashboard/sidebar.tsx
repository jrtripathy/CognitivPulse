'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Calendar,
  Mail,
  Settings,
  Share2,
  FileText,
  Users,
  CreditCard
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Social Media', href: '/dashboard/social-media', icon: Share2 },
  { name: 'Email Marketing', href: '/dashboard/email-marketing', icon: Mail },
  { name: 'Landing Pages', href: '/dashboard/landing-pages', icon: FileText },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: Calendar },
  { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4">
          <h1 className="text-xl font-bold text-[#3B82F6]">CognitivPulse</h1>
        </div>
        <nav className="mt-8 flex-1 space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}