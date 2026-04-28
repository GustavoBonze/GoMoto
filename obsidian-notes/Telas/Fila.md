# 🕐 Tela: Fila de Espera — [[GoMoto]]

Rota: `/fila` | Tipo: Client Component

> Tela mais complexa do sistema. Gerencia candidatos aguardando moto, com fluxo de fechamento de contrato em 5 etapas.

## Layout

- 3 KPI cards (Total na fila, Motos disponíveis, Próximo da fila)
- Alerta laranja se há motos disponíveis E candidatos na fila
- Tabela da fila com 7 colunas + 5 ações por linha

## KPI Cards

| Card | Cálculo |
|---|---|
| Total na Fila | `queueEntries.length` |
| Motos Disponíveis | `COUNT motorcycles WHERE status='available'` |
| Próximo da Fila | Nome do candidato com `position=1` |

**Alerta de Oportunidade:** aparece quando `availableMotosCount > 0 AND fila.length > 0`. Texto em `#BAFF1A`.

## Colunas da Tabela

| Coluna | Conteúdo |
|---|---|
| # | Posição com sufixo "º" em badge |
| Cliente | Nome |
| Telefone | Telefone |
| CNH | Número da CNH |
| Desde | `formatDate(created_at)` |
| Observações | `notes` truncado |
| Ações | ↑ ↓ Edit Fechar-Contrato Remover |

## Botões de Ação (por linha)

| Botão | Condição | Efeito |
|---|---|---|
| ↑ ArrowUp | Desabilitado se position=1 | Modal de reordenação (subir) |
| ↓ ArrowDown | Desabilitado se último | Modal de reordenação (descer) |
| Edit2 | Sempre | Modal de edição completa do candidato |
| CheckCircle2 (Fechar Contrato) | Sempre | Modal de fechamento (5 etapas) |
| Trash2 (Remover) | Sempre | Modal de confirmação de remoção |

---

## Modal: Adicionar à Fila

### Campos Obrigatórios
Nome, CPF, Telefone

### Campos Opcionais
RG, Email, Estado (select UFs, default RJ), Data Nascimento, Endereço, CEP, Contato Emergência, Número CNH, Categoria CNH (A/B/AB/C/D/E), Validade CNH, Observações (textarea 3 linhas)

### Upload de Documentos
- CNH: `.pdf`, `image/*`
- Comprovante de Residência: `.pdf`, `image/*`
- Path Storage: `customers/{customer_id}/cnh_{timestamp}.{ext}`

### Fluxo de Adição (3 etapas)
1. INSERT `customers` (`in_queue=true`, `active=true`)
2. INSERT `queue_entries` (próxima posição)
3. Upload documentos → UPDATE `customers` com URLs

---

## Modal: Alterar Posição na Fila

Mostra: "{Nome} vai SUBIR/DESCER, trocando com {Nome Adjacente}"

**Select de Motivo obrigatório:**

Subir: Possui caução e documentos completos · Aguardando há mais tempo · Necessidade urgente · Resolveu pendências · Preferência por horário · Indicação/prioridade interna

Descer: Documentação incompleta · Caução não disponível · Não compareceu · Desistência temporária · Outro candidato tem prioridade

**Lógica:** swap de posições + notas de auditoria em ambos os registros.

---

## Modal: Fechar Contrato (CRÍTICO)

### Campos

| Campo | Tipo | Obs |
|---|---|---|
| Motocicleta | select (disponíveis) | Ao selecionar → preenche KM inicial com `km_current` |
| Data de Início | date | Padrão: hoje |
| Data de Término | date | Opcional (null = sem termo) |
| Valor Semanal (R$) | number | **Armazena em `monthly_amount`** — NÃO dividir por 4 |
| KM Inicial | number | Pré-preenchido, editável |
| Caução | toggle | Não foi pago / Já foi pago |
| Valor da Caução | number | Condicional (se pago) |
| Forma de Pagamento | select | PIX / DINHEIRO / CARTAO_CREDITO / CARTAO_DEBITO |

### Fluxo de 5 Etapas

1. **Criar Contrato** → INSERT `contracts` (`status='active'`, `observations="KM inicial: {km}"`)
2. **Atualizar Moto** → UPDATE `motorcycles SET status='rented', km_current=?`
3. **Registrar Caução** (se pago) → INSERT `incomes` (`reference='Caucao'`, `date=hoje`)
4. **Remover da Fila** → UPDATE `customers SET in_queue=false` + DELETE `queue_entries`
5. **Reordenar posições** → elimina buracos na fila

> ⚠️ Não há rollback explícito. Se qualquer etapa falhar, o fluxo para e dados podem ficar inconsistentes.

---

## Queries Supabase

```sql
-- Fetch principal
SELECT *, customers(name, phone, drivers_license)
FROM queue_entries ORDER BY position ASC

-- Contagem de disponíveis
SELECT id FROM motorcycles WHERE status='available' (count only)

-- Motos disponíveis para select
SELECT id, license_plate, model, make, km_current
FROM motorcycles WHERE status='available' ORDER BY license_plate

-- Reordenação (swap)
UPDATE queue_entries SET position=?, notes=? WHERE id=?  -- 2x (ambos)

-- Fechar contrato (5 queries sequenciais)
INSERT INTO contracts (...)
UPDATE motorcycles SET status='rented', km_current=? WHERE id=?
INSERT INTO incomes (...) -- opcional (caução)
DELETE FROM queue_entries WHERE id=?
UPDATE customers SET in_queue=false WHERE id=?
```

## Constantes

```typescript
MOVE_UP_REASONS = ['Possui caução e documentos completos', 'Aguardando há mais tempo', ...]
MOVE_DOWN_REASONS = ['Documentação incompleta', 'Caução não disponível', ...]
UFS = ['AC', 'AL', ..., 'TO']  // 27 estados
CNH_CATEGORIES = ['A', 'B', 'AB', 'C', 'D', 'E']
```

## Tags
`#projeto/tela` `#gomoto/fila`
