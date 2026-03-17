/**
 * @file page.tsx
 * @description Página de Registro de Entradas (Receitas) do Sistema GoMoto.
 * 
 * Este arquivo gerencia a visualização e o cadastro de todas as entradas financeiras
 * reais no caixa da empresa. Diferente da tela de cobranças (que foca no que deve ser recebido),
 * esta tela foca no que já foi efetivamente pago pelos locatários.
 * 
 * Funcionalidades principais:
 * - Registro histórico de pagamentos recebidos (Semanal, Caução, Multas, etc.).
 * - Painel estatístico com Total Geral, Total do Mês e comparativo com o mês anterior.
 * - Detalhamento (breakdown) de receitas por categoria de referência e por método de pagamento.
 * - Identificação da motocicleta mais rentável do mês atual.
 * - Busca global e filtros rápidos por tipo de entrada.
 * - Paginação de resultados para otimização de performance.
 * 
 * O código utiliza identificadores em Inglês para conformidade técnica e
 * comentários em Português Brasil para clareza da regra de negócio local.
 */

'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, TrendingUp, Search } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Pagination } from '@/components/ui/Pagination'
import type { Income } from '@/types'

/**
 * @constant mockIncomes
 * @description Dados simulados representando entradas financeiras históricas.
 * Utilizado para demonstração de interface e testes de layout enquanto o backend não é integrado.
 */
const mockIncomes: Income[] = [
  {
    id: '141',
    vehicle: 'AAA0A00',
    date: '2026-03-11',
    lessee: 'ALEXANDRE DANTAS DAS SILVA',
    amount: 150.00,
    reference: 'Proporcional',
    payment_method: 'Boleto',
    period_from: '2026-03-09',
    period_to: '2026-03-10',
    observations: '',
    created_at: '2026-03-11T10:00:00Z',
  },
  {
    id: '142',
    vehicle: 'AAA0A00',
    date: '2026-03-09',
    lessee: 'ALEXANDRE DANTAS DAS SILVA',
    amount: 500.00,
    reference: 'Caução',
    payment_method: 'PIX',
    observations: '',
    created_at: '2026-03-09T10:00:00Z',
  },
  {
    id: '140',
    vehicle: 'CCC2C22',
    date: '2026-03-11',
    lessee: 'FABRICIO DO VALE NEPOMUCENO',
    amount: 350.00,
    reference: 'Semanal',
    payment_method: 'Boleto',
    period_from: '2026-03-04',
    period_to: '2026-03-10',
    observations: '',
    created_at: '2026-03-11T10:00:00Z',
  },
  {
    id: '139',
    vehicle: 'DDD3D33',
    date: '2026-03-11',
    lessee: 'FLAVIO SILVA COUTINHO',
    amount: 337.50,
    reference: 'Semanal',
    payment_method: 'Boleto',
    period_from: '2026-03-04',
    period_to: '2026-03-10',
    observations: 'Semanal com divisão de manutenção R$ 12,50',
    created_at: '2026-03-11T10:00:00Z',
  },
  {
    id: '138',
    vehicle: 'DDD3D33',
    date: '2026-03-04',
    lessee: 'FLAVIO SILVA COUTINHO',
    amount: 304.25,
    reference: 'Semanal',
    payment_method: 'Boleto',
    period_from: '2026-02-25',
    period_to: '2026-03-03',
    observations: 'Semanal com divisão de manutenção R$ 45,75',
    created_at: '2026-03-04T10:00:00Z',
  },
  {
    id: '137',
    vehicle: 'CCC2C22',
    date: '2026-03-04',
    lessee: 'FABRICIO DO VALE NEPOMUCENO',
    amount: 350.00,
    reference: 'Semanal',
    payment_method: 'Boleto',
    period_from: '2026-02-25',
    period_to: '2026-03-03',
    observations: '',
    created_at: '2026-03-04T10:00:00Z',
  },
  {
    id: '136',
    vehicle: 'DDD3D33',
    date: '2026-02-25',
    lessee: 'FLAVIO SILVA COUTINHO',
    amount: 335.55,
    reference: 'Semanal',
    payment_method: 'Boleto',
    period_from: '2026-02-18',
    period_to: '2026-02-24',
    observations: 'Semanal com divisão de manutenção R$ 14,45 troca de óleo',
    created_at: '2026-02-25T10:00:00Z',
  },
  {
    id: '135',
    vehicle: 'CCC2C22',
    date: '2026-02-25',
    lessee: 'FABRICIO DO VALE NEPOMUCENO',
    amount: 350.00,
    reference: 'Semanal',
    payment_method: 'Boleto',
    period_from: '2026-02-18',
    period_to: '2026-02-24',
    observations: '',
    created_at: '2026-02-25T10:00:00Z',
  },
  {
    id: '134',
    vehicle: 'DDD3D33',
    date: '2026-02-18',
    lessee: 'FLAVIO SILVA COUTINHO',
    amount: 330.00,
    reference: 'Semanal',
    payment_method: 'PIX',
    period_from: '2026-02-11',
    period_to: '2026-02-17',
    observations: 'Semanal com desconto integral da troca da lona de freio R$ 20,00',
    created_at: '2026-02-18T10:00:00Z',
  },
  {
    id: '133',
    vehicle: 'CCC2C22',
    date: '2026-02-18',
    lessee: 'FABRICIO DO VALE NEPOMUCENO',
    amount: 350.00,
    reference: 'Semanal',
    payment_method: 'Boleto',
    period_from: '2026-02-11',
    period_to: '2026-02-17',
    observations: '',
    created_at: '2026-02-18T10:00:00Z',
  },
  {
    id: '132',
    vehicle: 'BBB1B11',
    date: '2026-02-16',
    lessee: 'DOUGLAS DOS SANTOS SIMÕES',
    amount: 630.00,
    reference: 'Quinzenal',
    payment_method: 'Boleto',
    period_from: '2026-02-01',
    period_to: '2026-02-15',
    observations: '',
    created_at: '2026-02-16T10:00:00Z',
  },
  {
    id: '131',
    vehicle: 'DDD3D33',
    date: '2026-02-11',
    lessee: 'FLAVIO SILVA COUTINHO',
    amount: 173.00,
    reference: 'Proporcional',
    payment_method: 'PIX',
    period_from: '2026-02-06',
    period_to: '2026-02-10',
    observations: 'Proporcional com desconto integral de troca do farol R$ 27,00',
    created_at: '2026-02-11T10:00:00Z',
  },
  {
    id: '130',
    vehicle: 'CCC2C22',
    date: '2026-02-11',
    lessee: 'FABRICIO DO VALE NEPOMUCENO',
    amount: 350.00,
    reference: 'Semanal',
    payment_method: 'Boleto',
    period_from: '2026-02-04',
    period_to: '2026-02-10',
    observations: '',
    created_at: '2026-02-11T10:00:00Z',
  },
  {
    id: '129',
    vehicle: 'DDD3D33',
    date: '2026-02-06',
    lessee: 'FLAVIO SILVA COUTINHO',
    amount: 500.00,
    reference: 'Caução',
    payment_method: 'PIX',
    observations: '',
    created_at: '2026-02-06T10:00:00Z',
  },
  {
    id: '128',
    vehicle: 'CCC2C22',
    date: '2026-02-04',
    lessee: 'FABRICIO DO VALE NEPOMUCENO',
    amount: 350.00,
    reference: 'Semanal',
    payment_method: 'Boleto',
    period_from: '2026-01-28',
    period_to: '2026-02-03',
    observations: '',
    created_at: '2026-02-04T10:00:00Z',
  },
  {
    id: '127',
    vehicle: 'AAA0A00',
    date: '2026-02-04',
    lessee: 'THIAGO ALVES CARLOS',
    amount: 350.00,
    reference: 'Semanal',
    payment_method: 'Boleto',
    period_from: '2026-01-28',
    period_to: '2026-02-03',
    observations: '',
    created_at: '2026-02-04T10:00:00Z',
  },
  {
    id: '126',
    vehicle: 'BBB1B11',
    date: '2026-01-31',
    lessee: 'DOUGLAS DOS SANTOS SIMÕES',
    amount: 630.00,
    reference: 'Quinzenal',
    payment_method: 'Boleto',
    period_from: '2026-01-16',
    period_to: '2026-01-31',
    observations: '',
    created_at: '2026-01-31T10:00:00Z',
  },
  {
    id: '23',
    vehicle: 'AAA0A00',
    date: '2025-05-07',
    lessee: 'MARCOS FELIPE NEVES LOUREIRO',
    amount: 100.00,
    reference: 'Pagamento de Multa',
    payment_method: 'PIX',
    observations: 'Parcela 2 de 3 — multa de trânsito pendente',
    created_at: '2025-05-07T10:00:00Z',
  },
  {
    id: '19',
    vehicle: 'AAA0A00',
    date: '2025-05-04',
    lessee: 'MARCOS FELIPE NEVES LOUREIRO',
    amount: 100.00,
    reference: 'Pagamento de Multa',
    payment_method: 'PIX',
    observations: 'Parcela 1 de 3 — multa de trânsito',
    created_at: '2025-05-04T10:00:00Z',
  },
]

/**
 * @constant referenceOptions
 * @description Categorias de referência para classificar a origem da entrada financeira.
 */
const referenceOptions = [
  { value: '', label: 'Selecione a referência' },
  { value: 'Semanal', label: 'Semanal' },
  { value: 'Quinzenal', label: 'Quinzenal' },
  { value: 'Mensal', label: 'Mensal' },
  { value: 'Proporcional', label: 'Proporcional' },
  { value: 'Caução', label: 'Caução' },
  { value: 'Pagamento de Multa', label: 'Pagamento de Multa' },
  { value: 'Pagamento de Manutenção', label: 'Pagamento de Manutenção' },
  { value: 'Outros', label: 'Outros' },
]

/**
 * @constant paymentMethodOptions
 * @description Formas de pagamento aceitas e registradas pelo sistema.
 */
const paymentMethodOptions = [
  { value: '', label: 'Selecione o método' },
  { value: 'PIX', label: 'PIX' },
  { value: 'Boleto', label: 'Boleto' },
  { value: 'Cartão de crédito', label: 'Cartão de crédito' },
  { value: 'Cartão de débito', label: 'Cartão de débito' },
  { value: 'Dinheiro', label: 'Dinheiro' },
]

/**
 * @constant vehicleOptions
 * @description Lista de placas de veículos para vinculação da entrada (frota atual).
 */
const vehicleOptions = [
  { value: '', label: 'Selecione o veículo' },
  { value: 'BBB1B11', label: 'BBB1B11' },
  { value: 'AAA0A00', label: 'AAA0A00' },
  { value: 'CCC2C22', label: 'CCC2C22' },
  { value: 'DDD3D33', label: 'DDD3D33' },
  { value: 'RJA5J86', label: 'RJA5J86' },
]

/**
 * @constant referenceBadge
 * @description Mapeamento de estilos visuais (cores) para cada tipo de referência de entrada.
 */
const referenceBadge: Record<string, 'success' | 'info' | 'warning' | 'muted' | 'brand' | 'danger' | 'orange'> = {
  Semanal: 'success',
  Quinzenal: 'brand',
  Proporcional: 'success',
  Mensal: 'info',
  Caução: 'warning',
  'Pagamento de Multa': 'danger',
  'Pagamento de Manutenção': 'orange',
  Outros: 'muted',
}

/**
 * @constant defaultForm
 * @description Estrutura de dados inicial para o formulário de cadastro de nova entrada.
 */
const defaultForm = {
  vehicle: '',
  date: new Date().toISOString().split('T')[0],
  lessee: '',
  amount: '',
  reference: '',
  payment_method: '',
  period_from: '',
  period_to: '',
  observations: '',
}

/** @constant PAGE_SIZE - Número de registros exibidos por página na tabela. */
const PAGE_SIZE = 10

/**
 * @component IncomesPage
 * @description Componente funcional que renderiza a interface de Entradas Financeiras.
 * Gerencia a lógica de filtragem, paginação, e as operações de CRUD (localmente neste estágio).
 */
export default function IncomesPage() {
  /** @state incomes - Lista total de entradas carregadas no estado local. */
  const [incomes, setIncomes] = useState<Income[]>(mockIncomes)
  /** @state modalOpen - Controla a abertura do modal de cadastro/edição. */
  const [modalOpen, setModalOpen] = useState(false)
  /** @state editing - Objeto da entrada que está sendo alterada (null se for nova). */
  const [editing, setEditing] = useState<Income | null>(null)
  /** @state deleting - Objeto da entrada marcada para exclusão definitiva. */
  const [deleting, setDeleting] = useState<Income | null>(null)
  /** @state form - Estado que armazena os valores dos inputs do formulário. */
  const [form, setForm] = useState(defaultForm)
  /** @state search - Termo de pesquisa para busca na lista. */
  const [search, setSearch] = useState('')
  /** @state referenceFilter - Filtro ativo por categoria de referência (ex: Semanal). */
  const [referenceFilter, setReferenceFilter] = useState('all')
  /** @state page - Índice da página atual na paginação da tabela. */
  const [page, setPage] = useState(0)

  /** VARIÁVEIS DE CALENDÁRIO PARA MÉTRICAS COMPARATIVAS */
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

  /** @variable currentMonthIncomes - Filtragem de registros ocorridos no mês vigente. */
  const currentMonthIncomes = incomes.filter((e) => {
    const d = new Date(e.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  /** @variable previousMonthIncomes - Filtragem de registros ocorridos no mês imediatamente anterior. */
  const previousMonthIncomes = incomes.filter((e) => {
    const d = new Date(e.date)
    return d.getMonth() === previousMonth && d.getFullYear() === previousYear
  })

  /** @variable currentMonthTotal - Soma financeira das entradas do mês atual. */
  const currentMonthTotal = currentMonthIncomes.reduce((sum, e) => sum + e.amount, 0)
  /** @variable previousMonthTotal - Soma financeira das entradas do mês anterior. */
  const previousMonthTotal = previousMonthIncomes.reduce((sum, e) => sum + e.amount, 0)
  /** @variable monthlyVariation - Cálculo percentual de crescimento ou queda vs mês anterior. */
  const monthlyVariation = previousMonthTotal > 0
    ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
    : null

  /** @variable totalOverall - Soma total de todas as entradas registradas no sistema. */
  const totalOverall = incomes.reduce((sum, e) => sum + e.amount, 0)
  /** @variable averageTicket - Média ponderada por registro de entrada. */
  const averageTicket = incomes.length > 0 ? totalOverall / incomes.length : 0

  /**
   * @function getBreakdownByReference
   * @description Agrupa e soma os valores das entradas por categoria de referência.
   * @param list - Lista de entradas a serem analisadas.
   * @returns Array de tuplas [referência, { amount, count }] ordenado por valor decrescente.
   */
  function getBreakdownByReference(list: Income[]) {
    const map: Record<string, { amount: number; count: number }> = {}
    list.forEach((e) => {
      if (!map[e.reference]) map[e.reference] = { amount: 0, count: 0 }
      map[e.reference].amount += e.amount
      map[e.reference].count += 1
    })
    return Object.entries(map).sort((a, b) => b[1].amount - a[1].amount)
  }

  /**
   * @function getBreakdownByMethod
   * @description Agrupa e soma os valores das entradas por método de pagamento.
   * @param list - Lista de entradas a serem analisadas.
   */
  function getBreakdownByMethod(list: Income[]) {
    const map: Record<string, { amount: number; count: number }> = {}
    list.forEach((e) => {
      const method = e.payment_method || 'Não informado'
      if (!map[method]) map[method] = { amount: 0, count: 0 }
      map[method].amount += e.amount
      map[method].count += 1
    })
    return Object.entries(map).sort((a, b) => b[1].amount - a[1].amount)
  }

  /** ANÁLISE DE RENTABILIDADE POR VEÍCULO NO MÊS */
  const motorcycleProfitability: Record<string, number> = {}
  currentMonthIncomes.forEach((e) => {
    motorcycleProfitability[e.vehicle] = (motorcycleProfitability[e.vehicle] ?? 0) + e.amount
  })
  /** @variable topMotorcycle - Placa e valor da moto que mais gerou receita no mês. */
  const topMotorcycle = Object.entries(motorcycleProfitability).sort((a, b) => b[1] - a[1])[0]

  /** OPÇÕES DE FILTRO RÁPIDO NA INTERFACE */
  const referenceTabs = [
    { label: 'Todas', value: 'all' },
    { label: 'Semanal', value: 'Semanal' },
    { label: 'Quinzenal', value: 'Quinzenal' },
    { label: 'Proporcional', value: 'Proporcional' },
    { label: 'Caução', value: 'Caução' },
    { label: 'Multa', value: 'Pagamento de Multa' },
    { label: 'Outros', value: 'others' },
  ]

  /**
   * @variable filteredIncomes
   * @description Aplica os filtros de busca (textual) e referência (aba selecionada) sobre a lista total.
   */
  const filteredIncomes = incomes.filter((e) => {
    const q = search.toLowerCase()
    const matchesSearch =
      e.lessee.toLowerCase().includes(q) ||
      e.vehicle.toLowerCase().includes(q) ||
      e.reference.toLowerCase().includes(q) ||
      (e.observations?.toLowerCase().includes(q) ?? false)
    
    const matchesRef =
      referenceFilter === 'all' ? true :
      referenceFilter === 'others' ? !['Semanal', 'Quinzenal', 'Proporcional', 'Caução', 'Pagamento de Multa'].includes(e.reference) :
      e.reference === referenceFilter
    
    return matchesSearch && matchesRef
  })

  /** PAGINAÇÃO LÓGICA */
  const totalItems = filteredIncomes.length
  /** @variable pageIncomes - Segmento da lista filtrada que será exibido na página atual. */
  const pageIncomes = filteredIncomes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  /** MANIPULADORES DE EVENTOS */

  function handleSearch(value: string) {
    setSearch(value)
    setPage(0) // Reseta para a primeira página ao buscar
  }

  function handleReferenceFilter(value: string) {
    setReferenceFilter(value)
    setPage(0) // Reseta para a primeira página ao filtrar
  }

  function openNew() {
    setEditing(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  function openEdit(income: Income) {
    setEditing(income)
    setForm({
      vehicle: income.vehicle,
      date: income.date,
      lessee: income.lessee,
      amount: String(income.amount),
      reference: income.reference,
      payment_method: income.payment_method,
      period_from: income.period_from ?? '',
      period_to: income.period_to ?? '',
      observations: income.observations ?? '',
    })
    setModalOpen(true)
  }

  /**
   * @function handleSubmit
   * @description Processa a gravação de dados, suportando tanto novos registros quanto edições.
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editing) {
      setIncomes((prev) =>
        prev.map((en) =>
          en.id === editing.id
            ? {
                ...en,
                vehicle: form.vehicle,
                date: form.date,
                lessee: form.lessee,
                amount: parseFloat(form.amount),
                reference: form.reference,
                payment_method: form.payment_method,
                period_from: form.period_from || undefined,
                period_to: form.period_to || undefined,
                observations: form.observations || undefined,
              }
            : en
        )
      )
    } else {
      const newEntry: Income = {
        id: String(Date.now()),
        vehicle: form.vehicle,
        date: form.date,
        lessee: form.lessee,
        amount: parseFloat(form.amount),
        reference: form.reference,
        payment_method: form.payment_method,
        period_from: form.period_from || undefined,
        period_to: form.period_to || undefined,
        observations: form.observations || undefined,
        created_at: new Date().toISOString(),
      }
      setIncomes((prev) => [newEntry, ...prev])
    }
    setForm(defaultForm)
    setEditing(null)
    setModalOpen(false)
  }

  /**
   * @function handleDelete
   * @description Confirma a remoção definitiva de um registro do estado.
   */
  function handleDelete() {
    if (!deleting) return
    setIncomes((prev) => prev.filter((en) => en.id !== deleting.id))
    setDeleting(null)
  }

  /** DEFINIÇÃO DAS COLUNAS DA TABELA */
  const columns = [
    {
      key: 'id',
      header: '#',
      render: (row: Income) => (
        <span className="text-[#A0A0A0] text-xs">{row.id}</span>
      ),
    },
    {
      key: 'vehicle',
      header: 'Veículo',
      render: (row: Income) => (
        <span className="font-mono text-sm font-semibold text-white bg-[#2a2a2a] px-2 py-0.5 rounded">
          {row.vehicle}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Data',
      render: (row: Income) => (
        <div>
          <p className="text-white text-sm">{formatDate(row.date)}</p>
          {row.period_from && row.period_to && (
            <p className="text-xs text-[#A0A0A0] mt-0.5">
              {formatDate(row.period_from)} a {formatDate(row.period_to)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'lessee',
      header: 'Locatário',
      render: (row: Income) => (
        <p className="text-white text-sm max-w-[180px] truncate" title={row.lessee}>
          {row.lessee}
        </p>
      ),
    },
    {
      key: 'reference',
      header: 'Referência',
      render: (row: Income) => (
        <Badge variant={referenceBadge[row.reference] ?? 'muted'}>{row.reference}</Badge>
      ),
    },
    {
      key: 'payment_method',
      header: 'Método',
      render: (row: Income) => (
        <span className="text-sm text-[#A0A0A0]">{row.payment_method || '—'}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (row: Income) => (
        <span className="font-semibold text-[#BAFF1A]">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      key: 'observations',
      header: 'Observação',
      render: (row: Income) => (
        <p className="text-xs text-[#A0A0A0] max-w-[220px] truncate" title={row.observations}>
          {row.observations || '—'}
        </p>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: Income) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleting(row)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col min-h-full">
      {/* Cabeçalho da página com integração de botões de ação global */}
      <Header
        title="Entradas"
        subtitle="Registro de recebimentos"
        actions={
          <Button onClick={openNew}>
            <Plus className="w-4 h-4" />
            Nova Entrada
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Painel de Estatísticas Superiores (Cards Informativos) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Card 1: Resumo Financeiro Histórico */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Total Geral</p>
              <p className="text-2xl font-bold text-[#BAFF1A] mt-1">{formatCurrency(totalOverall)}</p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-xs text-[#A0A0A0]">{incomes.length} registros · ticket médio {formatCurrency(averageTicket)}</p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Por referência (Geral)</p>
              {getBreakdownByReference(incomes).map(([ref, { amount, count }]) => (
                <div key={ref} className="flex items-center justify-between">
                  <span className="text-xs text-[#A0A0A0]">{ref}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#A0A0A0]">{count}x</span>
                    <span className="text-xs font-medium text-white">{formatCurrency(amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Card 2: Performance Financeira Mensal e Variação */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Total do Mês</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(currentMonthTotal)}</p>
              <div className="flex items-center gap-2 mt-1">
                {monthlyVariation !== null ? (
                  <span className={`text-xs font-medium ${monthlyVariation >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {monthlyVariation >= 0 ? '▲' : '▼'} {Math.abs(monthlyVariation).toFixed(1)}% vs mês anterior
                  </span>
                ) : (
                  <span className="text-xs text-[#A0A0A0]">{currentMonthIncomes.length} registros</span>
                )}
              </div>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Por referência (Mês)</p>
              {getBreakdownByReference(currentMonthIncomes).length === 0
                ? <p className="text-xs text-[#A0A0A0]">Sem entradas este mês</p>
                : getBreakdownByReference(currentMonthIncomes).map(([ref, { amount, count }]) => (
                  <div key={ref} className="flex items-center justify-between">
                    <span className="text-xs text-[#A0A0A0]">{ref}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#A0A0A0]">{count}x</span>
                      <span className="text-xs font-medium text-white">{formatCurrency(amount)}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </Card>

          {/* Card 3: Análise de Operações (Métodos e Veículos) */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Volume de Operações</p>
              <p className="text-2xl font-bold text-white mt-1">{incomes.length}</p>
              <p className="text-xs text-[#A0A0A0] mt-1">{currentMonthIncomes.length} lançamentos em {today.toLocaleString('pt-BR', { month: 'long' })}</p>
            </div>
            <div className="p-4 space-y-2 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Métodos de pagamento (mês)</p>
              {getBreakdownByMethod(currentMonthIncomes).length === 0
                ? <p className="text-xs text-[#A0A0A0]">Sem entradas este mês</p>
                : getBreakdownByMethod(currentMonthIncomes).map(([method, { amount, count }]) => (
                  <div key={method} className="flex items-center justify-between">
                    <span className="text-xs text-[#A0A0A0]">{method}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#A0A0A0]">{count}x</span>
                      <span className="text-xs font-medium text-white">{formatCurrency(amount)}</span>
                    </div>
                  </div>
                ))
              }
            </div>
            <div className="p-4">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Moto mais rentável (mês)</p>
              {topMotorcycle ? (
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-white bg-[#2a2a2a] px-2 py-0.5 rounded">{topMotorcycle[0]}</span>
                  <span className="text-sm font-semibold text-[#BAFF1A]">{formatCurrency(topMotorcycle[1])}</span>
                </div>
              ) : (
                <p className="text-xs text-[#A0A0A0]">Sem dados suficientes</p>
              )}
            </div>
          </Card>

        </div>

        {/* Barra de Filtros e Ferramentas de Pesquisa */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {referenceTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleReferenceFilter(tab.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  referenceFilter === tab.value
                    ? 'bg-[#BAFF1A] text-[#121212]'
                    : 'bg-[#202020] border border-[#333333] text-[#A0A0A0] hover:text-white hover:border-[#555555]'
                }`}
              >
                {tab.label}
                {tab.value !== 'all' && (
                  <span className="ml-1.5 opacity-70">
                    ({tab.value === 'others'
                      ? incomes.filter((e) => !['Semanal', 'Quinzenal', 'Proporcional', 'Caução', 'Pagamento de Multa'].includes(e.reference)).length
                      : incomes.filter((e) => e.reference === tab.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <input
              type="text"
              placeholder="Buscar por locatário, veículo ou referência..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-lg bg-[#202020] border border-[#333333] text-sm text-white placeholder-[#A0A0A0] focus:outline-none focus:border-[#555555] w-72"
            />
          </div>
        </div>

        {/* Listagem Principal com Tabela e Controles de Paginação */}
        <Card padding="none">
          <Table
            columns={columns}
            data={pageIncomes}
            keyExtractor={(row) => row.id}
            emptyMessage="Nenhuma entrada encontrada"
          />
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={totalItems}
            onPageChange={setPage}
          />
        </Card>
      </div>

      {/* Modal de Confirmação para Exclusão de Registro */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Confirmar Exclusão" size="sm">
        <div className="space-y-4">
          <div className="p-4 bg-red-500/8 border border-red-500/20 rounded-lg">
            <p className="text-sm text-white font-medium">Tem certeza que deseja excluir esta entrada?</p>
            <p className="text-xs text-[#A0A0A0] mt-2">Esta ação é irreversível e afetará os relatórios financeiros.</p>
          </div>
          {deleting && (
            <div className="p-3 bg-[#2a2a2a] rounded-lg space-y-1">
              <p className="text-xs text-[#A0A0A0]">Entrada a ser excluída:</p>
              <p className="text-sm text-white font-medium">{deleting.lessee}</p>
              <p className="text-xs text-[#A0A0A0]">{deleting.vehicle} · {formatCurrency(deleting.amount)} · {formatDate(deleting.date)}</p>
            </div>
          )}
          <div className="flex gap-3 justify-end pt-1">
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
              Sim, excluir
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Formulário de Inserção e Edição de Entradas */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'Editar Entrada' : 'Nova Entrada'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Veículo (Placa)"
              options={vehicleOptions}
              value={form.vehicle}
              onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
              required
            />
            <Input
              label="Data do Pagamento"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <Input
            label="Locatário (Nome completo)"
            placeholder="NOME DO LOCATÁRIO"
            value={form.lessee}
            onChange={(e) => setForm({ ...form, lessee: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Referência"
              options={referenceOptions}
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              required
            />
            <Input
              label="Valor Recebido (R$)"
              type="number"
              step="0.01"
              placeholder="350.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>

          <Select
            label="Método de Pagamento"
            options={paymentMethodOptions}
            value={form.payment_method}
            onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Período — De (opcional)"
              type="date"
              value={form.period_from}
              onChange={(e) => setForm({ ...form, period_from: e.target.value })}
              hint="Início da vigência do pagamento"
            />
            <Input
              label="Período — Até (opcional)"
              type="date"
              value={form.period_to}
              onChange={(e) => setForm({ ...form, period_to: e.target.value })}
              hint="Fim da vigência do pagamento"
            />
          </div>

          <Textarea
            label="Observação"
            placeholder="Detalhes adicionais sobre o recebimento..."
            rows={3}
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => { setModalOpen(false); setEditing(null) }}>
              Cancelar
            </Button>
            <Button type="submit">
              <TrendingUp className="w-4 h-4" />
              {editing ? 'Salvar Alterações' : 'Registrar Entrada'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
