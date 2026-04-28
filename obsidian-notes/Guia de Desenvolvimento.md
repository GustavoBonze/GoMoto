# 🛠️ Guia de Desenvolvimento — [[GoMoto]]

Referência para adicionar qualquer coisa nova ao sistema sem quebrar o que existe.

---

## Como adicionar uma nova tela

1. Criar `src/app/(dashboard)/nome-da-rota/page.tsx`
2. Adicionar `'use client'` no topo (CRUD usa estado local)
3. Importar `createClient` de `@/lib/supabase/client`
4. Usar o padrão de estado padrão (ver abaixo)
5. Adicionar item de nav no `src/components/layout/Sidebar.tsx` em `NAV_ITEMS`
6. Criar nota em `01-Projetos/GoMoto/Telas/NomeDaTela.md` documentando a tela

### Padrão de estado (Client Component)
```typescript
'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NovaTelaPage() {
  const [data, setData]       = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [search, setSearch]   = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState<T | null>(null)
  const [form, setForm]             = useState<FormType>(defaultForm)
  const [saving, setSaving]         = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error } = await supabase.from('tabela').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setData(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = useMemo(() =>
    data.filter(item => item.campo.toLowerCase().includes(search.toLowerCase())),
    [data, search]
  )

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    if (editing) {
      await supabase.from('tabela').update(form).eq('id', editing.id)
    } else {
      await supabase.from('tabela').insert(form)
    }
    await fetchData()
    setModalOpen(false)
    setEditing(null)
    setForm(defaultForm)
    setSaving(false)
  }

  const handleDelete = async (item: T) => {
    const supabase = createClient()
    await supabase.from('tabela').delete().eq('id', item.id)
    await fetchData()
  }
  // ...
}
```

### Padrão de erro no fetch
```tsx
{error && (
  <div className="rounded-xl border border-[#ff9c9a] bg-[#7c1c1c] px-4 py-3 text-[13px] text-[#ff9c9a]">
    Erro ao carregar dados: {error}
  </div>
)}
```

---

## Como adicionar item no Sidebar

Arquivo: `src/components/layout/Sidebar.tsx`

Adicionar objeto no array `NAV_ITEMS`:
```typescript
{ href: '/nova-rota', label: 'Nome do Menu', icon: NomeDoIcone }
```

Ícones vêm de `lucide-react`. Ver lista em lucide.dev.

---

## Como adicionar nova tabela no banco

1. Escrever SQL no padrão abaixo
2. Aplicar via MCP Supabase (`mcp__supabase__apply_migration`)
3. Adicionar interface em `src/types/index.ts`
4. Adicionar schema Zod em `src/lib/schemas.ts`
5. Atualizar `Banco de Dados.md` no Obsidian

### Template SQL mínimo
```sql
CREATE TABLE nome_da_tabela (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- campos aqui
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger de updated_at
CREATE TRIGGER update_nome_da_tabela_updated_at
  BEFORE UPDATE ON nome_da_tabela
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE nome_da_tabela ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage nome_da_tabela"
  ON nome_da_tabela FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
```

---

## ⚠️ Armadilha: actions.ts

Cada pasta de tela tem um `actions.ts` com Server Actions (`createX`, `updateX`, `deleteX`). **Nenhuma página os usa** — todas as páginas usam Supabase client-side direto via `createClient()` no próprio componente.

Os `actions.ts` foram criados como alternativa, mas ficaram como código morto. **Não os use como referência** ao criar nova funcionalidade — siga o padrão de estado acima.

---

## Como adicionar novo componente UI

Pasta: `src/components/ui/`

Seguir o padrão dos componentes existentes:
- Exportar componente nomeado (não default)
- Aceitar `className` como prop opcional (usa `cn()` para mesclar)
- Usar tokens do [[Design System]] — nunca cores hardcoded fora dos tokens

---

## Regras invioláveis ao modificar código

1. **Inglês obrigatório** — variáveis, funções, colunas de banco, arquivos, rotas
2. **Português permitido** — labels de UI, comentários JSDoc, interações com o usuário
3. **Tabelas e linhas sempre em `h-9 text-[13px]`** — preferência explícita do usuário
4. **Nunca usar `actions.ts`** — usar Supabase client-side direto
5. **Toda nova tabela precisa de RLS + trigger `update_updated_at`**
6. **`npm run build` deve passar sem erros** antes de qualquer commit

## Tags
`#projeto/guia` `#projeto/desenvolvimento`
