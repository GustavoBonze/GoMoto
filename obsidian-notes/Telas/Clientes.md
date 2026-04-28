# 👥 Tela: Clientes — [[GoMoto]]

Rota: `/clientes` | Tipo: Client Component

## Layout

- 2 KPI cards (Ativos + Ex-Clientes)
- Barra de filtros: 3 pílulas + dropdown UF + busca
- Tabela com 6 colunas

> ⚠️ **Não há botão "+ Novo Cliente"** — clientes entram via [[Fila]].

## Filtros

| Filtro | Valores |
|---|---|
| Pílulas | Todos / Ativos (`active !== false`) / Ex-Clientes (`active === false`) |
| Dropdown Estado | 27 UFs brasileiras |
| Busca textual | `name`, `cpf`, `phone` (case-insensitive) |

## Colunas da Tabela

| Coluna | Conteúdo |
|---|---|
| Nome | `customer.name` bold |
| CPF | font-mono |
| Telefone | Ícone MessageCircle + link WhatsApp `https://wa.me/55{digits}` (stopPropagation) |
| Moto Atual | Badge `PLACA — MODELO` (brand) ou "—" |
| Status | Badge verde "Ativo" ou vermelho "Ex-Cliente" |
| Ações | Eye, Edit2, Trash2 |

Clicar na linha → abre modal de detalhes.

## Formulário de Edição

Grid 2 colunas (md+):

| Campo | Tipo | Obs |
|---|---|---|
| Nome | text | col-span-2 |
| CPF | text | — |
| RG | text | — |
| Telefone | text | — |
| Email | email | — |
| Estado | select | 27 UFs, default RJ |
| Data de Nascimento | date | — |
| Endereço | text | col-span-2 |
| CEP | text | — |
| Status de Pagamento | text | Ex: "Caução pago" |
| Número CNH | text | — |
| Categoria CNH | select | A / B / AB / C / D / E |
| Validade CNH | date | — |
| Contato de Emergência | text | col-span-2 |
| Observações | textarea | col-span-2 |

Todos opcionais. Mapeamento: `zipCode → zip_code`, `cnh → drivers_license`, etc.

## Modal de Detalhes (Read-Only)

Campos exibidos: Nome, Status, CPF, RG, Telefone, Email, Estado, CEP, Endereço, Nascimento, Emergência, CNH, Categoria, Validade, Status Pagamento, Data Saída, Motivo Saída, Observações.

**Documentos:** Seção condicional com `DocumentThumb` (miniatura com overlay "Ver tamanho original" ao hover → abre URL em nova aba).

## Restrição de Deleção

Antes de deletar: busca contratos com `status = 'active'` para o cliente. Se houver → exibe `alert()` e bloqueia.

## Queries Supabase

```sql
-- Fetch (paralelo)
SELECT * FROM customers WHERE in_queue = false ORDER BY name ASC
SELECT customer_id, motorcycles(license_plate, model) FROM contracts WHERE status = 'active'

-- Checar antes de deletar
SELECT id FROM contracts WHERE customer_id = ? AND status = 'active' LIMIT 1

-- Editar
UPDATE customers SET (...) WHERE id = ?

-- Deletar
DELETE FROM customers WHERE id = ?
```

## Lógica Especial

- **`activeContractsMap`** (Map): `customer_id → { license_plate, model }` — O(1) lookup por cliente
- **WhatsApp:** extrai só dígitos do telefone, monta `wa.me/55{digits}`, abre em nova aba
- Tratamento de `motorcycles` que pode vir como array ou objeto — normaliza para primeiro item

## Tags
`#projeto/tela` `#gomoto/clientes`
