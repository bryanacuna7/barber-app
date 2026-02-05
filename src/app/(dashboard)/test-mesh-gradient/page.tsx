'use client'

import { MeshGradientBackground } from '@/components/design-system'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function TestMeshGradientPage() {
  const [variant, setVariant] = useState<'subtle' | 'medium' | 'cinematic'>('subtle')
  const [animate, setAnimate] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 relative">
      {/* Component being tested */}
      <MeshGradientBackground variant={variant} animate={animate} />

      {/* Controls */}
      <div className="relative z-10 container mx-auto p-8 space-y-8">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            MeshGradientBackground Test
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Phase 0 - Week 1 - Component Extraction
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Variant</label>
              <div className="flex gap-2">
                <Button
                  variant={variant === 'subtle' ? 'default' : 'outline'}
                  onClick={() => setVariant('subtle')}
                >
                  Subtle (15%)
                </Button>
                <Button
                  variant={variant === 'medium' ? 'default' : 'outline'}
                  onClick={() => setVariant('medium')}
                >
                  Medium (30%)
                </Button>
                <Button
                  variant={variant === 'cinematic' ? 'default' : 'outline'}
                  onClick={() => setVariant('cinematic')}
                >
                  Cinematic (50%)
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Animation</label>
              <div className="flex gap-2">
                <Button variant={animate ? 'default' : 'outline'} onClick={() => setAnimate(true)}>
                  Enabled
                </Button>
                <Button
                  variant={!animate ? 'default' : 'outline'}
                  onClick={() => setAnimate(false)}
                >
                  Disabled
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✅ Component extracted successfully from 7 demos
              <br />
              🎨 Variant: <strong>{variant}</strong> | Animation:{' '}
              <strong>{animate ? 'ON' : 'OFF'}</strong>
            </p>
          </div>
        </div>

        {/* Sample content to show gradient works with content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 border border-zinc-200 dark:border-zinc-800"
            >
              <h3 className="font-semibold mb-2">Sample Card {i}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Content is visible above the gradient background.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
