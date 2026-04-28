# 🏗️ Arquitetura — [[GoMoto]]

## Tipo
Monolito full-stack em [[Next.js]] 14 com App Router.

## Estrutura de pastas
```
src/
├── app/
│   ├── (auth)/login/              ← Grupo de auth
│   ├── (dashboard)/               ← Grupo protegido (requer login)
│   │   ├── dashboard/
│   │   ├── motos/
│   │   ├── clientes/
│   │   ├── contratos/
│   │   ├── cobrancas/
│   │   ├── entradas/
│   │   ├── despesas/
│   │   ├── fila/
│   │   ├── manutencao/
│   │   ├── multas/
│   │   ├── processos/
│   │   ├── relatorios/
│   │   ├── configuracoes/
│   │   └── layout.tsx             ← Sidebar + Header
│   ├── auth/                      ← Route handlers (logout)
│   └── layout.tsx                 ← Layout raiz
├── components/
│   ├── ui/                        ← Button, Input, Card, Badge, Modal, Table
│   └── layout/                    ← Sidebar, Header, MotorcycleMap
├── lib/
│   ├── supabase/
│   │   ├── client.ts              ← createBrowserClient
│   │   └── server.ts              ← createServerClient (cookies)
│   ├── schemas.ts                 ← Validações Zod
│   ├── utils.ts                   ← formatCurrency, formatDate, cn
│   └── audit.ts                   ← Log de ações
├── types/
│   └── index.ts                   ← Types globais
└── middleware.ts                  ← Auth + rate-limiting
```

## Padrões usados
- **Route Groups:** `(auth)` e `(dashboard)` separam layouts sem afetar URL
- **Server Components por padrão** — Dashboard usa RSC
- **Client Components** — páginas com forms/filtros usam `'use client'`
- **Dynamic imports** — Leaflet com `ssr: false` (depende de `window`)
- **Middleware** — intercepta requests para autenticação e rate-limiting

## Fluxo de autenticação
1. Usuário tenta acessar `/dashboard/*`
2. `middleware.ts` verifica cookie de sessão Supabase
3. Sem token → redireciona `/login`
4. Com token em `/login` → redireciona `/dashboard`
5. Token renovado a cada request (middleware)

## Stack completo
- **Frontend:** Next.js 14.2.35, React 18, TypeScript 5, Tailwind 3.4.1
- **UI:** Lucide (ícones), Leaflet 1.9 (mapas), Recharts 3.8 (gráficos)
- **Validação:** Zod 4.3.6
- **Utils:** clsx 2.1, tailwind-merge 3.5, date-fns
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Testes:** Playwright 1.59.1 (E2E)
- **Lint:** ESLint 8

## Tags
`#projeto/arquitetura` `#stack/nextjs`
