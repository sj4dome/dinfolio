export const CATEGORIES = [
  { id: 'web-app', name: 'Web Application', th: 'เว็บแอป', number: '01' },
  { id: 'website', name: 'Website', th: 'เว็บไซต์', number: '02' },
  { id: 'landing-page', name: 'Landing Page', th: 'หน้าเว็บโปรโมต', number: '03' },
  { id: 'facebook-page', name: 'Facebook & Content', th: 'เพจและคอนเทนต์', number: '04' },
  { id: 'document', name: 'Documents', th: 'เอกสาร', number: '05' },
  { id: 'cv', name: 'CV & Resume', th: 'ประวัติสมัครงาน', number: '06' },
  { id: 'poster', name: 'Posters & Artwork', th: 'โปสเตอร์และภาพ', number: '07' },
  { id: 'manual', name: 'Guides & Manuals', th: 'คู่มือ', number: '08' },
  { id: 'other', name: 'Other Projects', th: 'ผลงานอื่น ๆ', number: '09' },
] as const;
export type CategoryId = (typeof CATEGORIES)[number]['id'];
export type ProjectStatus = 'published' | 'draft';
export type Project = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: CategoryId;
  cover_url: string | null;
  live_url: string | null;
  asset_url: string | null;
  repo_url: string | null;
  tags: string[];
  problem: string;
  solution: string;
  outcome: string;
  year: number;
  featured: boolean;
  status: ProjectStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
  source?: 'manual' | 'url' | 'github';
  needs_enrichment?: boolean;
  last_checked_at?: string | null;
  link_status?: 'ok' | 'broken' | 'unknown' | 'unchecked';
};
export type ProjectFormData = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export const getCategory = (id: string) => CATEGORIES.find((item) => item.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
export const safeHttpUrl = (raw: string | null | undefined) => {
  if (!raw) return null;
  try { const url = new URL(raw); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
};
export const slugify = (text: string) => text.trim().toLowerCase().normalize('NFKC').replace(/\s+/g, '-').replace(/[^\p{L}\p{N}-]+/gu, '').replace(/-+/g, '-').replace(/^-|-$/g, '') || `work-${Date.now()}`;
