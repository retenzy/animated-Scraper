import Image from 'next/image'
import Link from 'next/link'
import type { Post } from '@/payload-types'

function formatDate(date?: string | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function BlogCard({ post }: { post: Post }) {
  const date = formatDate(post.publishedDate)

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card hover:bg-card/80 transition"
    >
      {post.coverImage && (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-col gap-3 p-6 flex-grow">
        {date && <p className="text-xs text-muted-foreground">{date}</p>}
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition">
          {post.title}
        </h3>
        {post.excerpt && <p className="text-sm text-foreground/60 line-clamp-3">{post.excerpt}</p>}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto pt-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded-full bg-muted border border-border text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
