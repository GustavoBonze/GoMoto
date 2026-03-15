import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number           // página atual (começa em 0)
  pageSize: number       // registros por página
  total: number          // total de registros
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, pageSize, total, onPageChange, className }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  const from = total === 0 ? 0 : page * pageSize + 1
  const to = Math.min((page + 1) * pageSize, total)

  if (total === 0) return null

  // Gera os números de página visíveis com reticências
  function getPages(): (number | '...')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i)
    }
    if (page <= 3) {
      return [0, 1, 2, 3, 4, '...', totalPages - 1]
    }
    if (page >= totalPages - 4) {
      return [0, '...', totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1]
    }
    return [0, '...', page - 1, page, page + 1, '...', totalPages - 1]
  }

  return (
    <div className={cn('flex items-center justify-between px-4 py-3 border-t border-[#333333]', className)}>
      {/* Info */}
      <p className="text-xs text-[#A0A0A0]">
        Mostrando <span className="text-[#A0A0A0] font-medium">{from}–{to}</span> de{' '}
        <span className="text-[#A0A0A0] font-medium">{total}</span> registros
      </p>

      {/* Controles */}
      <div className="flex items-center gap-1">
        {/* Anterior */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            page === 0
              ? 'text-[#888888] cursor-not-allowed'
              : 'text-[#A0A0A0] hover:text-white hover:bg-white/5'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Páginas */}
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-[#888888] text-sm select-none">
              ···
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                'min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors',
                p === page
                  ? 'bg-[#BAFF1A] text-[#121212]'
                  : 'text-[#A0A0A0] hover:text-white hover:bg-white/5'
              )}
            >
              {(p as number) + 1}
            </button>
          )
        )}

        {/* Próximo */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            page >= totalPages - 1
              ? 'text-[#888888] cursor-not-allowed'
              : 'text-[#A0A0A0] hover:text-white hover:bg-white/5'
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
