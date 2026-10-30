/**
 * Portfolio automation (Node 22+, no npm dependencies).
 * GitHub Actions schedule or workflow_dispatch -> Supabase REST API.
 * Never expose SUPABASE_SECRET_KEY in Vite/browser or logs.
 */
import { isAllowedPublicUrl, parseMetadata, classifyStatus, githubDraft } from './automation-core.mjs';

const { SUPABASE_URL, SUPABASE_SECRET_KEY, PORTFOLIO_GITHUB_USERNAME, GH_SYNC_TOKEN } = process.env;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SECRET_KEY in server environment');
  process.exit(1);
}
if (!/^https:\/\//.test(SUPABASE_URL)) throw Error('SUPABASE_URL must be https');
const BASE = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/`;

async function db(path, method = 'GET', body) {
  const res = await fetch(new URL(path, BASE), {
    method,
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw Error(`Supabase REST ${method} failed (${res.status}): ${(await res.text()).slice(0, 160)}`);
  if (res.status === 204) return [];
  const content = await res.text();
  return content ? JSON.parse(content) : [];
}

async function readAllProjects() {
  const result = [];
  for (let offset = 0; offset < 20_000; offset += 500) {
    const rows = await db(`projects?select=id,slug,repo_url,live_url,title,description,source,needs_enrichment,last_checked_at&order=created_at.asc&limit=500&offset=${offset}`);
    result.push(...rows);
    if (rows.length < 500) break;
  }
  return result;
}
async function fetchPublic(raw, method = 'HEAD') {
  if (!isAllowedPublicUrl(raw)) throw new Error('Only public HTTPS hosts can be checked');
  let next = raw;
  for (let count = 0; count <= 4; count++) {
    if (!isAllowedPublicUrl(next)) throw new Error('Redirect target blocked');
    const res = await fetch(next, {
      method,
      redirect: 'manual',
      headers: { 'User-Agent': 'DINPortfolio-LinkMonitor/1.0 (+public-portfolio)', Accept: method === 'GET' ? 'text/html' : '*/*' },
      signal: AbortSignal.timeout(11000),
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      const url = new URL(res.headers.get('location'), next);
      if (!isAllowedPublicUrl(url.href)) throw new Error('Unsafe redirect blocked');
      next = url.href;
      await res.body?.cancel();
      continue;
    }
    return res;
  }
  throw new Error('Too many redirects');
}
async function getMetadata(url) {
  const r = await fetchPublic(url, 'GET');
  if (!r.ok || !r.headers.get('content-type')?.toLowerCase().includes('html')) {
    await r.body?.cancel();
    return null;
  }
  const declared = Number(r.headers.get('content-length') || '0');
  if (declared > 3_000_000) { await r.body?.cancel(); return null; }
  const reader = r.body?.getReader();
  if (!reader) return null;
  const chunks = []; let bytes = 0;
  try {
    while (bytes < 250_000) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value); bytes += value.byteLength;
    }
  } finally { await reader.cancel().catch(() => {}); }
  const decoded = new TextDecoder().decode(Buffer.concat(chunks));
  return parseMetadata(decoded);
}
async function checkLink(url) {
  if (!isAllowedPublicUrl(url)) return 'unknown';
  try {
    let res = await fetchPublic(url, 'HEAD');
    const code = res.status;
    await res.body?.cancel();
    if ([403,405,501].includes(code)) {
      res = await fetchPublic(url, 'GET');
      const fallback = classifyStatus(res.status);
      await res.body?.cancel();
      return fallback;
    }
    return classifyStatus(code);
  } catch { return 'unknown'; }
}
async function scanGitHub(all) {
  const username = PORTFOLIO_GITHUB_USERNAME?.trim();
  if (!username) { console.log('GitHub discovery skipped: configure PORTFOLIO_GITHUB_USERNAME'); return 0; }
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) throw Error('Invalid GitHub username');
  let created = 0;
  const known = new Set(all.map(x => x.repo_url?.replace(/\/$/, '').toLowerCase()).filter(Boolean));
  for (let page = 1; page <= 5; page++) {
    const response = await fetch(`https://api.github.com/users/${username}/repos?type=owner&sort=updated&per_page=100&page=${page}`, {
      headers: { 'User-Agent': 'DINPortfolio-AutoImport', Accept: 'application/vnd.github+json', ...(GH_SYNC_TOKEN ? { Authorization: `Bearer ${GH_SYNC_TOKEN}` } : {}) },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw Error(`GitHub API failed (${response.status}). Public rate limits may apply.`);
    const repos = await response.json();
    for (const r of repos) {
      if (r.private || r.fork || r.archived || r.disabled || r.name?.toLowerCase() === 'din-portfolio') continue;
      if (known.has(r.html_url.toLowerCase())) continue;
      const row = githubDraft(r);
      // Ignore duplicate slug; never overwrite descriptions or admin publication settings.
      await db('projects?on_conflict=slug', 'POST', row);
      known.add(r.html_url.toLowerCase());
      created++;
    }
    if (repos.length < 100) break;
  }
  console.log(`GitHub: ${created} new draft(s) imported`);
  return created;
}

const all = await readAllProjects();
console.log(`Portfolio sync: ${all.length} existing project(s)`);
let enriched = 0; let checked = 0; let unknown = 0;
for (const project of all) {
  if (!project.live_url) continue;
  const status = await checkLink(project.live_url);
  await db(`projects?id=eq.${encodeURIComponent(project.id)}`, 'PATCH', {link_status: status, last_checked_at: new Date().toISOString()});
  checked++;
  if (status === 'unknown') unknown++;
  if (project.source === 'url' && project.needs_enrichment && status === 'ok') {
    try {
      const meta = await getMetadata(project.live_url);
      if (meta?.title) {
        await db(`projects?id=eq.${encodeURIComponent(project.id)}`, 'PATCH', {
          title: meta.title, description: meta.description || project.description, needs_enrichment: false,
        });
        enriched++;
      }
    } catch { /* Keep pending, try again next day */ }
  }
}
const imported = await scanGitHub(all);
console.log(`Done: links checked=${checked}, uncertain=${unknown}, enriched=${enriched}, new GitHub drafts=${imported}`);
