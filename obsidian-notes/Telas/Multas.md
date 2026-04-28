# 🚨 Tela: Multas — [[GoMoto]]

Rota: `/multas` | Tipo: Client Component

## Layout

- 5 KPI cards
- Filtros: abas de status + select de moto + busca
- Accordion por moto com histórico colapsável

## KPI Cards

| Card | Ícone | Cor |
|---|---|---|
| Total (todas) | FileText | — |
| Pendentes (contagem + valor) | Clock | roxo |
| Vencidas (contagem + valor) | AlertTriangle | vermelho |
| A vencer em 7d | Calendar | laranja |
| Pagas no mês | CheckCircle2 | verde |

## Filtros

| Filtro | Valores |
|---|---|
| Status | all / overdue / due_soon / pending / paid |
| Moto | Select de placas |
| Busca | Em `description` + `customers.name` |

## Status Dinâmico (calculado no cliente)

```javascript
function calcFineStatus(fine):
  if paid → 'paid'
  if due_date < hoje → 'overdue'
  if due_date - hoje <= 7 dias → 'due_soon'
  else → 'pending'
```

## Agrupamento (Accordion por Moto)

Cabeçalho exibe: ponto colorido de urgência + placa bold monospace + marca/modelo + KM atual + badges "X vencida(s)" / "X a vencer" + total pendente em vermelho.

Dentro: tabela de pendentes + toggle "Ver histórico (X pagas)".

## Colunas da Tabela (Pendentes)

| Coluna | Conteúdo |
|---|---|
| Infração | Descrição bold + obs + cliente em smaller |
| Data / Vencimento | Data infração + "Venc:" em vermelho se vencida |
| Valor | `formatCurrency()` em vermelho `#ff9c9a` |
| Responsável | Badge "Cliente" (roxo) ou "Empresa" (neutro) |
| Status | Badge computado via `calcFineStatus()` |
| Ações | Edit2, CheckCircle (marcar paga), Trash2 |

## Formulário de Criação/Edição

| Campo | Tipo | Required | Obs |
|---|---|---|---|
| Cliente | select | ✓ | Auto-vincula moto via contrato ativo |
| Moto | select | ✓ | Auto-vincula cliente via contrato ativo |
| Infrações Comuns | select quickfill | — | 12 infrações pré-cadastradas do CTB com valores |
| Descrição | text | ✓ | Editável mesmo após quickfill |
| Data da Infração | date | ✓ | — |
| Data de Vencimento | date | — | Opcional |
| Valor (R$) | number | ✓ | Pré-preenchido pelo quickfill |
| Responsável | select | — | customer / company |
| Observações | textarea | — | AIT nº, local, recurso em andamento... |

### Auto-vinculação Cliente ↔ Moto

Ao selecionar cliente → busca contrato ativo → preenche moto. Ao selecionar moto → preenche cliente. Usa: `SELECT customer_id, motorcycle_id FROM contracts WHERE status='active'`.

## Modal: Marcar como Paga

- Pré-preenche data com hoje
- Salva: `status='paid'`, `payment_date={data}`

## Queries Supabase

```sql
-- Fetch principal
SELECT *, customers(name, phone), motorcycles(license_plate, model, make)
FROM fines ORDER BY infraction_date DESC

-- Clientes e motos para selects
SELECT id, name FROM customers WHERE active = true ORDER BY name
SELECT id, license_plate, model, make FROM motorcycles ORDER BY license_plate
SELECT customer_id, motorcycle_id FROM contracts WHERE status = 'active'

-- Criar
INSERT INTO fines (customer_id, motorcycle_id, description, infraction_date, due_date, amount, responsible, status, observations)

-- Marcar paga
UPDATE fines SET status='paid', payment_date=? WHERE id=?

-- Deletar
DELETE FROM fines WHERE id=?
```

## Tags
`#projeto/tela` `#gomoto/financeiro`
