import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import BlogCard from '@/components/blog/blog-card'
import { getLandingPage, getPosts } from '@/lib/cms'

export const revalidate = 60

const POSTS_PER_PAGE = 9

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Guides, tips, and product research strategies from the Retenzy team.',
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const currentPage = Math.max(1, Number(params.page) || 1)

  const [landing, { docs, totalPages }] = await Promise.all([
    getLandingPage(),
    getPosts({ limit: POSTS_PER_PAGE, page: currentPage }),
  ])

  return (
    <>
      <Header navbar={landing?.navbar} />
      <main className="pt-24 pb-20 px-6 min-h-screen bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">The Retenzy Blog</h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Guides, tips, and product research strategies.
            </p>
          </div>

          {docs.length === 0 ? (
            <p className="text-center text-foreground/60 py-20">
              No blog posts yet. Check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {docs.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-16">
              {currentPage > 1 && (
                <Link
                  href={`/blog?page=${currentPage - 1}`}
                  className="px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-card/80 transition"
                >
                  Previous
                </Link>
              )}
              <span className="text-sm text-foreground/60">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={`/blog?page=${currentPage + 1}`}
                  className="px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-card/80 transition"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer footer={landing?.footer} />
    </>
  )
}
