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

## 🌐 Como Colocar o Aplicativo Público na Internet (Para Celulares)

### Opção 1: Publicação Gratuita na Vercel (Recomendado)
1. Envie suas alterações para o GitHub:
   ```bash
   git push origin main
   ```
2. Acesse [vercel.com](https://vercel.com) e conecte sua conta do GitHub.
3. Importe o repositório `Relatorio-de-campanha`.
4. Em **Environment Variables**, adicione as chaves do seu arquivo `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Clique em **Deploy**. O Vercel gerará o link seguro `https://sua-campanha.vercel.app` para uso público.

### Opção 2: Teste Instantâneo no Celular (Link Temporário de Teste)
Para gerar um link público imediato sem fazer deploy na Vercel:
```bash
npx localtunnel --port 3000
```
O terminal gerará um link público seguro (ex: `https://...loca.lt`) que pode ser aberto em qualquer celular na internet.
