const registrations = new Map<string, string>()

export async function POST(req: Request) {
  try {
    const { userId, extensionId } = await req.json()

    if (!userId || !extensionId) {
      return Response.json({ error: 'userId and extensionId are required' }, { status: 400 })
    }

    registrations.set(userId, extensionId)
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

    const extensionId = registrations.get(userId)
    return Response.json({ extensionId: extensionId || null })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
