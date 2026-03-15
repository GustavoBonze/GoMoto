'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Eye, Bike, X, CheckCircle, AlertCircle, Search } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency } from '@/lib/utils'
import type { Moto, MotoStatus } from '@/types'

const mockMotos: Moto[] = [
  {
    id: '1',
    renavam: '1373480839',
    placa: 'SYF1C42',
    marca: 'HONDA',
    modelo: 'CG 160 START',
    ano: '23/24',
    chassi: '9C2KC2500RR028495',
    cor: 'VERMELHA',
    combustivel: 'GASOLINA',
    potencia_cilindrada: '0CV/149',
    dono_antigo: 'BRUNO CESAR SOUZA DA COSTA',
    cpf_dono_antigo: '114.967.617-58',
    data_compra: '2025-01-10',
    valor_fipe: 15791,
    manutencao_em_dia: true,
    status: 'alugada',
    observacoes: 'Veículo em excelentes condições, com a quilometragem atual de aproximadamente 2.500 km rodados.',
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z',
  },
  {
    id: '2',
    renavam: '1141548353',
    placa: 'KYN9J41',
    marca: 'YAMAHA',
    modelo: 'YS150 FAZER SED',
    ano: '17/18',
    chassi: '9C6RG3810J0015498',
    cor: 'VERMELHA',
    combustivel: 'ÁLCOOL/GASOLINA',
    potencia_cilindrada: '0CV/149',
    dono_antigo: 'JUAREZ RIBEIRO DE SOUZA FILHO',
    cpf_dono_antigo: '738.321.897-34',
    data_compra: '2025-01-16',
    valor_fipe: 12865,
    manutencao_em_dia: false,
    status: 'alugada',
    observacoes: 'O veículo teve o painel substituído. Atualmente, possui 1.700 km rodados. O antigo proprietário informou que, no momento da troca, o veículo registrava 35.000 km.',
    created_at: '2025-01-16T10:00:00Z',
    updated_at: '2025-01-16T10:00:00Z',
  },
  {
    id: '3',
    renavam: '1353627230',
    placa: 'RIW4J89',
    marca: 'YAMAHA',
    modelo: 'YS150 FAZER SED',
    ano: '23/24',
    chassi: '9C6RG3850R0048746',
    cor: 'VERMELHA',
    combustivel: 'ÁLCOOL/GASOLINA',
    potencia_cilindrada: '0CV/149',
    dono_antigo: 'LUIZ ADRIANO GOMES',
    cpf_dono_antigo: '009.523.047-59',
    data_compra: '2025-05-22',
    valor_fipe: 13000,
    manutencao_em_dia: false,
    status: 'alugada',
    observacoes: 'Veículo em excelentes condições, com a quilometragem atual de aproximadamente 24.360 km rodados.',
    created_at: '2026-05-22T10:00:00Z',
    updated_at: '2026-05-22T10:00:00Z',
  },
  {
    id: '4',
    renavam: '1291640719',
    placa: 'RJA5J85',
    marca: 'YAMAHA',
    modelo: 'YBR150 FACTOR SED',
    ano: '22/22',
    chassi: '9C6RG3160N0035522',
    cor: 'VERMELHA',
    combustivel: 'ÁLCOOL/GASOLINA',
    potencia_cilindrada: '0CV/149',
    dono_antigo: 'VANIO DA SILVA LUCENA',
    cpf_dono_antigo: '099.559.627-12',
    data_compra: '2025-09-04',
    valor_fipe: 13500,
    manutencao_em_dia: true,
    status: 'alugada',
    observacoes: 'Veículo em excelentes condições, com a quilometragem atual de aproximadamente 19.750 km rodados.',
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',
  },
]

const filterOptions = [
  { label: 'Todas', value: 'todas' },
  { label: 'Disponíveis', value: 'disponivel' },
  { label: 'Alugadas', value: 'alugada' },
  { label: 'Manutenção', value: 'manutencao' },
]

const statusOptions = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'alugada', label: 'Alugada' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'inativa', label: 'Inativa' },
]

const combustivelOptions = [
  { value: 'GASOLINA', label: 'Gasolina' },
  { value: 'ÁLCOOL/GASOLINA', label: 'Álcool/Gasolina (Flex)' },
  { value: 'ELÉTRICO', label: 'Elétrico' },
]

// ─── itens de bootstrap de manutenção ────────────────────────────────────────

const BOOTSTRAP_ITENS = [
  { id: 'ip1',  nome: 'Troca de óleo',                          tipo: 'km'   as const, intervalo: 1000,  hint: 'a cada 1.000 km'  },
  { id: 'ip2',  nome: 'Filtro de óleo',                         tipo: 'km'   as const, intervalo: 4000,  hint: 'a cada 4.000 km'  },
  { id: 'ip5',  nome: 'Troca da relação (corrente/coroa/pinhão)',tipo: 'km'   as const, intervalo: 12000, hint: 'a cada 12.000 km' },
  { id: 'ip6',  nome: 'Lona de freio traseira',                 tipo: 'km'   as const, intervalo: 12000, hint: 'a cada 12.000 km' },
  { id: 'ip7',  nome: 'Pastilha de freio dianteira',            tipo: 'km'   as const, intervalo: 8000,  hint: 'a cada 8.000 km'  },
  { id: 'ip8',  nome: 'Pneu dianteiro',                         tipo: 'km'   as const, intervalo: 12000, hint: 'a cada 12.000 km' },
  { id: 'ip9',  nome: 'Pneu traseiro',                          tipo: 'km'   as const, intervalo: 8000,  hint: 'a cada 8.000 km'  },
  { id: 'ip10', nome: 'Filtro de ar',                           tipo: 'km'   as const, intervalo: 7000,  hint: 'a cada 7.000 km'  },
  { id: 'ip11', nome: 'Velas de ignição',                       tipo: 'km'   as const, intervalo: 10000, hint: 'a cada 10.000 km' },
  { id: 'ip12', nome: 'Amortecedores',                          tipo: 'km'   as const, intervalo: 25000, hint: 'a cada 25.000 km' },
  { id: 'ip13', nome: 'Vistoria mensal',                        tipo: 'data' as const, intervalo: 30,    hint: 'todo mês'         },
]

const defaultForm = {
  placa: '',
  modelo: '',
  marca: '',
  ano: '',
  cor: '',
  renavam: '',
  chassi: '',
  combustivel: 'GASOLINA',
  potencia_cilindrada: '',
  dono_antigo: '',
  cpf_dono_antigo: '',
  data_compra: '',
  valor_fipe: '',
  km_atual: '',
  manutencao_em_dia: 'true',
  status: 'disponivel',
  observacoes: '',
}

const cardBorderMap: Record<string, string> = {
  disponivel: 'border-green-500/20',
  alugada: 'border-blue-500/20',
  manutencao: 'border-amber-500/20',
  inativa: 'border-white/10',
}

function motoToForm(moto: Moto) {
  return {
    placa: moto.placa,
    modelo: moto.modelo,
    marca: moto.marca,
    ano: moto.ano,
    cor: moto.cor,
    renavam: moto.renavam,
    chassi: moto.chassi,
    combustivel: moto.combustivel ?? 'GASOLINA',
    potencia_cilindrada: moto.potencia_cilindrada ?? '',
    dono_antigo: moto.dono_antigo ?? '',
    cpf_dono_antigo: moto.cpf_dono_antigo ?? '',
    data_compra: moto.data_compra ?? '',
    valor_fipe: moto.valor_fipe ? String(moto.valor_fipe) : '',
    km_atual: '',
    manutencao_em_dia: moto.manutencao_em_dia !== false ? 'true' : 'false',
    status: moto.status,
    observacoes: moto.observacoes ?? '',
  }
}

export default function MotosPage() {
  const [motos, setMotos] = useState<Moto[]>(mockMotos)
  const [filter, setFilter] = useState('todas')
  const [busca, setBusca] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [detailsMoto, setDetailsMoto] = useState<Moto | null>(null)
  const [excluindo, setExcluindo] = useState<Moto | null>(null)

  // wizard de nova moto: passo 1 = dados básicos, passo 2 = bootstrap de manutenções
  const [step, setStep] = useState<1 | 2>(1)
  // { [itemId]: 'km em número' ou 'YYYY-MM-DD' }
  const [bootstrap, setBootstrap] = useState<Record<string, string>>({})

  const filtered = motos.filter((m) => {
    const passaFilter = filter === 'todas' || m.status === filter
    const passaBusca = !busca || [m.placa, m.modelo, m.marca, m.cor].some(
      (v) => v?.toLowerCase().includes(busca.toLowerCase())
    )
    return passaFilter && passaBusca
  })

  function openNovaMoto() {
    setEditingId(null)
    setForm(defaultForm)
    setBootstrap({})
    setStep(1)
    setModalOpen(true)
  }

  function fecharModal() {
    setModalOpen(false)
    setStep(1)
    setBootstrap({})
  }

  function openEditMoto(moto: Moto) {
    setEditingId(moto.id)
    setForm(motoToForm(moto))
    setModalOpen(true)
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    if (editingId) {
      handleSubmitFinal()
    } else {
      setStep(2)
    }
  }

  function handleSubmitFinal() {
    const motoData: Partial<Moto> = {
      placa: form.placa.toUpperCase(),
      modelo: form.modelo,
      marca: form.marca.toUpperCase(),
      ano: form.ano,
      cor: form.cor.toUpperCase(),
      renavam: form.renavam,
      chassi: form.chassi.toUpperCase(),
      combustivel: form.combustivel,
      potencia_cilindrada: form.potencia_cilindrada,
      dono_antigo: form.dono_antigo,
      cpf_dono_antigo: form.cpf_dono_antigo,
      data_compra: form.data_compra,
      valor_fipe: form.valor_fipe ? parseFloat(form.valor_fipe.replace(',', '.')) : undefined,
      manutencao_em_dia: form.manutencao_em_dia === 'true',
      status: form.status as MotoStatus,
      observacoes: form.observacoes,
      updated_at: new Date().toISOString(),
    }

    if (editingId) {
      setMotos((prev) =>
        prev.map((m) => (m.id === editingId ? { ...m, ...motoData } : m))
      )
    } else {
      const newMoto: Moto = {
        id: String(Date.now()),
        created_at: new Date().toISOString(),
        ...motoData,
      } as Moto
      setMotos((prev) => [newMoto, ...prev])
      // bootstrap: quando integrado ao Supabase, os registros de manutenção
      // serão criados aqui com base nos dados de `bootstrap`
    }

    fecharModal()
  }

  function confirmarExclusao() {
    if (!excluindo) return
    setMotos((prev) => prev.filter((m) => m.id !== excluindo.id))
    setExcluindo(null)
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Motos"
        subtitle={`${motos.length} motos cadastradas`}
        actions={
          <Button onClick={openNovaMoto}>
            <Plus className="w-4 h-4" />
            Nova Moto
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Filter Tabs + Busca */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  filter === opt.value
                    ? 'bg-[#BAFF1A] text-[#121212]'
                    : 'bg-[#202020] border border-[#333333] text-[#A0A0A0] hover:text-white hover:border-[#555555]'
                }`}
              >
                {opt.label}
                {opt.value !== 'todas' && (
                  <span className="ml-1.5 opacity-70">
                    ({motos.filter((m) => m.status === opt.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <input
              type="text"
              placeholder="Buscar por placa, modelo ou marca..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-lg bg-[#202020] border border-[#333333] text-sm text-white placeholder-[#A0A0A0] focus:outline-none focus:border-[#555555] w-64"
            />
          </div>
        </div>

        {/* Moto Cards Grid */}
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Bike className="w-12 h-12 text-[#888888] mx-auto mb-3" />
              <p className="text-[#A0A0A0]">Nenhuma moto encontrada</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((moto) => (
              <div
                key={moto.id}
                className={`bg-[#202020] border rounded-xl overflow-hidden transition-all duration-150 hover:border-[#555555] ${
                  cardBorderMap[moto.status] ?? 'border-[#333333]'
                }`}
              >
                {/* Photo placeholder */}
                <div className="h-36 bg-[#2a2a2a] flex items-center justify-center border-b border-[#333333] relative">
                  <div className="flex flex-col items-center gap-2 text-[#888888]">
                    <Bike className="w-12 h-12" />
                    <span className="text-xs">Sem foto</span>
                  </div>
                  {/* Maintenance badge */}
                  <div className="absolute top-2 right-2">
                    {moto.manutencao_em_dia ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Manutenção OK
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Revisão pendente
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white text-sm leading-tight">{moto.marca}/{moto.modelo}</p>
                      <p className="text-xs text-[#A0A0A0] mt-0.5">Ano {moto.ano}</p>
                    </div>
                    <StatusBadge status={moto.status} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#A0A0A0]">Placa</p>
                      <p className="text-sm font-mono font-semibold text-white">{moto.placa}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#A0A0A0]">Cor</p>
                      <p className="text-sm text-[#A0A0A0]">{moto.cor}</p>
                    </div>
                  </div>

                  {moto.valor_fipe && (
                    <div>
                      <p className="text-xs text-[#A0A0A0]">Valor FIPE</p>
                      <p className="text-sm text-[#BAFF1A] font-medium">{formatCurrency(moto.valor_fipe)}</p>
                    </div>
                  )}

                  {moto.observacoes && (
                    <p className="text-xs text-[#A0A0A0] line-clamp-2">{moto.observacoes}</p>
                  )}

                  <div className="flex items-center gap-2 pt-1 border-t border-[#333333]">
                    <button
                      onClick={() => setDetailsMoto(moto)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver detalhes
                    </button>
                    <button
                      onClick={() => openEditMoto(moto)}
                      className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExcluindo(moto)}
                      className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Nova / Editar Moto */}
      <Modal
        open={modalOpen}
        onClose={fecharModal}
        title={editingId ? 'Editar Moto' : step === 1 ? 'Nova Moto — Dados básicos (1/2)' : `Nova Moto — Manutenções (2/2)`}
        size="lg"
      >
        {/* ── Passo 1: dados básicos ─────────────────────────────────────── */}
        {(editingId || step === 1) && (
        <form onSubmit={handleStep1} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Placa"
              placeholder="SYF1C42"
              value={form.placa}
              onChange={(e) => setForm({ ...form, placa: e.target.value })}
              required
            />
            <Input
              label="RENAVAM"
              placeholder="00000000000"
              value={form.renavam}
              onChange={(e) => setForm({ ...form, renavam: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Marca"
              placeholder="HONDA"
              value={form.marca}
              onChange={(e) => setForm({ ...form, marca: e.target.value })}
              required
            />
            <Input
              label="Modelo"
              placeholder="CG 160 START"
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Ano (ex: 23/24)"
              placeholder="23/24"
              value={form.ano}
              onChange={(e) => setForm({ ...form, ano: e.target.value })}
              required
            />
            <Input
              label="Cor"
              placeholder="VERMELHA"
              value={form.cor}
              onChange={(e) => setForm({ ...form, cor: e.target.value })}
              required
            />
            <Select
              label="Combustível"
              options={combustivelOptions}
              value={form.combustivel}
              onChange={(e) => setForm({ ...form, combustivel: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Chassi"
              placeholder="9C2KC2500RR000000"
              value={form.chassi}
              onChange={(e) => setForm({ ...form, chassi: e.target.value })}
              required
            />
            <Input
              label="Potência/Cilindrada"
              placeholder="0CV/149"
              value={form.potencia_cilindrada}
              onChange={(e) => setForm({ ...form, potencia_cilindrada: e.target.value })}
            />
          </div>

          {/* Separador dados de compra */}
          <div className="border-t border-[#333333] pt-2">
            <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-3">Dados de Aquisição</p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nome do Dono Anterior"
                placeholder="Nome completo"
                value={form.dono_antigo}
                onChange={(e) => setForm({ ...form, dono_antigo: e.target.value })}
              />
              <Input
                label="CPF do Dono Anterior"
                placeholder="000.000.000-00"
                value={form.cpf_dono_antigo}
                onChange={(e) => setForm({ ...form, cpf_dono_antigo: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input
                label="Data de Compra"
                type="date"
                value={form.data_compra}
                onChange={(e) => setForm({ ...form, data_compra: e.target.value })}
              />
              <Input
                label="Valor FIPE (R$)"
                placeholder="15791.00"
                value={form.valor_fipe}
                onChange={(e) => setForm({ ...form, valor_fipe: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              options={statusOptions}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            />
            <Input
              label="KM Atual"
              type="number"
              placeholder="Ex: 12500"
              value={form.km_atual}
              onChange={(e) => setForm({ ...form, km_atual: e.target.value })}
            />
          </div>

          <Textarea
            label="Observações"
            placeholder="Informações adicionais sobre a moto..."
            rows={3}
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={fecharModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingId ? (
                <>
                  <Edit2 className="w-4 h-4" />
                  Salvar Alterações
                </>
              ) : (
                <>
                  Próximo: Manutenções →
                </>
              )}
            </Button>
          </div>
        </form>
        )}

        {/* ── Passo 2: bootstrap de manutenções (apenas nova moto) ──────── */}
        {!editingId && step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-[#A0A0A0]">
              Informe o <strong className="text-white">último km</strong> (ou data) de cada item.
              Deixe em branco se nunca foi feito — o sistema marcará como pendente.
            </p>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {BOOTSTRAP_ITENS.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-[#1A1A1A] rounded-lg px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{item.nome}</p>
                    <p className="text-xs text-[#555555]">{item.hint}</p>
                  </div>
                  {item.tipo === 'km' ? (
                    <input
                      type="number"
                      placeholder="Último km"
                      value={bootstrap[item.id] ?? ''}
                      onChange={(e) => setBootstrap((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      className="w-32 px-3 py-1.5 rounded-lg bg-[#2A2A2A] border border-[#333333] text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#555555] text-right"
                    />
                  ) : (
                    <input
                      type="date"
                      value={bootstrap[item.id] ?? ''}
                      onChange={(e) => setBootstrap((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      className="w-36 px-3 py-1.5 rounded-lg bg-[#2A2A2A] border border-[#333333] text-sm text-white focus:outline-none focus:border-[#555555]"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* resumo do que será gerado */}
            {Object.keys(bootstrap).filter((k) => bootstrap[k]).length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-400">
                {Object.keys(bootstrap).filter((k) => bootstrap[k]).length} item(s) configurados —
                agendamentos automáticos serão gerados na tela de Manutenção.
              </div>
            )}

            <div className="flex gap-3 justify-between pt-1">
              <Button variant="ghost" onClick={() => setStep(1)}>
                ← Voltar
              </Button>
              <Button onClick={handleSubmitFinal}>
                <Plus className="w-4 h-4" />
                Cadastrar Moto
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Confirmar Exclusão */}
      <Modal open={!!excluindo} onClose={() => setExcluindo(null)} title="Excluir Moto" size="sm">
        <div className="space-y-4">
          <p className="text-[#A0A0A0] text-sm">
            Tem certeza que deseja excluir a moto{' '}
            <span className="text-white font-medium">{excluindo?.marca}/{excluindo?.modelo} — {excluindo?.placa}</span>?
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

      {/* Modal Ver Detalhes */}
      {detailsMoto && (
        <Modal
          open={!!detailsMoto}
          onClose={() => setDetailsMoto(null)}
          title="Detalhes da Moto"
          size="lg"
        >
          <div className="space-y-5">
            {/* Header da moto */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#333333]">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {detailsMoto.marca}/{detailsMoto.modelo}
                </h3>
                <p className="text-sm text-[#A0A0A0] mt-0.5">Ano {detailsMoto.ano} · {detailsMoto.cor}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={detailsMoto.status} />
                {detailsMoto.manutencao_em_dia ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Manutenção OK
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-medium">
                    <AlertCircle className="w-3 h-3" />
                    Revisão pendente
                  </span>
                )}
              </div>
            </div>

            {/* Dados do veículo */}
            <div>
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-3">Dados do Veículo</p>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow label="Placa" value={detailsMoto.placa} mono />
                <DetailRow label="RENAVAM" value={detailsMoto.renavam} mono />
                <DetailRow label="Chassi" value={detailsMoto.chassi} mono />
                <DetailRow label="Combustível" value={detailsMoto.combustivel} />
                <DetailRow label="Potência/Cilindrada" value={detailsMoto.potencia_cilindrada} />
                <DetailRow label="ID" value={`#${detailsMoto.id}`} />
              </div>
            </div>

            {/* Dados de aquisição */}
            {(detailsMoto.dono_antigo || detailsMoto.data_compra || detailsMoto.valor_fipe) && (
              <div>
                <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-3">Dados de Aquisição</p>
                <div className="grid grid-cols-2 gap-3">
                  {detailsMoto.dono_antigo && (
                    <DetailRow label="Dono Anterior" value={detailsMoto.dono_antigo} fullWidth />
                  )}
                  {detailsMoto.cpf_dono_antigo && (
                    <DetailRow label="CPF do Dono Anterior" value={detailsMoto.cpf_dono_antigo} mono />
                  )}
                  {detailsMoto.data_compra && (
                    <DetailRow
                      label="Data de Compra"
                      value={new Date(detailsMoto.data_compra + 'T12:00:00').toLocaleDateString('pt-BR')}
                    />
                  )}
                  {detailsMoto.valor_fipe && (
                    <DetailRow
                      label="Valor FIPE"
                      value={formatCurrency(detailsMoto.valor_fipe)}
                      highlight
                    />
                  )}
                </div>
              </div>
            )}

            {/* Observações */}
            {detailsMoto.observacoes && (
              <div>
                <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Observações</p>
                <p className="text-sm text-[#A0A0A0] bg-[#2a2a2a] rounded-lg p-3 leading-relaxed">
                  {detailsMoto.observacoes}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-[#333333]">
              <Button
                variant="ghost"
                onClick={() => setDetailsMoto(null)}
              >
                Fechar
              </Button>
              <Button
                onClick={() => {
                  setDetailsMoto(null)
                  openEditMoto(detailsMoto)
                }}
              >
                <Edit2 className="w-4 h-4" />
                Editar Moto
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function DetailRow({
  label,
  value,
  mono = false,
  highlight = false,
  fullWidth = false,
}: {
  label: string
  value?: string | number | null
  mono?: boolean
  highlight?: boolean
  fullWidth?: boolean
}) {
  if (!value) return null
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <p className="text-xs text-[#A0A0A0] mb-0.5">{label}</p>
      <p
        className={`text-sm ${mono ? 'font-mono' : ''} ${
          highlight ? 'text-[#BAFF1A] font-medium' : 'text-white'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
