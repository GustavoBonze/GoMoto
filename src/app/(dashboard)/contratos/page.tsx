'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Plus, Eye, FileText, Upload, ExternalLink, ChevronDown, ChevronUp,
  Clock, Bike, User, CheckCircle, History, XCircle, X,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LS_MOTOS_ALOCADAS, LS_NEW_CONTRACTS } from '@/data/motos'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { ContratoTipo, ContratoStatus } from '@/types'

// ——— Tipos locais ———
interface Contrato {
  id: string
  tipo: ContratoTipo
  cliente_id: string
  cliente_nome: string
  cliente_cpf: string
  cliente_telefone: string
  cliente_rg?: string
  cliente_uf?: string
  cliente_endereco?: string
  cliente_cep?: string
  cliente_cnh?: string
  cliente_cnh_categoria?: string
  cliente_contato_emergencia?: string
  moto_id: string
  moto_placa: string
  moto_modelo: string
  moto_marca: string
  moto_ano: string
  moto_cor: string
  moto_renavam?: string
  moto_chassi?: string
  data_inicio: string
  data_fim: string
  valor_periodo: number   // semanal p/ tipo 1 e 3 / quinzenal p/ tipo 2
  status: ContratoStatus
  assinatura_pendente?: boolean
  pdf_url?: string
  motivo_encerramento?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

// ——— Metadados dos tipos ———
const TIPO_INFO: Record<ContratoTipo, {
  label: string
  freq: string
  duracao: string
  aquisicao: boolean
  manutencao: string
}> = {
  1: { label: 'Locação',              freq: 'Semanal',    duracao: '90 dias (renovável)', aquisicao: false, manutencao: 'Dividida entre as partes' },
  2: { label: 'Fidelidade Quinzenal', freq: 'Quinzenal',  duracao: '24 meses',            aquisicao: true,  manutencao: 'Dividida entre as partes' },
  3: { label: 'Fidelidade Semanal',   freq: 'Semanal',    duracao: '24 meses',            aquisicao: true,  manutencao: '100% cliente (enviar comprovantes)' },
}

const TIPO_COLORS: Record<ContratoTipo, string> = {
  1: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
  2: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
  3: 'bg-[#BAFF1A]/10 border-[#BAFF1A]/20 text-[#BAFF1A]',
}

const STATUS_COLORS: Record<ContratoStatus, string> = {
  ativo:     'bg-green-500/15 border-green-500/30 text-green-400',
  encerrado: 'bg-white/5 border-white/10 text-[#888888]',
  cancelado: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
  quebrado:  'bg-red-500/15 border-red-500/30 text-red-400',
}

const STATUS_LABELS: Record<ContratoStatus, string> = {
  ativo: 'Ativo', encerrado: 'Encerrado', cancelado: 'Cancelado', quebrado: 'Quebrado',
}

// ——— Mock data ———
const mockContratos: Contrato[] = [
  {
    id: '1', tipo: 1,
    cliente_id: '1', cliente_nome: 'FABRICIO DO VALE NEPOMUCENO', cliente_cpf: '129.616.867-09',
    cliente_telefone: '21 98776-4348', cliente_rg: '207189267', cliente_uf: 'RJ',
    cliente_endereco: 'R ADELINO 12 - ROLLAS 2 - SANTA CRUZ - RIO DE JANEIRO - RJ',
    cliente_cep: '23590-170', cliente_cnh: '4372430975', cliente_cnh_categoria: 'A',
    cliente_contato_emergencia: 'MÃE: (21) 99184-7214 | IRMÃO: (21) 96577-2573',
    moto_id: '4', moto_placa: 'RJA5J85', moto_modelo: 'HONDA/CG 160 START',
    moto_marca: 'HONDA', moto_ano: '24/25', moto_cor: 'PRETO',
    moto_renavam: '01267415698', moto_chassi: '9C2JC3110RR001234',
    data_inicio: '2026-02-05', data_fim: '2026-05-06',
    valor_periodo: 350, status: 'ativo',
    observacoes: '', created_at: '2026-02-05T10:00:00Z', updated_at: '2026-02-05T10:00:00Z',
  },
  {
    id: '2', tipo: 2,
    cliente_id: '2', cliente_nome: 'DOUGLAS DOS SANTOS SIMÔES', cliente_cpf: '173.964.027-60',
    cliente_telefone: '21 97389-7602', cliente_rg: '300246329', cliente_uf: 'RJ',
    cliente_endereco: 'ESTRADA DE SEPETIBA N 595 - BLOCO 09 CASA 02 - SANTA CRUZ - RIO DE JANEIRO - RJ',
    cliente_cep: '23520-660', cliente_cnh: '7601971200', cliente_cnh_categoria: 'A',
    cliente_contato_emergencia: 'ESPOSA: (21) 96683-1232 | MÃE: (21) 97876-1439',
    moto_id: '2', moto_placa: 'KYN9J41', moto_modelo: 'YAMAHA/YS150 FAZER SED',
    moto_marca: 'YAMAHA', moto_ano: '23/24', moto_cor: 'CINZA',
    data_inicio: '2025-10-23', data_fim: '2027-10-23',
    valor_periodo: 630, status: 'ativo',
    observacoes: 'Moto será transferida ao final do contrato.',
    created_at: '2025-10-23T10:00:00Z', updated_at: '2025-10-23T10:00:00Z',
  },
  {
    id: '3', tipo: 1,
    cliente_id: '4', cliente_nome: 'ALEXANDRE DANTAS DAS SILVA', cliente_cpf: '099.762.467-14',
    cliente_telefone: '21 98116-5350', cliente_rg: '12488178', cliente_uf: 'RJ',
    cliente_endereco: 'CAMINHO DE TUTOIA 1SN QD 120 FUNDOS - COSMOS - RIO DE JANEIRO - RJ',
    cliente_cep: '23060-275', cliente_cnh: '9225925768', cliente_cnh_categoria: 'A',
    cliente_contato_emergencia: '(21) 98116-5350',
    moto_id: '1', moto_placa: 'SYF1C42', moto_modelo: 'HONDA/CG 160 START',
    moto_marca: 'HONDA', moto_ano: '21/22', moto_cor: 'VERMELHO',
    data_inicio: '2026-03-09', data_fim: '2026-06-07',
    valor_periodo: 350, status: 'ativo',
    observacoes: '', created_at: '2026-03-09T10:00:00Z', updated_at: '2026-03-09T10:00:00Z',
  },
  {
    id: '4', tipo: 1,
    cliente_id: '3', cliente_nome: 'FLAVIO SILVA COUTINHO', cliente_cpf: '054.666.677-41',
    cliente_telefone: '21 96445-2588', cliente_rg: '8466667741', cliente_uf: 'RJ',
    cliente_endereco: 'RUA ITAMBARACA SN CASA 2 LT 11 QD 124 - COSMOS - RIO DE JANEIRO - RJ',
    cliente_cep: '23060-070', cliente_cnh: '4201494036', cliente_cnh_categoria: 'A',
    cliente_contato_emergencia: 'GUILHERME (filho): (21) 95947-8641 | MARIANA (filha): (21) 95904-1370',
    moto_id: '3', moto_placa: 'RIW4J89', moto_modelo: 'HONDA/CG 160 CARGO',
    moto_marca: 'HONDA', moto_ano: '23/24', moto_cor: 'BRANCO',
    data_inicio: '2026-01-10', data_fim: '2026-04-10',
    valor_periodo: 350, status: 'ativo',
    observacoes: '', created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z',
  },
]

// ——— Helpers ———
function getSemanas(data_fim: string): number {
  const diff = new Date(data_fim + 'T12:00:00').getTime() - new Date().getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24 * 7)))
}

function getValorMensal(tipo: ContratoTipo, valor: number): number {
  if (tipo === 2) return (valor * 26) / 12  // 26 quinzenas/ano
  return (valor * 52) / 12                  // 52 semanas/ano
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')
}

// ——— Badges ———
function TipoBadge({ tipo }: { tipo: ContratoTipo }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold ${TIPO_COLORS[tipo]}`}>
      T{tipo} · {TIPO_INFO[tipo].label}
    </span>
  )
}

function StatusBadge({ status }: { status: ContratoStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

// ——— Modal PDF ———
function PDFModal({ contrato, onClose, onUpdate }: {
  contrato: Contrato
  onClose: () => void
  onUpdate: (id: string, url: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onUpdate(contrato.id, URL.createObjectURL(file))
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <Modal open onClose={onClose} title="Contrato Assinado" size="md">
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-white/[0.03] border border-[#333333]">
          <p className="text-xs text-[#555555]">Contrato</p>
          <p className="font-semibold text-white">{contrato.cliente_nome}</p>
          <p className="text-xs text-[#A0A0A0]">{contrato.moto_placa} · {contrato.moto_modelo}</p>
        </div>

        {contrato.pdf_url ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#2a2a2a] border border-[#333333]">
            <FileText className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-white">Contrato assinado</p>
              <p className="text-xs text-[#555555]">PDF disponível</p>
            </div>
            <a
              href={contrato.pdf_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#BAFF1A] hover:bg-[#BAFF1A]/10 border border-[#BAFF1A]/30 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Visualizar
            </a>
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-[#333333] rounded-xl">
            <FileText className="w-8 h-8 text-[#333333] mx-auto mb-2" />
            <p className="text-sm text-[#555555]">Nenhum contrato enviado ainda</p>
          </div>
        )}

        <input ref={fileRef} type="file" className="hidden" accept=".pdf" onChange={handleFile} />
        <div className="flex justify-between pt-1">
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="w-4 h-4" /> {contrato.pdf_url ? 'Substituir PDF' : 'Enviar PDF'}
          </Button>
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </Modal>
  )
}

// ——— Modal Detalhes ———
function DetalhesModal({ contrato, onClose }: { contrato: Contrato; onClose: () => void }) {
  const valorMensal = getValorMensal(contrato.tipo, contrato.valor_periodo)
  const semanas = getSemanas(contrato.data_fim)
  const info = TIPO_INFO[contrato.tipo]

  function DR({ label, value }: { label: string; value?: string }) {
    return (
      <div>
        <p className="text-xs text-[#555555]">{label}</p>
        <p className="text-sm text-white font-mono">{value || '—'}</p>
      </div>
    )
  }

  return (
    <Modal open onClose={onClose} title="Detalhes do Contrato" size="lg">
      <div className="space-y-5 max-h-[72vh] overflow-y-auto pr-1">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#333333]">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <TipoBadge tipo={contrato.tipo} />
              <StatusBadge status={contrato.status} />
            </div>
            <p className="text-xs text-[#555555]">
              {info.freq} · {info.duracao}
              {info.aquisicao && ' · Moto transferida no final'}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-[#555555]">Média mensal</p>
            <p className="text-xl font-bold text-[#BAFF1A]">{fmt(valorMensal)}</p>
          </div>
        </div>

        {/* Dados do contrato */}
        <div>
          <p className="text-xs text-[#555555] uppercase tracking-wider mb-3">Contrato</p>
          <div className="grid grid-cols-2 gap-3">
            <DR label="Data início" value={fmtDate(contrato.data_inicio)} />
            <DR label="Data fim" value={fmtDate(contrato.data_fim)} />
            <DR label={`Valor por ${contrato.tipo === 2 ? 'quinzena' : 'semana'}`} value={fmt(contrato.valor_periodo)} />
            <DR label="Semanas restantes" value={contrato.status === 'ativo' ? `${semanas} sem.` : '—'} />
          </div>
        </div>

        {/* Regras */}
        <div className="p-3 rounded-lg bg-white/[0.02] border border-[#2a2a2a]">
          <p className="text-xs text-[#555555] uppercase tracking-wider mb-2">Regras</p>
          <ul className="space-y-1 text-xs text-[#A0A0A0]">
            <li>• Pagamento {info.freq.toLowerCase()} toda quarta-feira</li>
            <li>• Juros de atraso: 10% sobre o valor da parcela</li>
            <li>• Manutenção: {info.manutencao}</li>
            <li>• Documentação e seguro: responsabilidade da empresa</li>
            {info.aquisicao && <li>• Moto transferida para o cliente na última parcela</li>}
          </ul>
        </div>

        {/* Cliente */}
        <div>
          <p className="text-xs text-[#555555] uppercase tracking-wider mb-3">Cliente</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <p className="text-xs text-[#555555]">Nome</p>
              <p className="text-sm text-white">{contrato.cliente_nome}</p>
            </div>
            <DR label="CPF" value={contrato.cliente_cpf} />
            <DR label="RG" value={contrato.cliente_rg} />
            <DR label="Telefone" value={contrato.cliente_telefone} />
            <DR label="UF" value={contrato.cliente_uf} />
            <div className="col-span-2">
              <p className="text-xs text-[#555555]">Endereço</p>
              <p className="text-sm text-[#A0A0A0]">{contrato.cliente_endereco || '—'}</p>
            </div>
            <DR label="CEP" value={contrato.cliente_cep} />
            <DR label="CNH" value={contrato.cliente_cnh} />
            <DR label="Categoria CNH" value={contrato.cliente_cnh_categoria} />
            {contrato.cliente_contato_emergencia && (
              <div className="col-span-2">
                <p className="text-xs text-[#555555]">Contato de Emergência</p>
                <p className="text-sm text-[#A0A0A0]">{contrato.cliente_contato_emergencia}</p>
              </div>
            )}
          </div>
        </div>

        {/* Moto */}
        <div>
          <p className="text-xs text-[#555555] uppercase tracking-wider mb-3">Moto</p>
          <div className="grid grid-cols-2 gap-3">
            <DR label="Placa" value={contrato.moto_placa} />
            <DR label="Modelo" value={contrato.moto_modelo} />
            <DR label="Marca" value={contrato.moto_marca} />
            <DR label="Ano" value={contrato.moto_ano} />
            <DR label="Cor" value={contrato.moto_cor} />
            {contrato.moto_renavam && <DR label="RENAVAM" value={contrato.moto_renavam} />}
            {contrato.moto_chassi && <DR label="Chassi" value={contrato.moto_chassi} />}
          </div>
        </div>

        {contrato.observacoes && (
          <div>
            <p className="text-xs text-[#555555] uppercase tracking-wider mb-2">Observações</p>
            <p className="text-sm text-[#A0A0A0] bg-[#2a2a2a] rounded-lg p-3">{contrato.observacoes}</p>
          </div>
        )}

        {contrato.motivo_encerramento && (
          <div>
            <p className="text-xs text-[#555555] uppercase tracking-wider mb-2">Motivo do Encerramento</p>
            <p className="text-sm text-[#A0A0A0] bg-[#2a2a2a] rounded-lg p-3">{contrato.motivo_encerramento}</p>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-[#333333]">
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </Modal>
  )
}

// ——— Card de contrato ———
function ContratoCard({ contrato, dim, onDetalhes, onPDF, onEncerrar }: {
  contrato: Contrato
  dim?: boolean
  onDetalhes: (c: Contrato) => void
  onPDF: (c: Contrato) => void
  onEncerrar?: (c: Contrato) => void
}) {
  const semanas = getSemanas(contrato.data_fim)
  const valorMensal = getValorMensal(contrato.tipo, contrato.valor_periodo)
  const periodoLabel = contrato.tipo === 2 ? 'quinzena' : 'semana'
  const alertaSemanas = contrato.status === 'ativo' && semanas <= 2
  const avisaSemanas  = contrato.status === 'ativo' && semanas > 2 && semanas <= 4
  const semPDF = contrato.status === 'ativo' && !contrato.pdf_url

  return (
    <div className={`bg-[#202020] border rounded-xl p-4 transition-all ${
      dim       ? 'border-[#2a2a2a] opacity-60'
      : semPDF  ? 'border-red-500/50 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]'
      : 'border-[#333333] hover:border-[#444444]'
    }`}>
      {/* Header: badges + ações */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <TipoBadge tipo={contrato.tipo} />
          <StatusBadge status={contrato.status} />
          {semPDF && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-bold">
              Sem contrato assinado
            </span>
          )}
          {TIPO_INFO[contrato.tipo].aquisicao && (
            <span className="px-2 py-0.5 rounded-full bg-[#BAFF1A]/5 border border-[#BAFF1A]/15 text-[#BAFF1A]/60 text-xs">
              Moto inclusa
            </span>
          )}
          {contrato.status === 'ativo' && (alertaSemanas || avisaSemanas) && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${
              alertaSemanas
                ? 'bg-red-500/15 border-red-500/30 text-red-400'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            }`}>
              <Clock className="w-3 h-3" /> {semanas} sem. restantes
            </span>
          )}
          {contrato.status === 'ativo' && semanas === 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border-red-500/30 text-red-400 text-xs font-medium">
              <Clock className="w-3 h-3" /> Vencido
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onPDF(contrato)}
            className={`p-1.5 rounded-lg transition-colors ${
              contrato.pdf_url
                ? 'text-green-400 hover:bg-green-500/10'
                : semPDF
                ? 'text-red-400 hover:bg-red-500/10 animate-pulse'
                : 'text-[#444444] hover:text-red-400 hover:bg-red-500/5'
            }`}
            title={contrato.pdf_url ? 'Ver contrato assinado' : 'PENDENTE: Enviar contrato assinado'}
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDetalhes(contrato)}
            className="p-1.5 rounded-lg text-[#555555] hover:text-white hover:bg-white/5 transition-colors"
            title="Ver detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
          {onEncerrar && contrato.status === 'ativo' && (
            <button
              onClick={() => onEncerrar(contrato)}
              className="p-1.5 rounded-lg text-[#444444] hover:text-amber-400 hover:bg-amber-500/5 transition-colors"
              title="Encerrar contrato"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cliente + Moto */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="flex items-start gap-2">
          <User className="w-3.5 h-3.5 text-[#555555] mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-[#555555]">Cliente</p>
            <p className="text-sm text-white font-medium leading-tight truncate">{contrato.cliente_nome}</p>
            <p className="text-xs text-[#666666]">{contrato.cliente_telefone}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Bike className="w-3.5 h-3.5 text-[#555555] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-[#555555]">Moto</p>
            <p className="text-sm text-white font-mono font-medium">{contrato.moto_placa}</p>
            <p className="text-xs text-[#666666]">{contrato.moto_modelo}</p>
          </div>
        </div>
      </div>

      {/* Linha de dados */}
      <div className="grid grid-cols-4 gap-3 pt-3 border-t border-[#2a2a2a]">
        <div>
          <p className="text-xs text-[#555555]">Início</p>
          <p className="text-xs text-white">{fmtDate(contrato.data_inicio)}</p>
        </div>
        <div>
          <p className="text-xs text-[#555555]">Fim</p>
          <p className={`text-xs font-medium ${alertaSemanas ? 'text-red-400' : 'text-white'}`}>
            {fmtDate(contrato.data_fim)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#555555]">Por {periodoLabel}</p>
          <p className="text-xs text-white font-semibold">{fmt(contrato.valor_periodo)}</p>
        </div>
        <div>
          <p className="text-xs text-[#555555]">Média/mês</p>
          <p className="text-xs text-[#BAFF1A] font-semibold">{fmt(valorMensal)}</p>
        </div>
      </div>

      {/* Semanas restantes — só ativos sem alerta */}
      {contrato.status === 'ativo' && semanas > 4 && (
        <p className="text-xs text-[#444444] mt-2">{semanas} semanas restantes</p>
      )}

      {/* Motivo encerramento */}
      {contrato.motivo_encerramento && (
        <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
          <p className="text-xs text-[#555555] mb-1">Motivo do encerramento</p>
          <p className="text-xs text-[#888888]">{contrato.motivo_encerramento}</p>
        </div>
      )}
    </div>
  )
}

// ——— Componente principal ———
export default function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>(mockContratos)
  const [showHistorico, setShowHistorico] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [detalhesContrato, setDetalhesContrato] = useState<Contrato | null>(null)
  const [pdfContrato, setPdfContrato] = useState<Contrato | null>(null)
  const [encerrarContrato, setEncerrarContrato] = useState<Contrato | null>(null)
  const [encerrarForm, setEncerrarForm] = useState<{ status: ContratoStatus; motivo: string }>({ status: 'encerrado', motivo: '' })

  const [form, setForm] = useState({
    tipo: '1', cliente_nome: '', cliente_cpf: '', cliente_telefone: '',
    moto_placa: '', moto_modelo: '', moto_marca: '', moto_ano: '', moto_cor: '',
    moto_renavam: '', moto_chassi: '', data_inicio: '', valor_periodo: '', observacoes: '',
  })

  // Carrega contratos criados via Alocar na fila
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_NEW_CONTRACTS)
      if (!raw) return
      const pending: Contrato[] = JSON.parse(raw)
      if (pending.length > 0) {
        setContratos((prev) => {
          const ids = new Set(prev.map((c) => c.id))
          return [...pending.filter((c) => !ids.has(c.id)), ...prev]
        })
        localStorage.removeItem(LS_NEW_CONTRACTS)
      }
    } catch { /* ignora erros de parse */ }
  }, [])

  // Persiste motos alocadas → fila de locadores lê isso para mostrar só disponíveis
  // TODO Supabase: remover quando moto.status vier direto do banco
  useEffect(() => {
    const ativas = contratos.filter((c) => c.status === 'ativo' || c.assinatura_pendente)
    localStorage.setItem(LS_MOTOS_ALOCADAS, JSON.stringify(ativas.map((c) => c.moto_id)))
  }, [contratos])

  const pendentes = contratos.filter((c) => c.assinatura_pendente)
  const ativos    = contratos.filter((c) => c.status === 'ativo' && !c.assinatura_pendente)
  const historico = contratos.filter((c) => c.status !== 'ativo')

  const porTipo = ([1, 2, 3] as ContratoTipo[]).map((t) => ({
    tipo: t,
    count: ativos.filter((c) => c.tipo === t).length,
  })).filter((x) => x.count > 0)

  const encerrados = historico.filter((c) => c.status === 'encerrado').length
  const cancelados = historico.filter((c) => c.status === 'cancelado').length
  const quebrados  = historico.filter((c) => c.status === 'quebrado').length

  function handleUpdatePDF(id: string, url: string) {
    setContratos((prev) => prev.map((c) => c.id === id ? { ...c, pdf_url: url, assinatura_pendente: false } : c))
    setPdfContrato((prev) => prev && prev.id === id ? { ...prev, pdf_url: url, assinatura_pendente: false } : prev)
  }

  function handleEncerrar() {
    if (!encerrarContrato) return
    setContratos((prev) => prev.map((c) => c.id === encerrarContrato.id
      ? {
          ...c,
          status: encerrarForm.status,
          motivo_encerramento: encerrarForm.motivo,
          data_fim: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        }
      : c
    ))
    setEncerrarContrato(null)
    setEncerrarForm({ status: 'encerrado', motivo: '' })
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const tipo = parseInt(form.tipo) as ContratoTipo
    const inicio = new Date(form.data_inicio + 'T12:00:00')
    const fim = new Date(inicio)
    if (tipo === 1) fim.setDate(fim.getDate() + 90)
    else fim.setFullYear(fim.getFullYear() + 2)

    setContratos((prev) => [{
      id: String(Date.now()),
      tipo,
      cliente_id: String(Date.now()),
      cliente_nome: form.cliente_nome.toUpperCase(),
      cliente_cpf: form.cliente_cpf,
      cliente_telefone: form.cliente_telefone,
      moto_id: String(Date.now() + 1),
      moto_placa: form.moto_placa.toUpperCase(),
      moto_modelo: form.moto_modelo.toUpperCase(),
      moto_marca: form.moto_marca.toUpperCase(),
      moto_ano: form.moto_ano,
      moto_cor: form.moto_cor.toUpperCase(),
      moto_renavam: form.moto_renavam || undefined,
      moto_chassi: form.moto_chassi || undefined,
      data_inicio: form.data_inicio,
      data_fim: fim.toISOString().split('T')[0],
      valor_periodo: parseFloat(form.valor_periodo),
      status: 'ativo',
      observacoes: form.observacoes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, ...prev])

    setForm({ tipo: '1', cliente_nome: '', cliente_cpf: '', cliente_telefone: '', moto_placa: '', moto_modelo: '', moto_marca: '', moto_ano: '', moto_cor: '', moto_renavam: '', moto_chassi: '', data_inicio: '', valor_periodo: '', observacoes: '' })
    setAddModalOpen(false)
  }

  const tipoOptions = [
    { value: '1', label: 'Tipo 1 — Locação (semanal · 90 dias renovável)' },
    { value: '2', label: 'Tipo 2 — Fidelidade Quinzenal (quinzenal · 24 meses)' },
    { value: '3', label: 'Tipo 3 — Fidelidade Semanal (semanal · 24 meses)' },
  ]

  const statusEncerrarOptions = [
    { value: 'encerrado', label: 'Encerrado (término natural)' },
    { value: 'cancelado', label: 'Cancelado (por acordo)' },
    { value: 'quebrado',  label: 'Quebrado (inadimplência / problema)' },
  ]

  const tipoFormInfo = TIPO_INFO[parseInt(form.tipo) as ContratoTipo]
  const valorPreview = form.valor_periodo && !isNaN(parseFloat(form.valor_periodo))
    ? getValorMensal(parseInt(form.tipo) as ContratoTipo, parseFloat(form.valor_periodo))
    : null

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Contratos"
        subtitle={`${ativos.length + pendentes.length} ativo${ativos.length + pendentes.length !== 1 ? 's' : ''}${pendentes.length > 0 ? ` · ${pendentes.length} aguardando assinatura` : ''}`}
        actions={
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="w-4 h-4" /> Novo Contrato
          </Button>
        }
      />

      <div className="p-6 space-y-5">

        {/* ——— Cards de resumo ——— */}
        <div className="grid grid-cols-2 gap-4">

          {/* Ativos */}
          <Card>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-[#666666] uppercase tracking-wider">Contratos Ativos</p>
                <p className="text-3xl font-bold text-white mt-0.5">{ativos.length}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
            </div>
            {porTipo.length > 0 ? (
              <div className="space-y-2 pt-3 border-t border-[#2a2a2a]">
                {porTipo.map(({ tipo, count }) => (
                  <div key={tipo} className="flex items-center justify-between">
                    <TipoBadge tipo={tipo} />
                    <span className="text-sm font-bold text-white">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#444444] pt-3 border-t border-[#2a2a2a]">Nenhum ativo</p>
            )}
          </Card>

          {/* Histórico */}
          <Card>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-[#666666] uppercase tracking-wider">Histórico</p>
                <p className="text-3xl font-bold text-white mt-0.5">{historico.length}</p>
              </div>
              <History className="w-5 h-5 text-[#555555] mt-1" />
            </div>
            <div className="space-y-2 pt-3 border-t border-[#2a2a2a]">
              {encerrados > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#888888]">Encerrados</span>
                  <span className="text-sm font-bold text-[#888888]">{encerrados}</span>
                </div>
              )}
              {cancelados > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-400/70">Cancelados</span>
                  <span className="text-sm font-bold text-amber-400">{cancelados}</span>
                </div>
              )}
              {quebrados > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-red-400/70">Quebrados</span>
                  <span className="text-sm font-bold text-red-400">{quebrados}</span>
                </div>
              )}
              {historico.length === 0 && (
                <p className="text-xs text-[#444444]">Nenhum histórico</p>
              )}
            </div>
          </Card>
        </div>

        {/* ——— Contratos novos aguardando assinatura (criados via Fila) ——— */}
        {pendentes.length > 0 && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <p className="text-sm font-bold text-red-400">
                {pendentes.length} contrato{pendentes.length > 1 ? 's' : ''} aguardando assinatura — anexar PDF urgente
              </p>
            </div>
            {pendentes.map((c) => (
              <ContratoCard
                key={c.id} contrato={c}
                onDetalhes={setDetalhesContrato}
                onPDF={setPdfContrato}
                onEncerrar={setEncerrarContrato}
              />
            ))}
          </div>
        )}

        {/* ——— Lista de contratos ativos ——— */}
        {ativos.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-[#333333] mx-auto mb-3" />
            <p className="text-[#555555] text-sm">Nenhum contrato ativo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ativos.map((c) => (
              <ContratoCard
                key={c.id} contrato={c}
                onDetalhes={setDetalhesContrato}
                onPDF={setPdfContrato}
                onEncerrar={setEncerrarContrato}
              />
            ))}
          </div>
        )}

        {/* ——— Toggle histórico ——— */}
        {historico.length > 0 && (
          <>
            <button
              onClick={() => setShowHistorico((v) => !v)}
              className="flex items-center gap-2 text-xs text-[#555555] hover:text-[#A0A0A0] transition-colors pt-1"
            >
              <History className="w-3.5 h-3.5" />
              {showHistorico ? 'Ocultar histórico' : `Ver histórico (${historico.length})`}
              {showHistorico ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showHistorico && (
              <div className="space-y-3 pt-1">
                {historico.map((c) => (
                  <ContratoCard
                    key={c.id} contrato={c} dim
                    onDetalhes={setDetalhesContrato}
                    onPDF={setPdfContrato}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ——— Modais ——— */}

      {detalhesContrato && (
        <DetalhesModal
          contrato={contratos.find((c) => c.id === detalhesContrato.id) ?? detalhesContrato}
          onClose={() => setDetalhesContrato(null)}
        />
      )}

      {pdfContrato && (
        <PDFModal
          contrato={contratos.find((c) => c.id === pdfContrato.id) ?? pdfContrato}
          onClose={() => setPdfContrato(null)}
          onUpdate={handleUpdatePDF}
        />
      )}

      {/* Encerrar contrato */}
      {encerrarContrato && (
        <Modal open onClose={() => setEncerrarContrato(null)} title="Encerrar Contrato" size="sm">
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-white/[0.03] border border-[#333333]">
              <p className="text-xs text-[#555555]">Contrato</p>
              <p className="font-semibold text-white">{encerrarContrato.cliente_nome}</p>
              <p className="text-xs text-[#A0A0A0]">{encerrarContrato.moto_placa} · {encerrarContrato.moto_modelo}</p>
            </div>
            <Select
              label="Tipo de encerramento"
              options={statusEncerrarOptions}
              value={encerrarForm.status}
              onChange={(e) => setEncerrarForm({ ...encerrarForm, status: e.target.value as ContratoStatus })}
            />
            <Textarea
              label="Motivo / Observação"
              placeholder="Descreva o motivo do encerramento..."
              rows={3}
              value={encerrarForm.motivo}
              onChange={(e) => setEncerrarForm({ ...encerrarForm, motivo: e.target.value })}
            />
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => setEncerrarContrato(null)}>Cancelar</Button>
              <Button variant="danger" onClick={handleEncerrar}>
                <XCircle className="w-4 h-4" /> Confirmar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Novo Contrato */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Novo Contrato" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <Select
            label="Tipo de Contrato"
            options={tipoOptions}
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          />

          {/* Resumo das regras do tipo selecionado */}
          <div className="p-3 rounded-lg bg-white/[0.02] border border-[#2a2a2a] text-xs text-[#666666] space-y-1">
            <p>• Pagamento {tipoFormInfo.freq.toLowerCase()} toda quarta-feira</p>
            <p>• Duração: {tipoFormInfo.duracao}</p>
            <p>• Manutenção: {tipoFormInfo.manutencao}</p>
            <p>• Documentação e seguro: responsabilidade da empresa</p>
            {tipoFormInfo.aquisicao && <p>• Moto transferida para o cliente na última parcela</p>}
          </div>

          {/* Cliente */}
          <div className="border-t border-[#333333] pt-3">
            <p className="text-xs text-[#555555] uppercase tracking-wider mb-3">Cliente</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nome completo" placeholder="NOME COMPLETO" value={form.cliente_nome}
                onChange={(e) => setForm({ ...form, cliente_nome: e.target.value })} required />
              <Input label="CPF" placeholder="000.000.000-00" value={form.cliente_cpf}
                onChange={(e) => setForm({ ...form, cliente_cpf: e.target.value })} required />
              <Input label="Telefone" placeholder="21 99999-0000" value={form.cliente_telefone}
                onChange={(e) => setForm({ ...form, cliente_telefone: e.target.value })} required />
            </div>
          </div>

          {/* Moto */}
          <div className="border-t border-[#333333] pt-3">
            <p className="text-xs text-[#555555] uppercase tracking-wider mb-3">Moto</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Placa" placeholder="AAA0A00" value={form.moto_placa}
                onChange={(e) => setForm({ ...form, moto_placa: e.target.value })} required />
              <Input label="Modelo" placeholder="HONDA/CG 160 START" value={form.moto_modelo}
                onChange={(e) => setForm({ ...form, moto_modelo: e.target.value })} required />
              <Input label="Marca" placeholder="HONDA" value={form.moto_marca}
                onChange={(e) => setForm({ ...form, moto_marca: e.target.value })} />
              <Input label="Ano" placeholder="24/25" value={form.moto_ano}
                onChange={(e) => setForm({ ...form, moto_ano: e.target.value })} />
              <Input label="Cor" placeholder="PRETO" value={form.moto_cor}
                onChange={(e) => setForm({ ...form, moto_cor: e.target.value })} />
              <Input label="RENAVAM" placeholder="00000000000" value={form.moto_renavam}
                onChange={(e) => setForm({ ...form, moto_renavam: e.target.value })} />
              <div className="col-span-2">
                <Input label="Chassi" placeholder="9C2JC3110RR000000" value={form.moto_chassi}
                  onChange={(e) => setForm({ ...form, moto_chassi: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Datas e valores */}
          <div className="border-t border-[#333333] pt-3">
            <p className="text-xs text-[#555555] uppercase tracking-wider mb-3">Valores e Datas</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Data de Início" type="date" value={form.data_inicio}
                onChange={(e) => setForm({ ...form, data_inicio: e.target.value })} required />
              <Input
                label={`Valor por ${form.tipo === '2' ? 'quinzena' : 'semana'} (R$)`}
                type="number" step="0.01" placeholder="350.00"
                value={form.valor_periodo}
                onChange={(e) => setForm({ ...form, valor_periodo: e.target.value })} required
              />
            </div>
            {valorPreview !== null && (
              <p className="text-xs text-[#555555] mt-2">
                Valor mensal médio estimado:{' '}
                <span className="text-[#BAFF1A] font-semibold">{fmt(valorPreview)}</span>
              </p>
            )}
          </div>

          <Textarea label="Observações" placeholder="Condições especiais, notas do contrato..." rows={2}
            value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>Cancelar</Button>
            <Button type="submit"><FileText className="w-4 h-4" /> Criar Contrato</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
