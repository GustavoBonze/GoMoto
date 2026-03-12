import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

export function formatDateLong(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    disponivel: 'success',
    alugada: 'info',
    manutencao: 'warning',
    inativa: 'muted',
    pago: 'success',
    pendente: 'warning',
    vencido: 'danger',
    ativo: 'success',
    encerrado: 'muted',
  }
  return map[status.toLowerCase()] ?? 'muted'
}
