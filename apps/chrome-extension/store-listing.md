# Chrome Web Store Listing — Retenzy: Amazon Review Exporter

## 1. Basic listing info

| Field | Value |
|---|---|
| **Item name** | Retenzy Amazon Review Exporter |
| **Short description** (≤132 chars) | Extract Amazon product reviews locally and export them as CSV — with star, verified, and keyword filters. |
| **Category** | Productivity |
| **Language** | English (United States) |
| **Website** | https://retenzyreviews.com |
| **Privacy policy URL** | https://retenzyreviews.com/privacy |
| **Small promotional image** | `store/small-promo.png` (440×280) |
| **Marquee promotional tile** | `store/marquee-promo.png` (1400×560) |
| **Store icon (128×128)** | `icons/icon128.png` |

## 2. Detailed description

Extract Amazon product reviews in minutes with Retenzy — a fast, local-first Chrome extension for sellers, researchers, and agencies.

### How it works
- Open any Amazon product page or paste one or more ASINs/URLs in the popup.
- The extension loads the reviews page, scrolls through "Load more", and collects reviews across all star ratings.
- Reviews are saved locally in your browser (IndexedDB) — they never leave your machine unless you export them.
- Export a CSV per product, or review results in the popup grouped by product.

### Built-in filters
- Minimum star rating (e.g. 4★ and above)
- Verified purchases only
- Minimum helpful votes
- Date range (last 30/90 days, 6 months, year)
- Include / exclude keywords

### Key features
- Multi-product queue with automatic cooldown between products
- Detects and pauses on Amazon sign-in / CAPTCHA screens
- Credit-based billing with a web dashboard (buy credits, view history)
- One-click CSV export — one file per product
- Works across Amazon marketplaces (US, UK, DE, IN, FR, IT, ES, CA, JP, AU, BR, MX, SG, AE, SA)

> Reviews are extracted locally and never uploaded. Only your account, the ASIN, job status, and review count are synced to your dashboard for history.

## 3. Screenshots (required)

Take 2–5 screenshots at **1280×800** or **640×400** (PNG/JPG, ≤2 MB). Suggested shots:
1. Extension popup with the filter panel open
2. Results list grouped by product after a run
3. The Buy Credits page (dashboard)
4. Dashboard with scrape history
5. Export in progress

## 4. Permissions — justification (for the review notes)

| Permission | Why it's needed |
|---|---|
| `host_permissions` (amazon.*) | Required to inject the scraper and run extraction on Amazon review pages |
| `scripting` | Injects `content.js` into the review page to parse reviews |
| `activeTab` | Reads/uses the currently active Amazon tab when the user clicks Extract |
| `tabs` | Opens background tabs per product, tracks load state, closes them on stop |
| `storage` | Persists queue state, filters, user session, and local review metadata |
| `externally_connectable` (our dashboard) | Lets the web dashboard sync your account + credits to the extension |

## 5. Privacy / data-safety disclosures

Select these in the Chrome Web Store Developer Dashboard (Privacy tab):

- **Single purpose:** Yes — extract and export Amazon product reviews.
- **Data collection:** Reviews are stored locally; the extension transmits only account identifier, ASIN/URL, job status, review count, and extension ID.
- **Handled user data:** Authentication info (email via OAuth), personal communications (n/a), no health/financial/location data collected by the extension.
- **Security practices:** Data transmitted over HTTPS; no encryption requirement exemption (transmission uses TLS).
- **Remote code:** The extension does not execute remote code — all logic is bundled.

## 6. Submission checklist

- [x] Rebuild the zip with `npm run zip` (from `apps/chrome-extension`) — produces `chrome-extension-v1.0.0.zip`
- [ ] Developer account fee ($5 one-time) at chrome.google.com/webstore/devconsole
- [ ] Upload `chrome-extension-v1.0.0.zip`
- [ ] Fill listing fields from this doc
- [ ] Upload screenshots + promo images (`store/`)
- [ ] Add privacy policy URL (`/privacy` — deploy the web app first)
- [ ] Set single-purpose + data-safety disclosures
- [ ] Submit for review (typically 1–5 business days)

## 7. Before you submit

1. Deploy the web app so `/privacy` is live.
2. Update `BACKEND_URL` default in `background.js` if the production URL ever changes.
3. Verify the extension works against the deployed backend (`https://retenzyreviews.com`).
