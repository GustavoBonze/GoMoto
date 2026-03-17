/**
 * @file Badge.tsx
 * @description Componente de etiqueta (Badge) e componente de Status especializado para o sistema GoMoto.
 * Estes componentes são utilizados para exibir estados, categorias ou pequenas informações de destaque
 * com cores semânticas que facilitam a leitura rápida do usuário.
 */

import { cn } from '@/lib/utils'

/**
 * @type BadgeVariant
 * @description Define as variantes de estilo visual disponíveis para o Badge.
 * Cada variante corresponde a um contexto semântico:
 * - 'success': Indica sucesso ou estado positivo (verde).
 * - 'warning': Indica atenção ou estado intermediário (âmbar).
 * - 'danger': Indica erro, perigo ou estado crítico (vermelho).
 * - 'info': Indica informação neutra ou estados informativos (azul).
 * - 'muted': Estilo discreto para informações secundárias (cinza).
 * - 'brand': Utiliza as cores da marca GoMoto (verde limão).
 * - 'orange': Variante laranja para estados específicos como prejuízo.
 */
type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'brand' | 'orange'

/**
 * @interface BadgeProps
 * @description Propriedades para o componente base Badge.
 * 
 * @property {BadgeVariant} [variant] - A variante visual a ser aplicada.
 * @property {React.ReactNode} children - O conteúdo a ser exibido dentro da etiqueta.
 * @property {string} [className] - Classes CSS adicionais para customização pontual.
 */
interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

/**
 * @constant variants
 * @description Mapeamento de estilos Tailwind CSS para cada variante do Badge.
 * Utiliza cores com opacidade no fundo (background) e bordas sutis para um visual moderno.
 */
const variants: Record<BadgeVariant, string> = {
  success: 'bg-green-500/12 text-green-400 border border-green-500/20',
  warning: 'bg-amber-500/12 text-amber-400 border border-amber-500/20',
  danger: 'bg-red-500/12 text-red-400 border border-red-500/20',
  info: 'bg-blue-500/12 text-blue-400 border border-blue-500/20',
  muted: 'bg-white/5 text-[#A0A0A0] border border-white/10',
  brand: 'bg-[#BAFF1A]/12 text-[#BAFF1A] border border-[#BAFF1A]/20',
  orange: 'bg-orange-600/12 text-orange-400 border border-orange-600/20',
}

/**
 * @constant statusLabels
 * @description Configuração centralizada de rótulos (labels) e variantes para status do sistema.
 * Este mapeamento traduz chaves de status do banco de dados para textos legíveis e estilos visuais.
 */
const statusLabels: Record<string, { label: string; variant: BadgeVariant }> = {
  /** Status de Motos e Contratos */
  available: { label: 'Disponível', variant: 'success' },
  rented: { label: 'Alugada', variant: 'info' },
  maintenance: { label: 'Manutenção', variant: 'warning' },
  inactive: { label: 'Inativa', variant: 'muted' },
  
  /** Status Financeiros e Cobranças */
  paid: { label: 'Pago', variant: 'success' },
  pending: { label: 'Pendente', variant: 'warning' },
  overdue: { label: 'Vencido', variant: 'danger' },
  loss: { label: 'Prejuízo', variant: 'orange' },
  
  /** Status de Clientes ou Registros Gerais */
  active: { label: 'Ativo', variant: 'success' },
  closed: { label: 'Encerrado', variant: 'muted' },
  
  /** Tipos de Manutenção */
  preventive: { label: 'Preventiva', variant: 'info' },
  corrective: { label: 'Corretiva', variant: 'warning' },
  
  /** Eventos e Processos */
  inspection: { label: 'Vistoria', variant: 'muted' },
  delivery: { label: 'Entrega', variant: 'success' },
  return: { label: 'Devolução', variant: 'warning' },
  
  /** Responsáveis */
  customer: { label: 'Cliente', variant: 'danger' },
  company: { label: 'Empresa', variant: 'muted' },
}

/**
 * @component StatusBadge
 * @description Componente especializado que recebe uma string de status e renderiza
 * automaticamente o Badge correto com o texto e a cor configurados.
 * 
 * @param {string} status - O identificador do status (ex: 'pago', 'disponivel').
 */
export function StatusBadge({ status }: { status: string }) {
  /** 
   * Busca a configuração no mapeamento, ignorando maiúsculas/minúsculas.
   * Se não encontrar, utiliza o próprio texto do status com a variante 'muted'.
   */
  const config = statusLabels[status.toLowerCase()] ?? { label: status, variant: 'muted' as BadgeVariant }
  
  return <Badge variant={config.variant}>{config.label}</Badge>
}

/**
 * @component Badge
 * @description Componente funcional base para exibição de etiquetas.
 * 
 * @param {BadgeProps} props - Propriedades para estilização e conteúdo.
 */
export function Badge({ variant = 'muted', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        /** Classes estruturais básicas */
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        /** Aplica o estilo baseado na variante escolhida */
        variants[variant],
        /** Permite sobrescrever ou adicionar classes externamente */
        className
      )}
    >
      {children}
    </span>
  )
}
