# 🔐 Tela: Login — [[GoMoto]]

Rota: `/login` | Tipo: Client Component | Grupo: `(auth)` (sem Sidebar/Header)

## Layout

- Container: `min-h-screen bg-[#121212] flex items-center justify-center`
- Logo: ícone Bike em bg `#BAFF1A` + texto "GoMoto" (28px bold) + "Sistema de Gestão" (20px)
- Card do formulário: `bg-[#202020] border-[#474747] rounded-2xl p-6`
- Rodapé: "GoMoto © {ano}" em 12px cinza

## Campos

| Campo | Tipo | autoComplete |
|---|---|---|
| Email | email | email |
| Senha | password | current-password |

## Lógica de Login

```javascript
async function handleLogin(event) {
  event.preventDefault()
  setError('')
  setLoading(true)

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    setError('Email ou senha incorretos.')
    setLoading(false)
    return
  }

  router.push('/dashboard')
}
```

- Erro exibido em card: `bg-[#7c1c1c] border-[#ff9c9a] text-[#ff9c9a]`
- Botão mostra `loading={true}` durante a requisição

## Rate Limiting (Middleware)

- Máximo 10 POSTs em `/login` por IP em 15 minutos
- Sliding window in-memory (`Map<string, number[]>`)
- Se exceder: HTTP 429
- IP extraído via `x-forwarded-for` ou `x-real-ip`
- ⚠️ Perde o histórico em restart do servidor — migrar para Redis/Upstash no futuro

## Comportamento de Redirecionamento

- Usuário não autenticado → qualquer rota privada → `/login`
- Usuário autenticado → `/login` → `/dashboard`
- Rotas `/auth/*` → sempre públicas

## Tags
`#projeto/tela` `#gomoto/auth`
