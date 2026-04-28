# 📚 Tela: Processos — [[GoMoto]]

Rota: `/processos` | Tipo: Client Component

> Base de conhecimento interno em formato FAQ/accordion. Permite criar, editar, ordenar e excluir perguntas e respostas por categoria.

## Estrutura de Dados

```typescript
interface Process {
  id: string
  question: string
  answer: string
  category: string  // uma das 7 categorias fixas
  order: number     // posição dentro da categoria
  created_at: string
  updated_at: string
}
```

## Categorias Fixas (7)

| Categoria | Cor de Badge |
|---|---|
| Locação | brand (`#BAFF1A`) |
| Cobrança | warning (laranja) |
| Manutenção | info (roxo) |
| Documentação | success (verde) |
| Plano Fidelidade | danger (vermelho) |
| Procedimentos Internos | info (roxo) |
| Geral | muted (cinza) |

## Filtros

- **Abas por categoria** (com "Todas" como padrão) — ativa/inativa com borda inferior `#BAFF1A`
- **Busca textual** em `question` + `answer` (case-insensitive)

## Layout: Accordion por Categoria

Cada categoria exibe:
- Header: badge colorido + contagem de itens
- Por processo:
  - **Header sempre visível:** pergunta + badge "Interno" (se Procedimentos Internos) + botões Edit + Delete + chevron
  - **Body expansível:** resposta em `whitespace-pre-wrap` (preserva quebras de linha)

## Formulário de Criação/Edição (Modal "lg")

| Campo | Tipo | Required |
|---|---|---|
| Categoria | select (7 opções) | ✓ |
| Pergunta | input text | ✓ |
| Resposta | textarea (5 linhas) | ✓ |

## Queries Supabase

```sql
-- Fetch
SELECT * FROM processes ORDER BY order ASC

-- Criar
INSERT INTO processes (question, answer, category, order, created_at, updated_at)
-- order = processes.length + 1

-- Editar
UPDATE processes SET question=?, answer=?, category=?, updated_at=now() WHERE id=?

-- Deletar
DELETE FROM processes WHERE id=?
```

## Lógica de Agrupamento

```typescript
// 1. Filtrar por categoria + busca
filteredProcesses = processes.filter(p =>
  matchesCategory && matchesSearch
)

// 2. Agrupar mantendo ordem das categorias fixas
groupedProcesses = categories.reduce((acc, cat) => {
  const items = filteredProcesses.filter(p => p.category === cat)
  if (items.length > 0) acc[cat] = items
  return acc
}, {})
```

## Tags
`#projeto/tela` `#gomoto/processos`
