# Rategate

Rategate helps businesses collect more reviews. A business gets shareable review links and QR codes for itself, each of its locations, and each of its employees. Customers rate their experience. Happy customers (4–5 stars) are pointed to public review platforms such as Google or Yelp, and unhappy customers (1–3 stars) leave private feedback for the business instead.

Production: https://reviews.rategate.cc (`rategate.vercel.app` redirects there).

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19 RC, TypeScript |
| Styling | Tailwind CSS |
| Database | MongoDB via Mongoose |
| Auth | Email/password with JWT cookie; Google via NextAuth; Microsoft via MSAL |
| Payments | Stripe Checkout + subscriptions + webhooks |
| Email | SendGrid (verification and password reset) |
| File storage | Cloudinary (business logos) |
| AI | OpenAI `gpt-3.5-turbo` (suggested review text) |
| Charts | Chart.js (Trends page) |
| Hosting | Vercel |

## Getting started

### Prerequisites

- Node.js 20+
- A MongoDB database
- Stripe, SendGrid, Cloudinary and OpenAI accounts (test/sandbox keys are fine for local work)

### Setup

```bash
npm install
# create .env.local using the environment variables table below
npm run dev
```

Open http://localhost:3000.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint (`next lint`) |

There is no automated test suite yet.

### Environment variables

Put these in `.env.local` (all `.env*` files are gitignored).

| Variable | Used for |
|---|---|
| `DB_URL` | MongoDB connection string |
| `DATABASE_NAME` | MongoDB database name |
| `NEXT_PUBLIC_BASE_URL` | Public app URL, used for links, QR codes and Stripe redirect URLs (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_VERCEL_ENV` | Set by Vercel; non-production environments are marked `noindex` |
| `TOKEN_SECRET` | Secret for signing login JWTs. **Always set this**; the code falls back to an insecure default |
| `NEXT_AUTH_SECRET` | NextAuth secret (Google login) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET` | Microsoft login |
| `SENDGRID_API_KEY`, `SMTP_FROM_EMAIL` | Outgoing email |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Logo uploads |
| `OPENAI_API_KEY` | AI-suggested reviews |
| `STRIPE_PRIVATE_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Verifies Stripe webhook signatures |
| `STRIPE_PRICE_ID_PROFESSIONAL`, `STRIPE_PRICE_ID_ENTERPRISE` | Monthly plan prices |
| `STRIPE_PRICE_ID_LOCATION` | Per-location monthly add-on price |
| `STRIPE_PRICE_ID_EMPLOYEE` | Per-employee monthly add-on price |
| `GOOGLE_ANALYTICS_ID` | Google Analytics |

### Stripe webhooks locally

Locations, employees and plan upgrades are only saved after Stripe confirms payment, so the webhook must be reachable in development:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

Copy the signing secret it prints into `STRIPE_WEBHOOK_SECRET`.

### Plans data

Plans are stored in the MongoDB `plans` collection, not in code. A fresh database needs three plan documents whose `plan_id` values are `basic`, `professional` and `enterprise` (see `utils/planTypes.ts`). Create them with `POST /api/plans` or directly in MongoDB. Each plan has `name`, `description`, `price`, `max_reviews`, `max_locations` and `features`.

## How it works

### Business owner flow

1. **Register / log in** (`/register`, `/login`), then verify the email address.
2. **Onboarding** (`/application/[userId]/...`): name the business, pick the review platforms it uses, answer a short survey. New businesses start on the free Basic plan.
3. **Dashboard**: manage locations and employees, copy review links and QR codes, and set an optional AI "strategy" (a description of the business used to write suggested reviews).
4. **Reviews** and **Trends**: see incoming ratings and feedback, and charts by location, employee and rating.
5. **Billing**: upgrade, change or cancel the plan.

### Customer review flow

Public review links look like this (location and employee are optional):

```
/{businessSlug}/review/{locationSlug}/{employeeSlug}
/{businessSlug}/customer-flow/{locationSlug}/{employeeSlug}
```

1. The customer picks a star rating.
2. **4–5 stars:** they choose a public platform to post on. On `/review` links they also see AI-suggested review text they can copy.
3. **1–3 stars:** they write private feedback and can leave their contact details.
4. If the business has a `review_redirect` URL set, the customer is sent there at the end.

`/customer-flow` is the same flow without the AI-suggested reviews.

### AI-suggested reviews

`POST /api/generate-review` asks OpenAI for 15 short positive reviews based on the business or location strategy and caches them in the `PreWrittenReview` collection (keyed by a hash of the strategy). Customers are shown 5 at a time. `POST /api/prewritten/copy` marks one as used and refreshes the batch once most have been copied.

## Pricing model

| Item | Billing | Configured in |
|---|---|---|
| **Basic** | Free; capped by `max_reviews` and `max_locations` | `plans` collection |
| **Professional** | Monthly Stripe subscription | `plans` collection + `STRIPE_PRICE_ID_PROFESSIONAL` |
| **Enterprise** | Monthly Stripe subscription | `plans` collection + `STRIPE_PRICE_ID_ENTERPRISE` |
| **Each location** | Its own monthly subscription ($10/month per the UI) | `STRIPE_PRICE_ID_LOCATION` |
| **Each employee** | Its own monthly subscription ($5/month per the UI) | `STRIPE_PRICE_ID_EMPLOYEE` |

- Switching plans swaps the price on the existing subscription with no proration.
- Promotion codes are enabled on all Stripe Checkout sessions.
- Downgrading to Basic is blocked while the business has more than one location or any employees.
- Deleting a location or employee cancels its Stripe subscription.

## Project structure

```
app/
  [businessSlug]/review/          Public review flow (with AI suggestions)
  [businessSlug]/customer-flow/   Public review flow (without AI suggestions)
  application/[userId]/...        Logged-in app: onboarding, dashboard, reviews, trends, billing, account
  api/
    (authentication)/             Register, login, logout, email verification, password reset
    (microsoft-login)/            Microsoft OAuth
    auth/[...nextauth]/           Google OAuth (NextAuth)
    (onboarding)/                 Business, survey, onboarding step
    (billing)/                    Plans, checkout, cancel subscription, Stripe webhook
    (review)/                     Submit reviews, contacts, AI review generation, review listings
    (slugs)/                      Look up business/location/employee by slug
    location/, employee/          CRUD (creation goes through Stripe Checkout)
    generate-qr-code/, upload-logo/, users/
  components/                     Shared UI components
constants/                        Onboarding steps, review steps, supported platforms, subscription types
context/                          React context for user, business and review state
lib/db.ts                         MongoDB connection
lib/models/                       Mongoose models
middleware.ts                     Login redirect and API token check
middlewares/apis/authMiddleware.ts JWT validation
migrations/                       One-off data migration scripts
utils/                            Fetch helpers, email templates, plan helpers
public/                           Platform logos and images
```

### Data model

```
User ──1:1── Business ──1:N── Location ──1:N── Employee
                │                 │                │
                └────────────── Review ────────────┘
Business ── Plan
Business ── Survey
Review ── Contact
Business/Location ── PreWrittenReview
```

## Migrations

Scripts in `migrations/` backfill new fields on existing documents. They read `DB_URL` and `DATABASE_NAME` from `.env.local`. Run one with:

```bash
npx ts-node --compiler-options '{"module":"commonjs"}' migrations/addReviewRedirectField.ts
```

## Deployment

The app deploys to Vercel. Work is merged into `staging`, then promoted to `main` through pull requests. Set every environment variable above in the Vercel project, and point a Stripe webhook endpoint at `https://<your-domain>/api/webhook`.
