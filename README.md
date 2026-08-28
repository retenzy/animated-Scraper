# Retenzy — Amazon Reviews Extractor

Extract Amazon product reviews via a Chrome extension with a credit-based billing system.

## Structure

```
apps/
├── web/                    Next.js app (landing page + dashboard + API)
│   ├── app/                App Router pages and API routes
│   │   ├── (payload)/      Payload CMS admin + REST API
│   │   ├── blog/           Blog listing and post pages
│   │   ├── dashboard/      Dashboard pages
│   │   └── api/            Application API routes
│   ├── collections/        Payload CMS collections (Users, Posts)
│   ├── components/         React components
│   ├── globals/            Payload CMS globals (Landing Page)
│   ├── lib/                Auth, Prisma, OTP, CMS utilities
│   ├── migrations/         Payload DB migrations (Drizzle)
│   ├── scripts/            CMS seeding scripts
│   └── prisma/             Database schema and migrations
└── chrome-extension/       Manifest V3 Chrome extension
    ├── background.js       Service worker (queue management)
    ├── content.js          DOM scraper
    ├── popup/              Popup UI
    └── website-content.js  Auto-announces extension ID to dashboard
```

## Getting Started

```bash
# Install dependencies
npm install

# Generate Prisma client + Payload types
cd apps/web && npx prisma generate && npx payload generate:types && cd ../..

# Start dev server
npm run dev
```

The app runs at `https://retenzyreviews.com`.

## Environment Variables

Copy `apps/web/.env.example` to `apps/web/.env` and configure:

- `DATABASE_URL` — PostgreSQL connection string (Neon). Used by both Prisma and Payload.
- `PAYLOAD_SECRET` — Long random secret used by Payload to encrypt auth tokens.
- `AUTH_SECRET` — NextAuth secret
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google OAuth (optional)
- `SENDGRID_API_KEY` — Email OTP sending (optional)
- `STRIPE_SECRET_KEY` — Payment processing (optional)
- `CLIENT_URL` — Base URL of the app
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` — Upstash Redis (extension registration lookup)

## Payload CMS

The landing page, SEO metadata, and blog are managed through Payload CMS.

### Admin panel

1. Run the app and visit `/admin`
2. Create the first admin user on the `Create first user` screen
3. Log in — you'll see the **Landing Page** global and the **Blog Posts** collection

### REST API

Payload's REST API is mounted at `/cms-api` (kept separate from the app's own `/api` routes):

- `GET /cms-api/landing-page` — landing page content
- `GET /cms-api/posts` — published blog posts
- `GET /cms-api/posts?where[slug][equals]=my-post` — single post
- `GET /cms-api/users` — admin users

### Seeding default content

The first run seeds the landing page with the original hardcoded copy plus two sample blog posts:

```bash
npm run cms:seed -w apps/web
```

### Database migrations

Payload uses its own Postgres adapter (Drizzle). Its tables live alongside Prisma's in the same database.

```bash
# Apply committed migrations
npm run cms:migrate -w apps/web

# Create a new migration after changing collections/globals
npm run cms:migrate:create -w apps/web
```

In development, Payload auto-pushes schema changes (`push: true`). In production, migrations run during the build.

### Editing content

- **Landing page**: `/admin/globals/landing-page` — edit Navbar, Hero, Features, Statistics, How It Works, Testimonials, FAQ, CTA, Footer, and SEO metadata.
- **Blog posts**: `/admin/collections/posts` — create, edit, and publish posts. Drafts are hidden from the public site; click **Publish** to make a post live.
- **Pages (page builder)**: `/admin/collections/pages` — build full custom pages with two editing modes (switch via the **Layout Mode** field):
  - **Blocks (form)** — stack form-based blocks (Hero, Features, Statistics, How It Works, Testimonials, FAQ, CTA, Rich Text, Image, Spacer).
  - **Visual editor (Puck)** — a drag-and-drop WYSIWYG canvas using the same section components. Both modes can create and update pages; each page has a title, slug (URL path), and SEO settings. A page with slug `about` is served at `/about`. Drafts are hidden until published.

The frontend revalidates every 60 seconds (`revalidate = 60`), so CMS edits appear on the site within a minute.

## Chrome Extension

Load the extension in Chrome:
1. Go to `chrome://extensions`
2. Enable Developer mode
3. Load unpacked → select `apps/chrome-extension`

The extension auto-connects to the dashboard when both are running.
