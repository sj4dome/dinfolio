import { isIP } from 'node:net';

const BLOCKED_HOSTS = new Set(['localhost', 'localhost.localdomain', 'metadata.google.internal']);
export function isAllowedPublicUrl(raw) {
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase().replace(/\.$/, '').replace(/^\[|\]$/g, '');
    if (u.protocol !== 'https:' || u.username || u.password || !host || BLOCKED_HOSTS.has(host) || host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.localhost')) return false;
    if (isIP(host)) {
      // Only publicly routable IPv4 addresses may be probed; skip IPv6 literals entirely.
      if (host.includes(':')) return false;
      const [a, b, c] = host.split('.').map(Number);
      if (a === 0 || a === 10 || a === 127 || a >= 224 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168 || a === 100 && b >= 64 && b <= 127 || a === 192 && b === 0 && c === 0 || a === 198 && (b === 18 || b === 19)) return false;
    }
    return true;
  } catch { return false; }
}
export function parseMetadata(html) {
  const meta = (field) => {
    const tags = html.match(/<meta\s+[^>]*>/gi) ?? [];
    for (const tag of tags) {
      const name = tag.match(/(?:name|property)\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
      if (name === field.toLowerCase()) return tag.match(/content\s*=\s*["']([^"']*)["']/i)?.[1] ?? '';
    }
    return '';
  };
  const clean = (s) => s.replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/\s+/g, ' ').trim();
  return {
    title: clean(meta('og:title') || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').slice(0, 120),
    description: clean(meta('og:description') || meta('description')).slice(0, 900),
  };
}
export function classifyStatus(code) {
  if (code >= 200 && code < 400) return 'ok';
  if (code === 404 || code === 410) return 'broken';
  return 'unknown';
}
export function githubDraft(repo) {
  const slug = `github-${repo.owner.login}-${repo.name}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 150);
  const live = isAllowedPublicUrl(repo.homepage || '') ? repo.homepage : null;
  return {
    slug, title: repo.name.replace(/[_-]/g, ' ').slice(0, 120),
    subtitle: 'GitHub Repository · รอตรวจสอบก่อนเผยแพร่',
    description: repo.description?.trim()?.slice(0, 1200) || 'นำเข้าจาก GitHub อัตโนมัติ กรุณาเพิ่มคำอธิบายผลงานก่อนเผยแพร่',
    category: live ? 'website' : 'web-app',
    repo_url: repo.html_url, live_url: live,
    tags: [repo.language, ...(repo.topics ?? [])].filter(Boolean).slice(0, 8),
    year: Number(repo.created_at?.slice(0, 4)) || new Date().getFullYear(),
    featured: false, status: 'draft', source: 'github', needs_enrichment: false, sort_order: 100,
  };
}
