---
tags: [projeto/gomoto, projeto/config, projeto/segurança]
---

# 🔐 Variáveis de Ambiente — [[GoMoto]]

> Projeto: [[GoMoto]]

## Produção / Desenvolvimento

Arquivo: `.env.local` (nunca commitado)

| Variável | Exemplo | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hcnxbqunescfanqzmsha.supabase.co` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` | Chave pública (anon) do Supabase — novo formato a partir de abr/2026 |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Chave secreta (service_role) — apenas server-side |

> ⚠️ O Supabase migrou o formato da anon key de `eyJ...` (JWT) para `sb_publishable_...`. Os clientes em `src/lib/supabase/client.ts` e `server.ts` validam o prefixo — aceitam ambos os formatos (`ey` e `sb_`).

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` **nunca** deve ter o prefixo `NEXT_PUBLIC_` — exporia acesso total ao banco no navegador.

> ⚠️ `NEXT_PUBLIC_` expõe a variável no navegador. Seguro apenas para a `anon key` — nunca usar a `service_role key` com esse prefixo.

## Testes

Arquivo: `.env.test`

| Variável | Uso |
|---|---|
| `TEST_USER_EMAIL` | Email do usuário de teste para Playwright |
| `TEST_USER_PASSWORD` | Senha do usuário de teste |

## Supabase — IDs do Projeto

| Info | Valor |
|---|---|
| Project ID | `hcnxbqunescfanqzmsha` |
| URL | `https://hcnxbqunescfanqzmsha.supabase.co` |

## Como configurar ambiente novo

1. Criar projeto no Supabase (supabase.com)
2. Copiar URL e anon key em Project Settings → API
3. Criar `.env.local` com as duas variáveis
4. Executar `supabase-schema.sql` no SQL Editor do Supabase
5. Criar usuário em Authentication → Users
6. Rodar `npm run dev`

## Futuras variáveis (Roadmap)

| Variável | Serviço | Para que |
|---|---|---|
| `RESEND_API_KEY` | Resend | Emails transacionais |
| `SENTRY_DSN` | Sentry | Monitoramento de erros |
| `UPSTASH_REDIS_URL` | Upstash | Rate-limit persistente |
| `UPSTASH_REDIS_TOKEN` | Upstash | Auth do Redis |
