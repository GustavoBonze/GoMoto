'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, TrendingDown } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, StatCard } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Despesa } from '@/types'

type DespesaComRelacoes = Despesa & {
  moto_placa?: string
}

const mockDespesas: DespesaComRelacoes[] = [
  {
    id: '1',
    descricao: 'Troca de pneus — GHI-9012',
    valor: 480,
    categoria: 'Peças',
    data: '2024-03-08',
    moto_id: '3',
    moto_placa: 'GHI-9012',
    observacoes: 'Dois pneus novos, dianteiro e traseiro.',
    created_at: '2024-03-08T10:00:00Z',
  },
  {
    id: '2',
    descricao: 'IPVA 2024 — ABC-1234',
    valor: 650,
    categoria: 'Impostos',
    data: '2024-02-15',
    moto_id: '1',
    moto_placa: 'ABC-1234',
    observacoes: '',
    created_at: '2024-02-15T10:00:00Z',
  },
  {
    id: '3',
    descricao: 'Revisão geral — MNO-7890',
    valor: 350,
    categoria: 'Manutenção',
    data: '2024-03-01',
    moto_id: '5',
    moto_placa: 'MNO-7890',
    observacoes: 'Troca de óleo, filtros e correia.',
    created_at: '2024-03-01T10:00:00Z',
  },
  {
    id: '4',
    descricao: 'Seguro anual — frota',
    valor: 1200,
    categoria: 'Seguro',
    data: '2024-01-10',
    observacoes: 'Seguro cobrindo toda a frota pelo período de 12 meses.',
    created_at: '2024-01-10T10:00:00Z',
  },
]

const categoriaOptions = [
  { value: '', label: 'Selecione uma categoria' },
  { value: 'Combustível', label: 'Combustível' },
  { value: 'Peças', label: 'Peças' },
  { value: 'Manutenção', label: 'Manutenção' },
  { value: 'Impostos', label: 'Impostos' },
  { value: 'Seguro', label: 'Seguro' },
  { value: 'Outros', label: 'Outros' },
]

const motoOptions = [
  { value: '', label: 'Nenhuma (despesa geral)' },
  { value: '1', label: 'ABC-1234 — Honda CG 160 Titan' },
  { value: '2', label: 'DEF-5678 — Honda Biz 125' },
  { value: '3', label: 'GHI-9012 — Yamaha Factor 150' },
  { value: '4', label: 'JKL-3456 — Honda NXR 160 Bros' },
  { value: '5', label: 'MNO-7890 — Yamaha Crosser 150' },
]

const categoriaBadgeVariant: Record<string, 'danger' | 'warning' | 'info' | 'muted' | 'brand'> = {
  Combustível: 'warning',
  Peças: 'danger',
  Manutenção: 'warning',
  Impostos: 'danger',
  Seguro: 'info',
  Outros: 'muted',
}

const defaultForm = {
  descricao: '',
  valor: '',
  categoria: '',
  data: new Date().toISOString().split('T')[0],
  moto_id: '',
  observacoes: '',
}

export default function DespesasPage() {
  const [despesas, setDespesas] = useState<DespesaComRelacoes[]>(mockDespesas)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)

  const mesAtual = new Date().getMonth()
  const anoAtual = new Date().getFullYear()
  const totalMes = despesas
    .filter((d) => {
      const dt = new Date(d.data)
      return dt.getMonth() === mesAtual && dt.getFullYear() === anoAtual
    })
    .reduce((sum, d) => sum + d.valor, 0)

  const totalGeral = despesas.reduce((sum, d) => sum + d.valor, 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const motoLabel = motoOptions.find((o) => o.value === form.moto_id)?.label
    const novaDespesa: DespesaComRelacoes = {
      id: String(Date.now()),
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      categoria: form.categoria,
      data: form.data,
      moto_id: form.moto_id || undefined,
      moto_placa: form.moto_id ? motoLabel?.split(' — ')[0] : undefined,
      observacoes: form.observacoes,
      created_at: new Date().toISOString(),
    }
    setDespesas((prev) => [novaDespesa, ...prev])
    setForm(defaultForm)
    setModalOpen(false)
  }

  const columns = [
    {
      key: 'data',
      header: 'Data',
      render: (row: DespesaComRelacoes) => <span>{formatDate(row.data)}</span>,
    },
    {
      key: 'descricao',
      header: 'Descrição',
      render: (row: DespesaComRelacoes) => (
        <div>
          <p className="font-medium text-white">{row.descricao}</p>
          {row.observacoes && (
            <p className="text-xs text-[#666666] mt-0.5 line-clamp-1">{row.observacoes}</p>
          )}
        </div>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoria',
      render: (row: DespesaComRelacoes) => (
        <Badge variant={categoriaBadgeVariant[row.categoria] ?? 'muted'}>{row.categoria}</Badge>
      ),
    },
    {
      key: 'moto_placa',
      header: 'Moto',
      render: (row: DespesaComRelacoes) => (
        <span className="font-mono text-sm">
          {row.moto_placa ?? <span className="text-[#666666]">—</span>}
        </span>
      ),
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (row: DespesaComRelacoes) => (
        <span className="font-semibold text-red-400">{formatCurrency(row.valor)}</span>
      ),
    },
    {
      key: 'acoes',
      header: 'Ações',
      render: (_row: DespesaComRelacoes) => (
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

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Despesas"
        subtitle="Registro de gastos e custos"
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Nova Despesa
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total do Mês"
            value={formatCurrency(totalMes)}
            subtitle="Mês atual"
            icon={<TrendingDown className="w-5 h-5" />}
            color="danger"
          />
          <Card>
            <p className="text-xs text-[#666666] uppercase tracking-wider">Total Registros</p>
            <p className="text-2xl font-bold text-white mt-1">{despesas.length}</p>
            <p className="text-xs text-[#666666] mt-0.5">despesas cadastradas</p>
          </Card>
          <Card>
            <p className="text-xs text-[#666666] uppercase tracking-wider">Total Geral</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalGeral)}</p>
            <p className="text-xs text-[#666666] mt-0.5">todas as despesas</p>
          </Card>
        </div>

        {/* Table */}
        <Card padding="none">
          <Table
            columns={columns}
            data={despesas}
            keyExtractor={(row) => row.id}
            emptyMessage="Nenhuma despesa registrada"
          />
        </Card>
      </div>

      {/* Modal Nova Despesa */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova Despesa" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Descrição"
            placeholder="Troca de óleo — ABC-1234"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              placeholder="350.00"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              required
            />
            <Input
              label="Data"
              type="date"
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
              required
            />
          </div>
          <Select
            label="Categoria"
            options={categoriaOptions}
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            required
          />
          <Select
            label="Moto (opcional)"
            options={motoOptions}
            value={form.moto_id}
            onChange={(e) => setForm({ ...form, moto_id: e.target.value })}
          />
          <Textarea
            label="Observações"
            placeholder="Detalhes adicionais sobre esta despesa..."
            rows={2}
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger">
              <TrendingDown className="w-4 h-4" />
              Registrar Despesa
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
