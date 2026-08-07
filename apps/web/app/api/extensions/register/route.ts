import { redis } from '@/lib/redis'

const REGISTRATION_TTL_SECONDS = 7 * 24 * 60 * 60

const fallback = new Map<string, string>()

function keyFor(userId: string) {
  return `extension:register:${userId}`
}

export async function POST(req: Request) {
  try {
    const { userId, extensionId } = await req.json()

    if (!userId || !extensionId) {
      return Response.json({ error: 'userId and extensionId are required' }, { status: 400 })
    }

    if (redis) {
      await redis.set(keyFor(userId), extensionId, { ex: REGISTRATION_TTL_SECONDS })
    } else {
      fallback.set(userId, extensionId)
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return Response.json({ error: 'userId query parameter is required' }, { status: 400 })
    }

    let extensionId: string | null = null
    if (redis) {
      extensionId = await redis.get<string>(keyFor(userId))
    } else {
      extensionId = fallback.get(userId) || null
    }

    return Response.json({ extensionId })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
