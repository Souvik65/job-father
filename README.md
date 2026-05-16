# Jobfather | Latest Govt Job Updates & Mock Tests

**Jobfather** is a high-performance, modern job portal built with Next.js 15. It focuses on providing real-time updates for government jobs (TPSC, SSC, Railway, etc.), exam notifications, and mock tests, specifically catering to aspirants in Tripura and beyond.

---

## 🚀 Key Features

-   **Real-time Job Updates:** Instant notifications for TPSC, JRBT, Police, Teaching, and other government sectors.
-   **Advanced Filtering:** Database-level filtering by category and search terms for lightning-fast results.
-   **Private Job Postings:** Users can submit private jobs with integrated payment estimation and moderation workflows.
-   **SEO Optimized:** Full implementation of dynamic sitemaps, robots.txt, and canonical meta-tags for maximum search engine visibility.
-   **Modern UI/UX:** Built with Tailwind CSS v4, featuring glassmorphism, smooth transitions, and a premium "Aspirant Hub" aesthetic.
-   **Social Sharing:** Integrated WhatsApp and social media sharing tools for job listings.
-   **Interactive Timeline:** Detailed exam lifecycle tracking (Notification -> Application -> Exam -> Result).

---

## 🛠️ Tech Stack

-   **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
-   **Database:** [Neon PostgreSQL](https://neon.tech/) (Serverless)
-   **ORM:** [Prisma](https://www.prisma.io/)
-   **Authentication:** [Auth.js (NextAuth v5)](https://authjs.dev/)
-   **Email:** [Resend](https://resend.com/)
-   **Integration:** Google Apps Script for form submission backups.

---

## ⚙️ Getting Started

### 1. Prerequisites
-   Node.js 20.x or later
-   npm, yarn, or pnpm

### 2. Installation
```bash
git clone https://github.com/Souvik65/jobfather-next.git
cd jobfather-next
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add the following:

```env
# Database
DATABASE_URL="your-neon-postgres-url"
DIRECT_URL="your-direct-url"

# Auth
AUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Site Config
NEXT_PUBLIC_SITE_BASE="http://localhost:3000"

# External Integrations
NEXT_PUBLIC_APPS_SCRIPT_URL="your-google-apps-script-url"
NEXT_PUBLIC_AD_URL="your-ad-url"
```

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

---

## 📂 Project Structure

-   `src/app`: Next.js App Router (Pages and API Routes)
-   `src/components`: Reusable UI components
-   `src/lib`: Core utility functions, Prisma client, and business logic
-   `src/config`: Centralized application configuration
-   `src/types`: TypeScript interfaces and shared types
-   `prisma`: Database schema and migrations

---

## 📄 License

This project is licensed under the MIT License.

---

**Jobfather** — *Empowering aspirants with information.*
