export class Review {
  name: string
  stars: string
  title: string
  date: string
  description: string
  verified: string
  helpful: string

  constructor(data: Record<string, unknown>) {
    this.name = (data.name as string) || 'N/A'
    this.stars = (data.stars as string) || 'N/A'
    this.title = (data.title as string) || 'N/A'
    this.date = (data.date as string) || 'N/A'
    this.description = (data.description as string) || 'N/A'
    this.verified = (data.verified as string) || 'No'
    this.helpful = (data.helpful as string) || '0'
  }

  static sanitizeMany(reviewsArray: Record<string, unknown>[]) {
    if (!Array.isArray(reviewsArray)) return []
    return reviewsArray.map((r) => new Review(r))
  }

  static validateMany(reviewsArray: unknown[]) {
    if (!Array.isArray(reviewsArray)) {
      return { valid: false, error: 'Reviews must be an array' }
    }
    return { valid: true }
  }
}
