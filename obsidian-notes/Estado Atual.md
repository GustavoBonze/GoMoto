# 📊 Estado Atual — [[GoMoto]]

Snapshot em **2026-04-21**.

## ✅ Funcionando end-to-end

- Autenticação (login/logout via Supabase)
- Dashboard com KPIs e gráficos Recharts
- CRUD completo de motos (com mapa Leaflet)
- CRUD completo de clientes (com filtros, WhatsApp)
- CRUD de contratos (com joins customer+motorcycle)
- CRUD de cobranças (com cálculo de atraso)
- CRUD de entradas, despesas, multas
- Fila de espera com botão "oferecer contrato"
- Manutenção (bootstrap automático ao criar moto + registro manual)
- Processos (Q&A interno com ordenação)
- Configurações da empresa

Ver [[Telas]] para documentação detalhada de cada rota.

## ⚠️ Mockado / incompleto

| Item | Situação |
|---|---|
| PDF de contratos | Botão existe, mas não gera arquivo real |
| Geolocalização de motos | Lat/lng simulados no mapa; GPS real comentado como "futuro" |
| Emails transacionais | Settings preparado, mas não envia |
| Webhooks/notificações | Não implementado |
| Audit logs | Tabela criada, mas não populada automaticamente |

## 🐛 Bugs conhecidos

Nenhum bug crítico aberto. Últimos fixes:
- `8b1d243` — z-index do Leaflet contido com `isolation: isolate`
- `7f2ce87` — entradas e processos integrados com Supabase

## 🚀 Roadmap imediato (ordem sugerida)

1. **Deploy no Vercel** — primeiro deploy em produção
2. **GitHub Actions** — CI/CD (build + lint + playwright)
3. **Resend** — emails de cobrança vencida, lembretes de manutenção
4. **Sentry** — monitoramento de erros em produção
5. **Geração de PDF** — completar contratos
6. **Upstash Redis** — migrar rate-limit de in-memory pra persistente

## 📈 Métricas de build

- `npm run build` sem erros
- Dev server: `http://localhost:3000`
- Projeto Supabase: `hcnxbqunescfanqzmsha`

## Últimos commits relevantes

| Commit | Mensagem |
|---|---|
| `a91adaf` | security: auditoria completa + correção de FKs duplicadas |
| `5c6240c` | style: padronização completa do design system |
| `7f2ce87` | fix(integrations): corrige entradas e integra processos |
| `2f4165d` | security: hardening completo pré-produção |

## Tags
`#projeto/estado` `#projeto/ativo`
