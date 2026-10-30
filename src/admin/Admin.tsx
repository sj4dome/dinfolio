import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Check, Eye, EyeOff, FileUp, FolderPlus, ImageUp, LockKeyhole, LogOut, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { CATEGORIES, safeHttpUrl, slugify, type Project, type ProjectFormData } from '../types';
import { isSupabaseReady, supabase } from '../lib/supabase';
import { projectsRepository } from '../lib/projects';

const fresh = (): ProjectFormData => ({ slug: '', title: '', subtitle: '', description: '', category: 'web-app', cover_url: null, live_url: null, asset_url: null, repo_url: null, tags: [], problem: '', solution: '', outcome: '', year: new Date().getFullYear(), featured: false, status: 'draft', sort_order: 100 });

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [show, setShow] = useState(false); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    const { error } = await supabase!.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setError('เข้าสู่ระบบไม่สำเร็จ: ' + error.message); else onLogin();
    setBusy(false);
  }
  return <div className="admin-login-wrap"><div className="admin-login"><div className="admin-logo">INDEX<span>.</span></div><div className="admin-login-icon"><LockKeyhole size={23}/></div><span className="section-kicker">PRIVATE WORKSPACE</span><h1>เข้าสู่ระบบ<br/>จัดการผลงาน</h1><p>สำหรับผู้ดูแลระบบ เท่านั้น</p><form onSubmit={submit} className="admin-login-form"><label>อีเมลผู้ดูแล<input type="email" required autoComplete="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)}/></label><label>รหัสผ่าน<div className="password-wrap"><input type={show ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}/><button type="button" onClick={() => setShow(v => !v)} aria-label="แสดงหรือซ่อนรหัสผ่าน">{show ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>{error ? <p className="admin-error" role="alert">{error}</p> : null}<button type="submit" disabled={busy} className="button button-dark button-full">{busy ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'} <ArrowUpRight size={17}/></button></form><Link to="/" className="admin-return"><ArrowLeft size={16}/> กลับสู่รายการโปรเจกต์</Link></div></div>;
}

function AdminForm({ initial, onClose, onSaved }: { initial: Project | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState<ProjectFormData>(initial ? { slug: initial.slug, title: initial.title, subtitle: initial.subtitle, description: initial.description, category: initial.category, cover_url: initial.cover_url, live_url: initial.live_url, asset_url: initial.asset_url, repo_url: initial.repo_url, tags: initial.tags, problem: initial.problem, solution: initial.solution, outcome: initial.outcome, year: initial.year, featured: initial.featured, status: initial.status, sort_order: initial.sort_order } : fresh());
  const [tagsText, setTagsText] = useState(initial?.tags.join(', ') ?? '');
  const [saving, setSaving] = useState(false); const [upload, setUpload] = useState<'cover' | 'attachment' | null>(null); const [error, setError] = useState('');
  const update = <K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) => setForm(p => ({ ...p, [key]: value }));
  async function save(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    const current = { ...form, slug: slugify(form.slug || form.title), title: form.title.trim(), description: form.description.trim(), tags: tagsText.split(',').map(s => s.trim()).filter(Boolean), year: Number(form.year), sort_order: Number(form.sort_order) };
    for (const key of ['live_url','asset_url','cover_url','repo_url'] as const) { if (current[key] && !safeHttpUrl(current[key])) { setError(`กรุณากรอก ${key} เป็น URL https:// หรือ http://`); setSaving(false); return; } }
    try { await projectsRepository.save(current, initial?.id); await onSaved(); onClose(); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setSaving(false); }
  }
  async function uploadFile(kind: 'cover' | 'attachment', file?: File) {
    if (!file) return; setUpload(kind); setError('');
    try { const url = await projectsRepository.upload(file, kind); update(kind === 'cover' ? 'cover_url' : 'asset_url', url); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setUpload(null); }
  }
  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title"><div className="admin-modal-head"><div><span className="section-kicker">PROJECT EDITOR</span><h2 id="editor-title">{initial ? 'แก้ไขผลงาน' : 'เพิ่มผลงานใหม่'}</h2></div><button className="admin-icon-btn" type="button" onClick={onClose} aria-label="ปิด"><X size={21}/></button></div><form className="admin-edit-form" onSubmit={save}><div className="admin-form-grid"><label>ชื่อผลงาน <span>*</span><input required maxLength={120} value={form.title} onChange={e => { update('title', e.target.value); if (!initial && !form.slug) setForm(p => ({ ...p, title: e.target.value, slug: slugify(e.target.value) })); }} placeholder="เช่น My New Web App"/></label><label>ชื่อรอง / Tagline<input maxLength={160} value={form.subtitle} onChange={e => update('subtitle', e.target.value)} placeholder="คำอธิบายสั้น ๆ"/></label><label>Slug (URL) <span>*</span><input required maxLength={150} value={form.slug} onChange={e => update('slug', e.target.value)} placeholder="my-project"/></label><label>หมวดหมู่ <span>*</span><select value={form.category} onChange={e => update('category', e.target.value as Project['category'])}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name} — {c.th}</option>)}</select></label><label className="wide">คำอธิบายผลงาน <span>*</span><textarea required rows={3} value={form.description} onChange={e => update('description', e.target.value)} placeholder="โปรเจกต์นี้คืออะไร เหมาะกับใคร ทำอะไรได้บ้าง"/></label><label className="wide">Tags (คั่นด้วยเครื่องหมาย ,)<input value={tagsText} onChange={e => setTagsText(e.target.value)} placeholder="React, TypeScript, Web Design"/></label><label>ลิงก์เว็บไซต์ (เปิดแท็บใหม่)<input type="url" value={form.live_url ?? ''} onChange={e => update('live_url', e.target.value || null)} placeholder="https://..."/></label><label>ลิงก์ไฟล์แนบ (PDF / ภาพ)<input type="url" value={form.asset_url ?? ''} onChange={e => update('asset_url', e.target.value || null)} placeholder="https://..."/></label><label>URL รูปปก<input type="url" value={form.cover_url ?? ''} onChange={e => update('cover_url', e.target.value || null)} placeholder="https://..."/></label><label>ลิงก์ซอร์สโค้ด (ถ้ามี)<input type="url" value={form.repo_url ?? ''} onChange={e => update('repo_url', e.target.value || null)} placeholder="https://github.com/..."/></label><div className="wide admin-uploads"><label className="upload-button"><ImageUp size={18}/>{upload === 'cover' ? 'กำลังอัปโหลด...' : 'อัปโหลดภาพปก'}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={!!upload} onChange={e => uploadFile('cover', e.target.files?.[0])}/></label><label className="upload-button"><FileUp size={18}/>{upload === 'attachment' ? 'กำลังอัปโหลด...' : 'อัปโหลด PDF / ภาพ'}<input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" disabled={!!upload} onChange={e => uploadFile('attachment', e.target.files?.[0])}/></label><small>ไฟล์จะอยู่ใน Supabase Storage แบบสาธารณะ: อย่าอัปโหลดเอกสารที่มีข้อมูลส่วนบุคคลหรือข้อมูลภายใน</small></div><label className="wide">โจทย์ / ปัญหาที่แก้<textarea rows={2} value={form.problem} onChange={e => update('problem', e.target.value)}/></label><label className="wide">วิธีคิดและแนวทางแก้ปัญหา<textarea rows={2} value={form.solution} onChange={e => update('solution', e.target.value)}/></label><label className="wide">ผลลัพธ์ (กล่าวเฉพาะสิ่งที่เกิดขึ้นจริง)<textarea rows={2} value={form.outcome} onChange={e => update('outcome', e.target.value)}/></label><label>ปีผลงาน<input type="number" min="1990" max="2100" value={form.year} onChange={e => update('year', Number(e.target.value))}/></label><label>ลำดับการแสดง<input type="number" min="0" max="99999" value={form.sort_order} onChange={e => update('sort_order', Number(e.target.value))}/></label><label>สถานะ<select value={form.status} onChange={e => update('status', e.target.value as Project['status'])}><option value="draft">ร่าง (ไม่แสดงสาธารณะ)</option><option value="published">เผยแพร่</option></select></label><label className="admin-checkbox-label"><input type="checkbox" checked={form.featured} onChange={e => update('featured', e.target.checked)}/> แนะนำผลงานนี้ก่อน</label></div>{error ? <p className="admin-error" role="alert">{error}</p> : null}<div className="admin-modal-actions"><button type="button" className="button button-outline" onClick={onClose}>ยกเลิก</button><button className="button button-dark" disabled={saving || !!upload} type="submit"><Save size={17}/>{saving ? 'กำลังบันทึก...' : initial ? 'บันทึกการแก้ไข' : 'เพิ่มผลงาน'}</button></div></form></div></div>;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [items, setItems] = useState<Project[]>([]); const [error, setError] = useState('');
  const [working, setWorking] = useState(true); const [editing, setEditing] = useState<Project | null | 'new'>(null);
  const [importing, setImporting] = useState(false);
  const [newUrl, setNewUrl] = useState(''); const [quickAdding, setQuickAdding] = useState(false);
  const load = useCallback(async () => { try { const rows = await projectsRepository.listAdmin(); setItems(rows); setError(''); } catch (err) { setError(err instanceof Error ? err.message : String(err)); } finally { setWorking(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  async function remove(p: Project) {
    if (!window.confirm(`ยืนยันลบผลงาน "${p.title}"? การดำเนินการนี้ย้อนกลับไม่ได้`)) return;
    try { await projectsRepository.remove(p.id); await load(); } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
  }
  async function importItems() {
    if (!window.confirm('เพิ่มรายการผลงานเริ่มต้น 8 รายการจากลิงก์ที่ระบุ? ระบบจะข้ามรายการที่มี slug นี้แล้ว')) return;
    setImporting(true);
    try { const n = await projectsRepository.importStarter(); await load(); window.alert(`เพิ่มผลงานแล้ว ${n} รายการ`); } catch (err) { setError(err instanceof Error ? err.message : String(err)); } finally { setImporting(false); }
  }
  async function quickAdd(e: FormEvent) {
    e.preventDefault(); setQuickAdding(true); setError('');
    try {
      await projectsRepository.quickAddUrl(newUrl);
      setNewUrl(''); await load();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setQuickAdding(false); }
  }
  return <div className="admin-app"><aside className="admin-sidebar"><div className="admin-sidebar-brand">INDEX<span>.</span><small>WORKSPACE</small></div><nav><div className="admin-active"><FolderPlus size={17}/> จัดการผลงาน</div><Link to="/"><ArrowUpRight size={17}/> ดูหน้าเว็บไซต์</Link></nav><button type="button" onClick={onLogout} className="admin-signout"><LogOut size={16}/> ออกจากระบบ</button></aside><div className="admin-main"><div className="admin-topbar"><div><span>PROJECT DIRECTORY MANAGEMENT</span><h1>จัดการผลงาน</h1><p>เพิ่ม แก้ไข และกำหนดการเผยแพร่ได้จากที่นี่</p></div><div className="admin-top-actions"><button type="button" onClick={importItems} disabled={importing} className="button button-outline">{importing ? 'กำลังนำเข้า...' : 'นำเข้าผลงานเริ่มต้น'}</button><button className="button button-dark" type="button" onClick={() => setEditing('new')}><Plus size={17}/> เพิ่มผลงาน</button></div></div><form onSubmit={quickAdd} className="admin-quick-add"><div><strong>เพิ่มผลงานจากลิงก์</strong><small>วาง URL ครั้งเดียว · บันทึกเป็นร่าง · ระบบดึงข้อมูลเว็บไซต์ตามรอบอัตโนมัติหลังตั้งค่า Sync</small></div><input aria-label="ลิงก์ผลงาน https" type="url" required placeholder="https://your-project.example" value={newUrl} onChange={e => setNewUrl(e.target.value)}/><button className="button button-dark" type="submit" disabled={quickAdding}>{quickAdding ? 'กำลังเพิ่ม...' : 'เพิ่มจาก URL'}</button></form><div className="admin-stats"><div><small>ผลงานทั้งหมด</small><strong>{items.length}</strong></div><div><small>เผยแพร่แล้ว</small><strong>{items.filter(p => p.status === 'published').length}</strong></div><div><small>ฉบับร่าง</small><strong>{items.filter(p => p.status === 'draft').length}</strong></div><div><small>หมวดที่มีงาน</small><strong>{new Set(items.map(p => p.category)).size}</strong></div></div>{error ? <div role="alert" className="admin-error admin-message">{error}</div> : null}<div className="admin-list-box"><div className="admin-list-head"><h2>รายการผลงาน</h2><span>{items.length} PROJECTS</span></div>{working ? <div className="admin-empty">กำลังโหลดข้อมูล...</div> : items.length === 0 ? <div className="admin-empty"><FolderPlus size={32}/><h3>ยังไม่มีผลงานในฐานข้อมูล</h3><p>กด “นำเข้าผลงานเริ่มต้น” เพื่อเพิ่ม 8 รายการ หรือสร้างผลงานใหม่</p></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ผลงาน</th><th>หมวดหมู่</th><th>สถานะ</th><th>ลิงก์</th><th>ลำดับ</th><th>จัดการ</th></tr></thead><tbody>{items.map(p => <tr key={p.id}><td><strong>{p.title}</strong><small>{p.subtitle || p.slug}</small></td><td>{CATEGORIES.find(c => c.id === p.category)?.name || p.category}</td><td><span className={`admin-status ${p.status === 'published' ? 'published' : ''}`}>{p.status === 'published' ? <Check size={13}/> : null}{p.status === 'published' ? 'เผยแพร่' : 'ร่าง'}</span></td><td><span title={p.last_checked_at ? `ตรวจล่าสุด: ${new Date(p.last_checked_at).toLocaleString('th-TH')}` : 'ยังไม่ได้ตรวจ'}>{p.link_status === 'ok' ? 'ใช้งานได้' : p.link_status === 'broken' ? 'อาจเสีย' : p.link_status === 'unknown' ? 'ตรวจไม่ชัดเจน' : 'ยังไม่ตรวจ'}</span></td><td>{p.sort_order}</td><td><div className="admin-row-actions"><button title="แก้ไข" type="button" onClick={() => setEditing(p)}><Pencil size={17}/></button><button title="ลบ" type="button" onClick={() => remove(p)}><Trash2 size={17}/></button>{safeHttpUrl(p.live_url) ? <a href={safeHttpUrl(p.live_url)!} target="_blank" rel="noopener noreferrer" title="ชมเว็บไซต์"><ArrowUpRight size={17}/></a> : null}</div></td></tr>)}</tbody></table></div>}</div><p className="admin-note">ข้อมูลนี้ถูกเก็บใน Supabase โดยสิทธิ์แก้ไขจำกัดเฉพาะบัญชีผู้ดูแลที่อนุญาตไว้ในฐานข้อมูล</p></div>{editing ? <AdminForm initial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={load}/> : null}</div>;
}

export default function Admin() {
  const [userId, setUserId] = useState<string | null>(null); const [allowed, setAllowed] = useState<boolean | null>(null); const [loading, setLoading] = useState(true);
  const verify = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id ?? null;
    setUserId(uid);
    if (uid) { const result = await supabase.from('portfolio_admins').select('user_id').eq('user_id', uid).maybeSingle(); setAllowed(Boolean(result.data) && !result.error); }
    else setAllowed(null);
    setLoading(false);
  }, []);
  useEffect(() => { if (!supabase) return; void verify(); const { data } = supabase.auth.onAuthStateChange(() => { window.setTimeout(() => { void verify(); }, 0); }); return () => data.subscription.unsubscribe(); }, [verify]);
  const logOut = async () => { if (supabase) await supabase.auth.signOut(); setUserId(null); setAllowed(null); };
  if (!isSupabaseReady) return <div className="admin-unconfigured"><div className="admin-logo">INDEX<span>.</span></div><LockKeyhole size={30}/><h1>ตั้งค่า Supabase ก่อนใช้งานหลังบ้าน</h1><p>คัดลอก <code>.env.example</code> เป็น <code>.env</code> แล้วกรอก Project URL และ Publishable Key จาก Supabase จากนั้นรัน SQL ในโฟลเดอร์ <code>supabase/</code> และสร้างบัญชีผู้ดูแลตาม README</p><Link to="/" className="button button-dark"><ArrowLeft size={17}/> กลับหน้าเว็บ</Link></div>;
  if (loading) return <div className="admin-loading">กำลังตรวจสอบสิทธิ์...</div>;
  if (!userId) return <AdminLogin onLogin={() => { void verify(); }}/>;
  if (!allowed) return <div className="admin-unconfigured"><LockKeyhole size={28}/><h1>บัญชีนี้ยังไม่มีสิทธิ์จัดการ</h1><p>ต้องเพิ่ม Auth User ID ในตาราง <code>portfolio_admins</code> ผ่าน Supabase SQL Editor โดยผู้ดูแลโครงการ</p><button className="button button-dark" onClick={logOut}>ออกจากระบบ <LogOut size={16}/></button></div>;
  return <AdminDashboard onLogout={logOut}/>;
}
