-- ใช้เมื่อเคยรัน schema.sql ฉบับเดิมแล้วเท่านั้น
-- ไม่มีการลบข้อมูลเดิมหรือแก้สิทธิ์ RLS
alter table public.projects add column if not exists source text not null default 'manual';
alter table public.projects add column if not exists needs_enrichment boolean not null default false;
alter table public.projects add column if not exists link_status text not null default 'unchecked';
alter table public.projects add column if not exists last_checked_at timestamptz;
-- ตรวจสอบหลัง migration ด้วย SELECT ก่อนเปิด GitHub Actions
select count(*) as projects_count from public.projects;
