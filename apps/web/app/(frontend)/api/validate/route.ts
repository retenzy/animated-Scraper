import { Review } from '@/models/Review'

export async function POST(req: Request) {
  try {
    const { reviews } = await req.json()

    const validation = Review.validateMany(reviews)
    if (!validation.valid) {
      return Response.json({ valid: false, error: validation.error }, { status: 400 })
    }

    const stats = {
      total: reviews.length,
      withTitle: reviews.filter((r: { title?: string }) => r.title && r.title !== 'N/A').length,
      withDescription: reviews.filter((r: { description?: string }) => r.description && r.description !== 'N/A').length,
      verified: reviews.filter((r: { verified?: string }) => r.verified === 'Yes').length,
      avgRating: (
        reviews.reduce((sum: number, r: { stars?: string }) => {
          const stars = parseFloat(r.stars || '0')
          return sum + (isNaN(stars) ? 0 : stars)
        }, 0) / reviews.length
      ).toFixed(2),
    }

    return Response.json({ valid: true, stats })
  } catch (error) {
    return Response.json({ valid: false, error: (error as Error).message }, { status: 500 })
  }
}
