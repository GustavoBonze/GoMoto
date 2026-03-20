'use client'

/**
 * @file manutencao/page.tsx
 * @description Página de gerenciamento de manutenções da frota GoMoto.
 * Permite listar, criar, editar, concluir e excluir registros de manutenção,
 * com dados persistidos diretamente no banco de dados Supabase.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Wrench, CheckCircle2, Clock, Trash2, Edit2, Search } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Maintenance } from '@/types'

import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Table } from '@/components/ui/Table'
import { Header } from '@/components/layout/Header'

// ─── TIPOS LOCAIS ─────────────────────────────────────────────────────────────

/**
 * @type MaintenanceWithMoto
 * @description Estende a interface Maintenance com os dados da moto obtidos via join do Supabase.
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
 * Todos os campos numéricos são strings para compatibilidade com inputs HTML.
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

/** @constant INITIAL_FORM — Estado inicial do formulário para reset após salvar ou cancelar. */
const INITIAL_FORM: MaintenanceFormData = {
  motorcycle_id: '',
  type: 'preventive',
  description: '',
  scheduled_date: '',
  actual_km: '',
  cost: '',
  completed: false,
  completed_date: '',
  workshop: 'Oficina do Careca',
  observations: '',
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

/**
 * @component MaintenancePage
 * @description Página principal de manutenções. Conecta-se ao Supabase para
 * listar e gerenciar todas as manutenções da frota com CRUD completo.
 */
export default function MaintenancePage() {
  // ── Estado dos dados ────────────────────────────────────────────────────────
  const [maintenances, setMaintenances] = useState<MaintenanceWithMoto[]>([])
  const [motorcycles, setMotorcycles] = useState<MotorcycleOption[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)

  // ── Estado de filtros ───────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'preventive' | 'corrective' | 'inspection'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all')

  // ── Estado dos modais ───────────────────────────────────────────────────────
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceWithMoto | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Estado do formulário ────────────────────────────────────────────────────
  const [formData, setFormData] = useState<MaintenanceFormData>(INITIAL_FORM)

  // ─── FUNÇÕES DE BUSCA NO SUPABASE ──────────────────────────────────────────

  /**
   * @function fetchMaintenances
   * @description Busca todas as manutenções do Supabase com join na tabela motos.
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
   * @description Busca as motos disponíveis para popular o select do formulário.
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

  /** @effect Carrega manutenções e motos na montagem do componente. */
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
   * @description Cria ou atualiza uma manutenção no Supabase conforme o estado de edição.
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

        if (error) {
          console.error('Erro ao editar manutencao:', error)
          return
        }
      } else {
        const { error } = await supabase
          .from('maintenances')
          .insert([payload])

        if (error) {
          console.error('Erro ao criar manutencao:', error)
          return
        }
      }

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
   * @description Exclui permanentemente uma manutenção pelo ID armazenado em deletingId.
   */
  const handleDelete = async () => {
    if (!deletingId) return
    const supabase = createClient()
    const { error } = await supabase
      .from('maintenances')
      .delete()
      .eq('id', deletingId)

    if (error) {
      console.error('Erro ao excluir manutencao:', error)
      return
    }

    setIsDeleteModalOpen(false)
    setDeletingId(null)
    fetchMaintenances()
  }

  /**
   * @function handleMarkCompleted
   * @description Marca uma manutenção como concluída com a data de hoje.
   * @param {string} id - UUID da manutenção a ser concluída.
   */
  const handleMarkCompleted = async (id: string) => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase
      .from('maintenances')
      .update({ completed: true, completed_date: today })
      .eq('id', id)

    if (error) {
      console.error('Erro ao marcar como concluida:', error)
      return
    }
    fetchMaintenances()
  }

  /**
   * @function handleOpenEdit
   * @description Preenche o formulário com os dados da manutenção e abre o modal de edição.
   * @param {MaintenanceWithMoto} maintenance - Registro de manutenção a ser editado.
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
   * @description Aplica filtros de busca, tipo e status sobre a lista de manutenções.
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

      return matchSearch && matchType && matchStatus
    })
  }, [maintenances, searchQuery, typeFilter, statusFilter])

  // ─── ESTATÍSTICAS ────────────────────────────────────────────────────────────

  /** @constant currentMonth — Mês atual no formato YYYY-MM para filtrar custos. */
  const currentMonth = new Date().toISOString().slice(0, 7)

  /** @constant totalCostThisMonth — Soma dos custos de manutenções concluídas no mês atual. */
  const totalCostThisMonth = maintenances
    .filter((m) => m.completed && m.completed_date?.startsWith(currentMonth))
    .reduce((acc, m) => acc + (m.cost ?? 0), 0)

  /** @constant totalPending — Quantidade de manutenções pendentes. */
  const totalPending = maintenances.filter((m) => !m.completed).length

  /** @constant totalCompleted — Quantidade de manutenções concluídas. */
  const totalCompleted = maintenances.filter((m) => m.completed).length

  // ─── COLUNAS DA TABELA ──────────────────────────────────────────────────────

  const columns = [
    {
      key: 'scheduled_date',
      header: 'Data Agendada',
      render: (row: MaintenanceWithMoto) =>
        row.scheduled_date ? formatDate(row.scheduled_date + 'T12:00:00') : '—',
    },
    {
      key: 'moto',
      header: 'Moto',
      render: (row: MaintenanceWithMoto) =>
        row.motorcycles
          ? `${row.motorcycles.license_plate} — ${row.motorcycles.make} ${row.motorcycles.model}`
          : '—',
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (row: MaintenanceWithMoto) => <StatusBadge status={row.type} />,
    },
    {
      key: 'description',
      header: 'Descrição',
    },
    {
      key: 'actual_km',
      header: 'KM Real',
      render: (row: MaintenanceWithMoto) =>
        row.actual_km ? `${row.actual_km.toLocaleString('pt-BR')} km` : '—',
    },
    {
      key: 'cost',
      header: 'Custo',
      render: (row: MaintenanceWithMoto) =>
        row.cost ? formatCurrency(row.cost) : '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: MaintenanceWithMoto) =>
        row.completed ? <StatusBadge status="paid" /> : <StatusBadge status="pending" />,
    },
    {
      key: 'actions',
      header: '',
      render: (row: MaintenanceWithMoto) => (
        <div className="flex items-center gap-2">
          {!row.completed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleMarkCompleted(row.id)
              }}
              title="Marcar como concluída"
            >
              <CheckCircle2 className="w-4 h-4 text-[#BAFF1A]" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleOpenEdit(row)
            }}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setDeletingId(row.id)
              setIsDeleteModalOpen(true)
            }}
          >
            <Trash2 className="w-4 h-4 text-[#ff9c9a]" />
          </Button>
        </div>
      ),
    },
  ]

  // ─── OPTIONS DOS SELECTS ────────────────────────────────────────────────────

  const motorcycleSelectOptions = [
    { value: '', label: 'Selecione a moto...' },
    ...motorcycles.map((m) => ({
      value: m.id,
      label: `${m.license_plate} — ${m.make} ${m.model}`,
    })),
  ]

  const typeSelectOptions = [
    { value: 'preventive', label: 'Preventiva' },
    { value: 'corrective', label: 'Corretiva' },
    { value: 'inspection', label: 'Vistoria' },
  ]

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Cabeçalho da página com botão de nova manutenção */}
      <Header
        title="Manutenção"
        subtitle="Gerencie revisões, serviços e histórico da frota"
        actions={
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

      <div className="p-6 space-y-6">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#202020] border border-[#474747] rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#9e9e9e]">Custo do Mês</p>
                <p className="text-2xl font-bold text-[#f5f5f5] mt-1">
                  {formatCurrency(totalCostThisMonth)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#BAFF1A]/10 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-[#BAFF1A]" />
              </div>
            </div>
          </div>

          <div className="bg-[#202020] border border-[#474747] rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#9e9e9e]">Pendentes</p>
                <p className="text-2xl font-bold text-[#f5f5f5] mt-1">{totalPending}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#e65e24]/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#e65e24]" />
              </div>
            </div>
          </div>

          <div className="bg-[#202020] border border-[#474747] rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#9e9e9e]">Concluídas</p>
                <p className="text-2xl font-bold text-[#f5f5f5] mt-1">{totalCompleted}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#28b438]/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-[#28b438]" />
              </div>
            </div>
          </div>
        </div>

        {/* Barra de filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9e9e9e]" />
            <input
              type="text"
              placeholder="Buscar por descrição ou moto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#202020] border border-[#474747] rounded-xl text-sm text-[#f5f5f5] placeholder:text-[#616161] focus:outline-none focus:border-[#BAFF1A]"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as 'all' | 'preventive' | 'corrective' | 'inspection')
            }
            className="px-3 py-2.5 bg-[#202020] border border-[#474747] rounded-xl text-sm text-[#f5f5f5] focus:outline-none focus:border-[#BAFF1A]"
          >
            <option value="all">Todos os Tipos</option>
            <option value="preventive">Preventiva</option>
            <option value="corrective">Corretiva</option>
            <option value="inspection">Vistoria</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | 'completed' | 'pending')
            }
            className="px-3 py-2.5 bg-[#202020] border border-[#474747] rounded-xl text-sm text-[#f5f5f5] focus:outline-none focus:border-[#BAFF1A]"
          >
            <option value="all">Todos os Status</option>
            <option value="completed">Concluída</option>
            <option value="pending">Pendente</option>
          </select>
        </div>

        {/* Tabela de manutenções */}
        <div className="bg-[#202020] border border-[#474747] rounded-2xl overflow-hidden">
          <Table
            columns={columns}
            data={filteredMaintenances}
            keyExtractor={(row) => row.id}
            loading={loading}
            emptyMessage="Nenhuma manutenção encontrada."
          />
        </div>
      </div>

      {/* Modal de criação e edição */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seleção da moto */}
            <Select
              label="Motocicleta *"
              value={formData.motorcycle_id}
              onChange={(e) =>
                setFormData({ ...formData, motorcycle_id: e.target.value })
              }
              options={motorcycleSelectOptions}
            />

            {/* Tipo de manutenção */}
            <Select
              label="Tipo *"
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as 'preventive' | 'corrective' | 'inspection',
                })
              }
              options={typeSelectOptions}
            />

            {/* Descrição — ocupa largura total */}
            <div className="md:col-span-2">
              <Input
                label="Descrição *"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ex: Troca de óleo, Revisão 10.000 km..."
              />
            </div>

            {/* Data agendada */}
            <Input
              label="Data Agendada"
              type="date"
              value={formData.scheduled_date}
              onChange={(e) =>
                setFormData({ ...formData, scheduled_date: e.target.value })
              }
            />

            {/* KM no serviço */}
            <Input
              label="KM no Serviço"
              type="number"
              value={formData.actual_km}
              onChange={(e) =>
                setFormData({ ...formData, actual_km: e.target.value })
              }
              placeholder="Ex: 15500"
            />

            {/* Custo */}
            <Input
              label="Custo (R$)"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: e.target.value })
              }
              placeholder="0.00"
            />

            {/* Oficina */}
            <Input
              label="Oficina / Mecânico"
              value={formData.workshop}
              onChange={(e) =>
                setFormData({ ...formData, workshop: e.target.value })
              }
            />

            {/* Data de conclusão — visível apenas se marcado como concluído */}
            {formData.completed && (
              <Input
                label="Data de Conclusão"
                type="date"
                value={formData.completed_date}
                onChange={(e) =>
                  setFormData({ ...formData, completed_date: e.target.value })
                }
              />
            )}
          </div>

          {/* Observações */}
          <Textarea
            label="Observações"
            value={formData.observations}
            onChange={(e) =>
              setFormData({ ...formData, observations: e.target.value })
            }
            rows={3}
          />

          {/* Checkbox de conclusão */}
          <label className="flex items-center gap-2 text-sm text-[#f5f5f5] cursor-pointer w-max">
            <input
              type="checkbox"
              checked={formData.completed}
              onChange={(e) => {
                const isChecked = e.target.checked
                setFormData({
                  ...formData,
                  completed: isChecked,
                  completed_date: isChecked
                    ? new Date().toISOString().split('T')[0]
                    : '',
                })
              }}
              className="w-4 h-4 rounded border-[#474747] bg-[#121212] text-[#BAFF1A] focus:ring-[#BAFF1A]"
            />
            Marcar como concluída
          </label>

          {/* Ações do formulário */}
          <div className="flex justify-end gap-3 pt-2">
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

      {/* Modal de confirmação de exclusão */}
      <Modal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeletingId(null)
        }}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-[#c7c7c7]">
            Tem certeza que deseja excluir esta manutenção? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false)
                setDeletingId(null)
              }}
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
