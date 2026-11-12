# DINfolio

A compact mobile-first directory, served directly from `index.html`; no build step or database.

## Project registry

Edit `CATEGORIES` and `PROJECTS` in index.html. Website links use `url`; source links use `repo`. A null URL renders a prototype label and a GitHub link rather than inventing a public website. Private repositories still require GitHub access.

Audited 13 November 2026 (Thailand): all 11 repositories accessible through the connected GitHub account; dinfolio is the directory itself. All other 10 repositories are represented.

| Category | Projects |
| --- | --- |
| Community and data | LEUKNUENG, KH14 Community Intelligence, ม้งไทย-Community (HNY-Thailland), จปฐ. 2570 (JPT-QA-2570), จปฐ. ตำบลตับเต่า (JPTTabtao) |
| Business and commerce | DINproperty, TSEVMOV, HMOOB MARKET |
| Travel and events | NORTH CIRCLE, Doi Suthep Vipassana, KHOM Festival |
| Games and simulation | HospitalSIM |
| Tools | Binance Futures Market Radar |
| Other links | Project Link 06 |

Seven missing repository projects were added. HMOOB MARKET and Binance Futures Market Radar have source links only: no verified deployed website was found. The pre-existing Project Link 06 resolves to Google Apps Script; its descriptive name remains unconfirmed. The dead tinyurl.com/m0014 entry was removed at the owner's request after HTTP 404.

Deployment URLs were taken from repository documentation, workflow configuration, existing directory entries, and the connected Netlify project list. Direct HTTP verification succeeded for the travel sites, HospitalSIM and Project Link 06. Cloudflare-hosted links returned 403 from this environment, so their current public availability is not certified.

## Verification

- DOM behavior checks passed: 14 entries, six groups, ten repository links, 12 website links; category filtering, project/repository search, no-results state, reset and selected-filter keyboard focus.
- Outbound links use HTTPS with noopener/noreferrer.
- Mobile-first CSS: one column by default, two at 640px, three at 1000px; 16px body/input text and 44px controls.
- Browser screenshots and measured responsive overflow remain unverified: the installed Chromium fails at startup with socket() Operation not permitted.
- No database or other project's code was changed.
