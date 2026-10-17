# 🚀 Production Deployment Guide

This document contains instructions to push this codebase to a new GitHub repository, configure environment variables in Vercel, and sync your Prisma schema to your live MySQL database.

---

## 1. Push to a New Remote GitHub Repository

Execute these terminal commands sequentially from the project root directory:

```bash
# Step 1: Ensure the primary branch is named 'main'
git branch -M main

# Step 2: Add your remote GitHub repository
# Replace YOUR_USERNAME and YOUR_REPO_NAME with your GitHub details
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Step 3: Push all commits and set upstream tracking
git push -u origin main
```

> **Note for SSH Users:**  
> If you have SSH keys configured with GitHub, use:  
> `git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git` in Step 2.

---

## 2. Vercel Dashboard Environment Variables

When importing your project into the [Vercel Dashboard](https://vercel.com), add these variables under **Project Settings ➔ Environment Variables** for **Production** and **Preview**:

| Variable Name | Required | Description & Format |
| :--- | :---: | :--- |
| `DATABASE_URL` | **Yes** | `mysql://USER:PASSWORD@HOST:3306/DATABASE?ssl={"rejectUnauthorized":true}`<br>Connection string for your production MySQL / MariaDB database (e.g., PlanetScale, AWS RDS, Railway, DigitalOcean). |
| `NEXT_PUBLIC_APP_URL` | **Yes** | `https://secretsanta.io`<br>The apex domain hosting the marketing landing page. |
| `NEXT_PUBLIC_APP_DOMAIN` | **Yes** | `app.secretsanta.io`<br>The core app subdomain parsed by Next.js Edge Middleware for routing. |
| `RESEND_API_KEY` | **Yes** | `re_123456789_abcdef...`<br>Live API Key from [Resend Dashboard](https://resend.com/api-keys) to dispatch transactional assignment reveal emails. |
| `RESEND_FROM_EMAIL` | **Yes** | `Secret Santa <noreply@yourdomain.com>`<br>Verified sender domain configured in your Resend account. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | `pk_live_...`<br>Stripe publishable key for client-side checkout sessions. |
| `STRIPE_SECRET_KEY` | Optional | `sk_live_...`<br>Stripe secret key for backend billing and webhooks. |
| `STRIPE_WEBHOOK_SECRET` | Optional | `whsec_...`<br>Webhook signing secret for processing Stripe subscription events. |
| `STRIPE_PREMIUM_EVENT_PRICE_ID` | Optional | `price_...`<br>Stripe Price ID corresponding to the premium Holiday Pass. |

### Vercel Custom Domain Configuration
Under **Project Settings ➔ Domains**, add both domains:
1. `yourdomain.com` (Apex domain ➔ routes to marketing landing page)
2. `app.yourdomain.com` (Subdomain ➔ Next.js Edge Middleware automatically routes to `/events/new`)

---

## 3. Production MySQL Database Schema Sync

Once your live remote MySQL server is provisioned, sync your Prisma schema to generate all 9 relational tables (`users`, `groups`, `participants`, `pair_restrictions`, `assignments`, `wishlists`, `wishlist_items`, `email_logs`, `payments`):

### Windows (PowerShell)
```powershell
$env:DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"; npx prisma db push
```

### macOS / Linux (Bash)
```bash
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE" npx prisma db push
```

### What This Command Does:
- Connects securely to your live MySQL server.
- Automatically creates the target database if it does not yet exist.
- Creates all models with indexes, unique constraints, and foreign key cascades.
- Guarantees complete parity with your local schema without needing manual SQL migration files.

---

## 4. Verification Check

After deploying on Vercel and syncing your database:
1. Navigate to `https://yourdomain.com/api/test-db` to verify live MySQL connectivity.
2. Navigate to `https://yourdomain.com/api/health/db` for structured diagnostic status.
3. Test the interactive matching engine on the marketing page to verify end-to-end saving and reading from your live MySQL database.
