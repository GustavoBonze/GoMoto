/**
 * ARQUIVO: src/app/(dashboard)/dashboard/page.tsx
 * 
 * DESCRIÇÃO DETALHADA:
 * Este arquivo define a página principal de "Dashboard" (Painel de Controle) do sistema GoMoto.
 * Ele serve como o centro nevrálgico de monitoramento, consolidando dados de diversas áreas:
 * 1. Operacional: Status da frota de motos (disponíveis, alugadas, manutenção).
 * 2. Comercial: Contratos ativos e fila de espera de clientes.
 * 3. Financeiro: Receitas, despesas, lucro do mês e controle de inadimplência.
 * 
 * ARQUITETURA:
 * - Utiliza Next.js App Router (pasta dashboard dentro de um route group de autenticação).
 * - Componentes de UI modulares (Card, Badge, Header) para consistência visual.
 * - Ícones da biblioteca Lucide-React para auxílio visual semântico.
 * 
 * REGRAS DE NEGÓCIO APLICADAS:
 * - O lucro é calculado em tempo real com base nas receitas e despesas informadas.
 * - Cores semânticas indicam criticidade (ex: vermelho para cobranças vencidas).
 * - A data exibida no cabeçalho é dinâmica, refletindo o mês e ano atuais.
 */

// Importação do componente de cabeçalho padronizado do layout
import { Header } from '@/components/layout/Header'
// Importação do componente de cartão de estatística reutilizável
import { StatCard } from '@/components/ui/Card'
// Importação do componente de medalha/etiqueta de status
import { StatusBadge } from '@/components/ui/Badge'
// Importação de funções utilitárias para formatação de moeda e datas no padrão brasileiro
import { formatCurrency, formatDate } from '@/lib/utils'
// Importação de ícones específicos da biblioteca Lucide para representar cada métrica
import {
  Bike,            // Representa a frota de motocicletas
  Users,           // Representa os clientes ou usuários
  DollarSign,      // Representa o fluxo financeiro geral
  AlertTriangle,   // Alerta para situações críticas (atrasos)
  Clock,           // Representa tempo ou fila de espera
  TrendingUp,      // Indicador de crescimento ou receita
  TrendingDown,    // Indicador de queda ou despesas
  FileText,        // Representa documentos ou contratos
} from 'lucide-react'

/**
 * OBJETO: dashboardStats
 * 
 * Este objeto simula a resposta de uma API ou consulta ao banco de dados (Supabase).
 * Ele contém o estado atual consolidado dos KPIs (Key Performance Indicators) do negócio.
 * 
 * CAMPOS:
 * - availableMotorcycles: Inteiro. Motos no pátio prontas para entrega.
 * - rentedMotorcycles: Inteiro. Motos que estão sob contrato de aluguel.
 * - maintenanceMotorcycles: Inteiro. Motos paradas para reparo ou revisão preventiva.
 * - activeContracts: Inteiro. Total de contratos de locação vigentes no momento.
 * - overduePaymentsCount: Inteiro. Quantidade de faturas não pagas após o vencimento.
 * - monthlyRevenue: Float. Soma bruta de todos os recebimentos registrados no mês atual.
 * - monthlyExpenses: Float. Soma de todos os gastos (manutenção, impostos, pessoal, etc) do mês.
 * - queuedCustomers: Inteiro. Número de leads que manifestaram interesse mas aguardam moto.
 */
const dashboardStats = {
  availableMotorcycles: 2,        // Unidades prontas para novo contrato
  rentedMotorcycles: 3,           // Unidades gerando receita recorrente
  maintenanceMotorcycles: 0,      // Unidades indisponíveis temporariamente
  activeContracts: 3,             // Volume de negócios ativos
  overduePaymentsCount: 1,        // Risco financeiro imediato
  monthlyRevenue: 4500,           // Faturamento bruto mensal (Ex: 3 contratos de R$ 1.500)
  monthlyExpenses: 800,           // Custos operacionais do período
  queuedCustomers: 2,             // Demanda reprimida por falta de estoque
}

/**
 * ARRAY: recentContracts
 * 
 * Lista de objetos representando os últimos contratos fechados ou de maior relevância.
 * Utilizada para preencher a tabela de visualização rápida no lado esquerdo do dashboard.
 * 
 * PROPRIEDADES DE CADA ITEM:
 * - id: Identificador único do contrato no sistema.
 * - customer: Nome completo do locatário.
 * - motorcycle: Modelo da moto e placa para identificação rápida do veículo.
 * - value: Valor mensal da locação em Reais.
 * - dueDate: Data limite para o próximo pagamento do ciclo.
 * - status: Estado atual do contrato (ativo, encerrado, etc).
 */
const recentContracts = [
  { 
    id: '1', 
    customer: 'João Silva', 
    motorcycle: 'Honda Pop 110 — ABC1234', 
    value: 1500, 
    dueDate: '2026-03-20', 
    status: 'ativo' 
  },
  { 
    id: '2', 
    customer: 'Maria Santos', 
    motorcycle: 'Honda Biz 125 — XYZ5678', 
    value: 1800, 
    dueDate: '2026-03-15', 
    status: 'ativo' 
  },
  { 
    id: '3', 
    customer: 'Carlos Lima', 
    motorcycle: 'Yamaha Factor 150 — QRS9012', 
    value: 1200, 
    dueDate: '2026-03-10', 
    status: 'ativo' 
  },
]

/**
 * ARRAY: overduePaymentsList
 * 
 * Coleção de faturas que ultrapassaram a data de vencimento sem confirmação de pagamento.
 * Crucial para o fluxo de cobrança e controle de inadimplência.
 * 
 * PROPRIEDADES:
 * - id: ID da transação financeira.
 * - customer: Nome do cliente devedor.
 * - value: Valor da parcela em atraso.
 * - dueDate: Data original em que o pagamento deveria ter ocorrido.
 * - days: Quantidade calculada de dias de atraso para cálculo de juros/multa.
 */
const overduePaymentsList = [
  { 
    id: '1', 
    customer: 'Pedro Alves', 
    value: 1500, 
    dueDate: '2026-03-05', 
    days: 6 
  },
]

/**
 * COMPONENTE PRINCIPAL: DashboardPage
 * 
 * Renderiza a visualização completa da página inicial do administrador.
 * 
 * FUNCIONAMENTO:
 * 1. Calcula internamente o lucro líquido (Receita - Despesa).
 * 2. Formata a data de referência para o título.
 * 3. Organiza o layout em uma grade responsiva que se adapta de mobile para desktop.
 */
export default function DashboardPage() {
  /**
   * CONSTANTE: monthlyProfit
   * 
   * Representa o resultado financeiro final do mês corrente (EBITDA aproximado).
   * Se positivo, indica lucro; se negativo, indica prejuízo no período.
   */
  const monthlyProfit = dashboardStats.monthlyRevenue - dashboardStats.monthlyExpenses

  /**
   * RETORNO JSX:
   * Define a estrutura visual da página usando Tailwind CSS para estilização.
   */
  return (
    <div className="flex flex-col min-h-screen">
      {/* 
        * COMPONENTE: Cabeçalho (Header)
        * 
        * PROPRIEDADES:
        * - title: Título estático da página.
        * - subtitle: Texto dinâmico que usa Intl.DateTimeFormat para formatar o mês atual.
        *   Ex: "Visão geral — março de 2026"
        */}
      <Header
        title="Dashboard"
        subtitle={`Visão geral — ${new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date())}`}
      />

      {/* 
        * CONTAINER: Espaçamento interno (Padding) e organização vertical (Space-y) 
        */}
      <div className="p-6 space-y-6">
        
        {/* 
          * GRID: Cartões de Estatísticas Operacionais
          * 
          * Configuração: 2 colunas em telas pequenas, 4 colunas em telas grandes (Desktop).
          */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* CARTÃO 1: MOTOS DISPONÍVEIS
            * Mostra quantas motos estão paradas aguardando locação.
            * Cor 'brand' (verde limão) indica o potencial de novos negócios.
            */}
          <StatCard
            title="Motos Disponíveis"
            value={dashboardStats.availableMotorcycles}
            subtitle={`${dashboardStats.rentedMotorcycles} alugadas`}
            icon={<Bike className="w-5 h-5" />}
            color="brand"
          />

          {/* CARTÃO 2: CONTRATOS ATIVOS
            * Mostra o volume atual de operações em curso.
            * Cor 'info' (azul) representa estabilidade operacional.
            */}
          <StatCard
            title="Contratos Ativos"
            value={dashboardStats.activeContracts}
            icon={<FileText className="w-5 h-5" />}
            color="info"
          />

          {/* CARTÃO 3: COBRANÇAS VENCIDAS
            * Indicador crítico de inadimplência.
            * LÓGICA DE COR: Vermelho (danger) se houver vencidos, caso contrário, verde (success).
            */}
          <StatCard
            title="Cobranças Vencidas"
            value={dashboardStats.overduePaymentsCount}
            subtitle="Requer atenção"
            icon={<AlertTriangle className="w-5 h-5" />}
            color={dashboardStats.overduePaymentsCount > 0 ? 'danger' : 'success'}
          />

          {/* CARTÃO 4: FILA DE ESPERA
            * Indica clientes interessados sem veículo disponível.
            * Cor 'warning' (âmbar) sinaliza necessidade de aquisição de novas motos.
            */}
          <StatCard
            title="Fila de Espera"
            value={dashboardStats.queuedCustomers}
            subtitle="clientes aguardando"
            icon={<Clock className="w-5 h-5" />}
            color="warning"
          />
        </div>

        {/* 
          * GRID: Resumo Financeiro Consolidado
          * 
          * Configuração: 3 colunas em Desktop para Receita, Despesa e Lucro.
          */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* CARTÃO: RECEITA DO MÊS
            * Valor bruto total que entrou no caixa.
            * Formata o número usando formatCurrency para exibir R$.
            */}
          <StatCard
            title="Receita do Mês"
            value={formatCurrency(dashboardStats.monthlyRevenue)}
            icon={<TrendingUp className="w-5 h-5" />}
            color="success"
          />

          {/* CARTÃO: DESPESAS DO MÊS
            * Total de saídas do período.
            * Cor 'danger' (vermelho) para simbolizar saída de capital.
            */}
          <StatCard
            title="Despesas do Mês"
            value={formatCurrency(dashboardStats.monthlyExpenses)}
            icon={<TrendingDown className="w-5 h-5" />}
            color="danger"
          />

          {/* CARTÃO: LUCRO LÍQUIDO
            * Saldo final após dedução de custos.
            * LÓGICA DE COR: Verde se lucro >= 0, Vermelho se prejuízo < 0.
            */}
          <StatCard
            title="Lucro do Mês"
            value={formatCurrency(monthlyProfit)}
            icon={<DollarSign className="w-5 h-5" />}
            color={monthlyProfit >= 0 ? 'success' : 'danger'}
          />
        </div>

        {/* 
          * GRID: Tabelas de Detalhamento
          * 
          * Configuração: 2 colunas em Desktop (Lado a lado).
          */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CONTAINER: CONTRATOS ATIVOS
            * Bloco estilizado com fundo escuro e bordas sutis.
            */}
          <div className="bg-[#202020] border border-[#333333] rounded-xl overflow-hidden">
            {/* CABEÇALHO DO BLOCO: Título e Link de Ação */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#333333] bg-[#252525]">
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Contratos Ativos</h3>
              <a href="/contratos" className="text-xs text-[#BAFF1A] font-bold hover:underline transition-all">Ver todos</a>
            </div>
            
            {/* LISTAGEM DE CONTRATOS: Itera sobre o array recentContracts */}
            <div className="divide-y divide-[#2a2a2a]">
              {recentContracts.map((contract) => (
                <div key={contract.id} className="px-5 py-4 flex items-center justify-between hover:bg-[#252525] transition-colors">
                  {/* COLUNA ESQUERDA: Identificação do Cliente e Bem */}
                  <div className="min-w-0">
                    {/* Nome do locatário com elipse se for muito longo */}
                    <p className="text-sm font-medium text-white truncate">{contract.customer}</p>
                    {/* Detalhes da moto em cinza para menor hierarquia visual */}
                    <p className="text-xs text-[#A0A0A0] truncate mt-1">{contract.motorcycle}</p>
                  </div>
                  
                  {/* COLUNA DIREITA: Valores e Vencimentos */}
                  <div className="text-right flex-shrink-0 ml-4">
                    {/* Valor mensal destacado */}
                    <p className="text-sm font-bold text-white">
                      {formatCurrency(contract.value)}
                      <span className="text-[10px] text-[#606060] font-normal ml-1">/MÊS</span>
                    </p>
                    {/* Data formatada do próximo vencimento */}
                    <p className="text-[11px] text-[#A0A0A0] mt-1 font-medium italic">Vence {formatDate(contract.dueDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONTAINER: COBRANÇAS VENCIDAS
            * Bloco focado em gestão de cobrança.
            */}
          <div className="bg-[#202020] border border-[#333333] rounded-xl overflow-hidden">
            {/* CABEÇALHO DO BLOCO */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#333333] bg-[#252525]">
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Cobranças Vencidas</h3>
              <a href="/cobrancas" className="text-xs text-[#BAFF1A] font-bold hover:underline transition-all">Ver todas</a>
            </div>
            
            {/* RENDERIZAÇÃO CONDICIONAL: Verifica se há inadimplência */}
            {overduePaymentsList.length === 0 ? (
              /* ESTADO VAZIO: Exibido quando não há atrasos */
              <div className="px-5 py-12 text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <p className="text-sm text-[#A0A0A0] font-medium">Tudo em dia! Nenhuma cobrança vencida.</p>
              </div>
            ) : (
              /* LISTAGEM DE INADIMPLENTES: Itera sobre overduePaymentsList */
              <div className="divide-y divide-[#2a2a2a]">
                {overduePaymentsList.map((payment) => (
                  <div key={payment.id} className="px-5 py-4 flex items-center justify-between hover:bg-[#252525] transition-colors">
                    {/* COLUNA ESQUERDA: Devedor e tempo de atraso */}
                    <div>
                      <p className="text-sm font-medium text-white">{payment.customer}</p>
                      {/* Texto em vermelho destacando os dias de atraso */}
                      <p className="text-xs text-red-400 mt-1 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Atrasado há {payment.days} dias
                      </p>
                    </div>
                    
                    {/* COLUNA DIREITA: Valor da dívida e status visual */}
                    <div className="text-right flex flex-col items-end gap-1.5">
                      {/* Valor total pendente */}
                      <p className="text-sm font-bold text-red-400">{formatCurrency(payment.value)}</p>
                      {/* Badge personalizada com a cor vermelha de 'vencido' */}
                      <StatusBadge status="vencido" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 
              * RODAPÉ DO BLOCO: Indicadores Rápidos de Status da Frota
              * 
              * Fornece um resumo visual da alocação de ativos.
              */}
            <div className="px-5 py-5 border-t border-[#333333] mt-auto bg-[#1a1a1a]">
              <p className="text-[10px] font-bold text-[#606060] uppercase tracking-[0.2em] mb-4">Monitoramento de Ativos</p>
              <div className="flex flex-wrap items-center gap-6">
                
                {/* INDICADOR: MOTOS LIVRES */}
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
                  <span className="text-xs text-[#A0A0A0] font-medium">{dashboardStats.availableMotorcycles} Disponíveis</span>
                </div>
                
                {/* INDICADOR: MOTOS RENTABILIZANDO */}
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.4)]" />
                  <span className="text-xs text-[#A0A0A0] font-medium">{dashboardStats.rentedMotorcycles} Alugadas</span>
                </div>
                
                {/* INDICADOR: MOTOS EM REPARO (Exibição Opcional) */}
                {dashboardStats.maintenanceMotorcycles > 0 && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                    <span className="text-xs text-[#A0A0A0] font-medium">{dashboardStats.maintenanceMotorcycles} Em Manutenção</span>
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
 * - Esta página foi otimizada para ser um ponto de partida para o usuário administrador.
 * - O uso de cores (#BAFF1A, #A0A0A0, #202020) segue a identidade visual da GoMoto.
 * - A responsividade garante que o gestor possa conferir os dados pelo celular na oficina ou no escritório.
 */
