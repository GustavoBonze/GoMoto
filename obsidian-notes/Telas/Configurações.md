# ⚙️ Tela: Configurações — [[GoMoto]]

Rota: `/configuracoes` | Tipo: Client Component

## Seções

### 1. Dados da Empresa (ícone Building2 `#BAFF1A`)

Grid 2 colunas (md+):

| Campo | Chave no banco |
|---|---|
| Nome da Empresa | `empresa_nome` |
| CNPJ | `empresa_cnpj` |
| Telefone | `empresa_telefone` |
| E-mail | `empresa_email` |
| Endereço Completo | `empresa_endereco` (full width) |

Salva via `UPSERT INTO settings (key, value)` em paralelo (`Promise.all`) para todas as 5 chaves.

**Feedback:** componente `FeedbackMessage` inline — sucesso (verde) ou erro (vermelho).

### 2. Segurança (ícone Lock `#a880ff`)

| Campo | Tipo |
|---|---|
| Nova Senha | password com toggle Eye/EyeOff |
| Confirmar Nova Senha | password |

**Validações:**
- Mínimo 6 caracteres
- Senhas devem corresponder

Salva via `supabase.auth.updateUser({ password: newPassword })`.

### 3. Informações da Conta (ícone User `#e65e24`) — Read-Only

- E-mail de acesso (`supabase.auth.getUser()`)
- Membro desde (data formatada com `Intl.DateTimeFormat('pt-BR', { day, month, year })`)

## Componente FeedbackMessage

```typescript
type: 'success' | 'error'
// success: bg #0e2f13, border #229731, icon CheckCircle2
// error:   bg #7c1c1c, border #ff9c9a, icon AlertCircle
```

## Queries Supabase

```sql
-- Fetch inicial
SELECT key, value FROM settings

-- Salvar empresa (5 upserts em paralelo)
UPSERT INTO settings (key, value) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
-- chaves: empresa_nome, empresa_cnpj, empresa_telefone, empresa_email, empresa_endereco

-- Alterar senha
supabase.auth.updateUser({ password: '...' })

-- Buscar usuário logado
supabase.auth.getUser()
```

## Tags
`#projeto/tela` `#gomoto/configuracoes`
