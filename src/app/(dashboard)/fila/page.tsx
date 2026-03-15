'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Clock, MapPin, ChevronDown, ChevronUp, UserPlus, Bike, ArrowRight, Trash2,
  Target, ClipboardList, FileText, ShieldX, AlertTriangle, History,
  FolderOpen, Upload, X, ExternalLink, CheckCircle, AlertCircle,
  ArrowUp, ArrowDown, UserX, DollarSign, Search,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import type { Documento, DocumentoTipo, MovimentacaoFila } from '@/types'
import { TODAS_MOTOS, LS_MOTOS_ALOCADAS, LS_FILA, LS_NEW_CONTRACTS } from '@/data/motos'

type Alerta = 'calote' | 'fraude'

interface HistoricoLocacao {
  data_inicio: string
  data_fim?: string
  moto_placa?: string
  moto_modelo?: string
  motivo_saida: string
  valor_devido?: number
}

interface HistoricoFila {
  data_entrada: string
  data_saida?: string
  motivo_saida?: string
}

interface PessoaNaFila {
  id: string
  posicao: number
  nome: string
  cpf?: string
  telefone: string
  endereco?: string
  identificacao?: string
  objetivo?: string
  andamento?: string
  social?: string
  entrou_na_fila: string
  alerta?: Alerta
  ex_cliente?: boolean
  historico_locacao?: HistoricoLocacao[]
  historico_fila?: HistoricoFila[]
  documentos: Documento[]
  historico_posicao: MovimentacaoFila[]
}

// Documentos obrigatórios para entrar na fila
const DOCS_OBRIGATORIOS: DocumentoTipo[] = ['cnh', 'comprovante_residencia']
const DOC_LABELS: Record<DocumentoTipo, string> = {
  cnh: 'CNH',
  comprovante_residencia: 'Comprovante de Residência',
  contrato: 'Contrato',
  identificacao: 'RG / Identificação',
  caucao: 'Caução',
  outro: 'Outro',
}
// Na fila só aceita CNH, comp. residência, identificação e outros
const DOC_TIPOS: { value: DocumentoTipo; label: string }[] = [
  { value: 'cnh', label: 'CNH' },
  { value: 'comprovante_residencia', label: 'Comprovante de Residência' },
  { value: 'identificacao', label: 'RG / Identificação' },
  { value: 'outro', label: 'Outro' },
]

const mockFila: PessoaNaFila[] = [
  { id: '1',  posicao: 1,  nome: 'Felipe Cardoso',        telefone: '21981751172', social: 'https://www.instagram.com/2767_felipe/',           entrou_na_fila: '2026-02-20', documentos: [], historico_posicao: [] },
  { id: '2',  posicao: 2,  nome: 'Keven Dantas',          telefone: '21979955712', social: 'https://www.instagram.com/kevendantasbfr/',         entrou_na_fila: '2026-02-22', documentos: [], historico_posicao: [] },
  { id: '3',  posicao: 3,  nome: 'Eduardo Araújo',        telefone: '21977271141', social: 'https://www.instagram.com/eduaraujorj/',            entrou_na_fila: '2026-02-25', documentos: [], historico_posicao: [] },
  { id: '4',  posicao: 4,  nome: 'Bruno Gonçalves Gomes', telefone: '21991271801', social: 'https://www.facebook.com/bruno.goncalvesgomes.35', entrou_na_fila: '2026-02-28', documentos: [], historico_posicao: [] },
  { id: '5',  posicao: 5,  nome: 'Bruno Torres',          telefone: '21999356887', social: 'https://www.instagram.com/brunotorresoficial',      entrou_na_fila: '2026-03-01', documentos: [], historico_posicao: [] },
  { id: '6',  posicao: 6,  nome: 'Flavio Conceicao',      telefone: '21970390979', social: 'https://www.instagram.com/flavio.conceicao.tdb',   entrou_na_fila: '2026-03-03', documentos: [], historico_posicao: [] },
  { id: '7',  posicao: 7,  nome: 'Rodrigo Santos',        telefone: '21996722289', social: 'https://www.instagram.com/rodrigo_sannx',          entrou_na_fila: '2026-03-05', documentos: [], historico_posicao: [] },
  { id: '8',  posicao: 8,  nome: 'Anderson Barros',       telefone: '21973654490', social: 'https://www.instagram.com/euandersonbarros11/',     entrou_na_fila: '2026-03-07', documentos: [], historico_posicao: [] },
  { id: '12', posicao: 9,  nome: 'Leandro Bezerra',       telefone: '22988248400', social: 'https://www.facebook.com/leandro.bezerra.1232',    entrou_na_fila: '2026-03-08', documentos: [], historico_posicao: [] },
  {
    id: '9', posicao: 10, nome: 'Braz Lima', cpf: '060.415.307-43', telefone: '21981611640',
    endereco: 'RUA PEDRO PREREIRA DA SILVA N° 722 - CASA 103 - SANTA CRUZ - RIO DE JANEIRO - CEP 23590-170',
    identificacao: '14089S162', objetivo: 'Uso pessoal. Trabalha com insulfilm de automotivos e residências.',
    andamento: '05/02/25 — Interesse na CG. Combinamos para ver a moto dia 06/02 às 10h na Praça do Pedrinho.\n06/02/25 — Não compareceu e não deu retorno.',
    social: 'https://www.instagram.com/lima.brazde/', entrou_na_fila: '2025-02-05', alerta: 'fraude',
    documentos: [], historico_posicao: [],
  },
  {
    id: '11', posicao: 11, nome: 'Mauricio Barbosa', cpf: '123.827.187-14', telefone: '21966566340',
    endereco: 'RUA DAS AMOREIRAS N 140, BL 2 AP 103 - COSMOS - RIO DE JANEIRO - CEP 23.056-630',
    identificacao: '218439255', objetivo: 'Motorista de aplicativo.',
    andamento: '05/02/25 — Interesse na CG. Aguardando andamento com Braz.',
    social: 'https://www.instagram.com/mauricio_b.f/', entrou_na_fila: '2025-02-05',
    documentos: [], historico_posicao: [],
  },
]

const defaultForm = { nome: '', cpf: '', telefone: '', endereco: '', identificacao: '', objetivo: '', andamento: '', social: '' }

// Motos reutilizadas de @/data/motos — fonte única de dados
// TODO Supabase: substituir por query motos.status = 'disponivel'
const VALOR_DEFAULT: Record<string, string> = { '1': '350', '2': '630', '3': '350' }

const defaultAlocarForm = {
  tipo: '1',
  moto_id: '',
  valor_periodo: '350',
  data_inicio: new Date().toISOString().split('T')[0],
}

function getDias(data: string) {
  return Math.floor((new Date().getTime() - new Date(data + 'T12:00:00').getTime()) / (1000 * 60 * 60 * 24))
}
function isExpirado(p: PessoaNaFila) { return !p.alerta && getDias(p.entrou_na_fila) >= 30 }
function isFacebook(url: string) { return url.includes('facebook.com') }

function getProntidao(p: PessoaNaFila) {
  const ok = DOCS_OBRIGATORIOS.filter((t) => p.documentos.some((d) => d.tipo === t)).length
  return { ok, total: DOCS_OBRIGATORIOS.length, pronto: ok === DOCS_OBRIGATORIOS.length }
}

// ——— Ícones ———
function WhatsAppBtn({ numero }: { numero: string }) {
  const d = numero.replace(/\D/g, '')
  return (
    <a href={`https://web.whatsapp.com/send?phone=55${d}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="opacity-75 hover:opacity-100 transition-opacity">
      <svg viewBox="0 0 32 32" className="w-4 h-4">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.742 5.493 2.043 7.805L0 32l8.418-2.01A15.937 15.937 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0z" fill="#25D366"/>
        <path d="M23.07 19.44c-.356-.178-2.107-1.04-2.434-1.16-.327-.12-.565-.178-.803.178-.238.356-.921 1.16-1.129 1.397-.208.238-.416.267-.772.089-.356-.178-1.503-.554-2.863-1.766-1.058-.944-1.772-2.109-1.98-2.465-.208-.356-.022-.548.156-.726.16-.16.356-.416.534-.624.178-.208.237-.356.356-.594.119-.238.06-.446-.03-.624-.089-.178-.803-1.935-1.1-2.649-.29-.695-.585-.6-.803-.611l-.683-.012c-.238 0-.624.089-.951.446-.327.356-1.248 1.219-1.248 2.974 0 1.754 1.278 3.449 1.456 3.687.178.238 2.514 3.836 6.092 5.381.852.367 1.517.587 2.035.752.855.272 1.634.234 2.249.142.686-.102 2.107-.861 2.404-1.693.297-.832.297-1.545.208-1.693-.089-.149-.327-.238-.683-.416z" fill="#fff"/>
      </svg>
    </a>
  )
}

function SocialBtn({ url }: { url: string }) {
  const id = `ig-${url.slice(-8).replace(/\W/g, '')}`
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" title={isFacebook(url) ? 'Facebook' : 'Instagram'} className="opacity-75 hover:opacity-100 transition-opacity">
      {isFacebook(url) ? (
        <svg viewBox="0 0 24 24" className="w-4 h-4"><rect width="24" height="24" rx="5" fill="#1877F2"/><path d="M16.5 8H14c-.3 0-.5.2-.5.5V10H16l-.3 2.5H13.5V19h-3v-6.5H9V10h1.5V8c0-2.2 1.3-3.5 3.5-3.5.7 0 2 .1 2.5.2V8z" fill="white"/></svg>
      ) : (
        <svg viewBox="0 0 24 24" className="w-4 h-4">
          <defs><linearGradient id={id} x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="50%" stopColor="#dc2743"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs>
          <rect width="24" height="24" rx="5.5" fill={`url(#${id})`}/>
          <circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="1.8"/>
          <circle cx="17.5" cy="6.5" r="1.1" fill="white"/>
          <rect x="2.5" y="2.5" width="19" height="19" rx="4.5" fill="none" stroke="white" strokeWidth="1.5"/>
        </svg>
      )}
    </a>
  )
}

function AlertaBadge({ tipo }: { tipo: Alerta }) {
  if (tipo === 'fraude') return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold">
      <ShieldX className="w-3 h-3" /> Fraude
    </span>
  )
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-semibold">
      <AlertTriangle className="w-3 h-3" /> Calote
    </span>
  )
}

function ExClienteBadge() {
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-semibold">
      <UserX className="w-3 h-3" /> Ex-cliente
    </span>
  )
}

function ProntidaoBadge({ p }: { p: PessoaNaFila }) {
  const { ok, total, pronto } = getProntidao(p)
  if (pronto) return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold">
      <CheckCircle className="w-3 h-3" /> Pronto
    </span>
  )
  if (ok > 0) return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs">
      <AlertCircle className="w-3 h-3" /> {ok}/{total} docs
    </span>
  )
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#A0A0A0] text-xs">
      <FileText className="w-3 h-3" /> Sem docs
    </span>
  )
}

// ——— Modal de Documentos da Fila ———
function DocsFilaModal({ pessoa, onClose, onUpdate }: {
  pessoa: PessoaNaFila
  onClose: () => void
  onUpdate: (id: string, docs: Documento[]) => void
}) {
  const [docs, setDocs] = useState<Documento[]>(pessoa.documentos)
  const [tipo, setTipo] = useState<DocumentoTipo>('cnh')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const novo: Documento = {
      id: String(Date.now()), tipo,
      nome: file.name, url: URL.createObjectURL(file),
      uploaded_at: new Date().toISOString(),
    }
    const updated = [...docs, novo]
    setDocs(updated)
    onUpdate(pessoa.id, updated)
    if (fileRef.current) fileRef.current.value = ''
  }

  function remover(id: string) {
    const updated = docs.filter((d) => d.id !== id)
    setDocs(updated)
    onUpdate(pessoa.id, updated)
  }

  return (
    <Modal open onClose={onClose} title="Documentos" size="lg">
      <div className="space-y-5">
        <div className="p-3 rounded-lg bg-white/[0.03] border border-[#333333]">
          <p className="text-xs text-[#A0A0A0]">Candidato</p>
          <p className="font-semibold text-white">{pessoa.nome}</p>
          {pessoa.cpf && <p className="text-xs text-[#A0A0A0] font-mono">{pessoa.cpf}</p>}
        </div>

        {/* Checklist obrigatórios */}
        <div className="grid grid-cols-3 gap-2">
          {DOCS_OBRIGATORIOS.map((t) => {
            const ok = docs.some((d) => d.tipo === t)
            return (
              <div key={t} className={`flex items-center gap-1.5 text-xs px-2.5 py-2 rounded-lg ${ok ? 'text-green-400 bg-green-500/5 border border-green-500/20' : 'text-[#A0A0A0] bg-white/[0.02] border border-white/5'}`}>
                {ok ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                {DOC_LABELS[t]}
              </div>
            )
          })}
        </div>

        {/* Upload */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Select label="Tipo" options={DOC_TIPOS} value={tipo} onChange={(e) => setTipo(e.target.value as DocumentoTipo)} />
          </div>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} accept=".pdf,.jpg,.jpeg,.png,.webp" />
          <Button onClick={() => fileRef.current?.click()} variant="secondary">
            <Upload className="w-4 h-4" /> Enviar
          </Button>
        </div>

        {/* Lista */}
        {docs.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-[#333333] rounded-xl">
            <FolderOpen className="w-7 h-7 text-[#888888] mx-auto mb-2" />
            <p className="text-sm text-[#A0A0A0]">Nenhum documento enviado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#2a2a2a] border border-[#333333]">
                <FileText className="w-4 h-4 text-[#BAFF1A] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{doc.nome}</p>
                  <p className="text-xs text-[#A0A0A0]">{DOC_LABELS[doc.tipo]} · {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-1">
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button onClick={() => remover(doc.id)} className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </Modal>
  )
}

// ——— Card de pessoa na fila ———
interface CardProps {
  pessoa: PessoaNaFila
  dim?: boolean
  isFirst: boolean
  isLast: boolean
  expandedId: string | null
  onToggle: (id: string) => void
  onAlocar: (id: string) => void
  onRemover: (id: string) => void
  onMover: (id: string, direcao: 'up' | 'down') => void
  onDocs: (p: PessoaNaFila) => void
  onReativar: (id: string) => void
}

function CardPessoa({ pessoa, dim = false, isFirst, isLast, expandedId, onToggle, onAlocar, onRemover, onMover, onDocs, onReativar }: CardProps) {
  const dias = getDias(pessoa.entrou_na_fila)
  const expanded = expandedId === pessoa.id
  const expirado = isExpirado(pessoa)
  const temDetalhes = !!(pessoa.cpf || pessoa.endereco || pessoa.identificacao || pessoa.objetivo || pessoa.andamento || pessoa.historico_posicao.length > 0 || pessoa.historico_locacao?.length || pessoa.historico_fila?.length)

  return (
    <div className={`bg-[#202020] border rounded-xl overflow-hidden transition-all duration-150 ${
      expanded ? 'border-[#BAFF1A]/30' : dim ? 'border-[#2a2a2a]' : 'border-[#333333] hover:border-[#555555]'
    } ${dim ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3 p-4">
        {/* Posição */}
        {!pessoa.alerta && !expirado && (
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => !isFirst && onMover(pessoa.id, 'up')}
              disabled={isFirst}
              className={`p-0.5 rounded transition-colors ${isFirst ? 'text-[#888888] cursor-default' : 'text-[#A0A0A0] hover:text-[#BAFF1A]'}`}
              title="Subir na fila"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#BAFF1A]/10 border border-[#BAFF1A]/20 flex items-center justify-center">
              <span className="text-xs font-bold text-[#BAFF1A]">{pessoa.posicao}º</span>
            </div>
            <button
              onClick={() => !isLast && onMover(pessoa.id, 'down')}
              disabled={isLast}
              className={`p-0.5 rounded transition-colors ${isLast ? 'text-[#888888] cursor-default' : 'text-[#A0A0A0] hover:text-[#BAFF1A]'}`}
              title="Descer na fila"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-semibold text-sm ${dim ? 'text-[#A0A0A0]' : 'text-white'}`}>{pessoa.nome}</p>
            {pessoa.ex_cliente && <ExClienteBadge />}
            {pessoa.alerta && <AlertaBadge tipo={pessoa.alerta} />}
            {!pessoa.alerta && !expirado && <ProntidaoBadge p={pessoa} />}
            {expirado && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#A0A0A0] text-xs">
                <Clock className="w-3 h-3" /> +30 dias
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1.5 text-sm text-[#A0A0A0]">
              {pessoa.telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, '$1 $2-$3')}
              <WhatsAppBtn numero={pessoa.telefone} />
            </span>
            {pessoa.social && <SocialBtn url={pessoa.social} />}
            {!pessoa.alerta && !expirado && (
              <span className={`text-xs ${dias > 20 ? 'text-amber-400' : 'text-[#A0A0A0]'}`}>
                <Clock className="w-3 h-3 inline mr-1" />
                {dias === 0 ? 'hoje' : `${dias}d`}
              </span>
            )}
          </div>
          {pessoa.endereco && (
            <div className="flex items-start gap-1.5 mt-1.5">
              <MapPin className="w-3 h-3 text-[#888888] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#A0A0A0] leading-tight">{pessoa.endereco}</p>
            </div>
          )}
          {pessoa.objetivo && (
            <div className="flex items-start gap-1.5 mt-1">
              <Target className="w-3 h-3 text-[#BAFF1A]/50 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#A0A0A0] leading-tight">{pessoa.objetivo}</p>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {temDetalhes && (
            <button onClick={() => onToggle(pessoa.id)} className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-[#A0A0A0] hover:bg-white/5 transition-colors">
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
          <button onClick={() => onDocs(pessoa)} className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-[#BAFF1A] hover:bg-[#BAFF1A]/5 transition-colors" title="Documentos">
            <FolderOpen className="w-3.5 h-3.5" />
          </button>
          {!pessoa.alerta && !expirado && (
            <button onClick={() => onAlocar(pessoa.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-[#BAFF1A] hover:bg-[#BAFF1A]/10 border border-[#BAFF1A]/30 transition-colors font-medium">
              <Bike className="w-3.5 h-3.5" /> Alocar
            </button>
          )}
          {dim && !pessoa.alerta && (
            <button onClick={() => onReativar(pessoa.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-blue-400 hover:bg-blue-500/10 border border-blue-500/30 transition-colors font-medium">
              <ArrowUp className="w-3.5 h-3.5" /> Reativar
            </button>
          )}
          <button onClick={() => onRemover(pessoa.id)} className="p-1.5 rounded-lg text-[#888888] hover:text-red-400 hover:bg-red-500/5 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Seção expandida */}
      {expanded && (
        <div className="border-t border-[#2a2a2a] px-4 pb-4 pt-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pessoa.cpf && <div><p className="text-xs text-[#A0A0A0]">CPF</p><p className="text-sm text-white font-mono">{pessoa.cpf}</p></div>}
            {pessoa.identificacao && (
              <div className="flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-[#A0A0A0] mt-0.5" />
                <div><p className="text-xs text-[#A0A0A0]">Identificação</p><p className="text-sm text-white font-mono">{pessoa.identificacao}</p></div>
              </div>
            )}
            {pessoa.endereco && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <MapPin className="w-3.5 h-3.5 text-[#A0A0A0] mt-0.5 flex-shrink-0" />
                <div><p className="text-xs text-[#A0A0A0]">Endereço</p><p className="text-sm text-[#A0A0A0]">{pessoa.endereco}</p></div>
              </div>
            )}
          </div>
          {pessoa.objetivo && (
            <div className="flex items-start gap-2">
              <Target className="w-3.5 h-3.5 text-[#BAFF1A] mt-0.5 flex-shrink-0" />
              <div><p className="text-xs text-[#A0A0A0] mb-0.5">Objetivo</p><p className="text-sm text-[#A0A0A0]">{pessoa.objetivo}</p></div>
            </div>
          )}
          {pessoa.andamento && (
            <div className="flex items-start gap-2">
              <ClipboardList className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div><p className="text-xs text-[#A0A0A0] mb-0.5">Andamento</p><p className="text-sm text-[#A0A0A0] whitespace-pre-line">{pessoa.andamento}</p></div>
            </div>
          )}
          {/* Histórico como cliente */}
          {pessoa.historico_locacao && pessoa.historico_locacao.length > 0 && (
            <div className="flex items-start gap-2">
              <UserX className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-[#A0A0A0] mb-1.5">Histórico como cliente</p>
                <div className="space-y-2">
                  {pessoa.historico_locacao.map((h, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/15 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {h.moto_placa && (
                          <span className="font-mono text-xs text-white font-semibold">{h.moto_placa}</span>
                        )}
                        {h.moto_modelo && (
                          <span className="text-xs text-[#A0A0A0]">{h.moto_modelo}</span>
                        )}
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
                </div>
              </div>
            </div>
          )}

          {/* Histórico na fila */}
          {pessoa.historico_fila && pessoa.historico_fila.length > 0 && (
            <div className="flex items-start gap-2">
              <ClipboardList className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-[#A0A0A0] mb-1.5">Histórico na fila</p>
                <div className="space-y-1.5">
                  {pessoa.historico_fila.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-[#A0A0A0] flex-shrink-0">
                        {new Date(h.data_entrada + 'T12:00:00').toLocaleDateString('pt-BR')}
                        {h.data_saida && ` → ${new Date(h.data_saida + 'T12:00:00').toLocaleDateString('pt-BR')}`}
                      </span>
                      {h.motivo_saida && <span className="text-[#A0A0A0]">{h.motivo_saida}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Histórico de posição */}
          {pessoa.historico_posicao.length > 0 && (
            <div className="flex items-start gap-2">
              <History className="w-3.5 h-3.5 text-[#A0A0A0] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-[#A0A0A0] mb-1.5">Movimentações na fila</p>
                <div className="space-y-1.5">
                  {pessoa.historico_posicao.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-[#A0A0A0]">{new Date(h.data).toLocaleDateString('pt-BR')}</span>
                      <span className={`flex items-center gap-0.5 font-medium ${h.para < h.de ? 'text-green-400' : 'text-amber-400'}`}>
                        {h.para < h.de ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {h.de}º → {h.para}º
                      </span>
                      <span className="text-[#A0A0A0] truncate">{h.motivo}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ——— Componente principal ———
export default function FilaPage() {
  // TODO Supabase: substituir por useEffect → supabase.from('fila').select('*').order('posicao')
  const [fila, setFila] = useState<PessoaNaFila[]>(() => {
    try {
      const salvo = localStorage.getItem(LS_FILA)
      return salvo ? JSON.parse(salvo) : mockFila
    } catch { return mockFila }
  })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showHistorico, setShowHistorico] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroProntidao, setFiltroProntidao] = useState('todos')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [alocarId, setAlocarId] = useState<string | null>(null)
  const [alocarForm, setAlocarForm] = useState(defaultAlocarForm)
  const [motosAlocadas, setMotosAlocadas] = useState<string[]>([])
  const [form, setForm] = useState(defaultForm)

  // Persiste fila no localStorage sempre que mudar
  // TODO Supabase: substituir por supabase.from('fila').upsert(fila)
  useEffect(() => {
    localStorage.setItem(LS_FILA, JSON.stringify(fila))
  }, [fila])
  const [docsPessoa, setDocsPessoa] = useState<PessoaNaFila | null>(null)
  // Modal mover: { id, direcao }
  const [moverModal, setMoverModal] = useState<{ id: string; direcao: 'up' | 'down' } | null>(null)
  const [motivoMover, setMotivoMover] = useState('')

  const tabsProntidao = [
    { label: 'Todos', value: 'todos' },
    { label: 'Prontos', value: 'pronto' },
    { label: 'Sem docs', value: 'sem_docs' },
    { label: 'Com alerta', value: 'alerta' },
  ]

  const todosAtivos = fila.filter((p) => !p.alerta && getDias(p.entrou_na_fila) < 30)
  const ativos = todosAtivos.filter((p) => {
    const passaBusca = !busca || [p.nome, p.telefone, p.cpf].some(
      (v) => v?.toLowerCase().includes(busca.toLowerCase())
    )
    const { pronto, ok } = getProntidao(p)
    const passFiltro =
      filtroProntidao === 'pronto' ? pronto :
      filtroProntidao === 'sem_docs' ? ok === 0 :
      true
    return passaBusca && passFiltro
  })
  const historico = fila.filter((p) => p.alerta || getDias(p.entrou_na_fila) >= 30)
  const pessoaAlocar = fila.find((p) => p.id === alocarId)
  const motoSelecionada = TODAS_MOTOS.find((m) => m.id === alocarForm.moto_id)

  function handleAbrirAlocar(id: string) {
    // Lê motos alocadas do localStorage (escritas pela página de contratos)
    // TODO Supabase: substituir por query motos.status = 'disponivel'
    try {
      const alocadas = JSON.parse(localStorage.getItem(LS_MOTOS_ALOCADAS) ?? '[]')
      setMotosAlocadas(alocadas)
    } catch { setMotosAlocadas([]) }
    setAlocarId(id)
    setAlocarForm({ ...defaultAlocarForm, data_inicio: new Date().toISOString().split('T')[0] })
  }

  function handleAlocarTipoChange(tipo: string) {
    setAlocarForm((prev) => ({ ...prev, tipo, valor_periodo: VALOR_DEFAULT[tipo] }))
  }

  function handleToggle(id: string) { setExpandedId((prev) => (prev === id ? null : id)) }

  function handleRemover(id: string) {
    setFila((prev) => prev.filter((p) => p.id !== id).map((p, i) => ({ ...p, posicao: i + 1 })))
  }

  function handleMoverClick(id: string, direcao: 'up' | 'down') {
    setMotivoMover('')
    setMoverModal({ id, direcao })
  }

  function confirmarMover() {
    if (!moverModal) return
    const { id, direcao } = moverModal
    setFila((prev) => {
      const arr = [...prev]
      const idx = arr.findIndex((p) => p.id === id)
      if (idx < 0) return arr
      const swapIdx = direcao === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= arr.length) return arr

      const posOrigem = arr[idx].posicao
      const posDestino = arr[swapIdx].posicao

      // Registra histórico nos dois
      const entrada: MovimentacaoFila = {
        data: new Date().toISOString(),
        de: posOrigem,
        para: posDestino,
        motivo: motivoMover || 'Reordenação manual',
      }
      const entradaSwap: MovimentacaoFila = {
        data: new Date().toISOString(),
        de: posDestino,
        para: posOrigem,
        motivo: motivoMover || 'Reordenação manual',
      }

      arr[idx] = { ...arr[idx], posicao: posDestino, historico_posicao: [...arr[idx].historico_posicao, entrada] }
      arr[swapIdx] = { ...arr[swapIdx], posicao: posOrigem, historico_posicao: [...arr[swapIdx].historico_posicao, entradaSwap] }

      // Re-sort by posicao
      return [...arr].sort((a, b) => a.posicao - b.posicao)
    })
    setMoverModal(null)
    setMotivoMover('')
  }

  function handleConfirmarAlocar() {
    if (!alocarId || !pessoaAlocar || !motoSelecionada) return
    const tipo = parseInt(alocarForm.tipo) as 1 | 2 | 3
    const inicio = new Date(alocarForm.data_inicio + 'T12:00:00')
    const fim = new Date(inicio)
    if (tipo === 1) fim.setDate(fim.getDate() + 90)
    else fim.setFullYear(fim.getFullYear() + 2)

    const novoContrato = {
      id: String(Date.now()),
      tipo,
      cliente_id: pessoaAlocar.id,
      cliente_nome: pessoaAlocar.nome,
      cliente_cpf: pessoaAlocar.cpf ?? '',
      cliente_telefone: pessoaAlocar.telefone,
      cliente_endereco: pessoaAlocar.endereco,
      moto_id: motoSelecionada.id,
      moto_placa: motoSelecionada.placa,
      moto_modelo: motoSelecionada.modelo,
      moto_marca: motoSelecionada.marca,
      moto_ano: motoSelecionada.ano,
      moto_cor: motoSelecionada.cor,
      data_inicio: alocarForm.data_inicio,
      data_fim: fim.toISOString().split('T')[0],
      valor_periodo: parseFloat(alocarForm.valor_periodo),
      status: 'ativo' as const,
      assinatura_pendente: true,
      observacoes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const existentes = JSON.parse(localStorage.getItem(LS_NEW_CONTRACTS) ?? '[]')
    localStorage.setItem(LS_NEW_CONTRACTS, JSON.stringify([...existentes, novoContrato]))
    // Atualiza lista de motos alocadas imediatamente
    localStorage.setItem(LS_MOTOS_ALOCADAS, JSON.stringify([...motosAlocadas, motoSelecionada.id]))

    setFila((prev) => prev.filter((p) => p.id !== alocarId).map((p, i) => ({ ...p, posicao: i + 1 })))
    setAlocarId(null)
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setFila((prev) => [...prev, {
      id: String(Date.now()),
      posicao: ativos.length + 1,
      nome: form.nome,
      cpf: form.cpf || undefined,
      telefone: form.telefone,
      endereco: form.endereco || undefined,
      identificacao: form.identificacao || undefined,
      objetivo: form.objetivo || undefined,
      andamento: form.andamento || undefined,
      social: form.social || undefined,
      entrou_na_fila: new Date().toISOString().split('T')[0],
      documentos: [],
      historico_posicao: [],
    }])
    setForm(defaultForm)
    setAddModalOpen(false)
  }

  function handleUpdateDocs(pessoaId: string, docs: Documento[]) {
    setFila((prev) => prev.map((p) => p.id === pessoaId ? { ...p, documentos: docs } : p))
    setDocsPessoa((prev) => prev && prev.id === pessoaId ? { ...prev, documentos: docs } : prev)
  }

  function handleReativar(id: string) {
    setFila((prev) => prev.map((p) => p.id === id
      ? { ...p, entrou_na_fila: new Date().toISOString().split('T')[0] }
      : p
    ))
  }

  const pessoaMoverModal = moverModal ? fila.find((p) => p.id === moverModal.id) : null

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Fila de Locadores"
        subtitle={`${ativos.length} aguardando`}
        actions={
          <Button onClick={() => setAddModalOpen(true)}>
            <UserPlus className="w-4 h-4" /> Adicionar
          </Button>
        }
      />

      <div className="p-6 space-y-3">
        {/* Filtros rápidos + Busca */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {tabsProntidao.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFiltroProntidao(tab.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  filtroProntidao === tab.value
                    ? 'bg-[#BAFF1A] text-[#121212]'
                    : 'bg-[#202020] border border-[#333333] text-[#A0A0A0] hover:text-white hover:border-[#555555]'
                }`}
              >
                {tab.label}
                {tab.value !== 'todos' && (
                  <span className="ml-1.5 opacity-70">
                    ({tab.value === 'alerta'
                      ? fila.filter((p) => p.alerta).length
                      : tab.value === 'pronto'
                      ? todosAtivos.filter((p) => getProntidao(p).pronto).length
                      : todosAtivos.filter((p) => getProntidao(p).ok === 0).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou CPF..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-lg bg-[#202020] border border-[#333333] text-sm text-white placeholder-[#A0A0A0] focus:outline-none focus:border-[#555555] w-64"
            />
          </div>
        </div>

        {ativos.length === 0 ? (
          <div className="text-center py-16">
            <UserPlus className="w-10 h-10 text-[#888888] mx-auto mb-3" />
            <p className="text-[#A0A0A0] text-sm">Nenhuma pessoa na fila ativa</p>
          </div>
        ) : (
          ativos.map((p, idx) => (
            <CardPessoa
              key={p.id} pessoa={p}
              isFirst={idx === 0} isLast={idx === ativos.length - 1}
              expandedId={expandedId}
              onToggle={handleToggle}
              onAlocar={handleAbrirAlocar}
              onRemover={handleRemover}
              onMover={handleMoverClick}
              onDocs={setDocsPessoa}
              onReativar={handleReativar}
            />
          ))
        )}

        {historico.length > 0 && (
          <button
            onClick={() => setShowHistorico((v) => !v)}
            className="flex items-center gap-2 text-xs text-[#A0A0A0] hover:text-[#A0A0A0] transition-colors pt-2"
          >
            <History className="w-3.5 h-3.5" />
            {showHistorico ? 'Ocultar histórico' : `Ver histórico (${historico.length})`}
            {showHistorico ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}

        {showHistorico && (
          <div className="space-y-2 pt-1">
            {historico.map((p) => (
              <CardPessoa
                key={p.id} pessoa={p} dim
                isFirst isLast
                expandedId={expandedId}
                onToggle={handleToggle}
                onAlocar={handleAbrirAlocar}
                onRemover={handleRemover}
                onMover={handleMoverClick}
                onDocs={setDocsPessoa}
                onReativar={handleReativar}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Confirmar Mover */}
      <Modal open={!!moverModal} onClose={() => setMoverModal(null)} title="Mover na fila" size="sm">
        {pessoaMoverModal && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-white/[0.03] border border-[#333333]">
              <div className="flex items-center gap-2">
                <span className="text-[#A0A0A0] text-sm">{pessoaMoverModal.posicao}º lugar</span>
                {moverModal?.direcao === 'up'
                  ? <ArrowUp className="w-4 h-4 text-green-400" />
                  : <ArrowDown className="w-4 h-4 text-amber-400" />
                }
                <span className="text-white text-sm font-medium">
                  {moverModal?.direcao === 'up' ? pessoaMoverModal.posicao - 1 : pessoaMoverModal.posicao + 1}º lugar
                </span>
              </div>
              <p className="text-white font-semibold mt-1">{pessoaMoverModal.nome}</p>
            </div>
            <Input
              label="Motivo (opcional)"
              placeholder="Ex: documentação completa, caução pago..."
              value={motivoMover}
              onChange={(e) => setMotivoMover(e.target.value)}
            />
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => setMoverModal(null)}>Cancelar</Button>
              <Button onClick={confirmarMover}>Confirmar</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Alocar — gera contrato pendente */}
      <Modal open={!!alocarId} onClose={() => setAlocarId(null)} title="Vincular a uma Moto" size="md">
        {pessoaAlocar && (
          <div className="space-y-4">
            {/* Cliente */}
            <div className="p-3 rounded-lg bg-white/[0.03] border border-[#333333]">
              <p className="text-xs text-[#A0A0A0] mb-1">Cliente</p>
              <p className="font-semibold text-white">{pessoaAlocar.nome}</p>
              <p className="text-sm text-[#A0A0A0]">{pessoaAlocar.telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, '$1 $2-$3')}</p>
              {pessoaAlocar.cpf && <p className="text-xs text-[#A0A0A0] font-mono mt-0.5">{pessoaAlocar.cpf}</p>}
            </div>

            {/* Tipo */}
            <Select
              label="Tipo de Contrato"
              options={[
                { value: '1', label: 'Tipo 1 — Locação (semanal · 90 dias renovável)' },
                { value: '2', label: 'Tipo 2 — Fidelidade Quinzenal (quinzenal · 24 meses)' },
                { value: '3', label: 'Tipo 3 — Fidelidade Semanal (semanal · 24 meses)' },
              ]}
              value={alocarForm.tipo}
              onChange={(e) => handleAlocarTipoChange(e.target.value)}
            />

            {/* Moto — apenas disponíveis (não alocadas) */}
            {(() => {
              const disponiveis = TODAS_MOTOS.filter((m) => !motosAlocadas.includes(m.id))
              return (
                <Select
                  label={`Moto disponível${disponiveis.length === 0 ? ' (nenhuma no momento)' : ''}`}
                  options={[
                    { value: '', label: disponiveis.length === 0 ? 'Nenhuma moto disponível' : 'Selecione a moto...' },
                    ...disponiveis.map((m) => ({ value: m.id, label: `${m.placa} — ${m.modelo} (${m.cor})` })),
                  ]}
                  value={alocarForm.moto_id}
                  onChange={(e) => setAlocarForm((prev) => ({ ...prev, moto_id: e.target.value }))}
                />
              )
            })()}

            {/* Valor + Data */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={`Valor por ${alocarForm.tipo === '2' ? 'quinzena' : 'semana'} (R$)`}
                type="number" step="0.01"
                value={alocarForm.valor_periodo}
                onChange={(e) => setAlocarForm((prev) => ({ ...prev, valor_periodo: e.target.value }))}
              />
              <Input
                label="Data de início"
                type="date"
                value={alocarForm.data_inicio}
                onChange={(e) => setAlocarForm((prev) => ({ ...prev, data_inicio: e.target.value }))}
              />
            </div>

            <p className="text-xs text-amber-400/80 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2">
              O contrato será criado com status <strong>Assinatura Pendente</strong>. Acesse a tela de Contratos para anexar o PDF assinado.
            </p>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => setAlocarId(null)}>Cancelar</Button>
              <Button
                onClick={handleConfirmarAlocar}
                disabled={!alocarForm.moto_id || !alocarForm.valor_periodo}
              >
                <ArrowRight className="w-4 h-4" /> Confirmar e gerar contrato
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Documentos */}
      {docsPessoa && (
        <DocsFilaModal
          pessoa={fila.find((p) => p.id === docsPessoa.id) ?? docsPessoa}
          onClose={() => setDocsPessoa(null)}
          onUpdate={handleUpdateDocs}
        />
      )}

      {/* Modal Adicionar */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Adicionar à Fila" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome" placeholder="Nome completo" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            <Input label="Telefone" placeholder="21 99999-0000" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="CPF" placeholder="000.000.000-00" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
            <Input label="Identificação (RG / Doc)" placeholder="000000000" value={form.identificacao} onChange={(e) => setForm({ ...form, identificacao: e.target.value })} />
          </div>
          <Input label="Endereço" placeholder="Rua, número - Bairro - Cidade - UF - CEP" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
          <Input label="Instagram / Facebook" placeholder="https://www.instagram.com/usuario" value={form.social} onChange={(e) => setForm({ ...form, social: e.target.value })} />
          <Textarea label="Objetivo" placeholder="Por que quer alugar?" rows={2} value={form.objetivo} onChange={(e) => setForm({ ...form, objetivo: e.target.value })} />
          <Textarea label="Andamento" placeholder="Histórico de contatos..." rows={2} value={form.andamento} onChange={(e) => setForm({ ...form, andamento: e.target.value })} />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>Cancelar</Button>
            <Button type="submit"><UserPlus className="w-4 h-4" /> Adicionar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
