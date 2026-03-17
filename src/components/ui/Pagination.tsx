/**
 * @file Pagination.tsx
 * @description Componente de paginação para navegação em listas de dados extensas no GoMoto.
 * Este componente calcula e exibe os controles de página, incluindo botões de anterior/próximo,
 * números de página específicos e tratamento inteligente de reticências (...) para grandes volumes.
 * 
 * Segue o padrão de índice baseado em zero (0-indexed) internamente, mas exibe
 * para o usuário final começando em 1.
 */

import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * @interface PaginationProps
 * @description Propriedades necessárias para o funcionamento do componente de paginação.
 * 
 * @property {number} page - O índice da página atual (ex: 0 para a primeira página).
 * @property {number} pageSize - Quantidade de itens exibidos por página.
 * @property {number} total - O número total de registros existentes na base de dados.
 * @property {(page: number) => void} onPageChange - Função disparada ao trocar de página.
 * @property {string} [className] - Estilos CSS adicionais para o contêiner.
 */
interface PaginationProps {
  page: number           
  pageSize: number       
  total: number          
  onPageChange: (page: number) => void
  className?: string
}

/**
 * @component Pagination
 * @description Componente funcional que renderiza a barra de paginação com informações de registros.
 */
export function Pagination({ page, pageSize, total, onPageChange, className }: PaginationProps) {
  /** Cálculo do total de páginas baseado no total de registros e tamanho da página */
  const totalPages = Math.ceil(total / pageSize)
  
  /** Cálculo do intervalo de registros sendo exibidos no momento (ex: "Mostrando 1-10 de 50") */
  const fromRecord = total === 0 ? 0 : page * pageSize + 1
  const toRecord = Math.min((page + 1) * pageSize, total)

  /** Se não houver registros, o componente não deve ocupar espaço na tela */
  if (total === 0) return null

  /**
   * @function getVisiblePages
   * @description Lógica para gerar o array de números de página que serão exibidos.
   * Implementa um sistema de janelas para mostrar páginas próximas à atual e as extremidades.
   * 
   * @returns {(number | '...')[]} Array contendo números de página ou reticências.
   */
  function getVisiblePages(): (number | '...')[] {
    /** Caso simples: poucas páginas, exibe todas sem reticências */
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i)
    }
    
    /** Início da lista: exibe as primeiras páginas e a última */
    if (page <= 3) {
      return [0, 1, 2, 3, 4, '...', totalPages - 1]
    }
    
    /** Fim da lista: exibe a primeira página e as últimas */
    if (page >= totalPages - 4) {
      return [0, '...', totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1]
    }
    
    /** Meio da lista: exibe a primeira, a última e a vizinhança da página atual */
    return [0, '...', page - 1, page, page + 1, '...', totalPages - 1]
  }

  return (
    /** Contêiner principal da paginação com borda superior e espaçamento */
    <div className={cn('flex items-center justify-between px-4 py-3 border-t border-[#333333]', className)}>
      
      {/** Informação textual sobre o estado atual da listagem */}
      <p className="text-xs text-[#A0A0A0]">
        Mostrando <span className="text-[#A0A0A0] font-medium">{fromRecord}–{toRecord}</span> de{' '}
        <span className="text-[#A0A0A0] font-medium">{total}</span> registros
      </p>

      {/** Contêiner dos botões de controle de página */}
      <div className="flex items-center gap-1">
        
        {/** Botão de página Anterior (Anterior) */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            page === 0
              ? 'text-[#888888] cursor-not-allowed'
              : 'text-[#A0A0A0] hover:text-white hover:bg-white/5'
          )}
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/** Mapeamento e renderização dos números de página e reticências */}
        {getVisiblePages().map((item, index) =>
          item === '...' ? (
            /** Renderiza as reticências como texto não clicável */
            <span key={`ellipsis-${index}`} className="px-2 text-[#888888] text-sm select-none">
              ···
            </span>
          ) : (
            /** Renderiza o botão numérico da página */
            <button
              key={item}
              onClick={() => onPageChange(item as number)}
              className={cn(
                'min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors',
                /** Destaque para a página atualmente selecionada (cor da marca) */
                item === page
                  ? 'bg-[#BAFF1A] text-[#121212]'
                  : 'text-[#A0A0A0] hover:text-white hover:bg-white/5'
              )}
            >
              {(item as number) + 1}
            </button>
          )
        )}

        {/** Botão de Próxima página (Próximo) */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            page >= totalPages - 1
              ? 'text-[#888888] cursor-not-allowed'
              : 'text-[#A0A0A0] hover:text-white hover:bg-white/5'
          )}
          aria-label="Próxima página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
