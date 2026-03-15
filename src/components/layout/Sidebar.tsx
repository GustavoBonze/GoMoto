'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Bike,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wrench,
  BarChart2,
  HelpCircle,
  Settings,
  Clock,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/motos', label: 'Motos', icon: Bike },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/fila', label: 'Fila de Locadores', icon: Clock },
  { href: '/contratos', label: 'Contratos', icon: FileText },
  { href: '/cobrancas', label: 'Cobranças', icon: DollarSign },
  { href: '/entradas', label: 'Entradas', icon: TrendingUp },
  { href: '/despesas', label: 'Despesas', icon: TrendingDown },
  { href: '/multas', label: 'Multas', icon: AlertTriangle },
  { href: '/manutencao', label: 'Manutenção', icon: Wrench },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart2 },
  { href: '/processos', label: 'Processos', icon: HelpCircle },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[#161616] border-r border-[#2a2a2a] flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#BAFF1A] rounded-lg flex items-center justify-center flex-shrink-0">
            <Bike className="w-4 h-4 text-[#121212]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">GoMoto</p>
            <p className="text-xs text-[#A0A0A0] mt-0.5">Gestão de Locadora</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[#BAFF1A]/10 text-[#BAFF1A]'
                  : 'text-[#A0A0A0] hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-[#BAFF1A]' : '')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-[#2a2a2a]">
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-all duration-150 w-full"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
