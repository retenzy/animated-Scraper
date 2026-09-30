import sgMail from '@sendgrid/mail'

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

interface OtpEntry {
  otp: string
  expiresAt: number
}

const store = new Map<string, OtpEntry>()

const OTP_EXPIRY_MS = 5 * 60 * 1000

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function storeOtp(email: string, otp: string): void {
  cleanup()
  store.set(email.toLowerCase(), { otp, expiresAt: Date.now() + OTP_EXPIRY_MS })
}

export function verifyOtp(email: string, otp: string): boolean {
  cleanup()
  const entry = store.get(email.toLowerCase())
  if (!entry) return false
  if (Date.now() > entry.expiresAt) {
    store.delete(email.toLowerCase())
    return false
  }
  if (entry.otp !== otp) return false
  store.delete(email.toLowerCase())
  return true
}

function cleanup(): void {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.expiresAt) store.delete(key)
  }
}

export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`[OTP] Dev mode — OTP for ${email}: ${otp}`)
    return true
  }

  const fromEmail = process.env.EMAIL_FROM || 'noreply@retenzyreviews.com'

  try {
    await sgMail.send({
      to: email,
      from: { email: fromEmail, name: process.env.EMAIL_FROM_NAME || 'Retenzy' },
      subject: 'Your Retenzy verification code',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #6d28d9;">Retenzy</h2>
          <p style="color: #374151; font-size: 16px;">Your verification code is:</p>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin: 16px 0;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #6d28d9;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code expires in 5 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    })
    return true
  } catch (err) {
    // SendGrid hides the real cause in err.message ("Unauthorized", "Forbidden"),
    // so log the API error list too — an unverified sender is the usual culprit.
    const detail = (err as { response?: { data?: { errors?: { message?: string }[] } } }).response
      ?.data?.errors?.[0]?.message
    console.error(`[OTP] SendGrid error from "${fromEmail}":`, detail || err)
    return false
  }
}
