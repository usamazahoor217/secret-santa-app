# 🎅 Secret Santa Organizer

> Modern, privacy-first holiday gift exchange web application featuring automated constraint-aware matching, zero spoilers, magic email links via Resend, integrated wishlists, and a local MySQL database powered by Prisma ORM.

---

## 🌟 Key Features

- **Fair & Intelligent Matching:** Backtracking Derangement algorithm mathematically guarantees zero self-matches and satisfies all custom exclusion rules (e.g., couples, spouses, or roommates cannot draw each other).
- **Anti-Spoiler Security:** Assignments are confidential. Even the event organizer cannot see who drew whom, preserving the holiday surprise for everyone.
- **Zero-Friction Participant Experience:** Participants don't need to create an account or download an app. They receive a secure, 1-click magic reveal link via Resend.
- **Interactive Wishlists:** Participants can submit their favorite items, sizes, and dietary/allergy preferences directly on their confidential reveal screen.
- **Subdomain Architecture:**
  - **Root Domain (`secretsanta.io` / `localhost:3000`)**: High-converting marketing landing page with live interactive matching solver.
  - **App Subdomain (`app.secretsanta.io` / `app.localhost:3000`)**: Core SaaS event creation wizard and dashboard.
- **Strict Festive Design System:**
  - **Inter** font family typography.
  - **Strict 15px border radius (`rounded-[15px]`)** across all buttons, inputs, cards, and modal dialogs.
  - 100% mobile-friendly responsive layout.
- **Local MySQL Database via Prisma ORM:**
  - Relational schema with ACID transactions (`prisma.$transaction`).
  - Cascading referential integrity.
  - Built-in database connection verification & health check endpoints.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router & Server Actions) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (Custom 15px radius tokens & Inter typography) |
| **Database & ORM** | [MySQL](https://www.mysql.com/) / [MariaDB](https://mariadb.org/) + [Prisma ORM 7](https://www.prisma.io/) with `@prisma/adapter-mariadb` |
| **Transactional Email** | [Resend](https://resend.com/) + React Email |
| **Monetization** | [Stripe](https://stripe.com/) Checkout & Webhooks |
| **Testing** | [Vitest](https://vitest.dev/) + React Testing Library (34 automated tests) |

---

## 📋 Prerequisites

Before running the project locally, make sure you have:

1. **Node.js**: `v20.19.0` or higher
2. **npm**: `v10+`
3. **Local MySQL Server**: Any running MySQL or MariaDB instance on port 3306 (e.g., XAMPP, MariaDB, Docker, or MySQL Workbench).

---

## 🚀 Quick Start Guide

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/secret-santa-organizer.git
cd secret-santa-organizer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory (you can copy `.env.example`):

```bash
cp .env.example .env
```

Set your configuration values:

```env
# ==============================================================================
# Application URL & Subdomain Configuration
# ==============================================================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_DOMAIN="app.localhost:3000"

# ==============================================================================
# Local MySQL Database Connection via Prisma ORM
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
# (For XAMPP default with no password: mysql://root:@localhost:3306/secretsanta)
# (For MariaDB with password 'root': mysql://root:root@localhost:3306/secretsanta)
# ==============================================================================
DATABASE_URL="mysql://root:root@localhost:3306/secretsanta"

# ==============================================================================
# Resend API Configuration (Transactional Emails)
# ==============================================================================
RESEND_API_KEY="re_mock_test_key_for_development"
RESEND_FROM_EMAIL="Secret Santa <onboarding@resend.dev>"

# ==============================================================================
# Stripe Configuration (Billing & Pro Pass)
# ==============================================================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_mock_stripe_key"
STRIPE_SECRET_KEY="sk_test_mock_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_mock_stripe_webhook_secret"
STRIPE_PREMIUM_EVENT_PRICE_ID="price_mock_holiday_pass"
```

### 4. Initialize Database with Prisma

Ensure your local MySQL / MariaDB server is running on port 3306, then execute:

```bash
npx prisma db push
```

This will automatically create the `secretsanta` database (if it doesn't already exist) and sync all relational tables:
- `users`
- `groups`
- `participants`
- `pair_restrictions`
- `assignments`
- `wishlists`
- `wishlist_items`
- `email_logs`
- `payments`

### 5. Start the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied).

---

## 🌐 Subdomain Routing (Local Testing)

The app leverages Next.js Edge Middleware (`src/middleware.ts`) to dynamically route traffic:

- **Root Domain (`localhost:3000`)**: Renders the high-converting marketing landing page, feature breakdown, live interactive matching engine, pricing, and FAQ.
- **App Subdomain (`app.localhost:3000`)**: Directly rewrites to `/events/new` where organizers create events, configure exclusions, and draw names.

To test the subdomain locally in Windows, you can optionally map `app.localhost` in your hosts file or browse directly to:
- Marketing: `http://localhost:3000/`
- Core App: `http://localhost:3000/events/new`
- Magic Reveal: `http://localhost:3000/reveal/[token]`

---

## 🧪 Running Automated Tests

Run the full Vitest test suite covering the Derangement solver, UI components, database health, and end-to-end user flows:

```bash
npm test
```

To run tests with code coverage:

```bash
npm run test:coverage
```

### Type Checking & Production Build

Verify strict TypeScript compilation:

```bash
npx tsc --noEmit
```

Build the optimized production bundle:

```bash
npm run build
```

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/match` | `POST` | Computes Derangement Secret Santa pairings and saves groups, participants, exclusions & assignments into MySQL. |
| `/api/match?groupId={id}` | `GET` | Fetches confidential match results & assignment statuses for a given group. |
| `/api/groups` | `GET` | Lists all Secret Santa groups with counts. |
| `/api/groups` | `POST` | Creates a new group and dispatches Resend notification emails. |
| `/api/groups/[id]` | `GET` | Retrieves full details for a single group. |
| `/api/groups/[id]` | `DELETE` | Deletes a group and cascades deletion to participants & assignments. |
| `/api/participants` | `GET` | Lists participants (filter by `?groupId={id}`). |
| `/api/participants` | `POST` | Adds a participant to an existing group. |
| `/api/test-db` | `GET` | Connectivity test returning live MySQL database statistics and ping status. |
| `/api/health/db` | `GET` | Health check endpoint reporting database status (`connected` / `offline`). |

---

## 🚀 Production Deployment (Vercel)

1. **Deploy to Vercel:**
   Push your repository to GitHub and import it into [Vercel](https://vercel.com).
2. **Configure Custom Domains in Vercel:**
   - Add your apex domain: `yourdomain.com` (routes to root marketing page).
   - Add your app subdomain: `app.yourdomain.com` (routes to core application).
3. **Set Production Environment Variables:**
   Add `DATABASE_URL` (pointing to your production MySQL instance, e.g., PlanetScale, AWS RDS, or Railway), `RESEND_API_KEY`, and `STRIPE_SECRET_KEY`.

---

## 📄 License

This project is licensed under the MIT License.
