interface ScrapeJob {
  id: string
  productRef: string
  url: string
  status: string
  reviewCount: number
  createdAt: string
}

export default function ScrapeHistory({ scrapes, loading }: { scrapes: ScrapeJob[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (scrapes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No scrapes yet. Install the extension and start extracting!</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-2 text-muted-foreground font-medium">ASIN</th>
            <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden sm:table-cell">Status</th>
            <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden md:table-cell">Reviews</th>
            <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden lg:table-cell">Date</th>
          </tr>
        </thead>
        <tbody>
          {scrapes.map((job) => (
            <tr key={job.id} className="border-b border-border/50 hover:bg-muted/30 transition">
              <td className="py-3 px-2 font-mono text-xs text-foreground">{job.productRef}</td>
              <td className="py-3 px-2 hidden sm:table-cell">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  job.status === 'SUCCESS'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {job.status}
                </span>
              </td>
              <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">{job.reviewCount}</td>
              <td className="py-3 px-2 text-muted-foreground hidden lg:table-cell">
                {new Date(job.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
