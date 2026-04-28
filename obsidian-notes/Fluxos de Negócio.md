# ⚙️ Fluxos de Negócio — [[GoMoto]]

Principais processos operacionais da locadora mapeados no sistema.

## Fluxo de Locação

```
1. Cliente entra na fila (/fila)
        ↓
2. Operador vê moto disponível + cliente aguardando
        ↓
3. Clica "Oferecer Contrato" → cria registro em contracts
   - customer_id + motorcycle_id
   - start_date, end_date, monthly_amount
   - status: 'active'
        ↓
4. Moto muda status: available → rented
   Customer: in_queue → false, active → true
        ↓
5. Cobranças geradas em billings (por semana ou mês)
   due_date definida conforme periodicidade
        ↓
6. Cliente paga → billing.status: pending → paid
   Operador registra também em incomes (entrada avulsa)
        ↓
7. Contrato encerrado → status: active → closed/broken/cancelled
   Moto muda: rented → available (ou maintenance)
```

**Tabelas envolvidas:** `contracts`, `motorcycles`, `customers`, `billings`, `incomes`

---

## Fluxo de Manutenção

```
1. Ao cadastrar moto (wizard passo 2):
   - Operador informa último KM/data de cada um dos 13 itens padrão
   - Sistema calcula: próxima manutenção = último + intervalo do item
   - Cria registros em maintenances (scheduled, completed: false)

2. Manutenção vence (data ou KM atingido)
   - Aparece em /manutencao com alerta visual
   - Dashboard exibe nas "manutenções agendadas"

3. Operador registra revisão realizada:
   - Preenche actual_km, cost, workshop, completed_date
   - Upload de foto do odômetro + nota fiscal
   - Sistema marca completed: true
   - Cria novo agendamento para o próximo ciclo
```

**Tabelas envolvidas:** `maintenance_items`, `maintenances`, `motorcycles`

---

## Fluxo Financeiro

### Receitas
- **Entrada via contrato:** cobrança em `billings` → quando paga, registrar em `incomes`
- **Entrada avulsa:** direto em `incomes` (placa, valor, referência)
- **Referências comuns:** Semanal, Mensal, Caução, Multa

### Despesas
- Registradas em `expenses` com categoria
- Opcionalmente vinculadas a uma moto (`motorcycle_id`) para rastrear custo por frota
- Categorias típicas: Manutenção, Combustível, Seguro, Administrativo

### Multas
- Registradas em `fines` com `responsible: 'customer' | 'company'`
- Se responsabilidade do cliente → cobrança repassada

**Dashboard consolida:**
- Total a receber (billings pending + overdue do mês)
- Inadimplência (overdue / total cobranças)
- Receita vs Despesa (gráfico Recharts últimos 6 meses)

---

## Fluxo de Fila

```
1. Cliente interessado entra na fila (/fila)
   - Criado registro em queue_entries
   - customer.in_queue = true

2. Aparece na lista ordenado por posição

3. Ao oferecer contrato:
   - queue_entry é removida
   - Contrato criado (ver fluxo de locação)

4. Se cliente desistir → remover da fila
```

**Tabelas:** `queue_entries`, `customers`

---

## Fluxo de Saída de Cliente

```
1. Contrato encerrado (closed/broken/cancelled)
2. Checklist de devolução criado em checklists (type: 'return')
   - Odômetro atual, nível de combustível, itens verificados
   - Assinatura digital (em breve)
3. customer.active = false
4. customer.departure_date + departure_reason registrados
5. Moto volta para available (ou maintenance se necessário)
```

**Tabelas:** `contracts`, `checklists`, `customers`, `motorcycles`

---

## Checklist de Entrega/Devolução

Tabela `checklists` com campo `items` (JSONB):

```json
{
  "farol": true,
  "espelhos": true,
  "pneus": true,
  "freios": true,
  "buzina": true,
  "documentos": false
}
```

- `type: 'delivery'` → ao entregar a moto para o cliente
- `type: 'return'` → ao receber a moto de volta

---

## KPIs do Dashboard

| KPI | Cálculo |
|---|---|
| Motos disponíveis | `motorcycles.count WHERE status = 'available'` |
| Motos alugadas | `motorcycles.count WHERE status = 'rented'` |
| Clientes ativos | `customers.count WHERE active = true` |
| Cobranças vencidas | `billings.count WHERE status = 'overdue'` |
| Taxa de inadimplência | `overdue / (pending + overdue + paid) × 100` |
| Total a receber | `SUM(billings.amount) WHERE status IN ('pending', 'overdue')` |
| Contratos vencendo em 15 dias | `contracts WHERE end_date BETWEEN hoje e hoje+15` |

## Tags
`#projeto/negócio` `#projeto/processos`
