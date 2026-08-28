import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Render } from '@puckeditor/core/rsc'
import Header from '@/components/header'
import Footer from '@/components/footer'
import BlockRenderer from '@/components/blocks/block-renderer'
import { puckConfig } from '@/components/puck/puck.config'
import { getAllPageSlugs, getLandingPage, getPage } from '@/lib/cms'
import type { Page } from '@/payload-types'

export const revalidate = 60
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

function firstBlockIsHero(page: Page): boolean {
  if (page.layoutMode === 'puck') {
    const content = page.puckContent as { root?: { zones?: { content?: { type?: string }[] } } } | null
    return content?.root?.zones?.content?.[0]?.type === 'Hero'
  }
  return page.layout?.[0]?.blockType === 'hero'
}

export async function generateStaticParams() {
  const pages = await getAllPageSlugs()
  return pages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)

  if (!page) {
    return { title: 'Page not found' }
  }

  const title = page.meta?.title || page.title
  const description = page.meta?.description || undefined

  return {
    title,
    description,
    alternates: {
      canonical: `/${page.slug}`,
    },
    openGraph: {
      type: 'website',
      title,
      description,
      images: page.meta?.ogImage ? [page.meta.ogImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: page.meta?.ogImage ? [page.meta.ogImage] : undefined,
    },
  }
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params
  const [page, landing] = await Promise.all([getPage(slug), getLandingPage()])

  if (!page) {
    notFound()
  }

  const needsTopPad = !firstBlockIsHero(page)

  return (
    <>
      <Header navbar={landing?.navbar} />
      <main className={`min-h-screen bg-background ${needsTopPad ? 'pt-24' : ''}`}>
        {page.layoutMode === 'puck' ? (
          <Render config={puckConfig as never} data={(page.puckContent ?? {}) as never} />
        ) : (
          <BlockRenderer blocks={page.layout ?? []} />
        )}
      </main>
      <Footer footer={landing?.footer} />
    </>
  )
}
