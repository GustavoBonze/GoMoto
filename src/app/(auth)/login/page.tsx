'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Bike } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 bg-[#BAFF1A] rounded-2xl flex items-center justify-center">
            <Bike className="w-7 h-7 text-[#121212]" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">GoMoto</h1>
            <p className="text-sm text-[#666666] mt-1">Sistema de Gestão</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#202020] border border-[#333333] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5">Entrar na conta</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full mt-2" loading={loading} size="lg">
              Entrar
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[#666666] mt-6">
          GoMoto © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
