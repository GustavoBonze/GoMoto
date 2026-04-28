# 🔒 Segurança — [[GoMoto]]

## Headers (next.config.mjs)

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: [strict, whitelist Supabase]
```

## Middleware (src/middleware.ts)

- **Rate-limiting:** máx 10 POSTs em `/login` por IP / 15min
- **In-memory:** reset a restart do servidor
- **Proteção de rotas:** sem token → `/login`; com token em `/login` → `/dashboard`
- **Renovação de token:** JWT refresh a cada request

## RLS no Supabase

- ✅ Habilitado em todas as tabelas
- ⚠️ Política atual é permissiva: `FOR ALL TO authenticated USING (true)`
- ⚠️ **Sem isolamento por tenant** — não é SaaS multi-tenant

Ver [[Banco de Dados]] pra detalhes.

## Validação de entrada

- **Zod** em todos os formulários (`src/lib/schemas.ts`)
- Max length de textos, formatos de data (YYYY-MM-DD), ranges numéricos

## Audit logs

- Tabela `audit_logs` criada (user_id, action, table_name, record_id, old_data, new_data)
- ⚠️ Estrutura pronta, mas **não integrada** em todas as operações CRUD

## Gaps conhecidos

1. Rate-limit in-memory (perde em restart) — migrar pra Redis/Upstash
2. RLS sem multi-tenant — atualmente não necessário, mas bloqueador se virar SaaS
3. Audit logs criado mas não populado automaticamente

## Histórico de hardening

Commits relevantes:
- `a91adaf` — auditoria completa + correção de FKs duplicadas
- `2f4165d` — hardening completo pré-produção

## Tags
`#projeto/segurança` `#stack/supabase`
