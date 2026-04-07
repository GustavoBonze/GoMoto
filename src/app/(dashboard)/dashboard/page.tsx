/**
 * @file page.tsx
 * @description Página principal do Dashboard do Sistema GoMoto.
 *
 * DESCRIÇÃO DETALHADA:
 * Esta página apresenta um resumo em tempo real da operação da locadora,
 * consumindo dados reais do banco de dados Supabase via Server Component.
 *
 * ARQUITETURA:
 * - Server Component (sem 'use client') — os dados são buscados no servidor.
 * - Função auxiliar getDashboardData() centraliza todas as queries ao Supabase.
 * - Componentes de UI modulares (StatCard, StatusBadge, Header) garantem consistência visual.
 *
 * KPIs exibidos:
 * 1. Motos disponíveis, alugadas e em manutenção (status real da tabela motos).
 * 2. Contratos ativos (tabela contratos).
 * 3. Cobranças vencidas e pendentes (tabela cobrancas).
 * 4. Clientes na fila de espera (tabela queue_entries).
 * 5. Receita e despesas do mês atual (tabelas entradas e despesas).
 * 6. Listagem dos últimos 5 contratos ativos com dados de cliente e moto.
 * 7. Listagem das últimas 5 cobranças vencidas com nome do cliente.
 */

// Importação do componente de cabeçalho padronizado do layout
import { Header } from '@/components/layout/Header'
// Importação do componente de cartão de estatística reutilizável
import { StatCard } from '@/components/ui/Card'
// Importação do componente de medalha/etiqueta de status
import { StatusBadge } from '@/components/ui/Badge'
// Importação de funções utilitárias para formatação de moeda e datas no padrão brasileiro
import { formatCurrency, formatDate } from '@/lib/utils'
// Importação do cliente Supabase para execução no servidor (Server Component)
import { createClient } from '@/lib/supabase/server'
// Importação de ícones específicos da biblioteca Lucide para representar cada métrica
import {
  Bike,            // Representa a frota de motocicletas
  DollarSign,      // Representa o fluxo financeiro geral
  AlertTriangle,   // Alerta para situações críticas (atrasos)
  Clock,           // Representa tempo ou fila de espera
  TrendingUp,      // Indicador de crescimento ou receita
  TrendingDown,    // Indicador de queda ou despesas
  FileText,        // Representa documentos ou contratos
} from 'lucide-react'

/**
 * @interface ContratoRecente
 * @description Estrutura dos dados retornados pelo join de contratos com clientes e motos.
 * Usada para tipar corretamente o resultado da query de contratos ativos recentes.
 */
interface ContratoRecente {
  id: string
  monthly_amount: number
  end_date: string | null
  customers: { name: string } | null
  motorcycles: { model: string; make: string; license_plate: string } | null
}

/**
 * @interface CobrancaVencida
 * @description Estrutura dos dados retornados pelo join de cobrancas com clientes.
 * Usada para tipar corretamente o resultado da query de cobranças em atraso.
 */
interface CobrancaVencida {
  id: string
  amount: number
  due_date: string
  customers: { name: string } | null
}

/**
 * @function getDashboardData
 * @description Função assíncrona que busca e consolida todos os KPIs e listas do dashboard
 * a partir do banco de dados Supabase. As queries são executadas sequencialmente
 * usando o mesmo client para garantir estabilidade.
 *
 * @returns Objeto com todas as métricas e listas necessárias para o dashboard.
 */
async function getDashboardData() {
  /** Instância do client Supabase para operações no servidor */
  const supabase = await createClient()

  // ─── KPIs de Frota ────────────────────────────────────────────────────────

  /** a) Motos com status 'available' prontas para novo contrato */
  const { count: availableMotorcycles } = await supabase
    .from('motorcycles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available')

  /** b) Motos com status 'rented' gerando receita recorrente */
  const { count: rentedMotorcycles } = await supabase
    .from('motorcycles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rented')

  /** c) Motos com status 'maintenance' temporariamente indisponíveis */
  const { count: maintenanceMotorcycles } = await supabase
    .from('motorcycles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'maintenance')

  // ─── KPIs Comerciais ──────────────────────────────────────────────────────

  /** d) Total de contratos vigentes com status 'active' */
  const { count: activeContracts } = await supabase
    .from('contracts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  /** e) Cobranças com prazo vencido sem pagamento confirmado */
  const { count: overduePaymentsCount } = await supabase
    .from('billings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'overdue')

  /** f) Cobranças aguardando pagamento (dentro do prazo) */
  const { count: pendingPaymentsCount } = await supabase
    .from('billings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  /** g) Clientes com cadastro ativo no sistema */
  const { count: activeClients } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('active', true)

  /** h) Clientes aguardando moto disponível na fila */
  const { count: queuedCustomers } = await supabase
    .from('queue_entries')
    .select('*', { count: 'exact', head: true })

  // ─── KPIs Financeiros do Mês Atual ────────────────────────────────────────

  /**
   * Cálculo do intervalo de datas do mês corrente no formato YYYY-MM-DD.
   * Utilizado como filtro nas queries de entradas e despesas.
   */
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  /** i) Receita bruta: soma de todas as entradas financeiras do mês atual */
  const { data: entradasData } = await supabase
    .from('incomes')
    .select('amount')
    .gte('date', firstDay)
    .lte('date', lastDay)

  const monthlyRevenue = (entradasData || []).reduce(
    (sum, row) => sum + (Number(row.amount) || 0),
    0
  )

  /** j) Despesas totais: soma de todas as saídas financeiras do mês atual */
  const { data: despesasData } = await supabase
    .from('expenses')
    .select('amount')
    .gte('date', firstDay)
    .lte('date', lastDay)

  const monthlyExpenses = (despesasData || []).reduce(
    (sum, row) => sum + (Number(row.amount) || 0),
    0
  )

  // ─── Listas Recentes ──────────────────────────────────────────────────────

  /** k) Últimos 5 contratos ativos com dados do cliente e da moto (join) */
  const { data: recentContractsData } = await supabase
    .from('contracts')
    .select('id, monthly_amount, end_date, customers(name), motorcycles(model, make, license_plate)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5)

  /** l) Últimas 5 cobranças vencidas ordenadas por data de vencimento (mais antigas primeiro) */
  const { data: overduePaymentsData } = await supabase
    .from('billings')
    .select('id, amount, due_date, customers(name)')
    .eq('status', 'overdue')
    .order('due_date', { ascending: true })
    .limit(5)

  return {
    availableMotorcycles: availableMotorcycles ?? 0,
    rentedMotorcycles: rentedMotorcycles ?? 0,
    maintenanceMotorcycles: maintenanceMotorcycles ?? 0,
    activeContracts: activeContracts ?? 0,
    overduePaymentsCount: overduePaymentsCount ?? 0,
    pendingPaymentsCount: pendingPaymentsCount ?? 0,
    activeClients: activeClients ?? 0,
    queuedCustomers: queuedCustomers ?? 0,
    monthlyRevenue,
    monthlyExpenses,
    recentContracts: (recentContractsData ?? []) as unknown as ContratoRecente[],
    overduePaymentsList: (overduePaymentsData ?? []) as unknown as CobrancaVencida[],
  }
}

/**
 * @component DashboardPage
 * @description Componente de servidor (Server Component) que renderiza a página principal
 * do painel de controle do Sistema GoMoto.
 *
 * FUNCIONAMENTO:
 * 1. Busca todos os dados reais do Supabase via getDashboardData().
 * 2. Calcula o lucro líquido do mês (Receita - Despesas).
 * 3. Organiza o layout em grade responsiva adaptada para mobile e desktop.
 */
export default async function DashboardPage() {
  /** Busca todos os KPIs e listas do Supabase */
  const data = await getDashboardData()

  /**
   * @constant monthlyProfit
   * @description Resultado financeiro líquido do mês. Positivo = lucro, negativo = prejuízo.
   */
  const monthlyProfit = data.monthlyRevenue - data.monthlyExpenses

  return (
    <div className="flex flex-col min-h-screen">
      {/*
       * COMPONENTE: Cabeçalho (Header)
       * subtitle usa Intl.DateTimeFormat para exibir "março de 2026" no padrão pt-BR.
       */}
      <Header
        title="Dashboard"
        subtitle={`Visão geral — ${new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date())}`}
      />

      {/* CONTAINER: Espaçamento interno e organização vertical */}
      <div className="p-6 space-y-6">

        {/*
         * GRID: Cartões de Estatísticas Operacionais
         * Configuração: 2 colunas em telas pequenas, 4 colunas em Desktop.
         */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {/* CARTÃO 1: MOTOS DISPONÍVEIS — potencial de novos negócios (verde limão) */}
          <StatCard
            title="Motos Disponíveis"
            value={data.availableMotorcycles}
            subtitle={`${data.rentedMotorcycles} alugadas`}
            icon={Bike}
          />

          {/* CARTÃO 2: CONTRATOS ATIVOS */}
          <StatCard
            title="Contratos Ativos"
            value={data.activeContracts}
            icon={FileText}
          />

          {/* CARTÃO 3: COBRANÇAS VENCIDAS */}
          <StatCard
            title="Cobranças Vencidas"
            value={data.overduePaymentsCount}
            subtitle="Requer atenção"
            icon={AlertTriangle}
          />

          {/* CARTÃO 4: FILA DE ESPERA */}
          <StatCard
            title="Fila de Espera"
            value={data.queuedCustomers}
            subtitle="clientes aguardando"
            icon={Clock}
          />
        </div>

        {/*
         * GRID: Resumo Financeiro Consolidado
         * Configuração: 3 colunas em Desktop para Receita, Despesa e Lucro.
         */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* CARTÃO: RECEITA DO MÊS — faturamento bruto total do período */}
          <StatCard
            title="Receita do Mês"
            value={formatCurrency(data.monthlyRevenue)}
            icon={TrendingUp}
          />

          {/* CARTÃO: DESPESAS DO MÊS */}
          <StatCard
            title="Despesas do Mês"
            value={formatCurrency(data.monthlyExpenses)}
            icon={TrendingDown}
          />

          {/* CARTÃO: LUCRO LÍQUIDO */}
          <StatCard
            title="Lucro do Mês"
            value={formatCurrency(monthlyProfit)}
            icon={DollarSign}
          />
        </div>

        {/*
         * GRID: Tabelas de Detalhamento
         * Configuração: 2 colunas em Desktop (lado a lado).
         */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* CONTAINER: CONTRATOS ATIVOS — últimos 5 contratos vigentes */}
          <div className="bg-[#202020] border border-[#474747] rounded-2xl overflow-hidden">
            {/* CABEÇALHO DO BLOCO */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#474747] bg-[#202020]">
              <h3 className="text-[20px] font-bold text-[#f5f5f5]">Contratos Ativos</h3>
              <a href="/contratos" className="text-[12px] text-[#BAFF1A] font-bold hover:underline transition-all">Ver todos</a>
            </div>

            {/* LISTAGEM DE CONTRATOS: itera sobre os contratos recentes do Supabase */}
            <div className="divide-y divide-[#323232]">
              {data.recentContracts.length === 0 ? (
                /* ESTADO VAZIO */
                <div className="px-5 py-12 text-center">
                  <p className="text-[13px] text-[#9e9e9e] font-medium">Nenhum contrato ativo no momento.</p>
                </div>
              ) : (
                data.recentContracts.map((contrato) => (
                  <div key={contrato.id} className="px-5 py-4 flex items-center justify-between hover:bg-[#323232] transition-colors">
                    {/* COLUNA ESQUERDA: identificação do cliente e bem */}
                    <div className="min-w-0">
                      {/* Nome do locatário — fallback para 'Cliente' se não houver join */}
                      <p className="text-[13px] font-medium text-[#f5f5f5] truncate">
                        {contrato.customers?.name ?? 'Cliente'}
                      </p>
                      {/* Moto: Fabricante + Modelo + Placa */}
                      <p className="text-[12px] text-[#9e9e9e] truncate mt-1">
                        {`${contrato.motorcycles?.make ?? ''} ${contrato.motorcycles?.model ?? ''} — ${contrato.motorcycles?.license_plate ?? ''}`}
                      </p>
                    </div>

                    {/* COLUNA DIREITA: valor mensal e data de vencimento do contrato */}
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-[13px] font-bold text-[#f5f5f5]">
                        {formatCurrency(contrato.monthly_amount)}
                        <span className="text-[12px] text-[#616161] font-normal ml-1">/MÊS</span>
                      </p>
                      <p className="text-[12px] text-[#9e9e9e] mt-1 font-medium italic">
                        {contrato.end_date ? `Vence ${formatDate(contrato.end_date)}` : 'Sem vencimento'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CONTAINER: COBRANÇAS VENCIDAS — foco em gestão de inadimplência */}
          <div className="bg-[#202020] border border-[#474747] rounded-2xl overflow-hidden">
            {/* CABEÇALHO DO BLOCO */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#474747] bg-[#202020]">
              <h3 className="text-[20px] font-bold text-[#f5f5f5]">Cobranças Vencidas</h3>
              <a href="/cobrancas" className="text-[12px] text-[#BAFF1A] font-bold hover:underline transition-all">Ver todas</a>
            </div>

            {/* RENDERIZAÇÃO CONDICIONAL: verifica se há inadimplência */}
            {data.overduePaymentsList.length === 0 ? (
              /* ESTADO VAZIO: tudo em dia */
              <div className="px-5 py-12 text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-[#0e2f13] rounded-full flex items-center justify-center text-[#28b438]">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <p className="text-[13px] text-[#9e9e9e] font-medium">Tudo em dia! Nenhuma cobrança vencida.</p>
              </div>
            ) : (
              /* LISTAGEM DE INADIMPLENTES */
              <div className="divide-y divide-[#323232]">
                {data.overduePaymentsList.map((payment) => {
                  /**
                   * Cálculo de dias de atraso:
                   * Adiciona T12:00:00 para evitar problemas de fuso horário na conversão de data.
                   */
                  const today = new Date()
                  const dueDate = new Date(payment.due_date + 'T12:00:00')
                  const diffMs = today.getTime() - dueDate.getTime()
                  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))

                  return (
                    <div key={payment.id} className="px-5 py-4 flex items-center justify-between hover:bg-[#323232] transition-colors">
                      {/* COLUNA ESQUERDA: devedor e tempo de atraso */}
                      <div>
                        <p className="text-[13px] font-medium text-[#f5f5f5]">
                          {payment.customers?.name ?? 'Cliente'}
                        </p>
                        {/* Texto em vermelho destacando os dias de atraso */}
                        <p className="text-[12px] text-[#ff9c9a] mt-1 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Atrasado há {days} dias
                        </p>
                      </div>

                      {/* COLUNA DIREITA: valor da dívida e badge de status */}
                      <div className="text-right flex flex-col items-end gap-1.5">
                        <p className="text-[13px] font-bold text-[#ff9c9a]">{formatCurrency(payment.amount)}</p>
                        <StatusBadge status="vencido" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/*
             * RODAPÉ DO BLOCO: Indicadores Rápidos de Status da Frota
             * Fornece um resumo visual da alocação de ativos em tempo real.
             */}
            <div className="px-5 py-5 border-t border-[#474747] mt-auto bg-[#202020]">
              <p className="text-[12px] font-bold text-[#616161] mb-4">Monitoramento de Ativos</p>
              <div className="flex flex-wrap items-center gap-6">

                {/* INDICADOR: Motos disponíveis (verde) */}
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-[#28b438] rounded-full shadow-[0_0_8px_rgba(40,180,56,0.4)]" />
                  <span className="text-[12px] text-[#9e9e9e] font-medium">{data.availableMotorcycles} Disponíveis</span>
                </div>

                {/* INDICADOR: Motos rentabilizando (roxo) */}
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-[#a880ff] rounded-full shadow-[0_0_8px_rgba(168,128,255,0.4)]" />
                  <span className="text-[12px] text-[#9e9e9e] font-medium">{data.rentedMotorcycles} Alugadas</span>
                </div>

                {/* INDICADOR: Motos em manutenção — exibido apenas se houver (laranja) */}
                {data.maintenanceMotorcycles > 0 && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 bg-[#e65e24] rounded-full shadow-[0_0_8px_rgba(230,94,36,0.4)]" />
                    <span className="text-[12px] text-[#9e9e9e] font-medium">{data.maintenanceMotorcycles} Em Manutenção</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* FIM DO CONTAINER DE COBRANÇAS */}

        </div>
        {/* FIM DA GRID DE TABELAS */}

      </div>
      {/* FIM DA ÁREA DE CONTEÚDO */}
    </div>
  )
}

/**
 * RESUMO TÉCNICO:
 * - Server Component: sem "use client", dados buscados no servidor antes da renderização.
 * - getDashboardData(): centraliza todas as queries Supabase com fallback ?? 0.
 * - Nomes de tabelas e colunas alinhados ao supabase-schema.sql do projeto.
 * - Design visual mantido identicamente ao original (cores #BAFF1A, #202020, #f5f5f5).
 * - Responsividade garantida para mobile (2 cols) e desktop (4 cols / 3 cols / 2 cols).
 */
