'use client'

import { useState } from 'react'
import { MeshGradientBackground } from '@/components/design-system'
import {
  GradientHeader,
  PageHeader,
  SectionHeader,
  CompactHeader,
  HeroTitle,
  GradientText,
} from '@/components/design-system'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

type HeaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'giant'
type ElementType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'p' | 'div'

export default function TestGradientHeaderPage() {
  const [selectedSize, setSelectedSize] = useState<HeaderSize>('md')
  const [selectedElement, setSelectedElement] = useState<ElementType>('h1')

  const sizes: HeaderSize[] = ['xs', 'sm', 'md', 'lg', 'xl', 'giant']
  const elements: ElementType[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'p', 'div']

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <MeshGradientBackground variant="subtle" animate />

      <div className="relative z-10 container mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800">
          <GradientHeader size="lg" className="mb-2">
            GradientHeader Test
          </GradientHeader>
          <p className="text-zinc-600 dark:text-zinc-400">
            Testing gradient text header component extracted from 7 winning demos
          </p>
        </div>

        {/* Interactive Controls */}
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800 space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            Interactive Controls
          </h2>

          {/* Size Control */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Size: <span className="text-violet-600">{selectedSize}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <Button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  variant={selectedSize === size ? 'default' : 'outline'}
                  className={
                    selectedSize === size ? 'bg-gradient-to-r from-violet-600 to-purple-600' : ''
                  }
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Element Type Control */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Element: <span className="text-violet-600">{selectedElement}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {elements.map((element) => (
                <Button
                  key={element}
                  onClick={() => setSelectedElement(element)}
                  variant={selectedElement === element ? 'default' : 'outline'}
                  className={
                    selectedElement === element
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600'
                      : ''
                  }
                >
                  {element}
                </Button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div className="mt-8 p-8 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">LIVE PREVIEW:</p>
            <motion.div
              key={`${selectedSize}-${selectedElement}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GradientHeader size={selectedSize} as={selectedElement}>
                Gradient Text Header
              </GradientHeader>
            </motion.div>
          </div>
        </div>

        {/* All Sizes Showcase */}
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800 space-y-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            All Size Variants
          </h2>

          <div className="space-y-6">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                XS (text-sm) - Inline text, tags
              </p>
              <GradientHeader size="xs">Extra Small Header</GradientHeader>
            </div>

            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                SM (text-xl) - Mobile headers, sidebar
              </p>
              <GradientHeader size="sm">Small Header</GradientHeader>
            </div>

            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                MD (text-2xl md:text-3xl) - Default, section headers
              </p>
              <GradientHeader size="md">Medium Header</GradientHeader>
            </div>

            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                LG (text-3xl lg:text-4xl) - Page headers
              </p>
              <GradientHeader size="lg">Large Header</GradientHeader>
            </div>

            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                XL (text-4xl) - Hero headers
              </p>
              <GradientHeader size="xl">Extra Large Header</GradientHeader>
            </div>

            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                GIANT (text-5xl lg:text-6xl xl:text-7xl) - Landing pages
              </p>
              <GradientHeader size="giant">Giant Header</GradientHeader>
            </div>
          </div>
        </div>

        {/* Pre-configured Variants */}
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800 space-y-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            Pre-configured Variants
          </h2>

          <div className="space-y-6">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                {'<PageHeader>'} - h1, lg size (Servicios, Mi Día, Reportes)
              </p>
              <PageHeader>Intelligence Report</PageHeader>
            </div>

            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                {'<SectionHeader>'} - h2, md size (KPI sections, data tables)
              </p>
              <SectionHeader>Performance Metrics</SectionHeader>
            </div>

            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                {'<CompactHeader>'} - h1, sm size (Mobile, sidebar)
              </p>
              <CompactHeader>Mi Día</CompactHeader>
            </div>

            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                {'<HeroTitle>'} - h1, giant size (Landing pages)
              </p>
              <HeroTitle>Configuración</HeroTitle>
            </div>

            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                {'<GradientText>'} - span, xs size (Inline labels, tags)
              </p>
              <p className="text-base text-zinc-700 dark:text-zinc-300">
                This is a sentence with <GradientText>gradient text</GradientText> inline.
              </p>
            </div>
          </div>
        </div>

        {/* Real-world Examples from Demos */}
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800 space-y-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            Real-world Examples (From Winning Demos)
          </h2>

          <div className="space-y-8">
            {/* Servicios Demo D */}
            <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Servicios Demo D (preview-d/page.tsx:192)
              </p>
              <GradientHeader size="lg">Servicios</GradientHeader>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                Gestiona todos tus servicios en un solo lugar
              </p>
            </div>

            {/* Reportes Fusion */}
            <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Reportes Fusion (preview-fusion/page.tsx:123)
              </p>
              <GradientHeader size="lg">Intelligence Report</GradientHeader>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                Business intelligence para tu barbería
              </p>
            </div>

            {/* Configuración Demo A */}
            <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Configuración Demo A (demo-a/page.tsx:96)
              </p>
              <HeroTitle>Configuración</HeroTitle>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                Giant hero title for landing sections
              </p>
            </div>

            {/* Mi Día Demo B (Mobile) */}
            <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Mi Día Demo B Mobile (preview-b/page.tsx:161)
              </p>
              <CompactHeader>Mi Día</CompactHeader>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                Compact header for mobile/sidebar
              </p>
            </div>
          </div>
        </div>

        {/* Component Info */}
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            Component Information
          </h2>

          <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
            <div>
              <span className="font-semibold text-violet-600">Pattern Source:</span>
              <p className="mt-1">Extracted from all 7 winning demo designs (9.3/10 quality)</p>
            </div>

            <div>
              <span className="font-semibold text-violet-600">Gradient Colors:</span>
              <p className="mt-1">from-violet-600 via-purple-600 to-blue-600</p>
            </div>

            <div>
              <span className="font-semibold text-violet-600">Usage:</span>
              <p className="mt-1">Import from @/components/design-system</p>
              <code className="block mt-2 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg font-mono text-xs">
                {`import { GradientHeader, PageHeader, SectionHeader, CompactHeader, HeroTitle, GradientText } from '@/components/design-system'`}
              </code>
            </div>

            <div>
              <span className="font-semibold text-violet-600">Props:</span>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>
                  <code>size</code>: &apos;xs&apos; | &apos;sm&apos; | &apos;md&apos; |
                  &apos;lg&apos; | &apos;xl&apos; | &apos;giant&apos; (default: &apos;md&apos;)
                </li>
                <li>
                  <code>as</code>: &apos;h1&apos; | &apos;h2&apos; | &apos;h3&apos; | &apos;h4&apos;
                  | &apos;h5&apos; | &apos;h6&apos; | &apos;span&apos; | &apos;p&apos; |
                  &apos;div&apos; (default: &apos;h1&apos;)
                </li>
                <li>
                  <code>className</code>: string (optional, for custom overrides)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
