---
tags: [projeto/gomoto, projeto/roadmap, ideia/futuro]
updated: 2026-07-15
---

# 🚀 Roadmap — [[GoMoto]]

> Projeto: [[GoMoto]]

## Próximos passos (prioridade)

| # | Item | Descrição | Dependências |
|---|---|---|---|
| 1 | **Filtro da tela de clientes** | Remover filtro por estado (todos são do RJ). Substituir por filtro de status (ativo, inadimplente, encerrado) ou outros filtros relevantes ao negócio. | — |
| 2 | ~~**Contratos — templates com variáveis**~~ ✅ **Concluído em 2026-05-27** (commit `bd419d8`) | Gestão de modelos `.docx` no modal, geração de DOCX preenchido (docxtemplater + pizzip) e upload de contrato assinado. Ver [[01-Projetos/GoMoto/Telas/Contratos|Contratos]]. | — |
| 3 | **Cobranças — integração de pagamento** | Integrar InfinitPay ou Mercado Pago. Gerar link/QR Code de cobrança, registrar status de pagamento (pago, pendente, vencido), webhook de confirmação. | Conta InfinitPay/MP |
| 4 | **Motos — rastreamento no mapa** | Integrar sistema de monitoramento GPS real. Exibir no mapa: marker da localização atual de cada moto + marker da casa de cada cliente. | GPS tracker API |
| 5 | **Relatórios** | Painel de relatórios por período: receita (mês/ano/moto), despesas (mês/ano/mês), saldo atual, contratos ativos com listagem, cobranças pendentes, prejuízos contabilizados, multas (mês/ano/moto). | Dados históricos |
| 6 | **Deploy no Vercel** | Primeiro deploy em produção. Conectar repo GitHub → Vercel. Adicionar env vars no painel. | — |
| 7 | **GitHub Actions CI/CD** | Pipeline: `npm run build` + lint + Playwright em cada PR. | Deploy no Vercel |
| 8 | **Resend — emails** | Enviar email quando cobrança vencer. Template de lembrete de manutenção. | `RESEND_API_KEY` |
| 9 | **Sentry** | Capturar erros em produção. Dashboard de incidentes. | Deploy |
| 10 | **Upstash Redis** | Migrar rate-limit de in-memory para Redis persistente. | Conta Upstash |

## Backlog (médio prazo)

- ~~**Encerrar contrato ativo**~~ ✅ **Concluído** — fluxo de encerramento em 3 etapas na tela de Contratos (cliente: multa R$ 1.000 / empresa: motivo ≥ 50 chars), libera a moto e registra `end_date`. Ver [[01-Projetos/GoMoto/Telas/Contratos|Contratos]].

- **Assinatura digital de contratos** — DocuSign ou similar
- **Notificações push / SMS** — alertas de vencimento para operador
- **Integração bancária** — reconciliação automática de PIX/boleto
- **Painel mobile responsivo** — layout otimizado para celular do operador em campo
- **Exportação de relatórios** — CSV / Excel de cobranças, despesas, receitas
- **Audit logs automatizados** — triggers no Supabase para `audit_logs` (estrutura já existe)
- **Geolocalização real de motos** — integrar GPS tracker via API

## Longo prazo / Experimental

- **Multi-tenancy** — isolar dados por empresa para virar SaaS (RLS já preparada)
- **App mobile nativo** — React Native / Expo
- **IA para análise de inadimplência** — score de risco por cliente
- **Cálculo automático de seguro** — taxa de gerenciamento sobre FIPE

## O que está mockado hoje

| Feature | Status | O que falta |
|---|---|---|
| Filtro de clientes | Filtro por estado (sem sentido — todos são RJ) | Substituir por filtro de status/tipo |
| ~~PDF de contratos~~ | ✅ Resolvido — geração de DOCX preenchido implementada (2026-05-27) | — |
| ~~Templates de contrato `.docx`~~ | ✅ Resolvido — upload + docxtemplater implementados (2026-05-27) | — |
| Geolocalização de motos | Lat/lng simulados no mapa | GPS tracker real + markers de casas de clientes |
| Cobranças | Listagem manual | Integração InfinitPay ou Mercado Pago |
| Relatórios | — | Tela completa de relatórios por período/moto |
| Emails transacionais | Settings preparado | Integrar Resend |
| Audit logs | Tabela criada | Triggers ou chamadas no CRUD |
| Assinatura digital | — | Nenhuma integração ainda |
