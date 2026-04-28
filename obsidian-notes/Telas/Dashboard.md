# 📊 Tela: Dashboard — [[GoMoto]]

Rota: `/dashboard` | Tipo: **Server Component** (assíncrono, sem `'use client'`)

> Única página do sistema que usa RSC — todas as queries rodam no servidor antes de renderizar.

## KPI Cards (4 StatCards)

| Card | Cálculo | Ícone |
|---|---|---|
| **Motos Disponíveis** | `COUNT motorcycles WHERE status='available'` | Bike |
| **Cobranças Vencidas** | `COUNT billings WHERE status='overdue'` + inadimplência % | AlertTriangle |
| **Contratos Vencendo** | `COUNT contracts WHERE status='active' AND end_date BETWEEN hoje e hoje+15d` | CalendarClock |
| **Total a Receber** | `SUM billings.amount WHERE status IN ('pending','overdue')` — mês atual | Wallet |

### Cálculo de Inadimplência %
```javascript
uniqueOverdueCustomers / activeClientsCount * 100
// uniqueOverdueCustomers = customer_ids distintos com cobranças 'overdue'
// activeClientsCount = COUNT customers WHERE active=true
```

## Alertas de Risco (acima dos KPIs)

### Motos Ociosas
- Critério: `status='available' AND updated_at <= 7 dias atrás`
- Exibe até 3 motos: `"{license_plate} parada há 7+ dias"`
- Visual: borda `#e65e24`, fundo `#3a180f`

### Clientes com Múltiplas Cobranças Vencidas
- Critério: customer_ids com 2+ registros `status='overdue'`
- Visual: borda `#ff9c9a`, fundo `#7c1c1c`

## 5 Widgets (grid `grid-cols-2 lg:grid-cols-5`)

### Widget 1 — Contratos Ativos
```sql
SELECT id, monthly_amount, end_date, customers(name), motorcycles(model, make, license_plate)
FROM contracts WHERE status='active' ORDER BY created_at DESC LIMIT 5
```
Exibe: nome cliente + placa + valor. Link → `/contratos`

### Widget 2 — Cobranças Vencidas
```sql
SELECT id, amount, due_date, customers(name)
FROM billings WHERE status='overdue' ORDER BY due_date ASC LIMIT 5
```
Exibe: nome + valor vermelho + dias em atraso (`Math.floor((now - dueDate) / 86400000)`). Link → `/cobrancas`

### Widget 3 — Fila de Espera
```sql
SELECT id, created_at, position, customers(name)
FROM queue_entries ORDER BY created_at ASC LIMIT 5
```
Exibe: posição em badge `#BAFF1A` + nome + dias na fila. Link → `/fila`

### Widget 4 — Manutenções Agendadas
```sql
SELECT id, scheduled_date, type, motorcycles(model, make, license_plate)
FROM maintenances WHERE completed=false AND scheduled_date >= hoje ORDER BY scheduled_date ASC LIMIT 5
```
Cores por tipo: preventive `#BAFF1A` · corrective `#ff9c9a` · inspection `#a880ff`. Link → `/manutencao`

### Widget 5 — Top Clientes por Receita
```sql
SELECT customer_id, amount, customers(name) FROM billings WHERE status='paid'
-- Agrupa por customer_id, soma amount, ordena DESC, top 5
```
Exibe: posição em badge + nome + total. Link → `/clientes`

## Gráficos (via `<DashboardCharts />`)

### Gráfico 1 — Receita × Despesas (AreaChart — Recharts)
- **Período:** últimos 6 meses (`now - 5 meses` até fim do mês atual)
- **Dados:** SUM incomes.amount e SUM expenses.amount por mês
- **Visual:** área `#BAFF1A` (receita) e `#a880ff` (despesas), gradient 15%→0%, strokeWidth=2
- **Eixo Y:** `formatCurrencyShort()` — se ≥1000 → `R$Xk`, senão `R$X`
- **Grid:** `stroke="#323232"`, vertical=false
- **Tooltip:** bg `#2a2a2a`, border `#474747`, rounded 8px

### Gráfico 2 — Cobranças do Mês (BarChart — Recharts)
- **Dados:** billings do mês atual agrupados por status → `{ status: 'Pago'|'Pendente'|'Vencido', count }`
- **Cores:** Pago `#28b438` · Pendente `#BAFF1A` · Vencido `#ff9c9a`
- **Barras:** radius `[4,4,0,0]` (topo arredondado)

## Todas as Queries do Dashboard (14 ao todo)

| Tabela | Filtro | Para que |
|---|---|---|
| motorcycles | status='available' (count) | KPI disponíveis |
| motorcycles | status='rented' (count) | Subtítulo alugadas |
| motorcycles | status='maintenance' (count) | Subtítulo manutenção |
| customers | active=true (count) | Cálculo inadimplência |
| billings | status='overdue' | KPI + alertas + widget |
| contracts | status='active' LIMIT 5 | Widget contratos |
| billings | status='overdue' LIMIT 5 | Widget vencidas |
| maintenances | completed=false, scheduled_date>=hoje LIMIT 5 | Widget manutenção |
| queue_entries | LIMIT 5 | Widget fila |
| motorcycles | status='available', updated_at<=7d LIMIT 3 | Alerta ociosas |
| billings | status='paid' | Top clientes |
| incomes | date>=6meses | Gráfico receita |
| expenses | date>=6meses | Gráfico despesas |
| billings | due_date=mês atual | Gráfico status |

## Tags
`#projeto/tela` `#gomoto/dashboard`
