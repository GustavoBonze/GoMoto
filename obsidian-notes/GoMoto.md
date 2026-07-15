---
tags: [projeto/gomoto, projeto/ativo, stack/nextjs, stack/supabase]
---

# 🏍️ GoMoto

**ERP completo de locadora de motocicletas.** Next.js 14 + Supabase.

## 📂 Navegação deste projeto

### Base técnica
- [[01-Projetos/GoMoto/Arquitetura|Arquitetura]] — Stack, estrutura de pastas, padrões de código
- [[01-Projetos/GoMoto/Banco de Dados|Banco de Dados]] — Tabelas, relações, RLS, seed data
- [[01-Projetos/GoMoto/Storage Supabase|Storage Supabase]] — Buckets, paths, como fazer upload
- [[01-Projetos/GoMoto/Componentes UI|Componentes UI]] — Button, Card, Modal, Table, Badge, Input, Sidebar, Mapa
- [[01-Projetos/GoMoto/Tipos TypeScript|Tipos TypeScript]] — Interfaces e union types (`src/types/index.ts`)
- [[01-Projetos/GoMoto/Design System|Design System]] — Paleta, tipografia, espaçamento, tokens visuais
- [[01-Projetos/GoMoto/Utilitários e Libs|Utilitários e Libs]] — utils.ts, schemas Zod, supabase client/server
- [[01-Projetos/GoMoto/Guia de Desenvolvimento|Guia de Desenvolvimento]] — Como adicionar tela, tabela, componente, item de nav

### Telas (campos, filtros, queries, lógica)
- [[01-Projetos/GoMoto/Telas/Telas|Telas]] — Índice com link para cada tela
- [[01-Projetos/GoMoto/Telas/Dashboard|Dashboard]] · [[01-Projetos/GoMoto/Telas/Login|Login]] · [[01-Projetos/GoMoto/Telas/Motos|Motos]] · [[01-Projetos/GoMoto/Telas/Clientes|Clientes]] · [[01-Projetos/GoMoto/Telas/Contratos|Contratos]] · [[01-Projetos/GoMoto/Telas/Cobranças|Cobranças]] · [[01-Projetos/GoMoto/Telas/Fila|Fila]] · [[01-Projetos/GoMoto/Telas/Entradas|Entradas]] · [[01-Projetos/GoMoto/Telas/Despesas|Despesas]] · [[01-Projetos/GoMoto/Telas/Multas|Multas]] · [[01-Projetos/GoMoto/Telas/Manutenção|Manutenção]] · [[01-Projetos/GoMoto/Telas/Processos|Processos]] · [[01-Projetos/GoMoto/Telas/Relatórios|Relatórios]] · [[01-Projetos/GoMoto/Telas/Configurações|Configurações]]

### Operação e negócio
- [[01-Projetos/GoMoto/Fluxos de Negócio|Fluxos de Negócio]] — Locação, manutenção, financeiro, fila, saída de cliente
- [[01-Projetos/GoMoto/Roadmap|Roadmap]] — Próximos passos, backlog, o que está mockado
- [[01-Projetos/GoMoto/Variáveis de Ambiente|Variáveis de Ambiente]] — `.env.local`, `.env.test`, como configurar

### Qualidade e segurança
- [[01-Projetos/GoMoto/Segurança|Segurança]] — CSP, middleware, rate-limiting, hardening
- [[01-Projetos/GoMoto/Testes|Testes]] — Playwright E2E, specs, helpers
- [[01-Projetos/GoMoto/Estado Atual|Estado Atual]] — O que funciona, o que falta, últimos commits

- [[01-Projetos/GoMoto/Claude|Claude]] — Instruções de comportamento para o Claude Code neste projeto

## 🎯 Visão geral
Sistema monolítico full-stack para gerenciar:
- **Frota** — cadastro, manutenção preventiva (13 itens padrão), mapa Leaflet
- **Clientes** — dados cadastrais, histórico, status de pagamento
- **Contratos** — modelos `.docx` + locações vinculando cliente + moto (via Fila)
- **Financeiro** — cobranças, entradas, despesas, multas
- **Operações** — fila de espera, manutenção, processos (Q&A)
- **Dashboard** — KPIs, gráficos Recharts, alertas

## 📊 Perfil atual do negócio
- 5 motos, 4 funcionários, 1 filial
- Operador único (sem multi-tenancy)

## ⚙️ Stack resumida
- [[02-Conhecimento/Next.js|Next.js]] 14.2.35 + TypeScript 5 + TailwindCSS 3.4
- [[02-Conhecimento/Supabase|Supabase]] (PostgreSQL + Auth + Storage) — projeto `hcnxbqunescfanqzmsha`
- Leaflet 1.9, Recharts 3.8, Zod 4.3, Lucide
- Deploy: Vercel (pendente)
