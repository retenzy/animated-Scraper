import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Pages } from './collections/Pages'
import { LandingPage } from './globals/LandingPage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    toast: {
      duration: 3000,
    },
    components: {
      graphics: {
        Logo: '@/components/admin/logos#RetenzyLogo',
      },
      beforeNavLinks: ['@/components/admin/nav-dashboard#NavDashboardLink'],
      views: {
        login: {
          Component: '@/components/admin/custom-login-view#CustomLoginView',
        },
        dashboard: {
          Component: '@/components/admin/dashboard-view#DashboardView',
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
      importMapFile: path.resolve(dirname, 'app/(payload)/admin/importMap.ts'),
    },
  },
  collections: [Users, Posts, Pages],
  globals: [LandingPage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: process.env.NODE_ENV !== 'production',
  }),
  routes: {
    api: '/cms-api',
  },
  sharp,
  plugins: [],
})
