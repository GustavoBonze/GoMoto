# 🔧 Utilitários e Libs — [[GoMoto]]

## src/lib/utils.ts

### `cn(...inputs)`
```typescript
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

cn('px-4', condition && 'bg-red-500', 'text-white')
// → resolve conflitos de Tailwind, mescla condicionalmente
```

### `formatCurrency(value: number): string`
```typescript
formatCurrency(1250)  // → "R$ 1.250,00"
// Usa Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
```

### `formatDate(date: string | Date): string`
```typescript
formatDate('2024-03-19')  // → "19/03/2024"
// Usa Intl.DateTimeFormat('pt-BR')
```

---

## src/lib/schemas.ts (Zod)

Validações de formulário espelhando o banco. Usadas antes de enviar ao Supabase.

```typescript
import { z } from 'zod'

const MotorcycleSchema = z.object({
  license_plate: z.string().min(7).max(8),
  model: z.string().min(2),
  make: z.string().min(2),
  year: z.number().min(1990).max(2030),
  // ...
})
```

Schemas existentes: `MotorcycleSchema`, `CustomerSchema`, `BillingSchema`, `IncomeSchema`, `ExpenseSchema`, `FineSchema`, `MaintenanceBootstrapSchema`

---

## src/lib/supabase/client.ts

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Usado em **Client Components** (`'use client'`).

---

## src/lib/supabase/server.ts

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(url, key, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: ... }
  })
}
```

Usado em **Server Components**, Route Handlers e Middleware.

---

## src/lib/audit.ts

Funções para registrar ações na tabela `audit_logs`:

```typescript
logAudit({
  action: 'create',
  table_name: 'motorcycles',
  record_id: moto.id,
  new_data: moto,
})
```

> ⚠️ Implementado mas não chamado em todos os CRUDs ainda.

---

## src/lib/file-validation.ts

Validação de uploads de arquivo (fotos, notas fiscais):
- Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- Tamanho máximo: configurável (tipicamente 5MB)

---

## Bibliotecas de terceiros

| Lib | Versão | Uso |
|---|---|---|
| `@supabase/ssr` | ^0.9.0 | Cliente Supabase para Next.js (SSR-safe) |
| `@supabase/supabase-js` | ^2.99.0 | SDK Supabase |
| `leaflet` | ^1.9.4 | Mapa interativo de motos |
| `recharts` | ^3.8.1 | Gráficos no dashboard e relatórios |
| `lucide-react` | ^0.577.0 | Ícones (SVG, tree-shakeable) |
| `zod` | ^4.3.6 | Validação de schemas/formulários |
| `clsx` | ^2.1.1 | Classes condicionais |
| `tailwind-merge` | ^3.5.0 | Resolve conflitos de classes Tailwind |

## Tags
`#projeto/libs` `#stack/typescript`
