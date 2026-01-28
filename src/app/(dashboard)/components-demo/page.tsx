'use client'

import { useState } from 'react'
import { Mail, User, Lock, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react'
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
  Spinner,
  ProgressBar,
  EmptyState,
  EmptyAppointments,
  Skeleton,
  SkeletonCard,
  StaggerContainer,
  StaggerItem,
  useToast,
} from '@/components/ui'

export default function ComponentsDemoPage() {
  const [progress, setProgress] = useState(45)
  const { success, error, warning, info } = useToast()

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-16">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
          Premium Components
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Phase 2.5 - Custom components with microinteractions & animations
        </p>
      </div>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Buttons
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="gradient">Gradient</Button>
          <Button variant="success">Success</Button>
          <Button variant="primary" isLoading>
            Loading
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>

        <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mt-6">
          Sizes
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Inputs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <Input
            label="Default Input"
            placeholder="Enter your name..."
            helperText="This is a helper text"
          />
          <Input
            label="Email with Icon"
            type="email"
            placeholder="name@example.com"
            leftIcon={<Mail className="w-5 h-5" />}
          />
          <Input
            label="Password Toggle"
            type="password"
            placeholder="Enter password"
            leftIcon={<Lock className="w-5 h-5" />}
          />
          <Input
            label="Error State"
            placeholder="Invalid input"
            error="This field is required"
            leftIcon={<User className="w-5 h-5" />}
          />
          <Input
            label="Success State"
            placeholder="Valid input"
            success="Looks good!"
            defaultValue="john@example.com"
          />
          <Input
            label="Disabled"
            placeholder="Disabled input"
            disabled
            defaultValue="Cannot edit"
          />
        </div>

        <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mt-6">
          Variants
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <Input variant="default" placeholder="Default variant" />
          <Input variant="filled" placeholder="Filled variant" />
          <Input variant="outline" placeholder="Outline variant" />
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Cards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="default" hoverable>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>With hover effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                This is a default card with hoverable effect.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" clickable>
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Clickable variant</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                This card has elevated shadows and click effect.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient">
            <CardHeader>
              <CardTitle>Gradient Card</CardTitle>
              <CardDescription>Blue to purple</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Beautiful gradient background.
              </p>
            </CardContent>
          </Card>

          <Card variant="bordered" hoverable>
            <CardHeader>
              <CardTitle>Bordered Card</CardTitle>
              <CardDescription>With border</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Clean bordered style.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Glass Card</CardTitle>
              <CardDescription>Glassmorphism effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Frosted glass with blur.
              </p>
            </CardContent>
          </Card>
        </div>

        <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mt-6">
          Stat Cards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-blue-500" />}
            label="Total Revenue"
            value="₡850,000"
            trend={{ value: 12, isPositive: true }}
            description="vs last month"
          />
          <StatCard
            icon={<Users className="w-6 h-6 text-purple-500" />}
            label="Active Clients"
            value="342"
            trend={{ value: 8, isPositive: true }}
            description="new this week"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6 text-emerald-500" />}
            label="Appointments"
            value="124"
            trend={{ value: 3, isPositive: false }}
            description="today"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-amber-500" />}
            label="Avg. Ticket"
            value="₡12,500"
            trend={{ value: 5, isPositive: true }}
            description="this month"
          />
        </div>
      </section>

      {/* Spinners */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Loading States
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-2 text-center">
            <Spinner variant="default" size="lg" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Default</p>
          </div>
          <div className="space-y-2 text-center">
            <Spinner variant="dots" size="lg" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Dots</p>
          </div>
          <div className="space-y-2 text-center">
            <Spinner variant="pulse" size="lg" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Pulse</p>
          </div>
          <div className="space-y-2 text-center">
            <Spinner variant="bars" size="lg" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Bars</p>
          </div>
        </div>

        <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mt-6">
          Progress Bar
        </h3>
        <div className="max-w-2xl space-y-4">
          <ProgressBar value={progress} showLabel />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>
              -10%
            </Button>
            <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>
              +10%
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setProgress(0)}>
              Reset
            </Button>
          </div>
        </div>
      </section>

      {/* Toasts */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Toasts
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Click the buttons to see animated toasts (swipe to dismiss)
        </p>
        <div className="flex flex-wrap gap-4">
          <Button variant="success" onClick={() => success('Operation completed successfully!')}>
            Success Toast
          </Button>
          <Button variant="danger" onClick={() => error('Something went wrong!')}>
            Error Toast
          </Button>
          <Button variant="gradient" onClick={() => warning('Please review your input')}>
            Warning Toast
          </Button>
          <Button variant="secondary" onClick={() => info('New features available')}>
            Info Toast
          </Button>
        </div>
      </section>

      {/* Empty States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Empty States
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-4">
              Illustrated
            </h3>
            <EmptyAppointments onCreateNew={() => info('Create appointment clicked')} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-4">
              Default
            </h3>
            <EmptyState
              variant="default"
              icon={Users}
              title="No data found"
              description="Try adjusting your filters or create new records."
              action={
                <Button variant="primary" size="sm">
                  Create New
                </Button>
              }
            />
          </div>
        </div>
      </section>

      {/* Skeletons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Skeleton Loaders
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
              Card Skeleton
            </h3>
            <SkeletonCard />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
              List Skeleton
            </h3>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-10 w-1/2" />
          </div>
        </div>
      </section>

      {/* Stagger Animation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Stagger Animations
        </h2>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <StaggerItem key={i}>
              <Card variant="bordered">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-zinc-900 dark:text-white">
                    Item {i}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                    Animated with stagger effect
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>
    </div>
  )
}
