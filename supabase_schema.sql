-- Script SQL de Configuração do Banco de Dados no Supabase
-- Execute este script no SQL Editor do seu painel Supabase (https://supabase.com/dashboard)

-- 1. Tabela de Cadastros de Campanha
CREATE TABLE IF NOT EXISTS public.campaign_users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    coordinator_name TEXT,
    deputado_estadual TEXT,
    social_media TEXT,
    pix_key TEXT,
    whatsapp TEXT NOT NULL,
    address TEXT,
    electoral_zone TEXT NOT NULL,
    registered_by TEXT,
    registration_type TEXT DEFAULT 'PROPRIO',
    ip_address TEXT,
    status TEXT DEFAULT 'PENDENTE',
    documents JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) e permitir acesso público/anon para a aplicação
ALTER TABLE public.campaign_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para todos" 
ON public.campaign_users FOR SELECT USING (true);

CREATE POLICY "Permitir insercao para todos" 
ON public.campaign_users FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualizacao para todos" 
ON public.campaign_users FOR UPDATE USING (true);

CREATE POLICY "Permitir delecao para todos" 
ON public.campaign_users FOR DELETE USING (true);


-- 2. Tabela de Logs de Auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_name TEXT
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de logs" 
ON public.audit_logs FOR SELECT USING (true);

CREATE POLICY "Permitir criacao de logs" 
ON public.audit_logs FOR INSERT WITH CHECK (true);


-- 3. Criar Bucket de Armazenamento para Documentos (RG, Título, Comprovantes)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Permitir envio de documentos" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Permitir visualizacao de documentos" 
ON storage.objects FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Permitir atualizacao de documentos" 
ON storage.objects FOR UPDATE USING (bucket_id = 'documents');

CREATE POLICY "Permitir delecao de documentos" 
ON storage.objects FOR DELETE USING (bucket_id = 'documents');


-- 4. Tabela de Configurações do Sistema (Ex: Senha Admin Sincronizada)
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de configuracoes" 
ON public.system_settings FOR SELECT USING (true);

CREATE POLICY "Permitir alteracao de configuracoes" 
ON public.system_settings FOR ALL USING (true);


-- 5. Habilitar Supabase Realtime para Notificações Instantâneas Multidispositivo (WebSockets)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_users;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Publicacao supabase_realtime pode ser ativada diretamente no painel Supabase > Database > Realtime.';
END $$;


