export async function GET() {
  const providers = ['credentials']
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push('google')
  }
  return Response.json({ providers })
}
