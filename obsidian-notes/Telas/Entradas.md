# 💰 Tela: Entradas — [[GoMoto]]

Rota: `/entradas` | Tipo: Client Component

## Layout

- 3 KPI cards
- Filtros: abas por referência + select de moto + select de mês + busca
- Accordion por tipo de referência

## KPI Cards

| Card | Ícone |
|---|---|
| Total do Mês | TrendingUp |
| Lançamentos no Mês | Calendar |
| Ticket Médio | DollarSign |

Dados filtrados pelo mês selecionado.

## Filtros

| Filtro | Tipo | Valores |
|---|---|---|
| Tipo de Referência | Abas pill | Todas / Caucao / Multa / Proporcional / Outros |
| Moto | Select | "Todas as motos" + lista de placas |
| Mês | Input `type="month"` | YYYY-MM (padrão: mês atual) |
| Busca textual | Input | Em `description`, `lessee`, `reference` |

## Colunas da Tabela

| Coluna | Formatação |
|---|---|
| Data | `formatDate(date)` |
| Placa | Badge monospace |
| Locatário | Texto |
| Período | `formatDate(from) — formatDate(to)` ou "—" |
| Método | Texto |
| Valor | `formatCurrency()` em verde `#BAFF1A` |
| Ações | Edit2 + Trash2 |

## Agrupamento (Accordion)

Por tipo de referência (`REFERENCES_TYPES`): Caucao · Multa · Proporcional · Outros.
Cada grupo exibe: nome, contagem, total em `#BAFF1A`. Grupos vazios não aparecem.

## Formulário de Criação/Edição

| Campo | Tipo | Required | Obs |
|---|---|---|---|
| Descrição | text | ✓ | Ex: "Aluguel semana 10/03 — Placa ABC1234" |
| Tipo de Referência | select | ✓ | Caucao / Multa / Proporcional / Outros (default: Multa) |
| Valor (R$) | number (step=0.01) | ✓ | — |
| Data | date | ✓ | Padrão: hoje |
| Método de Pagamento | select | — | PIX/Dinheiro/Cartão Crédito/Débito/Boleto/Transferência (default: PIX) |
| Vínculo (Placa) | select | ✓ | Ao mudar → dispara `lookupLessee()` automaticamente |
| Locatário | text | ✓ | **Auto-preenchido** via lookup de contrato ativo |
| Observações | textarea | — | — |

### Auto-preenchimento do Locatário

```sql
SELECT customers(name)
FROM contracts
WHERE motorcycle_id = ?
  AND start_date <= ?
  AND (end_date IS NULL OR end_date >= ?)
ORDER BY start_date DESC
LIMIT 1
```

## Queries Supabase

```sql
-- Fetch principal (filtrado por mês)
SELECT * FROM incomes
WHERE date >= 'YYYY-MM-01' AND date <= 'YYYY-MM-31'
ORDER BY date DESC

-- Fetch motos para select
SELECT id, license_plate, model, make FROM motorcycles ORDER BY license_plate

-- Criar
INSERT INTO incomes (vehicle, date, lessee, amount, reference, payment_method, period_from, period_to, observations)

-- Editar
UPDATE incomes SET (...) WHERE id = ?

-- Deletar
DELETE FROM incomes WHERE id = ?
```

## Tags
`#projeto/tela` `#gomoto/financeiro`
