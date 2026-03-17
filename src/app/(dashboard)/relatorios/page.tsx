/**
 * ARQUIVO: src/app/(dashboard)/relatorios/page.tsx
 * DESCRIÇÃO: Página de Relatórios do sistema GoMoto. 
 *            Apresenta um resumo estatístico do mês atual (receita, despesas, saldo)
 *            e oferece opções para geração de relatórios detalhados (financeiro, por moto, etc.).
 *            Nota: Atualmente a maioria das funcionalidades de exportação está em desenvolvimento.
 */

'use client'

import { useState } from 'react'
import {
  BarChart2,
  Bike,
  Users,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Lock,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'

/**
 * Interface que define a estrutura de um card de relatório disponível na interface.
 */
interface ReportCard {
  id: string          // Identificador único do tipo de relatório
  title: string       // Título exibido no card
  description: string // Descrição curta da finalidade do relatório
  icon: React.ReactNode // Ícone do Lucide-react correspondente
  color: 'brand' | 'success' | 'warning' | 'danger' | 'info' // Tema de cor do ícone
  available: boolean  // Indica se a funcionalidade já está implementada
}

/**
 * Lista estática de relatórios planejados para o sistema.
 * Utilizada para renderizar a grade de opções na interface.
 */
const reports: ReportCard[] = [
  {
    id: 'financeiro-mensal',
    title: 'Relatório Financeiro Mensal',
    description:
      'Visão completa das entradas e despesas do mês, saldo final e comparativo com mês anterior.',
    icon: <BarChart2 className="w-6 h-6" />,
    color: 'brand',
    available: false,
  },
  {
    id: 'por-moto',
    title: 'Relatório por Moto',
    description:
      'Histórico de locações, manutenções e receita gerada por cada moto da frota.',
    icon: <Bike className="w-6 h-6" />,
    color: 'info',
    available: false,
  },
  {
    id: 'por-cliente',
    title: 'Relatório por Cliente',
    description:
      'Histórico de contratos, cobranças e inadimplência por cliente.',
    icon: <Users className="w-6 h-6" />,
    color: 'success',
    available: false,
  },
  {
    id: 'fluxo-caixa',
    title: 'Fluxo de Caixa',
    description:
      'Projeção de entradas e saídas dos próximos 30, 60 e 90 dias.',
    icon: <ArrowLeftRight className="w-6 h-6" />,
    color: 'warning',
    available: false,
  },
]

/**
 * Objeto com estatísticas simuladas do mês para exibição nos StatCards.
 * Futuramente esses dados virão de uma consulta agregada ao Supabase.
 */
const monthlyStats = {
  revenue: 3850,              // Soma total de entradas (receita bruta)
  expenses: 2030,             // Soma total de saídas (despesas operacionais)
  balance: 1820,              // Saldo líquido (revenue - expenses)
  activeContracts: 2,         // Contagem de contratos com status 'ativo'
  pendingCharges: 2,          // Contagem de cobranças que ainda não foram pagas
  totalFines: 618.86,         // Valor total acumulado de multas de trânsito
}

/**
 * COMPONENTE PRINCIPAL: ReportsPage
 * Renderiza o cabeçalho, o resumo mensal e a lista de relatórios disponíveis.
 */
export default function ReportsPage() {
  /**
   * ESTADO: controla a exibição da notificação de "em breve" (toast).
   */
  const [showToast, setShowToast] = useState(false)

  /**
   * FUNÇÃO: handleGenerateReport
   * Acionada ao clicar em um botão de gerar relatório.
   * Atualmente apenas exibe um alerta informando que a funcionalidade está em construção.
   */
  function handleGenerateReport() {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  /**
   * CONSTANTE: monthName
   * Formata a data atual para exibir o nome do mês e o ano em português.
   * Ex: "Março de 2026"
   */
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    new Date()
  )

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Relatórios" subtitle="Análises e exportações do sistema" />

      <div className="p-6 space-y-6">
        {/* SEÇÃO: Resumo do Mês Atual */}
        <div>
          {/* Título da seção formatado (Primeira letra maiúscula) */}
          <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-3">
            Resumo — {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
          </p>
          
          {/* Grid de cartões estatísticos rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* StatCard de Receita (Verde) */}
            <StatCard
              title="Receita"
              value={formatCurrency(monthlyStats.revenue)}
              icon={<TrendingUp className="w-5 h-5" />}
              color="success"
            />
            {/* StatCard de Despesas (Vermelho) */}
            <StatCard
              title="Despesas"
              value={formatCurrency(monthlyStats.expenses)}
              icon={<TrendingDown className="w-5 h-5" />}
              color="danger"
            />
            {/* StatCard de Saldo (Cor da marca) */}
            <StatCard
              title="Saldo"
              value={formatCurrency(monthlyStats.balance)}
              icon={<DollarSign className="w-5 h-5" />}
              color="brand"
            />
            {/* Card simples de Contratos Ativos */}
            <Card>
              <p className="text-xs text-[#A0A0A0] truncate">Contratos Ativos</p>
              <p className="text-2xl font-bold text-white mt-0.5">{monthlyStats.activeContracts}</p>
            </Card>
            {/* Card simples de Cobranças Pendentes (Alerta/Laranja) */}
            <Card>
              <p className="text-xs text-[#A0A0A0] truncate">Cobranças Pendentes</p>
              <p className="text-2xl font-bold text-amber-400 mt-0.5">
                {monthlyStats.pendingCharges}
              </p>
            </Card>
            {/* Card simples de Valor de Multas (Perigo/Vermelho) */}
            <Card>
              <p className="text-xs text-[#A0A0A0] truncate">Multas</p>
              <p className="text-2xl font-bold text-red-400 mt-0.5">
                {formatCurrency(monthlyStats.totalFines)}
              </p>
            </Card>
          </div>
        </div>

        {/* SEÇÃO: Lista de Cards de Relatórios */}
        <div>
          <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-3">
            Relatórios disponíveis
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reports.map((report) => {
              /**
               * Mapeamento interno de estilos baseado no tipo de cor definido no ReportCard.
               * Define as classes de fundo, texto e borda para o ícone.
               */
              const colorMap = {
                brand: { bg: 'bg-[#BAFF1A]/10', text: 'text-[#BAFF1A]', border: 'border-[#BAFF1A]/20' },
                success: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
                warning: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
                danger: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
                info: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
              }
              const styles = colorMap[report.color]

              return (
                <div
                  key={report.id}
                  className="bg-[#202020] border border-[#333333] rounded-xl p-5 flex items-start gap-4 hover:border-[#444444] transition-colors"
                >
                  {/* Container do Ícone com cores dinâmicas */}
                  <div className={`p-3 rounded-xl flex-shrink-0 ${styles.bg} border ${styles.border}`}>
                    <div className={styles.text}>{report.icon}</div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Título e Badge de disponibilidade */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white text-sm">{report.title}</h3>
                      {!report.available && (
                        <Badge variant="muted" className="text-xs">
                          Em breve
                        </Badge>
                      )}
                    </div>
                    {/* Descrição do que o relatório oferece */}
                    <p className="text-xs text-[#A0A0A0] mb-4 leading-relaxed">{report.description}</p>
                    
                    {/* Botão de ação (Habilitado apenas se disponível) */}
                    <Button
                      size="sm"
                      variant={report.available ? 'primary' : 'outline'}
                      onClick={handleGenerateReport}
                      disabled={!report.available}
                      className={!report.available ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      {!report.available && <Lock className="w-3.5 h-3.5" />}
                      {report.available ? (
                        <>
                          <FileText className="w-3.5 h-3.5" />
                          Gerar Relatório
                        </>
                      ) : (
                        'Em desenvolvimento'
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* SEÇÃO: Aviso de rodapé sobre desenvolvimento */}
        <Card className="text-center py-8">
          <BarChart2 className="w-12 h-12 text-[#888888] mx-auto mb-3" />
          <p className="text-white font-medium mb-1">Relatórios em desenvolvimento</p>
          <p className="text-sm text-[#A0A0A0] max-w-md mx-auto">
            Os relatórios completos com exportação em PDF e Excel estão sendo desenvolvidos e estarão
            disponíveis em breve.
          </p>
        </Card>
      </div>

      {/* NOTIFICAÇÃO (Toast): Feedback ao usuário para relatórios bloqueados */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#202020] border border-[#BAFF1A]/30 shadow-2xl">
          <div className="w-2 h-2 rounded-full bg-[#BAFF1A]" />
          <p className="text-sm text-white">Este relatório ainda não está disponível.</p>
        </div>
      )}
    </div>
  )
}
