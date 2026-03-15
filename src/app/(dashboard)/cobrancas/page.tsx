'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, DollarSign, Zap, Info, AlertTriangle, Search } from 'lucide-react'
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
  moto_placa: string
}

const mockCobrancas: CobrancaComRelacoes[] = [
  {
    id: '141',
    contrato_id: 'AAA0A00',
    cliente_id: 'alexandre',
    descricao: 'Proporcional — 09/03 a 10/03 (AAA0A00)',
    valor: 150.00,
    vencimento: '2026-03-11',
    status: 'pago',
    data_pagamento: '2026-03-11',
    created_at: '2026-03-11T10:00:00Z',
    updated_at: '2026-03-11T10:00:00Z',
    cliente_nome: 'ALEXANDRE DANTAS DAS SILVA',
    moto_placa: 'AAA0A00',
  },
  {
    id: '142',
    contrato_id: 'AAA0A00',
    cliente_id: 'alexandre',
    descricao: 'Caução — Entrada do contrato (AAA0A00)',
    valor: 500.00,
    vencimento: '2026-03-09',
    status: 'pago',
    data_pagamento: '2026-03-09',
    created_at: '2026-03-09T10:00:00Z',
    updated_at: '2026-03-09T10:00:00Z',
    cliente_nome: 'ALEXANDRE DANTAS DAS SILVA',
    moto_placa: 'AAA0A00',
  },
  {
    id: '140',
    contrato_id: 'CCC2C22',
    cliente_id: 'fabricio',
    descricao: 'Semanal — 04/03 a 10/03 (CCC2C22)',
    valor: 350.00,
    vencimento: '2026-03-11',
    status: 'pago',
    data_pagamento: '2026-03-11',
    created_at: '2026-03-11T10:00:00Z',
    updated_at: '2026-03-11T10:00:00Z',
    cliente_nome: 'FABRICIO DO VALE NEPOMUCENO',
    moto_placa: 'CCC2C22',
  },
  {
    id: '139',
    contrato_id: 'DDD3D33',
    cliente_id: 'flavio',
    descricao: 'Semanal — 04/03 a 10/03 (DDD3D33)',
    valor: 337.50,
    vencimento: '2026-03-11',
    status: 'pago',
    data_pagamento: '2026-03-11',
    created_at: '2026-03-11T10:00:00Z',
    updated_at: '2026-03-11T10:00:00Z',
    cliente_nome: 'FLAVIO SILVA COUTINHO',
    moto_placa: 'DDD3D33',
  },
  {
    id: '138',
    contrato_id: 'DDD3D33',
    cliente_id: 'flavio',
    descricao: 'Semanal — 25/02 a 03/03 (DDD3D33)',
    valor: 304.25,
    vencimento: '2026-03-04',
    status: 'pago',
    data_pagamento: '2026-03-04',
    created_at: '2026-03-04T10:00:00Z',
    updated_at: '2026-03-04T10:00:00Z',
    cliente_nome: 'FLAVIO SILVA COUTINHO',
    moto_placa: 'DDD3D33',
  },
  {
    id: '137',
    contrato_id: 'CCC2C22',
    cliente_id: 'fabricio',
    descricao: 'Semanal — 25/02 a 03/03 (CCC2C22)',
    valor: 350.00,
    vencimento: '2026-03-04',
    status: 'pago',
    data_pagamento: '2026-03-04',
    created_at: '2026-03-04T10:00:00Z',
    updated_at: '2026-03-04T10:00:00Z',
    cliente_nome: 'FABRICIO DO VALE NEPOMUCENO',
    moto_placa: 'CCC2C22',
  },
  {
    id: '136',
    contrato_id: 'DDD3D33',
    cliente_id: 'flavio',
    descricao: 'Semanal — 18/02 a 24/02 (DDD3D33)',
    valor: 335.55,
    vencimento: '2026-02-25',
    status: 'pago',
    data_pagamento: '2026-02-25',
    created_at: '2026-02-25T10:00:00Z',
    updated_at: '2026-02-25T10:00:00Z',
    cliente_nome: 'FLAVIO SILVA COUTINHO',
    moto_placa: 'DDD3D33',
  },
  {
    id: '135',
    contrato_id: 'CCC2C22',
    cliente_id: 'fabricio',
    descricao: 'Semanal — 18/02 a 24/02 (CCC2C22)',
    valor: 350.00,
    vencimento: '2026-02-25',
    status: 'pago',
    data_pagamento: '2026-02-25',
    created_at: '2026-02-25T10:00:00Z',
    updated_at: '2026-02-25T10:00:00Z',
    cliente_nome: 'FABRICIO DO VALE NEPOMUCENO',
    moto_placa: 'CCC2C22',
  },
  {
    id: '134',
    contrato_id: 'DDD3D33',
    cliente_id: 'flavio',
    descricao: 'Semanal — 11/02 a 17/02 (DDD3D33)',
    valor: 330.00,
    vencimento: '2026-02-18',
    status: 'pago',
    data_pagamento: '2026-02-18',
    created_at: '2026-02-18T10:00:00Z',
    updated_at: '2026-02-18T10:00:00Z',
    cliente_nome: 'FLAVIO SILVA COUTINHO',
    moto_placa: 'DDD3D33',
  },
  {
    id: '133',
    contrato_id: 'CCC2C22',
    cliente_id: 'fabricio',
    descricao: 'Semanal — 11/02 a 17/02 (CCC2C22)',
    valor: 350.00,
    vencimento: '2026-02-18',
    status: 'pago',
    data_pagamento: '2026-02-18',
    created_at: '2026-02-18T10:00:00Z',
    updated_at: '2026-02-18T10:00:00Z',
    cliente_nome: 'FABRICIO DO VALE NEPOMUCENO',
    moto_placa: 'CCC2C22',
  },
  {
    id: '132',
    contrato_id: 'BBB1B11',
    cliente_id: 'douglas',
    descricao: 'Quinzenal — 01/02 a 15/02 (BBB1B11)',
    valor: 630.00,
    vencimento: '2026-02-16',
    status: 'pago',
    data_pagamento: '2026-02-16',
    created_at: '2026-02-16T10:00:00Z',
    updated_at: '2026-02-16T10:00:00Z',
    cliente_nome: 'DOUGLAS DOS SANTOS SIMÕES',
    moto_placa: 'BBB1B11',
  },
  {
    id: '131',
    contrato_id: 'DDD3D33',
    cliente_id: 'flavio',
    descricao: 'Proporcional — 06/02 a 10/02 (DDD3D33)',
    valor: 173.00,
    vencimento: '2026-02-11',
    status: 'pago',
    data_pagamento: '2026-02-11',
    created_at: '2026-02-11T10:00:00Z',
    updated_at: '2026-02-11T10:00:00Z',
    cliente_nome: 'FLAVIO SILVA COUTINHO',
    moto_placa: 'DDD3D33',
  },
  {
    id: '130',
    contrato_id: 'CCC2C22',
    cliente_id: 'fabricio',
    descricao: 'Semanal — 04/02 a 10/02 (CCC2C22)',
    valor: 350.00,
    vencimento: '2026-02-11',
    status: 'pago',
    data_pagamento: '2026-02-11',
    created_at: '2026-02-11T10:00:00Z',
    updated_at: '2026-02-11T10:00:00Z',
    cliente_nome: 'FABRICIO DO VALE NEPOMUCENO',
    moto_placa: 'CCC2C22',
  },
  {
    id: '129',
    contrato_id: 'DDD3D33',
    cliente_id: 'flavio',
    descricao: 'Caução — Entrada do contrato (DDD3D33)',
    valor: 500.00,
    vencimento: '2026-02-06',
    status: 'pago',
    data_pagamento: '2026-02-06',
    created_at: '2026-02-06T10:00:00Z',
    updated_at: '2026-02-06T10:00:00Z',
    cliente_nome: 'FLAVIO SILVA COUTINHO',
    moto_placa: 'DDD3D33',
  },
  {
    id: '128',
    contrato_id: 'CCC2C22',
    cliente_id: 'fabricio',
    descricao: 'Semanal — 28/01 a 03/02 (CCC2C22)',
    valor: 350.00,
    vencimento: '2026-02-04',
    status: 'pago',
    data_pagamento: '2026-02-04',
    created_at: '2026-02-04T10:00:00Z',
    updated_at: '2026-02-04T10:00:00Z',
    cliente_nome: 'FABRICIO DO VALE NEPOMUCENO',
    moto_placa: 'CCC2C22',
  },
  {
    id: '127',
    contrato_id: 'AAA0A00',
    cliente_id: 'thiago',
    descricao: 'Semanal — 28/01 a 03/02 (AAA0A00)',
    valor: 350.00,
    vencimento: '2026-02-04',
    status: 'pago',
    data_pagamento: '2026-02-04',
    created_at: '2026-02-04T10:00:00Z',
    updated_at: '2026-02-04T10:00:00Z',
    cliente_nome: 'THIAGO ALVES CARLOS',
    moto_placa: 'AAA0A00',
  },
  {
    id: '126',
    contrato_id: 'BBB1B11',
    cliente_id: 'douglas',
    descricao: 'Quinzenal — 16/01 a 31/01 (BBB1B11)',
    valor: 630.00,
    vencimento: '2026-01-31',
    status: 'pago',
    data_pagamento: '2026-01-31',
    created_at: '2026-01-31T10:00:00Z',
    updated_at: '2026-01-31T10:00:00Z',
    cliente_nome: 'DOUGLAS DOS SANTOS SIMÕES',
    moto_placa: 'BBB1B11',
  },
  {
    id: '23',
    contrato_id: 'AAA0A00',
    cliente_id: 'marcos',
    descricao: 'Pagamento de Multa — Parcela 2/3 (AAA0A00)',
    valor: 100.00,
    vencimento: '2025-05-07',
    status: 'pago',
    data_pagamento: '2025-05-07',
    created_at: '2025-05-07T10:00:00Z',
    updated_at: '2025-05-07T10:00:00Z',
    cliente_nome: 'MARCOS FELIPE NEVES LOUREIRO',
    moto_placa: 'AAA0A00',
  },
  {
    id: '19',
    contrato_id: 'AAA0A00',
    cliente_id: 'marcos',
    descricao: 'Pagamento de Multa — Parcela 1/3 (AAA0A00)',
    valor: 100.00,
    vencimento: '2025-05-04',
    status: 'pago',
    data_pagamento: '2025-05-04',
    created_at: '2025-05-04T10:00:00Z',
    updated_at: '2025-05-04T10:00:00Z',
    cliente_nome: 'MARCOS FELIPE NEVES LOUREIRO',
    moto_placa: 'AAA0A00',
  },
  {
    id: '143',
    contrato_id: 'CCC2C22',
    cliente_id: 'fabricio',
    descricao: 'Semanal — 11/03 a 17/03 (CCC2C22)',
    valor: 350.00,
    vencimento: '2026-03-18',
    status: 'pendente',
    created_at: '2026-03-18T10:00:00Z',
    updated_at: '2026-03-18T10:00:00Z',
    cliente_nome: 'FABRICIO DO VALE NEPOMUCENO',
    moto_placa: 'CCC2C22',
  },
  {
    id: 'test-prejuizo',
    contrato_id: 'TESTE',
    cliente_id: 'johnny',
    descricao: 'Aluguel — Janeiro/2026 (TESTE)',
    valor: 800.00,
    vencimento: '2026-01-15',
    status: 'prejuizo',
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
    cliente_nome: 'JOHNNY TESTE',
    moto_placa: '—',
  },
]

const tabs = [
  { label: 'Todas', value: 'todas' },
  { label: 'Pendentes', value: 'pendente' },
  { label: 'Vencidas', value: 'vencido' },
  { label: 'Pagas', value: 'pago' },
  { label: 'Prejuízo', value: 'prejuizo' },
]

const clienteOptions = [
  { value: '', label: 'Selecione um cliente' },
  { value: 'alexandre', label: 'ALEXANDRE DANTAS DAS SILVA' },
  { value: 'fabricio', label: 'FABRICIO DO VALE NEPOMUCENO' },
  { value: 'flavio', label: 'FLAVIO SILVA COUTINHO' },
  { value: 'douglas', label: 'DOUGLAS DOS SANTOS SIMÕES' },
  { value: 'thiago', label: 'THIAGO ALVES CARLOS' },
  { value: 'marcos', label: 'MARCOS FELIPE NEVES LOUREIRO' },
]

const contratoOptions = [
  { value: '', label: 'Selecione um contrato / veículo' },
  { value: 'BBB1B11', label: 'BBB1B11 — Douglas' },
  { value: 'AAA0A00', label: 'AAA0A00 — Alexandre / Thiago / Marcos' },
  { value: 'CCC2C22', label: 'CCC2C22 — Fabrício' },
  { value: 'DDD3D33', label: 'DDD3D33 — Flávio' },
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
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [excluindo, setExcluindo] = useState<CobrancaComRelacoes | null>(null)
  const [confirmandoPago, setConfirmandoPago] = useState<CobrancaComRelacoes | null>(null)
  const [confirmandoPrejuizo, setConfirmandoPrejuizo] = useState<CobrancaComRelacoes | null>(null)
  const [busca, setBusca] = useState('')

  const filtered = cobrancas
    .filter((c) => activeTab === 'todas' || c.status === activeTab)
    .filter((c) => {
      if (!busca) return true
      const q = busca.toLowerCase()
      return (
        c.cliente_nome.toLowerCase().includes(q) ||
        c.moto_placa.toLowerCase().includes(q) ||
        c.descricao.toLowerCase().includes(q)
      )
    })

  function abrirNova() {
    setEditandoId(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  function abrirEdicao(row: CobrancaComRelacoes) {
    setEditandoId(row.id)
    setForm({
      cliente_id: row.cliente_id,
      contrato_id: row.contrato_id,
      descricao: row.descricao,
      valor: String(row.valor),
      vencimento: row.vencimento,
      observacoes: row.observacoes ?? '',
    })
    setModalOpen(true)
  }

  function confirmarPago() {
    if (!confirmandoPago) return
    setCobrancas((prev) =>
      prev.map((c) =>
        c.id === confirmandoPago.id
          ? { ...c, status: 'pago' as CobrancaStatus, data_pagamento: new Date().toISOString().split('T')[0] }
          : c
      )
    )
    setConfirmandoPago(null)
  }

  function confirmarPrejuizo() {
    if (!confirmandoPrejuizo) return
    setCobrancas((prev) =>
      prev.map((c) =>
        c.id === confirmandoPrejuizo.id ? { ...c, status: 'prejuizo' as CobrancaStatus } : c
      )
    )
    setConfirmandoPrejuizo(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const clienteLabel = clienteOptions.find((o) => o.value === form.cliente_id)?.label ?? ''

    if (editandoId) {
      setCobrancas((prev) =>
        prev.map((c) =>
          c.id === editandoId
            ? {
                ...c,
                cliente_id: form.cliente_id,
                contrato_id: form.contrato_id,
                descricao: form.descricao,
                valor: parseFloat(form.valor),
                vencimento: form.vencimento,
                observacoes: form.observacoes,
                cliente_nome: clienteLabel,
                moto_placa: form.contrato_id || c.moto_placa,
                updated_at: new Date().toISOString(),
              }
            : c
        )
      )
    } else {
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
        moto_placa: form.contrato_id || '—',
      }
      setCobrancas((prev) => [novaCobranca, ...prev])
    }

    setForm(defaultForm)
    setModalOpen(false)
  }

  function confirmarExclusao() {
    if (!excluindo) return
    setCobrancas((prev) => prev.filter((c) => c.id !== excluindo.id))
    setExcluindo(null)
  }

  const totalPago = cobrancas.filter((c) => c.status === 'pago').reduce((sum, c) => sum + c.valor, 0)
  const totalPendente = cobrancas.filter((c) => c.status === 'pendente').reduce((sum, c) => sum + c.valor, 0)
  const totalVencido = cobrancas.filter((c) => c.status === 'vencido').reduce((sum, c) => sum + c.valor, 0)
  const totalPrejuizo = cobrancas.filter((c) => c.status === 'prejuizo').reduce((sum, c) => sum + c.valor, 0)
  const totalNaoPago = totalPendente + totalVencido

  const qtdInadimplentes = cobrancas.filter((c) => c.status === 'vencido' || c.status === 'prejuizo').length
  const pctInadimplencia = cobrancas.length > 0 ? (qtdInadimplentes / cobrancas.length) * 100 : 0

  const pagas = cobrancas.filter((c) => c.status === 'pago')
  const ticketMedio = pagas.length > 0 ? totalPago / pagas.length : 0

  const hoje = new Date()
  const em30dias = new Date(hoje); em30dias.setDate(hoje.getDate() + 30)
  const projecao30 = cobrancas
    .filter((c) => c.status === 'pendente' && new Date(c.vencimento) <= em30dias)
    .reduce((sum, c) => sum + c.valor, 0)

  const vencidasOrdenadas = cobrancas
    .filter((c) => c.status === 'vencido')
    .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime())
  const maisAntiga = vencidasOrdenadas[0]
  const diasAtraso = maisAntiga
    ? Math.floor((hoje.getTime() - new Date(maisAntiga.vencimento).getTime()) / 86400000)
    : 0

  const pagaramNoPrazo = pagas.filter((c) => c.data_pagamento && c.data_pagamento <= c.vencimento).length
  const taxaPontualidade = pagas.length > 0 ? (pagaramNoPrazo / pagas.length) * 100 : 0

  const tempoMedio = pagas.length > 0
    ? pagas.reduce((sum, c) => {
        const dias = c.data_pagamento
          ? Math.floor((new Date(c.data_pagamento).getTime() - new Date(c.vencimento).getTime()) / 86400000)
          : 0
        return sum + dias
      }, 0) / pagas.length
    : 0

  const devedores: Record<string, number> = {}
  cobrancas
    .filter((c) => c.status === 'vencido' || c.status === 'pendente')
    .forEach((c) => { devedores[c.cliente_nome] = (devedores[c.cliente_nome] ?? 0) + c.valor })
  const topDevedor = Object.entries(devedores).sort((a, b) => b[1] - a[1])[0]

  const prejuizoPorCliente: Record<string, number> = {}
  cobrancas
    .filter((c) => c.status === 'prejuizo')
    .forEach((c) => { prejuizoPorCliente[c.cliente_nome] = (prejuizoPorCliente[c.cliente_nome] ?? 0) + c.valor })
  const topPrejuizo = Object.entries(prejuizoPorCliente).sort((a, b) => b[1] - a[1])[0]

  const columns = [
    {
      key: 'cliente_nome',
      header: 'Cliente',
      render: (row: CobrancaComRelacoes) => (
        <span className="font-medium text-white">{row.cliente_nome}</span>
      ),
    },
    {
      key: 'moto_placa',
      header: 'Placa',
      render: (row: CobrancaComRelacoes) => (
        <span className="font-mono text-sm text-[#A0A0A0]">{row.moto_placa}</span>
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
          {(row.status === 'pendente' || row.status === 'vencido') && (
            <button
              onClick={() => setConfirmandoPago(row)}
              title="Marcar como pago"
              className="p-1.5 rounded-lg text-green-400 hover:text-green-300 hover:bg-green-500/10 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {(row.status === 'pendente' || row.status === 'vencido') && (
            <button
              onClick={() => setConfirmandoPrejuizo(row)}
              title="Contabilizar como prejuízo"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors"
            >
              <AlertTriangle className="w-3 h-3" />
              Prejuízo
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
        title="Cobranças"
        subtitle="Controle de recebimentos"
        actions={
          <Button onClick={abrirNova}>
            <Plus className="w-4 h-4" />
            Nova Cobrança
          </Button>
        }
      />

      <div className="p-6 space-y-4">

        {/* Banner de integração futura */}
        <div className="rounded-xl border border-[#BAFF1A]/30 bg-[#BAFF1A]/5 px-4 py-4 space-y-3">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-[#BAFF1A] mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#BAFF1A]">
                Integração com InfinitePay em breve
              </p>
              <p className="text-sm text-[#A0A0A0] mt-0.5">
                Esta tela será integrada com a plataforma InfinitePay para geração e gestão automatizada de cobranças.
                Os dados exibidos são <span className="text-white font-medium">ilustrativos</span> — o layout e campos poderão mudar com a integração.
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#BAFF1A]/10 border border-[#BAFF1A]/20 px-2.5 py-1 text-xs font-medium text-[#BAFF1A]">
              <Info className="w-3 h-3" />
              Dados ilustrativos
            </span>
          </div>

          <div className="border-t border-[#BAFF1A]/15 pt-3">
            <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">O que esta tela irá apresentar após a integração</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5">
              {[
                'Total recebido no período',
                'Total a receber (em aberto)',
                'Cobranças vencidas',
                '% de inadimplência',
                'Valores não pagos acumulados',
                'Prejuízos contabilizados (dívidas irrecuperáveis)',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BAFF1A]/60 shrink-0" />
                  <span className="text-xs text-[#A0A0A0]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cards — 2 linhas de 3 */}
        <div className="grid grid-cols-3 gap-4">

          {/* 1. Total Recebido + ticket médio */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Total Recebido</p>
              <p className="text-2xl font-bold text-[#BAFF1A] mt-1">{formatCurrency(totalPago)}</p>
              <p className="text-xs text-[#A0A0A0] mt-0.5">{pagas.length} cobranças pagas</p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-[#A0A0A0]">Ticket médio</span>
              <span className="text-xs font-semibold text-white">{formatCurrency(ticketMedio)}</span>
            </div>
          </Card>

          {/* 2. A Receber + projeção 30 dias */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">A Receber</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{formatCurrency(totalPendente)}</p>
              <p className="text-xs text-[#A0A0A0] mt-0.5">{cobrancas.filter((c) => c.status === 'pendente').length} em aberto</p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-[#A0A0A0]">Vencem em 30 dias</span>
              <span className="text-xs font-semibold text-amber-400">{formatCurrency(projecao30)}</span>
            </div>
          </Card>

          {/* 3. Vencidas + mais antiga */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Vencidas</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalVencido)}</p>
              <p className="text-xs text-[#A0A0A0] mt-0.5">{cobrancas.filter((c) => c.status === 'vencido').length} cobranças</p>
            </div>
            <div className="px-4 py-3">
              {maisAntiga ? (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-[#A0A0A0] truncate max-w-[130px]" title={maisAntiga.cliente_nome}>
                    {maisAntiga.cliente_nome.split(' ')[0]}
                  </span>
                  <span className="text-xs font-semibold text-red-400 shrink-0">{diasAtraso}d atraso</span>
                </div>
              ) : (
                <span className="text-xs text-green-400">Nenhuma em atraso</span>
              )}
            </div>
          </Card>

          {/* 4. % Inadimplência + pontualidade */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Inadimplência</p>
              <p className={`text-2xl font-bold mt-1 ${pctInadimplencia > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {pctInadimplencia.toFixed(1)}%
              </p>
              <p className="text-xs text-[#A0A0A0] mt-0.5">
                {qtdInadimplentes} cobrança(s) vencida(s) ou perdida(s) do total de {cobrancas.length}
              </p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#A0A0A0]">Pontualidade</p>
                <p className="text-xs text-[#888888] mt-0.5">das {pagas.length} pagas</p>
              </div>
              <span className={`text-sm font-semibold ${taxaPontualidade >= 80 ? 'text-green-400' : taxaPontualidade >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {taxaPontualidade.toFixed(1)}%
              </span>
            </div>
          </Card>

          {/* 5. Não pagos + tempo médio */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Valores Não Pagos</p>
              <p className={`text-2xl font-bold mt-1 ${totalNaoPago > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                {formatCurrency(totalNaoPago)}
              </p>
              <p className="text-xs text-[#A0A0A0] mt-0.5">Pendentes + vencidas</p>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-[#A0A0A0]">Tempo médio de receb.</span>
              <span className="text-xs font-semibold text-white">
                {tempoMedio === 0 ? 'No prazo' : tempoMedio > 0 ? `${tempoMedio.toFixed(0)}d após venc.` : `${Math.abs(tempoMedio).toFixed(0)}d antecipado`}
              </span>
            </div>
          </Card>

          {/* 6. Prejuízos + top devedor */}
          <Card padding="none" className={totalPrejuizo > 0 ? 'border-red-500/40 bg-red-500/5' : ''}>
            <div className={`p-4 border-b ${totalPrejuizo > 0 ? 'border-red-500/20' : 'border-[#2a2a2a]'}`}>
              <div className="flex items-center gap-2">
                <p className={`text-xs uppercase tracking-wider ${totalPrejuizo > 0 ? 'text-red-400' : 'text-[#A0A0A0]'}`}>
                  Prejuízos Contabilizados
                </p>
                {totalPrejuizo > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-xs font-medium text-red-400">
                    Atenção
                  </span>
                )}
              </div>
              <p className={`text-2xl font-bold mt-1 ${totalPrejuizo > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {formatCurrency(totalPrejuizo)}
              </p>
              <p className={`text-xs mt-0.5 ${totalPrejuizo > 0 ? 'text-red-400/70' : 'text-[#A0A0A0]'}`}>
                {cobrancas.filter((c) => c.status === 'prejuizo').length === 0
                  ? 'Nenhum prejuízo registrado'
                  : `${cobrancas.filter((c) => c.status === 'prejuizo').length} cobrança(s) irrecuperável(is)`}
              </p>
            </div>
            <div className={`px-4 py-3 ${totalPrejuizo > 0 ? 'bg-red-500/5' : ''}`}>
              {topPrejuizo ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-[#A0A0A0]">Maior prejuízo</p>
                    <p className="text-xs font-medium text-white truncate max-w-[130px]" title={topPrejuizo[0]}>
                      {topPrejuizo[0].split(' ')[0]}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-red-400 shrink-0">{formatCurrency(topPrejuizo[1])}</span>
                </div>
              ) : (
                <span className="text-xs text-green-400">Nenhum prejuízo registrado</span>
              )}
            </div>
          </Card>

        </div>

        {/* Filter Tabs + Busca */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
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
            data={filtered}
            keyExtractor={(row) => row.id}
            emptyMessage="Nenhuma cobrança encontrada"
          />
        </Card>
      </div>

      {/* Modal Nova / Editar Cobrança */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editandoId ? 'Editar Cobrança' : 'Nova Cobrança'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Cliente"
            options={clienteOptions}
            value={form.cliente_id}
            onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
            required
          />
          <Select
            label="Contrato / Placa"
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
              {editandoId ? 'Salvar Alterações' : 'Criar Cobrança'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirmar Pago */}
      <Modal open={!!confirmandoPago} onClose={() => setConfirmandoPago(null)} title="Confirmar Pagamento" size="sm">
        <div className="space-y-4">
          <div className="p-4 bg-green-500/8 border border-green-500/20 rounded-lg space-y-2">
            <p className="text-sm text-white font-medium">Confirmar recebimento desta cobrança?</p>
            {confirmandoPago && (
              <div className="space-y-0.5">
                <p className="text-xs text-[#A0A0A0]">{confirmandoPago.cliente_nome}</p>
                <p className="text-xs text-[#A0A0A0]">{confirmandoPago.descricao}</p>
                <p className="text-sm font-semibold text-green-400">{formatCurrency(confirmandoPago.valor)}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-[#A0A0A0]">A data de pagamento será registrada como hoje.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setConfirmandoPago(null)}>Cancelar</Button>
            <Button onClick={confirmarPago}>
              <CheckCircle className="w-4 h-4" />
              Confirmar Pagamento
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Confirmar Prejuízo */}
      <Modal open={!!confirmandoPrejuizo} onClose={() => setConfirmandoPrejuizo(null)} title="Registrar como Prejuízo" size="sm">
        <div className="space-y-4">
          <div className="p-4 bg-red-500/8 border border-red-500/20 rounded-lg space-y-2">
            <p className="text-sm text-white font-medium">Tem certeza que deseja contabilizar esta cobrança como prejuízo?</p>
            {confirmandoPrejuizo && (
              <div className="space-y-0.5">
                <p className="text-xs text-[#A0A0A0]">{confirmandoPrejuizo.cliente_nome}</p>
                <p className="text-xs text-[#A0A0A0]">{confirmandoPrejuizo.descricao}</p>
                <p className="text-sm font-semibold text-red-400">{formatCurrency(confirmandoPrejuizo.valor)}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-red-400/80">Esta ação indica que a dívida é irrecuperável. Não pode ser desfeita facilmente.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setConfirmandoPrejuizo(null)}>Cancelar</Button>
            <Button variant="danger" onClick={confirmarPrejuizo}>
              <AlertTriangle className="w-4 h-4" />
              Confirmar Prejuízo
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Confirmar Exclusão */}
      <Modal open={!!excluindo} onClose={() => setExcluindo(null)} title="Excluir Cobrança" size="sm">
        <div className="space-y-4">
          <p className="text-[#A0A0A0] text-sm">
            Tem certeza que deseja excluir a cobrança{' '}
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
