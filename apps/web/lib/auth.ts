import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { verifyOtp } from './otp'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const providers: any[] = [
  Credentials({
    name: 'OTP',
    credentials: {
      email: { label: 'Email', type: 'text' },
      otp: { label: 'OTP', type: 'text' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.otp) return null
      const cleanEmail = (credentials.email as string).trim().toLowerCase()
      const otp = (credentials.otp as string).trim()

      const valid = verifyOtp(cleanEmail, otp)
      if (!valid) return null

      try {
        const user = await prisma.user.upsert({
          where: { username: cleanEmail },
          update: {},
          create: { username: cleanEmail, coins: 5 },
        })
        return {
          id: user.id,
          email: user.username,
          name: user.username.split('@')[0],
          coins: user.coins,
        }
      } catch {
        return null
      }
    },
  }),
]

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: '/',
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      const cleanEmail = user.email.trim().toLowerCase()
      try {
        await prisma.user.upsert({
          where: { username: cleanEmail },
          update: {},
          create: { username: cleanEmail, coins: 5 },
        })
        return true
      } catch {
        return false
      }
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { username: session.user.email.trim().toLowerCase() },
        })
        if (dbUser) {
          ;(session.user as unknown as Record<string, unknown>).id = dbUser.id
          ;(session.user as unknown as Record<string, unknown>).coins = dbUser.coins
        }
      }
      return session
    },
  },
})
