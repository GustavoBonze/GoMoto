'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, TrendingDown, Search } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Despesa {
  id: string
  veiculo: string           // placa
  data: string
  tipo_despesa: string      // Preventiva, Corretiva, Troca de óleo, Seguro, etc.
  valor: number
  pagador: string           // Jamerson, Gustavo, Caixa da Empresa, Desconto na Semanal
  quilometragem?: number
  observacao?: string
  created_at: string
}

const mockDespesas: Despesa[] = [
  { id: '146', veiculo: 'RJA5J85', data: '2026-03-09', tipo_despesa: 'Preventiva', valor: 12.50, pagador: 'Caixa da Empresa', quilometragem: 29282, observacao: 'Troca de óleo, valor da nota 25,00', created_at: '2026-03-09T10:00:00Z' },
  { id: '145', veiculo: 'RJA5J85', data: '2026-02-27', tipo_despesa: 'Preventiva', valor: 45.75, pagador: 'Caixa da Empresa', quilometragem: 27058, observacao: 'Kit relação. Valor da nota 91,50', created_at: '2026-02-27T10:00:00Z' },
  { id: '144', veiculo: 'SYF1C42', data: '2026-02-27', tipo_despesa: 'Corretiva', valor: 100.00, pagador: 'Caixa da Empresa', observacao: 'Pneu dianteiro + mão de obra mecânico', created_at: '2026-02-27T10:00:00Z' },
  { id: '143', veiculo: 'SYF1C42', data: '2026-02-25', tipo_despesa: 'Corretiva', valor: 115.00, pagador: 'Caixa da Empresa', observacao: '65,00 guidão novo + 50,00 mão de obra mecânico', created_at: '2026-02-25T10:00:00Z' },
  { id: '142', veiculo: 'RJA5J85', data: '2026-02-24', tipo_despesa: 'Troca de óleo', valor: 14.45, pagador: 'Caixa da Empresa', quilometragem: 27058, observacao: 'Valor da nota 28,90', created_at: '2026-02-24T10:00:00Z' },
  { id: '141', veiculo: 'RJA5J85', data: '2026-02-20', tipo_despesa: 'Seguro', valor: 169.90, pagador: 'Caixa da Empresa', created_at: '2026-02-20T10:00:00Z' },
  { id: '140', veiculo: 'RIW4J89', data: '2026-02-20', tipo_despesa: 'Seguro', valor: 171.28, pagador: 'Caixa da Empresa', created_at: '2026-02-20T10:00:00Z' },
  { id: '139', veiculo: 'KYN9J41', data: '2026-02-20', tipo_despesa: 'Seguro', valor: 171.00, pagador: 'Caixa da Empresa', created_at: '2026-02-20T10:00:00Z' },
  { id: '138', veiculo: 'SYF1C42', data: '2026-02-20', tipo_despesa: 'Seguro', valor: 191.28, pagador: 'Caixa da Empresa', created_at: '2026-02-20T10:00:00Z' },
  { id: '137', veiculo: 'RJA5J85', data: '2026-02-13', tipo_despesa: 'Corretiva', valor: 20.00, pagador: 'Caixa da Empresa', observacao: 'Troca da lona de freio', created_at: '2026-02-13T10:00:00Z' },
  { id: '136', veiculo: 'RJA5J85', data: '2026-02-11', tipo_despesa: 'Corretiva', valor: 27.00, pagador: 'Caixa da Empresa', observacao: 'Lâmpada farol', created_at: '2026-02-11T10:00:00Z' },
  { id: '135', veiculo: 'SYF1C42', data: '2026-02-09', tipo_despesa: 'Corretiva', valor: 250.00, pagador: 'Caixa da Empresa', observacao: 'Roda traseira da Start 160', created_at: '2026-02-09T10:00:00Z' },
  { id: '131', veiculo: 'RJA5J85', data: '2026-01-21', tipo_despesa: 'Seguro', valor: 169.90, pagador: 'Caixa da Empresa', created_at: '2026-01-21T10:00:00Z' },
  { id: '130', veiculo: 'RIW4J89', data: '2026-01-21', tipo_despesa: 'Seguro', valor: 171.28, pagador: 'Caixa da Empresa', created_at: '2026-01-21T10:00:00Z' },
  { id: '129', veiculo: 'KYN9J41', data: '2026-01-21', tipo_despesa: 'Seguro', valor: 171.00, pagador: 'Caixa da Empresa', created_at: '2026-01-21T10:00:00Z' },
  { id: '128', veiculo: 'SYF1C42', data: '2026-01-21', tipo_despesa: 'Seguro', valor: 191.28, pagador: 'Caixa da Empresa', created_at: '2026-01-21T10:00:00Z' },
  { id: '126', veiculo: 'SYF1C42', data: '2026-01-15', tipo_despesa: 'Troca de óleo', valor: 17.00, pagador: 'Caixa da Empresa', quilometragem: 46578, observacao: 'Valor da nota 34,00', created_at: '2026-01-15T10:00:00Z' },
  { id: '125', veiculo: 'SYF1C42', data: '2026-01-02', tipo_despesa: 'Troca de óleo', valor: 17.00, pagador: 'Caixa da Empresa', quilometragem: 45525, observacao: 'Valor da nota 34,00', created_at: '2026-01-02T10:00:00Z' },
  { id: '124', veiculo: 'RIW4J89', data: '2026-01-06', tipo_despesa: 'Troca de óleo', valor: 15.00, pagador: 'Caixa da Empresa', quilometragem: 67908, observacao: 'Valor da nota 30,00', created_at: '2026-01-06T10:00:00Z' },
  { id: '103', veiculo: 'SYF1C42', data: '2025-10-31', tipo_despesa: 'Troca de óleo', valor: 17.00, pagador: 'Desconto na Semanal', quilometragem: 35572, observacao: 'Valor da nota 34,00', created_at: '2025-10-31T10:00:00Z' },
  { id: '86', veiculo: 'RIW4J89', data: '2025-09-10', tipo_despesa: 'Troca de óleo', valor: 15.00, pagador: 'Desconto na Semanal', quilometragem: 42503, observacao: 'Troca de óleo 30,00', created_at: '2025-09-10T10:00:00Z' },
  { id: '73', veiculo: 'SYF1C42', data: '2025-08-20', tipo_despesa: 'Pneu', valor: 124.50, pagador: 'Desconto na Semanal', quilometragem: 27999, observacao: 'Pneu novo', created_at: '2025-08-20T10:00:00Z' },
  { id: '57', veiculo: 'SYF1C42', data: '2025-08-10', tipo_despesa: 'Relação da moto', valor: 79.00, pagador: 'Desconto na Semanal', quilometragem: 23242, observacao: 'Relação R$ 65 (50%) - Parafuso R$ 14 (50%)', created_at: '2025-08-10T10:00:00Z' },
  { id: '43', veiculo: 'SYF1C42', data: '2025-07-15', tipo_despesa: 'Bateria', valor: 158.00, pagador: 'Desconto na Semanal', quilometragem: 16879, observacao: 'Bateria R$145 - Mão de obra R$10 - Parafuso R$3', created_at: '2025-07-15T10:00:00Z' },
  { id: '5', veiculo: 'SYF1C42', data: '2025-01-23', tipo_despesa: 'IPVA', valor: 270.40, pagador: 'Jamerson', created_at: '2025-01-23T10:00:00Z' },
  { id: '2', veiculo: 'KYN9J41', data: '2025-01-16', tipo_despesa: 'Compra da moto', valor: 10000.00, pagador: 'Gustavo', observacao: 'Adquirido do Sr. Juarez Ribeiro', created_at: '2025-01-16T10:00:00Z' },
  { id: '1', veiculo: 'SYF1C42', data: '2025-01-10', tipo_despesa: 'Compra da moto', valor: 13000.00, pagador: 'Jamerson', observacao: 'Adquirido do Bruno', created_at: '2025-01-10T10:00:00Z' },
]

const tipoDespesaOptions = [
  { value: '', label: 'Selecione o tipo' },
  { value: 'Compra da moto', label: 'Compra da moto' },
  { value: 'Seguro', label: 'Seguro' },
  { value: 'IPVA', label: 'IPVA' },
  { value: 'GRT', label: 'GRT' },
  { value: 'DUDA transf.', label: 'DUDA transf.' },
  { value: 'Taxa vistoria seguro', label: 'Taxa vistoria seguro' },
  { value: 'Chave reserva', label: 'Chave reserva' },
  { value: 'Combustível', label: 'Combustível' },
  { value: 'Resgate', label: 'Resgate' },
  { value: 'Tráfego/Marketing', label: 'Tráfego/Marketing' },
  { value: 'Outros', label: 'Outros' },
]

const pagadorOptions = [
  { value: '', label: 'Selecione o pagador' },
  { value: 'Caixa da Empresa', label: 'Caixa da Empresa' },
  { value: 'Desconto na Semanal', label: 'Desconto na Semanal' },
  { value: 'Gustavo', label: 'Gustavo' },
  { value: 'Jamerson', label: 'Jamerson' },
]

const veiculoOptions = [
  { value: '', label: 'Selecione o veículo' },
  { value: 'KYN9J41', label: 'KYN9J41' },
  { value: 'SYF1C42', label: 'SYF1C42' },
  { value: 'RIW4J89', label: 'RIW4J89' },
  { value: 'RJA5J85', label: 'RJA5J85' },
  { value: 'Geral', label: 'Geral (sem moto específica)' },
]

const tipoBadge: Record<string, 'success' | 'info' | 'warning' | 'muted' | 'brand' | 'danger' | 'orange'> = {
  Preventiva: 'info',
  Corretiva: 'warning',
  'Troca de óleo': 'muted',
  Seguro: 'brand',
  IPVA: 'orange',
  GRT: 'orange',
  'Compra da moto': 'success',
  'Relação da moto': 'warning',
  Pneu: 'warning',
  Bateria: 'warning',
  Combustível: 'muted',
  Resgate: 'danger',
  'Tráfego/Marketing': 'info',
  Outros: 'muted',
}

const pagadorBadge: Record<string, 'success' | 'info' | 'warning' | 'muted' | 'brand' | 'danger' | 'orange'> = {
  'Caixa da Empresa': 'success',
  'Desconto na Semanal': 'orange',
  Gustavo: 'brand',
  Jamerson: 'info',
}

const defaultForm = {
  veiculo: '',
  data: new Date().toISOString().split('T')[0],
  tipo_despesa: '',
  valor: '',
  pagador: '',
  quilometragem: '',
  observacao: '',
}

const PAGE_SIZE = 10

// ─────────────────────────────────────────────────────────────
// Supabase (quando conectar):
// const { data, count } = await supabase
//   .from('despesas')
//   .select('*', { count: 'exact' })
//   .order('data', { ascending: false })
//   .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
// ─────────────────────────────────────────────────────────────

export default function DespesasPage() {
  const [despesas, setDespesas] = useState<Despesa[]>(mockDespesas)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Despesa | null>(null)
  const [excluindo, setExcluindo] = useState<Despesa | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [busca, setBusca] = useState('')
  const [filtroPagador, setFiltroPagador] = useState('todos')
  const [page, setPage] = useState(0)

  const hoje = new Date()
  const mesAtual = hoje.getMonth()
  const anoAtual = hoje.getFullYear()
  const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1
  const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual

  const despesasMes = despesas.filter((d) => {
    const dt = new Date(d.data)
    return dt.getMonth() === mesAtual && dt.getFullYear() === anoAtual
  })

  const despesasMesAnterior = despesas.filter((d) => {
    const dt = new Date(d.data)
    return dt.getMonth() === mesAnterior && dt.getFullYear() === anoAnterior
  })

  const totalMes = despesasMes.reduce((sum, d) => sum + d.valor, 0)
  const totalMesAnterior = despesasMesAnterior.reduce((sum, d) => sum + d.valor, 0)
  const variacaoMes = totalMesAnterior > 0
    ? ((totalMes - totalMesAnterior) / totalMesAnterior) * 100
    : null

  const totalGeral = despesas.reduce((sum, d) => sum + d.valor, 0)
  const ticketMedio = despesas.length > 0 ? totalGeral / despesas.length : 0

  // Quanto foi custeado pela empresa vs clientes (desconto semanal)
  const totalDescontoSemanal = despesas
    .filter((d) => d.pagador === 'Desconto na Semanal')
    .reduce((sum, d) => sum + d.valor, 0)
  const totalEmpresa = totalGeral - totalDescontoSemanal

  function breakdownPagador(lista: Despesa[]) {
    const map: Record<string, { valor: number; qtd: number }> = {}
    lista.forEach((d) => {
      if (!map[d.pagador]) map[d.pagador] = { valor: 0, qtd: 0 }
      map[d.pagador].valor += d.valor
      map[d.pagador].qtd += 1
    })
    return Object.entries(map).sort((a, b) => b[1].valor - a[1].valor)
  }

  function breakdownTipo(lista: Despesa[]) {
    const map: Record<string, { valor: number; qtd: number }> = {}
    lista.forEach((d) => {
      if (!map[d.tipo_despesa]) map[d.tipo_despesa] = { valor: 0, qtd: 0 }
      map[d.tipo_despesa].valor += d.valor
      map[d.tipo_despesa].qtd += 1
    })
    return Object.entries(map).sort((a, b) => b[1].valor - a[1].valor)
  }

  // Moto mais cara do mês
  const custoPorMoto: Record<string, number> = {}
  despesasMes.forEach((d) => {
    custoPorMoto[d.veiculo] = (custoPorMoto[d.veiculo] ?? 0) + d.valor
  })
  const motoMaisCara = Object.entries(custoPorMoto).sort((a, b) => b[1] - a[1])[0]

  const tabsPagador = [
    { label: 'Todos', value: 'todos' },
    { label: 'Caixa', value: 'Caixa da Empresa' },
    { label: 'Desc. Semanal', value: 'Desconto na Semanal' },
    { label: 'Gustavo', value: 'Gustavo' },
    { label: 'Jamerson', value: 'Jamerson' },
  ]

  // Filtragem
  const despesasFiltradas = despesas.filter((d) => {
    const q = busca.toLowerCase()
    const passaBusca =
      d.veiculo.toLowerCase().includes(q) ||
      d.tipo_despesa.toLowerCase().includes(q) ||
      d.pagador.toLowerCase().includes(q) ||
      (d.observacao?.toLowerCase().includes(q) ?? false)
    const passaPagador = filtroPagador === 'todos' || d.pagador === filtroPagador
    return passaBusca && passaPagador
  })

  const total = despesasFiltradas.length
  const despesasPagina = despesasFiltradas.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleBusca(valor: string) {
    setBusca(valor)
    setPage(0)
  }

  function handleFiltroPagador(valor: string) {
    setFiltroPagador(valor)
    setPage(0)
  }

  function abrirNova() {
    setEditando(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  function abrirEdicao(despesa: Despesa) {
    setEditando(despesa)
    setForm({
      veiculo: despesa.veiculo,
      data: despesa.data,
      tipo_despesa: despesa.tipo_despesa,
      valor: String(despesa.valor),
      pagador: despesa.pagador,
      quilometragem: despesa.quilometragem ? String(despesa.quilometragem) : '',
      observacao: despesa.observacao ?? '',
    })
    setModalOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editando) {
      setDespesas((prev) =>
        prev.map((d) =>
          d.id === editando.id
            ? {
                ...d,
                veiculo: form.veiculo,
                data: form.data,
                tipo_despesa: form.tipo_despesa,
                valor: parseFloat(form.valor),
                pagador: form.pagador,
                quilometragem: form.quilometragem ? parseInt(form.quilometragem) : undefined,
                observacao: form.observacao || undefined,
              }
            : d
        )
      )
    } else {
      const nova: Despesa = {
        id: String(Date.now()),
        veiculo: form.veiculo,
        data: form.data,
        tipo_despesa: form.tipo_despesa,
        valor: parseFloat(form.valor),
        pagador: form.pagador,
        quilometragem: form.quilometragem ? parseInt(form.quilometragem) : undefined,
        observacao: form.observacao || undefined,
        created_at: new Date().toISOString(),
      }
      setDespesas((prev) => [nova, ...prev])
    }
    setForm(defaultForm)
    setEditando(null)
    setModalOpen(false)
  }

  function handleExcluir() {
    if (!excluindo) return
    setDespesas((prev) => prev.filter((d) => d.id !== excluindo.id))
    setExcluindo(null)
  }

  const columns = [
    {
      key: 'id',
      header: '#',
      render: (row: Despesa) => <span className="text-[#A0A0A0] text-xs">{row.id}</span>,
    },
    {
      key: 'veiculo',
      header: 'Veículo',
      render: (row: Despesa) => (
        <span className="font-mono text-sm font-semibold text-white bg-[#2a2a2a] px-2 py-0.5 rounded">
          {row.veiculo}
        </span>
      ),
    },
    {
      key: 'data',
      header: 'Data / KM',
      render: (row: Despesa) => {
        const temMoto = row.veiculo && row.veiculo !== 'Geral'
        const semKm = temMoto && !row.quilometragem
        return (
          <div>
            <p className="text-white text-sm">{formatDate(row.data)}</p>
            {row.quilometragem ? (
              <p className="text-xs text-[#A0A0A0] mt-0.5">
                {row.quilometragem.toLocaleString('pt-BR')} km
              </p>
            ) : semKm ? (
              <p className="text-xs text-red-400 mt-0.5 font-medium">
                ⚠ km não informado
              </p>
            ) : null}
          </div>
        )
      },
    },
    {
      key: 'tipo_despesa',
      header: 'Tipo',
      render: (row: Despesa) => (
        <Badge variant={tipoBadge[row.tipo_despesa] ?? 'muted'}>{row.tipo_despesa}</Badge>
      ),
    },
    {
      key: 'pagador',
      header: 'Pagador',
      render: (row: Despesa) => (
        <Badge variant={pagadorBadge[row.pagador] ?? 'muted'}>{row.pagador}</Badge>
      ),
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (row: Despesa) => (
        <span className="font-semibold text-red-400">{formatCurrency(row.valor)}</span>
      ),
    },
    {
      key: 'observacao',
      header: 'Observação',
      render: (row: Despesa) => (
        <p className="text-xs text-[#A0A0A0] max-w-[220px] truncate" title={row.observacao}>
          {row.observacao || '—'}
        </p>
      ),
    },
    {
      key: 'acoes',
      header: '',
      render: (row: Despesa) => (
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
        title="Despesas"
        subtitle="Registro de gastos e custos"
        actions={
          <Button onClick={abrirNova}>
            <Plus className="w-4 h-4" />
            Nova Despesa
          </Button>
        }
      />

      <div className="p-6 space-y-5">

        {/* Cards expandidos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Card Total Geral */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Total Geral</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalGeral)}</p>
              <p className="text-xs text-[#A0A0A0] mt-1">{despesas.length} registros · ticket médio {formatCurrency(ticketMedio)}</p>
            </div>
            <div className="p-4 space-y-2 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Por pagador</p>
              {breakdownPagador(despesas).map(([pagador, { valor, qtd }]) => (
                <div key={pagador} className="flex items-center justify-between">
                  <span className="text-xs text-[#A0A0A0]">{pagador}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#A0A0A0]">{qtd}x</span>
                    <span className="text-xs font-medium text-white">{formatCurrency(valor)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Custo real da empresa</p>
              <p className="text-sm font-semibold text-red-400">{formatCurrency(totalEmpresa)}</p>
              <p className="text-xs text-[#A0A0A0] mt-0.5">
                Desconto na semanal (clientes): {formatCurrency(totalDescontoSemanal)}
              </p>
            </div>
          </Card>

          {/* Card Total do Mês */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Total do Mês</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totalMes)}</p>
              <div className="mt-1">
                {variacaoMes !== null ? (
                  <span className={`text-xs font-medium ${variacaoMes > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {variacaoMes > 0 ? '▲' : '▼'} {Math.abs(variacaoMes).toFixed(1)}% vs mês anterior
                  </span>
                ) : (
                  <span className="text-xs text-[#A0A0A0]">{despesasMes.length} registros</span>
                )}
              </div>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Por tipo</p>
              {breakdownTipo(despesasMes).length === 0
                ? <p className="text-xs text-[#A0A0A0]">Sem despesas este mês</p>
                : breakdownTipo(despesasMes).map(([tipo, { valor, qtd }]) => (
                  <div key={tipo} className="flex items-center justify-between">
                    <span className="text-xs text-[#A0A0A0]">{tipo}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#A0A0A0]">{qtd}x</span>
                      <span className="text-xs font-medium text-white">{formatCurrency(valor)}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </Card>

          {/* Card Registros + Moto mais cara + Pagador do mês */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Total de Registros</p>
              <p className="text-2xl font-bold text-white mt-1">{despesas.length}</p>
              <p className="text-xs text-[#A0A0A0] mt-1">{despesasMes.length} no mês atual</p>
            </div>
            <div className="p-4 space-y-2 border-b border-[#2a2a2a]">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Por pagador (mês)</p>
              {breakdownPagador(despesasMes).length === 0
                ? <p className="text-xs text-[#A0A0A0]">Sem despesas este mês</p>
                : breakdownPagador(despesasMes).map(([pagador, { valor, qtd }]) => (
                  <div key={pagador} className="flex items-center justify-between">
                    <span className="text-xs text-[#A0A0A0]">{pagador}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#A0A0A0]">{qtd}x</span>
                      <span className="text-xs font-medium text-white">{formatCurrency(valor)}</span>
                    </div>
                  </div>
                ))
              }
            </div>
            <div className="p-4">
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Moto mais cara (mês)</p>
              {motoMaisCara ? (
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-white bg-[#2a2a2a] px-2 py-0.5 rounded">{motoMaisCara[0]}</span>
                  <span className="text-sm font-semibold text-red-400">{formatCurrency(motoMaisCara[1])}</span>
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
            {tabsPagador.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleFiltroPagador(tab.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  filtroPagador === tab.value
                    ? 'bg-[#BAFF1A] text-[#121212]'
                    : 'bg-[#202020] border border-[#333333] text-[#A0A0A0] hover:text-white hover:border-[#555555]'
                }`}
              >
                {tab.label}
                {tab.value !== 'todos' && (
                  <span className="ml-1.5 opacity-70">
                    ({despesas.filter((d) => d.pagador === tab.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <input
              type="text"
              placeholder="Buscar por veículo, tipo, pagador ou observação..."
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
            data={despesasPagina}
            keyExtractor={(row) => row.id}
            emptyMessage="Nenhuma despesa encontrada"
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
            <p className="text-sm text-white font-medium">Tem certeza que deseja excluir esta despesa?</p>
            <p className="text-xs text-[#A0A0A0] mt-2">Esta ação não pode ser desfeita.</p>
          </div>
          {excluindo && (
            <div className="p-3 bg-[#2a2a2a] rounded-lg space-y-1">
              <p className="text-xs text-[#A0A0A0]">Despesa a ser excluída:</p>
              <p className="text-sm text-white font-medium">{excluindo.tipo_despesa} — {excluindo.veiculo}</p>
              <p className="text-xs text-[#A0A0A0]">{formatCurrency(excluindo.valor)} · {formatDate(excluindo.data)} · {excluindo.pagador}</p>
            </div>
          )}
          <div className="flex gap-3 justify-end pt-1">
            <Button variant="ghost" onClick={() => setExcluindo(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleExcluir}>
              <Trash2 className="w-4 h-4" />
              Sim, excluir
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Nova / Editar Despesa */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditando(null) }}
        title={editando ? 'Editar Despesa' : 'Nova Despesa'}
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
              label="Data"
              type="date"
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo de Despesa"
              options={tipoDespesaOptions}
              value={form.tipo_despesa}
              onChange={(e) => setForm({ ...form, tipo_despesa: e.target.value })}
              required
            />
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Pagador"
              options={pagadorOptions}
              value={form.pagador}
              onChange={(e) => setForm({ ...form, pagador: e.target.value })}
              required
            />
            <Input
              label="Quilometragem (opcional)"
              type="number"
              placeholder="Ex: 29.282"
              value={form.quilometragem}
              onChange={(e) => setForm({ ...form, quilometragem: e.target.value })}
              hint="km no momento da despesa"
            />
          </div>

          <Textarea
            label="Observação"
            placeholder="Ex: Troca de óleo, valor da nota 34,00"
            rows={3}
            value={form.observacao}
            onChange={(e) => setForm({ ...form, observacao: e.target.value })}
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => { setModalOpen(false); setEditando(null) }}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger">
              <TrendingDown className="w-4 h-4" />
              {editando ? 'Salvar Alterações' : 'Registrar Despesa'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
