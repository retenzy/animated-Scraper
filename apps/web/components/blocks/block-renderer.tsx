'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Hero from '@/components/hero'
import Features from '@/components/features'
import Statistics from '@/components/statistics'
import HowItWorks from '@/components/how-it-works'
import Testimonials from '@/components/testimonials'
import Faq from '@/components/faq'
import Cta from '@/components/cta'
import type { Page } from '@/payload-types'

type Block = NonNullable<Page['layout']>[number]

function ImageBlockRender({ block }: { block: Extract<Block, { blockType: 'image' }> }) {
  if (!block.imageUrl) return null
  return (
    <figure className="py-16 px-6">
      <div className="relative aspect-video w-full max-w-4xl mx-auto overflow-hidden rounded-xl border border-border">
        <Image src={block.imageUrl} alt={block.alt || ''} fill className="object-cover" />
      </div>
      {block.caption && (
        <figcaption className="text-center text-sm text-muted-foreground mt-3">{block.caption}</figcaption>
      )}
    </figure>
  )
}

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  const router = useRouter()
  const handleLogin = () => router.push('/')

  return (
    <>
      {blocks.map((block, index) => {
        switch (block.blockType) {
          case 'hero':
            return <Hero key={index} hero={block} onLoginClick={handleLogin} />
          case 'features':
            return <Features key={index} features={block} />
          case 'statistics':
            return <Statistics key={index} statistics={block} />
          case 'how-it-works':
            return <HowItWorks key={index} howItWorks={block} />
          case 'testimonials':
            return <Testimonials key={index} testimonials={block} />
          case 'faq':
            return <Faq key={index} faq={block} />
          case 'cta':
            return <Cta key={index} cta={block} onLoginClick={handleLogin} />
          case 'rich-text':
            return (
              <div
                key={index}
                className="py-16 px-6 max-w-3xl mx-auto prose prose-neutral dark:prose-invert"
              >
                <RichText data={block.content} />
              </div>
            )
          case 'image':
            return <ImageBlockRender key={index} block={block} />
          case 'spacer':
            return <div key={index} style={{ height: block.height ?? 80 }} />
          default:
            return null
        }
      })}
    </>
  )
}
