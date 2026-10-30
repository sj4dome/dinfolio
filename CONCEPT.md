# Project Index — Design & Product Specification

## Objective

A clean directory of live digital projects. The public site is for browsing the work itself, without personal biography, resume, owner details, contact blocks or case-study pages.

## Public site

- Brand: **Project Index** / **Digital Project Directory**
- Header: compact wordmark and two in-page navigation links
- Intro: one concise headline and verified number of published projects
- Categories: show only categories that actually contain projects
- Search: filter projects by title, subtitle, description and tags
- Project list: responsive cards grouped by category; one card = one project link
- Link behavior: whole card opens external URL in a new tab (`noopener noreferrer`)
- No individual detail routes; no About/Contact/Personal sections

## Data and operation

- Seed list in `src/data/demo.ts`, currently 8 live links (including KH14 Community Intelligence)
- If Supabase is not configured, use curated seed list
- If Supabase is configured, load published rows; fallback to seeds if empty
- KH14 is included if it has not yet been imported to Supabase
- Optional secure `/admin` supports updating published projects, categorization and cover images
- Keep private records and secret keys out of public site and client bundles

## Visual design

- Warm off-white background, dark green text and muted amber accents
- Compact editorial typography, generous whitespace, clear category separators
- 3-column desktop, 2-column tablet, 1-column mobile
- Category filter chips with counts; search input; hover / focus treatments
- Distinct abstract color panels by project; user-supplied cover image takes precedence
- Neutral language and descriptions that explain each project's function

## Deployment

- Stack: React + TypeScript + Vite
- Build command: `npm run build`; output: `dist`
- Cloudflare Pages-compatible history fallback (`public/_redirects`)
- GitHub source repository: `sj4dome/dinfolio`
- Supabase optional; set publishable key only for client-side connection
