import Link from 'next/link'
import config from '@payload-config'
import { getPayload } from 'payload'

type DocRow = {
  id: number | string
  title?: string
  slug?: string
  _status?: string
  updatedAt?: string
}

function fmtDate(value?: string): string {
  if (!value) return ''
  try {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function StatusPill({ status }: { status?: string }) {
  return <span className={`rz-pill ${status ?? ''}`}>{status ?? 'draft'}</span>
}

function RecentPanel({
  title,
  viewAll,
  rows,
  basePath,
  emptyText,
}: {
  title: string
  viewAll: string
  rows: DocRow[]
  basePath: string
  emptyText: string
}) {
  return (
    <section className="rz-panel">
      <div className="rz-panel-head">
        <h2 className="rz-panel-title">{title}</h2>
        <Link className="rz-panel-link" href={viewAll}>
          View all →
        </Link>
      </div>
      {rows.length === 0 ? (
        <div className="rz-empty">{emptyText}</div>
      ) : (
        rows.map((doc) => (
          <Link key={doc.id} className="rz-row rz-row-link" href={`${basePath}/${doc.id}`}>
            <div className="rz-row-main">
              <div className="rz-row-title">{doc.title || doc.slug || `#${doc.id}`}</div>
              <div className="rz-row-meta">
                {doc.slug ? `/${doc.slug} · ` : ''}
                Updated {fmtDate(doc.updatedAt)}
              </div>
            </div>
            <StatusPill status={doc._status} />
          </Link>
        ))
      )}
    </section>
  )
}

const DashboardView = async () => {
  const payload = await getPayload({ config })

  const [pages, posts, users, recentPages, recentPosts] = await Promise.all([
    payload.count({ collection: 'pages' }),
    payload.count({ collection: 'posts' }),
    payload.count({ collection: 'users' }),
    payload.find({
      collection: 'pages',
      limit: 5,
      sort: '-updatedAt',
      depth: 0,
    }),
    payload.find({
      collection: 'posts',
      limit: 5,
      sort: '-updatedAt',
      depth: 0,
    }),
  ])

  const publishedPages = await payload.count({ collection: 'pages', where: { _status: { equals: 'published' } } })

  return (
    <div className="rz-dash">
      <style>{`
        .rz-dash .rz-stat-icon svg{width:20px;height:20px}
      `}</style>

      <h1>Dashboard</h1>
      <p className="rz-dash-sub">Overview of your content and site activity.</p>

      {/* Statistics */}
      <div className="rz-dash-grid">
        <div className="rz-stat">
          <div className="rz-stat-icon blue">📄</div>
          <div>
            <div className="rz-stat-num">{pages.totalDocs}</div>
            <div className="rz-stat-label">Total pages</div>
          </div>
        </div>
        <div className="rz-stat">
          <div className="rz-stat-icon green">✅</div>
          <div>
            <div className="rz-stat-num">{publishedPages.totalDocs}</div>
            <div className="rz-stat-label">Published pages</div>
          </div>
        </div>
        <div className="rz-stat">
          <div className="rz-stat-icon orange">📝</div>
          <div>
            <div className="rz-stat-num">{posts.totalDocs}</div>
            <div className="rz-stat-label">Blog posts</div>
          </div>
        </div>
        <div className="rz-stat">
          <div className="rz-stat-icon blue">👥</div>
          <div>
            <div className="rz-stat-num">{users.totalDocs}</div>
            <div className="rz-stat-label">Users</div>
          </div>
        </div>
      </div>

      {/* Recent content */}
      <RecentPanel
        title="Recent pages"
        viewAll="/admin/collections/pages"
        basePath="/admin/collections/pages"
        rows={recentPages.docs as DocRow[]}
        emptyText="No pages yet — create your first page."
      />
      <RecentPanel
        title="Recent blog posts"
        viewAll="/admin/collections/posts"
        basePath="/admin/collections/posts"
        rows={recentPosts.docs as DocRow[]}
        emptyText="No posts yet — write your first article."
      />

      {/* Quick actions */}
      <div className="rz-dash-grid">
        <Link className="rz-stat" href="/admin/collections/pages/create">
          <div className="rz-stat-icon blue">＋</div>
          <div>
            <div className="rz-stat-num" style={{ fontSize: 15 }}>
              New page
            </div>
            <div className="rz-stat-label">Create a page</div>
          </div>
        </Link>
        <Link className="rz-stat" href="/admin/collections/posts/create">
          <div className="rz-stat-icon orange">＋</div>
          <div>
            <div className="rz-stat-num" style={{ fontSize: 15 }}>
              New post
            </div>
            <div className="rz-stat-label">Write an article</div>
          </div>
        </Link>
        <Link className="rz-stat" href="/">
          <div className="rz-stat-icon green">↗</div>
          <div>
            <div className="rz-stat-num" style={{ fontSize: 15 }}>
              View site
            </div>
            <div className="rz-stat-label">Open the public site</div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default DashboardView
export { DashboardView }
