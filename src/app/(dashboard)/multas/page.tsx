/**
 * @file page.tsx
 * @description Página de Controle de Multas e Infrações de Trânsito do Sistema GoMoto.
 * 
 * Este componente gerencia o registro de multas recebidas pela frota, permitindo
 * associar cada infração a um cliente específico e decidir quem é o responsável
 * financeiro pelo pagamento (se o locatário ou a própria empresa).
 * 
 * Funcionalidades principais:
 * - Cadastro de infrações com número de AIT, valor e data do ocorrido.
 * - Controle de status de quitação (Pendente vs Pago).
 * - Painel de resumo: total de multas, quantidade pendente e valor total a receber/pagar.
 * - Alerta dinâmico para multas em aberto.
 * - Filtros por status e por responsável financeiro.
 * - Busca rápida por nome do cliente ou placa da motocicleta.
 * 
 * Identificadores seguem o padrão Inglês e a documentação o padrão Português Brasil.
 */

'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, AlertTriangle, Search } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Fine, FineStatus } from '@/types'

/**
 * @interface FineWithRelations
 * @description Extensão da interface Fine para facilitar a exibição de nomes
 * legíveis na tabela sem a necessidade de múltiplos JOINS em tempo real no mock.
 */
type FineWithRelations = Fine & {
  customer_name: string
  motorcycle_plate: string
}

/**
 * @constant mockFines
 * @description Conjunto de dados fictícios para representar o histórico de multas.
 * Demonstra diferentes tipos de responsabilidade e status de pagamento.
 */
const mockFines: FineWithRelations[] = [
  {
    id: '1',
    customer_id: '2',
    motorcycle_id: '2',
    description: 'Excesso de velocidade — Av. Paulista',
    amount: 293.47,
    infraction_date: '2024-02-20',
    status: 'pending',
    responsible: 'customer',
    observations: 'AIT nº 12345678. Infração registrada pelo DETRAN.',
    created_at: '2024-02-25T10:00:00Z',
    customer_name: 'Fernanda Lima Oliveira',
    motorcycle_plate: 'DEF-5678',
  },
  {
    id: '2',
    customer_id: '4',
    motorcycle_id: '4',
    description: 'Estacionamento irregular',
    amount: 195.23,
    infraction_date: '2024-01-10',
    status: 'paid',
    payment_date: '2024-01-20',
    responsible: 'customer',
    observations: '',
    created_at: '2024-01-15T10:00:00Z',
    customer_name: 'Juliana Costa Mendes',
    motorcycle_plate: 'JKL-3456',
  },
  {
    id: '3',
    customer_id: '1',
    motorcycle_id: '1',
    description: 'Licenciamento atrasado — responsabilidade da empresa',
    amount: 130.16,
    infraction_date: '2024-03-01',
    status: 'pending',
    responsible: 'company',
    observations: 'Empresa responsável pelo atraso no licenciamento.',
    created_at: '2024-03-05T10:00:00Z',
    customer_name: 'Carlos Eduardo Santos',
    motorcycle_plate: 'ABC-1234',
  },
]

/** @constant customerOptions - Lista de clientes simulada para seleção no formulário. */
const customerOptions = [
  { value: '', label: 'Selecione um cliente' },
  { value: '1', label: 'Carlos Eduardo Santos' },
  { value: '2', label: 'Fernanda Lima Oliveira' },
  { value: '3', label: 'Roberto Alves Pereira' },
  { value: '4', label: 'Juliana Costa Mendes' },
]

/** @constant motorcycleOptions - Lista de motocicletas simulada para seleção no formulário. */
const motorcycleOptions = [
  { value: '', label: 'Selecione uma moto' },
  { value: '1', label: 'ABC-1234 — Honda CG 160 Titan' },
  { value: '2', label: 'DEF-5678 — Honda Biz 125' },
  { value: '3', label: 'GHI-9012 — Yamaha Factor 150' },
  { value: '4', label: 'JKL-3456 — Honda NXR 160 Bros' },
  { value: '5', label: 'MNO-7890 — Yamaha Crosser 150' },
]

/** @constant responsibleOptions - Define as opções de quem deve arcar com o custo da multa. */
const responsibleOptions = [
  { value: 'customer', label: 'Cliente' },
  { value: 'company', label: 'Empresa' },
]

/** @constant defaultForm - Estado de limpeza para o formulário de multas. */
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
 * @component FinesPage
 * @description Componente funcional da página de multas.
 * Gerencia a tabela de dados, filtragem e os modais de interação.
 */
export default function FinesPage() {
  /** ESTADOS DE DADOS E VISIBILIDADE */
  const [fines, setFines] = useState<FineWithRelations[]>(mockFines)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [deleting, setDeleting] = useState<FineWithRelations | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  /** @constant statusTabs - Configuração das abas de filtro rápido por status ou responsável. */
  const statusTabs = [
    { label: 'Todas', value: 'all' },
    { label: 'Pendentes', value: 'pending' },
    { label: 'Pagas', value: 'paid' },
    { label: 'Cliente', value: 'customer' },
    { label: 'Empresa', value: 'company' },
  ]

  /**
   * @variable filteredFines
   * @description Lógica de filtragem combinada: busca textual e abas de status/responsável.
   */
  const filteredFines = fines.filter((m) => {
    const matchesSearch = !search || (() => {
      const q = search.toLowerCase()
      return (
        m.customer_name.toLowerCase().includes(q) ||
        m.motorcycle_plate.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
      )
    })()
    
    const matchesFilter =
      statusFilter === 'all' ? true :
      statusFilter === 'customer' || statusFilter === 'company' ? m.responsible === statusFilter :
      m.status === statusFilter
    
    return matchesSearch && matchesFilter
  })

  /** HANDLERS DE ABERTURA DE MODAIS */

  function openNew() {
    setEditingId(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

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
   * @function handleMarkAsPaid
   * @description Atualiza o status de uma multa específica para 'paid' e registra a data atual.
   * @param id - ID da multa a ser liquidada.
   */
  function handleMarkAsPaid(id: string) {
    setFines((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: 'paid' as FineStatus, payment_date: new Date().toISOString().split('T')[0] }
          : m
      )
    )
  }

  /**
   * @function handleSubmit
   * @description Processa o salvamento dos dados do formulário (Criação ou Edição).
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    /** Localiza os nomes amigáveis baseados nos IDs selecionados para atualizar a denormalização local */
    const customerLabel = customerOptions.find((o) => o.value === form.customer_id)?.label ?? ''
    const motorcycleLabel = motorcycleOptions.find((o) => o.value === form.motorcycle_id)?.label ?? ''

    if (editingId) {
      /** Lógica de Edição */
      setFines((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? {
                ...m,
                customer_id: form.customer_id,
                motorcycle_id: form.motorcycle_id,
                description: form.description,
                amount: parseFloat(form.amount),
                infraction_date: form.infraction_date,
                responsible: form.responsible as 'customer' | 'company',
                observations: form.observations,
                customer_name: customerLabel,
                motorcycle_plate: motorcycleLabel.split(' — ')[0] ?? m.motorcycle_plate,
              }
            : m
        )
      )
    } else {
      /** Lógica de Criação */
      const newFine: FineWithRelations = {
        id: String(Date.now()),
        customer_id: form.customer_id,
        motorcycle_id: form.motorcycle_id,
        description: form.description,
        amount: parseFloat(form.amount),
        infraction_date: form.infraction_date,
        status: 'pending',
        responsible: form.responsible as 'customer' | 'company',
        observations: form.observations,
        created_at: new Date().toISOString(),
        customer_name: customerLabel,
        motorcycle_plate: motorcycleLabel.split(' — ')[0] ?? '',
      }
      setFines((prev) => [newFine, ...prev])
    }

    setForm(defaultForm)
    setModalOpen(false)
  }

  /**
   * @function confirmDeletion
   * @description Executa a remoção física do registro de multa do estado.
   */
  function confirmDeletion() {
    if (!deleting) return
    setFines((prev) => prev.filter((m) => m.id !== deleting.id))
    setDeleting(null)
  }

  /** CÁLCULOS DE SUMARIZAÇÃO */
  const totalPending = fines
    .filter((m) => m.status === 'pending')
    .reduce((sum, m) => sum + m.amount, 0)

  /** CONFIGURAÇÃO DE COLUNAS DA TABELA */
  const columns = [
    {
      key: 'customer_name',
      header: 'Cliente',
      render: (row: FineWithRelations) => (
        <span className="font-medium text-white">{row.customer_name}</span>
      ),
    },
    {
      key: 'motorcycle_plate',
      header: 'Moto',
      render: (row: FineWithRelations) => (
        <span className="font-mono text-sm">{row.motorcycle_plate}</span>
      ),
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (row: FineWithRelations) => (
        <div className="max-w-xs">
          <p className="text-white line-clamp-1">{row.description}</p>
          {row.observations && (
            <p className="text-xs text-[#A0A0A0] mt-0.5 line-clamp-1">{row.observations}</p>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (row: FineWithRelations) => (
        <span className="font-semibold text-red-400">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      key: 'infraction_date',
      header: 'Data Infração',
      render: (row: FineWithRelations) => <span>{formatDate(row.infraction_date)}</span>,
    },
    {
      key: 'responsible',
      header: 'Responsável',
      render: (row: FineWithRelations) => <StatusBadge status={row.responsible} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: FineWithRelations) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row: FineWithRelations) => (
        <div className="flex items-center gap-1">
          {/* Botão para liquidação de multa pendente */}
          {row.status === 'pending' && (
            <button
              onClick={() => handleMarkAsPaid(row.id)}
              title="Marcar como pago"
              className="p-1.5 rounded-lg text-green-400 hover:text-green-300 hover:bg-green-500/10 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {/* Ações padrões de edição e exclusão */}
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
      {/* Cabeçalho da página com título e chamada para ação principal */}
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
        
        {/* Painel de Sumarização Financeira das Multas */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Total de Multas</p>
            <p className="text-2xl font-bold text-white mt-1">{fines.length}</p>
          </Card>
          <Card>
            <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Pendentes</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {fines.filter((m) => m.status === 'pending').length}
            </p>
            <p className="text-xs text-amber-400/70 mt-0.5">{formatCurrency(totalPending)}</p>
          </Card>
          <Card>
            <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Pagas</p>
            <p className="text-2xl font-bold text-green-400 mt-1">
              {fines.filter((m) => m.status === 'paid').length}
            </p>
          </Card>
        </div>

        {/* Alerta Visual: Exibido apenas se houver multas pendentes de quitação */}
        {fines.some((m) => m.status === 'pending') && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-400">
              Você tem {fines.filter((m) => m.status === 'pending').length} multa(s) pendente(s) no total de{' '}
              <strong>{formatCurrency(totalPending)}</strong>.
            </p>
          </div>
        )}

        {/* Barra de Ferramentas: Filtros de Status e Campo de Busca Global */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  statusFilter === tab.value
                    ? 'bg-[#BAFF1A] text-[#121212]'
                    : 'bg-[#202020] border border-[#333333] text-[#A0A0A0] hover:text-white hover:border-[#555555]'
                }`}
              >
                {tab.label}
                {tab.value !== 'all' && (
                  <span className="ml-1.5 opacity-70">
                    ({tab.value === 'customer' || tab.value === 'company'
                      ? fines.filter((m) => m.responsible === tab.value).length
                      : fines.filter((m) => m.status === tab.value).length})
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

        {/* Tabela de Listagem: Renderização dos dados filtrados */}
        <Card padding="none">
          <Table
            columns={columns}
            data={filteredFines}
            keyExtractor={(row) => row.id}
            emptyMessage="Nenhuma multa registrada"
          />
        </Card>
      </div>

      {/* Modal: Formulário de Inclusão e Edição de Multas */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Multa' : 'Registrar Multa'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Input
            label="Descrição da Infração"
            placeholder="Excesso de velocidade — Av. Paulista"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
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
          <Textarea
            label="Observações"
            placeholder="AIT nº, local da infração, detalhes do recurso..."
            rows={3}
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <AlertTriangle className="w-4 h-4" />
              {editingId ? 'Salvar Alterações' : 'Registrar Multa'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação: Exclusão de Multa */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Excluir Multa" size="sm">
        <div className="space-y-4">
          <p className="text-[#A0A0A0] text-sm">
            Tem certeza que deseja excluir a multa{' '}
            <span className="text-white font-medium">{deleting?.description}</span>?
            Esta ação removerá permanentemente o histórico da infração.
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
