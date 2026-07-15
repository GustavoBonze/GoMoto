---
tags: [projeto/gomoto, projeto/tela, gomoto/manutencao]
---

# 🔧 Tela: Manutenção — [[GoMoto]]

> Projeto: [[GoMoto]]

Rota: `/manutencao` | Tipo: Client Component

## Layout

- 5 KPI cards
- Filtros: abas de status + select de moto + select de tipo + busca
- Accordion por moto: pendentes visíveis + histórico colapsável

## KPI Cards

| Card | Cor |
|---|---|
| Vencidas | vermelho `#ff9c9a` |
| Próximas | laranja `#e65e24` |
| Agendadas | roxo `#a880ff` |
| Realizadas no mês | verde |
| Custo do Mês (R$) | — |

## Filtros

| Filtro | Valores |
|---|---|
| Status | all / overdue / upcoming / scheduled / completed |
| Moto | Select de placas |
| Tipo | all / preventive / corrective / inspection |
| Busca | Em `description`, `license_plate`, `model`, `make` |

## Status Dinâmico (`calcularStatus()`)

```javascript
if completed → 'completed'
if predicted_km <= km_current → 'overdue'
if km_current >= predicted_km - (10% do intervalo) → 'upcoming'
if scheduled_date < hoje → 'overdue'
if data <= 18 dias → 'upcoming'
else → 'scheduled'
```

## Agrupamento (Accordion por Moto)

Cabeçalho: ponto colorido + placa bold monospace + marca/modelo + KM atual + badges de contagem por status.

Dentro: tabela de pendentes + toggle de histórico (slice 5 quando colapsado, opacidade 70%).

## Colunas da Tabela (Pendentes)

| Coluna | Conteúdo |
|---|---|
| Item | Descrição bold + `<StatusBadge>` (preventive/corrective/inspection) |
| Previsão | KM previsto ou data agendada |
| Situação | Texto computado: "Vencida há X km" / "Faltam X km" / "Vence em X dias" |
| Status | Badge: Vencida / Próxima / Agendada / Concluída |
| Ações | CheckCircle2 (conclusão), Trash2 — **itens concluídos só têm Eye (visualização)** |

> ⚠️ O botão de editar foi removido dos itens concluídos. Apenas visualização (somente leitura).

## Formulário de Criação/Edição

| Campo | Tipo | Required | Obs |
|---|---|---|---|
| Motocicleta | select | ✓ | — |
| Tipo | readonly | — | Sempre "Corretiva" (não editável) |
| Descrição | text | ✓ | — |
| Data Agendada | date | — | — |
| KM no Serviço | number | — | — |
| Custo (R$) | number (step=0.01) | — | — |
| Oficina / Mecânico | text | — | — |
| Data de Conclusão | date | Condicional | Aparece apenas se `completed=true` |
| Marcar como concluída | checkbox | — | Auto-preenche `completed_date=hoje` |
| Observações | textarea (2 linhas) | — | — |

## Modal de Conclusão (2 Etapas)

### Etapa 1: Coleta Base
- KM odômetro, Data conclusão, Oficina, Observações
- **Preview de próximas manutenções:** timeline calculada dos itens que serão agendados
- **Sugestão inteligente:** banner com itens irmãos pendentes/vencidos desta moto → checkbox para incluir na mesma conclusão

### Etapa 2: Detalhamento Financeiro
Por item sendo concluído:
- Toggle de responsabilidade: `split` (50/50 — padrão) / `company` / `customer`
- Custo em R$
- **Upload real de fotos** via caixas de upload (ícone + nome do arquivo após seleção):
  - **KM** (câmera) → `odometer_photo_url` — foto do painel/odômetro
  - **NF** (arquivo) → `invoice_photo_url` — nota fiscal ou recibo
- Preview: "Empresa: R$X / Cliente: R$X"
- ⚠️ **Alerta laranja** ao confirmar sem fotos: exige campo Observações com mínimo de 30 caracteres

Resumo consolidado + checkbox de confirmação (se há split).

### Upload de Fotos (Server Action)
- Função: `uploadMaintenancePhoto(formData, prefix)` em `actions.ts`
- Bucket: `maintenance-files` (público, `service_role` — sem policies RLS)
- Path: `maintenance/{prefix}_{timestamp}_{random}.{ext}`
  - `prefix = 'km'` para odômetro, `prefix = 'nf'` para nota fiscal
- Salvo em `maintenances.odometer_photo_url` e `maintenances.invoice_photo_url`

### Ícones Clicáveis na Grid
Após conclusão, os ícones de câmera/NF na listagem tornam-se links (`target="_blank"`) que abrem a foto em nova aba.

## Modal de Visualização (Somente Leitura)

Aberto pelo botão Eye nos itens concluídos. Exibe:
- Todos os dados do registro
- Breakdown de custo: Empresa / Cliente / Total (baseado em `responsibility`)
- Miniaturas das fotos com **hover overlay** para ampliar

## Auto-agendamento Após Conclusão

```javascript
const STANDARD_INTERVALS = {
  'Troca de óleo': { interval_km: 1000 },
  'Vistoria mensal': { interval_days: 30 },
  // ... 27 entradas
}
// próxima = actualKm + interval_km (ou hoje + interval_days)
INSERT INTO maintenances (novo agendamento)
UPDATE motorcycles SET km_current = ? WHERE id = ?
```

## Botão Extra: "Atualizar KM"

Modal específico no header: select de moto + input KM. Só atualiza `motorcycles.km_current`.

## Queries Supabase

```sql
-- Fetch principal
SELECT *, motorcycles(license_plate, model, make, km_current)
FROM maintenances ORDER BY created_at DESC

-- Motos
SELECT id, license_plate, model, make, km_current FROM motorcycles ORDER BY license_plate

-- Contrato ativo da moto (ao iniciar conclusão)
SELECT contract_type, next_billing_date, customers(name)
FROM contracts WHERE motorcycle_id = ? AND status = 'active' LIMIT 1

-- Irmãos pendentes
SELECT *, motorcycles(...)
FROM maintenances WHERE motorcycle_id = ? AND completed = false AND id != ?

-- Conclusão
UPDATE maintenances SET completed=true, completed_date=?, actual_km=?, cost=?, workshop=?,
  responsibility=?, odometer_photo_url=?, invoice_photo_url=? WHERE id=?
INSERT INTO maintenances (...) -- novo agendamento
UPDATE motorcycles SET km_current = ? WHERE id = ?
```
