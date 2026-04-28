# 🗄️ Banco de Dados — [[GoMoto]]

Backend [[Supabase]] (PostgreSQL). Projeto: `hcnxbqunescfanqzmsha`.

## Tabelas (15 no total)

### Core do negócio

| Tabela | Função | Campos-chave |
|---|---|---|
| `motorcycles` | Frota | id, license_plate (UNIQUE), model, make, year, status (available/rented/maintenance/inactive), km_current, photo_url |
| `customers` | Clientes | id, name, cpf (UNIQUE), phone, email, drivers_license, active, in_queue, payment_status |
| `contracts` | Locações | id, customer_id, motorcycle_id, start_date, end_date, monthly_amount, status (active/closed/cancelled/broken), pdf_url |
| `billings` | Cobranças | id, contract_id, customer_id, amount, due_date, status (pending/paid/overdue/loss), payment_date |

### Financeiro

| Tabela | Função |
|---|---|
| `incomes` | Entradas avulsas (placa, data, valor, ref: Semanal/Mensal/Caucao/Multa) |
| `expenses` | Gastos (description, amount, category, motorcycle_id opcional) |
| `fines` | Multas (customer_id, motorcycle_id, amount, responsible: customer/company) |

### Operações

| Tabela | Função |
|---|---|
| `maintenance_items` | 13 itens padrão de manutenção preventiva (km_interval/day_interval) |
| `maintenances` | Histórico de revisões por moto |
| `checklists` | Entrega/devolução (items JSONB + signature_url) |
| `queue_entries` | Fila de espera de clientes |
| `processes` | Base de conhecimento Q&A interna |
| `contract_templates` | Modelos docx de contrato |
| `settings` | Config da empresa (key/value) |

### Auditoria

| Tabela | Função |
|---|---|
| `audit_logs` | Log de ações (user_id, action, table, record_id, old_data, new_data) |

## Relacionamentos principais

```
motorcycles ─┬─< contracts >─── customers
             ├─< maintenances
             ├─< fines >──────── customers
             └─< expenses (opcional)

contracts ──< billings
contracts ──< checklists
customers ──< queue_entries
maintenance_items ──< maintenances
```

## RLS (Row Level Security)

- ✅ **Habilitado em todas as tabelas** (exceto `contract_templates` só-leitura autenticado)
- Política atual: `FOR ALL TO authenticated USING (true) WITH CHECK (true)`
- ⚠️ **Sem segregação por tenant** — adequado pra operador único, precisaria mudança pra SaaS multi-tenant

## Triggers
- `update_updated_at_column()` — BEFORE UPDATE em 9 tabelas (mantém `updated_at` automático)

## Seed data
- 5 motos fictícias (Honda CG 160, Yamaha Factor, Honda Biz, Honda Pop)
- 3 clientes de teste
- 2 contratos ativos
- 13 itens padrão de manutenção preventiva

## Integração com código
- `src/lib/supabase/client.ts` — browser client
- `src/lib/supabase/server.ts` — server client (cookies)
- `src/lib/schemas.ts` — validações Zod espelhando tabelas
- `src/types/index.ts` — types TypeScript dos registros

## Tags
`#projeto/banco` `#stack/supabase`
