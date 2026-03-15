import { cn } from '@/lib/utils'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'brand' | 'orange'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  success: 'bg-green-500/12 text-green-400 border border-green-500/20',
  warning: 'bg-amber-500/12 text-amber-400 border border-amber-500/20',
  danger: 'bg-red-500/12 text-red-400 border border-red-500/20',
  info: 'bg-blue-500/12 text-blue-400 border border-blue-500/20',
  muted: 'bg-white/5 text-[#A0A0A0] border border-white/10',
  brand: 'bg-[#BAFF1A]/12 text-[#BAFF1A] border border-[#BAFF1A]/20',
  orange: 'bg-orange-600/12 text-orange-400 border border-orange-600/20',
}

const statusLabels: Record<string, { label: string; variant: BadgeVariant }> = {
  disponivel: { label: 'Disponível', variant: 'success' },
  alugada: { label: 'Alugada', variant: 'info' },
  manutencao: { label: 'Manutenção', variant: 'warning' },
  inativa: { label: 'Inativa', variant: 'muted' },
  pago: { label: 'Pago', variant: 'success' },
  pendente: { label: 'Pendente', variant: 'warning' },
  vencido: { label: 'Vencido', variant: 'danger' },
  prejuizo: { label: 'Prejuízo', variant: 'orange' },
  ativo: { label: 'Ativo', variant: 'success' },
  encerrado: { label: 'Encerrado', variant: 'muted' },
  preventiva: { label: 'Preventiva', variant: 'info' },
  corretiva: { label: 'Corretiva', variant: 'warning' },
  vistoria: { label: 'Vistoria', variant: 'muted' },
  entrega: { label: 'Entrega', variant: 'success' },
  devolucao: { label: 'Devolução', variant: 'warning' },
  cliente: { label: 'Cliente', variant: 'danger' },
  empresa: { label: 'Empresa', variant: 'muted' },
}

export function StatusBadge({ status }: { status: string }) {
  const config = statusLabels[status.toLowerCase()] ?? { label: status, variant: 'muted' as BadgeVariant }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function Badge({ variant = 'muted', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
