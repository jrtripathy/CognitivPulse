'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, CreditCard, Download, ExternalLink } from 'lucide-react'
import { PLANS, type PlanId } from '@/lib/stripe/config'
import { useBilling } from '@/hooks/use-billing'
import { formatCurrency } from '@/lib/utils'

export function BillingDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const { subscription, invoices, createCheckoutSession, createPortalSession } = useBilling()

  const currentPlan = subscription?.plan || 'free'

  const handleUpgrade = async (planId: PlanId) => {
    if (planId === 'free') return
    
    setIsLoading(true)
    try {
      const plan = PLANS[planId]
      await createCheckoutSession({
        priceId: plan.stripePriceId!,
        successUrl: `${window.location.origin}/dashboard/billing?success=true`,
        cancelUrl: `${window.location.origin}/dashboard/billing`
      })
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setIsLoading(true)
    try {
      await createPortalSession()
    } catch (error) {
      console.error('Error opening billing portal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Current Plan
            <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
              {subscription?.status || 'Free'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">{PLANS[currentPlan as PlanId].name}</h3>
              <p className="text-muted-foreground">
                {currentPlan === 'free' 
                  ? 'Free forever' 
                  : `$${PLANS[currentPlan as PlanId].price}/month`
                }
              </p>
              {subscription?.currentPeriodEnd && (
                <p className="text-sm text-muted-foreground mt-1">
                  {subscription.status === 'active' ? 'Renews' : 'Expires'} on{' '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            
            {subscription?.status === 'active' && (
              <Button onClick={handleManageBilling} disabled={isLoading}>
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(PLANS).map(([planId, plan]) => (
            <Card 
              key={planId} 
              className={`relative ${currentPlan === planId ? 'ring-2 ring-primary' : ''}`}
            >
              {currentPlan === planId && (
                <Badge className="absolute -top-2 left-4">Current Plan</Badge>
              )}
              
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="text-2xl font-bold">
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  {plan.price > 0 && <span className="text-sm font-normal">/month</span>}
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  variant={currentPlan === planId ? 'outline' : 'default'}
                  disabled={currentPlan === planId || isLoading}
                  onClick={() => handleUpgrade(planId as PlanId)}
                >
                  {currentPlan === planId ? 'Current Plan' : 
                   planId === 'free' ? 'Downgrade' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Invoices */}
      {invoices && invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invoices.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">
                      {formatCurrency(invoice.amount_paid, invoice.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.created * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                      {invoice.status}
                    </Badge>
                    {invoice.invoice_pdf && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}