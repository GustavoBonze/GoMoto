# 📄 Tela: Contratos — [[GoMoto]]

Rota: `/contratos` | Tipo: Client Component

> ⚠️ Esta tela é de **modelos de contrato (.docx)**, não de contratos de locação individuais. Os contratos de locação são criados na tela [[Fila]] (ao fechar contrato).

## Layout

Grid de 2 cards — um por modelo pré-configurado.

## Modelos Pré-configurados (Hardcoded)

| Slug | Nome | Descrição |
|---|---|---|
| `locacao` | Contrato de Locacao | Padrão semanal sem fidelidade |
| `fidelidade` | Contrato com Fidelidade | Modelo com permanência mínima |

## Ações por Card

| Ação | Condição | Efeito |
|---|---|---|
| **Fazer Upload / Substituir** | Sempre | Abre seletor de arquivo (aceita apenas `.docx`), faz upload para Storage |
| **Baixar** | Se há arquivo | Abre `file_url` em nova aba |
| **Remover** | Se há arquivo | `confirm()` nativo → anula `file_url` e `updated_at` no banco (não deleta Storage) |

## Fluxo de Upload

1. Valida: arquivo `.docx` + slug ativo definido
2. Upload para Supabase Storage: bucket `contract-templates`, path `models/{slug}_template.docx`, `upsert: true`
3. Upsert em `contract_templates`: `slug`, `name`, `description`, `file_url` (via `getPublicUrl()`), `updated_at`
4. Limpa state + input file

## Variáveis Dinâmicas Suportadas nos Modelos

| Tag | Descrição |
|---|---|
| `{{data_hoje}}` | Data atual |
| `{{nome_cliente}}` | Nome do locatário |
| `{{cpf_cliente}}` | CPF do locatário |
| `{{placa_moto}}` | Placa da moto |
| `{{modelo_moto}}` | Modelo da moto |
| `{{valor_semanal}}` | Valor semanal |
| `{{km_inicial}}` | KM inicial |
| `{{data_inicio}}` | Data de início |

## Queries Supabase

```sql
-- Fetch inicial
SELECT * FROM contract_templates

-- Upload (upsert)
-- Storage: contract-templates/models/{slug}_template.docx
UPSERT contract_templates (slug, name, description, file_url, updated_at)

-- Remover
UPDATE contract_templates SET file_url = null, updated_at = null WHERE slug = ?
```

## Merge Local + Banco

`fetchTemplates()` busca dados do banco e faz merge por `slug` com os 2 modelos hardcoded. Garante que os modelos sempre aparecem mesmo sem entrada no banco.

## Estados

| Estado | Renderização |
|---|---|
| `uploading` | String (slug em upload) — botão com spinner |
| `success` | Mensagem "Modelo atualizado com sucesso!" |
| `error` | Mensagem "Falha no upload do arquivo." |

## Tags
`#projeto/tela` `#gomoto/contratos`
