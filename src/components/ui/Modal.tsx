/**
 * @file Modal.tsx
 * @description Componente de janela modal (diálogo sobreposto) para o sistema GoMoto.
 * Este componente fornece uma interface para exibir conteúdos importantes sem sair da página atual,
 * como formulários de cadastro, confirmações de exclusão ou visualização de detalhes.
 * 
 * Inclui um 'backdrop' (fundo escurecido) com efeito de desfoque e gerencia automaticamente
 * a rolagem da página principal quando aberto.
 */

'use client'

import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { useEffect } from 'react'

/**
 * @interface ModalProps
 * @description Propriedades para o controle e exibição do componente Modal.
 * 
 * @property {boolean} open - Estado que controla se a modal está visível ou não.
 * @property {() => void} onClose - Função de retorno chamada para fechar a modal (ex: clicar no X ou no fundo).
 * @property {string} [title] - Título opcional exibido no cabeçalho da modal.
 * @property {React.ReactNode} children - Conteúdo principal a ser renderizado dentro da modal.
 * @property {'sm' | 'md' | 'lg' | 'xl'} [size] - Define a largura máxima da modal.
 */
interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * @constant sizes
 * @description Mapeamento de classes Tailwind CSS para as larguras máximas suportadas.
 */
const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

/**
 * @component Modal
 * @description Renderiza uma janela de diálogo sobreposta.
 * Utiliza o hook 'useEffect' para bloquear o scroll do corpo da página quando a modal está ativa.
 */
export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  /**
   * Efeito para gerenciar o overflow do body.
   * Quando a modal abre, removemos a rolagem do fundo para evitar confusão visual.
   * Quando fecha ou desmonta, restauramos o estado original.
   */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    /** Limpeza (cleanup) para garantir que o scroll volte ao normal se o componente for destruído */
    return () => { 
      document.body.style.overflow = '' 
    }
  }, [open])

  /** Se a modal não estiver aberta, não renderiza absolutamente nada (Early Return) */
  if (!open) return null

  return (
    /** Contêiner fixo que ocupa toda a tela e centraliza o conteúdo */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/** 
       * Camada de fundo (Backdrop) 
       * Escurece o conteúdo atrás da modal e permite fechar ao clicar fora.
       */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/** 
       * Corpo da Modal 
       * Posicionado de forma relativa para ficar acima do backdrop.
       */}
      <div
        className={cn(
          'relative w-full bg-[#202020] border border-[#333333] rounded-xl shadow-2xl',
          'max-h-[90vh] overflow-y-auto',
          sizes[size]
        )}
      >
        {/** Cabeçalho da Modal: Exibe título e botão de fechar se houver título */}
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-[#333333]">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/** Área de conteúdo principal da modal */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
