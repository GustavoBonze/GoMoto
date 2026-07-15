---
tags: [projeto/gomoto, projeto/tela, gomoto/contratos]
---

# 📄 Tela: Contratos — [[GoMoto]]

> Projeto: [[GoMoto]]

Rota: `/contratos` | Tipo: Client Component

> ⚠️ Esta tela exibe os **contratos de locação individuais** (criados na tela [[Fila]]) e gerencia os **modelos .docx** para geração automatizada.

## Layout

- **Header** com botão "Modelos .docx" (abre modal de templates)
- **Barra de filtros**: 5 pílulas de status + busca textual
- **Tabela** com 7 colunas
- Clicar na linha → abre **modal de detalhes** do contrato

## Filtros

| Filtro | Valores |
|---|---|
| Pílulas | Todos / Ativos / Encerrados / Cancelados / Rescindidos |
| Busca textual | `customer.name`, `motorcycle.license_plate`, `motorcycle.model` |

## Colunas da Tabela

| Coluna | Conteúdo |
|---|---|
| Cliente | Ícone `User` (roxo `#a880ff`) + `customer.name` bold |
| Moto | Ícone `Bike` (cinza) + `{make} {model}` • placa `font-mono font-bold` |
| Tipo | `Fidelidade` (roxo) ou `Locação` (cinza) |
| Período | `start_date → expectedEndDate` (→ calculado: +2 anos para fidelidade, `end_date` para locação) |
| Valor/mês | `monthly_amount` em `text-[#BAFF1A] font-medium` |
| Status | Ponto colorido (verde/laranja/vermelho de vigência) + `<StatusBadge>` |
| Ações | `Eye` (detalhes), `FileDown` (baixar preenchido) + `Upload` (enviar assinado) **OU** `Eye` (ver assinado se `pdf_url` existe) |

**Ponto de vigência (Status):**
- 🟢 verde — vigência mínima cumprida
- 🟠 laranja — dentro da vigência mínima (encerramento gera multa)
- 🔴 vermelho — contrato vencido (passou do end_date)

## Modal de Detalhes (abre ao clicar na linha)

Seções:
1. **Cabeçalho** — nome do cliente + moto + placa
2. **Badge de tipo** — Fidelidade (roxo) ou Locação (cinza)
3. **3 cards**: Início · Encerramento · Valor/mês
4. **Bloco de vigência** colorido (verde/laranja/vermelho) com label + detalhe + tempo restante
5. **Regras do contrato** — bullets com as penalidades de acordo com o tipo
6. **Botão "Encerrar Contrato"** (vermelho, só aparece se `status === 'active'`)

## Fluxo de Encerramento (3 etapas em modais sequenciais)

### Etapa 1 — Quem está encerrando?
Dois cards grandes:
- **Cliente** (hover laranja) → avança para etapa "cliente" | avisa multa de R$ 1.000,00
- **Empresa** (hover verde) → avança para etapa "empresa" | sem multa

### Etapa 2a — Encerramento pelo Cliente
- Bloco de aviso vermelho: multa de R$ 1.000,00
- Botão "Confirmar e Gerar Multa"
- Efeitos:
  - `contracts.status = 'cancelled'`, `contracts.end_date = hoje`
  - `INSERT INTO fines` (`responsible: 'customer'`, `amount: 1000`, `status: 'pending'`)
  - `motorcycles.status = 'available'`

### Etapa 2b — Encerramento pela Empresa
- Textarea para motivo (mínimo 50 caracteres) com contador
- Botão desabilitado até atingir 50 chars
- Efeitos:
  - `contracts.status = 'cancelled'`, `contracts.end_date = hoje`, `contracts.observations = motivo`
  - `motorcycles.status = 'available'`
  - Sem multa

## Regras de Negócio por Tipo

| Tipo | Vigência mínima | Multa (cliente encerra) | Multa (empresa encerra) |
|---|---|---|---|
| `locacao` | 3 meses | R$ 1.000,00 | Sem multa |
| `fidelidade` | 2 anos | R$ 1.000,00 | Sem multa |

## Modal de Modelos .docx (botão no Header)

Dois cards de template (`locacao` e `fidelidade`):
- **Sem arquivo**: botão "Enviar" (Upload)
- **Com arquivo**: Eye (visualizar) + FileEdit (substituir) + Trash2 (remover)

Grade de variáveis: `{{data_hoje}}`, `{{nome_cliente}}`, `{{cpf_cliente}}`, `{{placa_moto}}`, `{{modelo_moto}}`, `{{valor_semanal}}`, `{{km_inicial}}`, `{{data_inicio}}`

## Geração de DOCX preenchido (`docxtemplater` + `pizzip`)

Quando clicar em `FileDown`:
1. Busca `file_url` do template no state
2. `fetch(file_url)` → `ArrayBuffer`
3. `PizZip` + `Docxtemplater` (import dinâmico)
4. `doc.render({ ...variáveis do contrato... })`
5. `doc.getZip().generate({ type: 'blob' })` → download automático

## Queries Supabase

```sql
-- Fetch contratos (com joins)
SELECT *, customer:customers(id, name, phone, cpf),
          motorcycle:motorcycles(id, model, make, license_plate, km_current)
FROM contracts ORDER BY created_at DESC

-- Fetch templates
SELECT * FROM contract_templates

-- Encerrar contrato
UPDATE contracts SET status='cancelled', end_date=today, observations=? WHERE id=?
UPDATE motorcycles SET status='available' WHERE id=?

-- Criar multa (encerramento pelo cliente)
INSERT INTO fines (customer_id, motorcycle_id, description, amount, infraction_date, due_date, status, responsible)

-- Upload contrato assinado
STORAGE: contract-templates/signed/{contract_id}.{ext}
UPDATE contracts SET pdf_url=? WHERE id=?

-- Upload template
STORAGE: contract-templates/models/{slug}_template.docx
UPSERT contract_templates (slug, name, description, file_url, updated_at)
```

## Estados

| Estado | Renderização |
|---|---|
| `loading` | Spinner `border-[#BAFF1A]` centralizado |
| Vazio | Ícone `FileText` + "Nenhum contrato encontrado." + "Limpar filtros" |
| `uploading` | `Button loading={true}` no slug ativo |
| `terminating` | `Button loading={true}` no modal de confirmação |
