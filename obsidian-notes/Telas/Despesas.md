# 📉 Tela: Despesas — [[GoMoto]]

Rota: `/despesas` | Tipo: Client Component

## Layout

- 4 KPI cards
- Filtros: abas por categoria + select de mês + busca
- Accordion por categoria

## KPI Cards

| Card | Ícone |
|---|---|
| Total do Mês | TrendingDown |
| Lançamentos | Receipt |
| Ticket Médio | Activity |
| Maior Categoria | Tag (nome da categoria com maior gasto) |

## Filtros

| Filtro | Tipo |
|---|---|
| Categoria | Abas pill dinâmicas + "Todas" |
| Mês | Input `type="month"` |
| Busca textual | Em `description` + `observations` |

## Colunas da Tabela

| Coluna | Conteúdo |
|---|---|
| Data | `formatDate(date)` |
| Descrição | Texto bold + badges de status (Sem NF em laranja) + links de arquivo |
| Valor | `formatCurrency()` em **vermelho** `#ff9c9a` |
| Ações | Edit2 + Trash2 |

## Agrupamento (Accordion)

Por categoria (`EXPENSE_CATEGORIES`): Manutenção · Combustível · Aluguel · Salário · Impostos · Seguro · Marketing · Outros.
Total de cada grupo em **vermelho** (ao contrário das entradas que são verdes).

Badge **"Sem NF"** em laranja/vermelho quando `!invoice_url`.

## Formulário de Criação/Edição

| Campo | Tipo | Required | Obs |
|---|---|---|---|
| Descrição | text | ✓ | — |
| Valor (R$) | number (step=0.01) | ✓ | — |
| Data | date | ✓ | Padrão: hoje |
| Categoria | select | ✓ | 8 opções |
| Vínculo (Moto) | select | — | "Empresa (despesa geral)" ou moto específica |
| Observações | textarea | — | — |
| Nota Fiscal | file | — | `.pdf,.jpg,.jpeg,.png,.webp` — aviso se não anexado |
| Arquivo Adicional | file | — | Mesmo accept |

### Aviso de Nota Fiscal

Se tentar salvar sem NF → exibe banner laranja + checkbox de confirmação. Bloqueia até confirmar.

### Upload de Arquivos

- Bucket: `expense-files`
- Path: `expenses/invoice_{Date.now()}_{random}.{ext}`
- Retorna URL pública via `getPublicUrl()`
- Remoção remove apenas referência local (não deleta do Storage)

## Queries Supabase

```sql
-- Fetch principal
SELECT * FROM expenses ORDER BY date DESC

-- Fetch motos
SELECT id, license_plate, model FROM motorcycles ORDER BY license_plate

-- Criar
INSERT INTO expenses (description, amount, date, category, motorcycle_id, observations, invoice_url, attachment_url)

-- Editar
UPDATE expenses SET (...) WHERE id = ?

-- Deletar
DELETE FROM expenses WHERE id = ?
```

## Tags
`#projeto/tela` `#gomoto/financeiro`
