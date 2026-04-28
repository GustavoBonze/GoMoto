# 📈 Tela: Relatórios — [[GoMoto]]

Rota: `/relatorios` | Tipo: Client Component

> Tela em desenvolvimento. Exibe cards de relatórios planejados — todos bloqueados com badge "Em breve".

## KPI Cards (mock — dados estáticos)

| Card | Valor |
|---|---|
| Receita | R$ 3.850 |
| Despesas | R$ 2.030 |
| Saldo | R$ 1.820 |
| Contratos Ativos | 2 |
| Cobranças Pendentes | 2 |
| Multas | R$ 618,86 |

Grid: 2 cols mobile → 3 tablet → 6 desktop.

## Relatórios Planejados (todos indisponíveis)

| ID | Título | Descrição | Cor |
|---|---|---|---|
| `financeiro-mensal` | Financeiro Mensal | Entradas, despesas, saldo, comparativo com mês anterior | brand |
| `por-moto` | Por Moto | Histórico de locações, manutenções e receita por moto | info |
| `por-cliente` | Por Cliente | Histórico de contratos, cobranças e inadimplência por cliente | success |
| `fluxo-caixa` | Fluxo de Caixa | Projeção de entradas/saídas nos próximos 30/60/90 dias | warning |

## Interação

`handleGenerateReport()` → toast de 3 segundos: "Este relatório ainda não está disponível."

Toast: bg `#202020`, border `#6b9900`, ponto `#BAFF1A`.

## Mapeamento de Cores (REPORT_COLOR_MAP)

```typescript
brand:   { bg: '#243300', text: '#BAFF1A', border: '#6b9900' }
success: { bg: '#0e2f13', text: '#229731', border: '#28b438' }
warning: { bg: '#3a180f', text: '#e65e24', border: '#e65e24' }
danger:  { bg: '#7c1c1c', text: '#ff9c9a', border: '#ff9c9a' }
info:    { bg: '#2d0363', text: '#a880ff', border: '#a880ff' }
```

## Tags
`#projeto/tela` `#gomoto/relatorios` `#ideia/futuro`
