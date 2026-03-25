/**
 * @file src/app/(dashboard)/contratos/page.tsx
 *
 * @description Módulo de Gestão Contratual do Sistema GoMoto.
 * Permite listar, criar e encerrar contratos de locação de motos,
 * integrando em tempo real com o banco de dados Supabase.
 *
 * @fluxo
 * 1. Ao montar, busca todos os contratos com join de cliente e moto.
 * 2. O usuário pode filtrar por status ou buscar por nome/placa.
 * 3. Novo contrato: seleciona cliente e moto disponível, define datas e valor.
 *    Antes de salvar, verifica se a moto ainda está disponível no banco.
 *    Ao confirmar, a moto tem seu status alterado para 'rented'.
 * 4. Encerrar contrato: um modal de confirmação exibe os dados do contrato.
 *    Ao confirmar, status vai para 'closed' e a moto volta para 'available'.
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Eye,
  XCircle,
  CheckCircle,
  FileText,
  Search,
  Clock,
  AlertCircle,
  User,
  Bike,
  TrendingUp,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { ContractStatus } from '@/types'

import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Table } from '@/components/ui/Table'

// ─────────────────────────────────────────────
// TIPOS LOCAIS
// ─────────────────────────────────────────────

/**
 * @interface ContractWithRelations
 * @description Representa um contrato com os dados relacionados de cliente e moto,
 * retornados pelo Supabase via join automático.
 */
interface ContractWithRelations {
  /** @property id - UUID único do contrato. */
  id: string
  /** @property customer_id - Referência ao ID do cliente locatário. */
  customer_id: string
  /** @property motorcycle_id - Referência ao ID da moto alugada. */
  motorcycle_id: string
  /** @property start_date - Data de início da locação (formato ISO). */
  start_date: string
  /** @property end_date - Data prevista de término (null se em aberto). */
  end_date: string | null
  /** @property monthly_amount - Valor da mensalidade acordada. */
  monthly_amount: number
  /** @property status - Situação atual do contrato. */
  status: ContractStatus
  /** @property pdf_url - URL do contrato assinado em PDF, se houver. */
  pdf_url: string | null
  /** @property observations - Notas adicionais sobre o contrato. */
  observations: string | null
  /** @property created_at - Timestamp de criação do registro. */
  created_at: string
  /** @property updated_at - Timestamp da última alteração. */
  updated_at: string
  /** @property clientes - Dados do cliente vinculado ao contrato (join com tabela clientes). */
  customers: { name: string } | null
  /** @property motos - Dados da moto vinculada ao contrato (join com tabela motos). */
  motorcycles: { make: string; model: string; license_plate: string } | null
}

/**
 * @interface FormState
 * @description Estado controlado do formulário de criação de contrato.
 * monthly_amount é string para suportar o input type="number" nativamente.
 */
interface FormState {
  /** @property customer_id - ID do cliente selecionado no formulário. */
  customer_id: string
  /** @property motorcycle_id - ID da moto selecionada no formulário. */
  motorcycle_id: string
  /** @property start_date - Data de início digitada (formato YYYY-MM-DD). */
  start_date: string
  /** @property end_date - Data de término digitada (formato YYYY-MM-DD ou vazio). */
  end_date: string
  /** @property monthly_amount - Valor mensal digitado como string para o input. */
  monthly_amount: string
  /** @property observations - Observações adicionais (opcional). */
  observations: string
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────

/**
 * @component ContratosPage
 * @description Página principal de gestão de contratos.
 * Conectada ao Supabase para leitura e escrita em tempo real.
 * Inclui CRUD completo: listar, criar, ver detalhes e encerrar contratos.
 */
export default function ContratosPage() {
  /** Lista completa de contratos carregada do banco */
  const [contratos, setContratos] = useState<ContractWithRelations[]>([])
  /** Lista de clientes ativos para popular o select do formulário */
  const [clientes, setClientes] = useState<{ id: string; name: string }[]>([])
  /** Lista de motos disponíveis para popular o select do formulário */
  const [motosDisponiveis, setMotosDisponiveis] = useState<{ id: string; make: string; model: string; license_plate: string }[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Termo de busca livre (nome do cliente ou placa) */
  const [searchTerm, setSearchTerm] = useState('')
  /** Filtro de status aplicado à listagem */
  const [statusFilter, setStatusFilter] = useState<string>('all')

  /** Controla a visibilidade do modal de criação */
  const [showCreateModal, setShowCreateModal] = useState(false)
  /** Contrato selecionado para exibir no modal de detalhes */
  const [selectedContrato, setSelectedContrato] = useState<ContractWithRelations | null>(null)
  /** Contrato selecionado para o modal de confirmação de encerramento */
  const [contratoParaEncerrar, setContratoParaEncerrar] = useState<ContractWithRelations | null>(null)

  /** Estado do formulário de criação */
  const [formState, setFormState] = useState<FormState>({
    customer_id: '',
    motorcycle_id: '',
    start_date: '',
    end_date: '',
    monthly_amount: '',
    observations: '',
  })

  // ─────────────────────────────────────────────
  // FUNÇÕES DE BUSCA (Supabase)
  // ─────────────────────────────────────────────

  /**
   * @function fetchContratos
   * @description Busca todos os contratos do Supabase com join de clientes e motos.
   * Ordena pelos mais recentes primeiro e popula o estado `contratos`.
   */
  async function fetchContratos() {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data, error: fetchError } = await supabase
      .from('contracts')
      .select('*, customers(name), motorcycles(make, model, license_plate)')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setContratos((data as unknown as ContractWithRelations[]) || [])
    }
    setLoading(false)
  }

  /**
   * @function fetchClientes
   * @description Busca clientes com active=true para popular o select do formulário.
   */
  async function fetchClientes() {
    const supabase = createClient()
    const { data } = await supabase
      .from('customers')
      .select('id, name')
      .eq('active', true)
      .order('name')
    setClientes(data || [])
  }

  /**
   * @function fetchMotosDisponiveis
   * @description Busca motos com status 'available' para o select do formulário.
   */
  async function fetchMotosDisponiveis() {
    const supabase = createClient()
    const { data } = await supabase
      .from('motorcycles')
      .select('id, make, model, license_plate')
      .eq('status', 'available')
      .order('license_plate')
    setMotosDisponiveis(data || [])
  }

  /** Carrega os contratos na montagem do componente */
  useEffect(() => {
    fetchContratos()
  }, [])

  // ─────────────────────────────────────────────
  // AÇÕES DO USUÁRIO
  // ─────────────────────────────────────────────

  /**
   * @function openCreateModal
   * @description Abre o modal de criação e pré-carrega clientes e motos disponíveis.
   * Reseta o formulário para valores vazios antes de abrir.
   */
  function openCreateModal() {
    fetchClientes()
    fetchMotosDisponiveis()
    setFormState({
      customer_id: '',
      motorcycle_id: '',
      start_date: '',
      end_date: '',
      monthly_amount: '',
      observations: '',
    })
    setShowCreateModal(true)
  }

  /**
   * @function handleCreateContrato
   * @description Valida o formulário, verifica a disponibilidade atual da moto no banco,
   * insere o contrato e atualiza o status da moto para 'rented'.
   * A verificação dupla de disponibilidade evita race conditions caso outra
   * operação tenha alugado a moto entre o carregamento da lista e o envio do formulário.
   */
  async function handleCreateContrato() {
    if (!formState.customer_id || !formState.motorcycle_id || !formState.start_date || !formState.monthly_amount) {
      alert('Preencha todos os campos obrigatórios: Cliente, Moto, Data de Início e Valor Mensal.')
      return
    }

    setSaving(true)
    setError(null)
    const supabase = createClient()

    // Etapa 1: Verificar se a moto ainda está disponível (evita race condition)
    const { data: motoCheck, error: motoCheckError } = await supabase
      .from('motorcycles')
      .select('status')
      .eq('id', formState.motorcycle_id)
      .single()

    if (motoCheckError || !motoCheck || motoCheck.status !== 'available') {
      setError('Esta moto não está mais disponível. Por favor, selecione outra moto.')
      setSaving(false)
      // Recarregar lista de motos disponíveis para refletir estado atual
      fetchMotosDisponiveis()
      return
    }

    // Etapa 2: Inserir o contrato na tabela contratos
    const { error: insertError } = await supabase
      .from('contracts')
      .insert({
        customer_id: formState.customer_id,
        motorcycle_id: formState.motorcycle_id,
        start_date: formState.start_date,
        end_date: formState.end_date || null,
        monthly_amount: parseFloat(formState.monthly_amount),
        observations: formState.observations || null,
        status: 'active',
      })

    if (insertError) {
      setError(`Erro ao criar contrato: ${insertError.message}`)
      setSaving(false)
      return
    }

    // Etapa 3: Marcar a moto como 'rented'
    const { error: updateMotoError } = await supabase
      .from('motorcycles')
      .update({ status: 'rented' })
      .eq('id', formState.motorcycle_id)

    if (updateMotoError) {
      console.error('Erro ao atualizar status da moto:', updateMotoError.message)
    }

    setShowCreateModal(false)
    setSaving(false)
    fetchContratos()
  }

  /**
   * @function handleCloseContrato
   * @description Solicita o encerramento de um contrato abrindo o modal de confirmação.
   * A lógica real de encerramento é executada apenas após confirmação do usuário
   * em confirmarEncerramento(), evitando encerramentos acidentais.
   * @param contrato - O contrato que o usuário deseja encerrar.
   */
  function handleCloseContrato(contrato: ContractWithRelations) {
    setContratoParaEncerrar(contrato)
  }

  /**
   * @function confirmarEncerramento
   * @description Executa o encerramento do contrato após confirmação do usuário.
   * Atualiza o status do contrato para 'closed' e libera a moto (status 'available').
   * Fecha o modal de detalhes se o contrato encerrado estava sendo visualizado.
   */
  async function confirmarEncerramento() {
    if (!contratoParaEncerrar) return

    setSaving(true)
    setError(null)
    const supabase = createClient()

    // Etapa 1: Atualizar status do contrato para 'closed'
    const { error: updateContractError } = await supabase
      .from('contracts')
      .update({ status: 'closed' })
      .eq('id', contratoParaEncerrar.id)

    if (updateContractError) {
      setError(`Erro ao encerrar contrato: ${updateContractError.message}`)
      setSaving(false)
      return
    }

    // Etapa 2: Liberar a moto, voltando status para 'available'
    const { error: updateMotoError } = await supabase
      .from('motorcycles')
      .update({ status: 'available' })
      .eq('id', contratoParaEncerrar.motorcycle_id)

    if (updateMotoError) {
      console.error('Erro ao atualizar status da moto para disponível:', updateMotoError.message)
    }

    // Fechar modal de detalhes se o contrato encerrado estava selecionado
    if (selectedContrato?.id === contratoParaEncerrar.id) {
      setSelectedContrato(null)
    }

    setContratoParaEncerrar(null)
    setSaving(false)
    fetchContratos()
  }

  // ─────────────────────────────────────────────
  // CÁLCULO DE ESTATÍSTICAS
  // ─────────────────────────────────────────────

  /** Métricas calculadas localmente a partir dos contratos já carregados */
  const stats = {
    /** Quantidade de contratos com status 'active' */
    ativos: contratos.filter(c => c.status === 'active').length,
    /** Contratos ativos que encerram nos próximos 30 dias */
    encerrando30Dias: contratos.filter(c => {
      if (c.status !== 'active' || !c.end_date) return false
      const endDate = new Date(c.end_date)
      const hoje = new Date()
      const diffDias = Math.ceil((endDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
      return diffDias >= 0 && diffDias <= 30
    }).length,
    /** Soma dos valores mensais dos contratos ativos */
    receitaMensal: contratos
      .filter(c => c.status === 'active')
      .reduce((acc, curr) => acc + Number(curr.monthly_amount), 0),
    /** Contratos cancelados ou quebrados */
    canceladosQuebrados: contratos.filter(c => c.status === 'cancelled' || c.status === 'broken').length,
  }

  // ─────────────────────────────────────────────
  // FILTRAGEM LOCAL
  // ─────────────────────────────────────────────

  /** Lista de contratos filtrada pelo termo de busca e pelo status selecionado */
  const filteredContratos = contratos.filter(c => {
    const termo = searchTerm.toLowerCase()
    const bateNome = c.customers?.name?.toLowerCase().includes(termo) ?? false
    const batePlaca = c.motorcycles?.license_plate?.toLowerCase().includes(termo) ?? false
    const bateBusca = !searchTerm || bateNome || batePlaca
    const bateStatus = statusFilter === 'all' || c.status === statusFilter
    return bateBusca && bateStatus
  })

  // ─────────────────────────────────────────────
  // DEFINIÇÃO DAS COLUNAS DA TABELA
  // ─────────────────────────────────────────────

  /** Configuração das colunas exibidas na tabela de contratos */
  const columns = [
    {
      key: 'cliente',
      header: 'Cliente',
      render: (row: ContractWithRelations) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-[#9e9e9e]" />
          <span className="text-[#f5f5f5] font-medium">{row.customers?.name ?? '—'}</span>
        </div>
      ),
    },
    {
      key: 'moto',
      header: 'Moto',
      render: (row: ContractWithRelations) => (
        <div className="flex items-center gap-2">
          <Bike className="w-4 h-4 text-[#9e9e9e]" />
          <span className="text-[#c7c7c7]">
            {row.motorcycles ? `${row.motorcycles.make} ${row.motorcycles.model}` : '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'placa',
      header: 'Placa',
      render: (row: ContractWithRelations) => (
        <span className="text-[#c7c7c7]">{row.motorcycles?.license_plate ?? '—'}</span>
      ),
    },
    {
      key: 'inicio',
      header: 'Início',
      render: (row: ContractWithRelations) => (
        <span className="text-[#c7c7c7]">{formatDate(row.start_date)}</span>
      ),
    },
    {
      key: 'fim',
      header: 'Fim',
      render: (row: ContractWithRelations) => (
        <span className="text-[#c7c7c7]">{row.end_date ? formatDate(row.end_date) : '—'}</span>
      ),
    },
    {
      key: 'valor',
      header: 'Valor/mês',
      render: (row: ContractWithRelations) => (
        <span className="text-[#BAFF1A] font-medium">{formatCurrency(row.monthly_amount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: ContractWithRelations) => <StatusBadge status={row.status} />,
    },
    {
      key: 'acoes',
      header: 'Ações',
      render: (row: ContractWithRelations) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedContrato(row)}
            title="Ver detalhes"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {row.status === 'active' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleCloseContrato(row)}
              title="Encerrar contrato"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  // ─────────────────────────────────────────────
  // RENDERIZAÇÃO
  // ─────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#121212] p-6 text-[#f5f5f5]">
      {/* Cabeçalho da página */}
      <Header
        title="Contratos"
        subtitle="Gerencie os contratos de locação de motos"
        actions={
          <Button variant="primary" onClick={openCreateModal}>
            <Plus className="w-4 h-4" />
            Novo Contrato
          </Button>
        }
      />

      {/* Alerta de erro global */}
      {error && (
        <div className="mb-6 p-4 bg-[#7c1c1c] border border-[#ff9c9a] rounded-xl flex items-center gap-3 text-[#ff9c9a]">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card className="bg-[#202020] border border-[#474747] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[#9e9e9e] text-sm font-medium mb-1">Total Ativos</p>
            <h3 className="text-3xl font-bold text-[#f5f5f5]">{stats.ativos}</h3>
          </div>
          <div className="w-12 h-12 bg-[#243300] rounded-full flex items-center justify-center text-[#BAFF1A]">
            <CheckCircle className="w-6 h-6" />
          </div>
        </Card>

        <Card className="bg-[#202020] border border-[#474747] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[#9e9e9e] text-sm font-medium mb-1">Encerrando (30 dias)</p>
            <h3 className="text-3xl font-bold text-[#f5f5f5]">{stats.encerrando30Dias}</h3>
          </div>
          <div className="w-12 h-12 bg-[#3a180f] rounded-full flex items-center justify-center text-[#e65e24]">
            <Clock className="w-6 h-6" />
          </div>
        </Card>

        <Card className="bg-[#202020] border border-[#474747] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[#9e9e9e] text-sm font-medium mb-1">Receita Mensal</p>
            <h3 className="text-xl font-bold text-[#f5f5f5]">{formatCurrency(stats.receitaMensal)}</h3>
          </div>
          <div className="w-12 h-12 bg-[#0e2f13] rounded-full flex items-center justify-center text-[#28b438]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Card>

        <Card className="bg-[#202020] border border-[#474747] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[#9e9e9e] text-sm font-medium mb-1">Cancelados/Quebrados</p>
            <h3 className="text-3xl font-bold text-[#f5f5f5]">{stats.canceladosQuebrados}</h3>
          </div>
          <div className="w-12 h-12 bg-[#7c1c1c] rounded-full flex items-center justify-center text-[#ff9c9a]">
            <XCircle className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Barra de filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9e9e9e] pointer-events-none" />
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente ou placa..."
            className="pl-9"
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Todos os status' },
              { value: 'active', label: 'Ativos' },
              { value: 'closed', label: 'Encerrados' },
              { value: 'cancelled', label: 'Cancelados' },
              { value: 'broken', label: 'Quebrados' },
            ]}
          />
        </div>
      </div>

      {/* Tabela de contratos */}
      <Card className="bg-[#202020] border border-[#474747] rounded-2xl overflow-hidden">
        <Table
          columns={columns}
          data={filteredContratos}
          keyExtractor={row => row.id}
          loading={loading}
          emptyMessage="Nenhum contrato encontrado."
        />
      </Card>

      {/* ──────────────────────────────────────
          Modal: Criar Contrato
      ────────────────────────────────────── */}
      <Modal
        open={showCreateModal}
        onClose={() => { if (!saving) setShowCreateModal(false) }}
        title="Novo Contrato"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Cliente"
            value={formState.customer_id}
            onChange={e => setFormState({ ...formState, customer_id: e.target.value })}
            options={[
              { value: '', label: 'Selecione um cliente' },
              ...clientes.map(c => ({ value: c.id, label: c.name })),
            ]}
          />
          <Select
            label="Moto Disponível"
            value={formState.motorcycle_id}
            onChange={e => setFormState({ ...formState, motorcycle_id: e.target.value })}
            options={[
              { value: '', label: 'Selecione uma moto' },
              ...motosDisponiveis.map(m => ({
                value: m.id,
                label: `${m.make} ${m.model} — ${m.license_plate}`,
              })),
            ]}
          />
          <Input
            type="date"
            label="Data de Início"
            value={formState.start_date}
            onChange={e => setFormState({ ...formState, start_date: e.target.value })}
          />
          <Input
            type="date"
            label="Data de Término"
            value={formState.end_date}
            onChange={e => setFormState({ ...formState, end_date: e.target.value })}
          />
          <div className="md:col-span-2">
            <Input
              type="number"
              label="Valor Mensal (R$)"
              step="0.01"
              min="0"
              value={formState.monthly_amount}
              onChange={e => setFormState({ ...formState, monthly_amount: e.target.value })}
              placeholder="0,00"
            />
          </div>
          <div className="md:col-span-2">
            <Textarea
              label="Observações (opcional)"
              value={formState.observations}
              onChange={e => setFormState({ ...formState, observations: e.target.value })}
              rows={3}
              placeholder="Notas adicionais sobre o contrato..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-[#474747]">
          <Button
            variant="secondary"
            onClick={() => setShowCreateModal(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateContrato} loading={saving}>
            Salvar Contrato
          </Button>
        </div>
      </Modal>

      {/* ──────────────────────────────────────
          Modal: Detalhes do Contrato
      ────────────────────────────────────── */}
      <Modal
        open={!!selectedContrato}
        onClose={() => setSelectedContrato(null)}
        title="Detalhes do Contrato"
        size="md"
      >
        {selectedContrato && (
          <div className="space-y-4 text-[#c7c7c7]">
            {/* Cabeçalho com nome do cliente e status */}
            <div className="flex justify-between items-start pb-4 border-b border-[#474747]">
              <div>
                <p className="text-xs text-[#9e9e9e] uppercase tracking-wider mb-0.5">Cliente</p>
                <p className="text-lg font-semibold text-[#f5f5f5]">
                  {selectedContrato.customers?.name ?? '—'}
                </p>
              </div>
              <StatusBadge status={selectedContrato.status} />
            </div>

            {/* Moto, placa, datas */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#474747]">
              <div>
                <p className="text-xs text-[#9e9e9e] uppercase tracking-wider mb-0.5">Moto</p>
                <p className="text-[#f5f5f5]">
                  {selectedContrato.motorcycles
                    ? `${selectedContrato.motorcycles.make} ${selectedContrato.motorcycles.model}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9e9e9e] uppercase tracking-wider mb-0.5">Placa</p>
                <p className="text-[#f5f5f5]">{selectedContrato.motorcycles?.license_plate ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-[#9e9e9e] uppercase tracking-wider mb-0.5">Início</p>
                <p className="text-[#f5f5f5]">{formatDate(selectedContrato.start_date)}</p>
              </div>
              <div>
                <p className="text-xs text-[#9e9e9e] uppercase tracking-wider mb-0.5">Término</p>
                <p className="text-[#f5f5f5]">
                  {selectedContrato.end_date ? formatDate(selectedContrato.end_date) : 'Não definido'}
                </p>
              </div>
            </div>

            {/* Valor mensal */}
            <div className="pb-4 border-b border-[#474747]">
              <p className="text-xs text-[#9e9e9e] uppercase tracking-wider mb-0.5">Valor Mensal</p>
              <p className="text-2xl font-bold text-[#BAFF1A]">
                {formatCurrency(selectedContrato.monthly_amount)}
              </p>
            </div>

            {/* Observações */}
            {selectedContrato.observations && (
              <div className="pb-4 border-b border-[#474747]">
                <p className="text-xs text-[#9e9e9e] uppercase tracking-wider mb-1">Observações</p>
                <p className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-sm leading-relaxed">
                  {selectedContrato.observations}
                </p>
              </div>
            )}

            {/* Metadados e link do PDF */}
            <div className="flex items-center justify-between text-xs text-[#666]">
              <span>
                Criado em: {new Date(selectedContrato.created_at).toLocaleString('pt-BR')}
              </span>
              {selectedContrato.pdf_url && (
                <a
                  href={selectedContrato.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#BAFF1A] hover:underline"
                >
                  <FileText className="w-3 h-3" />
                  Ver PDF
                </a>
              )}
            </div>

            {/* Botão de encerrar contrato */}
            {selectedContrato.status === 'active' && (
              <div className="pt-4 border-t border-[#474747] flex justify-end">
                <Button
                  variant="danger"
                  onClick={() => handleCloseContrato(selectedContrato)}
                >
                  <XCircle className="w-4 h-4" />
                  Encerrar Contrato
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ──────────────────────────────────────
          Modal: Confirmação de Encerramento
          Substitui window.confirm por um modal
          contextual com os dados do contrato.
      ────────────────────────────────────── */}
      <Modal
        open={!!contratoParaEncerrar}
        onClose={() => { if (!saving) setContratoParaEncerrar(null) }}
        title="Encerrar Contrato"
        size="sm"
      >
        <div className="space-y-4">
          {/* Descrição do contrato que será encerrado */}
          <p className="text-[#c7c7c7] text-sm leading-relaxed">
            Tem certeza que deseja encerrar o contrato de{' '}
            <span className="text-[#f5f5f5] font-semibold">
              {contratoParaEncerrar?.customers?.name}
            </span>{' '}
            com a moto{' '}
            <span className="text-[#f5f5f5] font-semibold">
              {contratoParaEncerrar?.motorcycles?.make} {contratoParaEncerrar?.motorcycles?.model}{' '}
              ({contratoParaEncerrar?.motorcycles?.license_plate})
            </span>?
          </p>
          <p className="text-[#9e9e9e] text-xs">
            A moto voltará a ficar disponível para locação. Esta ação não pode ser desfeita.
          </p>

          {/* Botões de ação */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#474747]">
            <Button
              variant="secondary"
              onClick={() => setContratoParaEncerrar(null)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmarEncerramento} loading={saving}>
              <XCircle className="w-4 h-4" />
              Encerrar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
