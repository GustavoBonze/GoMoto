'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Wrench, CheckSquare, Square } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Manutencao } from '@/types'

type ManutencaoComRelacoes = Manutencao & {
  moto_placa: string
  moto_modelo: string
}

const mockManutencoes: ManutencaoComRelacoes[] = [
  {
    id: '1',
    moto_id: '3',
    tipo: 'corretiva',
    descricao: 'Troca de pneus dianteiro e traseiro',
    data_agendada: '2024-03-08',
    data_realizada: '2024-03-08',
    custo: 480,
    realizada: true,
    observacoes: 'Pneus com desgaste excessivo.',
    created_at: '2024-03-05T10:00:00Z',
    moto_placa: 'GHI-9012',
    moto_modelo: 'Yamaha Factor 150',
  },
  {
    id: '2',
    moto_id: '5',
    tipo: 'preventiva',
    descricao: 'Revisão dos 10.000 km — troca de óleo e filtros',
    data_agendada: '2024-03-01',
    data_realizada: '2024-03-01',
    custo: 350,
    realizada: true,
    observacoes: '',
    created_at: '2024-02-28T10:00:00Z',
    moto_placa: 'MNO-7890',
    moto_modelo: 'Yamaha Crosser 150',
  },
  {
    id: '3',
    moto_id: '1',
    tipo: 'vistoria',
    descricao: 'Vistoria obrigatória DETRAN',
    data_agendada: '2024-04-15',
    custo: 0,
    realizada: false,
    observacoes: 'Agendar com antecedência.',
    created_at: '2024-03-10T10:00:00Z',
    moto_placa: 'ABC-1234',
    moto_modelo: 'Honda CG 160 Titan',
  },
  {
    id: '4',
    moto_id: '2',
    tipo: 'preventiva',
    descricao: 'Troca de correia de distribuição',
    data_agendada: '2024-04-20',
    custo: 220,
    realizada: false,
    observacoes: 'Correia com vida útil próxima do fim.',
    created_at: '2024-03-12T10:00:00Z',
    moto_placa: 'DEF-5678',
    moto_modelo: 'Honda Biz 125',
  },
]

const motoOptions = [
  { value: '', label: 'Selecione uma moto' },
  { value: '1', label: 'ABC-1234 — Honda CG 160 Titan' },
  { value: '2', label: 'DEF-5678 — Honda Biz 125' },
  { value: '3', label: 'GHI-9012 — Yamaha Factor 150' },
  { value: '4', label: 'JKL-3456 — Honda NXR 160 Bros' },
  { value: '5', label: 'MNO-7890 — Yamaha Crosser 150' },
]

const tipoOptions = [
  { value: 'preventiva', label: 'Preventiva' },
  { value: 'corretiva', label: 'Corretiva' },
  { value: 'vistoria', label: 'Vistoria' },
]

const defaultForm = {
  moto_id: '',
  tipo: 'preventiva',
  descricao: '',
  data_agendada: '',
  custo: '',
  observacoes: '',
}

export default function ManutencaoPage() {
  const [manutencoes, setManutencoes] = useState<ManutencaoComRelacoes[]>(mockManutencoes)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)

  const agendadas = manutencoes.filter((m) => !m.realizada)
  const historico = manutencoes.filter((m) => m.realizada)

  function handleToggleRealizada(id: string) {
    setManutencoes((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              realizada: !m.realizada,
              data_realizada: !m.realizada ? new Date().toISOString().split('T')[0] : undefined,
            }
          : m
      )
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const motoLabel = motoOptions.find((o) => o.value === form.moto_id)?.label ?? ''
    const motoInfo = motoLabel.split(' — ')

    const novaManutencao: ManutencaoComRelacoes = {
      id: String(Date.now()),
      moto_id: form.moto_id,
      tipo: form.tipo as 'preventiva' | 'corretiva' | 'vistoria',
      descricao: form.descricao,
      data_agendada: form.data_agendada,
      custo: form.custo ? parseFloat(form.custo) : 0,
      realizada: false,
      observacoes: form.observacoes,
      created_at: new Date().toISOString(),
      moto_placa: motoInfo[0] ?? '',
      moto_modelo: motoInfo[1] ?? '',
    }
    setManutencoes((prev) => [novaManutencao, ...prev])
    setForm(defaultForm)
    setModalOpen(false)
  }

  const makeColumns = (showRealizada = false) => [
    {
      key: 'moto',
      header: 'Moto',
      render: (row: ManutencaoComRelacoes) => (
        <div>
          <p className="font-mono text-sm font-semibold text-white">{row.moto_placa}</p>
          <p className="text-xs text-[#666666]">{row.moto_modelo}</p>
        </div>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (row: ManutencaoComRelacoes) => <StatusBadge status={row.tipo} />,
    },
    {
      key: 'descricao',
      header: 'Descrição',
      render: (row: ManutencaoComRelacoes) => (
        <div className="max-w-xs">
          <p className="text-white">{row.descricao}</p>
          {row.observacoes && (
            <p className="text-xs text-[#666666] mt-0.5 line-clamp-1">{row.observacoes}</p>
          )}
        </div>
      ),
    },
    {
      key: 'data',
      header: showRealizada ? 'Data Realizada' : 'Data Agendada',
      render: (row: ManutencaoComRelacoes) => (
        <span>
          {showRealizada
            ? row.data_realizada
              ? formatDate(row.data_realizada)
              : '—'
            : row.data_agendada
            ? formatDate(row.data_agendada)
            : '—'}
        </span>
      ),
    },
    {
      key: 'custo',
      header: 'Custo',
      render: (row: ManutencaoComRelacoes) => (
        <span className={row.custo && row.custo > 0 ? 'text-red-400 font-medium' : 'text-[#666666]'}>
          {row.custo && row.custo > 0 ? formatCurrency(row.custo) : '—'}
        </span>
      ),
    },
    {
      key: 'realizada',
      header: 'Realizada',
      render: (row: ManutencaoComRelacoes) => (
        <button
          onClick={() => handleToggleRealizada(row.id)}
          className="flex items-center gap-1.5 text-sm transition-colors"
          title="Clique para alternar"
        >
          {row.realizada ? (
            <>
              <CheckSquare className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Sim</span>
            </>
          ) : (
            <>
              <Square className="w-4 h-4 text-[#666666]" />
              <span className="text-[#666666]">Não</span>
            </>
          )}
        </button>
      ),
    },
    {
      key: 'acoes',
      header: 'Ações',
      render: (_row: ManutencaoComRelacoes) => (
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  const custoTotal = historico.reduce((sum, m) => sum + (m.custo ?? 0), 0)

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Manutenção"
        subtitle="Agendamentos e histórico"
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Registrar Manutenção
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <p className="text-xs text-[#666666] uppercase tracking-wider">Agendadas</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{agendadas.length}</p>
          </Card>
          <Card>
            <p className="text-xs text-[#666666] uppercase tracking-wider">Realizadas</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{historico.length}</p>
          </Card>
          <Card>
            <p className="text-xs text-[#666666] uppercase tracking-wider">Custo Total</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(custoTotal)}</p>
          </Card>
        </div>

        {/* Agendadas */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-white">Agendadas</h2>
            {agendadas.length > 0 && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/12 text-amber-400 border border-amber-500/20">
                {agendadas.length}
              </span>
            )}
          </div>
          <Card padding="none">
            <Table
              columns={makeColumns(false)}
              data={agendadas}
              keyExtractor={(row) => row.id}
              emptyMessage="Nenhuma manutenção agendada"
            />
          </Card>
        </div>

        {/* Histórico */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-green-400" />
            <h2 className="text-base font-semibold text-white">Histórico</h2>
            {historico.length > 0 && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/12 text-green-400 border border-green-500/20">
                {historico.length}
              </span>
            )}
          </div>
          <Card padding="none">
            <Table
              columns={makeColumns(true)}
              data={historico}
              keyExtractor={(row) => row.id}
              emptyMessage="Nenhuma manutenção realizada ainda"
            />
          </Card>
        </div>
      </div>

      {/* Modal Registrar Manutenção */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Manutenção" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Moto"
            options={motoOptions}
            value={form.moto_id}
            onChange={(e) => setForm({ ...form, moto_id: e.target.value })}
            required
          />
          <Select
            label="Tipo"
            options={tipoOptions}
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          />
          <Input
            label="Descrição"
            placeholder="Troca de óleo e filtros"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data Agendada"
              type="date"
              value={form.data_agendada}
              onChange={(e) => setForm({ ...form, data_agendada: e.target.value })}
            />
            <Input
              label="Custo Estimado (R$)"
              type="number"
              step="0.01"
              placeholder="350.00"
              value={form.custo}
              onChange={(e) => setForm({ ...form, custo: e.target.value })}
            />
          </div>
          <Textarea
            label="Observações"
            placeholder="Detalhes adicionais sobre a manutenção..."
            rows={3}
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Wrench className="w-4 h-4" />
              Registrar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
