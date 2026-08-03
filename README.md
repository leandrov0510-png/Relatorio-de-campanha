# Relatório de Campanha - Cadastro GUTI 2026

Aplicação web para coleta de cadastros, gerenciamento de equipe de campanha, envio de documentos e sincronização em tempo real multidispositivo.

## 🛠️ Tecnologias Utilizadas
- **Frontend**: React 19, Vite, TypeScript, TailwindCSS, Lucide Icons, Motion
- **Backend / Banco de Dados**: Supabase (PostgreSQL + Row Level Security + Supabase Realtime WebSockets)
- **Armazenamento de Arquivos**: Supabase Storage (Bucket `documents`)

---

## ⚡ Sincronização Multidispositivo e Supabase

Todos os cadastros efetuados via celular, tablet ou computador são enviados automaticamente para a nuvem no **Supabase**. Os arquivos de imagem e PDF (RG, Título, CNH, Comprovante de Endereço, Doc Veicular) são gravados diretamente no **Supabase Storage** e recebem URLs públicas seguras, garantindo que o **Painel Administrativo** consiga visualizar e baixar os documentos em qualquer dispositivo.

---

## 🗄️ Configuração do Banco de Dados no Supabase

Para garantir que novos cadastros acionem atualizações instantâneas no Painel Admin via WebSockets (Supabase Realtime), execute o conteúdo do arquivo `supabase_schema.sql` no **SQL Editor** do seu painel Supabase:

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione o projeto e vá em **SQL Editor**
3. Cole o conteúdo de `supabase_schema.sql` e clique em **Run**

---

## 🌐 Deploy na Vercel e GitHub

Como o aplicativo frontend busca e salva dados diretamente no **Supabase**, qualquer cadastro feito por qualquer pessoa na internet via celular atualiza a base de dados instantaneamente. **Não é necessário fazer novos commits no GitHub ou re-compilar na Vercel a cada cadastro!**

### Como publicar na Vercel:
1. Suba o código para o GitHub:
   ```bash
   git push origin main
   ```
2. Acesse [vercel.com](https://vercel.com) e crie um novo projeto importando o repositório.
3. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL` = `https://becijhlpbnuuaiyrlkcg.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sua_chave_anonima`
4. Clique em **Deploy**.

---

## 🚀 Como Executar Localmente

### Passos:
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. O servidor ficará ativo em `http://localhost:3000`.
