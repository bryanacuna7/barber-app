/**
 * Real-time Hooks Test Page
 *
 * Visual verification of WebSocket subscriptions.
 * Tests all 3 real-time hooks with live status indicators.
 *
 * Created: Session 113 (Phase 0 Week 3)
 */

'use client'

import { useState, useEffect } from 'react'
import { useRealtimeAppointments } from '@/hooks/use-realtime-appointments'
import { useRealtimeClients } from '@/hooks/use-realtime-clients'
import { useRealtimeSubscriptions } from '@/hooks/use-realtime-subscriptions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Mock business ID - replace with real one from auth
const MOCK_BUSINESS_ID = '00000000-0000-0000-0000-000000000001'

export default function TestRealtimePage() {
  const [appointmentsEnabled, setAppointmentsEnabled] = useState(true)
  const [clientsEnabled, setClientsEnabled] = useState(true)
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true)

  const [logs, setLogs] = useState<string[]>([])
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('unknown')

  // Add console intercept to show logs in UI
  useEffect(() => {
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn

    console.log = (...args) => {
      originalLog(...args)
      const message = args
        .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
        .join(' ')
      if (message.includes('Realtime') || message.includes('📡') || message.includes('🔌')) {
        setLogs((prev) => [...prev.slice(-19), `${new Date().toLocaleTimeString()} ${message}`])
      }
    }

    console.error = (...args) => {
      originalError(...args)
      const message = args
        .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
        .join(' ')
      setLogs((prev) => [...prev.slice(-19), `${new Date().toLocaleTimeString()} ❌ ${message}`])
    }

    console.warn = (...args) => {
      originalWarn(...args)
      const message = args
        .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
        .join(' ')
      setLogs((prev) => [...prev.slice(-19), `${new Date().toLocaleTimeString()} ⚠️ ${message}`])
    }

    return () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  // Initialize real-time hooks
  useRealtimeAppointments({
    businessId: MOCK_BUSINESS_ID,
    enabled: appointmentsEnabled,
  })

  useRealtimeClients({
    businessId: MOCK_BUSINESS_ID,
    enabled: clientsEnabled,
  })

  useRealtimeSubscriptions({
    businessId: MOCK_BUSINESS_ID,
    enabled: subscriptionsEnabled,
    onStatusChange: (status) => {
      setSubscriptionStatus(status)
      setLogs((prev) => [
        ...prev.slice(-19),
        `${new Date().toLocaleTimeString()} 🔔 Subscription status changed to: ${status}`,
      ])
    },
  })

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Real-time Hooks Test</h1>
        <p className="text-muted-foreground">
          WebSocket subscriptions with React Query cache invalidation
        </p>
      </div>

      {/* Connection Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Appointments */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Appointments</h3>
              <Badge variant={appointmentsEnabled ? 'default' : 'secondary'}>
                {appointmentsEnabled ? 'Active' : 'Disabled'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              High-frequency updates for calendar and Mi Día
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAppointmentsEnabled(!appointmentsEnabled)}
              className="w-full"
            >
              {appointmentsEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </Card>

        {/* Clients */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Clients</h3>
              <Badge variant={clientsEnabled ? 'default' : 'secondary'}>
                {clientsEnabled ? 'Active' : 'Disabled'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">New bookings from public page</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClientsEnabled(!clientsEnabled)}
              className="w-full"
            >
              {clientsEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </Card>

        {/* Subscriptions */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Subscriptions</h3>
              <Badge variant={subscriptionsEnabled ? 'default' : 'secondary'}>
                {subscriptionsEnabled ? 'Active' : 'Disabled'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Feature gating: {subscriptionStatus}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubscriptionsEnabled(!subscriptionsEnabled)}
              className="w-full"
            >
              {subscriptionsEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Live Logs */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Live Console Logs</h3>
            <Button variant="outline" size="sm" onClick={() => setLogs([])}>
              Clear
            </Button>
          </div>
          <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
            <div className="font-mono text-xs space-y-1">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">Waiting for events...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-foreground/80">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Testing Instructions */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2">How to Test</h3>
        <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
          <li>Open Supabase Dashboard → SQL Editor</li>
          <li>
            Run:{' '}
            <code className="bg-black/10 dark:bg-white/10 px-1 rounded">
              UPDATE appointments SET status = &apos;confirmed&apos; WHERE id = &apos;some-id&apos;;
            </code>
          </li>
          <li>Watch logs for &quot;📡 Appointment change detected&quot; message</li>
          <li>Try toggling subscriptions on/off to see reconnection behavior</li>
          <li>Expected: WebSocket connects → 3 reconnect attempts → Polling fallback</li>
        </ol>
      </Card>
    </div>
  )
}
