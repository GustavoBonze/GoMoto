/**
 * @file utils.ts
 * @description Conjunto de funções utilitárias para formatação de dados, manipulação de classes CSS
 * e lógica auxiliar de interface do usuário para o Sistema GoMoto.
 * Este arquivo centraliza helper functions que garantem a consistência visual e de dados em todo o projeto.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * @function cn
 * @description Utilitário para mesclar classes CSS de forma condicional e inteligente.
 * Combina as bibliotecas 'clsx' (para lógica condicional) e 'tailwind-merge' (para resolver conflitos
 * de especificidade do Tailwind CSS).
 * 
 * @param inputs - Lista de valores de classe que podem ser strings, objetos ou arrays.
 * @returns Uma string contendo as classes finais processadas.
 */
export function cn(...inputs: ClassValue[]) {
  // O processo envolve primeiro a resolução das condicionais com clsx
  // e depois a limpeza de duplicatas/conflitos com twMerge.
  return twMerge(clsx(inputs));
}

/**
 * @function formatCurrency
 * @description Formata um valor numérico para a representação de moeda brasileira (Real - BRL).
 * Utiliza a API nativa de internacionalização do JavaScript (Intl.NumberFormat).
 * 
 * @param value - O valor numérico a ser formatado.
 * @returns String formatada (ex: "R$ 1.250,00").
 */
export function formatCurrency(value: number): string {
  // Configuração explícita para o locale pt-BR e moeda BRL.
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * @function formatDate
 * @description Converte uma string de data ou objeto Date em uma string formatada curta (DD/MM/AAAA).
 * Segue o padrão brasileiro de exibição de datas.
 * 
 * @param date - Objeto Date ou string representativa de data válida.
 * @returns String de data no formato local pt-BR.
 */
export function formatDate(date: string | Date): string {
  // A classe Intl.DateTimeFormat garante a formatação regional correta sem bibliotecas externas pesadas.
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

/**
 * @function formatDateLong
 * @description Formata uma data para sua versão por extenso, incluindo o nome do mês.
 * Útil para exibição em cabeçalhos de relatórios ou detalhes de contrato.
 * 
 * @param date - Objeto Date ou string representativa de data válida.
 * @returns String formatada (ex: "16 de março de 2026").
 */
export function formatDateLong(date: string | Date): string {
  // Define opções específicas para exibir o dia com dois dígitos e o mês por extenso.
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * @function getStatusColor
 * @description Mapeia um status de sistema para uma variante de cor pré-definida no design system.
 * Suporta múltiplos domínios (motos, cobranças, contratos) através de um dicionário centralizado.
 * 
 * @param status - O identificador de status em Inglês (conforme definido nas interfaces globais).
 * @returns Uma string representando a variante semântica (success, info, warning, danger, muted).
 */
export function getStatusColor(status: string) {
  /**
   * @constant colorMap
   * @description Dicionário interno que vincula o valor literal do status à sua cor semântica.
   * Todos os identificadores de status foram traduzidos para o Inglês conforme o padrão do projeto.
   */
  const colorMap: Record<string, string> = {
    // Status de Motocicleta (MotorcycleStatus)
    available: 'success',
    rented: 'info',
    maintenance: 'warning',
    inactive: 'muted',

    // Status de Cobrança (ChargeStatus)
    paid: 'success',
    pending: 'warning',
    overdue: 'danger',

    // Status de Contrato (ContractStatus)
    active: 'success',
    closed: 'muted',
  };

  // Normaliza o input para minúsculas para evitar erros de case-sensitivity.
  // Caso o status não seja encontrado, retorna 'muted' como fallback de segurança.
  return colorMap[status.toLowerCase()] ?? 'muted';
}
