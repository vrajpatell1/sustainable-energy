# Sustainable Energy Intelligence Hub

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvrajpatell1%2Fsustainable-energy)

A full-stack sustainable energy website built for your project brief. The platform includes:

- Cloud cost calculation for compute, storage, and data transfer
- Sustainable token analysis for AI workloads
- Cloud platform comparison for real-world scenarios
- Backend APIs for live calculations
- Free-deploy-ready database support with Neon Postgres

## Stack

- Frontend: Next.js + React + custom CSS
- Backend: Next.js API routes
- Database: Neon Postgres in production, in-memory fallback for local dev without a database URL
- Free hosting target: Vercel Hobby + Neon Free

## Local development

```bash
npm install
npm run dev
```

Optional environment variable:

```bash
cp .env.example .env.local
```

If `DATABASE_URL` is not set locally, the app still works and stores recent activity only in memory for that session.

## Production build

```bash
npm run build
npm run start
```

## Free deployment

1. Create a free project on Neon and copy its `DATABASE_URL`.
2. Import this GitHub repo into Vercel:
   `https://github.com/vrajpatell1/sustainable-energy`
3. In Vercel, add `DATABASE_URL` to the project environment variables.
4. Deploy the app.

After that, Vercel gives you a public URL and Neon stores the calculator and token-analysis history for free-tier usage.

## Notes

- `Dockerfile` and `render.yaml` are still in the repo as an optional paid deployment path.
- The recommended free path is Vercel + Neon because it avoids paid persistent disks.
