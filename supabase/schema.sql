-- Project Index — โครงสร้างสำหรับ Supabase (PostgreSQL)
-- นำไปรันใน SQL Editor ของโปรเจกต์ใหม่ แล้วเพิ่ม Admin user id ตาม README
-- ไม่ต้องใช้ service_role ใน frontend

create extension if not exists pgcrypto;

create table if not exists public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (length(trim(slug)) between 1 and 150),
  title text not null check (length(trim(title)) between 1 and 120),
  subtitle text not null default '',
  description text not null default '',
  category text not null default 'other' check (category in ('web-app','website','landing-page','facebook-page','document','cv','poster','manual','other')),
  cover_url text,
  live_url text,
  asset_url text,
  repo_url text,
  tags text[] not null default '{}',
  problem text not null default '',
  solution text not null default '',
  outcome text not null default '',
  year integer not null default extract(year from now())::integer check (year between 1990 and 2100),
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text not null default 'manual' check (source in ('manual','url','github')),
  needs_enrichment boolean not null default false,
  link_status text not null default 'unchecked' check (link_status in ('ok','broken','unknown','unchecked')),
  last_checked_at timestamptz
);

create index if not exists idx_portfolio_projects_visibility on public.projects(status, featured desc, sort_order asc, created_at desc);
create index if not exists idx_portfolio_projects_category on public.projects(category);

create or replace function public.portfolio_touch_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists portfolio_projects_updated_at on public.projects;
create trigger portfolio_projects_updated_at before update on public.projects
for each row execute function public.portfolio_touch_updated_at();

-- เนื่องจาก Supabase ปี 2026 มีการเปลี่ยน Data API grants: grant อย่างชัดเจน
revoke all on public.portfolio_admins from anon, authenticated;
revoke all on public.projects from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.portfolio_admins to authenticated;
grant select on public.projects to anon;
grant select, insert, update, delete on public.projects to authenticated;

alter table public.portfolio_admins enable row level security;
alter table public.projects enable row level security;

-- ผู้ที่ล็อกอินเห็นเฉพาะแถวสิทธิ์ของตนเอง ไม่ให้ API client เพิ่มสิทธิ์ตนเองได้
create policy "admin can read own membership" on public.portfolio_admins
for select to authenticated using (user_id = (select auth.uid()));

-- คนทั่วไปอ่านได้เฉพาะผลงาน published; admin เห็นร่างและจัดการได้ทั้งหมด
create policy "public can read published projects" on public.projects
for select to anon, authenticated using (status = 'published');
create policy "admins read all projects" on public.projects
for select to authenticated using (
  exists (select 1 from public.portfolio_admins a where a.user_id = (select auth.uid()))
);
create policy "admins insert projects" on public.projects
for insert to authenticated with check (
  exists (select 1 from public.portfolio_admins a where a.user_id = (select auth.uid()))
);
create policy "admins update projects" on public.projects
for update to authenticated
using (exists (select 1 from public.portfolio_admins a where a.user_id = (select auth.uid())))
with check (exists (select 1 from public.portfolio_admins a where a.user_id = (select auth.uid())));
create policy "admins delete projects" on public.projects
for delete to authenticated using (
  exists (select 1 from public.portfolio_admins a where a.user_id = (select auth.uid()))
);

-- เฉพาะไฟล์สำหรับแสดงสาธารณะเท่านั้น ห้ามเก็บ PDF ที่มีข้อมูลส่วนบุคคลใน bucket นี้
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-public', 'portfolio-public', true, 15728640,
  array['image/jpeg','image/png','image/webp','image/avif','application/pdf']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- การเปิด public URL ดึงไฟล์ได้ตามการตั้งค่า bucket; upload/delete จำกัดเฉพาะ admin
create policy "portfolio admin can upload media" on storage.objects
for insert to authenticated with check (
  bucket_id = 'portfolio-public' and
  exists (select 1 from public.portfolio_admins a where a.user_id = (select auth.uid()))
);
create policy "portfolio admin can list media" on storage.objects
for select to authenticated using (
  bucket_id = 'portfolio-public' and
  exists (select 1 from public.portfolio_admins a where a.user_id = (select auth.uid()))
);
create policy "portfolio admin can edit media" on storage.objects
for update to authenticated
using (bucket_id = 'portfolio-public' and exists (select 1 from public.portfolio_admins a where a.user_id = (select auth.uid())))
with check (bucket_id = 'portfolio-public' and exists (select 1 from public.portfolio_admins a where a.user_id = (select auth.uid())));
create policy "portfolio admin can delete media" on storage.objects
for delete to authenticated using (
  bucket_id = 'portfolio-public' and
  exists (select 1 from public.portfolio_admins a where a.user_id = (select auth.uid()))
);

-- ตัวอย่างการอนุมัติแอดมิน หลังสร้างผู้ใช้จริงใน Authentication > Users
-- insert into public.portfolio_admins(user_id) values ('PASTE-YOUR-AUTH-USER-UUID-HERE');
