import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const DEFAULT_SUPABASE_URL = 'https://becijhlpbnuuaiyrlkcg.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlY2lqaGxwYm51dWFpeXJsa2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNzI5NDMsImV4cCI6MjEwMDk0ODk0M30.pg1Ex3hfpo2D6g1ZotlBITFSC5JO2LcaOHfn5cknfDM';

// Obter as variáveis de ambiente do Vite com fallback para as chaves do projeto
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'SUA_URL_DO_SUPABASE');

// Fetch com timeout de 12s e retry automático (3 tentativas)
const fetchWithTimeout = (url: RequestInfo | URL, options: RequestInit = {}, attempt = 1): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  const signal = options.signal
    ? (options.signal as any)
    : controller.signal;

  return fetch(url, { ...options, signal })
    .finally(() => clearTimeout(timer))
    .catch((err) => {
      const isAbort = err?.name === 'AbortError';
      const isNetworkError = err instanceof TypeError;
      if ((isAbort || isNetworkError) && attempt < 3) {
        const delay = attempt * 1000; // 1s, 2s
        console.warn(`[Supabase] Tentativa ${attempt} falhou (${err.message}). Re-tentando em ${delay}ms...`);
        return new Promise<Response>((resolve) =>
          setTimeout(() => resolve(fetchWithTimeout(url, options, attempt + 1)), delay)
        );
      }
      throw err;
    });
};

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    global: { fetch: fetchWithTimeout },
    db: { schema: 'public' },
  }
);
