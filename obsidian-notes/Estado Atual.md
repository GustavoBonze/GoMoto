---
tags: [projeto/gomoto, projeto/estado]
updated: 2026-07-15
---

# 📊 Estado Atual — [[GoMoto]]

> Projeto: [[GoMoto]]

Snapshot em **2026-07-15**. Evidência: `git log` do repo local (`/Users/gustavobonze/Projetos/Gustavo/GoMoto`, branch `main`, sincronizado com `origin/main`), inspeção de `src/` e `package.json`.

## Resumo

ERP de locadora de motos (Next.js 14 + Supabase) **funcional em desenvolvimento local**. Último commit: `5164634` (2026-06-08). **Ainda sem deploy em produção** — não há `vercel.json` nem pasta `.vercel` no repo.

## Funcionalidades prontas

| Módulo | Estado | Evidência |
|---|---|---|
| 14 rotas do dashboard | Operacionais: dashboard, motos, clientes, contratos, cobranças, fila, entradas, despesas, multas, manutenção, processos, relatórios, configurações + login | `ls src/app/(dashboard)/` |
| Contratos — modelos `.docx` | Gestão de modelos no modal, geração de DOCX preenchido (docxtemplater + pizzip), upload de contrato assinado | commit `bd419d8` (2026-05-27) |
| Contratos — encerramento | Fluxo em 3 etapas (cliente com multa R$ 1.000 / empresa com motivo ≥ 50 chars) | [[01-Projetos/GoMoto/Telas/Contratos\|Contratos]] |
| Motos | Wizard 2 passos com bootstrap de 13 itens de manutenção; ano de fabricação e ano do modelo separados (`year_manufacture` / `year_model`) | commit `475dd1f` (2026-05-27) + `src/types/index.ts:90-93` |
| Manutenção | Upload real de fotos de KM (odômetro) e NF na conclusão, bucket `maintenance-files` | commit `faed617` |
| Fila | Promoção de candidato a cliente preenche `description` da caução | commit `be9d757` (2026-04-29) |
| Segurança | Hardening pré-produção, publishable keys `sb_`, RLS em todas as tabelas, `.mcp.json` protegido | commits `2f4165d`, `a9012b1`, `d8853d6`, `a91adaf` |
| Design System Bonze | Aplicado em todas as páginas e componentes | commits `5c6240c`, `18298b9` |
| Testes | Playwright E2E configurado (sem unitários) | [[01-Projetos/GoMoto/Testes\|Testes]] |

## Pendente (topo do [[01-Projetos/GoMoto/Roadmap|Roadmap]])

| # | Item | Situação verificada |
|---|---|---|
| 1 | Filtro da tela de clientes | Filtro de status (Todos/Ativos/Ex-Clientes) já existe, mas o filtro por UF ainda está presente (`stateFilter` em `clientes/page.tsx`) |
| 3 | Integração de pagamento (InfinitPay/MP) | Não iniciado |
| 4 | Rastreamento GPS no mapa | Lat/lng ainda simulados |
| 5 | Relatórios por período | Tela placeholder |
| 6 | Deploy no Vercel | Não realizado |
| 7–10 | CI/CD, Resend, Sentry, Upstash | Não iniciados |

## Deploy / Infra

- **Produção:** ❌ sem deploy (Vercel pendente).
- **Supabase:** projeto `hcnxbqunescfanqzmsha` ativo (PostgreSQL + Auth + Storage, 15 tabelas, 4 buckets).
- **Dependências novas:** `pizzip` e `docxtemplater` instaladas (commit `5164634`).

## Como este snapshot foi verificado (2026-07-15)

- `git log --oneline -25` e `git status` — repo em dia com `origin/main`.
- `jq '.dependencies' package.json` — confirma docxtemplater/pizzip.
- `grep year_manufacture src/types/index.ts` e `grep stateFilter src/app/(dashboard)/clientes/page.tsx`.
- `ls .vercel vercel.json` — inexistentes (deploy pendente).
