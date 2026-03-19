/**
 * @file Card.tsx
 * @description Componentes de contêiner para a interface do GoMoto.
 * 
 * @summary
 * O "porquê" deste arquivo é fornecer componentes de "cartão" reutilizáveis, que são
 * a base para agrupar conteúdo visualmente na UI. Inclui um `Card` genérico e um
 * `StatCard` especializado para exibir métricas (KPIs), garantindo uma aparência
 * coesa e um layout estruturado em todo o sistema.
 */

import { cn } from '@/lib/utils'

/**
 * @interface CardProps
 * @description Propriedades para o componente `Card` base.
 */
interface CardProps {
  /** O conteúdo a ser renderizado dentro do card. */
  children: React.ReactNode
  /** Classes CSS adicionais para customizações pontuais. */
  className?: string
  /** Define o nível de espaçamento interno (padding) do card. Padrão: 'md'. */
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

/**
 * @constant paddings
 * @description Mapeamento de `props` de padding para classes Tailwind CSS.
 * O "porquê": Permite controlar o espaçamento de forma declarativa, mantendo
 * os valores de padding consistentes com o design system.
 */
const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

/**
 * @component Card
 * @description Um contêiner de conteúdo fundamental com fundo escuro, bordas arredondadas e contorno sutil.
 * É a principal primitiva de layout para agrupar informações relacionadas na UI.
 */
export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        // Estilo base do card: cor de fundo, arredondamento e borda.
        'bg-[#202020] rounded-xl border border-[#333333]',
        // Aplica o padding selecionado a partir do mapeamento.
        paddings[padding],
        // Permite que classes externas sobrescrevam ou estendam o estilo.
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * @interface StatCardProps
 * @description Propriedades para o `StatCard`, um cartão especializado para estatísticas.
 */
interface StatCardProps {
  /** O título da métrica (ex: "Total de Motos"). */
  title: string
  /** O valor numérico ou textual da métrica. */
  value: string | number
  /** Texto de apoio opcional (ex: "+5% este mês"). */
  subtitle?: string
  /** Ícone do Lucide que representa a métrica. */
  icon: React.ReactNode
  /** Esquema de cores para o ícone, derivado das variantes semânticas. */
  color?: 'brand' | 'success' | 'warning' | 'danger' | 'info'
  /** Classes CSS adicionais. */
  className?: string
}

/**
 * @constant colorMap
 * @description Mapeamento de esquemas de cores para os ícones do `StatCard`.
 * O "porquê": Define um vocabulário visual consistente. Uma métrica de 'sucesso'
 * sempre terá um ícone verde, 'perigo' sempre vermelho, etc., tornando a UI
 * mais intuitiva e rápida de ler.
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
 * @description Componente especializado para dashboards que exibe uma métrica (KPI) com um ícone estilizado.
 * Utiliza o componente `Card` como base para manter a consistência visual.
 */
export function StatCard({ title, value, subtitle, icon, color = 'brand', className }: StatCardProps) {
  // Seleciona o par de cores (fundo e texto) baseado na propriedade `color`.
  const colors = colorMap[color]
  
  return (
    <Card className={cn('flex items-start gap-4', className)}>
      {/* Contêiner do ícone com fundo colorido translúcido e borda sutil. */}
      <div className={cn('p-2.5 rounded-lg flex-shrink-0 border border-white/5', colors.bg)}>
        <div className={cn('w-5 h-5', colors.text)}>{icon}</div>
      </div>
      
      {/* Seção de textos: Título, Valor principal e Subtítulo (opcional). */}
      <div className="min-w-0">
        <p className="text-sm text-[#A0A0A0] truncate">{title}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        
        {/* Renderiza o subtítulo apenas se ele for fornecido. */}
        {subtitle && <p className="text-xs text-[#A0A0A0] mt-0.5">{subtitle}</p>}
      </div>
    </Card>
  )
}
