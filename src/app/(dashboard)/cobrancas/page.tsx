/**
 * @file page.tsx
 * @description Página de Gerenciamento de Cobranças do Sistema GoMoto.
 *
 * Este arquivo é responsável por renderizar a interface de controle financeiro de recebíveis,
 * conectando-se ao banco de dados Supabase em tempo real para buscar, criar, editar e
 * gerenciar o status de cobranças vinculadas aos contratos de locação.
 *
 * Funcionalidades principais:
 * - Listagem de cobranças em tempo real com filtros por status.
 * - Painel de métricas financeiras calculado sobre os dados reais.
 * - CRUD completo: criar, editar, marcar como pago, marcar como prejuízo e excluir.
 * - Link direto para WhatsApp do cliente em cada linha da tabela.
 *
 * O código segue o padrão internacional com identificadores em Inglês,
 * enquanto a interface e os comentários são em Português Brasil.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, AlertTriangle, Search, MessageCircle, CheckCircle2, Zap, DollarSign } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { ChargeStatus } from '@/types'

/**
 * @type ChargeWithRelations
 * @description Representa uma cobrança retornada pelo Supabase com joins de clientes e contratos.
 */
type ChargeWithRelations = {
  id: string
  contract_id: string | null
  customer_id: string
  description: string
  amount: number
  due_date: string
  status: ChargeStatus
  payment_date: string | null
  observations: string | null
  created_at: string
  updated_at: string
  /** Dados do cliente vinculado via join */
  customers: { name: string; phone: string } | null
  /** Dados do contrato vinculado via join */
  contracts: { id: string } | null
}

/**
 * @type ContratoOption
 * @description Contrato com dados do cliente para exibição no select do formulário.
 */
type ContratoOption = {
  id: string
  customer_id: string
  customers: { name: string } | null
}

/** @constant tabs - Opções de filtragem por status para os botões de aba. */
const tabs = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendentes', value: 'pending' },
  { label: 'Vencidas', value: 'overdue' },
  { label: 'Pagas', value: 'paid' },
  { label: 'Prejuízo', value: 'loss' },
]

/** @constant defaultForm - Estado inicial limpo para o formulário de cobrança. */
const defaultForm = {
  customer_id: '',
  contract_id: '',
  description: '',
  amount: '',
  due_date: '',
  notes: '',
}

/**
 * @component CobrancasPage
 * @description Componente principal da página de cobranças.
 * Gerencia todo o estado da interface, busca dados reais do Supabase e
 * realiza operações de escrita em tempo real.
 */
export default function CobrancasPage() {
  /** @state charges - Lista de cobranças carregada do Supabase. */
  const [charges, setCharges] = useState<ChargeWithRelations[]>([])
  /** @state clientes - Lista de clientes ativos para o select do formulário. */
  const [clientes, setClientes] = useState<{ id: string; name: string }[]>([])
  /** @state contratos - Lista de contratos ativos para o select do formulário. */
  const [contratos, setContratos] = useState<ContratoOption[]>([])

  /** @state loading - Indica se os dados principais estão sendo carregados. */
  const [loading, setLoading] = useState(true)
  /** @state saving - Bloqueia botões durante operações de escrita. */
  const [saving, setSaving] = useState(false)
  /** @state fetchError - Mensagem de erro caso o carregamento falhe. */
  const [fetchError, setFetchError] = useState<string | null>(null)

  /** @state activeTab - Filtro de status selecionado. */
  const [activeTab, setActiveTab] = useState('all')
  /** @state search - Termo de busca textual. */
  const [search, setSearch] = useState('')

  /** @state modalOpen - Controla o modal de criação/edição. */
  const [modalOpen, setModalOpen] = useState(false)
  /** @state editingId - ID da cobrança sendo editada (null = nova). */
  const [editingId, setEditingId] = useState<string | null>(null)
  /** @state form - Dados capturados pelo formulário. */
  const [form, setForm] = useState(defaultForm)

  /** @state confirmingPaid - Cobrança selecionada para confirmar pagamento. */
  const [confirmingPaid, setConfirmingPaid] = useState<ChargeWithRelations | null>(null)
  /** @state paymentMethod - Método de pagamento selecionado no modal. */
  const [paymentMethod, setPaymentMethod] = useState('')
  /** @state confirmingLoss - Cobrança selecionada para marcar como prejuízo. */
  const [confirmingLoss, setConfirmingLoss] = useState<ChargeWithRelations | null>(null)
  /** @state deleting - Cobrança selecionada para exclusão. */
  const [deleting, setDeleting] = useState<ChargeWithRelations | null>(null)

  /**
   * @function fetchCharges
   * @description Busca todas as cobranças do Supabase com join de clientes e contratos.
   * Chamada na montagem do componente e após cada operação de escrita.
   */
  const fetchCharges = useCallback(async () => {
    const supabase = createClient()
    setLoading(true)
    setFetchError(null)
    try {
      const { data, error } = await supabase
        .from('billings')
        .select('*, customers(name, phone), contracts(id)')
        .order('due_date', { ascending: false })

      if (error) throw error
      setCharges((data as ChargeWithRelations[]) ?? [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      setFetchError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * @function fetchDependencies
   * @description Busca clientes ativos e contratos ativos para popular os selects do formulário.
   */
  const fetchDependencies = useCallback(async () => {
    const supabase = createClient()
    try {
      const [{ data: clientesData }, { data: contratosData }] = await Promise.all([
        supabase.from('customers').select('id, name').eq('active', true).order('name'),
        supabase.from('contracts').select('id, customer_id, customers(name)').eq('status', 'active'),
      ])
      setClientes(clientesData ?? [])
      setContratos((contratosData as unknown as ContratoOption[]) ?? [])
    } catch (err) {
    }
  }, [])

  /** Carrega os dados na montagem inicial do componente. */
  useEffect(() => {
    fetchCharges()
    fetchDependencies()
  }, [fetchCharges, fetchDependencies])

  /**
   * @function openNew
   * @description Reseta o formulário e abre o modal para criação de uma nova cobrança.
   */
  function openNew() {
    setEditingId(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  /**
   * @function openEdit
   * @description Preenche o formulário com os dados existentes e abre o modal para edição.
   * @param row - Objeto da cobrança a ser editada.
   */
  function openEdit(row: ChargeWithRelations) {
    setEditingId(row.id)
    setForm({
      customer_id: row.customer_id,
      contract_id: row.contract_id ?? '',
      description: row.description,
      amount: String(row.amount),
      due_date: row.due_date,
      notes: row.observations ?? '',
    })
    setModalOpen(true)
  }

  /**
   * @function handleSubmit
   * @description Envia os dados do formulário ao Supabase para inserção ou atualização.
   * @param e - Evento de submissão do formulário.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    try {
      if (editingId) {
        /** Atualização de cobrança existente */
        const { error } = await supabase.from('billings').update({
          customer_id: form.customer_id,
          contract_id: form.contract_id || null,
          description: form.description,
          amount: parseFloat(form.amount),
          due_date: form.due_date,
          observations: form.notes || null,
        }).eq('id', editingId)
        if (error) throw error
      } else {
        /** Inserção de nova cobrança */
        const { error } = await supabase.from('billings').insert({
          customer_id: form.customer_id,
          contract_id: form.contract_id || null,
          description: form.description,
          amount: parseFloat(form.amount),
          due_date: form.due_date,
          status: 'pending',
          observations: form.notes || null,
        })
        if (error) throw error
      }
      setModalOpen(false)
      await fetchCharges()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar'
      alert('Erro ao salvar cobrança: ' + msg)
    } finally {
      setSaving(false)
    }
  }

  /**
   * @function confirmPaid
   * @description Atualiza o status para 'paid', registra a data de pagamento e o método utilizado.
   */
  async function confirmPaid() {
    if (!confirmingPaid || !paymentMethod) return
    setSaving(true)
    const supabase = createClient()
    try {
      const obsAtual = confirmingPaid.observations ? confirmingPaid.observations + '\n' : ''
      const { error } = await supabase.from('billings').update({
        status: 'paid',
        payment_date: new Date().toISOString().split('T')[0],
        observations: `${obsAtual}Método: ${paymentMethod}`,
      }).eq('id', confirmingPaid.id)
      if (error) throw error
      setConfirmingPaid(null)
      setPaymentMethod('')
      await fetchCharges()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao confirmar pagamento'
      alert('Erro: ' + msg)
    } finally {
      setSaving(false)
    }
  }

  /**
   * @function confirmLoss
   * @description Atualiza o status da cobrança para 'loss' (prejuízo irrecuperável).
   */
  async function confirmLoss() {
    if (!confirmingLoss) return
    setSaving(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.from('billings').update({ status: 'loss' }).eq('id', confirmingLoss.id)
      if (error) throw error
      setConfirmingLoss(null)
      await fetchCharges()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao marcar como prejuízo'
      alert('Erro: ' + msg)
    } finally {
      setSaving(false)
    }
  }

  /**
   * @function confirmDeletion
   * @description Remove permanentemente uma cobrança do banco de dados.
   */
  async function confirmDeletion() {
    if (!deleting) return
    setSaving(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.from('billings').delete().eq('id', deleting.id)
      if (error) throw error
      setDeleting(null)
      await fetchCharges()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir'
      alert('Erro: ' + msg)
    } finally {
      setSaving(false)
    }
  }

  /**
   * @variable filtered
   * @description Aplica filtros de aba e busca textual sobre a lista de cobranças.
   */
  const filtered = charges
    .filter((c) => activeTab === 'all' || c.status === activeTab)
    .filter((c) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        (c.customers?.name ?? '').toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      )
    })

  /** CÁLCULOS FINANCEIROS E MÉTRICAS */

  /** @variable totalPaid - Soma de cobranças com status 'paid'. */
  const totalPaid = charges.filter((c) => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0)
  const paidCharges = charges.filter((c) => c.status === 'paid')
  /** @variable averageTicket - Média de valor por cobrança paga. */
  const averageTicket = paidCharges.length > 0 ? totalPaid / paidCharges.length : 0

  /** @variable totalPending - Soma de cobranças com status 'pending'. */
  const totalPending = charges.filter((c) => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0)
  /** @variable projection30Days - Cobranças pendentes que vencem nos próximos 30 dias. */
  const today = new Date()
  const in30Days = new Date(today); in30Days.setDate(today.getDate() + 30)
  const projection30Days = charges
    .filter((c) => c.status === 'pending' && new Date(c.due_date + 'T00:00:00') <= in30Days)
    .reduce((sum, c) => sum + c.amount, 0)

  /** @variable totalOverdue - Soma de cobranças com status 'overdue'. */
  const totalOverdue = charges.filter((c) => c.status === 'overdue').reduce((sum, c) => sum + c.amount, 0)
  const sortedOverdue = charges
    .filter((c) => c.status === 'overdue')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
  const oldestCharge = sortedOverdue[0]
  const daysOverdue = oldestCharge
    ? Math.floor((today.getTime() - new Date(oldestCharge.due_date + 'T00:00:00').getTime()) / 86400000)
    : 0

  /** @variable defaultersCount - Quantidade de itens em atraso ou perdidos. */
  const defaultersCount = charges.filter((c) => c.status === 'overdue' || c.status === 'loss').length
  const defaultRate = charges.length > 0 ? (defaultersCount / charges.length) * 100 : 0
  /** @variable paidOnTime - Cobranças pagas no prazo ou antecipadas. */
  const paidOnTime = paidCharges.filter((c) => c.payment_date && c.payment_date <= c.due_date).length
  const punctualityRate = paidCharges.length > 0 ? (paidOnTime / paidCharges.length) * 100 : 0

  /** @variable totalUnpaid - Pendentes + vencidas (tudo que não entrou no caixa). */
  const totalUnpaid = totalPending + totalOverdue
  const averageTime = paidCharges.length > 0
    ? paidCharges.reduce((sum, c) => {
        const days = c.payment_date
          ? Math.floor((new Date(c.payment_date).getTime() - new Date(c.due_date).getTime()) / 86400000)
          : 0
        return sum + days
      }, 0) / paidCharges.length
    : 0

  /** @variable totalLoss - Soma dos prejuízos contabilizados. */
  const totalLoss = charges.filter((c) => c.status === 'loss').reduce((sum, c) => sum + c.amount, 0)
  const lossByCustomer: Record<string, number> = {}
  charges.filter((c) => c.status === 'loss').forEach((c) => {
    const name = c.customers?.name ?? 'Desconhecido'
    lossByCustomer[name] = (lossByCustomer[name] ?? 0) + c.amount
  })
  const topLoss = Object.entries(lossByCustomer).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="flex flex-col min-h-full">
      {/* Cabeçalho superior com título e ação global */}
      <Header
        title="Cobranças"
        subtitle="Controle de recebimentos em tempo real"
        actions={
          <Button onClick={openNew}>
            <Plus className="w-4 h-4" />
            Nova Cobrança
          </Button>
        }
      />

      <div className="p-6 space-y-4">

        {/* Banner sobre integração com InfinitePay */}
        <div className="rounded-xl border border-[#6b9900] bg-[#243300] px-4 py-4 space-y-3">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-[#BAFF1A] mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#BAFF1A]">
                Integração com InfinitePay em breve
              </p>
              <p className="text-sm text-[#9e9e9e] mt-0.5">
                Esta tela será integrada com a plataforma InfinitePay para geração e gestão automatizada de cobranças.
                Os dados abaixo são <span className="text-[#f5f5f5] font-medium">reais do seu banco de dados</span>.
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#0e2f13] border border-[#28b438] px-2.5 py-1 text-xs font-medium text-[#28b438]">
              <CheckCircle2 className="w-3 h-3" />
              Dados em tempo real
            </span>
          </div>
          <div className="border-t border-[#6b9900] pt-3">
            <p className="text-xs text-[#9e9e9e] mb-2">O que esta tela irá apresentar após a integração</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5">
              {[
                'Total recebido no período',
                'Total a receber (em aberto)',
                'Cobranças vencidas',
                '% de inadimplência',
                'Valores não pagos acumulados',
                'Prejuízos contabilizados',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BAFF1A] shrink-0" />
                  <span className="text-xs text-[#9e9e9e]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mensagem de erro no carregamento */}
        {fetchError && (
          <div className="rounded-xl border border-[#ff9c9a] bg-[#7c1c1c] px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#ff9c9a] shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#ff9c9a]">Erro ao carregar cobranças</p>
              <p className="text-xs text-[#9e9e9e] mt-0.5">{fetchError}</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchCharges}>
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Grid de Cards de Métricas */}
        <div className="grid grid-cols-3 gap-4">

          {/* Card 1: Total Recebido e Ticket Médio */}
          <Card padding="none">
            <div className="p-4 border-b border-[#474747]">
              <p className="text-xs text-[#9e9e9e]">Total Recebido</p>
              <p className="text-[28px] font-bold text-[#BAFF1A] mt-1">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-[#9e9e9e] mt-0.5">{paidCharges.length} cobranças pagas</p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-[#9e9e9e]">Ticket médio</span>
              <span className="text-xs font-semibold text-[#f5f5f5]">{formatCurrency(averageTicket)}</span>
            </div>
          </Card>

          {/* Card 2: A Receber e Projeção 30 Dias */}
          <Card padding="none">
            <div className="p-4 border-b border-[#474747]">
              <p className="text-xs text-[#9e9e9e]">A Receber</p>
              <p className="text-[28px] font-bold text-[#e65e24] mt-1">{formatCurrency(totalPending)}</p>
              <p className="text-xs text-[#9e9e9e] mt-0.5">{charges.filter((c) => c.status === 'pending').length} em aberto</p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-[#9e9e9e]">Vencem em 30 dias</span>
              <span className="text-xs font-semibold text-[#e65e24]">{formatCurrency(projection30Days)}</span>
            </div>
          </Card>

          {/* Card 3: Vencidas e Cobrança Mais Atrasada */}
          <Card padding="none">
            <div className="p-4 border-b border-[#474747]">
              <p className="text-xs text-[#9e9e9e]">Vencidas</p>
              <p className="text-[28px] font-bold text-[#ff9c9a] mt-1">{formatCurrency(totalOverdue)}</p>
              <p className="text-xs text-[#9e9e9e] mt-0.5">{charges.filter((c) => c.status === 'overdue').length} cobranças</p>
            </div>
            <div className="px-4 py-3">
              {oldestCharge ? (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-[#9e9e9e] truncate max-w-[130px]" title={oldestCharge.customers?.name ?? ''}>
                    {(oldestCharge.customers?.name ?? '—').split(' ')[0]}
                  </span>
                  <span className="text-xs font-semibold text-[#ff9c9a] shrink-0">{daysOverdue}d atraso</span>
                </div>
              ) : (
                <span className="text-xs text-[#28b438]">Nenhuma em atraso</span>
              )}
            </div>
          </Card>

          {/* Card 4: Taxa de Inadimplência e Pontualidade */}
          <Card padding="none">
            <div className="p-4 border-b border-[#474747]">
              <p className="text-xs text-[#9e9e9e]">Inadimplência</p>
              <p className={`text-[28px] font-bold mt-1 ${defaultRate > 0 ? 'text-[#ff9c9a]' : 'text-[#28b438]'}`}>
                {defaultRate.toFixed(1)}%
              </p>
              <p className="text-xs text-[#9e9e9e] mt-0.5">
                {defaultersCount} cobrança(s) vencida(s) ou perdida(s) de {charges.length}
              </p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#9e9e9e]">Pontualidade</p>
                <p className="text-xs text-[#616161] mt-0.5">das {paidCharges.length} pagas</p>
              </div>
              <span className={`text-sm font-semibold ${punctualityRate >= 80 ? 'text-[#28b438]' : punctualityRate >= 50 ? 'text-[#e65e24]' : 'text-[#ff9c9a]'}`}>
                {punctualityRate.toFixed(1)}%
              </span>
            </div>
          </Card>

          {/* Card 5: Valores Não Pagos e Tempo Médio de Recebimento */}
          <Card padding="none">
            <div className="p-4 border-b border-[#474747]">
              <p className="text-xs text-[#9e9e9e]">Valores Não Pagos</p>
              <p className={`text-[28px] font-bold mt-1 ${totalUnpaid > 0 ? 'text-[#e65e24]' : 'text-[#28b438]'}`}>
                {formatCurrency(totalUnpaid)}
              </p>
              <p className="text-xs text-[#9e9e9e] mt-0.5">Pendentes + vencidas</p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-[#9e9e9e]">Tempo médio de receb.</span>
              <span className="text-xs font-semibold text-[#f5f5f5]">
                {averageTime === 0 ? 'No prazo' : averageTime > 0 ? `${averageTime.toFixed(0)}d após venc.` : `${Math.abs(averageTime).toFixed(0)}d antecipado`}
              </span>
            </div>
          </Card>

          {/* Card 6: Prejuízos Contabilizados */}
          <Card padding="none" className={totalLoss > 0 ? 'border-[#ff9c9a] bg-[#7c1c1c]' : ''}>
            <div className={`p-4 border-b ${totalLoss > 0 ? 'border-[#ff9c9a]' : 'border-[#474747]'}`}>
              <div className="flex items-center gap-2">
                <p className={`text-xs ${totalLoss > 0 ? 'text-[#ff9c9a]' : 'text-[#9e9e9e]'}`}>
                  Prejuízos Contabilizados
                </p>
                {totalLoss > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#7c1c1c] border border-[#ff9c9a] px-2 py-0.5 text-xs font-medium text-[#ff9c9a]">
                    Atenção
                  </span>
                )}
              </div>
              <p className={`text-[28px] font-bold mt-1 ${totalLoss > 0 ? 'text-[#ff9c9a]' : 'text-[#28b438]'}`}>
                {formatCurrency(totalLoss)}
              </p>
              <p className={`text-xs mt-0.5 ${totalLoss > 0 ? 'text-[#ff9c9a]' : 'text-[#9e9e9e]'}`}>
                {charges.filter((c) => c.status === 'loss').length === 0
                  ? 'Nenhum prejuízo registrado'
                  : `${charges.filter((c) => c.status === 'loss').length} cobrança(s) irrecuperável(is)`}
              </p>
            </div>
            <div className="px-4 py-3">
              {topLoss ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-[#9e9e9e]">Maior prejuízo</p>
                    <p className="text-xs font-medium text-[#f5f5f5] truncate max-w-[130px]" title={topLoss[0]}>
                      {topLoss[0].split(' ')[0]}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[#ff9c9a] shrink-0">{formatCurrency(topLoss[1])}</span>
                </div>
              ) : (
                <span className="text-xs text-[#28b438]">Nenhum prejuízo registrado</span>
              )}
            </div>
          </Card>

        </div>

        {/* Barra de Filtros e Busca */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                  activeTab === tab.value
                    ? 'bg-[#BAFF1A] text-[#121212]'
                    : 'bg-[#202020] border border-[#474747] text-[#9e9e9e] hover:text-[#f5f5f5]'
                }`}
              >
                {tab.label}
                {tab.value !== 'all' && (
                  <span className={`ml-1.5 ${activeTab === tab.value ? 'text-[#121212]' : 'text-[#616161]'}`}>
                    ({charges.filter((c) => c.status === tab.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9e9e9e]" />
            <input
              type="text"
              placeholder="Buscar por cliente ou descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-lg bg-[#323232] border border-[#323232] text-sm text-[#f5f5f5] placeholder-[#616161] focus:outline-none focus:border-[#474747] w-72"
            />
          </div>
        </div>

        {/* Tabela de Cobranças */}
        <div className="overflow-hidden rounded-2xl border border-[#474747] bg-[#202020]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <svg className="animate-spin h-8 w-8 text-[#BAFF1A]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm text-[#c7c7c7]">Carregando cobranças...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[#c7c7c7] text-sm italic">Nenhuma cobrança encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[16px] text-[#f5f5f5]">
                <thead className="bg-[#323232] text-[#c7c7c7]">
                  <tr>
                    <th className="h-16 px-4 font-bold">Cliente</th>
                    <th className="h-16 px-4 font-bold">Descrição</th>
                    <th className="h-16 px-4 font-bold">Valor</th>
                    <th className="h-16 px-4 font-bold">Vencimento</th>
                    <th className="h-16 px-4 font-bold">Status</th>
                    <th className="h-16 px-4 font-bold">Dt. Pagamento</th>
                    <th className="h-16 px-4 text-right font-bold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const phone = row.customers?.phone
                    const wpLink = phone ? `https://wa.me/55${phone.replace(/\D/g, '')}` : null
                    return (
                      <tr key={row.id} className="transition-colors odd:bg-transparent even:bg-[#323232] hover:bg-[#474747] h-16">
                        <td className="px-4 font-medium">
                          <div className="flex items-center gap-2">
                            <span className="text-[#f5f5f5]">{row.customers?.name ?? '—'}</span>
                            {wpLink && (
                              <a
                                href={wpLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Abrir WhatsApp"
                                className="text-[#9e9e9e] hover:text-[#28b438] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-4 text-[16px]">{row.description}</td>
                        <td className="whitespace-nowrap px-4 font-semibold text-[#f5f5f5]">{formatCurrency(row.amount)}</td>
                        <td className="whitespace-nowrap px-4 text-[16px]">{formatDate(row.due_date)}</td>
                        <td className="px-4"><StatusBadge status={row.status} /></td>
                        <td className="whitespace-nowrap px-4 text-[16px] text-[#9e9e9e]">
                          {row.payment_date ? formatDate(row.payment_date) : '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="secondary" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(row)} title="Editar">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            {(row.status === 'pending' || row.status === 'overdue') && (
                              <Button variant="primary" size="sm" className="h-8 w-8 p-0" onClick={() => { setConfirmingPaid(row); setPaymentMethod('') }} title="Marcar como pago">
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            {(row.status === 'pending' || row.status === 'overdue') && (
                              <Button variant="danger" size="sm" className="h-8 w-8 p-0" onClick={() => setConfirmingLoss(row)} title="Contabilizar como prejuízo">
                                <AlertTriangle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="danger" size="sm" className="h-8 w-8 p-0" onClick={() => setDeleting(row)} title="Excluir">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Formulário de criação ou edição de cobrança */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Cobrança' : 'Nova Cobrança'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Cliente"
            options={[
              { value: '', label: 'Selecione um cliente' },
              ...clientes.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={form.customer_id}
            onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
            required
          />
          <Select
            label="Contrato (opcional)"
            options={[
              { value: '', label: 'Nenhum contrato vinculado' },
              ...contratos
                .filter((c) => !form.customer_id || c.customer_id === form.customer_id)
                .map((c) => ({
                  value: c.id,
                  label: `${c.id.slice(0, 8)}... — ${c.customers?.name ?? 'Cliente'}`,
                })),
            ]}
            value={form.contract_id}
            onChange={(e) => setForm({ ...form, contract_id: e.target.value })}
          />
          <Input
            label="Descrição"
            placeholder="Ex: Semanal — 10/03 a 16/03"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              placeholder="350.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
            <Input
              label="Vencimento"
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              required
            />
          </div>
          <Textarea
            label="Observações"
            placeholder="Informações adicionais..."
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              <DollarSign className="w-4 h-4" />
              {editingId ? 'Salvar Alterações' : 'Criar Cobrança'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirmar recebimento de pagamento */}
      <Modal open={!!confirmingPaid} onClose={() => setConfirmingPaid(null)} title="Confirmar Pagamento" size="sm">
        <div className="space-y-4">
          <div className="p-4 bg-[#0e2f13] border border-[#28b438] rounded-xl space-y-2">
            <p className="text-sm text-[#f5f5f5] font-medium">Confirmar recebimento desta cobrança?</p>
            {confirmingPaid && (
              <div className="space-y-0.5">
                <p className="text-xs text-[#9e9e9e]">{confirmingPaid.customers?.name ?? '—'}</p>
                <p className="text-xs text-[#9e9e9e]">{confirmingPaid.description}</p>
                <p className="text-sm font-semibold text-[#28b438]">{formatCurrency(confirmingPaid.amount)}</p>
              </div>
            )}
          </div>
          <Select
            label="Método de Pagamento"
            options={[
              { value: '', label: 'Selecione o método' },
              { value: 'PIX', label: 'PIX' },
              { value: 'Dinheiro', label: 'Dinheiro' },
              { value: 'Cartão de Crédito', label: 'Cartão de Crédito' },
              { value: 'Cartão de Débito', label: 'Cartão de Débito' },
              { value: 'Transferência', label: 'Transferência' },
            ]}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          />
          <p className="text-xs text-[#9e9e9e]">A data de pagamento será registrada como hoje.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setConfirmingPaid(null)}>Cancelar</Button>
            <Button onClick={confirmPaid} loading={saving} disabled={!paymentMethod}>
              <CheckCircle className="w-4 h-4" />
              Confirmar Pagamento
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Contabilizar cobrança como prejuízo */}
      <Modal open={!!confirmingLoss} onClose={() => setConfirmingLoss(null)} title="Registrar como Prejuízo" size="sm">
        <div className="space-y-4">
          <div className="p-4 bg-[#7c1c1c] border border-[#ff9c9a] rounded-xl space-y-2">
            <p className="text-sm text-[#f5f5f5] font-medium">Tem certeza que deseja contabilizar esta cobrança como prejuízo?</p>
            {confirmingLoss && (
              <div className="space-y-0.5">
                <p className="text-xs text-[#9e9e9e]">{confirmingLoss.customers?.name ?? '—'}</p>
                <p className="text-xs text-[#9e9e9e]">{confirmingLoss.description}</p>
                <p className="text-sm font-semibold text-[#ff9c9a]">{formatCurrency(confirmingLoss.amount)}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-[#ff9c9a]">Esta ação indica que a dívida é irrecuperável. Não pode ser desfeita facilmente.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setConfirmingLoss(null)}>Cancelar</Button>
            <Button variant="danger" onClick={confirmLoss} loading={saving}>
              <AlertTriangle className="w-4 h-4" />
              Confirmar Prejuízo
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Exclusão definitiva de cobrança */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Excluir Cobrança" size="sm">
        <div className="space-y-4">
          <p className="text-[#9e9e9e] text-sm">
            Tem certeza que deseja excluir a cobrança{' '}
            <span className="text-[#f5f5f5] font-medium">{deleting?.description}</span>?
            Esta ação não poderá ser desfeita.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDeletion} loading={saving}>
              <Trash2 className="w-4 h-4" />
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
