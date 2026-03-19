/**
 * @file src/app/(dashboard)/multas/page.tsx
 * @description Página de Controle de Multas e Infrações de Trânsito do Sistema GoMoto.
 *
 * @summary
 * Este componente é crucial para a gestão de riscos e responsabilidades da frota.
 * O "porquê" desta página existir é para centralizar o registro de infrações,
 * permitindo uma rápida identificação do infrator (cliente), a cobrança dos valores
 * e o controle de pagamentos junto aos órgãos de trânsito, evitando que a empresa
 * arque com custos que não são seus e mantendo os veículos regularizados.
 *
 * @funcionalidades
 * 1.  **Cadastro de Infrações**: Permite registrar multas com AIT, valor, data e descrição.
 * 2.  **Atribuição de Responsabilidade**: Associa a infração a um cliente e uma moto específicos.
 * 3.  **Controle Financeiro**: Define se o custo é do cliente ou da empresa.
 * 4.  **Gestão de Pagamentos**: Controla o status de quitação (Pendente vs. Pago).
 * 5.  **Painel de Resumo**: Exibe totais de multas, pendências e valores a receber/pagar.
 * 6.  **Filtros e Busca**: Facilita a localização de multas por status, responsável, cliente ou placa.
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
 * @description Estende a interface `Fine` base com dados denormalizados.
 * O "porquê": Para a UI, é mais performático ter os nomes do cliente e a placa da moto
 * diretamente no objeto da multa, evitando a necessidade de buscar essas informações
 * em outras listas (simulando um `JOIN` de banco de dados no front-end).
 */
type FineWithRelations = Fine & {
  customer_name: string
  motorcycle_plate: string
  motorcycle_model: string
}

/**
 * @constant mockFines
 * @description Dados fictícios para simular o histórico de multas.
 * O "porquê": Permite o desenvolvimento e teste da interface sem depender de uma API real,
 * demonstrando cenários como multas pagas, pendentes e com diferentes responsáveis.
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
    motorcycle_model: 'Honda Biz 125',
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
    motorcycle_model: 'Honda NXR 160 Bros',
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
    motorcycle_model: 'Honda CG 160 Titan',
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

/**
 * @constant clientToMoto
 * @description Mapeamento cliente → moto (baseado nos contratos ativos mockados)
 */
const clientToMoto: Record<string, string> = {
  '1': '1', // Carlos → ABC-1234
  '2': '2', // Fernanda → DEF-5678
  '3': '3', // Roberto → GHI-9012
  '4': '4', // Juliana → JKL-3456
}

/**
 * @constant motoToClient
 * @description Mapeamento moto → cliente (baseado nos contratos ativos mockados)
 */
const motoToClient: Record<string, string> = {
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
}

/** @constant responsibleOptions - Define as opções de quem deve arcar com o custo da multa. */
const responsibleOptions = [
  { value: 'customer', label: 'Cliente' },
  { value: 'company', label: 'Empresa' },
]

/** @constant defaultForm - Estado inicial para o formulário de multas, garantindo que ele sempre abra limpo. */
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
 * @constant commonInfractions
 * @description Lista de infrações mais comuns do CTB para preenchimento rápido.
 */
const commonInfractions = [
  { description: 'Excesso de velocidade até 20% acima do limite', amount: 88.38, severity: 'Leve' },
  { description: 'Não sinalizar mudança de faixa', amount: 88.38, severity: 'Leve' },
  { description: 'Conduzir sem documentos do veículo', amount: 130.16, severity: 'Média' },
  { description: 'Conduzir sem capacete de proteção', amount: 195.23, severity: 'Grave' },
  { description: 'Estacionamento irregular', amount: 195.23, severity: 'Grave' },
  { description: 'Excesso de velocidade entre 20% e 50% acima do limite', amount: 195.23, severity: 'Grave' },
  { description: 'Passageiro sem capacete de proteção', amount: 195.23, severity: 'Grave' },
  { description: 'Avançar sinal vermelho ou parada obrigatória', amount: 293.47, severity: 'Gravíssima' },
  { description: 'Habilitação (CNH) vencida', amount: 293.47, severity: 'Grave' },
  { description: 'Licenciamento do veículo vencido', amount: 293.47, severity: 'Grave' },
  { description: 'Transitar pela calçada ou acostamento', amount: 293.47, severity: 'Gravíssima' },
  { description: 'Ultrapassagem em local proibido', amount: 293.47, severity: 'Gravíssima' },
  { description: 'Uso de celular ao volante', amount: 293.47, severity: 'Gravíssima' },
  { description: 'Conduzir sem habilitação (CNH)', amount: 880.41, severity: 'Gravíssima' },
  { description: 'Excesso de velocidade acima de 50% do limite', amount: 880.41, severity: 'Gravíssima' },
  { description: 'Manobra perigosa ou acrobática', amount: 880.41, severity: 'Gravíssima' },
  { description: 'Trafegar na contramão', amount: 880.41, severity: 'Gravíssima' },
  { description: 'Embriaguez ao volante', amount: 2934.70, severity: 'Gravíssima' },
]

/**
 * @component FinesPage
 * @description Componente principal da página de multas. Orquestra o estado,
 * a lógica de negócios e a renderização da interface de gerenciamento de infrações.
 */
export default function FinesPage() {
  // --- ESTADOS DE DADOS E UI ---
  /**
   * @state fines
   * @description Armazena a lista completa de multas. É a fonte da verdade para a tabela.
   */
  const [fines, setFines] = useState<FineWithRelations[]>(mockFines)
  /**
   * @state modalOpen
   * @description Controla a visibilidade do modal de cadastro/edição.
   */
  const [modalOpen, setModalOpen] = useState(false)
  /**
   * @state editingId
   * @description Guarda o ID da multa em edição. Se `null`, o modal está em modo de "criação".
   * O "porquê": Permite reutilizar o mesmo formulário para duas ações distintas.
   */
  const [editingId, setEditingId] = useState<string | null>(null)
  /**
   * @state form
   * @description Armazena os valores atuais do formulário de multa.
   */
  const [form, setForm] = useState(defaultForm)
  /**
   * @state deleting
   * @description Guarda o objeto da multa selecionada para exclusão, para exibição no modal de confirmação.
   */
  const [deleting, setDeleting] = useState<FineWithRelations | null>(null)
  /**
   * @state payingFine
   * @description Guarda a multa selecionada para ser baixada (pagamento), exibida no modal de confirmação.
   * O "porquê": Permite ao usuário informar a data real do pagamento antes de confirmar a baixa.
   */
  const [payingFine, setPayingFine] = useState<FineWithRelations | null>(null)
  /**
   * @state paymentDateInput
   * @description Armazena a data de pagamento inserida pelo usuário no modal de baixa de multa.
   */
  const [paymentDateInput, setPaymentDateInput] = useState('')
  /**
   * @state search
   * @description Armazena o termo de busca digitado pelo usuário.
   */
  const [search, setSearch] = useState('')
  /**
   * @state statusFilter
   * @description Armazena o valor do filtro rápido selecionado (ex: 'pending', 'paid').
   */
  const [statusFilter, setStatusFilter] = useState('all')

  /**
   * @const statusTabs
   * @description Configuração das abas de filtro, combinando status de pagamento e responsável.
   */
  const statusTabs = [
    { label: 'Todas', value: 'all' },
    { label: 'Pendentes', value: 'pending' },
    { label: 'Pagas', value: 'paid' },
    { label: 'Cliente', value: 'customer' },
    { label: 'Empresa', value: 'company' },
  ]

  /**
   * @const filteredFines
   * @description Deriva a lista de multas a serem exibidas, aplicando os filtros de busca e de status.
   * O "porquê": É mais eficiente recalcular esta lista derivada a cada renderização do que
   * manter um estado separado para ela, que precisaria ser sincronizado manualmente.
   */
  const filteredFines = fines.filter((m) => {
    // Lógica de busca textual (case-insensitive)
    const matchesSearch = !search || (() => {
      const q = search.toLowerCase()
      return (
        m.customer_name.toLowerCase().includes(q) ||
        m.motorcycle_plate.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
      )
    })()

    // Lógica de filtro por aba (status ou responsável)
    const matchesFilter =
      statusFilter === 'all' ? true :
      statusFilter === 'customer' || statusFilter === 'company' ? m.responsible === statusFilter :
      m.status === statusFilter

    return matchesSearch && matchesFilter
  })

  // --- HANDLERS DE AÇÕES ---

  /**
   * @function openNew
   * @description Prepara o estado para abrir o modal de um novo registro.
   */
  function openNew() {
    setEditingId(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  /**
   * @function openEdit
   * @description Prepara o estado para abrir o modal de edição com os dados de uma multa existente.
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
   * @function handleMarkAsPaid
   * @description Abre o modal de confirmação de pagamento para que o usuário informe a data real.
   * O "porquê": Em vez de usar a data de hoje automaticamente, permite registrar a data exata
   * em que o pagamento foi efetivado, garantindo precisão no histórico financeiro.
   * @param row - A multa a ser baixada.
   */
  function handleMarkAsPaid(row: FineWithRelations) {
    setPayingFine(row)
    setPaymentDateInput(new Date().toISOString().split('T')[0])
  }

  /**
   * @function confirmPayment
   * @description Efetiva o pagamento da multa, atualizando o status e registrando a data informada pelo usuário.
   */
  function confirmPayment() {
    if (!payingFine) return
    setFines((prev) =>
      prev.map((m) =>
        m.id === payingFine.id
          ? { ...m, status: 'paid' as FineStatus, payment_date: paymentDateInput }
          : m
      )
    )
    setPayingFine(null)
    setPaymentDateInput('')
  }

  /**
   * @function handleSubmit
   * @description Processa o salvamento dos dados do formulário, diferenciando entre criação e edição.
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Busca os nomes legíveis baseados nos IDs para manter a denormalização local.
    const customerLabel = customerOptions.find((o) => o.value === form.customer_id)?.label ?? ''
    const motorcycleLabel = motorcycleOptions.find((o) => o.value === form.motorcycle_id)?.label ?? ''
    const [platePart, modelPart] = motorcycleLabel.split(' — ')

    if (editingId) {
      // Lógica de Edição: Atualiza a multa existente no array.
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
                motorcycle_plate: platePart ?? m.motorcycle_plate,
                motorcycle_model: modelPart ?? m.motorcycle_model,
              }
            : m
        )
      )
    } else {
      // Lógica de Criação: Adiciona uma nova multa ao início do array.
      const newFine: FineWithRelations = {
        id: String(Date.now()), // ID temporário
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
        motorcycle_plate: platePart ?? '',
        motorcycle_model: modelPart ?? '',
      }
      setFines((prev) => [newFine, ...prev])
    }

    setForm(defaultForm)
    setModalOpen(false)
  }

  /**
   * @function confirmDeletion
   * @description Executa a remoção do registro de multa do estado.
   */
  function confirmDeletion() {
    if (!deleting) return
    setFines((prev) => prev.filter((m) => m.id !== deleting.id))
    setDeleting(null)
  }

  /**
   * @const totalPending
   * @description Calcula o valor total de todas as multas com status "pendente".
   */
  const totalPending = fines
    .filter((m) => m.status === 'pending')
    .reduce((sum, m) => sum + m.amount, 0)

  /**
   * @const columns
   * @description Configuração das colunas para o componente `Table`.
   * O "porquê": Desacopla a definição da estrutura da tabela de sua renderização,
   * permitindo customizar a exibição de cada célula com componentes (como Badges) e formatação.
   */
  const columns = [
    {
      key: 'customer_name',
      header: 'Cliente',
      render: (row: FineWithRelations) => (
        <span
          className="font-medium text-white"
          title="Cliente ativo no contrato de locação desta moto"
        >
          {row.customer_name}
        </span>
      ),
    },
    {
      key: 'motorcycle_plate',
      header: 'Moto',
      render: (row: FineWithRelations) => (
        <div>
          <span className="block font-mono font-bold text-white">{row.motorcycle_plate}</span>
          <span className="block text-xs text-[#A0A0A0]">{row.motorcycle_model}</span>
        </div>
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
      header: 'Data da Infração',
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
      render: (row: FineWithRelations) => (
        <div>
          <StatusBadge status={row.status} />
          {row.status === 'paid' && row.payment_date && (
            <span className="block mt-1 text-xs text-[#A0A0A0]">
              {formatDate(row.payment_date)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row: FineWithRelations) => (
        <div className="flex items-center gap-1">
          {/* Botão para liquidação de multa pendente */}
          {row.status === 'pending' && (
            <button
              onClick={() => handleMarkAsPaid(row)}
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

        {/* Painel de Resumo Financeiro das Multas */}
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

        {/* Alerta Visual: Exibido apenas se houver multas pendentes */}
        {fines.some((m) => m.status === 'pending') && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-400">
              Você tem {fines.filter((m) => m.status === 'pending').length} multa(s) pendente(s) no total de{' '}
              <strong>{formatCurrency(totalPending)}</strong>.
            </p>
          </div>
        )}

        {/* Barra de Ferramentas: Filtros de Status e Campo de Busca */}
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
            emptyMessage="Nenhuma multa encontrada para os filtros aplicados"
          />
        </Card>
      </div>

      {/* Modal: Formulário de Inclusão e Edição de Multas */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Multa' : 'Registrar Multa'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[90vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Cliente"
              options={customerOptions}
              value={form.customer_id}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, customer_id: value, motorcycle_id: clientToMoto[value] || '' });
              }}
              required
            />
            <Select
              label="Moto"
              options={motorcycleOptions}
              value={form.motorcycle_id}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, motorcycle_id: value, customer_id: motoToClient[value] || '' });
              }}
              required
            />
          </div>
          
          {/* Select de infrações comuns — preenche descrição e valor automaticamente */}
          <Select
            label="Infrações Comuns (CTB)"
            options={[
              { value: '', label: 'Selecione uma infração comum...' },
              ...commonInfractions.map((item) => ({
                value: item.description,
                label: `[${item.severity}] ${item.description} — R$ ${item.amount.toFixed(2).replace('.', ',')}`,
              })),
            ]}
            value={commonInfractions.find((i) => i.description === form.description)?.description ?? ''}
            onChange={(e) => {
              const selected = commonInfractions.find((i) => i.description === e.target.value)
              if (selected) {
                setForm({ ...form, description: selected.description, amount: String(selected.amount) })
              }
            }}
          />

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
            label="Observações (opcional)"
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

      {/* Modal de Confirmação: Pagamento de Multa */}
      <Modal
        open={!!payingFine}
        onClose={() => { setPayingFine(null); setPaymentDateInput('') }}
        title="Confirmar Pagamento"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-[#A0A0A0] text-sm">
            Informe a data em que a multa foi paga:
          </p>

          <div className="p-3 bg-[#202020] border border-[#333333] rounded-lg space-y-1">
            <p className="text-sm text-[#A0A0A0]">
              Cliente: <span className="text-white font-medium">{payingFine?.customer_name}</span>
            </p>
            <p className="text-sm text-[#A0A0A0]">
              Valor: <span className="text-red-400 font-semibold">{payingFine ? formatCurrency(payingFine.amount) : ''}</span>
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
            <Button onClick={confirmPayment}>
              <CheckCircle className="w-4 h-4" />
              Confirmar Pagamento
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
