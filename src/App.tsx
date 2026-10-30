import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Code2, ExternalLink, FileText, FolderOpen, Globe2, Image as ImageIcon, Layers3, Search, Share2, X } from 'lucide-react';
import { CATEGORIES, getCategory, safeHttpUrl, type CategoryId, type Project } from './types';
import { projectsRepository } from './lib/projects';
import Admin from './admin/Admin';

const categoryIcons: Record<CategoryId, typeof Code2> = {
  'web-app': Code2, website: Globe2, 'landing-page': Layers3,
  'facebook-page': Share2, document: FileText, cv: FileText,
  poster: ImageIcon, manual: FolderOpen, other: FolderOpen,
};

const projectKinds: Record<string, { symbol: string; tone: string; label: string }> = {
  leuknueng: { symbol: '01', tone: 'plum', label: 'PLATFORM' },
  dinproperty: { symbol: '02', tone: 'clay', label: 'PROPERTY' },
  'north-circle': { symbol: '03', tone: 'forest', label: 'TRAVEL' },
  'khom-festival': { symbol: '04', tone: 'ink', label: 'EVENT' },
  'doi-suthep-meditation': { symbol: '05', tone: 'sand', label: 'INFORMATION' },
  'kh14-community': { symbol: '06', tone: 'teal', label: 'COMMUNITY DATA' },
};

function ProjectCard({ project, order }: { project: Project; order: number }) {
  const destination = safeHttpUrl(project.live_url) ?? safeHttpUrl(project.asset_url) ?? safeHttpUrl(project.repo_url);
  const visual = projectKinds[project.slug] ?? { symbol: String(order + 1).padStart(2, '0'), tone: 'neutral', label: 'DIGITAL WORK' };
  const host = destination ? new URL(destination).hostname.replace(/^www\./, '') : 'ยังไม่มีลิงก์';
  const body = <>
    <div className={`directory-card-art directory-art-${visual.tone}`}>
      {safeHttpUrl(project.cover_url) ? <img src={safeHttpUrl(project.cover_url)!} alt="" loading="lazy" /> : <><span className="directory-art-label">{visual.label}</span><span className="directory-art-number">{visual.symbol}</span><span className="directory-art-wordmark">{project.title}</span></>}
      <span className="directory-art-arrow"><ArrowUpRight size={19} /></span>
    </div>
    <div className="directory-card-content">
      <div className="directory-card-top"><span className="directory-card-category">{getCategory(project.category).name}</span><span className="directory-card-year">{project.year}</span></div>
      <div className="directory-card-title"><h3>{project.title}</h3><ArrowUpRight size={20} strokeWidth={1.8} /></div>
      <p className="directory-card-description">{project.description || project.subtitle || 'สำรวจผลงานและรายละเอียดเพิ่มเติมผ่านลิงก์โครงการ'}</p>
      <div className="directory-card-footer"><span className="directory-card-host"><Globe2 size={14} />{host}</span><span className="directory-card-visit">{destination ? 'เปิดเว็บไซต์' : 'ไม่มีลิงก์'} <ExternalLink size={14} /></span></div>
    </div>
  </>;
  if (!destination) return <article className="directory-card directory-card-disabled">{body}</article>;
  return <a className="directory-card" href={destination} target="_blank" rel="noopener noreferrer" aria-label={`เปิดผลงาน ${project.title} ในแท็บใหม่`}>{body}</a>;
}

function Directory() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState<string>('all');
  const [query, setQuery] = useState('');
  useEffect(() => {
    let alive = true;
    projectsRepository.listPublic().then(rows => {
      if (!alive) return;
      setProjects(rows); setError('');
    }).catch(() => {
      if (alive) setError('ไม่สามารถโหลดรายการออนไลน์ได้ กรุณาลองใหม่อีกครั้ง');
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const published = useMemo(() => projects.filter(project => project.status === 'published').sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title)), [projects]);
  const categories = useMemo(() => CATEGORIES.map(category => ({ ...category, count: published.filter(item => item.category === category.id).length })).filter(category => category.count > 0), [published]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return published.filter(project => (active === 'all' || project.category === active) && (!needle || [project.title, project.subtitle, project.description, ...project.tags].join(' ').toLocaleLowerCase().includes(needle)));
  }, [published, active, query]);
  const sections = useMemo(() => categories.map(category => ({ ...category, projects: filtered.filter(project => project.category === category.id) })).filter(category => category.projects.length > 0), [categories, filtered]);

  return <div className="directory-page">
    <header className="directory-header"><div className="directory-container directory-header-inner">
      <a className="directory-brand" href="/" aria-label="Project Index หน้าแรก"><span className="directory-brand-icon"><Layers3 size={21} strokeWidth={2.4} /></span><span>PROJECT<span className="directory-brand-accent">INDEX</span><small>Digital work collection</small></span></a>
      <nav aria-label="เมนูหลัก"><a href="#projects">Projects</a><a href="#categories">Categories</a><span className="directory-header-pill">{published.length} PROJECTS</span></nav>
    </div></header>
    <main>
      <section className="directory-intro directory-container" aria-labelledby="directory-title">
        <div className="directory-eyebrow"><span className="directory-eyebrow-dot" /> DIGITAL PROJECT DIRECTORY <span className="directory-eyebrow-line" /></div>
        <div className="directory-hero-row"><div><h1 id="directory-title">รวมผลงาน<span>.</span><br /><em>ทุกโปรเจกต์ในที่เดียว</em></h1><p>คลังรวมลิงก์โปรเจกต์ดิจิทัล แยกหมวดหมู่ชัดเจน ค้นหาได้ง่าย และเข้าชมผลงานจริงได้ทันที</p></div><div className="directory-hero-meta"><strong>{String(published.length).padStart(2, '0')}</strong><span>PROJECTS IN COLLECTION</span><small>{categories.length} หมวดหมู่</small></div></div>
      </section>
      <section id="projects" className="directory-collection directory-container" aria-label="รายการผลงาน">
        <div className="directory-toolbar" id="categories">
          <div className="directory-filter-heading"><span>EXPLORE THE COLLECTION</span><h2>รายการโปรเจกต์</h2></div>
          <label className="directory-search"><Search size={18} /><input type="search" placeholder="ค้นหาชื่อโปรเจกต์..." aria-label="ค้นหาโปรเจกต์" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" onClick={() => setQuery('')} aria-label="ล้างการค้นหา"><X size={17} /></button>}</label>
        </div>
        <div className="directory-filters" role="group" aria-label="กรองหมวดหมู่">
          <button type="button" className={active === 'all' ? 'is-active' : ''} onClick={() => setActive('all')}>ทั้งหมด <span>{published.length}</span></button>
          {categories.map(category => { const Icon = categoryIcons[category.id]; return <button type="button" className={active === category.id ? 'is-active' : ''} onClick={() => setActive(category.id)} key={category.id}><Icon size={15} />{category.name}<span>{category.count}</span></button>; })}
        </div>
        {loading && <div className="directory-state">กำลังโหลดรายการโปรเจกต์...</div>}
        {error && <div className="directory-state" role="alert">{error}</div>}
        {!loading && !error && sections.length === 0 && <div className="directory-state">ไม่พบโปรเจกต์ที่ตรงกับคำค้นหา <button type="button" onClick={() => { setQuery(''); setActive('all'); }}>ดูทั้งหมด <ArrowRight size={16} /></button></div>}
        {!loading && !error && sections.map((section, sectionIndex) => <section className="directory-group" key={section.id} aria-labelledby={`category-${section.id}`}>
          <div className="directory-group-heading"><div className="directory-group-heading-left"><span className="directory-group-no">{String(sectionIndex + 1).padStart(2, '0')}</span><h2 id={`category-${section.id}`}>{section.name}</h2><span className="directory-group-count">{section.projects.length}</span></div><span className="directory-group-line" /></div>
          <div className="directory-grid">{section.projects.map((project, i) => <ProjectCard key={project.id} project={project} order={i} />)}</div>
        </section>)}
        <div className="directory-bottom-note"><span><span className="directory-note-dot" /> ทุกการ์ดเปิดผลงานในแท็บใหม่</span><span>{filtered.length} จาก {published.length} โปรเจกต์</span></div>
      </section>
    </main>
    <footer className="directory-footer"><div className="directory-container directory-footer-inner"><div className="directory-footer-brand">PROJECT INDEX<span>.</span></div><span>Digital project collection</span><a href="#projects">กลับไปดูโปรเจกต์ <ArrowUpRight size={15} /></a></div></footer>
  </div>;
}

export default function App() {
  return <Routes>
    <Route path="/admin" element={<Admin />} />
    <Route path="/" element={<Directory />} />
    <Route path="*" element={<div className="directory-not-found"><h1>ไม่พบหน้านี้</h1><p>ลิงก์เดิมของรายละเอียดโปรเจกต์ถูกยกเลิกแล้ว</p><Link to="/">กลับไปหน้าโปรเจกต์ <ArrowRight size={17} /></Link></div>} />
  </Routes>;
}
