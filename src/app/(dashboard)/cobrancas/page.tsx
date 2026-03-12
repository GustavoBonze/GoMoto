'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, DollarSign } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Cobranca, CobrancaStatus } from '@/types'

type CobrancaComRelacoes = Cobranca & {
  cliente_nome: string
}

const mockCobrancas: CobrancaComRelacoes[] = [
  {
    id: '1',
    contrato_id: '1',
    cliente_id: '2',
    descricao: 'Aluguel — Março/2024',
    valor: 1200,
    vencimento: '2024-03-15',
    status: 'pago',
    data_pagamento: '2024-03-14',
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-14T10:00:00Z',
    cliente_nome: 'Fernanda Lima Oliveira',
  },
  {
    id: '2',
    contrato_id: '2',
    cliente_id: '4',
    descricao: 'Aluguel — Março/2024',
    valor: 1500,
    vencimento: '2024-03-10',
    status: 'pendente',
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-01T10:00:00Z',
    cliente_nome: 'Juliana Costa Mendes',
  },
  {
    id: '3',
    contrato_id: '1',
    cliente_id: '2',
    descricao: 'Taxa extra — Documentação',
    valor: 150,
    vencimento: '2024-02-28',
    status: 'vencido',
    created_at: '2024-02-15T10:00:00Z',
    updated_at: '2024-02-15T10:00:00Z',
    cliente_nome: 'Fernanda Lima Oliveira',
  },
  {
    id: '4',
    contrato_id: '2',
    cliente_id: '4',
    descricao: 'Aluguel — Fevereiro/2024',
    valor: 1500,
    vencimento: '2024-02-10',
    status: 'pago',
    data_pagamento: '2024-02-09',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-09T10:00:00Z',
    cliente_nome: 'Juliana Costa Mendes',
  },
  {
    id: '5',
    contrato_id: '1',
    cliente_id: '2',
    descricao: 'Caução — Entrada do contrato',
    valor: 500,
    vencimento: '2024-01-15',
    status: 'pago',
    data_pagamento: '2024-01-15',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    cliente_nome: 'Fernanda Lima Oliveira',
  },
]

const tabs = [
  { label: 'Todas', value: 'todas' },
  { label: 'Pendentes', value: 'pendente' },
  { label: 'Vencidas', value: 'vencido' },
  { label: 'Pagas', value: 'pago' },
]

const clienteOptions = [
  { value: '', label: 'Selecione um cliente' },
  { value: '1', label: 'Carlos Eduardo Santos' },
  { value: '2', label: 'Fernanda Lima Oliveira' },
  { value: '3', label: 'Roberto Alves Pereira' },
  { value: '4', label: 'Juliana Costa Mendes' },
]

const contratoOptions = [
  { value: '', label: 'Selecione um contrato' },
  { value: '1', label: 'Fernanda — DEF-5678 (Ativo)' },
  { value: '2', label: 'Juliana — JKL-3456 (Ativo)' },
]

const defaultForm = {
  cliente_id: '',
  contrato_id: '',
  descricao: '',
  valor: '',
  vencimento: '',
  observacoes: '',
}

export default function CobrancasPage() {
  const [cobrancas, setCobrancas] = useState<CobrancaComRelacoes[]>(mockCobrancas)
  const [activeTab, setActiveTab] = useState('todas')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)

  const filtered =
    activeTab === 'todas' ? cobrancas : cobrancas.filter((c) => c.status === activeTab)

  function handleMarcarPago(id: string) {
    setCobrancas((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: 'pago' as CobrancaStatus, data_pagamento: new Date().toISOString().split('T')[0] }
          : c
      )
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const clienteLabel = clienteOptions.find((o) => o.value === form.cliente_id)?.label ?? ''
    const novaCobranca: CobrancaComRelacoes = {
      id: String(Date.now()),
      contrato_id: form.contrato_id,
      cliente_id: form.cliente_id,
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      vencimento: form.vencimento,
      status: 'pendente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cliente_nome: clienteLabel,
    }
    setCobrancas((prev) => [novaCobranca, ...prev])
    setForm(defaultForm)
    setModalOpen(false)
  }

  const totalPendente = cobrancas
    .filter((c) => c.status === 'pendente' || c.status === 'vencido')
    .reduce((sum, c) => sum + c.valor, 0)

  const totalPago = cobrancas
    .filter((c) => c.status === 'pago')
    .reduce((sum, c) => sum + c.valor, 0)

  const columns = [
    {
      key: 'cliente_nome',
      header: 'Cliente',
      render: (row: CobrancaComRelacoes) => (
        <span className="font-medium text-white">{row.cliente_nome}</span>
      ),
    },
    {
      key: 'descricao',
      header: 'Descrição',
      render: (row: CobrancaComRelacoes) => <span>{row.descricao}</span>,
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (row: CobrancaComRelacoes) => (
        <span className="font-semibold text-white">{formatCurrency(row.valor)}</span>
      ),
    },
    {
      key: 'vencimento',
      header: 'Vencimento',
      render: (row: CobrancaComRelacoes) => <span>{formatDate(row.vencimento)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: CobrancaComRelacoes) => <StatusBadge status={row.status} />,
    },
    {
      key: 'data_pagamento',
      header: 'Dt. Pagamento',
      render: (row: CobrancaComRelacoes) => (
        <span>{row.data_pagamento ? formatDate(row.data_pagamento) : '—'}</span>
      ),
    },
    {
      key: 'acoes',
      header: 'Ações',
      render: (row: CobrancaComRelacoes) => (
        <div className="flex items-center gap-1">
          {row.status !== 'pago' && (
            <button
              onClick={() => handleMarcarPago(row.id)}
              title="Marcar como pago"
              className="p-1.5 rounded-lg text-green-400 hover:text-green-300 hover:bg-green-500/10 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
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
        title="Cobranças"
        subtitle="Controle de recebimentos"
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Nova Cobrança
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <p className="text-xs text-[#666666] uppercase tracking-wider">A Receber</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{formatCurrency(totalPendente)}</p>
            <p className="text-xs text-[#666666] mt-0.5">
              {cobrancas.filter((c) => c.status === 'pendente' || c.status === 'vencido').length} cobranças
            </p>
          </Card>
          <Card>
            <p className="text-xs text-[#666666] uppercase tracking-wider">Recebido</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(totalPago)}</p>
            <p className="text-xs text-[#666666] mt-0.5">
              {cobrancas.filter((c) => c.status === 'pago').length} cobranças
            </p>
          </Card>
          <Card>
            <p className="text-xs text-[#666666] uppercase tracking-wider">Vencidas</p>
            <p className="text-2xl font-bold text-red-400 mt-1">
              {formatCurrency(
                cobrancas.filter((c) => c.status === 'vencido').reduce((s, c) => s + c.valor, 0)
              )}
            </p>
            <p className="text-xs text-[#666666] mt-0.5">
              {cobrancas.filter((c) => c.status === 'vencido').length} cobranças
            </p>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
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
              {tab.value !== 'todas' && (
                <span className="ml-1.5 opacity-70">
                  ({cobrancas.filter((c) => c.status === tab.value).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <Card padding="none">
          <Table
            columns={columns}
            data={filtered}
            keyExtractor={(row) => row.id}
            emptyMessage="Nenhuma cobrança encontrada"
          />
        </Card>
      </div>

      {/* Modal Nova Cobrança */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova Cobrança" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Cliente"
            options={clienteOptions}
            value={form.cliente_id}
            onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
            required
          />
          <Select
            label="Contrato"
            options={contratoOptions}
            value={form.contrato_id}
            onChange={(e) => setForm({ ...form, contrato_id: e.target.value })}
          />
          <Input
            label="Descrição"
            placeholder="Aluguel — Abril/2024"
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
              label="Vencimento"
              type="date"
              value={form.vencimento}
              onChange={(e) => setForm({ ...form, vencimento: e.target.value })}
              required
            />
          </div>
          <Textarea
            label="Observações"
            placeholder="Informações adicionais..."
            rows={2}
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <DollarSign className="w-4 h-4" />
              Criar Cobrança
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
