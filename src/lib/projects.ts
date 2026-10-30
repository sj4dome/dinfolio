import { demoProjects } from '../data/demo';
import { isSupabaseReady, supabase } from './supabase';
import type { Project, ProjectFormData } from '../types';

const safeUrlForImport = (input: string) => {
  const value = input.trim();
  const target = new URL(value);
  if (target.protocol !== 'https:' || !target.hostname || target.username || target.password) throw new Error('ใช้เฉพาะลิงก์ https:// ที่เข้าถึงได้สาธารณะ');
  return target.href;
};

export const projectsRepository = {
  async listPublic(): Promise<Project[]> {
    if (!isSupabaseReady || !supabase) return demoProjects.filter(p => p.status === 'published');
    const { data, error } = await supabase.from('projects').select('*').eq('status', 'published').order('featured', { ascending: false }).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    if (error) throw error;
    const published = (data ?? []) as Project[];
    if (!published.length) return demoProjects.filter(p => p.status === 'published');
    // Always include the requested KH14 project until it is imported into the database.
    const kh14 = demoProjects.find(p => p.slug === 'kh14-community');
    if (kh14 && !published.some(p => p.slug === kh14.slug || p.live_url === kh14.live_url)) published.push(kh14);
    return published;
  },
  async listAdmin(): Promise<Project[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('projects').select('*').order('featured', { ascending: false }).order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Project[];
  },
  async save(form: ProjectFormData, id?: string) {
    if (!supabase) throw new Error('กรุณาเชื่อม Supabase');
    const payload = { ...form, cover_url: form.cover_url || null, live_url: form.live_url || null, asset_url: form.asset_url || null, repo_url: form.repo_url || null };
    const req = id ? supabase.from('projects').update(payload).eq('id', id) : supabase.from('projects').insert(payload);
    const { error } = await req;
    if (error) throw error;
  },
  async remove(id: string) {
    if (!supabase) throw new Error('กรุณาเชื่อม Supabase');
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  },
  async importStarter() {
    if (!supabase) throw new Error('กรุณาเชื่อม Supabase');
    const { data, error } = await supabase.from('projects').select('slug');
    if (error) throw error;
    const existing = new Set((data ?? []).map(item => item.slug));
    const entries = demoProjects.filter(p => !existing.has(p.slug)).map(({ id: _id, created_at: _created, updated_at: _updated, ...p }) => p);
    if (!entries.length) return 0;
    const inserted = await supabase.from('projects').insert(entries);
    if (inserted.error) throw inserted.error;
    return entries.length;
  },
  async quickAddUrl(input: string): Promise<void> {
    if (!supabase) throw new Error('กรุณาเชื่อม Supabase');
    const url = safeUrlForImport(input);
    const host = new URL(url).hostname.replace(/^www\./, '');
    const slug = `url-${host.replace(/[^a-z0-9]+/g, '-')}-${crypto.randomUUID().slice(0, 8)}`.slice(0, 150);
    const existing = await supabase.from('projects').select('id').eq('live_url', url).limit(1);
    if (existing.error) throw existing.error;
    if (existing.data?.length) throw new Error('ลิงก์นี้มีอยู่แล้วใน Portfolio');
    const { error } = await supabase.from('projects').insert({
      slug, title: host, subtitle: 'นำเข้าจากเว็บไซต์',
      description: 'ระบบกำลังรอดึงชื่อและคำอธิบายจากเว็บไซต์โดยอัตโนมัติ',
      category: 'website', live_url: url, source: 'url', needs_enrichment: true,
      status: 'draft', tags: [], featured: false, sort_order: 100,
    });
    if (error) throw error;
  },
  async upload(file: File, kind: 'cover' | 'attachment'): Promise<string> {
    if (!supabase) throw new Error('กรุณาเชื่อม Supabase');
    if (kind === 'cover' && (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) || file.size > 8 * 1024 * 1024)) throw new Error('ภาพต้องเป็น JPG/PNG/WEBP/AVIF และไม่เกิน 8 MB');
    if (kind === 'attachment' && (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 15 * 1024 * 1024)) throw new Error('ไฟล์แนบต้องเป็น PDF/JPG/PNG/WEBP และไม่เกิน 15 MB');
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const path = `${kind === 'cover' ? 'covers' : 'attachments'}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('portfolio-public').upload(path, file, { cacheControl: '3600', contentType: file.type, upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('portfolio-public').getPublicUrl(path);
    return data.publicUrl;
  },
};
