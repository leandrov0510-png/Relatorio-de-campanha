import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Obter as variáveis de ambiente do Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'SUA_URL_DO_SUPABASE');

// Fetch com timeout de 20s e retry automático (3 tentativas com backoff exponencial)
const fetchWithTimeout = (url: RequestInfo | URL, options: RequestInit = {}, attempt = 1): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer))
    .catch((err) => {
      const isAbort = err?.name === 'AbortError';
      const isNetworkError = err instanceof TypeError;
      if ((isAbort || isNetworkError) && attempt < 3) {
        const delay = attempt * 1500; // 1.5s, 3s
        console.warn(`[Supabase] Tentativa ${attempt} falhou (${err.message}). Tentando novamente em ${delay}ms...`);
        return new Promise<Response>((resolve) =>
          setTimeout(() => resolve(fetchWithTimeout(url, options, attempt + 1)), delay)
        );
      }
      throw err;
    });
};

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    global: { fetch: fetchWithTimeout },
    db: { schema: 'public' },
  }
);

