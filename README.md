# Project Index — Digital Project Directory

A responsive project link directory built with React, TypeScript and Vite. This site shows only digital projects, not personal biography, profile, or CV text.

## Features

- Project cards grouped by active categories, search, category filters, per-category counts
- Open the live project in a new tab with `target="_blank"` and `rel="noopener noreferrer"`
- Eight curated starter links, including KH14 Community Intelligence
- Responsive desktop/tablet/mobile layout
- Optional protected `/admin` CRUD dashboard backed by Supabase
- Demo projects load without Supabase; imported project records are used when Supabase is configured
- Cloudflare Pages compatible: build `npm run build`, output `dist`

## Run locally

```sh
npm ci
npm run dev
npm run build
```

For Windows, use the included `BUILD.cmd`, `RUN_DEV.cmd` and `OPEN_WEB.cmd`.

## Deploy

1. Connect repository `sj4dome/dinfolio` to Cloudflare Pages.
2. Set framework preset **Vite**, build command **npm run build**, output directory **dist**.
3. Leave the `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` values unset to use the preconfigured public list of project links.
4. Optional: to enable secure editing, configure Supabase with `supabase/schema.sql`, insert administrator auth UID into `portfolio_admins` and set the two public browser environment variables. Never use a service-role key in frontend variables.

## Update the curated directory

Modify `src/data/demo.ts`. Set the `category`, `title`, `description`, and `live` URL. Only defined active categories are displayed on the public page. External links open a new tab. If the backend is enabled, import starter records via `/admin` or manage records there. The KH14 project is additionally pinned until imported to ensure it appears.

## Public page policy

No personal biography, resume, contacts, or individual author sections appear on the public page. Project detail routes were intentionally removed: the card itself links to the deployed project.
