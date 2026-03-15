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
import type { Multa, MultaStatus } from '@/types'

type MultaComRelacoes = Multa & {
  cliente_nome: string
  moto_placa: string
}

const mockMultas: MultaComRelacoes[] = [
  {
    id: '1',
    cliente_id: '2',
    moto_id: '2',
    descricao: 'Excesso de velocidade — Av. Paulista',
    valor: 293.47,
    data_infração: '2024-02-20',
    status: 'pendente',
    responsavel: 'cliente',
    observacoes: 'AIT nº 12345678. Infração registrada pelo DETRAN.',
    created_at: '2024-02-25T10:00:00Z',
    cliente_nome: 'Fernanda Lima Oliveira',
    moto_placa: 'DEF-5678',
  },
  {
    id: '2',
    cliente_id: '4',
    moto_id: '4',
    descricao: 'Estacionamento irregular',
    valor: 195.23,
    data_infração: '2024-01-10',
    status: 'pago',
    data_pagamento: '2024-01-20',
    responsavel: 'cliente',
    observacoes: '',
    created_at: '2024-01-15T10:00:00Z',
    cliente_nome: 'Juliana Costa Mendes',
    moto_placa: 'JKL-3456',
  },
  {
    id: '3',
    cliente_id: '1',
    moto_id: '1',
    descricao: 'Licenciamento atrasado — responsabilidade da empresa',
    valor: 130.16,
    data_infração: '2024-03-01',
    status: 'pendente',
    responsavel: 'empresa',
    observacoes: 'Empresa responsável pelo atraso no licenciamento.',
    created_at: '2024-03-05T10:00:00Z',
    cliente_nome: 'Carlos Eduardo Santos',
    moto_placa: 'ABC-1234',
  },
]

const clienteOptions = [
  { value: '', label: 'Selecione um cliente' },
  { value: '1', label: 'Carlos Eduardo Santos' },
  { value: '2', label: 'Fernanda Lima Oliveira' },
  { value: '3', label: 'Roberto Alves Pereira' },
  { value: '4', label: 'Juliana Costa Mendes' },
]

const motoOptions = [
  { value: '', label: 'Selecione uma moto' },
  { value: '1', label: 'ABC-1234 — Honda CG 160 Titan' },
  { value: '2', label: 'DEF-5678 — Honda Biz 125' },
  { value: '3', label: 'GHI-9012 — Yamaha Factor 150' },
  { value: '4', label: 'JKL-3456 — Honda NXR 160 Bros' },
  { value: '5', label: 'MNO-7890 — Yamaha Crosser 150' },
]

const responsavelOptions = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'empresa', label: 'Empresa' },
]

const defaultForm = {
  cliente_id: '',
  moto_id: '',
  descricao: '',
  valor: '',
  data_infração: '',
  responsavel: 'cliente',
  observacoes: '',
}

export default function MultasPage() {
  const [multas, setMultas] = useState<MultaComRelacoes[]>(mockMultas)
  const [modalOpen, setModalOpen] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [excluindo, setExcluindo] = useState<MultaComRelacoes | null>(null)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todas')

  const tabsStatus = [
    { label: 'Todas', value: 'todas' },
    { label: 'Pendentes', value: 'pendente' },
    { label: 'Pagas', value: 'pago' },
    { label: 'Cliente', value: 'cliente' },
    { label: 'Empresa', value: 'empresa' },
  ]

  const multasFiltradas = multas.filter((m) => {
    const passaBusca = !busca || (() => {
      const q = busca.toLowerCase()
      return (
        m.cliente_nome.toLowerCase().includes(q) ||
        m.moto_placa.toLowerCase().includes(q) ||
        m.descricao.toLowerCase().includes(q)
      )
    })()
    const passFiltro =
      filtroStatus === 'todas' ? true :
      filtroStatus === 'cliente' || filtroStatus === 'empresa' ? m.responsavel === filtroStatus :
      m.status === filtroStatus
    return passaBusca && passFiltro
  })

  function abrirNova() {
    setEditandoId(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  function abrirEdicao(row: MultaComRelacoes) {
    setEditandoId(row.id)
    setForm({
      cliente_id: row.cliente_id,
      moto_id: row.moto_id,
      descricao: row.descricao,
      valor: String(row.valor),
      data_infração: row.data_infração,
      responsavel: row.responsavel,
      observacoes: row.observacoes ?? '',
    })
    setModalOpen(true)
  }

  function handleMarcarPago(id: string) {
    setMultas((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: 'pago' as MultaStatus, data_pagamento: new Date().toISOString().split('T')[0] }
          : m
      )
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const clienteLabel = clienteOptions.find((o) => o.value === form.cliente_id)?.label ?? ''
    const motoLabel = motoOptions.find((o) => o.value === form.moto_id)?.label ?? ''

    if (editandoId) {
      setMultas((prev) =>
        prev.map((m) =>
          m.id === editandoId
            ? {
                ...m,
                cliente_id: form.cliente_id,
                moto_id: form.moto_id,
                descricao: form.descricao,
                valor: parseFloat(form.valor),
                data_infração: form.data_infração,
                responsavel: form.responsavel as 'cliente' | 'empresa',
                observacoes: form.observacoes,
                cliente_nome: clienteLabel,
                moto_placa: motoLabel.split(' — ')[0] ?? m.moto_placa,
              }
            : m
        )
      )
    } else {
      const novaMulta: MultaComRelacoes = {
        id: String(Date.now()),
        cliente_id: form.cliente_id,
        moto_id: form.moto_id,
        descricao: form.descricao,
        valor: parseFloat(form.valor),
        data_infração: form.data_infração,
        status: 'pendente',
        responsavel: form.responsavel as 'cliente' | 'empresa',
        observacoes: form.observacoes,
        created_at: new Date().toISOString(),
        cliente_nome: clienteLabel,
        moto_placa: motoLabel.split(' — ')[0] ?? '',
      }
      setMultas((prev) => [novaMulta, ...prev])
    }

    setForm(defaultForm)
    setModalOpen(false)
  }

  function confirmarExclusao() {
    if (!excluindo) return
    setMultas((prev) => prev.filter((m) => m.id !== excluindo.id))
    setExcluindo(null)
  }

  const totalPendente = multas
    .filter((m) => m.status === 'pendente')
    .reduce((sum, m) => sum + m.valor, 0)

  const columns = [
    {
      key: 'cliente_nome',
      header: 'Cliente',
      render: (row: MultaComRelacoes) => (
        <span className="font-medium text-white">{row.cliente_nome}</span>
      ),
    },
    {
      key: 'moto_placa',
      header: 'Moto',
      render: (row: MultaComRelacoes) => (
        <span className="font-mono text-sm">{row.moto_placa}</span>
      ),
    },
    {
      key: 'descricao',
      header: 'Descrição',
      render: (row: MultaComRelacoes) => (
        <div className="max-w-xs">
          <p className="text-white line-clamp-1">{row.descricao}</p>
          {row.observacoes && (
            <p className="text-xs text-[#A0A0A0] mt-0.5 line-clamp-1">{row.observacoes}</p>
          )}
        </div>
      ),
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (row: MultaComRelacoes) => (
        <span className="font-semibold text-red-400">{formatCurrency(row.valor)}</span>
      ),
    },
    {
      key: 'data_infração',
      header: 'Data Infração',
      render: (row: MultaComRelacoes) => <span>{formatDate(row.data_infração)}</span>,
    },
    {
      key: 'responsavel',
      header: 'Responsável',
      render: (row: MultaComRelacoes) => <StatusBadge status={row.responsavel} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: MultaComRelacoes) => <StatusBadge status={row.status} />,
    },
    {
      key: 'acoes',
      header: 'Ações',
      render: (row: MultaComRelacoes) => (
        <div className="flex items-center gap-1">
          {row.status === 'pendente' && (
            <button
              onClick={() => handleMarcarPago(row.id)}
              title="Marcar como pago"
              className="p-1.5 rounded-lg text-green-400 hover:text-green-300 hover:bg-green-500/10 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => abrirEdicao(row)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExcluindo(row)}
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
      <Header
        title="Multas"
        subtitle="Controle de infrações de trânsito"
        actions={
          <Button onClick={abrirNova}>
            <Plus className="w-4 h-4" />
            Registrar Multa
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Total de Multas</p>
            <p className="text-2xl font-bold text-white mt-1">{multas.length}</p>
          </Card>
          <Card>
            <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Pendentes</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {multas.filter((m) => m.status === 'pendente').length}
            </p>
            <p className="text-xs text-amber-400/70 mt-0.5">{formatCurrency(totalPendente)}</p>
          </Card>
          <Card>
            <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Pagas</p>
            <p className="text-2xl font-bold text-green-400 mt-1">
              {multas.filter((m) => m.status === 'pago').length}
            </p>
          </Card>
        </div>

        {/* Alert for pending fines */}
        {multas.some((m) => m.status === 'pendente') && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-400">
              Você tem {multas.filter((m) => m.status === 'pendente').length} multa(s) pendente(s) no total de{' '}
              <strong>{formatCurrency(totalPendente)}</strong>.
            </p>
          </div>
        )}

        {/* Filtros rápidos + Busca */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {tabsStatus.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFiltroStatus(tab.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  filtroStatus === tab.value
                    ? 'bg-[#BAFF1A] text-[#121212]'
                    : 'bg-[#202020] border border-[#333333] text-[#A0A0A0] hover:text-white hover:border-[#555555]'
                }`}
              >
                {tab.label}
                {tab.value !== 'todas' && (
                  <span className="ml-1.5 opacity-70">
                    ({tab.value === 'cliente' || tab.value === 'empresa'
                      ? multas.filter((m) => m.responsavel === tab.value).length
                      : multas.filter((m) => m.status === tab.value).length})
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
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-lg bg-[#202020] border border-[#333333] text-sm text-white placeholder-[#A0A0A0] focus:outline-none focus:border-[#555555] w-72"
            />
          </div>
        </div>

        {/* Table */}
        <Card padding="none">
          <Table
            columns={columns}
            data={multasFiltradas}
            keyExtractor={(row) => row.id}
            emptyMessage="Nenhuma multa registrada"
          />
        </Card>
      </div>

      {/* Modal Registrar / Editar Multa */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editandoId ? 'Editar Multa' : 'Registrar Multa'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Cliente"
              options={clienteOptions}
              value={form.cliente_id}
              onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
              required
            />
            <Select
              label="Moto"
              options={motoOptions}
              value={form.moto_id}
              onChange={(e) => setForm({ ...form, moto_id: e.target.value })}
              required
            />
          </div>
          <Input
            label="Descrição da Infração"
            placeholder="Excesso de velocidade — Av. Paulista"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            required
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              placeholder="293.47"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              required
            />
            <Input
              label="Data da Infração"
              type="date"
              value={form.data_infração}
              onChange={(e) => setForm({ ...form, data_infração: e.target.value })}
              required
            />
            <Select
              label="Responsável"
              options={responsavelOptions}
              value={form.responsavel}
              onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
            />
          </div>
          <Textarea
            label="Observações"
            placeholder="AIT nº, local da infração, detalhes..."
            rows={3}
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <AlertTriangle className="w-4 h-4" />
              {editandoId ? 'Salvar Alterações' : 'Registrar Multa'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirmar Exclusão */}
      <Modal open={!!excluindo} onClose={() => setExcluindo(null)} title="Excluir Multa" size="sm">
        <div className="space-y-4">
          <p className="text-[#A0A0A0] text-sm">
            Tem certeza que deseja excluir a multa{' '}
            <span className="text-white font-medium">{excluindo?.descricao}</span>?
            Esta ação não poderá ser desfeita.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setExcluindo(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmarExclusao}>
              <Trash2 className="w-4 h-4" />
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
