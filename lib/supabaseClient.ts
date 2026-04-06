
import { createClient } from '@supabase/supabase-js';

// Safe environment variable access for different bundlers (Vite, Webpack, etc)
const getEnvVar = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    // @ts-ignore
    return process.env[key];
  }
  return '';
};

// Credenciais extraídas do JWT fornecido
// Project Ref: qkgctsxmwngxpeiqhhij
const DEFAULT_URL = 'https://qkgctsxmwngxpeiqhhij.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrZ2N0c3htd25neHBlaXFoaGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjAwMzcsImV4cCI6MjA4MDg5NjAzN30.inqCUhu13-jsCYZ1dgZnezPXPww0a4cMjlKZzBx0KEw';

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL') || DEFAULT_URL;
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_KEY') || DEFAULT_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper para verificar conexão (opcional)
export const checkConnection = async () => {
  try {
    // Tenta buscar um post de blog público apenas para testar conectividade
    const { error } = await supabase.from('blog_posts').select('id').limit(1);
    // Se o erro for de conexão, retorna false. Se for "tabela vazia" (error null ou código específico), retorna true.
    if (error && error.code !== 'PGRST116') return false; 
    return true;
  } catch {
    return false;
  }
};
