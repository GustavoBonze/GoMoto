/**
 * @file Sidebar.tsx
 * @description Componente de barra lateral (Sidebar) para navegação principal do sistema.
 * Este componente gerencia o menu lateral, exibindo links para todas as seções do dashboard.
 * 
 * Funcionalidades:
 * - Renderização dinâmica de itens de navegação baseada em uma configuração centralizada.
 * - Identificação visual da rota ativa através de estados de destaque.
 * - Logotipo da aplicação com branding personalizado.
 * - Funcionalidade de logout integrada com formulário nativo.
 * - Barra de rolagem independente para menus extensos.
 */

'use client'

// Importação de utilitário para manipulação condicional de classes CSS.
import { cn } from '@/lib/utils'
// Componente de link do Next.js para navegação otimizada no lado do cliente.
import Link from 'next/link'
// Hook para obter o caminho da URL atual e gerenciar estados ativos no menu.
import { usePathname } from 'next/navigation'
// Importação de diversos ícones da biblioteca Lucide para representação visual dos módulos.
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

/**
 * @constant navItems
 * @description Lista de configuração dos itens de navegação.
 * Centraliza os dados das rotas para facilitar a manutenção e adição de novos módulos.
 * Cada item contém o link (href), o texto de exibição (label) e o componente de ícone (icon).
 */
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

/**
 * @function Sidebar
 * @description Componente principal da barra lateral.
 * Renderiza a logo, a lista de navegação e a área de rodapé com o botão de logout.
 * 
 * @returns {JSX.Element} Estrutura completa da barra lateral fixa.
 */
export function Sidebar() {
  // Obtém o caminho atual para determinar qual item do menu deve estar destacado.
  const pathname = usePathname()

  return (
    // <aside> define a barra lateral com largura fixa de 240px e altura total da tela (h-screen).
    // Posicionamento 'fixed' garante que ela não role junto com o conteúdo principal.
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[#161616] border-r border-[#2a2a2a] flex flex-col z-30">
      
      {/* 
          Seção do Logo:
          Exibe o ícone de moto em um fundo verde-limão (cor de destaque do sistema) 
          junto com o nome da aplicação e o nicho de mercado.
      */}
      <div className="px-5 py-5 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2.5">
          {/* Container do ícone com bordas arredondadas e cor vibrante. */}
          <div className="w-8 h-8 bg-[#BAFF1A] rounded-lg flex items-center justify-center flex-shrink-0">
            <Bike className="w-4 h-4 text-[#121212]" />
          </div>
          {/* Textos de identificação da marca. */}
          <div>
            <p className="text-sm font-bold text-white leading-none">GoMoto</p>
            <p className="text-xs text-[#A0A0A0] mt-0.5">Gestão de Locadora</p>
          </div>
        </div>
      </div>

      {/* 
          Seção de Navegação:
          Contém a lista de links gerada dinamicamente a partir da constante 'navItems'.
          Possui 'overflow-y-auto' para permitir rolagem caso o menu exceda a altura da tela.
      */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          // Lógica para verificar se a rota atual corresponde ao item do menu.
          // Considera caminhos exatos ou sub-rotas (ex: /motos/novo destaca o item /motos).
          const isActive = pathname === href || pathname.startsWith(href + '/')
          
          return (
            <Link
              key={href}
              href={href}
              // A classe condicional aplica estilos de destaque (background verde suave) para o item ativo.
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[#BAFF1A]/10 text-[#BAFF1A]'
                  : 'text-[#A0A0A0] hover:bg-white/5 hover:text-white'
              )}
            >
              {/* Renderização do ícone dinâmico com cor baseada no estado ativo. */}
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-[#BAFF1A]' : '')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* 
          Área de Rodapé (Logout):
          Contém o botão de saída da aplicação.
          Utiliza um formulário para realizar o POST para a rota de logout do servidor.
      */}
      <div className="p-3 border-t border-[#2a2a2a]">
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-all duration-150 w-full"
          >
            {/* Ícone de LogOut com transição visual para vermelho no hover. */}
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
