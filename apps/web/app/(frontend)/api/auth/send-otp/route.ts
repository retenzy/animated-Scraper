import { generateOtp, storeOtp, sendOtpEmail } from '@/lib/otp'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const otp = generateOtp()
    storeOtp(cleanEmail, otp)

    const sent = await sendOtpEmail(cleanEmail, otp)
    if (!sent && !process.env.SENDGRID_API_KEY) {
      return Response.json({ sent: false, otp })
    }

    return Response.json({ sent: true })
  } catch {
    return Response.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
