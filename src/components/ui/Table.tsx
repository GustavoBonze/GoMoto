/**
 * @file Table.tsx
 * @description Componente de tabela genérico e altamente reutilizável para o GoMoto.
 * Utiliza Generics (T) do TypeScript para garantir a tipagem correta dos dados em cada coluna.
 * Suporta estados de carregamento, mensagens para listas vazias, renderização customizada de células
 * e interatividade nas linhas (clique na linha).
 */

import { cn } from '@/lib/utils'

/**
 * @interface Column
 * @description Define a estrutura de uma coluna da tabela.
 * 
 * @template T - O tipo do objeto de dados que a linha representa.
 * @property {string} key - Identificador único da coluna (geralmente o nome da propriedade no objeto).
 * @property {string} header - O rótulo que será exibido no cabeçalho (<thead>).
 * @property {(row: T) => React.ReactNode} [render] - Função opcional para renderizar conteúdo customizado na célula (ex: Badges, ícones).
 * @property {string} [className] - Classes CSS para estilização específica da coluna (ex: largura, alinhamento).
 */
interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
}

/**
 * @interface TableProps
 * @description Propriedades para configuração e comportamento da tabela.
 * 
 * @template T - Tipo genérico para os dados da tabela.
 * @property {Column<T>[]} columns - Configuração das colunas a serem exibidas.
 * @property {T[]} data - Array de objetos contendo os dados a serem listados.
 * @property {(row: T) => string} keyExtractor - Função para extrair uma chave única de cada linha (essencial para o React).
 * @property {(row: T) => void} [onRowClick] - Callback opcional acionado ao clicar em uma linha.
 * @property {string} [emptyMessage] - Texto exibido quando não há dados (default: 'Nenhum registro encontrado').
 * @property {boolean} [loading] - Indica se os dados estão sendo buscados no servidor.
 */
interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  emptyMessage?: string
  loading?: boolean
}

/**
 * @component Table
 * @description Renderiza uma tabela HTML otimizada para o tema escuro do GoMoto.
 * 
 * @template T - O tipo de dado de cada linha da tabela.
 */
export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'Nenhum registro encontrado',
  loading,
}: TableProps<T>) {
  
  /** 
   * Estado de Carregamento (Loading)
   * Renderiza um Spinner centralizado se a prop 'loading' for verdadeira.
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          {/** SVG de Spinner animado */}
          <svg className="animate-spin h-8 w-8 text-[#BAFF1A]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-[#A0A0A0]">Carregando dados...</p>
        </div>
      </div>
    )
  }

  /** 
   * Estado Vazio (Empty State)
   * Exibido quando a lista de dados está vazia e o carregamento já terminou.
   */
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[#A0A0A0] text-sm italic">{emptyMessage}</p>
      </div>
    )
  }

  return (
    /** Contêiner com scroll horizontal para telas menores */
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        {/** Cabeçalho da Tabela */}
        <thead>
          <tr className="border-b border-[#333333]">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider',
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        
        {/** Corpo da Tabela: Mapeia cada objeto do array 'data' para uma linha (<tr>) */}
        <tbody className="divide-y divide-[#2a2a2a]">
          {data.map((rowData) => (
            <tr
              key={keyExtractor(rowData)}
              onClick={() => onRowClick?.(rowData)}
              className={cn(
                'transition-colors duration-100',
                /** Aplica estilo de cursor e hover apenas se houver ação de clique definida */
                onRowClick && 'cursor-pointer hover:bg-white/[0.03]'
              )}
            >
              {/** Mapeia as colunas definidas para criar cada célula (<td>) */}
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn('px-4 py-3 text-sm text-[#A0A0A0]', column.className)}
                >
                  {/** 
                   * Se a coluna possui uma função 'render', utiliza ela para o conteúdo.
                   * Caso contrário, tenta acessar o valor pela chave (key) ou exibe um traço (-).
                   */}
                  {column.render
                    ? column.render(rowData)
                    : String((rowData as Record<string, unknown>)[column.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
