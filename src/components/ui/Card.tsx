/**
 * @file Card.tsx
 * @description Componentes de contêiner estrutural para a interface do GoMoto.
 * Inclui o componente base 'Card' para agrupamento de conteúdo e o 'StatCard'
 * especializado para exibição de métricas e indicadores de desempenho (KPIs).
 */

import { cn } from '@/lib/utils'

/**
 * @interface CardProps
 * @description Propriedades para o componente base Card.
 * 
 * @property {React.ReactNode} children - Elementos filhos que serão renderizados dentro do card.
 * @property {string} [className] - Classes CSS adicionais para customização do contêiner.
 * @property {'none' | 'sm' | 'md' | 'lg'} [padding] - Define o espaçamento interno do card.
 */
interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

/**
 * @constant paddings
 * @description Mapeamento de classes Tailwind CSS para os diferentes níveis de padding.
 */
const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

/**
 * @component Card
 * @description Componente de contêiner fundamental com fundo escuro, bordas arredondadas e contorno sutil.
 * Segue a identidade visual "dark mode" do sistema.
 */
export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        /** Estilo base do card: cor de fundo, arredondamento e borda */
        'bg-[#202020] rounded-xl border border-[#333333]',
        /** Aplica o padding selecionado */
        paddings[padding],
        /** Permite extensões via className */
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * @interface StatCardProps
 * @description Propriedades para o componente de cartão de estatísticas.
 * 
 * @property {string} title - O título da métrica (ex: "Total de Motos").
 * @property {string | number} value - O valor numérico ou textual da métrica.
 * @property {string} [subtitle] - Texto de apoio opcional (ex: "+5% este mês").
 * @property {React.ReactNode} icon - Ícone representativo da métrica.
 * @property {'brand' | 'success' | 'warning' | 'danger' | 'info'} [color] - Esquema de cores do ícone e seu fundo.
 * @property {string} [className] - Classes extras para o componente.
 */
interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color?: 'brand' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

/**
 * @constant colorMap
 * @description Mapeamento de esquemas de cores para os StatCards.
 * Define a cor do fundo do ícone (com opacidade) e a cor do próprio ícone.
 */
const colorMap = {
  brand: { bg: 'bg-[#BAFF1A]/10', text: 'text-[#BAFF1A]' },
  success: { bg: 'bg-green-500/10', text: 'text-green-400' },
  warning: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  danger: { bg: 'bg-red-500/10', text: 'text-red-400' },
  info: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
}

/**
 * @component StatCard
 * @description Componente especializado para Dashboards que exibe uma métrica com ícone.
 * Utiliza o componente Card internamente para manter a consistência visual.
 */
export function StatCard({ title, value, subtitle, icon, color = 'brand', className }: StatCardProps) {
  /** Seleciona o par de cores baseado na propriedade color */
  const colors = colorMap[color]
  
  return (
    <Card className={cn('flex items-start gap-4', className)}>
      {/** Contêiner do ícone com fundo colorido translúcido */}
      <div className={cn('p-2.5 rounded-lg flex-shrink-0', colors.bg)}>
        <div className={cn('w-5 h-5', colors.text)}>{icon}</div>
      </div>
      
      {/** Seção de textos: Título, Valor e Subtítulo */}
      <div className="min-w-0">
        <p className="text-sm text-[#A0A0A0] truncate">{title}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        
        {/** Renderiza o subtítulo apenas se ele for fornecido */}
        {subtitle && <p className="text-xs text-[#A0A0A0] mt-0.5">{subtitle}</p>}
      </div>
    </Card>
  )
}
