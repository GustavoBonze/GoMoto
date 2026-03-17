/**
 * @file page.tsx
 * @description Página de Gestão de Despesas e Custos Operacionais do Sistema GoMoto.
 * 
 * Este componente é vital para o controle financeiro, permitindo o registro minucioso
 * de todas as saídas de capital. Ele diferencia gastos estruturais (como compra de motos e marketing)
 * de gastos operacionais (como manutenção e seguros).
 * 
 * Funcionalidades principais:
 * - Lançamento de despesas vinculadas a veículos específicos ou gastos gerais.
 * - Classificação por pagador: permite identificar se o custo foi absorvido pela empresa,
 *   pelos sócios ou se será descontado do locatário (Desconto na Semanal).
 * - Monitoramento de quilometragem (KM) no momento da despesa para histórico técnico.
 * - Dashboard de métricas: Total Acumulado, Variação Mensal e Ticket Médio de Gasto.
 * - Análise de rentabilidade negativa: identificação do veículo que mais gerou custos no mês.
 * - Filtragem por pagador e busca textual abrangente.
 * 
 * Identificadores seguem o padrão Inglês e a documentação o padrão Português Brasil.
 */

'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, TrendingDown, Search } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Expense } from '@/types'

/**
 * @interface LocalExpense
 * @description Extensão local da interface Expense para suportar campos específicos
 * da UI de gestão de despesas (como payer e odometer) que podem não estar na entidade base.
 */
interface LocalExpense extends Omit<Expense, 'category' | 'motorcycle_id' | 'description'> {
  vehicle: string           // Placa ou "Geral"
  category: string          // Tipo da despesa
  payer: string             // Quem efetuou o pagamento
  odometer?: number         // KM no momento do registro
}

/**
 * @constant mockExpenses
 * @description Dados de teste para popular a tabela de despesas.
 * Inclui desde compras de ativos (motos) até manutenções preventivas e seguros.
 */
const mockExpenses: LocalExpense[] = [
  { id: '146', vehicle: 'DDD3D33', date: '2026-03-09', category: 'Preventiva', amount: 12.50, payer: 'Caixa da Empresa', odometer: 29282, observations: 'Troca de óleo, valor da nota 25,00', created_at: '2026-03-09T10:00:00Z' },
  { id: '145', vehicle: 'DDD3D33', date: '2026-02-27', category: 'Preventiva', amount: 45.75, payer: 'Caixa da Empresa', odometer: 27058, observations: 'Kit relação. Valor da nota 91,50', created_at: '2026-02-27T10:00:00Z' },
  { id: '144', vehicle: 'AAA0A00', date: '2026-02-27', category: 'Corretiva', amount: 100.00, payer: 'Caixa da Empresa', observations: 'Pneu dianteiro + mão de obra mecânico', created_at: '2026-02-27T10:00:00Z' },
  { id: '143', vehicle: 'AAA0A00', date: '2026-02-25', category: 'Corretiva', amount: 115.00, payer: 'Caixa da Empresa', observations: '65,00 guidão novo + 50,00 mão de obra mecânico', created_at: '2026-02-25T10:00:00Z' },
  { id: '142', vehicle: 'DDD3D33', date: '2026-02-24', category: 'Troca de óleo', amount: 14.45, payer: 'Caixa da Empresa', odometer: 27058, observations: 'Valor da nota 28,90', created_at: '2026-02-24T10:00:00Z' },
  { id: '141', vehicle: 'DDD3D33', date: '2026-02-20', category: 'Seguro', amount: 169.90, payer: 'Caixa da Empresa', created_at: '2026-02-20T10:00:00Z' },
  { id: '140', vehicle: 'CCC2C22', date: '2026-02-20', category: 'Seguro', amount: 171.28, payer: 'Caixa da Empresa', created_at: '2026-02-20T10:00:00Z' },
  { id: '139', vehicle: 'BBB1B11', date: '2026-02-20', category: 'Seguro', amount: 171.00, payer: 'Caixa da Empresa', created_at: '2026-02-20T10:00:00Z' },
  { id: '138', vehicle: 'AAA0A00', date: '2026-02-20', category: 'Seguro', amount: 191.28, payer: 'Caixa da Empresa', created_at: '2026-02-20T10:00:00Z' },
  { id: '137', vehicle: 'DDD3D33', date: '2026-02-13', category: 'Corretiva', amount: 20.00, payer: 'Caixa da Empresa', observations: 'Troca da lona de freio', created_at: '2026-02-13T10:00:00Z' },
  { id: '136', vehicle: 'DDD3D33', date: '2026-02-11', category: 'Corretiva', amount: 27.00, payer: 'Caixa da Empresa', observations: 'Lâmpada farol', created_at: '2026-02-11T10:00:00Z' },
  { id: '135', vehicle: 'AAA0A00', date: '2026-02-09', category: 'Corretiva', amount: 250.00, payer: 'Caixa da Empresa', observations: 'Roda traseira da Start 160', created_at: '2026-02-09T10:00:00Z' },
  { id: '131', vehicle: 'DDD3D33', date: '2026-01-21', category: 'Seguro', amount: 169.90, payer: 'Caixa da Empresa', created_at: '2026-01-21T10:00:00Z' },
  { id: '130', vehicle: 'CCC2C22', date: '2026-01-21', category: 'Seguro', amount: 171.28, payer: 'Caixa da Empresa', created_at: '2026-01-21T10:00:00Z' },
  { id: '129', vehicle: 'BBB1B11', date: '2026-01-21', category: 'Seguro', amount: 171.00, payer: 'Caixa da Empresa', created_at: '2026-01-21T10:00:00Z' },
  { id: '128', vehicle: 'AAA0A00', date: '2026-01-21', category: 'Seguro', amount: 191.28, payer: 'Caixa da Empresa', created_at: '2026-01-21T10:00:00Z' },
  { id: '126', vehicle: 'AAA0A00', date: '2026-01-15', category: 'Troca de óleo', amount: 17.00, payer: 'Caixa da Empresa', odometer: 46578, observations: 'Valor da nota 34,00', created_at: '2026-01-15T10:00:00Z' },
  { id: '125', vehicle: 'AAA0A00', date: '2026-01-02', category: 'Troca de óleo', amount: 17.00, payer: 'Caixa da Empresa', odometer: 45525, observations: 'Valor da nota 34,00', created_at: '2026-01-02T10:00:00Z' },
  { id: '124', vehicle: 'CCC2C22', date: '2026-01-06', category: 'Troca de óleo', amount: 15.00, payer: 'Caixa da Empresa', odometer: 67908, observations: 'Valor da nota 30,00', created_at: '2026-01-06T10:00:00Z' },
  { id: '103', vehicle: 'AAA0A00', date: '2025-10-31', category: 'Troca de óleo', amount: 17.00, payer: 'Desconto na Semanal', odometer: 35572, observations: 'Valor da nota 34,00', created_at: '2025-10-31T10:00:00Z' },
  { id: '86', vehicle: 'CCC2C22', date: '2025-09-10', category: 'Troca de óleo', amount: 15.00, payer: 'Desconto na Semanal', odometer: 42503, observations: 'Troca de óleo 30,00', created_at: '2025-09-10T10:00:00Z' },
  { id: '73', vehicle: 'AAA0A00', date: '2025-08-20', category: 'Pneu', amount: 124.50, payer: 'Desconto na Semanal', odometer: 27999, observations: 'Pneu novo', created_at: '2025-08-20T10:00:00Z' },
  { id: '57', vehicle: 'AAA0A00', date: '2025-08-10', category: 'Relação da moto', amount: 79.00, payer: 'Desconto na Semanal', odometer: 23242, observations: 'Relação R$ 65 (50%) - Parafuso R$ 14 (50%)', created_at: '2025-08-10T10:00:00Z' },
  { id: '43', vehicle: 'AAA0A00', date: '2025-07-15', category: 'Bateria', amount: 158.00, payer: 'Desconto na Semanal', odometer: 16879, observations: 'Bateria R$145 - Mão de obra R$10 - Parafuso R$3', created_at: '2025-07-15T10:00:00Z' },
  { id: '5', vehicle: 'AAA0A00', date: '2025-01-23', category: 'IPVA', amount: 270.40, payer: 'Jamerson', created_at: '2025-01-23T10:00:00Z' },
  { id: '2', vehicle: 'BBB1B11', date: '2025-01-16', category: 'Compra da moto', amount: 10000.00, payer: 'Gustavo', observations: 'Adquirido do Sr. Juarez Ribeiro', created_at: '2025-01-16T10:00:00Z' },
  { id: '1', vehicle: 'AAA0A00', date: '2025-01-10', category: 'Compra da moto', amount: 13000.00, payer: 'Jamerson', observations: 'Adquirido do Bruno', created_at: '2025-01-10T10:00:00Z' },
]

/** @constant expenseCategoryOptions - Lista de categorias para classificação dos gastos. */
const expenseCategoryOptions = [
  { value: '', label: 'Selecione o tipo de despesa' },
  { value: 'Compra da moto', label: 'Compra da moto' },
  { value: 'Seguro', label: 'Seguro' },
  { value: 'IPVA', label: 'IPVA' },
  { value: 'GRT', label: 'GRT' },
  { value: 'DUDA transf.', label: 'DUDA transf.' },
  { value: 'Taxa vistoria seguro', label: 'Taxa vistoria seguro' },
  { value: 'Chave reserva', label: 'Chave reserva' },
  { value: 'Combustível', label: 'Combustível' },
  { value: 'Resgate', label: 'Resgate' },
  { value: 'Tráfego/Marketing', label: 'Tráfego/Marketing' },
  { value: 'Outros', label: 'Outros' },
]

/** @constant payerOptions - Identifica a origem do recurso financeiro utilizado. */
const payerOptions = [
  { value: '', label: 'Selecione o pagador' },
  { value: 'Caixa da Empresa', label: 'Caixa da Empresa' },
  { value: 'Desconto na Semanal', label: 'Desconto na Semanal' },
  { value: 'Gustavo', label: 'Gustavo' },
  { value: 'Jamerson', label: 'Jamerson' },
]

/** @constant vehicleOptions - Associa a despesa a uma moto específica da frota. */
const vehicleOptions = [
  { value: '', label: 'Selecione o veículo' },
  { value: 'BBB1B11', label: 'BBB1B11' },
  { value: 'AAA0A00', label: 'AAA0A00' },
  { value: 'CCC2C22', label: 'CCC2C22' },
  { value: 'DDD3D33', label: 'DDD3D33' },
  { value: 'Geral', label: 'Geral (sem moto específica)' },
]

/** @constant categoryBadge - Mapeamento de cores para os crachás de categoria. */
const categoryBadge: Record<string, 'success' | 'info' | 'warning' | 'muted' | 'brand' | 'danger' | 'orange'> = {
  Preventiva: 'info',
  Corretiva: 'warning',
  'Troca de óleo': 'muted',
  Seguro: 'brand',
  IPVA: 'orange',
  GRT: 'orange',
  'Compra da moto': 'success',
  'Relação da moto': 'warning',
  Pneu: 'warning',
  Bateria: 'warning',
  Combustível: 'muted',
  Resgate: 'danger',
  'Tráfego/Marketing': 'info',
  Outros: 'muted',
}

/** @constant payerBadge - Mapeamento de cores para os crachás de pagador. */
const payerBadge: Record<string, 'success' | 'info' | 'warning' | 'muted' | 'brand' | 'danger' | 'orange'> = {
  'Caixa da Empresa': 'success',
  'Desconto na Semanal': 'orange',
  Gustavo: 'brand',
  Jamerson: 'info',
}

/** @constant defaultForm - Estado inicial para reset do formulário de despesa. */
const defaultForm = {
  vehicle: '',
  date: new Date().toISOString().split('T')[0],
  category: '',
  amount: '',
  payer: '',
  odometer: '',
  observations: '',
}

/** @constant PAGE_SIZE - Quantidade de itens por página na tabela. */
const PAGE_SIZE = 10

/**
 * @component ExpensesPage
 * @description Componente principal para gestão do módulo de despesas.
 * Centraliza cálculos, filtragem e interface de usuário para o fluxo financeiro de saída.
 */
export default function ExpensesPage() {
  /** ESTADO LOCAL */
  const [expenses, setExpenses] = useState<LocalExpense[]>(mockExpenses)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<LocalExpense | null>(null)
  const [deleting, setDeleting] = useState<LocalExpense | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [search, setSearch] = useState('')
  const [payerFilter, setPayerFilter] = useState('all')
  const [page, setPage] = useState(0)

  /** CÁLCULOS DE PERÍODO */
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

  /** @variable currentMonthExpenses - Filtra gastos ocorridos no mês atual. */
  const currentMonthExpenses = expenses.filter((d) => {
    const dt = new Date(d.date)
    return dt.getMonth() === currentMonth && dt.getFullYear() === currentYear
  })

  /** @variable previousMonthExpenses - Filtra gastos ocorridos no mês passado. */
  const previousMonthExpenses = expenses.filter((d) => {
    const dt = new Date(d.date)
    return dt.getMonth() === previousMonth && dt.getFullYear() === previousYear
  })

  /** MÉTRICAS FINANCEIRAS */
  const currentMonthTotal = currentMonthExpenses.reduce((sum, d) => sum + d.amount, 0)
  const previousMonthTotal = previousMonthExpenses.reduce((sum, d) => sum + d.amount, 0)
  const monthlyVariation = previousMonthTotal > 0
    ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
    : null

  const totalOverall = expenses.reduce((sum, d) => sum + d.amount, 0)
  const averageTicket = expenses.length > 0 ? totalOverall / expenses.length : 0

  /** @variable totalWeeklyDiscount - Soma de despesas pagas com desconto na semanal do cliente. */
  const totalWeeklyDiscount = expenses
    .filter((d) => d.payer === 'Desconto na Semanal')
    .reduce((sum, d) => sum + d.amount, 0)
  
  /** @variable totalCompany - Custo líquido absorvido pela empresa (descontando o que o cliente pagou). */
  const totalCompany = totalOverall - totalWeeklyDiscount

  /**
   * @function getBreakdownByPayer
   * @description Gera resumo de gastos agrupados por quem pagou a conta.
   */
  function getBreakdownByPayer(list: LocalExpense[]) {
    const map: Record<string, { amount: number; count: number }> = {}
    list.forEach((d) => {
      if (!map[d.payer]) map[d.payer] = { amount: 0, count: 0 }
      map[d.payer].amount += d.amount
      map[d.payer].count += 1
    })
    return Object.entries(map).sort((a, b) => b[1].amount - a[1].amount)
  }

  /**
   * @function getBreakdownByCategory
   * @description Gera resumo de gastos agrupados por categoria (ex: IPVA, Peças).
   */
  function getBreakdownByCategory(list: LocalExpense[]) {
    const map: Record<string, { amount: number; count: number }> = {}
    list.forEach((d) => {
      if (!map[d.category]) map[d.category] = { amount: 0, count: 0 }
      map[d.category].amount += d.amount
      map[d.category].count += 1
    })
    return Object.entries(map).sort((a, b) => b[1].amount - a[1].amount)
  }

  /** ANÁLISE DE CUSTO POR VEÍCULO NO MÊS ATUAL */
  const costByMotorcycle: Record<string, number> = {}
  currentMonthExpenses.forEach((d) => {
    costByMotorcycle[d.vehicle] = (costByMotorcycle[d.vehicle] ?? 0) + d.amount
  })
  /** @variable mostExpensiveMotorcycle - Identifica qual moto teve o maior custo de manutenção/taxas no mês. */
  const mostExpensiveMotorcycle = Object.entries(costByMotorcycle).sort((a, b) => b[1] - a[1])[0]

  /** OPÇÕES DE ABAS PARA FILTRO POR PAGADOR */
  const payerTabs = [
    { label: 'Todos', value: 'all' },
    { label: 'Caixa', value: 'Caixa da Empresa' },
    { label: 'Desc. Semanal', value: 'Desconto na Semanal' },
    { label: 'Gustavo', value: 'Gustavo' },
    { label: 'Jamerson', value: 'Jamerson' },
  ]

  /** LÓGICA DE FILTRAGEM E BUSCA */
  const filteredExpenses = expenses.filter((d) => {
    const q = search.toLowerCase()
    const matchesSearch =
      d.vehicle.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.payer.toLowerCase().includes(q) ||
      (d.observations?.toLowerCase().includes(q) ?? false)
    const matchesPayer = payerFilter === 'all' || d.payer === payerFilter
    return matchesSearch && matchesPayer
  })

  /** PAGINAÇÃO */
  const totalItems = filteredExpenses.length
  const pageExpenses = filteredExpenses.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  /** HANDLERS DE UI */

  function handleSearch(value: string) {
    setSearch(value)
    setPage(0)
  }

  function handlePayerFilter(value: string) {
    setPayerFilter(value)
    setPage(0)
  }

  function openNew() {
    setEditing(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  function openEdit(expense: LocalExpense) {
    setEditing(expense)
    setForm({
      vehicle: expense.vehicle,
      date: expense.date,
      category: expense.category,
      amount: String(expense.amount),
      payer: expense.payer,
      odometer: expense.odometer ? String(expense.odometer) : '',
      observations: expense.observations ?? '',
    })
    setModalOpen(true)
  }

  /**
   * @function handleSubmit
   * @description Processa o formulário para salvar alterações ou criar novos registros.
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editing) {
      setExpenses((prev) =>
        prev.map((d) =>
          d.id === editing.id
            ? {
                ...d,
                vehicle: form.vehicle,
                date: form.date,
                category: form.category,
                amount: parseFloat(form.amount),
                payer: form.payer,
                odometer: form.odometer ? parseInt(form.odometer) : undefined,
                observations: form.observations || undefined,
              }
            : d
        )
      )
    } else {
      const newExpense: LocalExpense = {
        id: String(Date.now()),
        vehicle: form.vehicle,
        date: form.date,
        category: form.category,
        amount: parseFloat(form.amount),
        payer: form.payer,
        odometer: form.odometer ? parseInt(form.odometer) : undefined,
        observations: form.observations || undefined,
        created_at: new Date().toISOString(),
      }
      setExpenses((prev) => [newExpense, ...prev])
    }
    setForm(defaultForm)
    setEditing(null)
    setModalOpen(false)
  }

  function handleDelete() {
    if (!deleting) return
    setExpenses((prev) => prev.filter((d) => d.id !== deleting.id))
    setDeleting(null)
  }

  /** ESTRUTURA DA TABELA */
  const columns = [
    {
      key: 'id',
      header: '#',
      render: (row: LocalExpense) => <span className="text-[#A0A0A0] text-xs">{row.id}</span>,
    },
    {
      key: 'vehicle',
      header: 'Veículo',
      render: (row: LocalExpense) => (
        <span className="font-mono text-sm font-semibold text-white bg-[#2a2a2a] px-2 py-0.5 rounded">
          {row.vehicle}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Data / KM',
      render: (row: LocalExpense) => {
        const hasMoto = row.vehicle && row.vehicle !== 'Geral'
        const missingKm = hasMoto && !row.odometer
        return (
          <div>
            <p className="text-white text-sm">{formatDate(row.date)}</p>
            {row.odometer ? (
              <p className="text-xs text-[#A0A0A0] mt-0.5">
                {row.odometer.toLocaleString('pt-BR')} km
              </p>
            ) : missingKm ? (
              <p className="text-xs text-red-400 mt-0.5 font-medium">
                ⚠ km não informado
              </p>
            ) : null}
          </div>
        )
      },
    },
    {
      key: 'category',
      header: 'Tipo de Despesa',
      render: (row: LocalExpense) => (
        <Badge variant={categoryBadge[row.category] ?? 'muted'}>{row.category}</Badge>
      ),
    },
    {
      key: 'payer',
      header: 'Pagador',
      render: (row: LocalExpense) => (
        <Badge variant={payerBadge[row.payer] ?? 'muted'}>{row.payer}</Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (row: LocalExpense) => (
        <span className="font-semibold text-red-400">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      key: 'observations',
      header: 'Observação',
      render: (row: LocalExpense) => (
        <p className="text-xs text-[#A0A0A0] max-w-[220px] truncate" title={row.observations}>
          {row.observations || '—'}
        </p>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: LocalExpense) => (
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
      {/* Cabeçalho superior com título dinâmico */}
      <Header
        title="Despesas"
        subtitle="Registro de gastos e custos"
        actions={
          <Button onClick={openNew}>
            <Plus className="w-4 h-4" />
            Nova Despesa
          </Button>
        }
      />

      <div className="p-6 space-y-5">

        {/* Painel de Métricas e Dashboards em Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Card 1: Resumo de Gastos Totais e por Pagador */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Total Geral</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalOverall)}</p>
              <p className="text-xs text-[#A0A0A0] mt-1">{expenses.length} registros · ticket médio {formatCurrency(averageTicket)}</p>
            </div>
            <div className="p-4 space-y-2 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Por pagador (Geral)</p>
              {getBreakdownByPayer(expenses).map(([payer, { amount, count }]) => (
                <div key={payer} className="flex items-center justify-between">
                  <span className="text-xs text-[#A0A0A0]">{payer}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#A0A0A0]">{count}x</span>
                    <span className="text-xs font-medium text-white">{formatCurrency(amount)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Custo real da empresa</p>
              <p className="text-sm font-semibold text-red-400">{formatCurrency(totalCompany)}</p>
              <p className="text-xs text-[#A0A0A0] mt-0.5">
                Desconto na semanal (clientes): {formatCurrency(totalWeeklyDiscount)}
              </p>
            </div>
          </Card>

          {/* Card 2: Fluxo de Caixa Mensal e Variação vs Mês Anterior */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Total do Mês</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(currentMonthTotal)}</p>
              <div className="mt-1">
                {monthlyVariation !== null ? (
                  <span className={`text-xs font-medium ${monthlyVariation > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {monthlyVariation > 0 ? '▲' : '▼'} {Math.abs(monthlyVariation).toFixed(1)}% vs mês anterior
                  </span>
                ) : (
                  <span className="text-xs text-[#A0A0A0]">{currentMonthExpenses.length} registros</span>
                )}
              </div>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Por tipo (Mês)</p>
              {getBreakdownByCategory(currentMonthExpenses).length === 0
                ? <p className="text-xs text-[#A0A0A0]">Sem despesas este mês</p>
                : getBreakdownByCategory(currentMonthExpenses).map(([category, { amount, count }]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-xs text-[#A0A0A0]">{category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#A0A0A0]">{count}x</span>
                      <span className="text-xs font-medium text-white">{formatCurrency(amount)}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </Card>

          {/* Card 3: Eficiência Operacional e Veículo Mais Caro */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Volume de Lançamentos</p>
              <p className="text-2xl font-bold text-white mt-1">{expenses.length}</p>
              <p className="text-xs text-[#A0A0A0] mt-1">{currentMonthExpenses.length} no mês atual</p>
            </div>
            <div className="p-4 space-y-2 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Por pagador (Mês)</p>
              {getBreakdownByPayer(currentMonthExpenses).length === 0
                ? <p className="text-xs text-[#A0A0A0]">Sem despesas este mês</p>
                : getBreakdownByPayer(currentMonthExpenses).map(([payer, { amount, count }]) => (
                  <div key={payer} className="flex items-center justify-between">
                    <span className="text-xs text-[#A0A0A0]">{payer}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#A0A0A0]">{count}x</span>
                      <span className="text-xs font-medium text-white">{formatCurrency(amount)}</span>
                    </div>
                  </div>
                ))
              }
            </div>
            <div className="p-4">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Moto mais cara (Mês)</p>
              {mostExpensiveMotorcycle ? (
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-white bg-[#2a2a2a] px-2 py-0.5 rounded">{mostExpensiveMotorcycle[0]}</span>
                  <span className="text-sm font-semibold text-red-400">{formatCurrency(mostExpensiveMotorcycle[1])}</span>
                </div>
              ) : (
                <p className="text-xs text-[#A0A0A0]">Dados insuficientes</p>
              )}
            </div>
          </Card>

        </div>

        {/* Controles de Filtros e Pesquisa Global */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {payerTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handlePayerFilter(tab.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  payerFilter === tab.value
                    ? 'bg-[#BAFF1A] text-[#121212]'
                    : 'bg-[#202020] border border-[#333333] text-[#A0A0A0] hover:text-white hover:border-[#555555]'
                }`}
              >
                {tab.label}
                {tab.value !== 'all' && (
                  <span className="ml-1.5 opacity-70">
                    ({expenses.filter((d) => d.payer === tab.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <input
              type="text"
              placeholder="Buscar por veículo, tipo, pagador ou observação..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-lg bg-[#202020] border border-[#333333] text-sm text-white placeholder-[#A0A0A0] focus:outline-none focus:border-[#555555] w-72"
            />
          </div>
        </div>

        {/* Tabela de Listagem de Despesas com Paginação Local */}
        <Card padding="none">
          <Table
            columns={columns}
            data={pageExpenses}
            keyExtractor={(row) => row.id}
            emptyMessage="Nenhuma despesa encontrada"
          />
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={totalItems}
            onPageChange={setPage}
          />
        </Card>
      </div>

      {/* Modal de Confirmação para Exclusão Logística de Registros */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Confirmar Exclusão" size="sm">
        <div className="space-y-4">
          <div className="p-4 bg-red-500/8 border border-red-500/20 rounded-lg">
            <p className="text-sm text-white font-medium">Tem certeza que deseja excluir esta despesa?</p>
            <p className="text-xs text-[#A0A0A0] mt-2">Esta operação removerá o gasto dos balanços financeiros mensais.</p>
          </div>
          {deleting && (
            <div className="p-3 bg-[#2a2a2a] rounded-lg space-y-1">
              <p className="text-xs text-[#A0A0A0]">Despesa a ser excluída:</p>
              <p className="text-sm text-white font-medium">{deleting.category} — {deleting.vehicle}</p>
              <p className="text-xs text-[#A0A0A0]">{formatCurrency(deleting.amount)} · {formatDate(deleting.date)} · {deleting.payer}</p>
            </div>
          )}
          <div className="flex gap-3 justify-end pt-1">
            <Button variant="ghost" onClick={() => setDeleting(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
              Sim, excluir
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Formulário Unificado para Nova Despesa ou Edição */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'Editar Despesa' : 'Nova Despesa'}
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
              label="Data"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo"
              options={expenseCategoryOptions}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Pagador"
              options={payerOptions}
              value={form.payer}
              onChange={(e) => setForm({ ...form, payer: e.target.value })}
              required
            />
            <Input
              label="Quilometragem (opcional)"
              type="number"
              placeholder="Ex: 29.282"
              value={form.odometer}
              onChange={(e) => setForm({ ...form, odometer: e.target.value })}
              hint="KM atual para registro técnico"
            />
          </div>

          <Textarea
            label="Observação"
            placeholder="Ex: Nota fiscal, detalhes das peças, etc."
            rows={3}
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => { setModalOpen(false); setEditing(null) }}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger">
              <TrendingDown className="w-4 h-4" />
              {editing ? 'Salvar Alterações' : 'Registrar Despesa'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
