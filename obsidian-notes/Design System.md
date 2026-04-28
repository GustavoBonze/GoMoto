# 🎨 Design System — [[GoMoto]]

Inspirado no InfinitePay dark theme. Tokens extraídos do código real.

## Paleta de Cores

| Token | Cor | Hex | Uso |
|---|---|---|---|
| **Brand** | Verde limão | `#BAFF1A` | Botões primary, highlights, focus ring, badges brand |
| **Background** | Preto quase puro | `#121212` | Fundo geral da aplicação |
| **Surface** | Cinza escuro | `#202020` | Cards, modais, dropdowns |
| **Border** | Cinza médio | `#474747` | Linhas, divisores, bordas de input |
| **Hover** | Cinza ligeiro | `#323232` | Hover em itens de lista, botões secondary |
| **Text Primary** | Branco ligeiro | `#f5f5f5` | Corpo, headings |
| **Text Secondary** | Cinza claro | `#c7c7c7` | Labels, hints, subtítulos |
| **Text Muted** | Cinza médio | `#9e9e9e` | Desabilitados, placeholders |
| **Success** | Verde | `#229731` | Status disponível, pagamento OK |
| **Warning** | Laranja | `#e65e24` | Atenção, pendente |
| **Danger** | Vermelho | `#ff9c9a` | Erro, vencido, crítico |
| **Info** | Roxo | `#a880ff` | Informação, alugado |

## Tipografia

- **Font:** System UI / Inter (herda do Tailwind)
- **Tamanhos:**

| Classe | px | Uso |
|---|---|---|
| `text-[12px]` | 12 | Dicas, badges pequenas |
| `text-[13px]` | 13 | **Body padrão de tabelas** (preferência do usuário) |
| `text-[14px]` | 14 | Labels, subtítulos |
| `text-[16px]` | 16 | Padrão geral |
| `text-[20px]` | 20 | Subtítulos de seção |
| `text-[28px]` | 28 | Headings de página |

> ⚠️ Tabelas usam `h-9 text-[13px]` — menor que o padrão InfinitePay (`h-16 / text-[16px]`). É preferência explícita do usuário.

## Espaçamento e Layout

- **Padding de cards:** `p-5` ou `p-6`
- **Gap entre itens:** `gap-4` ou `gap-6`
- **Altura de inputs:** `h-10` (40px)
- **Altura de botões:** `h-10` (40px) ou `h-9` (36px) sm
- **Altura de linhas de tabela:** `h-9` (36px)

## Border Radius

| Classe | px | Uso |
|---|---|---|
| `rounded-lg` | 8 | Inputs, badges, elementos pequenos |
| `rounded-xl` | 12 | Cards, modais |
| `rounded-2xl` | 16 | Cards maiores, containers |
| `rounded-full` | 9999 | Badges pill, avatares |

## Transições e Animações

```css
transition-all duration-150     /* Padrão rápido */
transition-colors duration-300  /* Mudança de cor */
hover:scale-[1.025]             /* Botão cresce ao hover */
active:scale-95                 /* Botão encolhe ao clicar */
animate-spin                    /* Loading spinners */

/* Modais: */
fade-in zoom-in-95 slide-in-from-top-4
```

## Sombras e Profundidade

- Sem box-shadow — profundidade via bordas e fundo levemente diferente
- Borda padrão: `border border-[#474747]`
- Cards elevados: `border-[#474747]` com fundo `#202020` sobre `#121212`

## Padrões de Interação

- **Focus:** `focus:border-[#BAFF1A] focus:ring-1 focus:ring-[#BAFF1A]`
- **Hover estado:** fundo sobe de `#202020` → `#323232`
- **Botão hover:** `hover:bg-[#a8e617]` (brand escurece)
- **Disabled:** opacidade reduzida + `cursor-not-allowed`

## Tags
`#projeto/design` `#design/tokens`
