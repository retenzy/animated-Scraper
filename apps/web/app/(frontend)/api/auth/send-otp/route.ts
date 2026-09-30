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
    if (!sent) {
      return Response.json({ error: 'Could not send the verification email. Please try again.' }, { status: 502 })
    }

    return Response.json({ sent: true })
  } catch {
    return Response.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
