# Retenzy — Amazon Reviews Extractor

Extract Amazon product reviews via a Chrome extension with a credit-based billing system.

## Structure

```
apps/
├── web/                    Next.js app (landing page + dashboard + API)
│   ├── app/                App Router pages and API routes
│   ├── components/         React components
│   ├── lib/                Auth, Prisma, OTP utilities
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

# Generate Prisma client
cd apps/web && npx prisma generate && cd ../..

# Start dev server
npm run dev
```

The app runs at `http://localhost:3000`.

## Environment Variables

Copy `apps/web/.env.example` to `apps/web/.env` and configure:

- `DATABASE_URL` — PostgreSQL connection string (Neon)
- `AUTH_SECRET` — NextAuth secret
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google OAuth (optional)
- `SENDGRID_API_KEY` — Email OTP sending (optional)
- `STRIPE_SECRET_KEY` — Payment processing (optional)

## Chrome Extension

Load the extension in Chrome:
1. Go to `chrome://extensions`
2. Enable Developer mode
3. Load unpacked → select `apps/chrome-extension`

The extension auto-connects to the dashboard when both are running.
