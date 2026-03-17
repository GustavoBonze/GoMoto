/**
 * @file Button.tsx
 * @description Componente de botão reutilizável e customizável para a interface do sistema GoMoto.
 * Este componente suporta diferentes variantes visuais (primary, secondary, ghost, danger, outline),
 * tamanhos variados e estado de carregamento (loading).
 * 
 * O componente utiliza 'forwardRef' para permitir o acesso direto ao elemento DOM do botão,
 * o que é essencial para integrações com bibliotecas de formulários ou animações.
 */

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

/**
 * @type ButtonVariant
 * @description Define as variantes visuais disponíveis para o botão.
 * - 'primary': Destaque principal (verde limão característico da marca).
 * - 'secondary': Estilo secundário com fundo escuro.
 * - 'ghost': Fundo transparente, ideal para ações menos enfáticas.
 * - 'danger': Indicativo de ações destrutivas ou críticas (vermelho).
 * - 'outline': Apenas bordas, para ações de suporte.
 */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'

/**
 * @type ButtonSize
 * @description Define as opções de tamanho para o botão.
 * - 'sm': Pequeno, para espaços reduzidos.
 * - 'md': Médio, tamanho padrão do sistema.
 * - 'lg': Grande, para chamadas de ação (CTAs) principais.
 */
type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * @interface ButtonProps
 * @description Estende os atributos nativos de um elemento de botão do HTML.
 * Adiciona propriedades customizadas para controlar o estilo e comportamento.
 * 
 * @property {ButtonVariant} [variant] - O estilo visual do botão.
 * @property {ButtonSize} [size] - As dimensões físicas do botão.
 * @property {boolean} [loading] - Indica se o botão está em estado de processamento.
 * @property {React.ReactNode} children - O conteúdo interno (texto, ícones, etc).
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: React.ReactNode
}

/**
 * @constant variants
 * @description Mapeamento de classes Tailwind CSS para cada variante de botão.
 * Define cores de fundo, texto, bordas e comportamentos de hover/active.
 */
const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[#BAFF1A] text-[#121212] font-semibold hover:bg-[#a8e617] active:bg-[#96cc15]',
  secondary: 'bg-[#323232] text-white hover:bg-[#404040] active:bg-[#2a2a2a]',
  ghost: 'bg-transparent text-[#A0A0A0] hover:bg-white/5 hover:text-white',
  danger: 'bg-red-500/12 text-red-400 border border-red-500/20 hover:bg-red-500/20',
  outline: 'bg-transparent border border-[#333333] text-white hover:border-[#BAFF1A] hover:text-[#BAFF1A]',
}

/**
 * @constant sizes
 * @description Mapeamento de classes Tailwind CSS para os tamanhos do botão.
 * Controla o preenchimento (padding), tamanho da fonte e arredondamento dos cantos.
 */
const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
}

/**
 * @component Button
 * @description O componente funcional principal que renderiza o elemento <button>.
 * Utiliza a função 'cn' (classnames utility) para mesclar classes de forma condicional.
 * 
 * @param {ButtonProps} props - Propriedades do componente.
 * @param {React.ForwardedRef<HTMLButtonElement>} ref - Referência para o elemento DOM.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    /**
     * Renderização do botão.
     * O botão é desabilitado se a prop 'disabled' for verdadeira ou se estiver em estado de 'loading'.
     */
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          /** Classes base compartilhadas por todos os botões */
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          /** Aplica a variante e o tamanho selecionados */
          variants[variant],
          sizes[size],
          /** Permite a injeção de classes extras via props */
          className
        )}
        {...props}
      >
        {/** Exibe um ícone de carregamento animado (spinner) se a prop loading for true */}
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {/** Renderiza o conteúdo textual ou componentes filhos passados ao botão */}
        {children}
      </button>
    )
  }
)

/** Define o nome de exibição para facilitar o debugging no React DevTools */
Button.displayName = 'Button'
