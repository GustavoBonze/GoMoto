# BONZE DESIGN SYSTEM — AI REFERENCE
## Source of truth for ALL UI generation. Follow exactly. Never deviate. Never invent.
## Stack: Next.js 14 + TypeScript + TailwindCSS + Lucide Icons (NOT InfinitePay SVGs)
## Version: 2.1 — 2026-04-04

---

## RESPONSE STYLE — MANDATORY

Keep all AI responses short and direct. Do not explain what you did unless the user asks. Do not add summaries at the end of responses. Avoid verbose justifications — just do the task and confirm briefly. The user reads the code; they don't need it narrated.

---

## AI WORKFLOW — MANDATORY

**ALWAYS use Codex and Gemini. Never execute tasks directly.**

| Priority | Tool | When to use |
|----------|------|-------------|
| **1st — PRIMARY** | **Codex CLI** (`/codex:rescue`) | All code generation, file editing, dev tasks |
| **2nd — SECONDARY** | **Gemini CLI** | Large files, full codebase analysis, Codex fallback |

- Codex model: always latest (`o4-mini` or newer)
- Gemini model: always `gemini-3.1-pro-preview`
- Claude role: understand → delegate → review → deliver

---

## QUICK ENFORCEMENT — READ FIRST

NEVER use transparency (`/10`, `/30`, `/50`, `/80`) on semantic backgrounds. Use solid hex.
NEVER use the `<Table>` component — always use raw `<table>` HTML per section 19.
NEVER use `text-xs` or `uppercase` or `tracking-wider` in table headers.
NEVER add `py-3` to `<th>` or `<td>` — height is controlled by `h-9` on `<tr>`.
NEVER use `divide-y` on `<tbody>`.
NEVER use `text-sm` on `<table>` — font size is set per element.
NEVER use `text-sm font-medium` for KPI labels — use `text-[14px] font-normal`.
NEVER use `text-2xl font-bold` for KPI values — use `text-[28px] font-bold`.
NEVER place JSX comments `{/* */}` between a `.map(item => (` and its `<tr>` — use JS `/* */`.
ALWAYS use `rounded-full` (pill) for all buttons.
ALWAYS use solid semantic colors for alerts and banners.
ALWAYS keep KPI cards: text-div LEFT + icon-div RIGHT with `justify-between`.

---

## 1. COLOR TOKENS

| Role | Hex | Tailwind |
|------|-----|----------|
| Page background | `#121212` | `bg-[#121212]` |
| Card / container | `#202020` | `bg-[#202020]` |
| Table header row | `#323232` | `bg-[#323232]` |
| Table even row | `#323232` | `even:bg-[#323232]` |
| Table hover | `#474747` | `hover:bg-[#474747]` |
| Border / dividers | `#474747` | `border-[#474747]` |
| Brand (lime) | `#BAFF1A` | `bg-[#BAFF1A]` |
| Text primary | `#f5f5f5` | `text-[#f5f5f5]` |
| Text secondary | `#c7c7c7` | `text-[#c7c7c7]` |
| Text tertiary / labels | `#9e9e9e` | `text-[#9e9e9e]` |
| Brand bg (solid) | `#243300` | `bg-[#243300]` |
| Brand border | `#6b9900` | `border-[#6b9900]` |
| Brand text on dark | `#BAFF1A` | `text-[#BAFF1A]` |
| Success bg | `#0e2f13` | `bg-[#0e2f13]` |
| Success text | `#28b438` | `text-[#28b438]` |
| Error bg | `#7c1c1c` | `bg-[#7c1c1c]` |
| Error border | `#ff9c9a` | `border-[#ff9c9a]` |
| Error text | `#ff9c9a` | `text-[#ff9c9a]` |
| Warning bg | `#3a180f` | `bg-[#3a180f]` |
| Warning text | `#e65e24` | `text-[#e65e24]` |
| Info bg | `#2d0363` | `bg-[#2d0363]` |
| Info text | `#a880ff` | `text-[#a880ff]` |
| Danger button | `#bf1d1e` | `bg-[#bf1d1e]` |
| Input bg / border | `#323232` | `bg-[#323232] border-[#323232]` |

---

## 2. TYPOGRAPHY

| Use | px | Tailwind |
|-----|-----|---------|
| KPI value | 28px | `text-[28px] font-bold` |
| Page title h1 | 28px | `text-[28px] font-bold text-[#f5f5f5]` |
| Section title | 20px | `text-[20px] font-bold text-[#f5f5f5]` |
| Body / table cells | 13px | `text-[13px]` |
| KPI label | 14px | `text-[14px] font-normal text-[#9e9e9e]` |
| KPI sub (apoio) | 12px | `text-[12px] mt-0.5 text-[#9e9e9e]` |
| Caption / badge | 12px | `text-[12px] font-medium` (usar valor fixo, não `text-xs`) |

Font: `Inter` (CeraPro is InfinitePay proprietary — NOT available in Bonze projects).
Weight: 400 regular, 500 medium, 700 bold. No 600.

---

## 3. BUTTONS

Base classes (all buttons):
```
inline-flex items-center justify-center gap-2 font-medium transition-all duration-150
hover:scale-[1.025] active:scale-95
disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
rounded-full
```

| Variant | Classes |
|---------|---------|
| primary | `bg-[#BAFF1A] text-[#121212] font-semibold hover:bg-[#a8e617]` |
| secondary | `bg-[#323232] text-[#f5f5f5] hover:bg-[#474747]` |
| ghost | `bg-transparent text-[#c7c7c7] hover:bg-[#323232] hover:text-[#f5f5f5]` |
| danger | `bg-[#bf1d1e] text-[#f5f5f5] hover:bg-[#a01819]` |
| outline | `bg-transparent border border-[#474747] text-[#f5f5f5] hover:border-[#BAFF1A] hover:text-[#BAFF1A]` |

| Size | Classes |
|------|---------|
| sm | `px-3 py-1.5 text-sm rounded-full` |
| md | `px-4 py-2 text-sm rounded-full` |
| lg | `px-6 py-3 text-base rounded-full` |

ALWAYS: `rounded-full` on every button. NEVER `rounded-md` or `rounded-lg` for buttons.

---

## 4. INPUTS / FORMS

```html
<div class="space-y-1">
  <label class="text-[14px] text-[#c7c7c7]">Label</label>
  <div class="flex items-center gap-2 px-4 bg-[#323232] border-2 border-[#323232]
              rounded-lg h-12 focus-within:border-[#474747]">
    <LucideIcon class="w-4 h-4 text-[#9e9e9e]" />
    <input class="flex-1 bg-transparent text-[#f5f5f5] outline-none
                  placeholder:text-[#616161]" />
  </div>
  <span class="text-xs text-[#ff9c9a]">Error message</span>
</div>
```

States:
- Normal: `bg-[#323232] border-[#323232]`
- Hover: `border-[#474747]`
- Focus: `border-[#474747]` (via `focus-within`)
- Error: `border-[#bf1d1e]`

Sizes: `h-10` (small/filters), `h-12` (forms), `h-[72px]` (large).

---

## 5. TABLES — CRITICAL RULES

> Ver seção 19 para o padrão completo e ultra-detalhado de grid. Esta seção é um resumo de referência rápida.

### HTML Structure (use `<table>`, NOT `<div>` flex tables)

```tsx
{/* Container obrigatório — NUNCA usar <Card> ou div genérica */}
<div className="overflow-hidden rounded-2xl border border-[#474747] bg-[#202020]">
  <div className="overflow-x-auto">
    <table className="w-full text-left text-[13px] text-[#f5f5f5]">
      {/* SEMPRE: text-left text-[13px] text-[#f5f5f5] no <table> */}
      <thead className="bg-[#323232] text-[#c7c7c7]">
        {/* SEMPRE: bg-[#323232] text-[#c7c7c7] no <thead> — não apenas no <tr> */}
        <tr>
          <th className="h-9 px-4 font-bold">Coluna Normal</th>
          <th className="h-9 px-4 text-right font-bold">Ações</th>
          {/* NUNCA: text-xs, uppercase, tracking-wider, py-3 no <th> */}
          {/* NUNCA: text-left no <th> — já herdado do <table> */}
        </tr>
      </thead>
      <tbody>
        {/* NUNCA divide-y no <tbody> */}
        {items.map(item => (
          <tr
            key={item.id}
            className="h-9 transition-colors odd:bg-transparent even:bg-[#323232] hover:bg-[#474747]"
          >
            {/* NUNCA border-b ou border-t no <tr> */}
            <td className="px-4">
              {/* NUNCA py-3 ou py-2 no <td> — altura vem do h-9 no <tr> */}
              <p className="font-medium text-[#f5f5f5]">{item.name}</p>
            </td>
            <td className="px-4 text-right">
              {/* Ações sempre alinhadas à direita */}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

### Table Rules Checklist

| Elemento | OBRIGATÓRIO | PROIBIDO |
|---------|-------------|---------|
| `<table>` | `w-full text-left text-[13px] text-[#f5f5f5]` | `text-sm`, `text-right` no table |
| Container | `overflow-hidden rounded-2xl border border-[#474747] bg-[#202020]` | `rounded-lg`, `<Card>` |
| Scroll | `<div className="overflow-x-auto">` | nenhum |
| `<thead>` | `bg-[#323232] text-[#c7c7c7]` | só bg sem o text |
| `<th>` | `h-9 px-4 font-bold` | `py-3`, `text-xs`, `uppercase`, `tracking-wider`, `text-[13px]` no próprio th |
| `<th>` Ações | `h-9 px-4 text-right font-bold` | alinhar à esquerda |
| `<tbody>` | sem classes | `divide-y`, `divide-[#323232]` |
| `<tr>` | `h-9 transition-colors odd:bg-transparent even:bg-[#323232] hover:bg-[#474747]` | `border-b`, `border-t` |
| `<td>` | `px-4` | `py-3`, `py-2`, `text-sm`, `font-medium` no td (vai no elemento filho) |
| `<td>` Ações | `px-4 text-right` | alinhar à esquerda |

---

## 6. KPI STAT CARDS — ESPECIFICAÇÃO COMPLETA E OBRIGATÓRIA

> Esta seção é a fonte de verdade absoluta para todos os cards de métricas (KPI) do sistema.
> Qualquer implementação futura DEVE replicar exatamente o que está aqui — sem adaptações, sem simplificações.

---

### 6.1 Grid externo (wrapper dos cards)

```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
  {/* 4 cards aqui */}
</div>
```

| Propriedade | Classe | Valor real |
|---|---|---|
| Display | `grid` | CSS Grid |
| Colunas mobile | `grid-cols-2` | 2 colunas em telas < 640px |
| Colunas desktop | `sm:grid-cols-4` | 4 colunas em telas ≥ 640px |
| Espaço entre cards | `gap-4` | 16px entre todos (horizontal e vertical) |

**PROIBIDO no grid:**
- `gap-x-4 gap-y-4` separados — usar apenas `gap-4`
- `grid-cols-1` como fallback — o mobile é 2 colunas, não 1
- `flex flex-wrap` no lugar de grid
- `grid-cols-3` ou qualquer outro número

---

### 6.2 Container do card (elemento raiz de cada card)

```tsx
<div className="flex items-center justify-between rounded-2xl border border-[#474747] bg-[#202020] px-6 py-4">
```

| Propriedade | Classe | Valor real |
|---|---|---|
| Display | `flex` | flexbox horizontal |
| Alinhamento vertical | `items-center` | centraliza texto e ícone no eixo Y |
| Distribuição horizontal | `justify-between` | texto empurrado à esquerda, ícone à direita |
| Border radius | `rounded-2xl` | 16px — formato arredondado padrão do sistema |
| Borda | `border` | 1px sólida |
| Cor da borda | `border-[#474747]` | cinza médio |
| Fundo | `bg-[#202020]` | cinza escuro — fundo padrão de card |
| Padding horizontal | `px-6` | 24px nos lados esquerdo e direito |
| Padding vertical | `py-4` | 16px no topo e na base |

**PROIBIDO no container:**
- `p-6` genérico — usar `px-6 py-4` separados (padding vertical menor)
- `rounded-xl` — SEMPRE `rounded-2xl`
- `rounded-lg` — SEMPRE `rounded-2xl`
- `shadow-*` — sem sombra em dark mode
- `hover:*` — card KPI não tem interação de hover
- `cursor-pointer` — card KPI não é clicável
- `gap-*` — o espaço entre texto e ícone vem do `justify-between`, não de gap
- `min-h-*` ou `h-*` fixo — altura definida pelo conteúdo + padding
- `w-full` explícito — o grid já controla a largura

---

### 6.3 Div interna esquerda (agrupador dos textos)

```tsx
<div>
  {/* label, value e sub aqui */}
</div>
```

> Esta `<div>` é propositalmente sem classes. Ela serve apenas para agrupar os 3 textos
> verticalmente. O `flex items-center justify-between` do container já cuida do posicionamento.

**PROIBIDO:**
- Qualquer classe nessa div — deixar sem className
- `flex flex-col` explícito — comportamento padrão de div em bloco

---

### 6.4 Label (rótulo do KPI)

```tsx
<p className="text-[14px] font-normal text-[#9e9e9e]">{label}</p>
```

| Propriedade | Classe | Valor real |
|---|---|---|
| Tamanho | `text-[14px]` | 14px fixo |
| Peso | `font-normal` | 400 — explicitamente normal |
| Cor | `text-[#9e9e9e]` | cinza terciário |
| Margin top/bottom | nenhum | sem espaço acima do label |

**PROIBIDO no label:**
- `text-sm` — usar `text-[14px]` fixo
- `text-xs` — muito pequeno
- `font-medium` — peso deve ser 400 (normal)
- `font-bold` — peso deve ser 400 (normal)
- `uppercase` — texto como foi escrito, sem transformação
- `tracking-wider` ou `tracking-[0.2em]` — sem letter-spacing
- `text-[#c7c7c7]` — usar `text-[#9e9e9e]` (terciário, mais apagado)
- `text-[#f5f5f5]` — cor primária é para o value, não o label
- `mb-*` — sem margin bottom

---

### 6.5 Value (valor principal do KPI)

```tsx
<p className="text-[28px] font-bold text-[#f5f5f5]">{value}</p>
```

| Propriedade | Classe | Valor real |
|---|---|---|
| Tamanho | `text-[28px]` | 28px fixo — maior elemento do card |
| Peso | `font-bold` | 700 |
| Cor | `text-[#f5f5f5]` | branco primário — máximo contraste |
| Margin top/bottom | nenhum | sem espaço entre label e value |
| Tipo de dado | `string \| number` | aceita texto (nome de categoria) ou número formatado |

**PROIBIDO no value:**
- `text-2xl` — usar `text-[28px]` fixo (text-2xl = 24px, diferente)
- `text-3xl` — grande demais
- `text-xl` — pequeno demais
- `font-semibold` — usar `font-bold` (700, não 600)
- `font-medium` — muito fino para valor principal
- `text-[#BAFF1A]` — cor de marca não é usada no value
- `mt-1` ou `mt-2` — sem margin top
- `leading-tight` ou qualquer `leading-*` explícito

---

### 6.6 Sub (texto de apoio — opcional)

```tsx
{sub && <p className="text-[12px] mt-0.5 text-[#9e9e9e]">{sub}</p>}
```

| Propriedade | Classe | Valor real |
|---|---|---|
| Tamanho | `text-[12px]` | 12px fixo |
| Margin top | `mt-0.5` | 2px acima do sub — aproximado ao value |
| Cor | `text-[#9e9e9e]` | cinza terciário (mesma cor do label) |
| Condicional | `{sub && ...}` | só renderiza se a prop `sub` existir |
| Peso | herdado | `font-normal` (400) — sem declaração explícita |

**PROIBIDO no sub:**
- `text-xs` — usar `text-[12px]` fixo (mesmo valor, mas explícito)
- `mt-1` — usar `mt-0.5` (2px, não 4px — fica mais próximo do value)
- `text-[#616161]` — muito apagado; usar `text-[#9e9e9e]`
- `opacity-70` — não usar opacidade; cor sólida
- Renderizar sempre (sem condicional) — sub é opcional e pode ser `undefined`

---

### 6.7 Container do ícone (círculo)

```tsx
<div className="bg-[#323232] p-3 rounded-full">
```

| Propriedade | Classe | Valor real |
|---|---|---|
| Fundo | `bg-[#323232]` | cinza médio-escuro — contrasta com o card `#202020` |
| Padding | `p-3` | 12px em todos os lados — cria o círculo ao redor do ícone |
| Formato | `rounded-full` | círculo perfeito |

**PROIBIDO no container do ícone:**
- `flex items-center justify-center` — desnecessário; SVG é inline e centraliza sozinho
- `bg-[#202020]` — seria igual ao fundo do card, sem destaque
- `bg-[#474747]` — muito claro
- `bg-[#BAFF1A]` — marca no fundo destrói contraste do ícone branco
- `p-2` — pequeno demais, círculo fica apertado
- `p-4` — grande demais
- `rounded-xl` ou `rounded-lg` — SEMPRE `rounded-full`
- `w-10 h-10` fixo — deixar o tamanho ser definido pelo padding `p-3` + tamanho do ícone

---

### 6.8 Ícone (Lucide Icon)

```tsx
<Icon className="w-6 h-6 text-[#BAFF1A]" />
```

| Propriedade | Classe | Valor real |
|---|---|---|
| Largura | `w-6` | 24px |
| Altura | `h-6` | 24px |
| Cor | `text-[#BAFF1A]` | verde-limão (cor de marca) — sempre |

**PROIBIDO no ícone:**
- `w-5 h-5` — pequeno demais para KPI
- `w-8 h-8` — grande demais para KPI
- `text-[#f5f5f5]` — ícone branco perde destaque no fundo cinza
- `text-[#9e9e9e]` — apagado demais
- Qualquer cor semântica (vermelho, laranja) no ícone — SEMPRE verde-limão `#BAFF1A`
- `shrink-0` — desnecessário dentro do círculo

---

### 6.9 JSX completo do componente KpiCard (referência canônica)

```tsx
function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#474747] bg-[#202020] px-6 py-4">
      <div>
        <p className="text-[14px] font-normal text-[#9e9e9e]">{label}</p>
        <p className="text-[28px] font-bold text-[#f5f5f5]">{value}</p>
        {sub && <p className="text-[12px] mt-0.5 text-[#9e9e9e]">{sub}</p>}
      </div>
      <div className="bg-[#323232] p-3 rounded-full">
        <Icon className="w-6 h-6 text-[#BAFF1A]" />
      </div>
    </div>
  )
}
```

> Este componente DEVE ficar fora do componente principal da página para evitar
> redefinição a cada render. Definir dentro do componente pai é anti-padrão.

---

### 6.10 Anti-patterns — o que NUNCA fazer em KPI cards

| Anti-padrão | Correto |
|---|---|
| `bg-[#202020] rounded-2xl p-6` | `bg-[#202020] rounded-2xl px-6 py-4 border border-[#474747]` |
| `text-2xl font-bold` no value | `text-[28px] font-bold` |
| `text-sm font-medium uppercase` no label | `text-[14px] font-normal` |
| `text-xs` no sub | `text-[12px]` |
| `mt-1` no sub | `mt-0.5` |
| `text-[#c7c7c7]` no label | `text-[#9e9e9e]` |
| `opacity-70` no sub | cor sólida `text-[#9e9e9e]` |
| Ícone com `text-[#f5f5f5]` | `text-[#BAFF1A]` sempre |
| Container do ícone com `rounded-xl` | `rounded-full` |
| `bg-[#BAFF1A]/10` no container do ícone | `bg-[#323232]` |
| Sem borda no card | `border border-[#474747]` obrigatório |
| `rounded-xl` no card | `rounded-2xl` |
| `grid-cols-1` em mobile | `grid-cols-2` |
| `p-6` uniforme no card | `px-6 py-4` |
| Sub sempre visível (sem condicional) | `{sub && <p>...</p>}` |
| Ícone `w-4 h-4` | `w-6 h-6` no KPI card |

---

## 7. CARDS / CONTAINERS

```tsx
// Standard card
<div className="bg-[#202020] rounded-2xl p-4">

// Card with border
<div className="bg-[#202020] rounded-2xl p-4 border border-[#474747]">

// Section within page (accordion header, panel header)
<div className="bg-[#202020] rounded-2xl p-4 flex items-center justify-between">
```

- `rounded-2xl` (16px) for all cards — NEVER `rounded-lg` on cards
- No shadow in dark mode
- Inner sections / sub-cards: `bg-[#323232] rounded-xl`

---

## 8. BADGES / STATUS CHIPS

```tsx
// Generic badge
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#0e2f13] text-[#28b438]">
  Ativo
</span>
```

| Semantic | bg | text |
|----------|-----|------|
| success | `bg-[#0e2f13]` | `text-[#28b438]` |
| error/danger | `bg-[#7c1c1c]` | `text-[#ff9c9a]` |
| warning | `bg-[#3a180f]` | `text-[#e65e24]` |
| info | `bg-[#2d0363]` | `text-[#a880ff]` |
| neutral | `bg-[#323232]` | `text-[#c7c7c7]` |
| brand | `bg-[#243300]` | `text-[#BAFF1A]` |

Base: `px-2 py-0.5 rounded-full text-xs font-medium`

Filter chips (larger): `px-3 py-1.5 rounded-full text-sm border border-[#474747] text-[#c7c7c7] hover:border-[#BAFF1A] hover:text-[#BAFF1A]`

---

## 9. ALERTS / BANNERS / FEEDBACK BOXES

ALWAYS use SOLID colors. NEVER transparency (`/10`, `/30`).

```tsx
// Brand/info alert (green lime)
<div className="bg-[#243300] border border-[#6b9900] rounded-xl p-4 text-[#BAFF1A]">

// Error banner
<div className="bg-[#7c1c1c] border border-[#ff9c9a] rounded-xl p-4 text-[#ff9c9a]">

// Warning alert
<div className="bg-[#3a180f] border border-[#e65e24] rounded-xl p-4 text-[#e65e24]">

// Success alert
<div className="bg-[#0e2f13] border border-[#28b438] rounded-xl p-4 text-[#28b438]">
```

Anti-patterns:
- `bg-[#BAFF1A]/10` → WRONG. Use `bg-[#243300]`
- `border-[#BAFF1A]/50` → WRONG. Use `border-[#6b9900]`
- `bg-red-900/30` → WRONG. Use `bg-[#7c1c1c]`
- `bg-[#ff9c9a]/30` → WRONG. Use `bg-[#7c1c1c]`

---

## 10. MODALS

### Regra principal: NUNCA abrir barra de rolagem

O componente `<Modal>` usa `max-h-[96vh] overflow-y-auto`. Para que nunca apareça scrollbar:
- Formulários com 5+ campos: usar `size="lg"` (672px) — NUNCA `size="md"`
- Formulários com upload: SEMPRE `size="lg"` ou maior
- Espaçamento interno do form: `space-y-3` (não `space-y-4`) quando há muitos campos
- Uploads lado a lado: usar `grid grid-cols-2 gap-3` em vez de coluna única

```tsx
// Uso correto do componente Modal do projeto
<Modal
  open={modalOpen}
  onClose={handleCloseModal}
  title="Título"
  size="lg"          // formulários com 5+ campos ou upload
>
  <form onSubmit={handleSave} className="space-y-3">
    {/* campos */}
    <div className="flex gap-3 justify-end pt-1">
      <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancelar</Button>
      <Button type="submit" loading={saving}>Salvar</Button>
    </div>
  </form>
</Modal>
```

### Modal size guide

| size | max-width | When to use |
|------|-----------|-------------|
| `sm` | max-w-md  | Confirmações simples (excluir, confirmar pagamento) |
| `md` | max-w-lg  | Formulários com até 4 campos simples |
| `lg` | max-w-2xl | Formulários com 5+ campos ou qualquer upload |
| `xl` | max-w-4xl | Formulários complexos com múltiplas colunas |

### Aviso condicional no modal (sem crescer a altura)

Para exibir um alerta dentro do modal **sem abrir scrollbar**, inserir o bloco **acima dos botões** de forma compacta (`p-3`, `text-xs`). O form deve usar `space-y-3` e uploads em grid para compensar a altura do alerta:

```tsx
{showWarning && (
  <div className="bg-[#3a180f] border border-[#e65e24] rounded-xl p-3 flex items-start gap-2">
    <AlertCircle className="w-4 h-4 text-[#e65e24] shrink-0 mt-0.5" />
    <div>
      <p className="text-xs font-medium text-[#e65e24]">Título do aviso</p>
      <p className="text-xs text-[#e65e24] mt-0.5 leading-tight opacity-80">
        Descrição curta. Deseja realmente continuar?
      </p>
    </div>
  </div>
)}
<div className="flex gap-3 justify-end pt-1">
  <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
  {showWarning
    ? <Button type="submit" variant="danger">Confirmar mesmo assim</Button>
    : <Button type="submit">Salvar</Button>
  }
</div>
```

---

## 11. LAYOUT STRUCTURE

```
Page wrapper: bg-[#121212] min-h-screen
Sidebar offset: pl-[78px] (fixed sidebar is 80px wide)
Page padding: p-6 md:p-10
Content max-width: none (full width)
```

```tsx
// Standard page with header + table
<div className="min-h-screen bg-[#121212]">
  {/* Sticky toolbar */}
  <div className="sticky top-0 z-10 bg-[#121212] border-b border-[#323232] px-6 py-4
                  flex items-center gap-4">
    <h1 className="text-[28px] font-bold text-[#f5f5f5]">Título da Página</h1>
    <div className="ml-auto flex gap-3">
      <Button variant="secondary">Ação</Button>
      <Button variant="primary">Nova ação</Button>
    </div>
  </div>
  {/* KPI row */}
  <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
    {/* KPI cards */}
  </div>
  {/* Filter bar */}
  <div className="px-6 pb-4 flex gap-3">
    {/* search + filter chips */}
  </div>
  {/* Table */}
  <div className="px-6 pb-10">
    <table className="w-full text-[16px]">...</table>
  </div>
</div>
```

---

## 12. SIDEBAR

```tsx
// Fixed sidebar (implemented in Sidebar.tsx — DO NOT recreate)
// Width collapsed: 80px | Width expanded (hover): 260px
// bg: #202020
// Nav link active: bg-[#d9ff80] text-[#323232]
// Nav link hover: bg-[#323232] text-[#f5f5f5]
// Nav link inactive: text-[#c7c7c7]
// Main content offset: pl-[78px]
```

GoMoto sidebar items:
```
Dashboard → /dashboard
Motos → /motos
Clientes → /clientes
Contratos → /contratos
Cobranças → /cobrancas
Entradas → /entradas
Despesas → /despesas
Multas → /multas
Manutenção → /manutencao
Fila → /fila
Relatórios → /relatorios
Processos → /processos
Configurações → /configuracoes
```

---

## 13. GOМОТО PAGE PATTERNS

### 13.1 Pattern: List page with KPIs + filters + table
Used by: `/clientes`, `/contratos`, `/cobrancas`, `/entradas`, `/despesas`, `/multas`, `/fila`

```
sticky toolbar: title + actions
KPI grid: 2-4 cards (bg-[#202020] rounded-2xl)
filter bar: search input + filter chips + optional date picker
table: w-full text-[16px] with thead/tbody rules from section 5
```

### 13.2 Pattern: Maintenance/queue page with accordion sections
Used by: `/manutencao`, `/fila`

```
sticky toolbar: title + actions
KPI grid: 2-4 cards
accordion items: bg-[#202020] rounded-2xl (header with chevron)
  expanded content: inner table or card list with bg-[#323232] rounded-xl
```

### 13.3 Pattern: Config/details page
Used by: `/configuracoes`, `/processos`

```
page header: title + optional back button
sections: bg-[#202020] rounded-2xl p-6
  section heading: text-[16px] font-bold border-b border-[#474747] pb-3 mb-4
  setting rows: flex justify-between items-center h-11
    label: text-[16px] text-[#f5f5f5]
    value: text-[16px] text-[#9e9e9e]
```

---

## 14. ICONS

Library: **Lucide Icons** (import from `lucide-react`)
NOT InfinitePay SVG system. NOT Phosphor.

Sizes:
- `w-4 h-4` — inside inputs, small contexts
- `w-5 h-5` — buttons, inline
- `w-6 h-6` — KPI cards, section headers
- `w-8 h-8` — large feature icons

Color in dark mode: `text-[#e0e0e0]` default, `text-[#BAFF1A]` brand accent, `text-[#9e9e9e]` muted.

---

## 15. ANIMATIONS

```
Buttons: transition-all duration-150 | hover:scale-[1.025] | active:scale-95
Sidebar expand: transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
Modals: animate-in fade-in-0 zoom-in-95 (or simple opacity transition)
```

---

## 16. ANTI-PATTERNS CATALOG
> Real bugs found and fixed in GoMoto pages. Never repeat these.

| Wrong | Correct | Reason |
|-------|---------|--------|
| `<table className="text-sm">` | `text-[16px]` | Design system requires 16px body text |
| `<th className="py-3 text-xs uppercase tracking-wider">` | `h-16 font-bold text-[#c7c7c7]` | th height from h-16 on tr, no decorators |
| `<tbody className="divide-y divide-[#323232]">` | `<tbody>` plain | Rows self-handle borders via odd/even |
| `<td className="px-4 py-3">` | `<td className="px-4 font-medium">` | Height from h-16 on tr |
| `<p className="text-sm font-medium uppercase">Label</p>` (KPI) | `text-[14px] font-normal` | KPI labels never uppercase |
| `<p className="text-2xl font-bold">` (KPI) | `text-[28px] font-bold` | Exact token: 28px |
| `bg-[#BAFF1A]/10` | `bg-[#243300]` | No transparency on semantic bg |
| `border-[#BAFF1A]/50` | `border-[#6b9900]` | No transparency on semantic borders |
| `bg-[#7c1c1c]/30` or `bg-red-900/30` | `bg-[#7c1c1c]` | Error bg is solid |
| `{/* comment */}` between `map(item => (` and `<tr>` | `/* comment */` (JS, not JSX) | JSX expressions invalid there |
| Mixing `<th>` open with `</td>` close | Match tags correctly | TypeScript/JSX parse error |
| KPI: icon LEFT, text RIGHT | text LEFT, icon RIGHT — `justify-between`, ícone dentro de `bg-[#323232] p-3 rounded-full` | Layout obrigatório do design system |
| `border-[#BAFF1A]/50` on upload drop zone | `border-[#BAFF1A]` solid | No transparency |

---

## 17. FILE STRUCTURE (GoMoto project)

```
src/
├── app/(dashboard)/
│   ├── fila/page.tsx
│   ├── manutencao/page.tsx
│   ├── multas/page.tsx
│   ├── despesas/page.tsx
│   ├── clientes/page.tsx
│   ├── contratos/page.tsx
│   ├── cobrancas/page.tsx
│   ├── entradas/page.tsx
│   ├── motos/page.tsx
│   ├── relatorios/page.tsx
│   ├── processos/page.tsx
│   └── configuracoes/page.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx  — variants: primary/secondary/ghost/danger/outline
│   │   ├── Badge.tsx   — Badge + StatusBadge
│   │   ├── Card.tsx    — Card + StatCard
│   │   ├── Input.tsx   — Input + Select + Textarea
│   │   ├── Modal.tsx   — Modal with backdrop
│   │   └── Table.tsx   — generic Table
│   └── layout/
│       ├── Sidebar.tsx — fixed nav
│       └── Header.tsx  — page header
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   └── utils.ts  — formatCurrency, formatDate, cn, getStatusColor
└── types/index.ts
```

---

## 18. SUPABASE / DATA RULES

- All table names: English (`motorcycles`, `customers`, `contracts`, `fines`, `maintenance`, `expenses`)
- All column names: English (`name`, `status`, `created_at`, `due_date`, `amount`)
- Queries: use `src/lib/supabase/client.ts` (browser) or `src/lib/supabase/server.ts` (server)
- Types: defined in `src/types/index.ts` — always update when adding new fields

---

## 19. DATA GRID — PADRÃO OBRIGATÓRIO ÚNICO

> **REGRA ABSOLUTA:** Toda tela que exibe listagem de dados DEVE usar exatamente este padrão.
> NUNCA usar o componente `<Table>` genérico. NUNCA inventar variações. NUNCA adaptar "por contexto".
> O grid é sempre igual. O que muda é o conteúdo das colunas, não a estrutura, cores ou comportamento.
> **Referência de verdade:** `/manutencao/page.tsx` — grid perfeito validado pelo usuário.

---

### 19.1 Estrutura completa do grid

```tsx
{/* ─── CONTAINER EXTERNO ───────────────────────────────────────────────────
    NUNCA usar <Card> ou div genérica. Sempre este exato padrão. */}
<div className="overflow-hidden rounded-2xl border border-[#474747] bg-[#202020]">

  {/* ─── SCROLL HORIZONTAL ───────────────────────────────────────────────
      Obrigatório para tabelas não quebrarem em telas menores. */}
  <div className="overflow-x-auto">

    {/* ─── ELEMENTO TABLE ──────────────────────────────────────────────────
        SEMPRE: w-full text-left text-[13px] text-[#f5f5f5]
        text-left → alinha todo conteúdo à esquerda por padrão
        text-[13px] → fonte base de todas as células (compacto, estilo terminal)
        text-[#f5f5f5] → cor base herdada pelas células */}
    <table className="w-full text-left text-[13px] text-[#f5f5f5]">

      {/* ─── CABEÇALHO ───────────────────────────────────────────────────
          SEMPRE: bg-[#323232] text-[#c7c7c7] no <thead>
          bg-[#323232] → fundo cinza médio para separar visualmente do corpo
          text-[#c7c7c7] → cor secundária para labels de coluna */}
      <thead className="bg-[#323232] text-[#c7c7c7]">
        <tr>
          {/* ─── TH PADRÃO ─────────────────────────────────────────────
              h-9 → altura fixa 36px (NÃO usar py-3 nunca)
              px-4 → padding horizontal de 16px
              font-bold → peso 700
              NÃO colocar: text-xs, uppercase, tracking-wider, py-3
              NÃO colocar: text-left (já herdado do <table>)
              NÃO colocar: text-[13px] no próprio <th> */}
          <th className="h-9 px-4 font-bold">Item</th>
          <th className="h-9 px-4 font-bold">Previsão</th>
          <th className="h-9 px-4 font-bold">Situação</th>
          <th className="h-9 px-4 font-bold">Status</th>

          {/* ─── TH DE AÇÕES ───────────────────────────────────────────
              Única coluna com alinhamento diferente: text-right
              Botões de ação sempre alinhados à direita da tabela */}
          <th className="h-9 px-4 text-right font-bold">Ações</th>
        </tr>
      </thead>

      {/* ─── CORPO DA TABELA ─────────────────────────────────────────────
          SEM NENHUMA CLASSE no <tbody>
          NUNCA: divide-y, divide-[#323232], border ou qualquer classe */}
      <tbody>
        {items.map((item) => (
          /* ─── LINHA DA TABELA ────────────────────────────────────────
              h-9 → altura fixa 36px (NÃO usar py em td)
              transition-colors → anima suavemente o hover e o estado
              odd:bg-transparent → linhas ímpares com fundo transparente (herda bg-[#202020] do container)
              even:bg-[#323232] → linhas pares com fundo cinza (zebra)
              hover:bg-[#474747] → hover uniforme em toda a linha
              cursor-pointer → quando a linha inteira é clicável
              NUNCA: border-b, border-t em <tr> */}
          <tr
            key={item.id}
            className="h-9 transition-colors odd:bg-transparent even:bg-[#323232] hover:bg-[#474747] cursor-pointer"
            onClick={() => handleView(item)}
          >

            {/* ─── TD PADRÃO ───────────────────────────────────────────
                px-4 → padding horizontal de 16px
                NUNCA: py-3, py-2 — altura vem do h-16 no <tr>
                NUNCA: text-sm, font-medium no próprio <td>
                O font-medium e cores ficam nos elementos filhos (<p>, <span>) */}
            <td className="px-4">
              {/* Texto principal da célula */}
              <p className="font-medium text-[#f5f5f5]">{item.description}</p>
              {/* Sub-info opcional abaixo do texto principal */}
              <p className="text-xs text-[#616161]">Detalhe secundário</p>
            </td>

            <td className="px-4">
              <p className="text-[#f5f5f5]">{item.value}</p>
            </td>

            <td className="px-4">
              {/* Conteúdo dinâmico — ver seção 19.6 para todas as variações */}
            </td>

            <td className="px-4">
              {/* Badges de status — ver seção 19.7 */}
            </td>

            {/* ─── TD DE AÇÕES ─────────────────────────────────────────
                px-4 text-right → padding + alinhamento à direita
                justify-end nos botões internos */}
            <td className="px-4 text-right">
              <div className="flex items-center justify-end gap-1">
                {/* Botões de ação — ver seção 19.4 */}
              </div>
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

---

### 19.2 Checklist obrigatório — elemento por elemento

| Elemento | String de classes OBRIGATÓRIA | O que NUNCA colocar |
|----------|-------------------------------|---------------------|
| Container externo | `overflow-hidden rounded-2xl border border-[#474747] bg-[#202020]` | `rounded-lg`, `rounded-xl`, `<Card>`, shadow |
| Wrapper scroll | `overflow-x-auto` | nenhum outro |
| `<table>` | `w-full text-left text-[13px] text-[#f5f5f5]` | `text-sm`, `text-right`, componente `<Table>` |
| `<thead>` | `bg-[#323232] text-[#c7c7c7]` | só bg sem o `text-[#c7c7c7]` |
| `<tr>` do header | sem classes adicionais | `bg-[#323232]` no `<tr>` — já está no `<thead>` |
| `<th>` padrão | `h-9 px-4 font-bold` | `py-3`, `py-2`, `text-xs`, `uppercase`, `tracking-wider`, `tracking-widest`, `text-[13px]`, `text-left` |
| `<th>` Ações | `h-9 px-4 text-right font-bold` | alinhar à esquerda |
| `<tbody>` | _(sem classes)_ | `divide-y`, `divide-[#323232]`, qualquer classe |
| `<tr>` dados | `h-9 transition-colors odd:bg-transparent even:bg-[#323232] hover:bg-[#474747]` | `border-b`, `border-t`, `border` |
| `<tr>` clicável | adicionar `cursor-pointer` ao final | `onClick` na `<td>` em vez da `<tr>` |
| `<tr>` histórico dimmed | adicionar `opacity-70` (colapsado) ou `opacity-80` (view direta) | `opacity-50`, `opacity-60` |
| `<td>` padrão | `px-4` | `py-3`, `py-2`, `py-1`, `text-sm`, `font-medium` no td |
| `<td>` Ações | `px-4 text-right` | alinhar à esquerda |

---

### 19.3 Estados obrigatórios (loading / empty)

**Loading — dentro da tabela (quando a tabela já está montada):**
```tsx
<tbody>
  <tr>
    <td colSpan={N}>  {/* N = número total de colunas */}
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#BAFF1A] border-t-transparent" />
      </div>
    </td>
  </tr>
</tbody>
```

**Loading — antes da tabela renderizar (loading da página inteira):**
```tsx
<div className="flex items-center justify-center py-20">
  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#BAFF1A] border-t-transparent" />
</div>
```

**Empty — dentro da tabela:**
```tsx
<tbody>
  <tr>
    <td colSpan={N}>
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-12 h-12 bg-[#323232] rounded-full flex items-center justify-center">
          <IconName className="w-6 h-6 text-[#9e9e9e]" />
        </div>
        <p className="text-[16px] text-[#9e9e9e]">Nenhum item encontrado.</p>
        <button
          onClick={() => { setFilter('all'); setSearch('') }}
          className="text-sm text-[#BAFF1A] hover:underline"
        >
          Limpar filtros
        </button>
      </div>
    </td>
  </tr>
</tbody>
```

**Empty — quando a tabela inteira está ausente (ex: accordions):**
```tsx
<div className="flex flex-col items-center justify-center rounded-2xl border border-[#474747] bg-[#202020] p-16 text-center">
  <IconName className="mb-4 h-12 w-12 text-[#474747]" />
  <p className="text-lg font-medium text-[#f5f5f5]">Nenhum item encontrado.</p>
  <p className="mt-1 text-sm text-[#9e9e9e]">Ajuste os filtros ou cadastre um novo item.</p>
</div>
```

---

### 19.4 Botões de ação — especificação completa e IMUTÁVEL

> **REGRA ABSOLUTA:** Os botões de ação são sempre quadrados (`h-8 w-8 p-0`), só ícone, sem texto.
> A ordem é sempre: **Ver → Editar → (Ação especial) → Excluir**. Nunca inverter. Nunca trocar ícone.
> SEMPRE usar o componente `<Button>`, nunca `<button>` raw nos botões de ação.

```tsx
{/* Layout container dos botões — sempre igual */}
<div className="flex items-center justify-end gap-1">

  {/* 1º botão: Ver detalhes ─────────────────────────────────────────────
      variant="secondary" → bg-[#323232] text-[#f5f5f5] hover:bg-[#474747]
      size="sm" → dimensões sm do componente Button
      className="h-8 w-8 p-0" → quadrado fixo 32×32px, sem padding interno
      title → tooltip nativo do browser
      e.stopPropagation() → não acionar onClick da <tr> */}
  <Button
    variant="secondary"
    size="sm"
    className="h-8 w-8 p-0"
    title="Ver detalhes"
    onClick={(e) => { e.stopPropagation(); handleView(item) }}
  >
    <Eye className="h-4 w-4" />
    {/* h-4 w-4 → 16px — tamanho obrigatório dentro de botões compactos h-8 w-8 */}
  </Button>

  {/* 2º botão: Editar ───────────────────────────────────────────────────
      Mesmo padrão exato do Ver, só muda variant e ícone */}
  <Button
    variant="secondary"
    size="sm"
    className="h-8 w-8 p-0"
    title="Editar"
    onClick={(e) => { e.stopPropagation(); handleEdit(item) }}
  >
    <Edit2 className="h-4 w-4" />
  </Button>

  {/* 3º botão: Ação especial (OPCIONAL — ex: Concluir, Aprovar, Pagar) ──
      Entra ENTRE Editar e Excluir quando existir
      variant="primary" → bg-[#BAFF1A] text-[#121212] */}
  <Button
    variant="primary"
    size="sm"
    className="h-8 w-8 p-0"
    title="Registrar conclusão"
    onClick={(e) => { e.stopPropagation(); handleComplete(item) }}
  >
    <CheckCircle2 className="h-4 w-4" />
  </Button>

  {/* Último botão: Excluir ──────────────────────────────────────────────
      SEMPRE o último. variant="danger" → bg-[#bf1d1e] text-[#f5f5f5] */}
  <Button
    variant="danger"
    size="sm"
    className="h-8 w-8 p-0"
    title="Excluir"
    onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
  >
    <Trash2 className="h-4 w-4" />
  </Button>

</div>
```

**Tabela de referência dos botões de ação:**

| Posição | Ação | Ícone Lucide | Variante | Cor resultante |
|---------|------|-------------|----------|---------------|
| 1º | Ver detalhes | `Eye` | `secondary` | `bg-[#323232]` |
| 2º | Editar | `Edit2` | `secondary` | `bg-[#323232]` |
| 3º (se existir) | Ação especial | contextual | `primary` | `bg-[#BAFF1A]` |
| Último | Excluir | `Trash2` | `danger` | `bg-[#bf1d1e]` |

**Ícone dentro do botão de ação:** SEMPRE `h-4 w-4` — nunca `h-5 w-5` em botões `h-8 w-8 p-0`.

---

### 19.5 Barra de filtros — estrutura completa

```tsx
{/* ─── WRAPPER DA BARRA DE FILTROS ─────────────────────────────────────────
    flex-col em mobile, flex-row em sm+
    justify-between separa pílulas (esquerda) de dropdowns+busca (direita) */}
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

  {/* ─── ESQUERDA: PÍLULAS DE STATUS ──────────────────────────────────────
      Filtros rápidos por status ou agrupamento principal.
      Ativo: bg-[#BAFF1A] text-[#121212] (lime sólido)
      Inativo: bg-[#202020] border border-[#474747] text-[#9e9e9e]
      Hover inativo: hover:text-[#f5f5f5] hover:border-[#616161] */}
  <div className="flex gap-2 flex-wrap">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        onClick={() => setStatusFilter(tab.value)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          statusFilter === tab.value
            ? 'bg-[#BAFF1A] text-[#121212]'
            : 'bg-[#202020] border border-[#474747] text-[#9e9e9e] hover:text-[#f5f5f5] hover:border-[#616161]'
        }`}
      >
        {tab.label}
        {/* Contador: ml-1.5 opacity-70 — NUNCA badge separado, sempre inline */}
        {tab.count > 0 && (
          <span className="ml-1.5 opacity-70">({tab.count})</span>
        )}
      </button>
    ))}
  </div>

  {/* ─── DIREITA: DROPDOWNS + BUSCA ───────────────────────────────────────
      Dropdowns de refinamento por tipo, moto, etc. + campo de busca textual.
      Todos com h-10 rounded-full — NUNCA rounded-lg aqui */}
  <div className="flex items-center gap-2 flex-wrap">

    {/* Dropdown de agrupamento (ex: por moto) ─────────────────────────────
        h-10 → altura 40px
        rounded-full → pílula (consistente com as pílulas de status)
        border border-[#474747] → borda cinza padrão
        bg-[#202020] → fundo card
        px-3 → padding interno
        text-sm text-[#f5f5f5] → fonte sm, cor primária
        focus:border-[#BAFF1A] → destaque verde no foco
        focus:outline-none → remove outline padrão do browser */}
    <select
      value={motorcycleFilter}
      onChange={(e) => setMotorcycleFilter(e.target.value)}
      className="h-10 rounded-full border border-[#474747] bg-[#202020] px-3 text-sm text-[#f5f5f5] focus:border-[#BAFF1A] focus:outline-none"
    >
      <option value="">Todas as motos</option>
      {motorcycles.map((m) => (
        {/* className="bg-[#202020]" obrigatório em cada <option> */}
        <option key={m.id} value={m.id} className="bg-[#202020]">
          {m.license_plate} — {m.make} {m.model}
        </option>
      ))}
    </select>

    {/* Dropdown por tipo ───────────────────────────────────────────────────
        Mesmo padrão exato do dropdown de moto */}
    <select
      value={typeFilter}
      onChange={(e) => setTypeFilter(e.target.value)}
      className="h-10 rounded-full border border-[#474747] bg-[#202020] px-3 text-sm text-[#f5f5f5] focus:border-[#BAFF1A] focus:outline-none"
    >
      <option value="all">Todos os tipos</option>
      <option value="preventive">Preventiva</option>
      <option value="corrective">Corretiva</option>
    </select>

    {/* Campo de busca textual ──────────────────────────────────────────────
        Posição relativa para o ícone absoluto funcionar
        pl-9 → espaço para o ícone de lupa à esquerda
        pr-4 → padding direito padrão
        w-44 → largura fixa 176px */}
    <div className="relative">
      {/* Ícone da lupa: absolute, centralizado verticalmente, cor [#616161] */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#616161]" />
      <input
        type="text"
        placeholder="Buscar..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="h-10 rounded-full border border-[#474747] bg-[#202020] pl-9 pr-4 text-sm text-[#f5f5f5] placeholder:text-[#616161] focus:border-[#BAFF1A] focus:outline-none w-44"
      />
    </div>

  </div>
</div>
```

**Tabela de referência dos filtros:**

| Elemento | String de classes completa |
|----------|---------------------------|
| Wrapper geral | `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between` |
| Grupo pílulas | `flex gap-2 flex-wrap` |
| Pílula base | `px-4 py-2 rounded-full text-sm font-medium transition-all` |
| Pílula ATIVA | `+ bg-[#BAFF1A] text-[#121212]` |
| Pílula INATIVA | `+ bg-[#202020] border border-[#474747] text-[#9e9e9e] hover:text-[#f5f5f5] hover:border-[#616161]` |
| Contador na pílula | `ml-1.5 opacity-70` dentro de `<span>` inline |
| Grupo direita | `flex items-center gap-2 flex-wrap` |
| `<select>` dropdown | `h-10 rounded-full border border-[#474747] bg-[#202020] px-3 text-sm text-[#f5f5f5] focus:border-[#BAFF1A] focus:outline-none` |
| `<option>` | `className="bg-[#202020]"` em cada um |
| Container busca | `relative` |
| Ícone lupa | `absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#616161]` |
| `<input>` busca | `h-10 rounded-full border border-[#474747] bg-[#202020] pl-9 pr-4 text-sm text-[#f5f5f5] placeholder:text-[#616161] focus:border-[#BAFF1A] focus:outline-none w-44` |

---

### 19.6 Tipografia das células — guia completo

Toda a tipografia fica nos elementos filhos dentro de `<td className="px-4">`. O `<td>` em si nunca recebe font-size, font-weight ou color.

**Texto principal da célula (linha 1):**
```tsx
<p className="font-medium text-[#f5f5f5]">Nome do item</p>
```

**Sub-informação abaixo do texto principal (linha 2):**
```tsx
<p className="text-xs text-[#616161]">Detalhe secundário — ex: "Atual: 12.000 km"</p>
```

**Placa / código / dado monoespaçado:**
```tsx
<span className="font-mono font-bold text-[#f5f5f5] tracking-widest">ABC1D23</span>
```

**Dado numérico / valor / KM:**
```tsx
<p className="text-[#f5f5f5]">15.000 km</p>
```

**Dado secundário simples (sem peso especial):**
```tsx
<p className="text-[#c7c7c7]">Honda CG 160</p>
```

**Dado de histórico (concluído, dimmed):**
```tsx
{/* A linha <tr> recebe opacity-70 ou opacity-80, e o texto muda para [#c7c7c7] */}
<p className="text-[#c7c7c7]">Troca de óleo</p>
```

**Valor monetário em destaque (brand):**
```tsx
<span className="font-bold text-[#BAFF1A]">{formatCurrency(value)}</span>
```

**Dado ausente / vazio:**
```tsx
<span className="text-[#9e9e9e]">—</span>
```

**Texto de situação dinâmica (ex: "Faltam 500km", "Vencida há 3 dias"):**
```tsx
{/* Vencida / erro */}
<span className="text-sm font-medium text-[#ff9c9a]">Vencida há 1.000 km</span>

{/* Próxima / urgente (≤ threshold) */}
<span className="text-sm font-medium text-[#e65e24]">Faltam 80 km</span>

{/* Normal / longe do vencimento */}
<span className="text-sm font-medium text-[#9e9e9e]">Faltam 3.500 km</span>

{/* Concluída — exibe texto auxiliar como oficina */}
<span className="text-xs text-[#9e9e9e]">Oficina do Careca</span>
```

**Dois elementos empilhados na mesma célula (dado + subinfo):**
```tsx
<td className="px-4">
  <div>
    {/* Linha 1: dado principal */}
    <p className="text-[#f5f5f5]">15.000 km</p>
    {/* Linha 2: contexto ou sub-info */}
    <p className="text-xs text-[#616161]">Atual: 12.400 km</p>
  </div>
</td>
```

**Ícone + texto lado a lado (ex: usuário com nome):**
```tsx
<td className="px-4">
  <div className="flex items-center gap-1.5">
    <User className="w-4 h-4 text-[#a880ff] flex-shrink-0" />
    <span className="text-[#f5f5f5] truncate">{customer.name}</span>
  </div>
</td>
```

---

### 19.7 Badges de status dentro das células

**Badge de status de manutenção (ou qualquer status semântico):**
```tsx
{/* Base obrigatória para todos os badges */}
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#7c1c1c] text-[#ff9c9a]">
  Vencida
</span>
```

| Status | bg | text | Label |
|--------|----|------|-------|
| Vencida / erro | `bg-[#7c1c1c]` | `text-[#ff9c9a]` | "Vencida" |
| Próxima / warning | `bg-[#3a180f]` | `text-[#e65e24]` | "Próxima" |
| Agendada / info | `bg-[#2d0363]` | `text-[#a880ff]` | "Agendada" |
| Concluída / success | `bg-[#0e2f13]` | `text-[#28b438]` | "Concluída" |
| Ativo | `bg-[#0e2f13]` | `text-[#28b438]` | "Ativo" |
| Inativo / neutro | `bg-[#323232]` | `text-[#c7c7c7]` | "Inativo" |
| Brand / destaque | `bg-[#243300]` | `text-[#BAFF1A]` | contextual |

**Badge com bordas (ex: selo de manutenção em dia):**
```tsx
<span className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0e2f13] border border-[#28b438] text-[#28b438] text-xs font-medium">
  <CheckCircle className="w-3.5 h-3.5" />
  Manutenção em Dia
</span>
```

---

### 19.8 Linhas de histórico (dimmed / concluído)

Quando a tabela exibe registros históricos (itens concluídos), a linha inteira recebe opacidade reduzida:

```tsx
{/* Histórico na view direta (aba "Concluídas") */}
<tr className="h-16 transition-colors odd:bg-transparent even:bg-[#323232] hover:bg-[#474747] opacity-80">

{/* Histórico na gaveta colapsável */}
<tr className="h-16 transition-colors odd:bg-transparent even:bg-[#323232] hover:bg-[#474747] opacity-70">
```

O texto dentro dessas linhas usa `text-[#c7c7c7]` em vez de `text-[#f5f5f5]` para reforçar o estado dimmed.

---

### 19.9 Anti-patterns do grid

| Errado | Correto | Motivo |
|--------|---------|--------|
| `<Table columns={...} data={...} />` | `<table>` HTML puro | Componente genérico viola o padrão |
| `<Card>` envolvendo a tabela | `<div className="overflow-hidden rounded-2xl border border-[#474747] bg-[#202020]">` | Card não tem overflow-hidden correto |
| `<div>` grid fake como tabela | `<table><thead><tbody>` HTML semântico | Grid fake não respeita acessibilidade nem padrão |
| `font-medium` no `<td>` | `font-medium` no `<p>` filho | td só recebe px-4, estilo fica nos filhos |
| `text-sm` no `<td>` | `text-sm` nos filhos quando necessário | Herda text-[16px] do `<table>` |
| `py-3` no `<td>` ou `<th>` | `h-16` no `<tr>` | Altura vem da linha, nunca do padding |
| `divide-y` no `<tbody>` | `odd/even` no `<tr>` | Zebra via odd/even, sem borders |
| `border-b` no `<tr>` | `hover:bg-[#474747]` no `<tr>` | Separação visual vem do hover e zebra |
| `text-xs uppercase tracking-wider` no `<th>` | `font-bold` puro | Headers nunca decorados |
| Botão de ação com texto | `h-8 w-8 p-0` só ícone | Botões de ação são sempre icônicos |
| `h-5 w-5` dentro de `h-8 w-8 p-0` | `h-4 w-4` | Ícone 16px em botão 32px compacto |
| `variant="ghost"` nos botões Ver/Editar | `variant="secondary"` | Ghost não tem contraste suficiente |
| Ordem Excluir → Editar | Ver → Editar → (especial) → Excluir | Ordem é imutável |
| `<button>` raw nos botões de ação | `<Button>` component | Component garante hover/scale/transition |
| Busca fora da barra de filtros | Busca dentro do wrapper `justify-between` | Estrutura unificada é obrigatória |
| Filtro com `rounded-lg` | `rounded-full` | Filtros são sempre pílulas |
| `focus:ring` ou `focus:border-[#BAFF1A]/50` nos filtros | `focus:border-[#BAFF1A]` sólido | Sem transparência em borders de foco |
| Transparência `/10` `/20` `/30` em qualquer cor semântica | Cores hex sólidas da seção 1 | Anti-pattern global do design system |

---

## 20. CODE CONVENTIONS

- All code: **English** (variables, functions, types, files, routes, DB columns)
- UI labels: Portuguese Brasil (what users see on screen)
- Comments/JSDoc: Portuguese Brasil
- TypeScript strict — no `any`, always type interfaces
- `'use client'` required on pages with useState/useEffect/event handlers
- Format currency: `formatCurrency(value)` from `src/lib/utils.ts`
- Format dates: `formatDate(date)` from `src/lib/utils.ts`
- Status colors: `getStatusColor(status)` from `src/lib/utils.ts`
- **Grids/tabelas:** seguir OBRIGATORIAMENTE a seção 19 — sem exceções
