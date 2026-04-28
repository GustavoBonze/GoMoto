# 🧩 Componentes UI — [[GoMoto]]

Todos em `src/components/`. Ver [[Design System]] para tokens visuais.

## Button (`src/components/ui/Button.tsx`)

```tsx
<Button variant="primary" size="md" loading={false}>
  Salvar
</Button>
```

**Props:**
- `variant`: `'primary'` | `'secondary'` | `'ghost'` | `'danger'` | `'outline'` | `'white'` | `'white-lg'` | `'neutral-sm'` | `'actions-sm'`
- `size`: `'sm'` | `'md'` | `'lg'` | `'icon-sm'`
- `loading`: `boolean` — exibe spinner e desabilita clique
- Estende todos os props nativos do `<button>`

**Cores por variant:**
- `primary` → `#BAFF1A` / hover `#a8e617`
- `secondary` → `#323232` / hover `#474747`
- `danger` → `#bf1d1e` / hover `#a01819`
- `ghost` → transparente / hover `#323232`

---

## Card (`src/components/ui/Card.tsx`)

### Card (container genérico)
```tsx
<Card padding="md" className="...">
  conteúdo
</Card>
```
- `padding`: `'none'` | `'sm'` | `'md'` | `'lg'`
- Fundo `#202020`, borda `#474747`, `rounded-xl`

### StatCard (KPI)
```tsx
<StatCard
  title="Motos disponíveis"
  value={5}
  subtitle="de 8 total"
  icon={Bike}
  color="success"
/>
```
- `color`: `'brand'` | `'success'` | `'warning'` | `'danger'` | `'info'`
- Usado no Dashboard para KPIs

---

## Input (`src/components/ui/Input.tsx`)

### Input
```tsx
<Input label="Placa" error="Placa inválida" hint="Ex: ABC-1234" />
```

### Select
```tsx
<Select
  label="Status"
  options={[{ value: 'active', label: 'Ativo' }]}
  error=""
/>
```

### Textarea
```tsx
<Textarea label="Observações" rows={4} />
```

Todos compartilham `label`, `error`, `hint`. Borda verde focus.

---

## Modal (`src/components/ui/Modal.tsx`)

```tsx
<Modal open={open} onClose={() => setOpen(false)} title="Novo Cliente" size="lg">
  conteúdo
</Modal>
```

- `size`: `'sm'` | `'md'` | `'lg'` | `'xl'`
- Clique no backdrop fecha
- Scroll bloqueado no body quando aberto
- Animação: `fade-in zoom-in-95 slide-in-from-top-4`

---

## Table (`src/components/ui/Table.tsx`)

```tsx
<Table
  columns={[
    { key: 'name', header: 'Nome' },
    { key: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
  ]}
  data={customers}
  keyExtractor={(row) => row.id}
  onRowClick={(row) => setEditing(row)}
  emptyMessage="Nenhum cliente encontrado"
  loading={loading}
/>
```

- **Genérica** — funciona com qualquer tipo `T`
- `loading` exibe skeleton de linhas
- Linhas com `h-9 text-[13px]` (compacto)

---

## Badge (`src/components/ui/Badge.tsx`)

### Badge (genérica)
```tsx
<Badge variant="success">Pago</Badge>
```
- `variant`: `'success'` | `'warning'` | `'danger'` | `'info'` | `'muted'` | `'brand'` | `'orange'`

### StatusBadge (automática)
```tsx
<StatusBadge status="available" />
```
Mapeamento automático:
- `available` → `Disponível` (success)
- `rented` → `Alugada` (info)
- `maintenance` → `Manutenção` (warning)
- `inactive` → `Inativa` (muted)
- `pending` → `Pendente` (warning)
- `paid` → `Pago` (success)
- `overdue` → `Vencido` (danger)
- `loss` → `Perda` (muted)
- `active` → `Ativo` (success)
- `closed` → `Encerrado` (muted)
- `cancelled` → `Cancelado` (danger)
- `broken` → `Quebrado` (danger)

---

## Layout — Sidebar (`src/components/layout/Sidebar.tsx`)

Nav lateral com logo GoMoto. Itens de navegação:

| Ícone | Label | Rota |
|---|---|---|
| LayoutDashboard | Dashboard | `/dashboard` |
| Bike | Motos | `/motos` |
| Users | Clientes | `/clientes` |
| FileText | Contratos | `/contratos` |
| CreditCard | Cobranças | `/cobrancas` |
| ArrowUpCircle | Entradas | `/entradas` |
| ArrowDownCircle | Despesas | `/despesas` |
| AlertTriangle | Multas | `/multas` |
| Clock | Fila | `/fila` |
| Wrench | Manutenção | `/manutencao` |
| BarChart | Relatórios | `/relatorios` |
| BookOpen | Processos | `/processos` |
| Settings | Configurações | `/configuracoes` |

---

## Layout — Header (`src/components/layout/Header.tsx`)

- Exibe título da página atual
- Slot para ações no lado direito (ex: botão "Nova moto")
- Breadcrumb opcional

---

## MotorcycleMap (`src/components/MotorcycleMap.tsx`)

Mapa Leaflet interativo da frota.

```tsx
<MotorcycleMap motorcycles={motos} contracts={contratos} />
```

- Importado com `dynamic({ ssr: false })` — depende de `window`
- Marcador por moto com dados do cliente atual
- Clique em marcador → seleciona moto na tabela
- Container usa `isolation: isolate` para conter z-indexes do Leaflet

## Tags
`#projeto/componentes` `#design/ui`
