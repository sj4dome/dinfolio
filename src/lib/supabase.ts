import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
export const isSupabaseReady = Boolean(url && key);
// ฝั่ง browser ใช้เฉพาะ publishable key เท่านั้น ห้ามใส่ service_role หรือ secret key
export const supabase = url && key ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } }) : null;
