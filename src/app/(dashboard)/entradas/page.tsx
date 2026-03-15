'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, TrendingUp, Search } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, StatCard } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Pagination } from '@/components/ui/Pagination'

interface Entrada {
  id: string
  veiculo: string        // placa
  data: string
  locatario: string      // nome do cliente
  valor: number
  referencia: string     // Semanal, Quinzenal, Caução, etc.
  forma_pagamento: string
  periodo_de?: string    // data início do período
  periodo_ate?: string   // data fim do período
  observacoes?: string
  created_at: string
}

const mockEntradas: Entrada[] = [
  {
    id: '141',
    veiculo: 'AAA0A00',
    data: '2026-03-11',
    locatario: 'ALEXANDRE DANTAS DAS SILVA',
    valor: 150.00,
    referencia: 'Proporcional',
    forma_pagamento: 'Boleto',
    periodo_de: '2026-03-09',
    periodo_ate: '2026-03-10',
    observacoes: '',
    created_at: '2026-03-11T10:00:00Z',
  },
  {
    id: '142',
    veiculo: 'AAA0A00',
    data: '2026-03-09',
    locatario: 'ALEXANDRE DANTAS DAS SILVA',
    valor: 500.00,
    referencia: 'Caução',
    forma_pagamento: 'PIX',
    observacoes: '',
    created_at: '2026-03-09T10:00:00Z',
  },
  {
    id: '140',
    veiculo: 'CCC2C22',
    data: '2026-03-11',
    locatario: 'FABRICIO DO VALE NEPOMUCENO',
    valor: 350.00,
    referencia: 'Semanal',
    forma_pagamento: 'Boleto',
    periodo_de: '2026-03-04',
    periodo_ate: '2026-03-10',
    observacoes: '',
    created_at: '2026-03-11T10:00:00Z',
  },
  {
    id: '139',
    veiculo: 'DDD3D33',
    data: '2026-03-11',
    locatario: 'FLAVIO SILVA COUTINHO',
    valor: 337.50,
    referencia: 'Semanal',
    forma_pagamento: 'Boleto',
    periodo_de: '2026-03-04',
    periodo_ate: '2026-03-10',
    observacoes: 'Semanal com divisão de manutenção R$ 12,50',
    created_at: '2026-03-11T10:00:00Z',
  },
  {
    id: '138',
    veiculo: 'DDD3D33',
    data: '2026-03-04',
    locatario: 'FLAVIO SILVA COUTINHO',
    valor: 304.25,
    referencia: 'Semanal',
    forma_pagamento: 'Boleto',
    periodo_de: '2026-02-25',
    periodo_ate: '2026-03-03',
    observacoes: 'Semanal com divisão de manutenção R$ 45,75',
    created_at: '2026-03-04T10:00:00Z',
  },
  {
    id: '137',
    veiculo: 'CCC2C22',
    data: '2026-03-04',
    locatario: 'FABRICIO DO VALE NEPOMUCENO',
    valor: 350.00,
    referencia: 'Semanal',
    forma_pagamento: 'Boleto',
    periodo_de: '2026-02-25',
    periodo_ate: '2026-03-03',
    observacoes: '',
    created_at: '2026-03-04T10:00:00Z',
  },
  {
    id: '136',
    veiculo: 'DDD3D33',
    data: '2026-02-25',
    locatario: 'FLAVIO SILVA COUTINHO',
    valor: 335.55,
    referencia: 'Semanal',
    forma_pagamento: 'Boleto',
    periodo_de: '2026-02-18',
    periodo_ate: '2026-02-24',
    observacoes: 'Semanal com divisão de manutenção R$ 14,45 troca de óleo',
    created_at: '2026-02-25T10:00:00Z',
  },
  {
    id: '135',
    veiculo: 'CCC2C22',
    data: '2026-02-25',
    locatario: 'FABRICIO DO VALE NEPOMUCENO',
    valor: 350.00,
    referencia: 'Semanal',
    forma_pagamento: 'Boleto',
    periodo_de: '2026-02-18',
    periodo_ate: '2026-02-24',
    observacoes: '',
    created_at: '2026-02-25T10:00:00Z',
  },
  {
    id: '134',
    veiculo: 'DDD3D33',
    data: '2026-02-18',
    locatario: 'FLAVIO SILVA COUTINHO',
    valor: 330.00,
    referencia: 'Semanal',
    forma_pagamento: 'PIX',
    periodo_de: '2026-02-11',
    periodo_ate: '2026-02-17',
    observacoes: 'Semanal com desconto integral da troca da lona de freio R$ 20,00',
    created_at: '2026-02-18T10:00:00Z',
  },
  {
    id: '133',
    veiculo: 'CCC2C22',
    data: '2026-02-18',
    locatario: 'FABRICIO DO VALE NEPOMUCENO',
    valor: 350.00,
    referencia: 'Semanal',
    forma_pagamento: 'Boleto',
    periodo_de: '2026-02-11',
    periodo_ate: '2026-02-17',
    observacoes: '',
    created_at: '2026-02-18T10:00:00Z',
  },
  {
    id: '132',
    veiculo: 'BBB1B11',
    data: '2026-02-16',
    locatario: 'DOUGLAS DOS SANTOS SIMÕES',
    valor: 630.00,
    referencia: 'Quinzenal',
    forma_pagamento: 'Boleto',
    periodo_de: '2026-02-01',
    periodo_ate: '2026-02-15',
    observacoes: '',
    created_at: '2026-02-16T10:00:00Z',
  },
  {
    id: '131',
    veiculo: 'DDD3D33',
    data: '2026-02-11',
    locatario: 'FLAVIO SILVA COUTINHO',
    valor: 173.00,
    referencia: 'Proporcional',
    forma_pagamento: 'PIX',
    periodo_de: '2026-02-06',
    periodo_ate: '2026-02-10',
    observacoes: 'Proporcional com desconto integral de troca do farol R$ 27,00',
    created_at: '2026-02-11T10:00:00Z',
  },
  {
    id: '130',
    veiculo: 'CCC2C22',
    data: '2026-02-11',
    locatario: 'FABRICIO DO VALE NEPOMUCENO',
    valor: 350.00,
    referencia: 'Semanal',
    forma_pagamento: 'Boleto',
    periodo_de: '2026-02-04',
    periodo_ate: '2026-02-10',
    observacoes: '',
    created_at: '2026-02-11T10:00:00Z',
  },
  {
    id: '129',
    veiculo: 'DDD3D33',
    data: '2026-02-06',
    locatario: 'FLAVIO SILVA COUTINHO',
    valor: 500.00,
    referencia: 'Caução',
    forma_pagamento: 'PIX',
    observacoes: '',
    created_at: '2026-02-06T10:00:00Z',
  },
  {
    id: '128',
    veiculo: 'CCC2C22',
    data: '2026-02-04',
    locatario: 'FABRICIO DO VALE NEPOMUCENO',
    valor: 350.00,
    referencia: 'Semanal',
    forma_pagamento: 'Boleto',
    periodo_de: '2026-01-28',
    periodo_ate: '2026-02-03',
    observacoes: '',
    created_at: '2026-02-04T10:00:00Z',
  },
  {
    id: '127',
    veiculo: 'AAA0A00',
    data: '2026-02-04',
    locatario: 'THIAGO ALVES CARLOS',
    valor: 350.00,
    referencia: 'Semanal',
    forma_pagamento: 'Boleto',
    periodo_de: '2026-01-28',
    periodo_ate: '2026-02-03',
    observacoes: '',
    created_at: '2026-02-04T10:00:00Z',
  },
  {
    id: '126',
    veiculo: 'BBB1B11',
    data: '2026-01-31',
    locatario: 'DOUGLAS DOS SANTOS SIMÕES',
    valor: 630.00,
    referencia: 'Quinzenal',
    forma_pagamento: 'Boleto',
    periodo_de: '2026-01-16',
    periodo_ate: '2026-01-31',
    observacoes: '',
    created_at: '2026-01-31T10:00:00Z',
  },
  {
    id: '23',
    veiculo: 'AAA0A00',
    data: '2025-05-07',
    locatario: 'MARCOS FELIPE NEVES LOUREIRO',
    valor: 100.00,
    referencia: 'Pagamento de Multa',
    forma_pagamento: 'PIX',
    observacoes: 'Parcela 2 de 3 — multa de trânsito pendente',
    created_at: '2025-05-07T10:00:00Z',
  },
  {
    id: '19',
    veiculo: 'AAA0A00',
    data: '2025-05-04',
    locatario: 'MARCOS FELIPE NEVES LOUREIRO',
    valor: 100.00,
    referencia: 'Pagamento de Multa',
    forma_pagamento: 'PIX',
    observacoes: 'Parcela 1 de 3 — multa de trânsito',
    created_at: '2025-05-04T10:00:00Z',
  },
]

const referenciaOptions = [
  { value: '', label: 'Selecione a referência' },
  { value: 'Semanal', label: 'Semanal' },
  { value: 'Quinzenal', label: 'Quinzenal' },
  { value: 'Mensal', label: 'Mensal' },
  { value: 'Proporcional', label: 'Proporcional' },
  { value: 'Caução', label: 'Caução' },
  { value: 'Pagamento de Multa', label: 'Pagamento de Multa' },
  { value: 'Pagamento de Manutenção', label: 'Pagamento de Manutenção' },
  { value: 'Outros', label: 'Outros' },
]

const formaPagamentoOptions = [
  { value: '', label: 'Selecione a forma' },
  { value: 'PIX', label: 'PIX' },
  { value: 'Boleto', label: 'Boleto' },
  { value: 'Cartão de crédito', label: 'Cartão de crédito' },
  { value: 'Cartão de débito', label: 'Cartão de débito' },
  { value: 'Dinheiro', label: 'Dinheiro' },
]

const veiculoOptions = [
  { value: '', label: 'Selecione o veículo' },
  { value: 'BBB1B11', label: 'BBB1B11' },
  { value: 'AAA0A00', label: 'AAA0A00' },
  { value: 'CCC2C22', label: 'CCC2C22' },
  { value: 'DDD3D33', label: 'DDD3D33' },
  { value: 'RJA5J86', label: 'RJA5J86' },
]

const referenciaBadge: Record<string, 'success' | 'info' | 'warning' | 'muted' | 'brand' | 'danger' | 'orange'> = {
  Semanal: 'success',
  Quinzenal: 'brand',
  Proporcional: 'success',
  Mensal: 'info',
  Caução: 'warning',
  'Pagamento de Multa': 'danger',
  'Pagamento de Manutenção': 'orange',
  Outros: 'muted',
}

const defaultForm = {
  veiculo: '',
  data: new Date().toISOString().split('T')[0],
  locatario: '',
  valor: '',
  referencia: '',
  forma_pagamento: '',
  periodo_de: '',
  periodo_ate: '',
  observacoes: '',
}

const PAGE_SIZE = 10

// ─────────────────────────────────────────────────────────────
// Quando conectar o Supabase, substitua a função abaixo por:
//
// const { data, count } = await supabase
//   .from('entradas')
//   .select('*', { count: 'exact' })
//   .ilike('locatario', `%${busca}%`)   // ou OR com veiculo
//   .order('data', { ascending: false })
//   .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
//
// E passe { data, total: count } para o componente.
// ─────────────────────────────────────────────────────────────

export default function EntradasPage() {
  const [entradas, setEntradas] = useState<Entrada[]>(mockEntradas)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Entrada | null>(null)
  const [excluindo, setExcluindo] = useState<Entrada | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [busca, setBusca] = useState('')
  const [filtroRef, setFiltroRef] = useState('todas')
  const [page, setPage] = useState(0)

  const hoje = new Date()
  const mesAtual = hoje.getMonth()
  const anoAtual = hoje.getFullYear()
  const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1
  const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual

  const entradasMes = entradas.filter((e) => {
    const d = new Date(e.data)
    return d.getMonth() === mesAtual && d.getFullYear() === anoAtual
  })

  const entradasMesAnterior = entradas.filter((e) => {
    const d = new Date(e.data)
    return d.getMonth() === mesAnterior && d.getFullYear() === anoAnterior
  })

  const totalMes = entradasMes.reduce((sum, e) => sum + e.valor, 0)
  const totalMesAnterior = entradasMesAnterior.reduce((sum, e) => sum + e.valor, 0)
  const variacaoMes = totalMesAnterior > 0
    ? ((totalMes - totalMesAnterior) / totalMesAnterior) * 100
    : null

  const totalGeral = entradas.reduce((sum, e) => sum + e.valor, 0)
  const ticketMedio = entradas.length > 0 ? totalGeral / entradas.length : 0

  // Breakdown por referência — mês e geral
  function breakdownReferencia(lista: Entrada[]) {
    const map: Record<string, { valor: number; qtd: number }> = {}
    lista.forEach((e) => {
      if (!map[e.referencia]) map[e.referencia] = { valor: 0, qtd: 0 }
      map[e.referencia].valor += e.valor
      map[e.referencia].qtd += 1
    })
    return Object.entries(map).sort((a, b) => b[1].valor - a[1].valor)
  }

  // Breakdown por forma de pagamento — mês e geral
  function breakdownForma(lista: Entrada[]) {
    const map: Record<string, { valor: number; qtd: number }> = {}
    lista.forEach((e) => {
      const forma = e.forma_pagamento || 'Não informado'
      if (!map[forma]) map[forma] = { valor: 0, qtd: 0 }
      map[forma].valor += e.valor
      map[forma].qtd += 1
    })
    return Object.entries(map).sort((a, b) => b[1].valor - a[1].valor)
  }

  // Moto mais rentável do mês
  const rentabilidadeMooto: Record<string, number> = {}
  entradasMes.forEach((e) => {
    rentabilidadeMooto[e.veiculo] = (rentabilidadeMooto[e.veiculo] ?? 0) + e.valor
  })
  const motoTop = Object.entries(rentabilidadeMooto).sort((a, b) => b[1] - a[1])[0]

  const totalGeral2 = totalGeral // alias para clareza no JSX

  const tabsRef = [
    { label: 'Todas', value: 'todas' },
    { label: 'Semanal', value: 'Semanal' },
    { label: 'Quinzenal', value: 'Quinzenal' },
    { label: 'Proporcional', value: 'Proporcional' },
    { label: 'Caução', value: 'Caução' },
    { label: 'Multa', value: 'Pagamento de Multa' },
    { label: 'Outros', value: 'outros' },
  ]

  // Filtragem — com Supabase isso vai para o servidor
  const entradasFiltradas = entradas.filter((e) => {
    const q = busca.toLowerCase()
    const passaBusca =
      e.locatario.toLowerCase().includes(q) ||
      e.veiculo.toLowerCase().includes(q) ||
      e.referencia.toLowerCase().includes(q) ||
      (e.observacoes?.toLowerCase().includes(q) ?? false)
    const passFiltroRef =
      filtroRef === 'todas' ? true :
      filtroRef === 'outros' ? !['Semanal', 'Quinzenal', 'Proporcional', 'Caução', 'Pagamento de Multa'].includes(e.referencia) :
      e.referencia === filtroRef
    return passaBusca && passFiltroRef
  })

  // Paginação local — com Supabase vira .range() na query
  const total = entradasFiltradas.length
  const entradasPagina = entradasFiltradas.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleBusca(valor: string) {
    setBusca(valor)
    setPage(0)
  }

  function handleFiltroRef(valor: string) {
    setFiltroRef(valor)
    setPage(0)
  }

  function abrirNova() {
    setEditando(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  function abrirEdicao(entrada: Entrada) {
    setEditando(entrada)
    setForm({
      veiculo: entrada.veiculo,
      data: entrada.data,
      locatario: entrada.locatario,
      valor: String(entrada.valor),
      referencia: entrada.referencia,
      forma_pagamento: entrada.forma_pagamento,
      periodo_de: entrada.periodo_de ?? '',
      periodo_ate: entrada.periodo_ate ?? '',
      observacoes: entrada.observacoes ?? '',
    })
    setModalOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editando) {
      // Edição
      setEntradas((prev) =>
        prev.map((en) =>
          en.id === editando.id
            ? {
                ...en,
                veiculo: form.veiculo,
                data: form.data,
                locatario: form.locatario,
                valor: parseFloat(form.valor),
                referencia: form.referencia,
                forma_pagamento: form.forma_pagamento,
                periodo_de: form.periodo_de || undefined,
                periodo_ate: form.periodo_ate || undefined,
                observacoes: form.observacoes || undefined,
              }
            : en
        )
      )
    } else {
      // Nova entrada
      const nova: Entrada = {
        id: String(Date.now()),
        veiculo: form.veiculo,
        data: form.data,
        locatario: form.locatario,
        valor: parseFloat(form.valor),
        referencia: form.referencia,
        forma_pagamento: form.forma_pagamento,
        periodo_de: form.periodo_de || undefined,
        periodo_ate: form.periodo_ate || undefined,
        observacoes: form.observacoes || undefined,
        created_at: new Date().toISOString(),
      }
      setEntradas((prev) => [nova, ...prev])
    }
    setForm(defaultForm)
    setEditando(null)
    setModalOpen(false)
  }

  function handleExcluir() {
    if (!excluindo) return
    setEntradas((prev) => prev.filter((en) => en.id !== excluindo.id))
    setExcluindo(null)
  }

  const columns = [
    {
      key: 'id',
      header: '#',
      render: (row: Entrada) => (
        <span className="text-[#A0A0A0] text-xs">{row.id}</span>
      ),
    },
    {
      key: 'veiculo',
      header: 'Veículo',
      render: (row: Entrada) => (
        <span className="font-mono text-sm font-semibold text-white bg-[#2a2a2a] px-2 py-0.5 rounded">
          {row.veiculo}
        </span>
      ),
    },
    {
      key: 'data',
      header: 'Data',
      render: (row: Entrada) => (
        <div>
          <p className="text-white text-sm">{formatDate(row.data)}</p>
          {row.periodo_de && row.periodo_ate && (
            <p className="text-xs text-[#A0A0A0] mt-0.5">
              {formatDate(row.periodo_de)} a {formatDate(row.periodo_ate)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'locatario',
      header: 'Locatário',
      render: (row: Entrada) => (
        <p className="text-white text-sm max-w-[180px] truncate" title={row.locatario}>
          {row.locatario}
        </p>
      ),
    },
    {
      key: 'referencia',
      header: 'Referência',
      render: (row: Entrada) => (
        <Badge variant={referenciaBadge[row.referencia] ?? 'muted'}>{row.referencia}</Badge>
      ),
    },
    {
      key: 'forma_pagamento',
      header: 'Forma',
      render: (row: Entrada) => (
        <span className="text-sm text-[#A0A0A0]">{row.forma_pagamento || '—'}</span>
      ),
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (row: Entrada) => (
        <span className="font-semibold text-[#BAFF1A]">{formatCurrency(row.valor)}</span>
      ),
    },
    {
      key: 'observacoes',
      header: 'Observação',
      render: (row: Entrada) => (
        <p className="text-xs text-[#A0A0A0] max-w-[220px] truncate" title={row.observacoes}>
          {row.observacoes || '—'}
        </p>
      ),
    },
    {
      key: 'acoes',
      header: '',
      render: (row: Entrada) => (
        <div className="flex items-center gap-1">
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
        title="Entradas"
        subtitle="Registro de recebimentos"
        actions={
          <Button onClick={abrirNova}>
            <Plus className="w-4 h-4" />
            Nova Entrada
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Cards principais — linha 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Card Total Geral */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Total Geral</p>
              <p className="text-2xl font-bold text-[#BAFF1A] mt-1">{formatCurrency(totalGeral2)}</p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-xs text-[#A0A0A0]">{entradas.length} registros · ticket médio {formatCurrency(ticketMedio)}</p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Por referência</p>
              {breakdownReferencia(entradas).map(([ref, { valor, qtd }]) => (
                <div key={ref} className="flex items-center justify-between">
                  <span className="text-xs text-[#A0A0A0]">{ref}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#A0A0A0]">{qtd}x</span>
                    <span className="text-xs font-medium text-white">{formatCurrency(valor)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Card Total do Mês */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Total do Mês</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totalMes)}</p>
              <div className="flex items-center gap-2 mt-1">
                {variacaoMes !== null ? (
                  <span className={`text-xs font-medium ${variacaoMes >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {variacaoMes >= 0 ? '▲' : '▼'} {Math.abs(variacaoMes).toFixed(1)}% vs mês anterior
                  </span>
                ) : (
                  <span className="text-xs text-[#A0A0A0]">{entradasMes.length} registros</span>
                )}
              </div>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Por referência</p>
              {breakdownReferencia(entradasMes).length === 0
                ? <p className="text-xs text-[#A0A0A0]">Sem entradas este mês</p>
                : breakdownReferencia(entradasMes).map(([ref, { valor, qtd }]) => (
                  <div key={ref} className="flex items-center justify-between">
                    <span className="text-xs text-[#A0A0A0]">{ref}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#A0A0A0]">{qtd}x</span>
                      <span className="text-xs font-medium text-white">{formatCurrency(valor)}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </Card>

          {/* Card Total de Registros + formas + moto top */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Total de Registros</p>
              <p className="text-2xl font-bold text-white mt-1">{entradas.length}</p>
              <p className="text-xs text-[#A0A0A0] mt-1">{entradasMes.length} no mês atual</p>
            </div>
            <div className="p-4 space-y-2 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Forma de pagamento (mês)</p>
              {breakdownForma(entradasMes).length === 0
                ? <p className="text-xs text-[#A0A0A0]">Sem entradas este mês</p>
                : breakdownForma(entradasMes).map(([forma, { valor, qtd }]) => (
                  <div key={forma} className="flex items-center justify-between">
                    <span className="text-xs text-[#A0A0A0]">{forma}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#A0A0A0]">{qtd}x</span>
                      <span className="text-xs font-medium text-white">{formatCurrency(valor)}</span>
                    </div>
                  </div>
                ))
              }
            </div>
            <div className="p-4">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Moto mais rentável (mês)</p>
              {motoTop ? (
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-white bg-[#2a2a2a] px-2 py-0.5 rounded">{motoTop[0]}</span>
                  <span className="text-sm font-semibold text-[#BAFF1A]">{formatCurrency(motoTop[1])}</span>
                </div>
              ) : (
                <p className="text-xs text-[#A0A0A0]">Sem dados este mês</p>
              )}
            </div>
          </Card>

        </div>

        {/* Filtros rápidos + Busca */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {tabsRef.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleFiltroRef(tab.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  filtroRef === tab.value
                    ? 'bg-[#BAFF1A] text-[#121212]'
                    : 'bg-[#202020] border border-[#333333] text-[#A0A0A0] hover:text-white hover:border-[#555555]'
                }`}
              >
                {tab.label}
                {tab.value !== 'todas' && (
                  <span className="ml-1.5 opacity-70">
                    ({tab.value === 'outros'
                      ? entradas.filter((e) => !['Semanal', 'Quinzenal', 'Proporcional', 'Caução', 'Pagamento de Multa'].includes(e.referencia)).length
                      : entradas.filter((e) => e.referencia === tab.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <input
              type="text"
              placeholder="Buscar por locatário, veículo ou referência..."
              value={busca}
              onChange={(e) => handleBusca(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-lg bg-[#202020] border border-[#333333] text-sm text-white placeholder-[#A0A0A0] focus:outline-none focus:border-[#555555] w-72"
            />
          </div>
        </div>

        {/* Tabela + Paginação */}
        <Card padding="none">
          <Table
            columns={columns}
            data={entradasPagina}
            keyExtractor={(row) => row.id}
            emptyMessage="Nenhuma entrada encontrada"
          />
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </Card>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <Modal open={!!excluindo} onClose={() => setExcluindo(null)} title="Confirmar Exclusão" size="sm">
        <div className="space-y-4">
          <div className="p-4 bg-red-500/8 border border-red-500/20 rounded-lg">
            <p className="text-sm text-white font-medium">Tem certeza que deseja excluir esta entrada?</p>
            <p className="text-xs text-[#A0A0A0] mt-2">Esta ação não pode ser desfeita.</p>
          </div>
          {excluindo && (
            <div className="p-3 bg-[#2a2a2a] rounded-lg space-y-1">
              <p className="text-xs text-[#A0A0A0]">Entrada a ser excluída:</p>
              <p className="text-sm text-white font-medium">{excluindo.locatario}</p>
              <p className="text-xs text-[#A0A0A0]">{excluindo.veiculo} · {formatCurrency(excluindo.valor)} · {formatDate(excluindo.data)}</p>
            </div>
          )}
          <div className="flex gap-3 justify-end pt-1">
            <Button variant="ghost" onClick={() => setExcluindo(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleExcluir}>
              <Trash2 className="w-4 h-4" />
              Sim, excluir
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Nova / Editar Entrada */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditando(null) }}
        title={editando ? 'Editar Entrada' : 'Nova Entrada'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Veículo (Placa)"
              options={veiculoOptions}
              value={form.veiculo}
              onChange={(e) => setForm({ ...form, veiculo: e.target.value })}
              required
            />
            <Input
              label="Data do Pagamento"
              type="date"
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
              required
            />
          </div>

          <Input
            label="Locatário (Nome completo)"
            placeholder="NOME DO LOCATÁRIO"
            value={form.locatario}
            onChange={(e) => setForm({ ...form, locatario: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Referência"
              options={referenciaOptions}
              value={form.referencia}
              onChange={(e) => setForm({ ...form, referencia: e.target.value })}
              required
            />
            <Input
              label="Valor Recebido (R$)"
              type="number"
              step="0.01"
              placeholder="350.00"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              required
            />
          </div>

          <Select
            label="Forma de Pagamento"
            options={formaPagamentoOptions}
            value={form.forma_pagamento}
            onChange={(e) => setForm({ ...form, forma_pagamento: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Período — De (opcional)"
              type="date"
              value={form.periodo_de}
              onChange={(e) => setForm({ ...form, periodo_de: e.target.value })}
              hint="Ex: início da semana"
            />
            <Input
              label="Período — Até (opcional)"
              type="date"
              value={form.periodo_ate}
              onChange={(e) => setForm({ ...form, periodo_ate: e.target.value })}
              hint="Ex: fim da semana"
            />
          </div>

          <Textarea
            label="Observação"
            placeholder="Ex: semanal com divisão de troca de óleo R$ 13,50"
            rows={3}
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => { setModalOpen(false); setEditando(null) }}>
              Cancelar
            </Button>
            <Button type="submit">
              <TrendingUp className="w-4 h-4" />
              {editando ? 'Salvar Alterações' : 'Registrar Entrada'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
