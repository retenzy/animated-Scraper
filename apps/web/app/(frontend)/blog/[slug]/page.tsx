import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Render } from '@puckeditor/core/rsc'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { getAllPostSlugs, getLandingPage, getPost } from '@/lib/cms'
import { puckConfig } from '@/components/puck/puck.config'

export const revalidate = 60

type Props = {
  params: Promise<{ slug: string }>
}

function formatDate(date?: string | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function generateStaticParams() {
  const posts = await getAllPostSlugs()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return { title: 'Post not found' }
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt || undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, landing] = await Promise.all([getPost(slug), getLandingPage()])

  if (!post) {
    notFound()
  }

  const date = formatDate(post.publishedDate)

  return (
    <>
      <Header navbar={landing?.navbar} />
      <main className="pt-24 pb-20 px-6 min-h-screen bg-background">
        <article className="max-w-3xl mx-auto">
          <header className="mb-10 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.author && <span>{post.author}</span>}
              {post.author && date && <span aria-hidden="true">·</span>}
              {date && <time dateTime={post.publishedDate || undefined}>{date}</time>}
            </div>
          </header>

          {post.coverImage && (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border mb-10">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {post.puckContent ? (
            <div className="max-w-none">
              <Render config={puckConfig as never} data={(post.puckContent ?? {}) as never} />
            </div>
          ) : (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <RichText data={post.content as NonNullable<typeof post.content>} />
            </div>
          )}
        </article>
      </main>
      <Footer footer={landing?.footer} />
    </>
  )
}
