/**
 * @file src/app/(dashboard)/manutencao/page.tsx
 * @description Página de gerenciamento de manutenções da frota GoMoto.
 *
 * @summary
 * Central de controle do histórico e agendamento de revisões de cada veículo.
 * Ao cadastrar uma nova moto (wizard em /motos), o sistema semeia automaticamente
 * os itens de manutenção preventiva padrão. Esta tela permite acompanhar o
 * ciclo de vida completo: pendente → concluído → nova revisão agendada.
 *
 * @funcionalidades
 * 1. **Cards de KPIs**: Custo do mês corrente, total de pendentes e total de concluídas.
 * 2. **Filtros combinados**: Busca textual + filtro por tipo (preventiva/corretiva/vistoria) + filtro por status.
 * 3. **Tabela com coluna "Previsto"**: Exibe data agendada OU km previsto, conforme o tipo de item.
 * 4. **Marcar como concluída**: Botão rápido na linha — define completed_date como hoje.
 * 5. **Criação restrita a corretivas**: Novas manutenções via modal são sempre do tipo corretivo.
 *    As preventivas e vistorias são criadas automaticamente ao cadastrar uma moto.
 * 6. **Edição completa**: Editar e excluir qualquer manutenção via modais.
 *
 * @arquitetura
 * - **Client Component**: Toda a interatividade (filtros, modais, CRUD) é gerenciada no cliente.
 * - **Supabase direto**: Queries via `createClient()` no browser — sem API intermediária.
 * - **Join automático**: `select('*, motorcycles(...)')` retorna placa/marca/modelo junto ao registro.
 * - **Design System Bonze**: Cores, espaçamentos e layout seguem `design-system-bonze.md` e o
 *   padrão visual estabelecido na tela de Fila de Locadores.
 *   - Background tela: `#121212` (neutral-900)
 *   - Cards/containers: `#202020` (neutral-850)
 *   - Bordas: `#474747` (neutral-750)
 *   - Cor de marca: `#BAFF1A` (green-lime-500)
 *   - Atenção/pendente: `#e65e24` (yellow-600)
 *   - Sucesso/concluído: `#28b438` (green-500)
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Wrench, CheckCircle2, Clock, Trash2, Edit2, Search } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Maintenance } from '@/types'

import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Header } from '@/components/layout/Header'

// ─── TIPOS LOCAIS ─────────────────────────────────────────────────────────────

/**
 * @type MaintenanceWithMoto
 * @description Estende Maintenance com os dados da moto obtidos via join do Supabase.
 * O join é feito na query com `motorcycles(license_plate, model, make)`.
 */
type MaintenanceWithMoto = Maintenance & {
  motorcycles: {
    license_plate: string
    model: string
    make: string
  } | null
}

/**
 * @type MotorcycleOption
 * @description Dados mínimos de uma moto para popular o select do formulário.
 */
type MotorcycleOption = {
  id: string
  license_plate: string
  model: string
  make: string
}

/**
 * @type MaintenanceFormData
 * @description Estrutura do formulário de criação e edição de manutenções.
 * Campos numéricos (actual_km, cost) são mantidos como string para compatibilidade com inputs HTML —
 * a conversão para number ocorre apenas no payload enviado ao Supabase.
 */
type MaintenanceFormData = {
  motorcycle_id: string
  type: 'preventive' | 'corrective' | 'inspection'
  description: string
  scheduled_date: string
  actual_km: string
  cost: string
  completed: boolean
  completed_date: string
  workshop: string
  observations: string
}

// ─── CONSTANTES DE MÓDULO ─────────────────────────────────────────────────────

/**
 * @constant INITIAL_FORM
 * @description Estado inicial do formulário — usado para reset após salvar ou cancelar.
 * `workshop` já vem pré-preenchido com o nome padrão da oficina da frota.
 */
const INITIAL_FORM: MaintenanceFormData = {
  motorcycle_id: '',
  type: 'corrective',
  description: '',
  scheduled_date: '',
  actual_km: '',
  cost: '',
  completed: false,
  completed_date: '',
  workshop: 'Oficina do Careca',
  observations: '',
}

/**
 * @constant TYPE_LABEL_MAP
 * @description Mapeamento de tipo técnico para rótulo em português.
 * Usado na exibição do campo de tipo no modal de edição (somente leitura).
 */
const TYPE_LABEL_MAP: Record<string, string> = {
  preventive: 'Preventiva',
  corrective: 'Corretiva',
  inspection: 'Vistoria',
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

/**
 * @component MaintenancePage
 * @description Página principal de manutenções com CRUD completo, filtros e KPIs.
 * Os dados são carregados do Supabase na montagem e re-buscados após cada operação de escrita.
 */
export default function MaintenancePage() {

  // ── Estado dos dados ────────────────────────────────────────────────────────
  /** Lista de manutenções com dados de moto embutidos (join). */
  const [maintenances, setMaintenances] = useState<MaintenanceWithMoto[]>([])
  /** Lista de motos para popular o select no formulário. */
  const [motorcycles, setMotorcycles] = useState<MotorcycleOption[]>([])
  /** Controla o spinner da tabela durante o carregamento inicial. */
  const [loading, setLoading] = useState<boolean>(true)
  /** Controla o estado de loading dos botões de salvar. */
  const [saving, setSaving] = useState<boolean>(false)

  // ── Estado de filtros ───────────────────────────────────────────────────────
  /** Texto digitado na barra de busca — filtra por descrição, placa, marca e modelo. */
  const [searchQuery, setSearchQuery] = useState<string>('')
  /** Filtro por tipo: preventiva, corretiva, vistoria ou todos. */
  const [typeFilter, setTypeFilter] = useState<'all' | 'preventive' | 'corrective' | 'inspection'>('all')
  /** Filtro por status: concluída, pendente ou todos. */
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all')
  /** Filtro por moto específica — UUID ou 'all' para exibir todas agrupadas. */
  const [motorcycleFilter, setMotorcycleFilter] = useState<string>('all')

  // ── Estado dos modais ───────────────────────────────────────────────────────
  /** Controla a visibilidade do modal de criação/edição. */
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false)
  /** Controla a visibilidade do modal de confirmação de exclusão. */
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  /** Manutenção em edição — null quando o modal está em modo criação. */
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceWithMoto | null>(null)
  /** ID da manutenção marcada para exclusão — null quando nenhuma está selecionada. */
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Estado do formulário ────────────────────────────────────────────────────
  /** Dados atuais do formulário — compartilhado entre os modos criação e edição. */
  const [formData, setFormData] = useState<MaintenanceFormData>(INITIAL_FORM)

  // ─── BUSCA DE DADOS ──────────────────────────────────────────────────────────

  /**
   * @function fetchMaintenances
   * @description Busca todas as manutenções do Supabase com join na tabela de motos.
   * Ordenadas por data de criação decrescente para exibir os registros mais recentes primeiro.
   */
  const fetchMaintenances = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('maintenances')
      .select('*, motorcycles(license_plate, model, make)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar manutencoes:', error)
      return
    }
    setMaintenances((data as MaintenanceWithMoto[]) || [])
  }, [])

  /**
   * @function fetchMotorcycles
   * @description Busca somente os campos necessários das motos para popular o select do formulário.
   * Ordenadas por placa para facilitar a busca visual pelo usuário.
   */
  const fetchMotorcycles = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('motorcycles')
      .select('id, license_plate, model, make')
      .order('license_plate')

    if (error) {
      console.error('Erro ao buscar motos:', error)
      return
    }
    setMotorcycles((data as MotorcycleOption[]) || [])
  }, [])

  /**
   * @effect Carregamento inicial paralelo de manutenções e motos.
   * Usa Promise.all para minimizar o tempo de loading da página.
   */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchMaintenances(), fetchMotorcycles()])
      setLoading(false)
    }
    loadData()
  }, [fetchMaintenances, fetchMotorcycles])

  // ─── AÇÕES DE CRUD ──────────────────────────────────────────────────────────

  /**
   * @function handleSave
   * @description Persiste a manutenção no Supabase — cria ou atualiza conforme `editingMaintenance`.
   * Sanitiza os campos numéricos e garante que `completed_date` só é enviado quando concluída.
   */
  const handleSave = async () => {
    if (!formData.motorcycle_id || !formData.description) {
      alert('Por favor, preencha a moto e a descrição.')
      return
    }

    setSaving(true)
    const supabase = createClient()

    const payload = {
      motorcycle_id: formData.motorcycle_id,
      type: formData.type,
      description: formData.description,
      scheduled_date: formData.scheduled_date || null,
      actual_km: formData.actual_km ? parseInt(formData.actual_km, 10) : null,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      completed: formData.completed,
      completed_date: formData.completed && formData.completed_date ? formData.completed_date : null,
      workshop: formData.workshop || null,
      observations: formData.observations || null,
    }

    try {
      if (editingMaintenance) {
        const { error } = await supabase
          .from('maintenances')
          .update(payload)
          .eq('id', editingMaintenance.id)

        if (error) { console.error('Erro ao editar manutencao:', error); return }
      } else {
        const { error } = await supabase
          .from('maintenances')
          .insert([payload])

        if (error) { console.error('Erro ao criar manutencao:', error); return }
      }

      // Fecha e limpa o modal após sucesso
      setIsFormModalOpen(false)
      setFormData(INITIAL_FORM)
      setEditingMaintenance(null)
      fetchMaintenances()
    } catch (err) {
      console.error('Erro inesperado ao salvar manutencao:', err)
    } finally {
      setSaving(false)
    }
  }

  /**
   * @function handleDelete
   * @description Exclui permanentemente a manutenção cujo ID está em `deletingId`.
   * Só é chamada após confirmação no modal de exclusão.
   */
  const handleDelete = async () => {
    if (!deletingId) return
    const supabase = createClient()
    const { error } = await supabase
      .from('maintenances')
      .delete()
      .eq('id', deletingId)

    if (error) { console.error('Erro ao excluir manutencao:', error); return }

    setIsDeleteModalOpen(false)
    setDeletingId(null)
    fetchMaintenances()
  }

  /**
   * @function handleMarkCompleted
   * @description Marca uma manutenção como concluída com a data de hoje, sem abrir o modal.
   * Atalho rápido disponível no botão verde (CheckCircle2) na coluna de ações da tabela.
   * @param {string} id - UUID da manutenção a ser concluída.
   */
  const handleMarkCompleted = async (id: string) => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase
      .from('maintenances')
      .update({ completed: true, completed_date: today })
      .eq('id', id)

    if (error) { console.error('Erro ao marcar como concluida:', error); return }
    fetchMaintenances()
  }

  /**
   * @function handleOpenEdit
   * @description Popula o formulário com os dados do registro e abre o modal em modo edição.
   * Converte campos numéricos de volta para string para compatibilidade com os inputs HTML.
   * @param {MaintenanceWithMoto} maintenance - Registro a ser editado.
   */
  const handleOpenEdit = (maintenance: MaintenanceWithMoto) => {
    setEditingMaintenance(maintenance)
    setFormData({
      motorcycle_id: maintenance.motorcycle_id,
      type: maintenance.type,
      description: maintenance.description,
      scheduled_date: maintenance.scheduled_date || '',
      actual_km: maintenance.actual_km?.toString() || '',
      cost: maintenance.cost?.toString() || '',
      completed: maintenance.completed,
      completed_date: maintenance.completed_date || '',
      workshop: maintenance.workshop || '',
      observations: maintenance.observations || '',
    })
    setIsFormModalOpen(true)
  }

  // ─── FILTRAGEM LOCAL ────────────────────────────────────────────────────────

  /**
   * @constant filteredMaintenances
   * @description Aplica em memória os filtros de busca, tipo, status e moto sobre a lista completa.
   * Recalculado quando qualquer filtro ou a lista de manutenções muda.
   */
  const filteredMaintenances = useMemo(() => {
    return maintenances.filter((m) => {
      const query = searchQuery.toLowerCase()
      const matchSearch =
        m.description.toLowerCase().includes(query) ||
        (m.motorcycles && (
          m.motorcycles.license_plate.toLowerCase().includes(query) ||
          m.motorcycles.model.toLowerCase().includes(query) ||
          m.motorcycles.make.toLowerCase().includes(query)
        ))

      const matchType = typeFilter === 'all' || m.type === typeFilter
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' ? m.completed : !m.completed)
      const matchMoto = motorcycleFilter === 'all' || m.motorcycle_id === motorcycleFilter

      return matchSearch && matchType && matchStatus && matchMoto
    })
  }, [maintenances, searchQuery, typeFilter, statusFilter, motorcycleFilter])

  /**
   * @constant groupedMaintenances
   * @description Agrupa as manutenções filtradas por moto quando o filtro de moto é "todas".
   * Cada entrada do array contém os dados da moto e a lista de manutenções vinculadas.
   * Quando uma moto específica está selecionada, retorna null (tabela plana sem agrupamento).
   */
  const groupedMaintenances = useMemo(() => {
    if (motorcycleFilter !== 'all') return null

    const groupMap: Record<string, { moto: MotorcycleOption | undefined; items: MaintenanceWithMoto[] }> = {}

    filteredMaintenances.forEach((m) => {
      if (!groupMap[m.motorcycle_id]) {
        groupMap[m.motorcycle_id] = {
          moto: motorcycles.find((mc) => mc.id === m.motorcycle_id),
          items: [],
        }
      }
      groupMap[m.motorcycle_id].items.push(m)
    })

    return Object.values(groupMap)
  }, [filteredMaintenances, motorcycleFilter, motorcycles])

  // ─── KPIs (ESTATÍSTICAS DO CABEÇALHO) ───────────────────────────────────────

  /** Mês atual no formato YYYY-MM — usado para filtrar o custo do período corrente. */
  const currentMonth = new Date().toISOString().slice(0, 7)

  /** Soma dos custos de manutenções concluídas no mês atual (card "Custo do Mês"). */
  const totalCostThisMonth = maintenances
    .filter((m) => m.completed && m.completed_date?.startsWith(currentMonth))
    .reduce((acc, m) => acc + (m.cost ?? 0), 0)

  /** Quantidade de manutenções ainda não concluídas (card "Pendentes"). */
  const totalPending = maintenances.filter((m) => !m.completed).length

  /** Quantidade de manutenções já concluídas (card "Concluídas"). */
  const totalCompleted = maintenances.filter((m) => m.completed).length

  // ─── OPTIONS DO SELECT DE MOTOS ──────────────────────────────────────────────

  /**
   * Opções do select de moto no formulário — geradas a partir da lista carregada do Supabase.
   * Primeiro item é o placeholder vazio para forçar seleção explícita.
   */
  const motorcycleSelectOptions = [
    { value: '', label: 'Selecione a moto...' },
    ...motorcycles.map((m) => ({
      value: m.id,
      label: `${m.license_plate} — ${m.make} ${m.model}`,
    })),
  ]

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-[#121212] p-6 sm:p-8">

      {/* Cabeçalho com título, subtítulo e botão de ação principal */}
      <Header
        title="Manutenção"
        subtitle="Gerencie revisões, serviços e histórico da frota"
        actions={
          // Botão primário para abrir o modal de nova manutenção — reseta o formulário antes
          <Button
            variant="primary"
            onClick={() => {
              setEditingMaintenance(null)
              setFormData(INITIAL_FORM)
              setIsFormModalOpen(true)
            }}
          >
            <Plus className="w-4 h-4" />
            Nova Manutenção
          </Button>
        }
      />

      {/* Cards de estatísticas rápidas — visão geral do estado da manutenção da frota */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* Card: custo total de manutenções concluídas no mês corrente */}
        <div className="flex items-center gap-4 rounded-2xl border border-[#474747] bg-[#202020] p-6">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#BAFF1A]/10 text-[#BAFF1A]">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#9e9e9e]">Custo do Mês</p>
            <p className="text-2xl font-bold text-[#f5f5f5]">{formatCurrency(totalCostThisMonth)}</p>
          </div>
        </div>

        {/* Card: manutenções pendentes — cor de atenção (#e65e24) indica itens que precisam de ação */}
        <div className="flex items-center gap-4 rounded-2xl border border-[#474747] bg-[#202020] p-6">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#e65e24]/10 text-[#e65e24]">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#9e9e9e]">Pendentes</p>
            <p className="text-2xl font-bold text-[#f5f5f5]">{totalPending}</p>
          </div>
        </div>

        {/* Card: manutenções concluídas — cor de sucesso (#28b438) indica histórico positivo */}
        <div className="flex items-center gap-4 rounded-2xl border border-[#474747] bg-[#202020] p-6">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#28b438]/10 text-[#28b438]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#9e9e9e]">Concluídas</p>
            <p className="text-2xl font-bold text-[#f5f5f5]">{totalCompleted}</p>
          </div>
        </div>
      </div>

      {/* Barra de filtros: busca textual + tipo + status na mesma linha */}
      <div className="flex flex-col gap-3 sm:flex-row">

        {/* Campo de busca com ícone de lupa posicionado absolutamente */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9e9e9e]" />
          <input
            type="text"
            placeholder="Buscar por descrição ou moto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#474747] bg-[#202020] py-2.5 pl-10 pr-4 text-sm text-[#f5f5f5] placeholder:text-[#616161] focus:border-[#BAFF1A] focus:outline-none"
          />
        </div>

        {/* Filtro por moto — "Todas as Motos" exibe agrupado; selecionando uma exibe lista plana */}
        <select
          value={motorcycleFilter}
          onChange={(e) => setMotorcycleFilter(e.target.value)}
          className="rounded-xl border border-[#474747] bg-[#202020] px-3 py-2.5 text-sm text-[#f5f5f5] focus:border-[#BAFF1A] focus:outline-none"
        >
          <option value="all">Todas as Motos</option>
          {motorcycles.map((m) => (
            <option key={m.id} value={m.id}>
              {m.license_plate} — {m.make} {m.model}
            </option>
          ))}
        </select>

        {/* Filtro por tipo de manutenção */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'all' | 'preventive' | 'corrective' | 'inspection')}
          className="rounded-xl border border-[#474747] bg-[#202020] px-3 py-2.5 text-sm text-[#f5f5f5] focus:border-[#BAFF1A] focus:outline-none"
        >
          <option value="all">Todos os Tipos</option>
          <option value="preventive">Preventiva</option>
          <option value="corrective">Corretiva</option>
          <option value="inspection">Vistoria</option>
        </select>

        {/* Filtro por status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'completed' | 'pending')}
          className="rounded-xl border border-[#474747] bg-[#202020] px-3 py-2.5 text-sm text-[#f5f5f5] focus:border-[#BAFF1A] focus:outline-none"
        >
          <option value="all">Todos os Status</option>
          <option value="completed">Concluída</option>
          <option value="pending">Pendente</option>
        </select>
      </div>

      {/* ─── TABELA DE MANUTENÇÕES ─────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-[#474747] bg-[#202020]">
        {loading ? (
          // Estado de carregamento — spinner centralizado enquanto aguarda o Supabase
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#BAFF1A] border-t-transparent" />
          </div>
        ) : filteredMaintenances.length === 0 ? (
          // Estado vazio — exibido quando não há registros ou nenhum bate nos filtros
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Wrench className="mb-4 h-12 w-12 text-[#474747]" />
            <p className="text-lg font-medium text-[#f5f5f5]">Nenhuma manutenção encontrada.</p>
            <p className="mt-1 text-sm text-[#9e9e9e]">
              Cadastre uma nova moto ou ajuste os filtros acima.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#f5f5f5]">

              {/* Cabeçalho da tabela — fundo escuro (#121212) e texto em caixa alta */}
              <thead className="bg-[#121212] text-xs uppercase text-[#9e9e9e]">
                <tr>
                  <th className="px-6 py-4 font-medium">Previsto</th>
                  <th className="px-6 py-4 font-medium">Moto</th>
                  <th className="px-6 py-4 font-medium">Tipo</th>
                  <th className="px-6 py-4 font-medium">Descrição</th>
                  <th className="px-6 py-4 font-medium">KM Real</th>
                  <th className="px-6 py-4 font-medium">Custo</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Ações</th>
                </tr>
              </thead>

              {/* Corpo da tabela — linhas separadas por divide e com hover sutil */}
              <tbody className="divide-y divide-[#474747]">
                {groupedMaintenances
                  ? (
                    /*
                     * Modo agrupado (filtro "Todas as Motos"):
                     * Para cada moto, exibe uma linha de cabeçalho com a placa/nome
                     * seguida pelas manutenções vinculadas a ela.
                     */
                    groupedMaintenances.map(({ moto, items }) => (
                      <>
                        {/* Linha de cabeçalho do grupo — fundo destaque e placa em negrito */}
                        <tr key={`group-${moto?.id}`} className="bg-[#2a2a2a]">
                          <td colSpan={8} className="px-6 py-2.5">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#BAFF1A]">
                              {moto
                                ? `${moto.license_plate} — ${moto.make} ${moto.model}`
                                : 'Moto desconhecida'}
                            </span>
                            <span className="ml-2 text-xs text-[#616161]">
                              ({items.length} {items.length === 1 ? 'item' : 'itens'})
                            </span>
                          </td>
                        </tr>

                        {/* Linhas de manutenção do grupo */}
                        {items.map((m) => (
                          <tr key={m.id} className="transition-colors hover:bg-[#121212]/50">
                            <td className="whitespace-nowrap px-6 py-4 font-medium text-[#f5f5f5]">
                              {m.scheduled_date
                                ? formatDate(m.scheduled_date + 'T12:00:00')
                                : m.predicted_km
                                  ? `${m.predicted_km.toLocaleString('pt-BR')} km`
                                  : '—'}
                            </td>
                            {/* Coluna de moto omitida no modo agrupado — já está no cabeçalho */}
                            <td className="whitespace-nowrap px-6 py-4 text-[#474747]">—</td>
                            <td className="px-6 py-4"><StatusBadge status={m.type} /></td>
                            <td className="px-6 py-4">{m.description}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-[#9e9e9e]">
                              {m.actual_km ? `${m.actual_km.toLocaleString('pt-BR')} km` : '—'}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-[#9e9e9e]">
                              {m.cost ? formatCurrency(m.cost) : '—'}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {m.completed ? <StatusBadge status="paid" /> : <StatusBadge status="pending" />}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {/* Editar: cor secundária (#323232) — ação neutra, vem primeiro */}
                                <Button variant="secondary" size="sm" className="h-8 w-8 p-0"
                                  onClick={() => handleOpenEdit(m)} title="Editar">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                {/* Concluir: cor primária (#BAFF1A) — ação positiva principal, aparece só em pendentes */}
                                {!m.completed && (
                                  <Button variant="primary" size="sm" className="h-8 w-8 p-0"
                                    onClick={() => handleMarkCompleted(m.id)} title="Marcar como concluída">
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                )}
                                {/* Excluir: cor danger (#bf1d1e) — ação destrutiva, sempre por último */}
                                <Button variant="danger" size="sm" className="h-8 w-8 p-0"
                                  onClick={() => { setDeletingId(m.id); setIsDeleteModalOpen(true) }} title="Excluir">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </>
                    ))
                  ) : (
                    /*
                     * Modo plano (moto específica selecionada):
                     * Exibe todas as manutenções da moto em lista simples sem agrupamento.
                     */
                    filteredMaintenances.map((m) => (
                      <tr key={m.id} className="transition-colors hover:bg-[#121212]/50">

                        {/*
                         * Previsto: data agendada para itens de vistoria (por período)
                         * ou km previsto para itens preventivos (por quilometragem).
                         */}
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-[#f5f5f5]">
                          {m.scheduled_date
                            ? formatDate(m.scheduled_date + 'T12:00:00')
                            : m.predicted_km
                              ? `${m.predicted_km.toLocaleString('pt-BR')} km`
                              : '—'}
                        </td>

                        {/* Placa + marca + modelo para identificação rápida da moto */}
                        <td className="whitespace-nowrap px-6 py-4 text-[#9e9e9e]">
                          {m.motorcycles
                            ? `${m.motorcycles.license_plate} — ${m.motorcycles.make} ${m.motorcycles.model}`
                            : '—'}
                        </td>

                        {/* Badge colorido: preventiva (roxo), corretiva (laranja), vistoria (cinza) */}
                        <td className="px-6 py-4">
                          <StatusBadge status={m.type} />
                        </td>

                        {/* Nome do item ou serviço */}
                        <td className="px-6 py-4">{m.description}</td>

                        {/* KM registrado no painel no momento do serviço */}
                        <td className="whitespace-nowrap px-6 py-4 text-[#9e9e9e]">
                          {m.actual_km ? `${m.actual_km.toLocaleString('pt-BR')} km` : '—'}
                        </td>

                        {/* Valor gasto no serviço — vazio até a manutenção ser concluída */}
                        <td className="whitespace-nowrap px-6 py-4 text-[#9e9e9e]">
                          {m.cost ? formatCurrency(m.cost) : '—'}
                        </td>

                        {/* Badge de status: "Concluída" (verde) ou "Pendente" (laranja) */}
                        <td className="whitespace-nowrap px-6 py-4">
                          {m.completed ? <StatusBadge status="paid" /> : <StatusBadge status="pending" />}
                        </td>

                        {/* Coluna de ações — ordem: Editar → Concluir → Excluir (padrão do design system) */}
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">

                            {/* Editar: cor secundária (#323232) — ação neutra, vem primeiro */}
                            <Button variant="secondary" size="sm" className="h-8 w-8 p-0"
                              onClick={() => handleOpenEdit(m)} title="Editar">
                              <Edit2 className="h-4 w-4" />
                            </Button>

                            {/* Concluir: cor primária (#BAFF1A) — ação positiva principal, aparece só em pendentes */}
                            {!m.completed && (
                              <Button variant="primary" size="sm" className="h-8 w-8 p-0"
                                onClick={() => handleMarkCompleted(m.id)} title="Marcar como concluída">
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}

                            {/* Excluir: cor danger (#bf1d1e) — ação destrutiva, sempre por último */}
                            <Button variant="danger" size="sm" className="h-8 w-8 p-0"
                              onClick={() => { setDeletingId(m.id); setIsDeleteModalOpen(true) }} title="Excluir">
                              <Trash2 className="h-4 w-4" />
                            </Button>

                          </div>
                        </td>
                      </tr>
                    ))
                  )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================================================================
          MODAIS
          =================================================================== */}

      {/* Modal: Criação e Edição de Manutenção
          Título muda dinamicamente conforme o modo. Ao fechar, reseta o formulário. */}
      <Modal
        open={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setEditingMaintenance(null)
          setFormData(INITIAL_FORM)
        }}
        title={editingMaintenance ? 'Editar Manutenção' : 'Nova Manutenção'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* Moto vinculada à manutenção */}
            <Select
              label="Motocicleta *"
              value={formData.motorcycle_id}
              onChange={(e) => setFormData({ ...formData, motorcycle_id: e.target.value })}
              options={motorcycleSelectOptions}
            />

            {/*
             * Tipo:
             * - Criação: sempre "Corretiva" (campo somente leitura) — preventivas e vistorias
             *   são criadas automaticamente pelo sistema ao cadastrar uma moto.
             * - Edição: exibe o tipo original do registro (somente leitura), sem permitir alteração.
             */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#9e9e9e]">Tipo</label>
              <div className="flex h-10 items-center rounded-xl border border-[#474747] bg-[#121212] px-3 text-sm text-[#f5f5f5]">
                {editingMaintenance
                  ? TYPE_LABEL_MAP[formData.type] || formData.type
                  : 'Corretiva'}
              </div>
            </div>

            {/* Descrição ocupa largura total (col-span-2) */}
            <div className="md:col-span-2">
              <Input
                label="Descrição *"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Troca de óleo, Revisão 10.000 km..."
              />
            </div>

            {/* Data de agendamento do serviço */}
            <Input
              label="Data Agendada"
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
            />

            {/* Quilometragem registrada no painel no momento do serviço */}
            <Input
              label="KM no Serviço"
              type="number"
              value={formData.actual_km}
              onChange={(e) => setFormData({ ...formData, actual_km: e.target.value })}
              placeholder="Ex: 15500"
            />

            {/* Custo total do serviço e peças */}
            <Input
              label="Custo (R$)"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              placeholder="0.00"
            />

            {/* Oficina ou mecânico responsável */}
            <Input
              label="Oficina / Mecânico"
              value={formData.workshop}
              onChange={(e) => setFormData({ ...formData, workshop: e.target.value })}
            />

            {/* Data de conclusão — visível apenas quando "Marcar como concluída" está ativo */}
            {formData.completed && (
              <Input
                label="Data de Conclusão"
                type="date"
                value={formData.completed_date}
                onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
              />
            )}
          </div>

          {/* Notas livres sobre o serviço, peças trocadas ou observações do mecânico */}
          <Textarea
            label="Observações"
            value={formData.observations}
            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            rows={3}
          />

          {/*
           * Checkbox de conclusão — ao marcar, preenche completed_date com hoje.
           * Ao desmarcar, limpa a data para não enviar valor incorreto ao banco.
           */}
          <label className="flex w-max cursor-pointer items-center gap-2 text-sm text-[#f5f5f5]">
            <input
              type="checkbox"
              checked={formData.completed}
              onChange={(e) => {
                const isChecked = e.target.checked
                setFormData({
                  ...formData,
                  completed: isChecked,
                  completed_date: isChecked ? new Date().toISOString().split('T')[0] : '',
                })
              }}
              className="h-4 w-4 rounded border-[#474747] bg-[#121212] text-[#BAFF1A] focus:ring-[#BAFF1A]"
            />
            Marcar como concluída
          </label>

          {/* Rodapé do modal: cancelar (secundário) e salvar (primário) */}
          <div className="flex justify-end gap-3 border-t border-[#474747] pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsFormModalOpen(false)
                setEditingMaintenance(null)
                setFormData(INITIAL_FORM)
              }}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Confirmação de Exclusão
          Tamanho "sm" — apenas texto de aviso e dois botões (cancelar / confirmar).
          A exclusão é permanente: não há soft-delete na tabela maintenances. */}
      <Modal
        open={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeletingId(null) }}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-[#c7c7c7]">
            Tem certeza que deseja excluir esta manutenção? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-3 border-t border-[#474747] pt-4">
            <Button
              variant="secondary"
              onClick={() => { setIsDeleteModalOpen(false); setDeletingId(null) }}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Excluir
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
