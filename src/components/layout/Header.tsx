/**
 * @file Header.tsx
 * @description Componente de cabeçalho global do Sistema GoMoto.
 * Este componente fornece uma barra superior consistente para todas as páginas do dashboard,
 * exibindo o título da página atual, subtítulo opcional e ações específicas do contexto.
 * 
 * O cabeçalho é fixado no topo da página e utiliza um esquema de cores escuro
 * alinhado com a identidade visual da aplicação.
 * 
 * Funcionalidades principais:
 * - Exibição dinâmica de títulos e subtítulos.
 * - Suporte para botões de ação injetados via props.
 * - Ícone de notificações integrado.
 * - Layout responsivo com espaçamento adequado.
 */

'use client'

// Importação de ícones da biblioteca Lucide React para representação visual consistente.
import { Search, Bell } from 'lucide-react'

/**
 * @interface HeaderProps
 * @description Definição das propriedades aceitas pelo componente Header.
 * 
 * @property {string} title - O título principal exibido em destaque no cabeçalho.
 * @property {string} [subtitle] - (Opcional) Texto secundário exibido abaixo do título para contexto adicional.
 * @property {React.ReactNode} [actions] - (Opcional) Elementos JSX adicionais, como botões ou filtros, 
 *                                        que serão renderizados no lado direito do cabeçalho.
 */
interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

/**
 * @function Header
 * @description O componente funcional Header renderiza a estrutura de topo da interface.
 * 
 * @param {HeaderProps} props - As propriedades do componente (title, subtitle, actions).
 * @returns {JSX.Element} O elemento JSX que representa o cabeçalho.
 * 
 * Estrutura do layout:
 * - Lado Esquerdo: Bloco de títulos (h1 para o título principal e p condicional para o subtítulo).
 * - Lado Direito: Área de ações dinâmicas seguida pelo botão de notificações padrão.
 */
export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    // <header> define a seção de cabeçalho com posicionamento 'sticky' (fixo) no topo do eixo Z (z-20).
    // Estilização utiliza Tailwind CSS para bordas, cores de fundo e alinhamento flexível.
    <header className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a] bg-[#121212] sticky top-0 z-20">
      
      {/* 
          Container do Título:
          Agrupa o título principal e o subtítulo (se fornecido).
          O título usa fonte negrito e cor branca para máximo contraste.
      */}
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {/* Renderização condicional do subtítulo: só aparece se a prop 'subtitle' for enviada. */}
        {subtitle && <p className="text-sm text-[#A0A0A0] mt-0.5">{subtitle}</p>}
      </div>

      {/* 
          Container de Ações e Utilidades:
          Agrupa as ações dinâmicas passadas por props e ícones fixos como o de notificações.
          Usa flexbox para manter um espaçamento constante (gap-2) entre os itens.
      */}
      <div className="flex items-center gap-2">
        {/* 
            Injeção de ações externas:
            Permite que cada página adicione seus próprios controles (ex: botões de "Novo Registro").
        */}
        {actions}

        {/* 
            Botão de Notificações:
            Componente interativo com estados de hover para feedback visual.
            Atualmente estático, preparado para integração com sistema de alertas.
        */}
        <button className="p-2 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
