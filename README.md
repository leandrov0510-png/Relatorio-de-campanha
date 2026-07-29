# Relatório de Campanha - Cadastro GUTI 2026

Aplicação web para coleta de cadastros, gerenciamento de equipe de campanha e upload de documentos.

## 🛠️ Tecnologias Utilizadas
- **Frontend**: React, Vite, TypeScript, TailwindCSS, Lucide Icons, Motion
- **Backend / Banco de Dados**: Supabase (PostgreSQL + Row Level Security)
- **Armazenamento**: Supabase Storage (Bucket `documents`)

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js (v18+)

### Passos
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure as variáveis de ambiente no arquivo `.env`:
   ```env
   VITE_SUPABASE_URL="https://becijhlpbnuuaiyrlkcg.supabase.co"
   VITE_SUPABASE_ANON_KEY="sua_chave_anonima_aqui"
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
