import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Bike,
  Users,
  DollarSign,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  FileText,
} from 'lucide-react'

// Dados mockados para demonstração (serão substituídos por dados reais do Supabase)
const stats = {
  motos_disponiveis: 2,
  motos_alugadas: 3,
  motos_manutencao: 0,
  contratos_ativos: 3,
  cobrancas_vencidas: 1,
  receita_mes: 4500,
  despesas_mes: 800,
  clientes_fila: 2,
}

const contratos_recentes = [
  { id: '1', cliente: 'João Silva', moto: 'Honda Pop 110 — ABC1234', valor: 1500, vencimento: '2026-03-20', status: 'ativo' },
  { id: '2', cliente: 'Maria Santos', moto: 'Honda Biz 125 — XYZ5678', valor: 1800, vencimento: '2026-03-15', status: 'ativo' },
  { id: '3', cliente: 'Carlos Lima', moto: 'Yamaha Factor 150 — QRS9012', valor: 1200, vencimento: '2026-03-10', status: 'ativo' },
]

const cobrancas_vencidas = [
  { id: '1', cliente: 'Pedro Alves', valor: 1500, vencimento: '2026-03-05', dias: 6 },
]

export default function DashboardPage() {
  const lucroMes = stats.receita_mes - stats.despesas_mes

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={`Visão geral — ${new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date())}`}
      />

      <div className="p-6 space-y-6">
        {/* Stats principais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Motos Disponíveis"
            value={stats.motos_disponiveis}
            subtitle={`${stats.motos_alugadas} alugadas`}
            icon={<Bike className="w-5 h-5" />}
            color="brand"
          />
          <StatCard
            title="Contratos Ativos"
            value={stats.contratos_ativos}
            icon={<FileText className="w-5 h-5" />}
            color="info"
          />
          <StatCard
            title="Cobranças Vencidas"
            value={stats.cobrancas_vencidas}
            subtitle="Requer atenção"
            icon={<AlertTriangle className="w-5 h-5" />}
            color={stats.cobrancas_vencidas > 0 ? 'danger' : 'success'}
          />
          <StatCard
            title="Fila de Espera"
            value={stats.clientes_fila}
            subtitle="clientes aguardando"
            icon={<Clock className="w-5 h-5" />}
            color="warning"
          />
        </div>

        {/* Financeiro do mês */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <StatCard
            title="Receita do Mês"
            value={formatCurrency(stats.receita_mes)}
            icon={<TrendingUp className="w-5 h-5" />}
            color="success"
          />
          <StatCard
            title="Despesas do Mês"
            value={formatCurrency(stats.despesas_mes)}
            icon={<TrendingDown className="w-5 h-5" />}
            color="danger"
          />
          <StatCard
            title="Lucro do Mês"
            value={formatCurrency(lucroMes)}
            icon={<DollarSign className="w-5 h-5" />}
            color={lucroMes >= 0 ? 'success' : 'danger'}
          />
        </div>

        {/* Tabelas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contratos recentes */}
          <div className="bg-[#202020] border border-[#333333] rounded-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#333333]">
              <h3 className="font-semibold text-white text-sm">Contratos Ativos</h3>
              <a href="/contratos" className="text-xs text-[#BAFF1A] hover:underline">Ver todos</a>
            </div>
            <div className="divide-y divide-[#2a2a2a]">
              {contratos_recentes.map((c) => (
                <div key={c.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{c.cliente}</p>
                    <p className="text-xs text-[#A0A0A0] truncate mt-0.5">{c.moto}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm font-semibold text-white">{formatCurrency(c.valor)}<span className="text-xs text-[#A0A0A0] font-normal">/mês</span></p>
                    <p className="text-xs text-[#A0A0A0] mt-0.5">Vence {formatDate(c.vencimento)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cobranças vencidas */}
          <div className="bg-[#202020] border border-[#333333] rounded-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#333333]">
              <h3 className="font-semibold text-white text-sm">Cobranças Vencidas</h3>
              <a href="/cobrancas" className="text-xs text-[#BAFF1A] hover:underline">Ver todas</a>
            </div>
            {cobrancas_vencidas.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-[#A0A0A0]">Nenhuma cobrança vencida</p>
              </div>
            ) : (
              <div className="divide-y divide-[#2a2a2a]">
                {cobrancas_vencidas.map((c) => (
                  <div key={c.id} className="px-5 py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{c.cliente}</p>
                      <p className="text-xs text-red-400 mt-0.5">Venceu há {c.dias} dias</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-400">{formatCurrency(c.valor)}</p>
                      <StatusBadge status="vencido" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resumo das motos */}
            <div className="px-5 py-4 border-t border-[#333333] mt-2">
              <p className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wider mb-3">Status das Motos</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-[#A0A0A0]">{stats.motos_disponiveis} disponíveis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span className="text-xs text-[#A0A0A0]">{stats.motos_alugadas} alugadas</span>
                </div>
                {stats.motos_manutencao > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full" />
                    <span className="text-xs text-[#A0A0A0]">{stats.motos_manutencao} manutenção</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
