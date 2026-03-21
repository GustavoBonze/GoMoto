/**
 * @file src/app/(dashboard)/clientes/page.tsx
 *
 * @description
 * Página de gerenciamento de clientes (locatários) do sistema GoMoto.
 * Conectada ao Supabase real — sem dados mockados.
 *
 * FUNCIONALIDADES:
 * 1. Listagem de clientes ativos em tabela com busca por nome, CPF ou telefone.
 * 2. CRUD completo: editar, visualizar detalhes e excluir clientes.
 * 3. Proteção na exclusão: verifica se o cliente possui contrato ativo.
 * 4. Seção separada de ex-clientes (active = false) com motivo e data de saída.
 * 5. Link direto para WhatsApp de cada cliente.
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Edit2, Trash2, Eye, Search, UserX, MessageCircle,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import type { Customer } from '@/types'

// ---------------------------------------------------------------------------
// Constantes de apoio para os campos Select do formulário
// ---------------------------------------------------------------------------

/** @constant STATE_OPTIONS - Lista de UFs brasileiras para o campo Estado. */
const STATE_OPTIONS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
].map((uf) => ({ value: uf, label: uf }))

/** @constant CNH_CATEGORY_OPTIONS - Categorias de habilitação disponíveis. */
const CNH_CATEGORY_OPTIONS = [
  { value: 'A',  label: 'A'  },
  { value: 'B',  label: 'B'  },
  { value: 'AB', label: 'AB' },
  { value: 'C',  label: 'C'  },
  { value: 'D',  label: 'D'  },
  { value: 'E',  label: 'E'  },
]

// ---------------------------------------------------------------------------
// Tipo e estado inicial do formulário
// ---------------------------------------------------------------------------

/**
 * @interface FormState
 * @description Formato plano dos campos do formulário de edição.
 * Os nomes de campo usam camelCase (diferente das colunas do banco que usam snake_case).
 */
interface FormState {
  name: string
  cpf: string
  rg: string
  state: string
  phone: string
  email: string
  address: string
  zipCode: string
  emergencyContact: string
  cnh: string
  cnhExpiry: string
  cnhCategory: string
  birthDate: string
  paymentStatus: string
  notes: string
}

/** @constant defaultFormState - Valores iniciais do formulário (todos vazios). */
const defaultFormState: FormState = {
  name: '', cpf: '', rg: '', state: 'RJ',
  phone: '', email: '', address: '', zipCode: '',
  emergencyContact: '', cnh: '', cnhExpiry: '',
  cnhCategory: 'A', birthDate: '', paymentStatus: '', notes: '',
}

// ---------------------------------------------------------------------------
// Função utilitária: converte Customer -> FormState
// ---------------------------------------------------------------------------

/**
 * @function customerToForm
 * @description Converte um objeto Customer (formato do banco) para o formato
 * plano do formulário React, tratando valores nulos como strings vazias.
 */
function customerToForm(customer: Customer): FormState {
  return {
    name:             customer.name || '',
    cpf:              customer.cpf || '',
    rg:               customer.rg || '',
    state:            customer.state || 'RJ',
    phone:            customer.phone || '',
    email:            customer.email || '',
    address:          customer.address || '',
    zipCode:          customer.zip_code || '',
    emergencyContact: customer.emergency_contact || '',
    cnh:              customer.drivers_license || '',
    cnhExpiry:        customer.drivers_license_validity || '',
    cnhCategory:      customer.drivers_license_category || 'A',
    birthDate:        customer.birth_date || '',
    paymentStatus:    customer.payment_status || '',
    notes:            customer.observations || '',
  }
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

/**
 * @component ClientesPage
 * @description Página principal de gestão de clientes conectada ao Supabase.
 */
export default function ClientesPage() {

  // ---- Estados de dados ----
  /** @state customers - Lista completa de clientes retornada pelo Supabase. */
  const [customers, setCustomers] = useState<Customer[]>([])
  /** @state activeContractsMap - Mapa de customer_id -> info da moto/contrato ativo */
  const [activeContractsMap, setActiveContractsMap] = useState<Map<string, { license_plate: string; model: string; monthly_amount: number }>>(new Map())
  /** @state loading - Controla o indicador de carregamento da tabela. */
  const [loading, setLoading] = useState(true)
  /** @state error - Armazena mensagem de erro de rede, se houver. */
  const [error, setError] = useState<string | null>(null)

  // ---- Estados de UI ----
  /** @state searchTerm - Texto digitado na barra de busca (filtro client-side). */
  const [searchTerm, setSearchTerm] = useState('')

  // ---- Estados dos modals ----
  /** @state showForm - Controla a visibilidade do modal de edição. */
  const [showForm, setShowForm] = useState(false)
  /** @state editingCustomer - objeto = edição de cliente existente. */
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  /** @state deletingCustomer - Cliente aguardando confirmação de exclusão. */
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)
  /** @state viewingCustomer - Cliente aberto no modal de detalhes. */
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)

  // ---- Estados de loading das ações ----
  /** @state saving - Indica que o botão Salvar está em processamento. */
  const [saving, setSaving] = useState(false)
  /** @state deleting - Indica que o botão Excluir está em processamento. */
  const [deleting, setDeleting] = useState(false)

  // ---- Estado do formulário ----
  /** @state formState - Valores atuais dos campos do formulário. */
  const [formState, setFormState] = useState<FormState>(defaultFormState)

  // ---------------------------------------------------------------------------
  // Busca de dados
  // ---------------------------------------------------------------------------

  /**
   * @function fetchCustomers
   * @description Busca todos os clientes não promovidos da fila, ordenados por nome,
   * e busca informações de contratos e motos associadas.
   */
  const fetchCustomers = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data: customersData, error: supabaseError } = await supabase
      .from('customers')
      .select('*')
      .eq('in_queue', false)
      .order('name', { ascending: true })

    if (supabaseError) {
      setError(supabaseError.message)
      alert(`Erro ao buscar clientes: ${supabaseError.message}`)
    } else {
      setCustomers(customersData ?? [])
    }

    const { data: contractsData, error: contractsError } = await supabase
      .from('contracts')
      .select('customer_id, status, monthly_amount, motorcycles(license_plate, model)')
      .eq('status', 'active')

    if (contractsError) {
      console.error('Erro ao buscar contratos ativos:', contractsError.message)
    } else if (contractsData) {
      const map = new Map<string, { license_plate: string; model: string; monthly_amount: number }>()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      contractsData.forEach((contract: any) => {
        const moto = Array.isArray(contract.motorcycles) ? contract.motorcycles[0] : contract.motorcycles
        if (moto) {
          map.set(contract.customer_id, {
            license_plate: moto.license_plate,
            model: moto.model,
            monthly_amount: contract.monthly_amount
          })
        }
      })
      setActiveContractsMap(map)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchCustomers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------------------------------------------------------------------------
  // Handlers de abertura de modals
  // ---------------------------------------------------------------------------

  /** Abre o modal de edição pré-populado com os dados do cliente selecionado. */
  const handleEditClick = (customer: Customer) => {
    setFormState(customerToForm(customer))
    setEditingCustomer(customer)
    setShowForm(true)
  }

  // ---------------------------------------------------------------------------
  // Handler: Salvar (editar)
  // ---------------------------------------------------------------------------

  /**
   * @function handleSave
   * @description Envia os dados do formulário ao Supabase.
   * Atualiza o registro existente.
   * Mapeia os campos camelCase do form para os nomes snake_case do banco.
   */
  const handleSave = async () => {
    if (!editingCustomer) return

    setSaving(true)
    const supabase = createClient()

    /** Objeto mapeado para os nomes exatos das colunas do banco. */
    const dbObj = {
      name:                      formState.name,
      cpf:                       formState.cpf,
      rg:                        formState.rg              || null,
      state:                     formState.state            || null,
      phone:                     formState.phone,
      email:                     formState.email            || null,
      address:                   formState.address          || null,
      zip_code:                  formState.zipCode          || null,
      emergency_contact:         formState.emergencyContact || null,
      drivers_license:           formState.cnh              || null,
      drivers_license_validity:  formState.cnhExpiry        || null,
      drivers_license_category:  formState.cnhCategory      || null,
      birth_date:                formState.birthDate        || null,
      payment_status:            formState.paymentStatus    || null,
      observations:              formState.notes            || null,
    }

    // Modo edição: atualiza o registro existente
    const { error: updateError } = await supabase
      .from('customers')
      .update(dbObj)
      .eq('id', editingCustomer.id)

    if (updateError) {
      alert(`Erro ao atualizar cliente: ${updateError.message}`)
    } else {
      setShowForm(false)
      await fetchCustomers()
    }
    
    setSaving(false)
  }

  // ---------------------------------------------------------------------------
  // Handler: Excluir
  // ---------------------------------------------------------------------------

  /**
   * @function handleDelete
   * @description Verifica contratos ativos antes de excluir o cliente.
   * Bloqueia a exclusão se houver contrato com status 'active' vinculado.
   */
  const handleDelete = async (customer: Customer) => {
    setDeleting(true)
    const supabase = createClient()

    // Verifica se há contrato ativo vinculado ao cliente
    const { data: contratos } = await supabase
      .from('contracts')
      .select('id')
      .eq('customer_id', customer.id)
      .eq('status', 'active')
      .limit(1)

    if (contratos && contratos.length > 0) {
      alert('Não é possível excluir: cliente possui contrato ativo.')
      setDeleting(false)
      return
    }

    const { error: deleteError } = await supabase
      .from('customers')
      .delete()
      .eq('id', customer.id)

    if (deleteError) {
      alert(`Erro ao excluir cliente: ${deleteError.message}`)
    } else {
      setDeletingCustomer(null)
      await fetchCustomers()
    }
    setDeleting(false)
  }

  // ---------------------------------------------------------------------------
  // Filtros e separação de listas
  // ---------------------------------------------------------------------------

  /**
   * @function filterBySearch
   * @description Filtra uma lista de clientes pelo termo de busca.
   * Compara nome, CPF e telefone de forma case-insensitive.
   */
  const filterBySearch = (list: Customer[]) => {
    if (!searchTerm.trim()) return list
    const term = searchTerm.toLowerCase()
    return list.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.cpf?.includes(term) ||
        c.phone?.includes(term)
    )
  }

  /** Clientes com active !== false (inclui undefined/null como ativo) */
  const activeCustomers  = customers.filter((c) => c.active !== false)
  /** Clientes explicitamente inativos (active === false) */
  const formerCustomers  = customers.filter((c) => c.active === false)

  const filteredActive = filterBySearch(activeCustomers)
  const filteredFormer = filterBySearch(formerCustomers)

  // ---------------------------------------------------------------------------
  // Configuração das colunas da tabela de clientes ativos
  // ---------------------------------------------------------------------------

  const columns = [
    {
      key: 'name',
      header: 'Nome',
      render: (row: Customer) => (
        <span className="font-medium text-[#f5f5f5]">{row.name}</span>
      ),
    },
    {
      key: 'cpf',
      header: 'CPF',
      render: (row: Customer) => (
        <span className="font-mono text-xs text-[#c7c7c7]">{row.cpf}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Telefone',
      render: (row: Customer) => (
        <a
          href={`https://wa.me/55${row.phone.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[#c7c7c7] hover:text-[#BAFF1A] transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {row.phone}
        </a>
      ),
    },
    {
      key: 'current_motorcycle',
      header: 'Moto Atual',
      render: (row: Customer) => {
        const contractInfo = activeContractsMap.get(row.id)
        if (contractInfo) {
          return (
            <Badge variant="brand">
              {contractInfo.license_plate} — {contractInfo.model}
            </Badge>
          )
        }
        return <span className="text-[#616161]">-</span>
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Customer) =>
        row.active !== false ? (
          <Badge variant="success">Ativo</Badge>
        ) : (
          <Badge variant="danger">Inativo</Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row: Customer) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            title="Ver detalhes"
            onClick={(e) => { e.stopPropagation(); setViewingCustomer(row) }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Editar"
            onClick={(e) => { e.stopPropagation(); handleEditClick(row) }}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            title="Excluir"
            onClick={(e) => { e.stopPropagation(); setDeletingCustomer(row) }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  // ---------------------------------------------------------------------------
  // Render principal
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#121212]">
      <Header
        title="Clientes"
        subtitle="Clientes promovidos da fila de espera"
      />

      <div className="p-6 space-y-6">

        {/* Exibe mensagem de erro de rede se houver */}
        {error && (
          <div className="bg-[#7c1c1c]/20 border border-[#9a1c1c]/40 rounded-xl px-4 py-3 text-sm text-[#ff9c9a]">
            Erro ao carregar dados: {error}
          </div>
        )}

        {/* Barra de busca e contador */}
        <Card>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#616161] pointer-events-none" />
              <Input
                placeholder="Buscar por nome, CPF ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-[#9e9e9e] flex-shrink-0">
              <span className="font-bold text-[#f5f5f5]">{filteredActive.length}</span> clientes ativos
            </p>
          </div>
        </Card>

        {/* Tabela de clientes ativos */}
        <Card padding="none">
          <Table
            columns={columns}
            data={filteredActive}
            keyExtractor={(item) => item.id}
            loading={loading}
            emptyMessage="Nenhum cliente ativo encontrado."
            onRowClick={(row) => setViewingCustomer(row)}
          />
        </Card>

        {/* Seção de ex-clientes */}
        {filteredFormer.length > 0 && (
          <div className="space-y-4 pt-2">
            <h2 className="text-base font-semibold text-[#c7c7c7] flex items-center gap-2">
              <UserX className="w-4 h-4 text-[#ff9c9a]" />
              Ex-Clientes
              <span className="text-xs font-normal text-[#616161] ml-1">({filteredFormer.length})</span>
            </h2>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredFormer.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-[#202020] border border-[#323232] rounded-2xl p-4 flex gap-4 items-start opacity-85 hover:opacity-100 transition-opacity"
                >
                  {/* Avatar vermelho */}
                  <div className="w-10 h-10 rounded-full bg-[#7c1c1c] flex items-center justify-center flex-shrink-0">
                    <UserX className="w-5 h-5 text-[#ff9c9a]" />
                  </div>

                  {/* Informações do ex-cliente */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-[#c7c7c7]">{customer.name}</p>
                      <Badge variant="danger">EX-CLIENTE</Badge>
                    </div>
                    <p className="font-mono text-xs text-[#616161]">{customer.cpf}</p>

                    {customer.departure_date && (
                      <p className="text-xs text-[#9e9e9e]">
                        <span className="font-medium text-[#616161]">Saída:</span>{' '}
                        {new Date(customer.departure_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {customer.departure_reason && (
                      <p className="text-xs text-[#9e9e9e] leading-relaxed">
                        <span className="font-medium text-[#616161]">Motivo:</span>{' '}
                        {customer.departure_reason}
                      </p>
                    )}
                    {customer.observations && (
                      <p className="text-xs text-[#9e9e9e] italic bg-[#121212]/40 px-2 py-1.5 rounded-lg mt-1">
                        &ldquo;{customer.observations}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Botões de ação */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <Button variant="ghost" size="sm" title="Editar" onClick={() => handleEditClick(customer)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="danger" size="sm" title="Excluir" onClick={() => setDeletingCustomer(customer)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: Edição de Cliente                                 */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Editar Cliente"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome completo — ocupa linha inteira */}
          <div className="md:col-span-2">
            <Input
              label="Nome completo"
              value={formState.name}
              onChange={(e) => setFormState({ ...formState, name: e.target.value })}
              placeholder="Nome completo do cliente"
            />
          </div>

          <Input
            label="CPF"
            value={formState.cpf}
            onChange={(e) => setFormState({ ...formState, cpf: e.target.value })}
            placeholder="000.000.000-00"
          />
          <Input
            label="RG"
            value={formState.rg}
            onChange={(e) => setFormState({ ...formState, rg: e.target.value })}
            placeholder="Número do RG"
          />

          <Input
            label="Telefone"
            value={formState.phone}
            onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
            placeholder="(21) 99999-9999"
          />
          <Input
            label="Email"
            type="email"
            value={formState.email}
            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
            placeholder="email@exemplo.com"
          />

          <Select
            label="Estado"
            value={formState.state}
            onChange={(e) => setFormState({ ...formState, state: e.target.value })}
            options={[{ value: '', label: 'Selecione...' }, ...STATE_OPTIONS]}
          />
          <Input
            label="Data de Nascimento"
            type="date"
            value={formState.birthDate}
            onChange={(e) => setFormState({ ...formState, birthDate: e.target.value })}
          />

          {/* Endereço — ocupa linha inteira */}
          <div className="md:col-span-2">
            <Input
              label="Endereço"
              value={formState.address}
              onChange={(e) => setFormState({ ...formState, address: e.target.value })}
              placeholder="Rua, número, complemento, bairro"
            />
          </div>

          <Input
            label="CEP"
            value={formState.zipCode}
            onChange={(e) => setFormState({ ...formState, zipCode: e.target.value })}
            placeholder="00000-000"
          />
          <Input
            label="Status de Pagamento"
            value={formState.paymentStatus}
            onChange={(e) => setFormState({ ...formState, paymentStatus: e.target.value })}
            placeholder="Ex: Caução pago"
          />

          <Input
            label="Número da CNH"
            value={formState.cnh}
            onChange={(e) => setFormState({ ...formState, cnh: e.target.value })}
            placeholder="Número da habilitação"
          />
          <Select
            label="Categoria CNH"
            value={formState.cnhCategory}
            onChange={(e) => setFormState({ ...formState, cnhCategory: e.target.value })}
            options={CNH_CATEGORY_OPTIONS}
          />

          <Input
            label="Validade CNH"
            type="date"
            value={formState.cnhExpiry}
            onChange={(e) => setFormState({ ...formState, cnhExpiry: e.target.value })}
          />

          {/* Contato de emergência — ocupa linha inteira */}
          <div className="md:col-span-2">
            <Input
              label="Contato de Emergência"
              value={formState.emergencyContact}
              onChange={(e) => setFormState({ ...formState, emergencyContact: e.target.value })}
              placeholder="Nome e telefone de familiar ou responsável"
            />
          </div>

          {/* Observações — ocupa linha inteira */}
          <div className="md:col-span-2">
            <Textarea
              label="Observações"
              value={formState.notes}
              onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
              placeholder="Notas internas sobre o cliente..."
            />
          </div>
        </div>

        {/* Botões de ação do formulário */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#474747]">
          <Button variant="secondary" onClick={() => setShowForm(false)}>
            Cancelar
          </Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: Confirmação de Exclusão                                       */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        open={deletingCustomer !== null}
        onClose={() => setDeletingCustomer(null)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <p className="text-[#c7c7c7] leading-relaxed mb-6">
          Tem certeza que deseja excluir o cliente{' '}
          <span className="font-bold text-[#f5f5f5]">{deletingCustomer?.name}</span>?
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeletingCustomer(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            loading={deleting}
            onClick={() => deletingCustomer && handleDelete(deletingCustomer)}
          >
            Excluir
          </Button>
        </div>
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: Detalhes do Cliente                                           */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        open={viewingCustomer !== null}
        onClose={() => setViewingCustomer(null)}
        title="Detalhes do Cliente"
        size="lg"
      >
        {viewingCustomer && (
          <div className="space-y-5 text-[#c7c7c7]">
            {/* Cabeçalho com nome e badge de status */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold text-[#f5f5f5] leading-tight">{viewingCustomer.name}</h3>
              {viewingCustomer.active !== false ? (
                <Badge variant="success">Ativo</Badge>
              ) : (
                <Badge variant="danger">Inativo</Badge>
              )}
            </div>

            {/* Grid de campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <DetailsField label="CPF" value={viewingCustomer.cpf} mono />
              <DetailsField label="RG" value={viewingCustomer.rg} />
              <DetailsField label="Telefone" value={viewingCustomer.phone} />
              <DetailsField label="Email" value={viewingCustomer.email} />
              <DetailsField label="Estado" value={viewingCustomer.state} />
              <DetailsField label="CEP" value={viewingCustomer.zip_code} />
              <div className="md:col-span-2">
                <DetailsField label="Endereço" value={viewingCustomer.address} />
              </div>
              <DetailsField
                label="Data de Nascimento"
                value={
                  viewingCustomer.birth_date
                    ? new Date(viewingCustomer.birth_date + 'T12:00:00').toLocaleDateString('pt-BR')
                    : undefined
                }
              />
              <DetailsField label="Contato de Emergência" value={viewingCustomer.emergency_contact} />
              <DetailsField label="CNH" value={viewingCustomer.drivers_license} />
              <DetailsField label="Categoria CNH" value={viewingCustomer.drivers_license_category} />
              <DetailsField
                label="Validade CNH"
                value={
                  viewingCustomer.drivers_license_validity
                    ? new Date(viewingCustomer.drivers_license_validity + 'T12:00:00').toLocaleDateString('pt-BR')
                    : undefined
                }
              />
              <DetailsField label="Status de Pagamento" value={viewingCustomer.payment_status} />
              {viewingCustomer.observations && (
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold text-[#616161] uppercase tracking-wide mb-1">Observações</p>
                  <p className="text-sm text-[#c7c7c7] bg-[#121212]/40 border border-[#323232] rounded-lg px-3 py-2 leading-relaxed">
                    {viewingCustomer.observations}
                  </p>
                </div>
              )}
            </div>

            {/* SEÇÃO: DOCUMENTOS ANEXADOS */}
            {(viewingCustomer.drivers_license_photo_url || viewingCustomer.document_photo_url) && (
              <div className="mt-6 pt-6 border-t border-[#323232]">
                <h4 className="text-sm font-semibold text-[#f5f5f5] mb-4">Documentos Anexados</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingCustomer.drivers_license_photo_url && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-[#616161] uppercase tracking-wide">Foto da CNH</p>
                      <a href={viewingCustomer.drivers_license_photo_url} target="_blank" rel="noopener noreferrer" className="block relative group rounded-lg overflow-hidden border border-[#474747]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={viewingCustomer.drivers_license_photo_url}
                          alt="CNH do Cliente"
                          className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-sm text-white font-medium bg-black/60 px-3 py-1.5 rounded-full">Ver tamanho original</span>
                        </div>
                      </a>
                    </div>
                  )}
                  {viewingCustomer.document_photo_url && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-[#616161] uppercase tracking-wide">Comprovante de Residência / Outro</p>
                      <a href={viewingCustomer.document_photo_url} target="_blank" rel="noopener noreferrer" className="block relative group rounded-lg overflow-hidden border border-[#474747]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={viewingCustomer.document_photo_url}
                          alt="Documento do Cliente"
                          className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-sm text-white font-medium bg-black/60 px-3 py-1.5 rounded-full">Ver tamanho original</span>
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-[#474747] mt-6">
              <Button variant="secondary" onClick={() => setViewingCustomer(null)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-componente auxiliar: campo de detalhe (label + valor)
// ---------------------------------------------------------------------------

/**
 * @component DetailsField
 * @description Renderiza um par label/valor no modal de detalhes do cliente.
 */
function DetailsField({
  label,
  value,
  mono = false,
}: {
  label: string
  value?: string | null
  mono?: boolean
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#616161] uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm text-[#f5f5f5] ${mono ? 'font-mono' : ''}`}>
        {value || <span className="text-[#474747] italic">—</span>}
      </p>
    </div>
  )
}
