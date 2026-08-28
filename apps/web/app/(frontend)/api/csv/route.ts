import { stringify } from 'csv-stringify/sync'
import { Review } from '@/models/Review'

export async function POST(req: Request) {
  try {
    const { reviews, filename } = await req.json()

    const validation = Review.validateMany(reviews)
    if (!validation.valid || reviews.length === 0) {
      return Response.json({ error: validation.error || 'No reviews provided' }, { status: 400 })
    }

    const sanitized = Review.sanitizeMany(reviews)
    const columns = ['name', 'stars', 'title', 'date', 'location', 'description', 'verified', 'helpful']

    const csv = stringify(sanitized, {
      header: true,
      columns,
      cast: {
        string: (value: unknown) => {
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value as string
        },
      },
    })

    const csvWithBom = '\ufeff' + csv

    return new Response(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename || 'amazon-reviews.csv'}"`,
      },
    })
  } catch (error) {
    return Response.json({ error: (error as Error).message || 'Failed to generate CSV' }, { status: 500 })
  }
}
