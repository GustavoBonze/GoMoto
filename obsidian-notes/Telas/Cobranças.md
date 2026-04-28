# 💳 Tela: Cobranças — [[GoMoto]]

Rota: `/cobrancas` | Tipo: Client Component

## Layout

- 6 KPI cards financeiros
- Abas de filtro (5 status)
- Busca textual
- Tabela com 7 colunas + ações especiais

## Abas de Filtro

`Todas` / `Pendentes` / `Vencidas` / `Pagas` / `Prejuízo` — cada uma com contador.

## Busca Textual

Em `customers.name` e `description` (case-insensitive).

## Colunas da Tabela

| Coluna | Conteúdo |
|---|---|
| Cliente | Nome + ícone WhatsApp (`wa.me/55{phone}`) |
| Descrição | Texto da cobrança |
| Valor | `formatCurrency(amount)` |
| Vencimento | `formatDate(due_date)` |
| Status | `<StatusBadge />` |
| Dt. Pagamento | `formatDate(payment_date)` ou "—" |
| Ações | Editar, Marcar Pago, Prejuízo, Excluir |

## Ações Especiais

**Marcar como Pago** (aparece se `pending` ou `overdue`):
- Modal com select de método: PIX / Dinheiro / Cartão de Crédito / Cartão de Débito / Transferência
- Salva: `status='paid'`, `payment_date=hoje`, concatena método nas `observations`

**Contabilizar como Prejuízo** (aparece se `pending` ou `overdue`):
- Modal de confirmação com aviso em vermelho
- Salva: `status='loss'`

## Formulário de Criação/Edição

| Campo | Tipo | Required |
|---|---|---|
| Cliente | select (clientes ativos) | ✓ |
| Contrato | select (contratos do cliente selecionado) | — |
| Descrição | text | ✓ (Ex: "Semanal — 10/03 a 16/03") |
| Valor (R$) | number (step=0.01) | ✓ |
| Vencimento | date | ✓ |
| Observações | textarea (2 linhas) | — |

Status inicia sempre como `pending` na criação.

## 6 KPI Cards (useMemo)

| Card | Cálculo |
|---|---|
| **Total Recebido** | SUM(amount) WHERE paid + ticket médio |
| **A Receber** | SUM(amount) WHERE pending + valor vencendo em 30d |
| **Vencidas** | SUM(amount) WHERE overdue + cobrança mais antiga (cliente + dias) |
| **Inadimplência** | `(overdue+loss) / total × 100` + pontualidade (paid on time %) |
| **Valores Não Pagos** | pending + overdue + tempo médio de recebimento |
| **Prejuízos** | SUM(amount) WHERE loss + maior prejuízo por cliente |

## Queries Supabase

```sql
-- Fetch principal
SELECT *, customers(name, phone), contracts(id)
FROM billings ORDER BY due_date DESC

-- Selects do formulário
SELECT id, name FROM customers WHERE active = true ORDER BY name
SELECT id, customer_id, customers(name) FROM contracts WHERE status = 'active'

-- Criar
INSERT INTO billings (customer_id, contract_id, description, amount, due_date, status, observations)

-- Editar
UPDATE billings SET (...) WHERE id = ?

-- Marcar pago
UPDATE billings SET status='paid', payment_date=?, observations=? WHERE id = ?

-- Prejuízo
UPDATE billings SET status='loss' WHERE id = ?

-- Deletar
DELETE FROM billings WHERE id = ?
```

## Lógica de Negócio

- Cálculo de atraso: `Math.floor((today - new Date(due_date)) / 86400000)` dias
- Observações de método são **cumulativas** (concatena com `\n` ao marcar pago)
- `filtered` e `metrics` em useMemo para performance

## Tags
`#projeto/tela` `#gomoto/cobrancas`
