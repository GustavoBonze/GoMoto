'use client'

import { useRef, useState } from 'react'
import { Plus, Edit2, Trash2, Eye, Search, CheckCircle, AlertCircle, FolderOpen, Upload, FileText, X, ExternalLink, UserX, ChevronDown, ChevronUp, DollarSign, History } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import type { Cliente, Documento, DocumentoTipo, HistoricoLocacaoCliente } from '@/types'

// ——— Tipos de documentos disponíveis ———
const DOC_LABELS: Record<DocumentoTipo, string> = {
  cnh: 'CNH',
  comprovante_residencia: 'Comprovante de Residência',
  contrato: 'Contrato',
  identificacao: 'RG / Identificação',
  caucao: 'Comprovante de Caução',
  outro: 'Outro',
}

const DOC_TIPOS: { value: DocumentoTipo; label: string }[] = Object.entries(DOC_LABELS).map(
  ([value, label]) => ({ value: value as DocumentoTipo, label })
)

// ——— Dados mock ———
const mockClientes: Cliente[] = [
  {
    id: '1', nome: 'FABRICIO DO VALE NEPOMUCENO', cpf: '129.616.867-09', rg: '207189267', uf: 'RJ',
    telefone: '21 98776-4348', email: '', endereco: 'R ADELINO 12 - ROLLAS 2 - SANTA CRUZ - RIO DE JANEIRO - RJ',
    cep: '23590-170', contato_emergencia: 'MÃE: (21) 99184-7214 | IRMÃO: (21) 96577-2573',
    cnh: '4372430975', cnh_validade: '', cnh_categoria: 'A', status_pagamento: 'Caução pago',
    na_fila: false, observacoes: '', documentos: [],
    created_at: '2025-06-20T10:00:00Z', updated_at: '2025-06-20T10:00:00Z',
  },
  {
    id: '2', nome: 'DOUGLAS DOS SANTOS SIMÔES', cpf: '173.964.027-60', rg: '300246329', uf: 'RJ',
    telefone: '21 97389-7602', email: '', endereco: 'ESTRADA DE SEPETIBA N 595 - BLOCO 09 CASA 02 - SANTA CRUZ - RIO DE JANEIRO - RJ',
    cep: '23520-660', contato_emergencia: 'ESPOSA: (21) 96683-1232 | MÃE: (21) 97876-1439',
    cnh: '7601971200', cnh_validade: '', cnh_categoria: 'A', status_pagamento: 'Caução pago',
    na_fila: false, observacoes: '', documentos: [],
    created_at: '2025-10-23T10:00:00Z', updated_at: '2025-10-23T10:00:00Z',
  },
  {
    id: '3', nome: 'FLAVIO SILVA COUTINHO', cpf: '054.666.677-41', rg: '8466667741', uf: 'RJ',
    telefone: '21 96445-2588', email: '', endereco: 'RUA ITAMBARACA SN CASA 2 LT 11 QD 124 - COSMOS - RIO DE JANEIRO - RJ',
    cep: '23060-070', contato_emergencia: 'GUILHERME (filho): (21) 95947-8641 | MARIANA (filha): (21) 95904-1370',
    cnh: '4201494036', cnh_validade: '', cnh_categoria: 'A', status_pagamento: 'Caução pago',
    na_fila: false, observacoes: '', documentos: [],
    created_at: '2025-02-06T10:00:00Z', updated_at: '2025-02-06T10:00:00Z',
  },
  {
    id: '4', nome: 'ALEXANDRE DANTAS DAS SILVA', cpf: '099.762.467-14', rg: '12488178', uf: 'RJ',
    telefone: '21 98116-5350', email: '', endereco: 'CAMINHO DE TUTOIA 1SN QD 120 FUNDOS - COSMOS - RIO DE JANEIRO - RJ',
    cep: '23060-275', contato_emergencia: '(21) 98116-5350',
    cnh: '9225925768', cnh_validade: '', cnh_categoria: 'A', status_pagamento: 'Caução pago',
    na_fila: false, observacoes: '', documentos: [],
    created_at: '2026-03-09T10:00:00Z', updated_at: '2026-03-09T10:00:00Z',
  },
  // ——— Ex-clientes ———
  {
    id: 'ex1', nome: 'JOHNNY TAVARES', cpf: '145.525.957-84', rg: '271370075', uf: 'RJ',
    telefone: '21 98662-9070', email: '', endereco: 'AV. JOÃO XXIII, 1050 BL 08 APT 401 MIKONOS - SANTA CRUZ - RIO DE JANEIRO - RJ',
    cep: '23560-903', contato_emergencia: '',
    cnh: '', cnh_validade: '', cnh_categoria: 'A', status_pagamento: '',
    na_fila: false, ativo: false,
    data_saida: '2024-10-15',
    motivo_saida: 'Encerrou contrato com dívida em aberto.',
    historico_locacao: [
      { data_inicio: '2024-06-01', data_fim: '2024-10-15', moto_placa: 'BBB1B11', moto_modelo: 'YAMAHA/YS150 FAZER SED', motivo_saida: 'Encerrou contrato com dívida em aberto.', valor_devido: 850 },
    ],
    observacoes: 'Motorista de aplicativo. Comprovante de residência de Realengo — pendência de Santa Cruz.', documentos: [],
    created_at: '2024-06-01T10:00:00Z', updated_at: '2024-10-15T10:00:00Z',
  },
  {
    id: 'ex2', nome: 'ANDERSON LIMA', cpf: '143.985.447-55', rg: '268137676', uf: 'RJ',
    telefone: '21 97632-6541', email: '', endereco: 'ESTRADA DA PEDRA, 1700 - GUARATIBA - RIO DE JANEIRO - RJ',
    cep: '23030-380', contato_emergencia: '',
    cnh: '', cnh_validade: '', cnh_categoria: 'A', status_pagamento: '',
    na_fila: false, ativo: false,
    data_saida: '2025-01-20',
    motivo_saida: 'Abandonou a moto e sumiu com dívida em aberto.',
    historico_locacao: [
      { data_inicio: '2024-08-01', data_fim: '2025-01-20', moto_placa: 'AAA0A00', moto_modelo: 'HONDA/CG 160 START', motivo_saida: 'Abandonou a moto e sumiu com dívida em aberto.', valor_devido: 1200 },
    ],
    observacoes: '', documentos: [],
    created_at: '2024-08-01T10:00:00Z', updated_at: '2025-01-20T10:00:00Z',
  },
]

const defaultForm = {
  nome: '', cpf: '', rg: '', uf: 'RJ', telefone: '', email: '',
  endereco: '', cep: '', contato_emergencia: '',
  cnh: '', cnh_validade: '', cnh_categoria: '', status_pagamento: '', observacoes: '',
}

function clienteToForm(c: Cliente) {
  return {
    nome: c.nome, cpf: c.cpf, rg: c.rg ?? '', uf: c.uf ?? 'RJ',
    telefone: c.telefone, email: c.email ?? '',
    endereco: c.endereco ?? '', cep: c.cep ?? '',
    contato_emergencia: c.contato_emergencia ?? '',
    cnh: c.cnh, cnh_validade: c.cnh_validade ?? '',
    cnh_categoria: c.cnh_categoria ?? '',
    status_pagamento: c.status_pagamento ?? '',
    observacoes: c.observacoes ?? '',
  }
}

const ufOptions = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
].map((uf) => ({ value: uf, label: uf }))

function getDocIcon(tipo: DocumentoTipo) {
  const colors: Record<DocumentoTipo, string> = {
    cnh: 'text-blue-400', comprovante_residencia: 'text-green-400',
    contrato: 'text-purple-400', identificacao: 'text-yellow-400',
    caucao: 'text-[#BAFF1A]', outro: 'text-[#A0A0A0]',
  }
  return colors[tipo] ?? 'text-[#A0A0A0]'
}

// ——— Card de ex-cliente ———
function ExClienteCard({ cliente }: { cliente: Cliente }) {
  const [expanded, setExpanded] = useState(false)
  const totalDivida = (cliente.historico_locacao ?? []).reduce((sum, h) => sum + (h.valor_devido ?? 0), 0)

  return (
    <div className="bg-[#202020] border border-[#2a2a2a] rounded-xl overflow-hidden opacity-75">
      <div className="flex items-center gap-3 p-4">
        <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
          <UserX className="w-4 h-4 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm text-[#A0A0A0]">{cliente.nome}</p>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              <UserX className="w-3 h-3" /> Ex-cliente
            </span>
            {totalDivida > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
                <DollarSign className="w-3 h-3" />
                Deve R$ {totalDivida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <p className="text-xs text-[#A0A0A0] font-mono">{cliente.cpf}</p>
            {cliente.data_saida && (
              <p className="text-xs text-[#A0A0A0]">
                Saiu em {new Date(cliente.data_saida + 'T12:00:00').toLocaleDateString('pt-BR')}
              </p>
            )}
            {cliente.motivo_saida && (
              <p className="text-xs text-red-400/70 truncate max-w-xs">{cliente.motivo_saida}</p>
            )}
          </div>
        </div>
        {(cliente.historico_locacao ?? []).length > 0 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-[#A0A0A0] hover:bg-white/5 transition-colors flex-shrink-0"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {expanded && (
        <div className="border-t border-[#2a2a2a] px-4 pb-4 pt-3 space-y-3">
          <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Histórico de locações</p>
          {(cliente.historico_locacao ?? []).map((h: HistoricoLocacaoCliente, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-[#2a2a2a] space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                {h.moto_placa && <span className="font-mono text-xs text-white font-semibold">{h.moto_placa}</span>}
                {h.moto_modelo && <span className="text-xs text-[#A0A0A0]">{h.moto_modelo}</span>}
                <span className="text-xs text-[#A0A0A0]">
                  {new Date(h.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR')}
                  {h.data_fim && ` → ${new Date(h.data_fim + 'T12:00:00').toLocaleDateString('pt-BR')}`}
                </span>
              </div>
              <p className="text-xs text-orange-400">{h.motivo_saida}</p>
              {h.valor_devido && (
                <span className="flex items-center gap-1 text-xs text-red-400 font-semibold">
                  <DollarSign className="w-3 h-3" />
                  Deve R$ {h.valor_devido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          ))}
          {cliente.observacoes && (
            <p className="text-xs text-[#A0A0A0] italic">{cliente.observacoes}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ——— Modal de Documentos ———
function DocumentosModal({
  cliente,
  onClose,
  onUpdate,
}: {
  cliente: Cliente
  onClose: () => void
  onUpdate: (id: string, docs: Documento[]) => void
}) {
  const [docs, setDocs] = useState<Documento[]>(cliente.documentos ?? [])
  const [tipoSelecionado, setTipoSelecionado] = useState<DocumentoTipo>('cnh')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const novo: Documento = {
      id: String(Date.now()),
      tipo: tipoSelecionado,
      nome: file.name,
      url: URL.createObjectURL(file),
      uploaded_at: new Date().toISOString(),
    }
    const updated = [...docs, novo]
    setDocs(updated)
    onUpdate(cliente.id, updated)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleRemover(id: string) {
    const updated = docs.filter((d) => d.id !== id)
    setDocs(updated)
    onUpdate(cliente.id, updated)
  }

  const docsOrdenados = [...docs].sort((a, b) => a.tipo.localeCompare(b.tipo))

  return (
    <Modal open onClose={onClose} title="Documentos" size="lg">
      <div className="space-y-5">
        {/* Cabeçalho cliente */}
        <div className="p-3 rounded-lg bg-white/[0.03] border border-[#333333]">
          <p className="text-xs text-[#A0A0A0]">Cliente</p>
          <p className="font-semibold text-white">{cliente.nome}</p>
          <p className="text-xs text-[#A0A0A0] font-mono">{cliente.cpf}</p>
        </div>

        {/* Upload */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Select
              label="Tipo de documento"
              options={DOC_TIPOS}
              value={tipoSelecionado}
              onChange={(e) => setTipoSelecionado(e.target.value as DocumentoTipo)}
            />
          </div>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.webp" />
          <Button onClick={() => fileRef.current?.click()} variant="secondary">
            <Upload className="w-4 h-4" />
            Enviar arquivo
          </Button>
        </div>

        {/* Lista de documentos */}
        {docsOrdenados.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-[#333333] rounded-xl">
            <FolderOpen className="w-8 h-8 text-[#888888] mx-auto mb-2" />
            <p className="text-sm text-[#A0A0A0]">Nenhum documento enviado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {docsOrdenados.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#2a2a2a] border border-[#333333]">
                <FileText className={`w-4 h-4 flex-shrink-0 ${getDocIcon(doc.tipo)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{doc.nome}</p>
                  <p className="text-xs text-[#A0A0A0]">
                    {DOC_LABELS[doc.tipo]} · {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
                      title="Visualizar"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleRemover(doc.id)}
                    className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-colors"
                    title="Remover"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Checklist de documentos obrigatórios */}
        <div className="border-t border-[#333333] pt-4">
          <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-3">Documentos obrigatórios</p>
          <div className="grid grid-cols-2 gap-2">
            {(['cnh', 'identificacao', 'comprovante_residencia', 'contrato', 'caucao'] as DocumentoTipo[]).map((tipo) => {
              const enviado = docs.some((d) => d.tipo === tipo)
              return (
                <div key={tipo} className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg ${
                  enviado ? 'text-green-400 bg-green-500/5' : 'text-[#A0A0A0] bg-white/[0.02]'
                }`}>
                  {enviado
                    ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  }
                  {DOC_LABELS[tipo]}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </Modal>
  )
}

// ——— Componente principal ———
export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [detailsCliente, setDetailsCliente] = useState<Cliente | null>(null)
  const [deleteCliente, setDeleteCliente] = useState<Cliente | null>(null)
  const [docsCliente, setDocsCliente] = useState<Cliente | null>(null)
  const [showExClientes, setShowExClientes] = useState(false)

  const ativos = clientes.filter((c) => c.ativo !== false)
  const exClientes = clientes.filter((c) => c.ativo === false)

  const tabsStatus = [
    { label: 'Todos', value: 'todos' },
    { label: 'Ativos', value: 'ativo' },
    { label: 'Na Fila', value: 'fila' },
  ]

  const [filtroStatus, setFiltroStatus] = useState('todos')

  const filtered = ativos.filter((c) => {
    const passaBusca =
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.cpf.includes(search) ||
      c.telefone.includes(search)
    const passFiltro =
      filtroStatus === 'fila' ? c.na_fila === true :
      filtroStatus === 'ativo' ? !c.na_fila :
      true
    return passaBusca && passFiltro
  })

  function openNovoCliente() { setEditingId(null); setForm(defaultForm); setModalOpen(true) }
  function openEditCliente(c: Cliente) { setEditingId(c.id); setForm(clienteToForm(c)); setModalOpen(true) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data: Partial<Cliente> = {
      nome: form.nome.toUpperCase(), cpf: form.cpf, rg: form.rg, uf: form.uf,
      telefone: form.telefone, email: form.email, endereco: form.endereco, cep: form.cep,
      contato_emergencia: form.contato_emergencia,
      cnh: form.cnh, cnh_validade: form.cnh_validade, cnh_categoria: form.cnh_categoria,
      status_pagamento: form.status_pagamento, observacoes: form.observacoes,
      updated_at: new Date().toISOString(),
    }
    if (editingId) {
      setClientes((prev) => prev.map((c) => (c.id === editingId ? { ...c, ...data } : c)))
    } else {
      setClientes((prev) => [{
        id: String(Date.now()), na_fila: false, documentos: [],
        created_at: new Date().toISOString(), ...data,
      } as Cliente, ...prev])
    }
    setModalOpen(false)
  }

  function handleDelete(c: Cliente) {
    setClientes((prev) => prev.filter((x) => x.id !== c.id))
    setDeleteCliente(null)
  }

  function handleUpdateDocs(clienteId: string, docs: Documento[]) {
    setClientes((prev) => prev.map((c) => c.id === clienteId ? { ...c, documentos: docs } : c))
    // atualiza o modal aberto também
    setDocsCliente((prev) => prev && prev.id === clienteId ? { ...prev, documentos: docs } : prev)
  }

  const columns = [
    {
      key: 'nome', header: 'Nome',
      render: (row: Cliente) => (
        <div>
          <p className="font-medium text-white text-sm">{row.nome}</p>
          <p className="text-xs text-[#A0A0A0] font-mono mt-0.5">{row.cpf}</p>
        </div>
      ),
    },
    {
      key: 'telefone', header: 'Telefone',
      render: (row: Cliente) => {
        const numero = row.telefone.replace(/\D/g, '')
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">{row.telefone}</span>
            <a href={`https://web.whatsapp.com/send?phone=55${numero}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="opacity-80 hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 32 32" className="w-4 h-4"><path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.742 5.493 2.043 7.805L0 32l8.418-2.01A15.937 15.937 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0z" fill="#25D366"/><path d="M23.07 19.44c-.356-.178-2.107-1.04-2.434-1.16-.327-.12-.565-.178-.803.178-.238.356-.921 1.16-1.129 1.397-.208.238-.416.267-.772.089-.356-.178-1.503-.554-2.863-1.766-1.058-.944-1.772-2.109-1.98-2.465-.208-.356-.022-.548.156-.726.16-.16.356-.416.534-.624.178-.208.237-.356.356-.594.119-.238.06-.446-.03-.624-.089-.178-.803-1.935-1.1-2.649-.29-.695-.585-.6-.803-.611l-.683-.012c-.238 0-.624.089-.951.446-.327.356-1.248 1.219-1.248 2.974 0 1.754 1.278 3.449 1.456 3.687.178.238 2.514 3.836 6.092 5.381.852.367 1.517.587 2.035.752.855.272 1.634.234 2.249.142.686-.102 2.107-.861 2.404-1.693.297-.832.297-1.545.208-1.693-.089-.149-.327-.238-.683-.416z" fill="#fff"/></svg>
            </a>
          </div>
        )
      },
    },
    {
      key: 'cnh', header: 'CNH',
      render: (row: Cliente) => (
        <div>
          <p className="font-mono text-sm text-white">{row.cnh}</p>
          {row.cnh_validade
            ? <p className="text-xs text-[#A0A0A0] mt-0.5">Válida até {new Date(row.cnh_validade + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
            : <p className="text-xs text-amber-400/70 mt-0.5">Validade pendente</p>
          }
        </div>
      ),
    },
    {
      key: 'docs', header: 'Docs',
      render: (row: Cliente) => {
        const total = row.documentos?.length ?? 0
        const obrigatorios: DocumentoTipo[] = ['cnh', 'identificacao', 'comprovante_residencia', 'contrato', 'caucao']
        const ok = obrigatorios.filter((t) => row.documentos?.some((d) => d.tipo === t)).length
        return (
          <span className={`text-xs font-medium ${ok === obrigatorios.length ? 'text-green-400' : ok > 0 ? 'text-amber-400' : 'text-[#A0A0A0]'}`}>
            {total === 0 ? '—' : `${ok}/${obrigatorios.length}`}
          </span>
        )
      },
    },
    {
      key: 'status_pagamento', header: 'Caução',
      render: (row: Cliente) =>
        row.status_pagamento ? (
          <span className="flex items-center gap-1 text-xs text-green-400">
            <CheckCircle className="w-3.5 h-3.5" /> Pago
          </span>
        ) : <span className="text-xs text-[#A0A0A0]">—</span>,
    },
    {
      key: 'na_fila', header: 'Status',
      render: (row: Cliente) => row.na_fila
        ? <Badge variant="warning">Na fila</Badge>
        : <Badge variant="success">Ativo</Badge>,
    },
    {
      key: 'acoes', header: 'Ações',
      render: (row: Cliente) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setDetailsCliente(row)} className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors" title="Ver detalhes">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => openEditCliente(row)} className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors" title="Editar">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => setDocsCliente(row)} className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-[#BAFF1A] hover:bg-[#BAFF1A]/5 transition-colors" title="Documentos">
            <FolderOpen className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteCliente(row)} className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-colors" title="Excluir">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Clientes"
        subtitle={`${ativos.length} clientes ativos`}
        actions={
          <Button onClick={openNovoCliente}>
            <Plus className="w-4 h-4" /> Novo Cliente
          </Button>
        }
      />

      <div className="p-6 space-y-4">
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
                {tab.value !== 'todos' && (
                  <span className="ml-1.5 opacity-70">
                    ({tab.value === 'fila'
                      ? ativos.filter((c) => c.na_fila).length
                      : ativos.filter((c) => !c.na_fila).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <input
              type="text" placeholder="Buscar por nome, CPF ou telefone..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-lg bg-[#202020] border border-[#333333] text-sm text-white placeholder-[#A0A0A0] focus:outline-none focus:border-[#555555] w-72"
            />
          </div>
        </div>
        <Card padding="none">
          <Table columns={columns} data={filtered} keyExtractor={(row) => row.id} emptyMessage="Nenhum cliente encontrado" />
        </Card>

        {/* ——— Ex-clientes ——— */}
        {exClientes.length > 0 && (
          <div>
            <button
              onClick={() => setShowExClientes((v) => !v)}
              className="flex items-center gap-2 text-xs text-[#A0A0A0] hover:text-[#A0A0A0] transition-colors py-2"
            >
              <History className="w-3.5 h-3.5" />
              {showExClientes ? 'Ocultar ex-clientes' : `Ver ex-clientes (${exClientes.length})`}
              {showExClientes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showExClientes && (
              <div className="space-y-3 pt-1">
                {exClientes.map((c) => (
                  <ExClienteCard key={c.id} cliente={c} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Novo / Editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Cliente' : 'Novo Cliente'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome completo" placeholder="NOME COMPLETO" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            <Input label="CPF" placeholder="000.000.000-00" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="RG" placeholder="000000000" value={form.rg} onChange={(e) => setForm({ ...form, rg: e.target.value })} />
            <Select label="UF" options={ufOptions} value={form.uf} onChange={(e) => setForm({ ...form, uf: e.target.value })} />
            <Input label="Telefone" placeholder="21 99999-0000" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Endereço" placeholder="Rua, número - Bairro - Cidade - UF" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
            <Input label="CEP" placeholder="00000-000" value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} />
          </div>
          <Textarea label="Contato de Emergência" placeholder="Nome (parentesco): (21) 99999-0000" rows={2} value={form.contato_emergencia} onChange={(e) => setForm({ ...form, contato_emergencia: e.target.value })} />
          <div className="border-t border-[#333333] pt-2">
            <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-3">CNH</p>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Número da CNH" placeholder="00000000000" value={form.cnh} onChange={(e) => setForm({ ...form, cnh: e.target.value })} required />
              <Input label="Validade CNH" type="date" value={form.cnh_validade} onChange={(e) => setForm({ ...form, cnh_validade: e.target.value })} />
              <Input label="Categoria" placeholder="A, AB..." value={form.cnh_categoria} onChange={(e) => setForm({ ...form, cnh_categoria: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="E-mail" type="email" placeholder="cliente@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Status do Pagamento (Caução)" placeholder="Caução pago" value={form.status_pagamento} onChange={(e) => setForm({ ...form, status_pagamento: e.target.value })} />
          </div>
          <Textarea label="Observações" placeholder="Informações adicionais..." rows={2} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">
              {editingId ? <><Edit2 className="w-4 h-4" /> Salvar Alterações</> : <><Plus className="w-4 h-4" /> Cadastrar Cliente</>}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Ver Detalhes */}
      {detailsCliente && (
        <Modal open={!!detailsCliente} onClose={() => setDetailsCliente(null)} title="Detalhes do Cliente" size="lg">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#333333]">
              <div>
                <h3 className="text-lg font-bold text-white">{detailsCliente.nome}</h3>
                <p className="text-sm text-[#A0A0A0] font-mono mt-0.5">{detailsCliente.cpf}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {detailsCliente.na_fila ? <Badge variant="warning">Na fila</Badge> : <Badge variant="success">Ativo</Badge>}
                {detailsCliente.status_pagamento && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle className="w-3.5 h-3.5" /> {detailsCliente.status_pagamento}
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-3">Dados Pessoais</p>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-[#A0A0A0]">RG</p><p className="text-sm text-white font-mono">{detailsCliente.rg || '—'}</p></div>
                <div><p className="text-xs text-[#A0A0A0]">UF</p><p className="text-sm text-white">{detailsCliente.uf || '—'}</p></div>
                <div><p className="text-xs text-[#A0A0A0]">Telefone</p><p className="text-sm text-white">{detailsCliente.telefone}</p></div>
                <div><p className="text-xs text-[#A0A0A0]">E-mail</p><p className="text-sm text-white">{detailsCliente.email || '—'}</p></div>
                <div className="col-span-2"><p className="text-xs text-[#A0A0A0]">Endereço</p><p className="text-sm text-[#A0A0A0]">{detailsCliente.endereco || '—'}</p></div>
                <div><p className="text-xs text-[#A0A0A0]">CEP</p><p className="text-sm text-white font-mono">{detailsCliente.cep || '—'}</p></div>
              </div>
            </div>
            {detailsCliente.contato_emergencia && (
              <div>
                <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">Contato de Emergência</p>
                <p className="text-sm text-[#A0A0A0] bg-[#2a2a2a] rounded-lg p-3">{detailsCliente.contato_emergencia}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-3">CNH</p>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-[#A0A0A0]">Número</p><p className="text-sm text-white font-mono">{detailsCliente.cnh}</p></div>
                <div><p className="text-xs text-[#A0A0A0]">Categoria</p><p className="text-sm text-white">{detailsCliente.cnh_categoria || '—'}</p></div>
                <div>
                  <p className="text-xs text-[#A0A0A0]">Validade</p>
                  {detailsCliente.cnh_validade
                    ? <p className="text-sm text-white">{new Date(detailsCliente.cnh_validade + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                    : <span className="flex items-center gap-1 text-xs text-amber-400"><AlertCircle className="w-3.5 h-3.5" /> Pendente</span>
                  }
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-[#333333]">
              <Button variant="ghost" onClick={() => setDetailsCliente(null)}>Fechar</Button>
              <Button variant="secondary" onClick={() => { setDetailsCliente(null); setDocsCliente(detailsCliente) }}>
                <FolderOpen className="w-4 h-4" /> Documentos
              </Button>
              <Button onClick={() => { setDetailsCliente(null); openEditCliente(detailsCliente) }}>
                <Edit2 className="w-4 h-4" /> Editar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Documentos */}
      {docsCliente && (
        <DocumentosModal
          cliente={clientes.find((c) => c.id === docsCliente.id) ?? docsCliente}
          onClose={() => setDocsCliente(null)}
          onUpdate={handleUpdateDocs}
        />
      )}

      {/* Modal Excluir */}
      {deleteCliente && (
        <Modal open={!!deleteCliente} onClose={() => setDeleteCliente(null)} title="Excluir Cliente" size="sm">
          <div className="space-y-4">
            <p className="text-[#A0A0A0] text-sm">
              Tem certeza que deseja excluir <span className="text-white font-semibold">{deleteCliente.nome}</span>?
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => setDeleteCliente(null)}>Cancelar</Button>
              <Button variant="danger" onClick={() => handleDelete(deleteCliente)}>
                <Trash2 className="w-4 h-4" /> Excluir
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
