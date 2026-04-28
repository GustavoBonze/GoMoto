# 🗂️ Storage Supabase — [[GoMoto]]

Buckets de armazenamento de arquivos do projeto.

## Buckets existentes

| Bucket | Público | Uso |
|---|---|---|
| `contract-templates` | ✅ Sim | Modelos de contrato `.docx` |
| `expense-files` | ✅ Sim | Notas fiscais e anexos de despesas |
| `customers` | ✅ Sim | Fotos de documentos dos clientes (CNH, comprovante) |

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

## ⚠️ Avisos

- **RLS do Storage NÃO é configurada automaticamente** — precisa configurar manualmente no painel do Supabase se quiser restringir acesso
- Atualmente todos os buckets são públicos (qualquer um com a URL pode acessar)
- Deletar registro no banco **não deleta o arquivo no Storage** — fica órfão

## Tags
`#projeto/storage` `#stack/supabase`
