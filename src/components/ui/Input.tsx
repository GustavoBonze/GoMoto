/**
 * @file Input.tsx
 * @description Conjunto de componentes de entrada de dados (Input, Select, Textarea)
 * para formulários do sistema GoMoto. Todos os componentes seguem o mesmo padrão
 * visual e funcional, suportando rótulos (labels), mensagens de erro e dicas (hints).
 * 
 * Utilizam 'forwardRef' para integração total com React Hook Form e outras ferramentas.
 */

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

/**
 * @interface InputProps
 * @description Extensão das propriedades nativas do elemento <input> do HTML.
 * 
 * @property {string} [label] - Texto explicativo exibido acima do campo.
 * @property {string} [error] - Mensagem de validação exibida abaixo do campo em cor de erro.
 * @property {string} [hint] - Pequeno texto de ajuda exibido abaixo do campo (se não houver erro).
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

/**
 * @component Input
 * @description Campo de entrada de texto padrão.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    /** Gera um ID automático baseado no label caso não seja fornecido um ID explícito */
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <div className="flex flex-col gap-1.5">
        {/** Renderiza o Label se presente */}
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#A0A0A0]">
            {label}
          </label>
        )}
        
        {/** Elemento de entrada nativo com estilos Tailwind customizados */}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            /** Estilos base: dimensões, cores de fundo e borda */
            'w-full px-3 py-2.5 rounded-lg text-sm text-white',
            'bg-[#2a2a2a] border border-[#333333]',
            'placeholder:text-[#A0A0A0]',
            /** Estados de foco (focus) com a cor da marca */
            'focus:outline-none focus:border-[#BAFF1A] focus:ring-1 focus:ring-[#BAFF1A]/30',
            'transition-colors duration-150',
            /** Estilização condicional em caso de erro de validação */
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
            className
          )}
          {...props}
        />
        
        {/** Exibição prioritária da mensagem de erro */}
        {error && <p className="text-xs text-red-400">{error}</p>}
        
        {/** Exibição da dica (hint) apenas se não houver erro no campo */}
        {hint && !error && <p className="text-xs text-[#A0A0A0]">{hint}</p>}
      </div>
    )
  }
)

/** Nome de exibição para o componente Input */
Input.displayName = 'Input'

/**
 * @interface SelectProps
 * @description Extensão das propriedades nativas do elemento <select> do HTML.
 * 
 * @property {string} [label] - Texto explicativo.
 * @property {string} [error] - Mensagem de erro de validação.
 * @property {{ value: string; label: string }[]} options - Lista de opções para seleção.
 */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

/**
 * @component Select
 * @description Componente de menu suspenso (dropdown) para seleção de opções únicas.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    /** Gera um ID automático para acessibilidade */
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <div className="flex flex-col gap-1.5">
        {/** Label do Select */}
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[#A0A0A0]">
            {label}
          </label>
        )}
        
        {/** Elemento Select nativo */}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-3 py-2.5 rounded-lg text-sm text-white appearance-none',
            'bg-[#2a2a2a] border border-[#333333]',
            'focus:outline-none focus:border-[#BAFF1A] focus:ring-1 focus:ring-[#BAFF1A]/30',
            'transition-colors duration-150',
            error && 'border-red-500',
            className
          )}
          {...props}
        >
          {/** Mapeamento das opções fornecidas via props */}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#2a2a2a]">
              {option.label}
            </option>
          ))}
        </select>
        
        {/** Mensagem de erro do Select */}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

/** Nome de exibição para o componente Select */
Select.displayName = 'Select'

/**
 * @interface TextareaProps
 * @description Extensão das propriedades nativas do elemento <textarea> do HTML.
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

/**
 * @component Textarea
 * @description Campo de entrada de texto de múltiplas linhas.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    /** Identificador único para o campo de texto */
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <div className="flex flex-col gap-1.5">
        {/** Label para o Textarea */}
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-[#A0A0A0]">
            {label}
          </label>
        )}
        
        {/** Elemento Textarea nativo */}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-3 py-2.5 rounded-lg text-sm text-white min-h-[100px]',
            'bg-[#2a2a2a] border border-[#333333]',
            'placeholder:text-[#A0A0A0]',
            'focus:outline-none focus:border-[#BAFF1A] focus:ring-1 focus:ring-[#BAFF1A]/30',
            'transition-colors duration-150 resize-none',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        
        {/** Mensagem de erro do Textarea */}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

/** Nome de exibição para o componente Textarea */
Textarea.displayName = 'Textarea'
