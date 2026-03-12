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

interface RelatorioCard {
  id: string
  titulo: string
  descricao: string
  icon: React.ReactNode
  cor: 'brand' | 'success' | 'warning' | 'danger' | 'info'
  disponivel: boolean
}

const relatorios: RelatorioCard[] = [
  {
    id: 'financeiro-mensal',
    titulo: 'Relatório Financeiro Mensal',
    descricao:
      'Visão completa das entradas e despesas do mês, saldo final e comparativo com mês anterior.',
    icon: <BarChart2 className="w-6 h-6" />,
    cor: 'brand',
    disponivel: false,
  },
  {
    id: 'por-moto',
    titulo: 'Relatório por Moto',
    descricao:
      'Histórico de locações, manutenções e receita gerada por cada moto da frota.',
    icon: <Bike className="w-6 h-6" />,
    cor: 'info',
    disponivel: false,
  },
  {
    id: 'por-cliente',
    titulo: 'Relatório por Cliente',
    descricao:
      'Histórico de contratos, cobranças e inadimplência por cliente.',
    icon: <Users className="w-6 h-6" />,
    cor: 'success',
    disponivel: false,
  },
  {
    id: 'fluxo-caixa',
    titulo: 'Fluxo de Caixa',
    descricao:
      'Projeção de entradas e saídas dos próximos 30, 60 e 90 dias.',
    icon: <ArrowLeftRight className="w-6 h-6" />,
    cor: 'warning',
    disponivel: false,
  },
]

const statsDoMes = {
  receita: 3850,
  despesas: 2030,
  saldo: 1820,
  contratosAtivos: 2,
  cobrancasPendentes: 2,
  totalMultas: 618.86,
}

export default function RelatoriosPage() {
  const [toast, setToast] = useState(false)

  function handleGerarRelatorio() {
    setToast(true)
    setTimeout(() => setToast(false), 3000)
  }

  const mesNome = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    new Date()
  )

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Relatórios" subtitle="Análises e exportações do sistema" />

      <div className="p-6 space-y-6">
        {/* Current month summary */}
        <div>
          <p className="text-xs text-[#666666] uppercase tracking-wider mb-3">
            Resumo — {mesNome.charAt(0).toUpperCase() + mesNome.slice(1)}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              title="Receita"
              value={formatCurrency(statsDoMes.receita)}
              icon={<TrendingUp className="w-5 h-5" />}
              color="success"
            />
            <StatCard
              title="Despesas"
              value={formatCurrency(statsDoMes.despesas)}
              icon={<TrendingDown className="w-5 h-5" />}
              color="danger"
            />
            <StatCard
              title="Saldo"
              value={formatCurrency(statsDoMes.saldo)}
              icon={<DollarSign className="w-5 h-5" />}
              color="brand"
            />
            <Card>
              <p className="text-xs text-[#666666] truncate">Contratos Ativos</p>
              <p className="text-2xl font-bold text-white mt-0.5">{statsDoMes.contratosAtivos}</p>
            </Card>
            <Card>
              <p className="text-xs text-[#666666] truncate">Cobranças Pendentes</p>
              <p className="text-2xl font-bold text-amber-400 mt-0.5">
                {statsDoMes.cobrancasPendentes}
              </p>
            </Card>
            <Card>
              <p className="text-xs text-[#666666] truncate">Multas</p>
              <p className="text-2xl font-bold text-red-400 mt-0.5">
                {formatCurrency(statsDoMes.totalMultas)}
              </p>
            </Card>
          </div>
        </div>

        {/* Relatorio Cards Grid */}
        <div>
          <p className="text-xs text-[#666666] uppercase tracking-wider mb-3">
            Relatórios disponíveis
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatorios.map((rel) => {
              const colorMap = {
                brand: { bg: 'bg-[#BAFF1A]/10', text: 'text-[#BAFF1A]', border: 'border-[#BAFF1A]/20' },
                success: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
                warning: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
                danger: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
                info: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
              }
              const colors = colorMap[rel.cor]

              return (
                <div
                  key={rel.id}
                  className="bg-[#202020] border border-[#333333] rounded-xl p-5 flex items-start gap-4 hover:border-[#444444] transition-colors"
                >
                  <div className={`p-3 rounded-xl flex-shrink-0 ${colors.bg} border ${colors.border}`}>
                    <div className={colors.text}>{rel.icon}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white text-sm">{rel.titulo}</h3>
                      {!rel.disponivel && (
                        <Badge variant="muted" className="text-xs">
                          Em breve
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#A0A0A0] mb-4 leading-relaxed">{rel.descricao}</p>
                    <Button
                      size="sm"
                      variant={rel.disponivel ? 'primary' : 'outline'}
                      onClick={handleGerarRelatorio}
                      disabled={!rel.disponivel}
                      className={!rel.disponivel ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      {!rel.disponivel && <Lock className="w-3.5 h-3.5" />}
                      {rel.disponivel ? (
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

        {/* Coming Soon notice */}
        <Card className="text-center py-8">
          <BarChart2 className="w-12 h-12 text-[#333333] mx-auto mb-3" />
          <p className="text-white font-medium mb-1">Relatórios em desenvolvimento</p>
          <p className="text-sm text-[#666666] max-w-md mx-auto">
            Os relatórios completos com exportação em PDF e Excel estão sendo desenvolvidos e estarão
            disponíveis em breve.
          </p>
        </Card>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#202020] border border-[#BAFF1A]/30 shadow-2xl">
          <div className="w-2 h-2 rounded-full bg-[#BAFF1A]" />
          <p className="text-sm text-white">Este relatório ainda não está disponível.</p>
        </div>
      )}
    </div>
  )
}
