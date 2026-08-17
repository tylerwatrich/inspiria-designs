# Inspiria Designs

The website and content platform for Inspiria Designs, a web design/development studio. Built on Next.js 15 (App Router) and Payload CMS 3.0, with Postgres (Neon) as the database and Cloudflare R2 / Vercel Blob for media storage.

## What's in here

- **Marketing site** — layout-builder driven pages, blog/article content, FAQs, category and lead-capture forms, SEO (structured metadata, sitemap, redirects), and site search.
- **Autonomous content pipeline** — a set of scheduled jobs (`src/app/api/cron/*`) that scan for news relevant to the site's verticals, surface article suggestions for review, and draft/publish posts using LLM-assisted research and writing, with images generated and attached automatically. Pipeline behavior (on/off per stage, auto-publish vs. draft) is controlled from an admin settings panel rather than hardcoded.
- **Analytics & lead tracking** — first-party page view, visit, and event tracking, plus search-query logging and a lead capture flow, all stored in Postgres rather than a third-party analytics vendor.
- **Admin panel** — Payload's admin UI, with access control scoped per collection/global (public read on published content, authenticated-only for everything internal or write-capable).

## Stack

- [Next.js 15](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- [Payload CMS 3](https://payloadcms.com/) on [Postgres](https://www.postgresql.org/) (hosted on [Neon](https://neon.tech/))
- Cloudflare R2 / Vercel Blob for media storage
- Deployed on [Vercel](https://vercel.com/)

## Local development

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env` and fill in a Postgres connection string plus any AI-provider keys the content pipeline needs. The admin panel is available at `/admin` — the first run prompts you to create an admin user.

```bash
pnpm build      # production build
pnpm generate:types   # regenerate Payload's TypeScript types after a schema change
```

## Notes

This repository is shared for code review purposes. It is not licensed for reuse.
