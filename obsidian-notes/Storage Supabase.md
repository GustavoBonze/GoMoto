---
tags: [projeto/gomoto, gomoto/storage, stack/supabase]
---

# 🗂️ Storage Supabase — [[GoMoto]]

> Projeto: [[GoMoto]]

Buckets de armazenamento de arquivos do projeto.

## Buckets existentes

| Bucket | Público | Uso |
|---|---|---|
| `contract-templates` | ✅ Sim | Modelos de contrato `.docx` |
| `expense-files` | ✅ Sim | Notas fiscais e anexos de despesas |
| `customers` | ✅ Sim | Fotos de documentos dos clientes (CNH, comprovante) |
| `maintenance-files` | ✅ Sim | Fotos de odômetro (KM) e nota fiscal de manutenções |

## Paths por bucket

### `contract-templates`
```
models/{slug}_template.docx
```
- `slug` = `locacao` ou `fidelidade`
- Upload: `upsert: true` (sobrescreve se já existe)
- Acesso: `getPublicUrl()` retorna URL pública

### `expense-files`
```
expenses/invoice_{timestamp}_{random}.{ext}
expenses/attachment_{timestamp}_{random}.{ext}
```
- `ext` = extensão do arquivo original (pdf, jpg, png, webp)
- Remoção: apenas a referência no banco é apagada — o arquivo fica no Storage

### `customers`
```
customers/{customer_id}/cnh_{timestamp}.{ext}
customers/{customer_id}/residencia_{timestamp}.{ext}
```
- Subpasta por `customer_id` (UUID)
- Aceita: `.pdf`, `image/*`
- Salvo em: `customers.drivers_license_photo_url` e `customers.document_photo_url`

### `maintenance-files`
```
maintenance/{prefix}_{timestamp}_{random}.{ext}
```
- `prefix` = `km` (foto do odômetro) ou `nf` (nota fiscal / recibo)
- Limite: 10 MB, apenas imagens
- Upload via **Server Action** `uploadMaintenancePhoto()` com `service_role` — sem policies RLS necessárias
- Salvo em: `maintenances.odometer_photo_url` e `maintenances.invoice_photo_url`

## Como fazer upload (padrão)

```typescript
const supabase = createClient()

const fileExt = file.name.split('.').pop()
const path = `pasta/${Date.now()}_${Math.random()}.${fileExt}`

const { error: uploadError } = await supabase.storage
  .from('nome-do-bucket')
  .upload(path, file, { upsert: true })

if (uploadError) throw uploadError

const { data: { publicUrl } } = supabase.storage
  .from('nome-do-bucket')
  .getPublicUrl(path)

// publicUrl = URL pública para salvar no banco
```

## Como fazer upload via service_role (maintenance-files)

```typescript
// actions.ts — Server Action
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const path = `maintenance/${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
await supabaseAdmin.storage.from('maintenance-files').upload(path, file)
const { data } = supabaseAdmin.storage.from('maintenance-files').getPublicUrl(path)
// data.publicUrl → salvar no banco
```

## Scripts de setup

| Arquivo | O que faz |
|---|---|
| `scripts/create-maintenance-bucket.mjs` | Cria o bucket `maintenance-files` via API Supabase (requer `SUPABASE_SERVICE_ROLE_KEY`) |
| `scripts/create-maintenance-policies.mjs` | Tenta criar RLS policies via `rpc(exec_sql)` ou fallback HTTP |
| `supabase/create-maintenance-bucket.sql` | DDL equivalente: cria bucket + 3 policies (leitura pública, upload autenticado, deleção autenticada) |

> Rodar os scripts **uma vez** ao configurar ambiente novo, ou aplicar o `.sql` direto no SQL Editor do Supabase.

## ⚠️ Avisos

- **RLS do Storage NÃO é configurada automaticamente** — precisa configurar manualmente no painel do Supabase se quiser restringir acesso
- Atualmente todos os buckets são públicos (qualquer um com a URL pode acessar)
- Deletar registro no banco **não deleta o arquivo no Storage** — fica órfão
- `maintenance-files` usa `service_role` no upload para contornar RLS sem precisar configurar policies
