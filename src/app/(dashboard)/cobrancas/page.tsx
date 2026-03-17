/**
 * @file page.tsx
 * @description Página de Gerenciamento de Cobranças do Sistema GoMoto.
 * 
 * Este arquivo é responsável por renderizar a interface de controle financeiro de recebíveis.
 * Ele permite visualizar, criar, editar, excluir e gerenciar o status de cobranças
 * vinculadas aos contratos de locação de motocicletas.
 * 
 * Funcionalidades principais:
 * - Listagem de cobranças com filtros por status (Pendente, Pago, Vencido, Prejuízo).
 * - Busca textual por cliente, placa ou descrição.
 * - Painel de métricas financeiras (Total Recebido, A Receber, Inadimplência, etc.).
 * - Gestão de status: marcação de pagamentos e contabilização de perdas (prejuízo).
 * - Integração visual preparada para futura conexão com o gateway InfinitePay.
 * 
 * O código segue o padrão internacional com identificadores em Inglês,
 * enquanto a interface e os comentários são em Português Brasil.
 */

'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, DollarSign, Zap, Info, AlertTriangle, Search } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Charge, ChargeStatus } from '@/types'

/**
 * @interface ChargeWithRelations
 * @description Extensão da interface Charge para incluir dados relacionais
 * necessários para a exibição na tabela (nome do cliente e placa da moto).
 */
type ChargeWithRelations = Charge & {
  customer_name: string
  motorcycle_plate: string
}

/**
 * @constant mockCharges
 * @description Conjunto de dados fictícios para simular a resposta de uma API.
 * Contém o histórico de cobranças de diversos clientes com diferentes estados.
 */
const mockCharges: ChargeWithRelations[] = [
  {
    id: '141',
    contract_id: 'AAA0A00',
    customer_id: 'alexandre',
    description: 'Proporcional — 09/03 a 10/03 (AAA0A00)',
    amount: 150.00,
    due_date: '2026-03-11',
    status: 'paid',
    payment_date: '2026-03-11',
    created_at: '2026-03-11T10:00:00Z',
    updated_at: '2026-03-11T10:00:00Z',
    customer_name: 'ALEXANDRE DANTAS DAS SILVA',
    motorcycle_plate: 'AAA0A00',
  },
  {
    id: '142',
    contract_id: 'AAA0A00',
    customer_id: 'alexandre',
    description: 'Caução — Entrada do contrato (AAA0A00)',
    amount: 500.00,
    due_date: '2026-03-09',
    status: 'paid',
    payment_date: '2026-03-09',
    created_at: '2026-03-09T10:00:00Z',
    updated_at: '2026-03-09T10:00:00Z',
    customer_name: 'ALEXANDRE DANTAS DAS SILVA',
    motorcycle_plate: 'AAA0A00',
  },
  {
    id: '140',
    contract_id: 'CCC2C22',
    customer_id: 'fabricio',
    description: 'Semanal — 04/03 a 10/03 (CCC2C22)',
    amount: 350.00,
    due_date: '2026-03-11',
    status: 'paid',
    payment_date: '2026-03-11',
    created_at: '2026-03-11T10:00:00Z',
    updated_at: '2026-03-11T10:00:00Z',
    customer_name: 'FABRICIO DO VALE NEPOMUCENO',
    motorcycle_plate: 'CCC2C22',
  },
  {
    id: '139',
    contract_id: 'DDD3D33',
    customer_id: 'flavio',
    description: 'Semanal — 04/03 a 10/03 (DDD3D33)',
    amount: 337.50,
    due_date: '2026-03-11',
    status: 'paid',
    payment_date: '2026-03-11',
    created_at: '2026-03-11T10:00:00Z',
    updated_at: '2026-03-11T10:00:00Z',
    customer_name: 'FLAVIO SILVA COUTINHO',
    motorcycle_plate: 'DDD3D33',
  },
  {
    id: '138',
    contract_id: 'DDD3D33',
    customer_id: 'flavio',
    description: 'Semanal — 25/02 a 03/03 (DDD3D33)',
    amount: 304.25,
    due_date: '2026-03-04',
    status: 'paid',
    payment_date: '2026-03-04',
    created_at: '2026-03-04T10:00:00Z',
    updated_at: '2026-03-04T10:00:00Z',
    customer_name: 'FLAVIO SILVA COUTINHO',
    motorcycle_plate: 'DDD3D33',
  },
  {
    id: '137',
    contract_id: 'CCC2C22',
    customer_id: 'fabricio',
    description: 'Semanal — 25/02 a 03/03 (CCC2C22)',
    amount: 350.00,
    due_date: '2026-03-04',
    status: 'paid',
    payment_date: '2026-03-04',
    created_at: '2026-03-04T10:00:00Z',
    updated_at: '2026-03-04T10:00:00Z',
    customer_name: 'FABRICIO DO VALE NEPOMUCENO',
    motorcycle_plate: 'CCC2C22',
  },
  {
    id: '136',
    contract_id: 'DDD3D33',
    customer_id: 'flavio',
    description: 'Semanal — 18/02 a 24/02 (DDD3D33)',
    amount: 335.55,
    due_date: '2026-02-25',
    status: 'paid',
    payment_date: '2026-02-25',
    created_at: '2026-02-25T10:00:00Z',
    updated_at: '2026-02-25T10:00:00Z',
    customer_name: 'FLAVIO SILVA COUTINHO',
    motorcycle_plate: 'DDD3D33',
  },
  {
    id: '135',
    contract_id: 'CCC2C22',
    customer_id: 'fabricio',
    description: 'Semanal — 18/02 a 24/02 (CCC2C22)',
    amount: 350.00,
    due_date: '2026-02-25',
    status: 'paid',
    payment_date: '2026-02-25',
    created_at: '2026-02-25T10:00:00Z',
    updated_at: '2026-02-25T10:00:00Z',
    customer_name: 'FABRICIO DO VALE NEPOMUCENO',
    motorcycle_plate: 'CCC2C22',
  },
  {
    id: '134',
    contract_id: 'DDD3D33',
    customer_id: 'flavio',
    description: 'Semanal — 11/02 a 17/02 (DDD3D33)',
    amount: 330.00,
    due_date: '2026-02-18',
    status: 'paid',
    payment_date: '2026-02-18',
    created_at: '2026-02-18T10:00:00Z',
    updated_at: '2026-02-18T10:00:00Z',
    customer_name: 'FLAVIO SILVA COUTINHO',
    motorcycle_plate: 'DDD3D33',
  },
  {
    id: '133',
    contract_id: 'CCC2C22',
    customer_id: 'fabricio',
    description: 'Semanal — 11/02 a 17/02 (CCC2C22)',
    amount: 350.00,
    due_date: '2026-02-18',
    status: 'paid',
    payment_date: '2026-02-18',
    created_at: '2026-02-18T10:00:00Z',
    updated_at: '2026-02-18T10:00:00Z',
    customer_name: 'FABRICIO DO VALE NEPOMUCENO',
    motorcycle_plate: 'CCC2C22',
  },
  {
    id: '132',
    contract_id: 'BBB1B11',
    customer_id: 'douglas',
    description: 'Quinzenal — 01/02 a 15/02 (BBB1B11)',
    amount: 630.00,
    due_date: '2026-02-16',
    status: 'paid',
    payment_date: '2026-02-16',
    created_at: '2026-02-16T10:00:00Z',
    updated_at: '2026-02-16T10:00:00Z',
    customer_name: 'DOUGLAS DOS SANTOS SIMÕES',
    motorcycle_plate: 'BBB1B11',
  },
  {
    id: '131',
    contract_id: 'DDD3D33',
    customer_id: 'flavio',
    description: 'Proporcional — 06/02 a 10/02 (DDD3D33)',
    amount: 173.00,
    due_date: '2026-02-11',
    status: 'paid',
    payment_date: '2026-02-11',
    created_at: '2026-02-11T10:00:00Z',
    updated_at: '2026-02-11T10:00:00Z',
    customer_name: 'FLAVIO SILVA COUTINHO',
    motorcycle_plate: 'DDD3D33',
  },
  {
    id: '130',
    contract_id: 'CCC2C22',
    customer_id: 'fabricio',
    description: 'Semanal — 04/02 a 10/02 (CCC2C22)',
    amount: 350.00,
    due_date: '2026-02-11',
    status: 'paid',
    payment_date: '2026-02-11',
    created_at: '2026-02-11T10:00:00Z',
    updated_at: '2026-02-11T10:00:00Z',
    customer_name: 'FABRICIO DO VALE NEPOMUCENO',
    motorcycle_plate: 'CCC2C22',
  },
  {
    id: '129',
    contract_id: 'DDD3D33',
    customer_id: 'flavio',
    description: 'Caução — Entrada do contrato (DDD3D33)',
    amount: 500.00,
    due_date: '2026-02-06',
    status: 'paid',
    payment_date: '2026-02-06',
    created_at: '2026-02-06T10:00:00Z',
    updated_at: '2026-02-06T10:00:00Z',
    customer_name: 'FLAVIO SILVA COUTINHO',
    motorcycle_plate: 'DDD3D33',
  },
  {
    id: '128',
    contract_id: 'CCC2C22',
    customer_id: 'fabricio',
    description: 'Semanal — 28/01 a 03/02 (CCC2C22)',
    amount: 350.00,
    due_date: '2026-02-04',
    status: 'paid',
    payment_date: '2026-02-04',
    created_at: '2026-02-04T10:00:00Z',
    updated_at: '2026-02-04T10:00:00Z',
    customer_name: 'FABRICIO DO VALE NEPOMUCENO',
    motorcycle_plate: 'CCC2C22',
  },
  {
    id: '127',
    contract_id: 'AAA0A00',
    customer_id: 'thiago',
    description: 'Semanal — 28/01 a 03/02 (AAA0A00)',
    amount: 350.00,
    due_date: '2026-02-04',
    status: 'paid',
    payment_date: '2026-02-04',
    created_at: '2026-02-04T10:00:00Z',
    updated_at: '2026-02-04T10:00:00Z',
    customer_name: 'THIAGO ALVES CARLOS',
    motorcycle_plate: 'AAA0A00',
  },
  {
    id: '126',
    contract_id: 'BBB1B11',
    customer_id: 'douglas',
    description: 'Quinzenal — 16/01 a 31/01 (BBB1B11)',
    amount: 630.00,
    due_date: '2026-01-31',
    status: 'paid',
    payment_date: '2026-01-31',
    created_at: '2026-01-31T10:00:00Z',
    updated_at: '2026-01-31T10:00:00Z',
    customer_name: 'DOUGLAS DOS SANTOS SIMÕES',
    motorcycle_plate: 'BBB1B11',
  },
  {
    id: '23',
    contract_id: 'AAA0A00',
    customer_id: 'marcos',
    description: 'Pagamento de Multa — Parcela 2/3 (AAA0A00)',
    amount: 100.00,
    due_date: '2025-05-07',
    status: 'paid',
    payment_date: '2025-05-07',
    created_at: '2025-05-07T10:00:00Z',
    updated_at: '2025-05-07T10:00:00Z',
    customer_name: 'MARCOS FELIPE NEVES LOUREIRO',
    motorcycle_plate: 'AAA0A00',
  },
  {
    id: '19',
    contract_id: 'AAA0A00',
    customer_id: 'marcos',
    description: 'Pagamento de Multa — Parcela 1/3 (AAA0A00)',
    amount: 100.00,
    due_date: '2025-05-04',
    status: 'paid',
    payment_date: '2025-05-04',
    created_at: '2025-05-04T10:00:00Z',
    updated_at: '2025-05-04T10:00:00Z',
    customer_name: 'MARCOS FELIPE NEVES LOUREIRO',
    motorcycle_plate: 'AAA0A00',
  },
  {
    id: '143',
    contract_id: 'CCC2C22',
    customer_id: 'fabricio',
    description: 'Semanal — 11/03 a 17/03 (CCC2C22)',
    amount: 350.00,
    due_date: '2026-03-18',
    status: 'pending',
    created_at: '2026-03-18T10:00:00Z',
    updated_at: '2026-03-18T10:00:00Z',
    customer_name: 'FABRICIO DO VALE NEPOMUCENO',
    motorcycle_plate: 'CCC2C22',
  },
  {
    id: 'test-prejuizo',
    contract_id: 'TESTE',
    customer_id: 'johnny',
    description: 'Aluguel — Janeiro/2026 (TESTE)',
    amount: 800.00,
    due_date: '2026-01-15',
    status: 'loss',
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
    customer_name: 'JOHNNY TESTE',
    motorcycle_plate: '—',
  },
]

/**
 * @constant tabs
 * @description Opções de filtragem por status para os botões de aba (tabs).
 */
const tabs = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendentes', value: 'pending' },
  { label: 'Vencidas', value: 'overdue' },
  { label: 'Pagas', value: 'paid' },
  { label: 'Prejuízo', value: 'loss' },
]

/**
 * @constant customerOptions
 * @description Lista de clientes para seleção no formulário de criação/edição.
 */
const customerOptions = [
  { value: '', label: 'Selecione um cliente' },
  { value: 'alexandre', label: 'ALEXANDRE DANTAS DAS SILVA' },
  { value: 'fabricio', label: 'FABRICIO DO VALE NEPOMUCENO' },
  { value: 'flavio', label: 'FLAVIO SILVA COUTINHO' },
  { value: 'douglas', label: 'DOUGLAS DOS SANTOS SIMÕES' },
  { value: 'thiago', label: 'THIAGO ALVES CARLOS' },
  { value: 'marcos', label: 'MARCOS FELIPE NEVES LOUREIRO' },
]

/**
 * @constant contractOptions
 * @description Lista de contratos e veículos vinculados para seleção.
 */
const contractOptions = [
  { value: '', label: 'Selecione um contrato / veículo' },
  { value: 'BBB1B11', label: 'BBB1B11 — Douglas' },
  { value: 'AAA0A00', label: 'AAA0A00 — Alexandre / Thiago / Marcos' },
  { value: 'CCC2C22', label: 'CCC2C22 — Fabrício' },
  { value: 'DDD3D33', label: 'DDD3D33 — Flávio' },
]

/**
 * @constant defaultForm
 * @description Estado inicial limpo para o formulário de cobrança.
 */
const defaultForm = {
  customer_id: '',
  contract_id: '',
  description: '',
  amount: '',
  due_date: '',
  notes: '',
}

/**
 * @component ChargesPage
 * @description Componente principal da página de cobranças.
 * Gerencia todo o estado da interface, desde dados da tabela até modais de confirmação.
 */
export default function ChargesPage() {
  /** @state charges - Lista principal de cobranças gerenciada no estado local. */
  const [charges, setCharges] = useState<ChargeWithRelations[]>(mockCharges)
  /** @state activeTab - Status de filtro selecionado nas abas. */
  const [activeTab, setActiveTab] = useState('all')
  /** @state modalOpen - Controla a visibilidade do modal de criação/edição. */
  const [modalOpen, setModalOpen] = useState(false)
  /** @state editingId - Armazena o ID da cobrança que está sendo editada (null se for nova). */
  const [editingId, setEditingId] = useState<string | null>(null)
  /** @state form - Dados capturados pelos campos do formulário. */
  const [form, setForm] = useState(defaultForm)
  /** @state deleting - Objeto da cobrança selecionada para exclusão. */
  const [deleting, setDeleting] = useState<ChargeWithRelations | null>(null)
  /** @state confirmingPaid - Objeto da cobrança selecionada para confirmar pagamento. */
  const [confirmingPaid, setConfirmingPaid] = useState<ChargeWithRelations | null>(null)
  /** @state confirmingLoss - Objeto da cobrança selecionada para marcar como prejuízo. */
  const [confirmingLoss, setConfirmingLoss] = useState<ChargeWithRelations | null>(null)
  /** @state search - Termo de busca digitado pelo usuário. */
  const [search, setSearch] = useState('')

  /**
   * @variable filtered
   * @description Processa a lista de cobranças aplicando filtros de aba e de busca textual.
   */
  const filtered = charges
    .filter((c) => activeTab === 'all' || c.status === activeTab)
    .filter((c) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        c.customer_name.toLowerCase().includes(q) ||
        c.motorcycle_plate.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      )
    })

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
   * @description Preenche o formulário com dados existentes e abre o modal para edição.
   * @param row - Objeto da cobrança a ser editada.
   */
  function openEdit(row: ChargeWithRelations) {
    setEditingId(row.id)
    setForm({
      customer_id: row.customer_id,
      contract_id: row.contract_id,
      description: row.description,
      amount: String(row.amount),
      due_date: row.due_date,
      notes: row.observations ?? '',
    })
    setModalOpen(true)
  }

  /**
   * @function confirmPaid
   * @description Atualiza o status da cobrança selecionada para 'paid' e define a data de pagamento como hoje.
   */
  function confirmPaid() {
    if (!confirmingPaid) return
    setCharges((prev) =>
      prev.map((c) =>
        c.id === confirmingPaid.id
          ? { ...c, status: 'paid' as ChargeStatus, payment_date: new Date().toISOString().split('T')[0] }
          : c
      )
    )
    setConfirmingPaid(null)
  }

  /**
   * @function confirmLoss
   * @description Atualiza o status da cobrança selecionada para 'loss' (prejuízo/perda).
   */
  function confirmLoss() {
    if (!confirmingLoss) return
    setCharges((prev) =>
      prev.map((c) =>
        c.id === confirmingLoss.id ? { ...c, status: 'loss' as ChargeStatus } : c
      )
    )
    setConfirmingLoss(null)
  }

  /**
   * @function handleSubmit
   * @description Processa o envio do formulário, criando ou atualizando um registro no estado.
   * @param e - Evento de submissão do formulário React.
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    /** @variable customerLabel - Localiza o nome legível do cliente baseado no ID selecionado. */
    const customerLabel = customerOptions.find((o) => o.value === form.customer_id)?.label ?? ''

    if (editingId) {
      /** Lógica de atualização de registro existente */
      setCharges((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                customer_id: form.customer_id,
                contract_id: form.contract_id,
                description: form.description,
                amount: parseFloat(form.amount),
                due_date: form.due_date,
                observations: form.notes,
                customer_name: customerLabel,
                motorcycle_plate: form.contract_id || c.motorcycle_plate,
                updated_at: new Date().toISOString(),
              }
            : c
        )
      )
    } else {
      /** Lógica de criação de novo registro */
      const newCharge: ChargeWithRelations = {
        id: String(Date.now()),
        contract_id: form.contract_id,
        customer_id: form.customer_id,
        description: form.description,
        amount: parseFloat(form.amount),
        due_date: form.due_date,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        customer_name: customerLabel,
        motorcycle_plate: form.contract_id || '—',
      }
      setCharges((prev) => [newCharge, ...prev])
    }

    setForm(defaultForm)
    setModalOpen(false)
  }

  /**
   * @function confirmDeletion
   * @description Remove permanentemente uma cobrança da lista do estado local.
   */
  function confirmDeletion() {
    if (!deleting) return
    setCharges((prev) => prev.filter((c) => c.id !== deleting.id))
    setDeleting(null)
  }

  /** CÁLCULOS FINANCEIROS E MÉTRICAS */

  /** @variable totalPaid - Soma de todos os valores das cobranças com status 'paid'. */
  const totalPaid = charges.filter((c) => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0)
  /** @variable totalPending - Soma de valores 'pending'. */
  const totalPending = charges.filter((c) => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0)
  /** @variable totalOverdue - Soma de valores 'overdue'. */
  const totalOverdue = charges.filter((c) => c.status === 'overdue').reduce((sum, c) => sum + c.amount, 0)
  /** @variable totalLoss - Soma de valores 'loss'. */
  const totalLoss = charges.filter((c) => c.status === 'loss').reduce((sum, c) => sum + c.amount, 0)
  /** @variable totalUnpaid - Total que deveria ter sido recebido mas não foi (Pendente + Vencido). */
  const totalUnpaid = totalPending + totalOverdue

  /** @variable defaultersCount - Quantidade de itens em atraso ou perdidos. */
  const defaultersCount = charges.filter((c) => c.status === 'overdue' || c.status === 'loss').length
  /** @variable defaultRate - Percentual de inadimplência sobre o volume total de registros. */
  const defaultRate = charges.length > 0 ? (defaultersCount / charges.length) * 100 : 0

  /** @variable paidCharges - Lista filtrada de itens já liquidados. */
  const paidCharges = charges.filter((c) => c.status === 'paid')
  /** @variable averageTicket - Média de valor por cobrança paga. */
  const averageTicket = paidCharges.length > 0 ? totalPaid / paidCharges.length : 0

  /** @variable today - Referência de data atual para cálculos de projeção. */
  const today = new Date()
  /** @variable in30Days - Data limite para a projeção de fluxo de caixa futuro. */
  const in30Days = new Date(today); in30Days.setDate(today.getDate() + 30)
  /** @variable projection30Days - Valor total de cobranças pendentes que vencem nos próximos 30 dias. */
  const projection30Days = charges
    .filter((c) => c.status === 'pending' && new Date(c.due_date) <= in30Days)
    .reduce((sum, c) => sum + c.amount, 0)

  /** @variable sortedOverdue - Cobranças vencidas ordenadas da mais antiga para a mais recente. */
  const sortedOverdue = charges
    .filter((c) => c.status === 'overdue')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
  /** @variable oldestCharge - O registro que está há mais tempo em atraso. */
  const oldestCharge = sortedOverdue[0]
  /** @variable daysOverdue - Cálculo de quantos dias o registro mais antigo está vencido. */
  const daysOverdue = oldestCharge
    ? Math.floor((today.getTime() - new Date(oldestCharge.due_date).getTime()) / 86400000)
    : 0

  /** @variable paidOnTime - Contagem de cobranças pagas na data de vencimento ou antes. */
  const paidOnTime = paidCharges.filter((c) => c.payment_date && c.payment_date <= c.due_date).length
  /** @variable punctualityRate - Índice percentual de clientes que pagam no prazo. */
  const punctualityRate = paidCharges.length > 0 ? (paidOnTime / paidCharges.length) * 100 : 0

  /** @variable averageTime - Tempo médio (em dias) decorrido entre o vencimento e o pagamento efetivo. */
  const averageTime = paidCharges.length > 0
    ? paidCharges.reduce((sum, c) => {
        const days = c.payment_date
          ? Math.floor((new Date(c.payment_date).getTime() - new Date(c.due_date).getTime()) / 86400000)
          : 0
        return sum + days
      }, 0) / paidCharges.length
    : 0

  /** @variable debtors - Agrupamento de valores devidos por nome de cliente. */
  const debtors: Record<string, number> = {}
  charges
    .filter((c) => c.status === 'overdue' || c.status === 'pending')
    .forEach((c) => { debtors[c.customer_name] = (debtors[c.customer_name] ?? 0) + c.amount })
  /** @variable topDebtor - O cliente com maior montante acumulado a pagar. */
  const topDebtor = Object.entries(debtors).sort((a, b) => b[1] - a[1])[0]

  /** @variable lossByCustomer - Agrupamento de prejuízos contabilizados por cliente. */
  const lossByCustomer: Record<string, number> = {}
  charges
    .filter((c) => c.status === 'loss')
    .forEach((c) => { lossByCustomer[c.customer_name] = (lossByCustomer[c.customer_name] ?? 0) + c.amount })
  /** @variable topLoss - O cliente que gerou o maior prejuízo individual até o momento. */
  const topLoss = Object.entries(lossByCustomer).sort((a, b) => b[1] - a[1])[0]

  /**
   * @constant columns
   * @description Definição estrutural das colunas da tabela de cobranças.
   * Cada objeto mapeia uma chave do dado para um cabeçalho e uma função de renderização JSX personalizada.
   */
  const columns = [
    {
      key: 'customer_name',
      header: 'Cliente',
      render: (row: ChargeWithRelations) => (
        <span className="font-medium text-white">{row.customer_name}</span>
      ),
    },
    {
      key: 'motorcycle_plate',
      header: 'Placa',
      render: (row: ChargeWithRelations) => (
        <span className="font-mono text-sm text-[#A0A0A0]">{row.motorcycle_plate}</span>
      ),
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (row: ChargeWithRelations) => <span>{row.description}</span>,
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (row: ChargeWithRelations) => (
        <span className="font-semibold text-white">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      key: 'due_date',
      header: 'Vencimento',
      render: (row: ChargeWithRelations) => <span>{formatDate(row.due_date)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: ChargeWithRelations) => <StatusBadge status={row.status} />,
    },
    {
      key: 'payment_date',
      header: 'Dt. Pagamento',
      render: (row: ChargeWithRelations) => (
        <span>{row.payment_date ? formatDate(row.payment_date) : '—'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row: ChargeWithRelations) => (
        <div className="flex items-center gap-1">
          {/* Botão de confirmação de pagamento: visível apenas para pendentes ou vencidas */}
          {(row.status === 'pending' || row.status === 'overdue') && (
            <button
              onClick={() => setConfirmingPaid(row)}
              title="Marcar como pago"
              className="p-1.5 rounded-lg text-green-400 hover:text-green-300 hover:bg-green-500/10 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {/* Botão de marcação de prejuízo: permite dar baixa contábil em dívidas irrecuperáveis */}
          {(row.status === 'pending' || row.status === 'overdue') && (
            <button
              onClick={() => setConfirmingLoss(row)}
              title="Contabilizar como prejuízo"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors"
            >
              <AlertTriangle className="w-3 h-3" />
              Prejuízo
            </button>
          )}
          {/* Botão de edição de dados */}
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {/* Botão de exclusão definitiva */}
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
      {/* Cabeçalho superior com título e ação global de nova cobrança */}
      <Header
        title="Cobranças"
        subtitle="Controle de recebimentos"
        actions={
          <Button onClick={openNew}>
            <Plus className="w-4 h-4" />
            Nova Cobrança
          </Button>
        }
      />

      <div className="p-6 space-y-4">

        {/* Banner Informativo sobre Integrações Futuras */}
        <div className="rounded-xl border border-[#BAFF1A]/30 bg-[#BAFF1A]/5 px-4 py-4 space-y-3">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-[#BAFF1A] mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#BAFF1A]">
                Integração com InfinitePay em breve
              </p>
              <p className="text-sm text-[#A0A0A0] mt-0.5">
                Esta tela será integrada com a plataforma InfinitePay para geração e gestão automatizada de cobranças.
                Os dados exibidos são <span className="text-white font-medium">ilustrativos</span> — o layout e campos poderão mudar com a integração.
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#BAFF1A]/10 border border-[#BAFF1A]/20 px-2.5 py-1 text-xs font-medium text-[#BAFF1A]">
              <Info className="w-3 h-3" />
              Dados ilustrativos
            </span>
          </div>

          {/* Lista de benefícios da futura integração */}
          <div className="border-t border-[#BAFF1A]/15 pt-3">
            <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">O que esta tela irá apresentar após a integração</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5">
              {[
                'Total recebido no período',
                'Total a receber (em aberto)',
                'Cobranças vencidas',
                '% de inadimplência',
                'Valores não pagos acumulados',
                'Prejuízos contabilizados (dívidas irrecuperáveis)',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BAFF1A]/60 shrink-0" />
                  <span className="text-xs text-[#A0A0A0]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grid de Cards de Métricas — Fornece visão rápida da saúde financeira */}
        <div className="grid grid-cols-3 gap-4">

          {/* Card 1: Total Recebido e Ticket Médio */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Total Recebido</p>
              <p className="text-2xl font-bold text-[#BAFF1A] mt-1">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-[#A0A0A0] mt-0.5">{paidCharges.length} cobranças pagas</p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-[#A0A0A0]">Ticket médio</span>
              <span className="text-xs font-semibold text-white">{formatCurrency(averageTicket)}</span>
            </div>
          </Card>

          {/* Card 2: Montante A Receber e Projeção Próximos 30 dias */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">A Receber</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{formatCurrency(totalPending)}</p>
              <p className="text-xs text-[#A0A0A0] mt-0.5">{charges.filter((c) => c.status === 'pending').length} em aberto</p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-[#A0A0A0]">Vencem em 30 dias</span>
              <span className="text-xs font-semibold text-amber-400">{formatCurrency(projection30Days)}</span>
            </div>
          </Card>

          {/* Card 3: Valor Total Vencido e Destaque da Cobrança Mais Atrasada */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Vencidas</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalOverdue)}</p>
              <p className="text-xs text-[#A0A0A0] mt-0.5">{charges.filter((c) => c.status === 'overdue').length} cobranças</p>
            </div>
            <div className="px-4 py-3">
              {oldestCharge ? (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-[#A0A0A0] truncate max-w-[130px]" title={oldestCharge.customer_name}>
                    {oldestCharge.customer_name.split(' ')[0]}
                  </span>
                  <span className="text-xs font-semibold text-red-400 shrink-0">{daysOverdue}d atraso</span>
                </div>
              ) : (
                <span className="text-xs text-green-400">Nenhuma em atraso</span>
              )}
            </div>
          </Card>

          {/* Card 4: Taxa de Inadimplência e Índice de Pontualidade */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Inadimplência</p>
              <p className={`text-2xl font-bold mt-1 ${defaultRate > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {defaultRate.toFixed(1)}%
              </p>
              <p className="text-xs text-[#A0A0A0] mt-0.5">
                {defaultersCount} cobrança(s) vencida(s) ou perdida(s) do total de {charges.length}
              </p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#A0A0A0]">Pontualidade</p>
                <p className="text-xs text-[#888888] mt-0.5">das {paidCharges.length} pagas</p>
              </div>
              <span className={`text-sm font-semibold ${punctualityRate >= 80 ? 'text-green-400' : punctualityRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {punctualityRate.toFixed(1)}%
              </span>
            </div>
          </Card>

          {/* Card 5: Valores Totais Não Pagos e Tempo Médio de Recebimento */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Valores Não Pagos</p>
              <p className={`text-2xl font-bold mt-1 ${totalUnpaid > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                {formatCurrency(totalUnpaid)}
              </p>
              <p className="text-xs text-[#A0A0A0] mt-0.5">Pendentes + vencidas</p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-[#A0A0A0]">Tempo médio de receb.</span>
              <span className="text-xs font-semibold text-white">
                {averageTime === 0 ? 'No prazo' : averageTime > 0 ? `${averageTime.toFixed(0)}d após venc.` : `${Math.abs(averageTime).toFixed(0)}d antecipado`}
              </span>
            </div>
          </Card>

          {/* Card 6: Prejuízos Contabilizados e Destaque de Maior Inadimplente */}
          <Card padding="none" className={totalLoss > 0 ? 'border-red-500/40 bg-red-500/5' : ''}>
            <div className={`p-4 border-b ${totalLoss > 0 ? 'border-red-500/20' : 'border-[#2a2a2a]'}`}>
              <div className="flex items-center gap-2">
                <p className={`text-xs uppercase tracking-wider ${totalLoss > 0 ? 'text-red-400' : 'text-[#A0A0A0]'}`}>
                  Prejuízos Contabilizados
                </p>
                {totalLoss > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-xs font-medium text-red-400">
                    Atenção
                  </span>
                )}
              </div>
              <p className={`text-2xl font-bold mt-1 ${totalLoss > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {formatCurrency(totalLoss)}
              </p>
              <p className={`text-xs mt-0.5 ${totalLoss > 0 ? 'text-red-400/70' : 'text-[#A0A0A0]'}`}>
                {charges.filter((c) => c.status === 'loss').length === 0
                  ? 'Nenhum prejuízo registrado'
                  : `${charges.filter((c) => c.status === 'loss').length} cobrança(s) irrecuperável(is)`}
              </p>
            </div>
            <div className={`px-4 py-3 ${totalLoss > 0 ? 'bg-red-500/5' : ''}`}>
              {topLoss ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-[#A0A0A0]">Maior prejuízo</p>
                    <p className="text-xs font-medium text-white truncate max-w-[130px]" title={topLoss[0]}>
                      {topLoss[0].split(' ')[0]}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-red-400 shrink-0">{formatCurrency(topLoss[1])}</span>
                </div>
              ) : (
                <span className="text-xs text-green-400">Nenhum prejuízo registrado</span>
              )}
            </div>
          </Card>

        </div>

        {/* Barra de Ações: Filtros por status e campo de busca global */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  activeTab === tab.value
                    ? 'bg-[#BAFF1A] text-[#121212]'
                    : 'bg-[#202020] border border-[#333333] text-[#A0A0A0] hover:text-white hover:border-[#555555]'
                }`}
              >
                {tab.label}
                {tab.value !== 'all' && (
                  <span className="ml-1.5 opacity-70">
                    ({charges.filter((c) => c.status === tab.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <input
              type="text"
              placeholder="Buscar por cliente, placa ou descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-lg bg-[#202020] border border-[#333333] text-sm text-white placeholder-[#A0A0A0] focus:outline-none focus:border-[#555555] w-72"
            />
          </div>
        </div>

        {/* Tabela de Dados: Renderiza a lista filtrada de cobranças */}
        <Card padding="none">
          <Table
            columns={columns}
            data={filtered}
            keyExtractor={(row) => row.id}
            emptyMessage="Nenhuma cobrança encontrada"
          />
        </Card>
      </div>

      {/* Modal: Formulário para criação ou edição de cobrança */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Cobrança' : 'Nova Cobrança'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Cliente"
            options={customerOptions}
            value={form.customer_id}
            onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
            required
          />
          <Select
            label="Contrato / Placa"
            options={contractOptions}
            value={form.contract_id}
            onChange={(e) => setForm({ ...form, contract_id: e.target.value })}
          />
          <Input
            label="Descrição"
            placeholder="Aluguel — Abril/2024"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              placeholder="1200.00"
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
            <Button type="submit">
              <DollarSign className="w-4 h-4" />
              {editingId ? 'Salvar Alterações' : 'Criar Cobrança'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação: Registro de pagamento recebido */}
      <Modal open={!!confirmingPaid} onClose={() => setConfirmingPaid(null)} title="Confirmar Pagamento" size="sm">
        <div className="space-y-4">
          <div className="p-4 bg-green-500/8 border border-green-500/20 rounded-lg space-y-2">
            <p className="text-sm text-white font-medium">Confirmar recebimento desta cobrança?</p>
            {confirmingPaid && (
              <div className="space-y-0.5">
                <p className="text-xs text-[#A0A0A0]">{confirmingPaid.customer_name}</p>
                <p className="text-xs text-[#A0A0A0]">{confirmingPaid.description}</p>
                <p className="text-sm font-semibold text-green-400">{formatCurrency(confirmingPaid.amount)}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-[#A0A0A0]">A data de pagamento será registrada como hoje.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setConfirmingPaid(null)}>Cancelar</Button>
            <Button onClick={confirmPaid}>
              <CheckCircle className="w-4 h-4" />
              Confirmar Pagamento
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmação: Registro de perda (prejuízo) irremediável */}
      <Modal open={!!confirmingLoss} onClose={() => setConfirmingLoss(null)} title="Registrar como Prejuízo" size="sm">
        <div className="space-y-4">
          <div className="p-4 bg-red-500/8 border border-red-500/20 rounded-lg space-y-2">
            <p className="text-sm text-white font-medium">Tem certeza que deseja contabilizar esta cobrança como prejuízo?</p>
            {confirmingLoss && (
              <div className="space-y-0.5">
                <p className="text-xs text-[#A0A0A0]">{confirmingLoss.customer_name}</p>
                <p className="text-xs text-[#A0A0A0]">{confirmingLoss.description}</p>
                <p className="text-sm font-semibold text-red-400">{formatCurrency(confirmingLoss.amount)}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-red-400/80">Esta ação indica que a dívida é irrecuperável. Não pode ser desfeita facilmente.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setConfirmingLoss(null)}>Cancelar</Button>
            <Button variant="danger" onClick={confirmLoss}>
              <AlertTriangle className="w-4 h-4" />
              Confirmar Prejuízo
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmação: Exclusão lógica/física do registro */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Excluir Cobrança" size="sm">
        <div className="space-y-4">
          <p className="text-[#A0A0A0] text-sm">
            Tem certeza que deseja excluir a cobrança{' '}
            <span className="text-white font-medium">{deleting?.description}</span>?
            Esta ação não poderá ser desfeita.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDeletion}>
              <Trash2 className="w-4 h-4" />
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
