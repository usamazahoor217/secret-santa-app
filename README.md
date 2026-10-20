# 🎅 Secret Santa Organizer

> Modern, scalable, enterprise-grade holiday gift exchange web application featuring automated constraint-aware matching (Derangement with MCV heuristic), zero spoilers, magic email links via Resend, integrated wishlists, Stripe monetization, and a local MySQL database powered by Prisma ORM.

---

## 🌟 Key Features

- **Fair & Intelligent Matching (MCV Derangement):**
  - Cryptographically secure Fisher-Yates shuffling (`crypto.getRandomValues`).
  - Most Constrained Variable (MCV) backtracking heuristic with forward checking.
  - Scales effortlessly to 10,000+ participants with zero self-matches ($Giver \neq Receiver$) and satisfies complex mutual exclusion constraints (spouses, partners, past-year matches).
- **Anti-Spoiler Security:**
  - Assignments are confidential. Even the event organizer cannot view who drew whom, preserving the holiday surprise for everyone.
  - Constant-time token verification (`timingSafeEqual`) protects invite tokens and magic links from side-channel timing attacks.
- **Strict Input Sanitization & Anti-XSS:**
  - Automated HTML entity escaping and control-character filtering on all titles, descriptions, names, and wishlist inputs via `src/lib/sanitization.ts`.
  - Safe URL verification restricting links to valid `http://` and `https://` protocols.
- **Zero-Friction Participant Experience:**
  - Participants don't need to create an account or download an app. They receive a secure, 1-click magic reveal link via Resend.
- **Interactive Wishlists:**
  - Giftees can submit and update their favorite items, sizes, and preferences.
  - Secret Santas see their assigned recipient's updated wishlist in real time.
- **Organizer Dashboard (`/events/[id]`):**
  - Real-time reveal status progress bar (Viewed vs. Unopened).
  - Email delivery audit logs (Sent, Delivered, Bounced).
  - 1-click invite link copying with anti-spoiler shielding.
- **Webhooks & Integrations:**
  - **Stripe Webhook (`/api/webhooks/stripe`):** Signature-verified checkout processing that automatically upgrades events to Premium Holiday Pass.
  - **Resend Webhook (`/api/webhooks/resend`):** Automatic status synchronization for delivered and bounced emails in MySQL `email_logs`.
- **Strict Festive Design System:**
  - **Inter** font family typography.
  - **Strict 15px border radius (`rounded-[15px]`)** across all buttons, inputs, cards, and modal dialogs.
  - 100% inline SVG icons from `@/components/ui/icons` (zero external icon font libraries).
- **Local MySQL Database via Prisma ORM:**
  - Relational schema with ACID transactions (`prisma.$transaction`).
  - Strict foreign-key cascades and composite indexing for high-performance queries.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Turbopack, Server Actions) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (Custom 15px radius tokens & Inter typography) |
| **Database & ORM** | [MySQL](https://www.mysql.com/) / [MariaDB](https://mariadb.org/) + [Prisma ORM 7](https://www.prisma.io/) with `@prisma/adapter-mariadb` |
| **Transactional Email** | [Resend](https://resend.com/) + React Email |
| **Monetization** | [Stripe](https://stripe.com/) Checkout & Webhooks |
| **Testing** | [Vitest](https://vitest.dev/) + React Testing Library (50+ automated unit & integration tests) |

---

## 📁 Codebase Organization

```
christmas/
├── prisma/
│   └── schema.prisma              # Declarative MySQL schema (9 models, indexed foreign keys)
├── src/
│   ├── middleware.ts              # Edge middleware for subdomain routing (root vs app.)
│   ├── app/
│   │   ├── page.tsx               # Root marketing landing page
│   │   ├── layout.tsx             # Root layout with Inter font and metadata
│   │   ├── actions/
│   │   │   └── event-actions.ts   # Server Actions (event creation, reveal, wishlist)
│   │   ├── api/
│   │   │   ├── groups/            # Group REST endpoints (GET, POST, [id] GET/DELETE)
│   │   │   ├── match/             # Live matching solver endpoint
│   │   │   ├── participants/      # Participant management
│   │   │   ├── health/db/         # Database connectivity health check
│   │   │   ├── test-db/           # Database diagnostic statistics
│   │   │   └── webhooks/
│   │   │       ├── stripe/        # Stripe signature verification & premium upgrades
│   │   │       └── resend/        # Resend email delivery audit logs
│   │   ├── events/
│   │   │   ├── new/page.tsx       # Event creation wizard & exclusion matrix
│   │   │   └── [id]/page.tsx      # Organizer event management & progress dashboard
│   │   └── reveal/
│   │       └── [token]/page.tsx   # Participant confidential reveal & wishlist page
│   ├── components/
│   │   ├── marketing/             # Landing page sections (hero, features, pricing, etc.)
│   │   └── ui/                    # Strict 15px radius UI components & inline SVG icons
│   └── lib/
│       ├── prisma.ts              # Singleton Prisma client with MariaDB driver adapter
│       ├── sanitization.ts        # Input sanitization and anti-XSS utilities
│       ├── algorithms/
│       │   └── derangement.ts     # Constraint-aware Secret Santa MCV derangement engine
│       ├── auth/
│       │   └── password.ts        # scrypt password hashing & constant-time token helpers
│       ├── resend.ts              # Resend email SDK client
│       ├── stripe.ts              # Stripe checkout and customer management
│       └── validations/           # Strict Zod schemas for events and participants
└── tests/
    ├── unit/                      # Derangement, sanitization, password auth, webhooks
    ├── components/                # UI and marketing component tests
    ├── integration/               # Database integration tests
    └── e2e/                       # End-to-end event creation and server action flows
```

---

## 📋 Prerequisites

Before running the project locally, make sure you have:

1. **Node.js**: `v20.19.0` or higher
2. **npm**: `v10+`
3. **Local MySQL Server**: Any running MySQL or MariaDB instance on port 3306 (e.g., MariaDB 13+, MySQL 8+, XAMPP, or Docker).

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/usamazahoor217/secret-santa-app.git
cd christmas
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Application Host
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_DOMAIN="app.localhost:3000"

# Local MySQL Database Connection via Prisma ORM
DATABASE_URL="mysql://root:root@localhost:3306/secretsanta"

# Resend API Configuration (Transactional Emails)
RESEND_API_KEY="re_mock_test_key_for_development"
RESEND_FROM_EMAIL="Secret Santa <onboarding@resend.dev>"

# Stripe Configuration (Billing & Pro Pass)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_mock_stripe_key"
STRIPE_SECRET_KEY="sk_test_mock_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_mock_stripe_webhook_secret"
STRIPE_PREMIUM_EVENT_PRICE_ID="price_mock_holiday_pass"
```

### 3. Initialize Database with Prisma

Ensure your local MySQL server is running on port 3306, then execute:

```bash
npx prisma db push
```

### 4. Start the Development Server

```bash
npm run dev
```

Visit:
- Marketing: `http://localhost:3000/`
- Event Creator: `http://localhost:3000/events/new`
- Event Dashboard: `http://localhost:3000/events/[id]`
- Magic Reveal: `http://localhost:3000/reveal/[token]`

---

## 🧪 Testing Suite

Run the full automated test suite covering algorithms, database transactions, webhooks, security sanitization, and user flows:

```bash
npm test
```

Build the optimized production bundle:

```bash
npm run build
```

---

## 🔒 Security & Privacy Architecture

1. **Anti-Spoiler Isolation:** Assignments are strictly isolated from the organizer UI. Participants can only retrieve their own assignment via their single-use cryptographically unguessable UUID token.
2. **Timing-Attack Resistance:** Token comparisons utilize `crypto.timingSafeEqual` to thwart timing-based side-channel attacks.
3. **Password Security:** Scrypt key derivation (N=16384, r=8, p=1) with 16-byte unique salts for organizer accounts.
4. **Parameterized SQL:** All queries use Prisma ORM prepared statements, guaranteeing protection against SQL injection.
5. **Anti-XSS Sanitization:** All text inputs undergo strict length enforcement and HTML entity encoding before persistence.

---

## 📄 License

This project is licensed under the MIT License.
