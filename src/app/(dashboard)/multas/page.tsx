/**
 * @file src/app/(dashboard)/multas/page.tsx
 * @description Página de Controle de Multas e Infrações de Trânsito do Sistema GoMoto.
 *
 * @summary
 * Conecta ao Supabase para realizar operações CRUD na tabela `multas`,
 * com joins para `clientes` e `motos`. Permite registrar, editar, quitar e
 * excluir multas, além de filtrar por status e responsável.
 */

'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, AlertTriangle, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { formatCurrency, formatDate } from '@/lib/utils'

/**
 * @type FineWithRelations
 * @description Tipo local que representa uma multa com os dados relacionados
 * de cliente e moto já embutidos (resultado do JOIN do Supabase).
 */
type FineWithRelations = {
  id: string
  customer_id: string
  motorcycle_id: string
  description: string
  amount: number
  infraction_date: string
  status: 'pending' | 'paid'
  payment_date?: string | null
  responsible: 'customer' | 'company'
  observations?: string | null
  created_at: string
  customers: { name: string; phone: string } | null
  motorcycles: { license_plate: string; model: string; make: string } | null
}

/**
 * @constant commonInfractions
 * @description Lista das infrações mais comuns do CTB para preenchimento rápido no formulário.
 */
const commonInfractions = [
  { description: 'Excesso de velocidade até 20% acima do limite', amount: 88.38 },
  { description: 'Não sinalizar mudança de faixa', amount: 88.38 },
  { description: 'Conduzir sem documentos do veículo', amount: 130.16 },
  { description: 'Conduzir sem capacete de proteção', amount: 195.23 },
  { description: 'Estacionamento irregular', amount: 195.23 },
  { description: 'Excesso de velocidade entre 20% e 50% acima do limite', amount: 195.23 },
  { description: 'Avançar sinal vermelho ou parada obrigatória', amount: 293.47 },
  { description: 'Habilitação (CNH) vencida', amount: 293.47 },
  { description: 'Licenciamento do veículo vencido', amount: 293.47 },
  { description: 'Uso de celular ao volante', amount: 293.47 },
  { description: 'Conduzir sem habilitação (CNH)', amount: 880.41 },
  { description: 'Embriaguez ao volante', amount: 2934.70 },
]

/** @constant defaultForm - Estado inicial do formulário de multa. */
const defaultForm = {
  customer_id: '',
  motorcycle_id: '',
  description: '',
  amount: '',
  infraction_date: '',
  responsible: 'customer',
  observations: '',
}

/**
 * @component MultasPage
 * @description Componente principal da página de multas.
 * Orquestra busca de dados no Supabase, filtros, modais e operações CRUD.
 */
export default function MultasPage() {
  // --- ESTADOS DE DADOS ---
  /** @state fines - Lista completa de multas buscada do Supabase. */
  const [fines, setFines] = useState<FineWithRelations[]>([])
  /** @state customers - Lista de clientes ativos para os selects do formulário. */
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([])
  /** @state motorcycles - Lista de motos para os selects do formulário. */
  const [motorcycles, setMotorcycles] = useState<{ id: string; license_plate: string; model: string; make: string }[]>([])

  // --- ESTADOS DE UI ---
  /** @state loading - Indica se os dados estão sendo carregados. */
  const [loading, setLoading] = useState(true)
  /** @state error - Mensagem de erro, se houver falha ao buscar ou salvar dados. */
  const [error, setError] = useState<string | null>(null)
  /** @state saving - Indica se uma operação de gravação está em andamento. */
  const [saving, setSaving] = useState(false)
  /** @state modalOpen - Controla a visibilidade do modal de criar/editar. */
  const [modalOpen, setModalOpen] = useState(false)
  /** @state editingId - ID da multa sendo editada; null indica criação. */
  const [editingId, setEditingId] = useState<string | null>(null)
  /** @state form - Valores atuais do formulário de multa. */
  const [form, setForm] = useState(defaultForm)
  /** @state deleting - Multa selecionada para exclusão (abre modal de confirmação). */
  const [deleting, setDeleting] = useState<FineWithRelations | null>(null)
  /** @state payingFine - Multa selecionada para registrar pagamento. */
  const [payingFine, setPayingFine] = useState<FineWithRelations | null>(null)
  /** @state paymentDateInput - Data de pagamento informada pelo usuário no modal de baixa. */
  const [paymentDateInput, setPaymentDateInput] = useState('')

  // --- ESTADOS DE FILTROS ---
  /** @state search - Termo de busca textual. */
  const [search, setSearch] = useState('')
  /** @state statusFilter - Aba de filtro ativa: all | pending | paid | customer | company. */
  const [statusFilter, setStatusFilter] = useState('all')

  // --- SUPABASE CLIENT ---
  const supabase = createClient()

  // ============================================================
  // BUSCA DE DADOS
  // ============================================================

  /**
   * @function fetchAllData
   * @description Busca multas (com join), clientes e motos de forma concorrente no Supabase.
   * Chamada na montagem do componente e após cada operação CRUD.
   */
  const fetchAllData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [finesRes, customersRes, motosRes] = await Promise.all([
        supabase
          .from('fines')
          .select('*, customers(name, phone), motorcycles(license_plate, model, make)')
          .order('infraction_date', { ascending: false }),
        supabase
          .from('customers')
          .select('id, name')
          .eq('active', true)
          .order('name'),
        supabase
          .from('motorcycles')
          .select('id, license_plate, model, make')
          .order('license_plate'),
      ])

      if (finesRes.error) throw finesRes.error
      if (customersRes.error) throw customersRes.error
      if (motosRes.error) throw motosRes.error

      setFines(finesRes.data as FineWithRelations[])
      setCustomers(customersRes.data ?? [])
      setMotorcycles(motosRes.data ?? [])
    } catch (err) {
      console.error('Erro ao buscar dados de multas:', err)
      setError('Não foi possível carregar os dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  /** Carrega os dados ao montar o componente. */
  useEffect(() => {
    fetchAllData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ============================================================
  // HANDLERS DE MODAL
  // ============================================================

  /**
   * @function openNew
   * @description Abre o modal em modo de criação com o formulário limpo.
   */
  function openNew() {
    setEditingId(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  /**
   * @function openEdit
   * @description Abre o modal em modo de edição com os dados da multa selecionada.
   */
  function openEdit(row: FineWithRelations) {
    setEditingId(row.id)
    setForm({
      customer_id: row.customer_id,
      motorcycle_id: row.motorcycle_id,
      description: row.description,
      amount: String(row.amount),
      infraction_date: row.infraction_date,
      responsible: row.responsible,
      observations: row.observations ?? '',
    })
    setModalOpen(true)
  }

  /**
   * @function handleCloseModal
   * @description Fecha e reseta o modal de criar/editar.
   */
  function handleCloseModal() {
    setModalOpen(false)
    setEditingId(null)
    setForm(defaultForm)
  }

  // ============================================================
  // OPERAÇÕES CRUD
  // ============================================================

  /**
   * @function handleSubmit
   * @description Salva a multa no Supabase (INSERT para criação, UPDATE para edição).
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      customer_id: form.customer_id,
      motorcycle_id: form.motorcycle_id,
      description: form.description,
      amount: parseFloat(form.amount),
      infraction_date: form.infraction_date,
      responsible: form.responsible,
      observations: form.observations || null,
    }

    try {
      if (editingId) {
        /** Edição: atualiza o registro existente pelo ID. */
        const { error: updateError } = await supabase
          .from('fines')
          .update(payload)
          .eq('id', editingId)
        if (updateError) throw updateError
      } else {
        /** Criação: insere novo registro com status padrão 'pending'. */
        const { error: insertError } = await supabase
          .from('fines')
          .insert({ ...payload, status: 'pending' })
        if (insertError) throw insertError
      }

      handleCloseModal()
      await fetchAllData()
    } catch (err) {
      console.error('Erro ao salvar multa:', err)
      setError('Erro ao salvar. Verifique os dados e tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  /**
   * @function handleMarkAsPaid
   * @description Abre o modal de confirmação de pagamento para a multa selecionada,
   * pré-preenchendo a data com o dia de hoje.
   */
  function handleMarkAsPaid(row: FineWithRelations) {
    setPayingFine(row)
    setPaymentDateInput(new Date().toISOString().split('T')[0])
  }

  /**
   * @function confirmPayment
   * @description Atualiza o status da multa para 'paid' e registra a data de pagamento.
   */
  async function confirmPayment() {
    if (!payingFine) return
    setSaving(true)
    setError(null)
    try {
      const { error: payError } = await supabase
        .from('fines')
        .update({ status: 'paid', payment_date: paymentDateInput })
        .eq('id', payingFine.id)
      if (payError) throw payError

      setPayingFine(null)
      setPaymentDateInput('')
      await fetchAllData()
    } catch (err) {
      console.error('Erro ao registrar pagamento:', err)
      setError('Erro ao registrar pagamento. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  /**
   * @function confirmDeletion
   * @description Remove a multa permanentemente do banco de dados.
   */
  async function confirmDeletion() {
    if (!deleting) return
    setSaving(true)
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('fines')
        .delete()
        .eq('id', deleting.id)
      if (deleteError) throw deleteError

      setDeleting(null)
      await fetchAllData()
    } catch (err) {
      console.error('Erro ao excluir multa:', err)
      setError('Erro ao excluir multa. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  // ============================================================
  // DADOS DERIVADOS E CÁLCULOS
  // ============================================================

  /** @const filteredFines - Lista de multas após aplicar filtros de busca e aba. */
  const filteredFines = fines.filter((m) => {
    const matchesSearch = !search || (() => {
      const q = search.toLowerCase()
      return (
        (m.customers?.name ?? '').toLowerCase().includes(q) ||
        (m.motorcycles?.license_plate ?? '').toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
      )
    })()

    const matchesFilter =
      statusFilter === 'all' ? true :
      statusFilter === 'customer' || statusFilter === 'company' ? m.responsible === statusFilter :
      m.status === statusFilter

    return matchesSearch && matchesFilter
  })

  /** @const pendingFines - Multas com status pendente. */
  const pendingFines = fines.filter((f) => f.status === 'pending')
  /** @const pendingAmount - Soma total das multas pendentes. */
  const pendingAmount = pendingFines.reduce((acc, f) => acc + Number(f.amount), 0)
  /** @const companyFines - Multas de responsabilidade da empresa. */
  const companyFines = fines.filter((f) => f.responsible === 'company')
  /** @const companyAmount - Soma total das multas da empresa. */
  const companyAmount = companyFines.reduce((acc, f) => acc + Number(f.amount), 0)

  /** @const statusTabs - Configuração das abas de filtro de status/responsável. */
  const statusTabs = [
    { label: 'Todas', value: 'all' },
    { label: 'Pendentes', value: 'pending' },
    { label: 'Pagas', value: 'paid' },
    { label: 'Cliente', value: 'customer' },
    { label: 'Empresa', value: 'company' },
  ]

  /**
   * @const columns
   * @description Configuração das colunas da tabela de multas.
   */
  const columns = [
    {
      key: 'infraction_date',
      header: 'Data',
      render: (row: FineWithRelations) => (
        <span className="text-[#f5f5f5]">{formatDate(row.infraction_date)}</span>
      ),
    },
    {
      key: 'description',
      header: 'Infração',
      render: (row: FineWithRelations) => (
        <div className="max-w-xs">
          <p className="text-[#f5f5f5] line-clamp-1">{row.description}</p>
          {row.observations && (
            <p className="text-xs text-[#9e9e9e] mt-0.5 line-clamp-1">{row.observations}</p>
          )}
        </div>
      ),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      render: (row: FineWithRelations) => (
        <span className="font-medium text-[#f5f5f5]">{row.customers?.name ?? '—'}</span>
      ),
    },
    {
      key: 'moto',
      header: 'Moto',
      render: (row: FineWithRelations) => (
        <div>
          <span className="block font-mono font-bold text-[#f5f5f5]">{row.motorcycles?.license_plate ?? '—'}</span>
          {row.motorcycles && (
            <span className="block text-xs text-[#9e9e9e]">{row.motorcycles.make} {row.motorcycles.model}</span>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (row: FineWithRelations) => (
        <span className="font-semibold text-[#ff9c9a]">{formatCurrency(Number(row.amount))}</span>
      ),
    },
    {
      key: 'responsible',
      header: 'Responsável',
      render: (row: FineWithRelations) => <StatusBadge status={row.responsible} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: FineWithRelations) => (
        <div>
          <StatusBadge status={row.status} />
          {row.status === 'paid' && row.payment_date && (
            <span className="block mt-1 text-xs text-[#9e9e9e]">{formatDate(row.payment_date)}</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row: FineWithRelations) => (
        <div className="flex items-center gap-1">
          {/* Botão para quitar multa pendente */}
          {row.status === 'pending' && (
            <button
              onClick={() => handleMarkAsPaid(row)}
              title="Marcar como pago"
              className="p-1.5 rounded-lg text-[#28b438] hover:bg-[#0e2f13] transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {/* Editar */}
          <button
            onClick={() => openEdit(row)}
            title="Editar"
            className="p-1.5 rounded-lg text-[#9e9e9e] hover:text-[#f5f5f5] hover:bg-white/5 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {/* Excluir */}
          <button
            onClick={() => setDeleting(row)}
            title="Excluir"
            className="p-1.5 rounded-lg text-[#9e9e9e] hover:text-[#ff9c9a] hover:bg-[#ff9c9a]/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  // ============================================================
  // OPÇÕES DOS SELECTS DO FORMULÁRIO
  // ============================================================

  const customerOptions = [
    { value: '', label: 'Selecione um cliente' },
    ...customers.map((c) => ({ value: c.id, label: c.name })),
  ]

  const motorcycleOptions = [
    { value: '', label: 'Selecione uma moto' },
    ...motorcycles.map((m) => ({ value: m.id, label: `${m.license_plate} — ${m.make} ${m.model}` })),
  ]

  const responsibleOptions = [
    { value: 'customer', label: 'Cliente' },
    { value: 'company', label: 'Empresa' },
  ]

  const infractionQuickfillOptions = [
    { value: '', label: 'Selecione uma infração comum...' },
    ...commonInfractions.map((i) => ({
      value: i.description,
      label: `${i.description} — ${formatCurrency(i.amount)}`,
    })),
  ]

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex flex-col min-h-full">
      {/* Cabeçalho com título e botão de ação principal */}
      <Header
        title="Multas"
        subtitle="Controle de infrações de trânsito"
        actions={
          <Button onClick={openNew}>
            <Plus className="w-4 h-4" />
            Registrar Multa
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Exibe mensagem de erro global, se houver */}
        {error && (
          <div className="p-3 rounded-lg bg-[#7c1c1c]/30 border border-[#ff9c9a]/30 text-sm text-[#ff9c9a]">
            {error}
          </div>
        )}

        {/* Stats cards: resumo financeiro das multas */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <p className="text-xs text-[#9e9e9e] uppercase tracking-wider">Total de Multas</p>
            <p className="text-2xl font-bold text-[#f5f5f5] mt-1">{fines.length}</p>
          </Card>
          <Card>
            <p className="text-xs text-[#9e9e9e] uppercase tracking-wider">Pendentes</p>
            <p className="text-2xl font-bold text-[#e65e24] mt-1">{pendingFines.length}</p>
            <p className="text-xs text-[#e65e24]/70 mt-0.5">{formatCurrency(pendingAmount)}</p>
          </Card>
          <Card>
            <p className="text-xs text-[#9e9e9e] uppercase tracking-wider">Da Empresa</p>
            <p className="text-2xl font-bold text-[#a880ff] mt-1">{companyFines.length}</p>
            <p className="text-xs text-[#a880ff]/70 mt-0.5">{formatCurrency(companyAmount)}</p>
          </Card>
        </div>

        {/* Alerta visual se houver multas pendentes */}
        {pendingFines.length > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#3a180f] border border-[#e65e24]/30">
            <AlertTriangle className="w-4 h-4 text-[#e65e24] flex-shrink-0" />
            <p className="text-sm text-[#e65e24]">
              Há <strong>{pendingFines.length}</strong> multa(s) pendente(s) totalizando{' '}
              <strong>{formatCurrency(pendingAmount)}</strong>.
            </p>
          </div>
        )}

        {/* Barra de filtros e busca */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                  statusFilter === tab.value
                    ? 'bg-[#BAFF1A] text-[#121212]'
                    : 'bg-[#202020] border border-[#474747] text-[#9e9e9e] hover:text-[#f5f5f5]'
                }`}
              >
                {tab.label}
                {tab.value !== 'all' && (
                  <span className="ml-1.5 opacity-70">
                    (
                    {tab.value === 'customer' || tab.value === 'company'
                      ? fines.filter((m) => m.responsible === tab.value).length
                      : fines.filter((m) => m.status === tab.value).length}
                    )
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9e9e9e]" />
            <input
              type="text"
              placeholder="Buscar por cliente, placa ou infração..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-lg bg-[#323232] border border-[#323232] text-sm text-[#f5f5f5] placeholder-[#616161] focus:outline-none focus:border-[#474747] w-72"
            />
          </div>
        </div>

        {/* Tabela de multas */}
        <Card padding="none">
          <Table
            columns={columns}
            data={filteredFines}
            keyExtractor={(row) => row.id}
            loading={loading}
            emptyMessage="Nenhuma multa encontrada para os filtros aplicados"
          />
        </Card>
      </div>

      {/* ======================================================
          Modal: Criar / Editar Multa
      ====================================================== */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Editar Multa' : 'Registrar Multa'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Linha 1: Cliente e Moto */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Cliente"
              options={customerOptions}
              value={form.customer_id}
              onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
              required
            />
            <Select
              label="Moto"
              options={motorcycleOptions}
              value={form.motorcycle_id}
              onChange={(e) => setForm({ ...form, motorcycle_id: e.target.value })}
              required
            />
          </div>

          {/* Preenchimento rápido com infrações comuns do CTB */}
          <Select
            label="Infrações Comuns (CTB) — preenchimento rápido"
            options={infractionQuickfillOptions}
            value={commonInfractions.find((i) => i.description === form.description)?.description ?? ''}
            onChange={(e) => {
              const selected = commonInfractions.find((i) => i.description === e.target.value)
              if (selected) {
                setForm({ ...form, description: selected.description, amount: String(selected.amount) })
              }
            }}
          />

          {/* Descrição da infração */}
          <Input
            label="Descrição da Infração"
            placeholder="Ex: Excesso de velocidade — Av. Paulista"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />

          {/* Linha 3: Valor, Data, Responsável */}
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              min="0"
              placeholder="293.47"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
            <Input
              label="Data da Infração"
              type="date"
              value={form.infraction_date}
              onChange={(e) => setForm({ ...form, infraction_date: e.target.value })}
              required
            />
            <Select
              label="Responsável"
              options={responsibleOptions}
              value={form.responsible}
              onChange={(e) => setForm({ ...form, responsible: e.target.value })}
            />
          </div>

          {/* Observações */}
          <Textarea
            label="Observações (opcional)"
            placeholder="AIT nº, local da infração, recurso em andamento..."
            rows={3}
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
          />

          {/* Botões do formulário */}
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? 'Salvar Alterações' : 'Registrar Multa'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================
          Modal: Confirmar Pagamento
      ====================================================== */}
      <Modal
        open={!!payingFine}
        onClose={() => { setPayingFine(null); setPaymentDateInput('') }}
        title="Confirmar Pagamento"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-[#323232] border border-[#474747] rounded-lg space-y-1">
            <p className="text-sm text-[#9e9e9e]">
              Cliente: <span className="text-[#f5f5f5] font-medium">{payingFine?.customers?.name ?? '—'}</span>
            </p>
            <p className="text-sm text-[#9e9e9e]">
              Valor: <span className="text-[#ff9c9a] font-semibold">{payingFine ? formatCurrency(Number(payingFine.amount)) : ''}</span>
            </p>
          </div>
          <Input
            label="Data do Pagamento"
            type="date"
            value={paymentDateInput}
            onChange={(e) => setPaymentDateInput(e.target.value)}
            required
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => { setPayingFine(null); setPaymentDateInput('') }}>
              Cancelar
            </Button>
            <Button loading={saving} onClick={confirmPayment}>
              <CheckCircle className="w-4 h-4" />
              Confirmar Pagamento
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================================================
          Modal: Confirmar Exclusão
      ====================================================== */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Excluir Multa" size="sm">
        <div className="space-y-4">
          <p className="text-[#9e9e9e] text-sm">
            Tem certeza que deseja excluir a multa{' '}
            <span className="text-[#f5f5f5] font-medium">{deleting?.description}</span>?
            Esta ação removerá permanentemente o histórico da infração.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button variant="danger" loading={saving} onClick={confirmDeletion}>
              <Trash2 className="w-4 h-4" />
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
