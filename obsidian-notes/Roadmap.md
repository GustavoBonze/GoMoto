# 🚀 Roadmap — [[GoMoto]]

## Próximos passos (prioridade)

| # | Item | Descrição | Dependências |
|---|---|---|---|
| 1 | **Deploy no Vercel** | Primeiro deploy em produção. Conectar repo GitHub → Vercel. Adicionar env vars no painel. | — |
| 2 | **GitHub Actions CI/CD** | Pipeline: `npm run build` + lint + Playwright em cada PR | Deploy no Vercel |
| 3 | **Resend — emails** | Enviar email quando cobrança vencer. Template de lembrete de manutenção. | Variável `RESEND_API_KEY` |
| 4 | **Sentry** | Capturar erros em produção. Dashboard de incidentes. | Deploy |
| 5 | **Geração de PDF de contrato** | Botão em `/contratos` gera PDF real (atualmente mockado) | Biblioteca de PDF (ex: `pdf-lib`) |
| 6 | **Upstash Redis** | Migrar rate-limit de in-memory para Redis persistente (atual perde em restart) | Conta Upstash |

## Backlog (médio prazo)

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
| PDF de contratos | Botão existe | Integrar biblioteca de geração |
| Geolocalização de motos | Lat/lng simulados no mapa | GPS tracker real |
| Emails transacionais | Settings preparado | Integrar Resend |
| Audit logs | Tabela criada | Triggers ou chamadas no CRUD |
| Assinatura digital | — | Nenhuma integração ainda |

## Tags
`#projeto/roadmap` `#ideia/futuro`
