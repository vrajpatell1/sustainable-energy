# Sustainable Energy Intelligence Hub

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/vrajpatell1/sustainable-energy)

A full-stack sustainable energy website built for your project brief. The platform includes:

- Cloud cost calculation for compute, storage, and data transfer
- Sustainable token analysis for AI workloads
- Cloud platform comparison for real-world scenarios
- Backend APIs and a SQLite database for saved calculations
- Public-host deployment support with Docker and Render config

## Stack

- Frontend: Next.js + React + custom CSS
- Backend: Next.js API routes
- Database: SQLite with seeded provider and AI efficiency data

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run start
```

## Public hosting

This project includes a `Dockerfile` and `render.yaml`, so you can deploy it on a public host such as Render.

Direct one-click deploy:

- https://render.com/deploy?repo=https://github.com/vrajpatell1/sustainable-energy

Suggested deployment flow:

1. Push this folder to a Git repository.
2. Create a new Render Web Service from that repository.
3. Let Render detect `render.yaml`.
4. Deploy the service and open the generated public URL.

If you want, the next step after the build passes is for me to help you publish it on a hosting platform account.
