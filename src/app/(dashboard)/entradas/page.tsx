'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, TrendingUp } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, StatCard } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Entrada } from '@/types'

type EntradaComRelacoes = Entrada & {
  cliente_nome?: string
}

const mockEntradas: EntradaComRelacoes[] = [
  {
    id: '1',
    descricao: 'Aluguel Março — Fernanda Lima',
    valor: 1200,
    categoria: 'Aluguel',
    data: '2024-03-14',
    cliente_id: '2',
    cliente_nome: 'Fernanda Lima Oliveira',
    observacoes: '',
    created_at: '2024-03-14T10:00:00Z',
  },
  {
    id: '2',
    descricao: 'Aluguel Fevereiro — Juliana Costa',
    valor: 1500,
    categoria: 'Aluguel',
    data: '2024-02-09',
    cliente_id: '4',
    cliente_nome: 'Juliana Costa Mendes',
    observacoes: '',
    created_at: '2024-02-09T10:00:00Z',
  },
  {
    id: '3',
    descricao: 'Caução — Entrada Fernanda',
    valor: 500,
    categoria: 'Caução',
    data: '2024-01-15',
    cliente_id: '2',
    cliente_nome: 'Fernanda Lima Oliveira',
    observacoes: 'Caução referente ao contrato DEF-5678.',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '4',
    descricao: 'Taxa de documentação extra',
    valor: 150,
    categoria: 'Taxa Extra',
    data: '2024-03-05',
    cliente_id: '4',
    cliente_nome: 'Juliana Costa Mendes',
    observacoes: '',
    created_at: '2024-03-05T10:00:00Z',
  },
  {
    id: '5',
    descricao: 'Venda de peças usadas',
    valor: 320,
    categoria: 'Outros',
    data: '2024-03-10',
    observacoes: 'Peças retiradas da manutenção da GHI-9012.',
    created_at: '2024-03-10T10:00:00Z',
  },
]

const categoriaOptions = [
  { value: '', label: 'Selecione uma categoria' },
  { value: 'Aluguel', label: 'Aluguel' },
  { value: 'Taxa Extra', label: 'Taxa Extra' },
  { value: 'Caução', label: 'Caução' },
  { value: 'Outros', label: 'Outros' },
]

const clienteOptions = [
  { value: '', label: 'Nenhum (entrada geral)' },
  { value: '1', label: 'Carlos Eduardo Santos' },
  { value: '2', label: 'Fernanda Lima Oliveira' },
  { value: '3', label: 'Roberto Alves Pereira' },
  { value: '4', label: 'Juliana Costa Mendes' },
]

const categoriaBadgeVariant: Record<string, 'success' | 'info' | 'warning' | 'muted' | 'brand'> = {
  Aluguel: 'success',
  'Taxa Extra': 'info',
  Caução: 'warning',
  Outros: 'muted',
}

const defaultForm = {
  descricao: '',
  valor: '',
  categoria: '',
  data: new Date().toISOString().split('T')[0],
  cliente_id: '',
  observacoes: '',
}

export default function EntradasPage() {
  const [entradas, setEntradas] = useState<EntradaComRelacoes[]>(mockEntradas)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)

  const mesAtual = new Date().getMonth()
  const anoAtual = new Date().getFullYear()
  const totalMes = entradas
    .filter((e) => {
      const d = new Date(e.data)
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual
    })
    .reduce((sum, e) => sum + e.valor, 0)

  const totalGeral = entradas.reduce((sum, e) => sum + e.valor, 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const clienteLabel = clienteOptions.find((o) => o.value === form.cliente_id)?.label
    const novaEntrada: EntradaComRelacoes = {
      id: String(Date.now()),
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      categoria: form.categoria,
      data: form.data,
      cliente_id: form.cliente_id || undefined,
      cliente_nome: form.cliente_id ? clienteLabel : undefined,
      observacoes: form.observacoes,
      created_at: new Date().toISOString(),
    }
    setEntradas((prev) => [novaEntrada, ...prev])
    setForm(defaultForm)
    setModalOpen(false)
  }

  const columns = [
    {
      key: 'data',
      header: 'Data',
      render: (row: EntradaComRelacoes) => <span>{formatDate(row.data)}</span>,
    },
    {
      key: 'descricao',
      header: 'Descrição',
      render: (row: EntradaComRelacoes) => (
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
      render: (row: EntradaComRelacoes) => (
        <Badge variant={categoriaBadgeVariant[row.categoria] ?? 'muted'}>{row.categoria}</Badge>
      ),
    },
    {
      key: 'cliente_nome',
      header: 'Cliente',
      render: (row: EntradaComRelacoes) => (
        <span>{row.cliente_nome ?? <span className="text-[#666666]">—</span>}</span>
      ),
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (row: EntradaComRelacoes) => (
        <span className="font-semibold text-[#BAFF1A]">{formatCurrency(row.valor)}</span>
      ),
    },
    {
      key: 'acoes',
      header: 'Ações',
      render: (_row: EntradaComRelacoes) => (
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
        title="Entradas de Dinheiro"
        subtitle="Registro de receitas"
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Nova Entrada
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
            icon={<TrendingUp className="w-5 h-5" />}
            color="success"
          />
          <Card>
            <p className="text-xs text-[#666666] uppercase tracking-wider">Total Registros</p>
            <p className="text-2xl font-bold text-white mt-1">{entradas.length}</p>
            <p className="text-xs text-[#666666] mt-0.5">entradas cadastradas</p>
          </Card>
          <Card>
            <p className="text-xs text-[#666666] uppercase tracking-wider">Total Geral</p>
            <p className="text-2xl font-bold text-[#BAFF1A] mt-1">{formatCurrency(totalGeral)}</p>
            <p className="text-xs text-[#666666] mt-0.5">todas as entradas</p>
          </Card>
        </div>

        {/* Table */}
        <Card padding="none">
          <Table
            columns={columns}
            data={entradas}
            keyExtractor={(row) => row.id}
            emptyMessage="Nenhuma entrada registrada"
          />
        </Card>
      </div>

      {/* Modal Nova Entrada */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova Entrada" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Descrição"
            placeholder="Aluguel Abril — Nome do cliente"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              placeholder="1200.00"
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
            label="Cliente (opcional)"
            options={clienteOptions}
            value={form.cliente_id}
            onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
          />
          <Textarea
            label="Observações"
            placeholder="Detalhes adicionais sobre esta entrada..."
            rows={2}
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <TrendingUp className="w-4 h-4" />
              Registrar Entrada
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
