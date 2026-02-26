import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyrjvdtgfwwxxdxdbuah.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cmp2ZHRnZnd3eHhkeGRidWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMzAwNTEsImV4cCI6MjA4NzcwNjA1MX0.Xmow21aKox7AmJiqwz1KkbWpyTB8tZTgclubszKGBSo';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper para obtener el usuario actual
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper para obtener el perfil del usuario actual
export async function getCurrentPerfil() {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    console.error('Error al obtener perfil:', error);
    return null;
  }
  
  return data;
}
