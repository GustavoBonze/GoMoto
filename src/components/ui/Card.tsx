import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'bg-[#202020] border border-[#333333] rounded-xl',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color?: 'brand' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

const colorMap = {
  brand: { bg: 'bg-[#BAFF1A]/10', text: 'text-[#BAFF1A]' },
  success: { bg: 'bg-green-500/10', text: 'text-green-400' },
  warning: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  danger: { bg: 'bg-red-500/10', text: 'text-red-400' },
  info: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
}

export function StatCard({ title, value, subtitle, icon, color = 'brand', className }: StatCardProps) {
  const colors = colorMap[color]
  return (
    <Card className={cn('flex items-start gap-4', className)}>
      <div className={cn('p-2.5 rounded-lg flex-shrink-0', colors.bg)}>
        <div className={cn('w-5 h-5', colors.text)}>{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-sm text-[#A0A0A0] truncate">{title}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-[#666666] mt-0.5">{subtitle}</p>}
      </div>
    </Card>
  )
}
