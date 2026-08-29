# 🎱 Bingo — Sistema em Tempo Real

Sistema de bingo com sincronização em tempo real via Supabase. O admin sorteia os números pelo Mac, e os participantes acompanham pelo celular abrindo o link `/view`.

## Stack

- **Next.js 15** (App Router)
- **Supabase** (PostgreSQL + Realtime)
- **Zustand** (estado global)
- **Tailwind CSS v4**

---

## Setup rápido

### 1. Criar projeto no Supabase

Acesse [supabase.com](https://supabase.com), crie um projeto e copie a URL e a Anon Key.

### 2. Criar a tabela

No Supabase, vá em **SQL Editor** e execute o conteúdo de `supabase/schema.sql`.

### 3. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
# edite .env.local com sua URL e chave
```

### 4. Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000` para o admin e `http://localhost:3000/view` para a tela dos participantes.

---

## Deploy na Vercel

1. Faça o push para o GitHub
2. Importe o repositório na Vercel
3. Adicione as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`) nas configurações do projeto
4. Deploy automático!

**URL de acesso:**
- Admin: `https://seuapp.vercel.app/` (só você usa)
- Participantes: `https://seuapp.vercel.app/view` (compartilhe esse link)

---

## Funcionalidades

- ✅ Sorteio aleatório de números (1–75)
- ✅ Marcação manual de qualquer número (clique na grade)
- ✅ Sincronização em tempo real — participantes veem instantaneamente
- ✅ Flash animado ao sortear novo número (tela dos participantes)
- ✅ Campo de prêmio editável (visível para todos)
- ✅ Histórico dos últimos sorteados
- ✅ Barra de progresso
- ✅ Alerta "Faltam apenas N!" quando restam ≤15 números
- ✅ Pausar / continuar o jogo
- ✅ Reiniciar o jogo com confirmação
- ✅ Tela de fim de jogo
# bingo
