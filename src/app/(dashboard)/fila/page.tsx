/**
 * @file src/app/(dashboard)/fila/page.tsx
 * @description Componente de gerenciamento da fila de espera para novos locatários do sistema GoMoto.
 * 
 * @summary
 * Esta página é o centro de controle para a captação de novos clientes. Ela permite visualizar,
 * adicionar, reordenar e, mais importante, alocar pessoas da Fila para motocicletas disponíveis,
 * oficializando o início de um novo contrato. Também lida com a gestão de documentos
 * necessários para a aprovação do cadastro.
 * 
 * @funcionalidades
 * 1.  **Visualização da Fila**: Apresenta os candidatos em ordem de posição.
 * 2.  **CRUD de Candidatos**: Permite adicionar novos interessados, editar seus dados e removê-los.
 * 3.  **Reordenação**: Oferece a funcionalidade de mover candidatos para cima ou para baixo na fila.
 * 4.  **Alocação de Veículo**: Abre um fluxo para vincular um candidato a uma moto, gerando um novo contrato.
 * 5.  **Gestão de Documentos**: Interface para upload e verificação de documentos (CNH, Comprovante de Residência).
 * 6.  **Histórico e Alertas**: Mantém um histórico de movimentações e alerta sobre candidatos com
 *     histórico negativo (calote, fraude) ou com cadastro expirado.
 */

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
import type { Document, DocumentType, QueueMovement } from '@/types'
import { ALL_MOTORCYCLES, LS_ALLOCATED_MOTORCYCLES, LS_QUEUE, LS_NEW_CONTRACTS } from '@/data/motos'

/**
 * @type AlertType
 * @description Define os tipos de alertas de segurança possíveis para um candidato na Fila.
 * 'calote': Indica um histórico de inadimplência em contratos anteriores.
 * 'fraude': Indica tentativa de fraude ou fornecimento de dados falsos.
 */
type AlertType = 'calote' | 'fraude'

/**
 * @interface RentalHistory
 * @description Representa o histórico de locações prévias de um candidato.
 * O "porquê": Essencial para identificar ex-clientes e seu comportamento passado,
 * como inadimplência ou histórico de bom pagador.
 */
interface RentalHistory {
  startDate: string      // Data de início do contrato anterior.
  endDate?: string        // Data de término (se aplicável).
  bikePlate?: string     // Placa da moto utilizada.
  bikeModel?: string     // Modelo da moto utilizada.
  exitReason: string     // Motivo pelo qual o contrato foi encerrado.
  amountDue?: number     // Valor que o cliente ficou devendo, se houver.
}

/**
 * @interface QueueHistory
 * @description Armazena o histórico de passagens do candidato pela Fila.
 * O "porquê": Ajuda a identificar desistências recorrentes ou retornos de um mesmo
 * candidato, o que pode ser um indicador de seu nível de comprometimento.
 */
interface QueueHistory {
  entryDate: string      // Data de entrada na Fila.
  exitDate?: string       // Data de saída da Fila.
  exitReason?: string     // Motivo da saída (ex: alocado, desistiu).
}

/**
 * @interface PersonInQueue
 * @description Interface principal para um candidato na Fila de Espera.
 * Agrega dados pessoais, documentos, posição atual e históricos de locação e da própria fila.
 */
interface PersonInQueue {
  id: string              // Identificador único (UUID ou Timestamp).
  position: number        // Posição numérica atual na lista de espera.
  name: string            // Nome completo do candidato.
  taxId?: string          // CPF do candidato para verificação.
  phone: string           // Telefone de contato (preferencialmente WhatsApp).
  address?: string        // Endereço residencial informado.
  identification?: string // RG ou outro documento de identificação.
  objective?: string      // Objetivo da locação (ex: trabalho, lazer).
  progress?: string       // Anotações sobre o andamento da conversa/análise.
  social?: string         // Link para perfil em rede social (Instagram/FB).
  joinedAt: string        // Data da última entrada na Fila.
  alert?: AlertType       // Alerta de segurança, se houver.
  isExClient?: boolean    // Flag que indica se já foi cliente anteriormente.
  rentalHistory?: RentalHistory[] // Lista de locações passadas.
  queueHistory?: QueueHistory[]   // Lista de entradas anteriores na Fila.
  documents: Document[]           // Lista de arquivos/documentos anexados.
  positionHistory: QueueMovement[] // Log de mudanças de posição na Fila.
}

/**
 * @constant REQUIRED_DOCS
 * @description Lista de tipos de documentos estritamente necessários para aprovação do cadastro.
 */
const REQUIRED_DOCS: DocumentType[] = ['drivers_license', 'proof_of_residence']

/**
 * @constant DOC_LABELS
 * @description Mapeamento de rótulos amigáveis para os tipos internos de documentos.
 */
const DOC_LABELS: Record<DocumentType, string> = {
  drivers_license: "Carteira de Habilitação (CNH)",
  proof_of_residence: 'Comprovante de Residência',
  contract: 'Contrato',
  identification: 'RG / Identidade',
  deposit: 'Caução',
  other: 'Outro',
}

/**
 * @constant DOC_TYPES_OPTIONS
 * @description Opções para o seletor de tipo de documento no upload da Fila.
 */
const DOC_TYPES_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: 'drivers_license', label: "Carteira de Habilitação (CNH)" },
  { value: 'proof_of_residence', label: 'Comprovante de Residência' },
  { value: 'identification', label: 'RG / Identidade' },
  { value: 'other', label: 'Outro' },
]

/**
 * @constant mockQueue
 * @description Dados iniciais para simulação/mock da Fila enquanto o Supabase não é integrado.
 */
const mockQueue: PersonInQueue[] = [
  { id: '1',  position: 1,  name: 'Felipe Cardoso',        phone: '21981751172', social: 'https://www.instagram.com/2767_felipe/',           joinedAt: '2026-02-20', documents: [], positionHistory: [] },
  { id: '2',  position: 2,  name: 'Keven Dantas',          phone: '21979955712', social: 'https://www.instagram.com/kevendantasbfr/',         joinedAt: '2026-02-22', documents: [], positionHistory: [] },
  { id: '3',  position: 3,  name: 'Eduardo Araújo',        phone: '21977271141', social: 'https://www.instagram.com/eduaraujorj/',            joinedAt: '2026-02-25', documents: [], positionHistory: [] },
  { id: '4',  position: 4,  name: 'Bruno Gonçalves Gomes', phone: '21991271801', social: 'https://www.facebook.com/bruno.goncalvesgomes.35', joinedAt: '2026-02-28', documents: [], positionHistory: [] },
  { id: '5',  position: 5,  name: 'Bruno Torres',          phone: '21999356887', social: 'https://www.instagram.com/brunotorresoficial',      joinedAt: '2026-03-01', documents: [], positionHistory: [] },
  { id: '6',  position: 6,  name: 'Flavio Conceicao',      phone: '21970390979', social: 'https://www.instagram.com/flavio.conceicao.tdb',   joinedAt: '2026-03-03', documents: [], positionHistory: [] },
  { id: '7',  position: 7,  name: 'Rodrigo Santos',        phone: '21996722289', social: 'https://www.instagram.com/rodrigo_sannx',          joinedAt: '2026-03-05', documents: [], positionHistory: [] },
  { id: '8',  position: 8,  name: 'Anderson Barros',       phone: '21973654490', social: 'https://www.instagram.com/euandersonbarros11/',     joinedAt: '2026-03-07', documents: [], positionHistory: [] },
  { id: '12', position: 9,  name: 'Leandro Bezerra',       phone: '22988248400', social: 'https://www.facebook.com/leandro.bezerra.1232',    joinedAt: '2026-03-08', documents: [], positionHistory: [] },
  {
    id: '9', position: 10, name: 'Braz Lima', taxId: '060.415.307-43', phone: '21981611640',
    address: 'RUA PEDRO PREREIRA DA SILVA N° 722 - CASA 103 - SANTA CRUZ - RIO DE JANEIRO - CEP 23590-170',
    identification: '14089S162', objective: 'Uso pessoal. Trabalha com insulfilm de automotivos e residências.',
    progress: `05/02/25 — Interesse na CG. Combinamos para ver a moto dia 06/02 às 10h na Praça do Pedrinho.
06/02/25 — Não compareceu e não deu retorno.`,
    social: 'https://www.instagram.com/lima.brazde/', joinedAt: '2025-02-05', alert: 'fraude',
    documents: [], positionHistory: [],
  },
  {
    id: '11', position: 11, name: 'Mauricio Barbosa', taxId: '123.827.187-14', phone: '21966566340',
    address: 'RUA DAS AMOREIRAS N 140, BL 2 AP 103 - COSMOS - RIO DE JANEIRO - CEP 23.056-630',
    identification: '218439255', objective: 'Motorista de aplicativo.',
    progress: 'Aguardando evolução com o Braz.',
    social: 'https://www.instagram.com/mauricio_b.f/', joinedAt: '2025-02-05',
    documents: [], positionHistory: [],
  },
]

/**
 * @constant defaultForm
 * @description Estado padrão para o formulário de adição de novo candidato.
 */
const defaultForm = { name: '', taxId: '', phone: '', address: '', identification: '', objective: '', progress: '', social: '' }

/**
 * @constant DEFAULT_VALUES
 * @description Mapeamento de valores padrão de locação por tipo de contrato.
 */
const DEFAULT_VALUES: Record<string, string> = { '1': '350', '2': '630', '3': '350' }

/**
 * @constant defaultAllocationForm
 * @description Estado padrão para o formulário de alocação de moto.
 */
const defaultAllocationForm = {
  type: '1',
  bikeId: '',
  periodValue: '350',
  startDate: new Date().toISOString().split('T')[0],
}

/**
 * @function getDaysElapsed
 * @description Função utilitária para calcular a diferença de dias entre hoje e uma data informada.
 * @param date - Data no formato YYYY-MM-DD.
 * @returns Número de dias (inteiro).
 */
function getDaysElapsed(date: string) {
  return Math.floor((new Date().getTime() - new Date(date + 'T12:00:00').getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * @function isExpired
 * @description Verifica se o registro de uma pessoa na Fila expirou (mais de 30 dias sem alocação).
 * @param person - Objeto PersonInQueue.
 * @returns `true` se expirado.
 */
function isExpired(person: PersonInQueue) { return !person.alert && getDaysElapsed(person.joinedAt) >= 30 }

/**
 * @function isFacebook
 * @description Verifica se uma URL pertence ao domínio do Facebook.
 * @param url - String da URL.
 * @returns `true` se contiver facebook.com.
 */
function isFacebook(url: string) { return url.includes('facebook.com') }

/**
 * @function getReadiness
 * @description Avalia o status de prontidão (documentação) de um candidato.
 * @param person - Objeto PersonInQueue.
 * @returns Objeto com contagem de docs OK, total necessário e flag final de prontidão.
 */
function getReadiness(person: PersonInQueue) {
  const okCount = REQUIRED_DOCS.filter((type) => person.documents.some((doc) => doc.type === type)).length
  return { okCount, total: REQUIRED_DOCS.length, isReady: okCount === REQUIRED_DOCS.length }
}

/**
 * @component WhatsAppButton
 * @description Componente de botão que redireciona para o WhatsApp Web com o número informado.
 */
function WhatsAppButton({ phoneNumber }: { phoneNumber: string }) {
  const digitsOnly = phoneNumber.replace(/\D/g, '')
  return (
    <a href={`https://web.whatsapp.com/send?phone=55${digitsOnly}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="opacity-75 hover:opacity-100 transition-opacity">
      <svg viewBox="0 0 32 32" className="w-4 h-4">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.742 5.493 2.043 7.805L0 32l8.418-2.01A15.937 15.937 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0z" fill="#25D366"/>
        <path d="M23.07 19.44c-.356-.178-2.107-1.04-2.434-1.16-.327-.12-.565-.178-.803.178-.238.356-.921 1.16-1.129 1.397-.208.238-.416.267-.772.089-.356-.178-1.503-.554-2.863-1.766-1.058-.944-1.772-2.109-1.98-2.465-.208-.356-.022-.548.156-.726.16-.16.356-.416.534-.624.178-.208.237-.356.356-.594.119-.238.06-.446-.03-.624-.089-.178-.803-1.935-1.1-2.649-.29-.695-.585-.6-.803-.611l-.683-.012c-.238 0-.624.089-.951.446-.327.356-1.248 1.219-1.248 2.974 0 1.754 1.278 3.449 1.456 3.687.178.238 2.514 3.836 6.092 5.381.852.367 1.517.587 2.035.752.855.272 1.634.234 2.249.142.686-.102 2.107-.861 2.404-1.693.297-.832.297-1.545.208-1.693-.089-.149-.327-.238-.683-.416z" fill="#fff"/>
      </svg>
    </a>
  )
}

/**
 * @component SocialButton
 * @description Componente de botão para rede social (Instagram ou Facebook).
 */
function SocialButton({ url }: { url: string }) {
  const uniqueId = `social-icon-${url.slice(-8).replace(/\W/g, '')}`
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" title={isFacebook(url) ? 'Facebook' : 'Instagram'} className="opacity-75 hover:opacity-100 transition-opacity">
      {isFacebook(url) ? (
        <svg viewBox="0 0 24 24" className="w-4 h-4"><rect width="24" height="24" rx="5" fill="#1877F2"/><path d="M16.5 8H14c-.3 0-.5.2-.5.5V10H16l-.3 2.5H13.5V19h-3v-6.5H9V10h1.5V8c0-2.2 1.3-3.5 3.5-3.5.7 0 2 .1 2.5.2V8z" fill="white"/></svg>
      ) : (
        <svg viewBox="0 0 24 24" className="w-4 h-4">
          <defs><linearGradient id={uniqueId} x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="50%" stopColor="#dc2743"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs>
          <rect width="24" height="24" rx="5.5" fill={`url(#${uniqueId})`}/>
          <circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="1.8"/>
          <circle cx="17.5" cy="6.5" r="1.1" fill="white"/>
          <rect x="2.5" y="2.5" width="19" height="19" rx="4.5" fill="none" stroke="white" strokeWidth="1.5"/>
        </svg>
      )}
    </a>
  )
}

/**
 * @component AlertBadge
 * @description Crachá visual para indicar tipos de alertas de segurança.
 */
function AlertBadge({ type }: { type: AlertType }) {
  if (type === 'fraude') return (
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

/**
 * @component ExClientBadge
 * @description Crachá visual para indicar que o candidato é um ex-cliente da empresa.
 */
function ExClientBadge() {
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-semibold">
      <UserX className="w-3 h-3" /> Ex-cliente
    </span>
  )
}

/**
 * @component ReadinessBadge
 * @description Crachá visual que mostra o progresso da documentação obrigatória.
 */
function ReadinessBadge({ person }: { person: PersonInQueue }) {
  const { okCount, total, isReady } = getReadiness(person)
  if (isReady) return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold">
      <CheckCircle className="w-3 h-3" /> Pronto
    </span>
  )
  if (okCount > 0) return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs">
      <AlertCircle className="w-3 h-3" /> {okCount}/{total} docs
    </span>
  )
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#A0A0A0] text-xs">
      <FileText className="w-3 h-3" /> Sem docs
    </span>
  )
}

/**
 * @component QueueDocsModal
 * @description Modal de Documentos da Fila.
 * Gerencia a visualização e o upload de arquivos para um candidato específico.
 */
function QueueDocsModal({ person, onClose, onUpdate }: {
  person: PersonInQueue
  onClose: () => void
  onUpdate: (id: string, docs: Document[]) => void
}) {
  const [docs, setDocs] = useState<Document[]>(person.documents)
  const [currentType, setCurrentType] = useState<DocumentType>('drivers_license')
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * @function handleFileUpload
   * @description Processa o upload de um novo arquivo simulando a criação de uma URL local.
   */
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const newDoc: Document = {
      id: String(Date.now()), type: currentType,
      name: file.name, url: URL.createObjectURL(file),
      uploaded_at: new Date().toISOString(),
    }
    const updatedDocs = [...docs, newDoc]
    setDocs(updatedDocs)
    onUpdate(person.id, updatedDocs)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /**
   * @function handleRemoveDoc
   * @description Remove um documento da lista do candidato.
   */
  function handleRemoveDoc(docId: string) {
    const updatedDocs = docs.filter((d) => d.id !== docId)
    setDocs(updatedDocs)
    onUpdate(person.id, updatedDocs)
  }

  return (
    <Modal open onClose={onClose} title="Documentos do Candidato" size="lg">
      <div className="space-y-5">
        <div className="p-3 rounded-lg bg-white/[0.03] border border-[#333333]">
          <p className="text-xs text-[#A0A0A0]">Candidato</p>
          <p className="font-semibold text-white">{person.name}</p>
          {person.taxId && <p className="text-xs text-[#A0A0A0] font-mono">{person.taxId}</p>}
        </div>

        {/* Checklist visual de documentos obrigatórios */}
        <div className="grid grid-cols-3 gap-2">
          {REQUIRED_DOCS.map((type) => {
            const hasDoc = docs.some((d) => d.type === type)
            return (
              <div key={type} className={`flex items-center gap-1.5 text-xs px-2.5 py-2 rounded-lg ${hasDoc ? 'text-green-400 bg-green-500/5 border border-green-500/20' : 'text-[#A0A0A0] bg-white/[0.02] border border-white/5'}`}>
                {hasDoc ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                {DOC_LABELS[type]}
              </div>
            )
          })}
        </div>

        {/* Interface de seleção e upload */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Select label="Tipo de Documento" options={DOC_TYPES_OPTIONS} value={currentType} onChange={(e) => setCurrentType(e.target.value as DocumentType)} />
          </div>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png,.webp" />
          <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
            <Upload /> Enviar
          </Button>
        </div>

        {/* Listagem dos documentos enviados */}
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
                  <p className="text-sm text-white truncate">{doc.name}</p>
                  <p className="text-xs text-[#A0A0A0]">{DOC_LABELS[doc.type]} · {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-1">
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors" title="Visualizar">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button onClick={() => handleRemoveDoc(doc.id)} className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-colors" title="Remover">
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

/**
 * @interface CardProps
 * @description Propriedades para o componente CardPerson.
 */
interface CardProps {
  person: PersonInQueue
  isDimmed?: boolean
  isFirst: boolean
  isLast: boolean
  expandedId: string | null
  onToggle: (id: string) => void
  onAllocate: (id: string) => void
  onRemove: (id: string) => void
  onMove: (id: string, direction: 'up' | 'down') => void
  onDocs: (p: PersonInQueue) => void
  onReactivate: (id: string) => void
}

/**
 * @component CardPerson
 * @description Componente do Card de Pessoa na Fila.
 * Exibe informações resumidas e permite expansão para ver detalhes e históricos.
 */
function CardPerson({ person, isDimmed = false, isFirst, isLast, expandedId, onToggle, onAllocate, onRemove, onMove, onDocs, onReactivate }: CardProps) {
  const daysInQueue = getDaysElapsed(person.joinedAt)
  const isExpanded = expandedId === person.id
  const isPersonExpired = isExpired(person)
  const hasDetails = !!(person.taxId || person.address || person.identification || person.objective || person.progress || person.positionHistory.length > 0 || person.rentalHistory?.length || person.queueHistory?.length)

  return (
    <div className={`bg-[#202020] border rounded-xl overflow-hidden transition-all duration-150 ${
      isExpanded ? 'border-[#BAFF1A]/30' : isDimmed ? 'border-[#2a2a2a]' : 'border-[#333333] hover:border-[#555555]'
    } ${isDimmed ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3 p-4">
        {/* Controle de Posição (Setas para cima e para baixo) */}
        {!person.alert && !isPersonExpired && (
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => !isFirst && onMove(person.id, 'up')}
              disabled={isFirst}
              className={`p-0.5 rounded transition-colors ${isFirst ? 'text-[#888888] cursor-default' : 'text-[#A0A0A0] hover:text-[#BAFF1A]'}`}
              title="Mover para cima na Fila"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#BAFF1A]/10 border border-[#BAFF1A]/20 flex items-center justify-center">
              <span className="text-xs font-bold text-[#BAFF1A]">{person.position}º</span>
            </div>
            <button
              onClick={() => !isLast && onMove(person.id, 'down')}
              disabled={isLast}
              className={`p-0.5 rounded transition-colors ${isLast ? 'text-[#888888] cursor-default' : 'text-[#A0A0A0] hover:text-[#BAFF1A]'}`}
              title="Mover para baixo na Fila"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Informações Principais do Candidato */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-semibold text-sm ${isDimmed ? 'text-[#A0A0A0]' : 'text-white'}`}>{person.name}</p>
            {person.isExClient && <ExClientBadge />}
            {person.alert && <AlertBadge type={person.alert} />}
            {!person.alert && !isPersonExpired && <ReadinessBadge person={person} />}
            {isPersonExpired && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#A0A0A0] text-xs">
                <Clock className="w-3 h-3" /> +30 dias
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1.5 text-sm text-[#A0A0A0]">
              {person.phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '$1 $2-$3')}
              <WhatsAppButton phoneNumber={person.phone} />
            </span>
            {person.social && <SocialButton url={person.social} />}
            {!person.alert && !isPersonExpired && (
              <span className={`text-xs ${daysInQueue > 20 ? 'text-amber-400' : 'text-[#A0A0A0]'}`}>
                <Clock className="w-3 h-3 inline mr-1" />
                {daysInQueue === 0 ? 'hoje' : `${daysInQueue}d`}
              </span>
            )}
          </div>
          {person.address && (
            <div className="flex items-start gap-1.5 mt-1.5">
              <MapPin className="w-3 h-3 text-[#888888] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#A0A0A0] leading-tight">{person.address}</p>
            </div>
          )}
          {person.objective && (
            <div className="flex items-start gap-1.5 mt-1">
              <Target className="w-3 h-3 text-[#BAFF1A]/50 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#A0A0A0] leading-tight">{person.objective}</p>
            </div>
          )}
        </div>

        {/* Ações Rápidas do Card */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {hasDetails && (
            <button onClick={() => onToggle(person.id)} className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-[#A0A0A0] hover:bg-white/5 transition-colors" title={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
          <button onClick={() => onDocs(person)} className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-[#BAFF1A] hover:bg-[#BAFF1A]/5 transition-colors" title="Documentos">
            <FolderOpen className="w-3.5 h-3.5" />
          </button>
          {!person.alert && !isPersonExpired && (
            <button onClick={() => onAllocate(person.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-[#BAFF1A] hover:bg-[#BAFF1A]/10 border border-[#BAFF1A]/30 transition-colors font-medium">
              <Bike className="w-3.5 h-3.5" /> Alocar
            </button>
          )}
          {isDimmed && !person.alert && (
            <button onClick={() => onReactivate(person.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-blue-400 hover:bg-blue-500/10 border border-blue-500/30 transition-colors font-medium">
              <ArrowUp className="w-3.5 h-3.5" /> Reativar
            </button>
          )}
          <button onClick={() => onRemove(person.id)} className="p-1.5 rounded-lg text-[#888888] hover:text-red-400 hover:bg-red-500/5 transition-colors" title="Remover da fila">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Seção de Detalhes Expandida */}
      {isExpanded && (
        <div className="border-t border-[#2a2a2a] px-4 pb-4 pt-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {person.taxId && <div><p className="text-xs text-[#A0A0A0]">CPF</p><p className="text-sm text-white font-mono">{person.taxId}</p></div>}
            {person.identification && (
              <div className="flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-[#A0A0A0] mt-0.5" />
                <div><p className="text-xs text-[#A0A0A0]">Identificação</p><p className="text-sm text-white font-mono">{person.identification}</p></div>
              </div>
            )}
          </div>
          {person.objective && (
            <div className="flex items-start gap-2">
              <Target className="w-3.5 h-3.5 text-[#BAFF1A] mt-0.5 flex-shrink-0" />
              <div><p className="text-xs text-[#A0A0A0] mb-0.5">Objetivo</p><p className="text-sm text-[#A0A0A0]">{person.objective}</p></div>
            </div>
          )}
          {person.progress && (
            <div className="flex items-start gap-2">
              <ClipboardList className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div><p className="text-xs text-[#A0A0A0] mb-0.5">Andamento</p><p className="text-sm text-[#A0A0A0] whitespace-pre-line">{person.progress}</p></div>
            </div>
          )}

          {/* Lista de Histórico de Locação Passada */}
          {person.rentalHistory && person.rentalHistory.length > 0 && (
            <div className="flex items-start gap-2">
              <UserX className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-[#A0A0A0] mb-1.5">Histórico como cliente</p>
                <div className="space-y-2">
                  {person.rentalHistory.map((h, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/15 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {h.bikePlate && <span className="font-mono text-xs text-white font-semibold">{h.bikePlate}</span>}
                        {h.bikeModel && <span className="text-xs text-[#A0A0A0]">{h.bikeModel}</span>}
                        <span className="text-xs text-[#A0A0A0]">
                          {new Date(h.startDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                          {h.endDate && ` → ${new Date(h.endDate + 'T12:00:00').toLocaleDateString('pt-BR')}`}
                        </span>
                      </div>
                      <p className="text-xs text-orange-400">{h.exitReason}</p>
                      {h.amountDue && (
                        <span className="flex items-center gap-1 text-xs text-red-400 font-semibold">
                          <DollarSign className="w-3 h-3" />
                          Devia R$ {h.amountDue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lista de Histórico de Mudança de Posição */}
          {person.positionHistory.length > 0 && (
            <div className="flex items-start gap-2">
              <History className="w-3.5 h-3.5 text-[#A0A0A0] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-[#A0A0A0] mb-1.5">Movimentações na Fila</p>
                <div className="space-y-1.5">
                  {person.positionHistory.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-[#A0A0A0]">{new Date(h.date).toLocaleDateString('pt-BR')}</span>
                      <span className={`flex items-center gap-0.5 font-medium ${h.to < h.from ? 'text-green-400' : 'text-amber-400'}`}>
                        {h.to < h.from ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {h.from}º → {h.to}º
                      </span>
                      <span className="text-[#A0A0A0] truncate">{h.reason}</span>
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

/**
 * @component QueuePage
 * @description Componente Principal da Página da Fila.
 * Gerencia o estado global da Fila, filtros, buscas e os modais de ação.
 */
export default function QueuePage() {
  /**
   * @state queue
   * @description Lista de pessoas na Fila, carregada do LocalStorage ou do mock.
   * O "porquê" do LocalStorage: permite persistir os dados da fila entre sessões do navegador
   * de forma simples, simulando um banco de dados para fins de demonstração.
   */
  const [queue, setQueue] = useState<PersonInQueue[]>(() => {
    try {
      const saved = localStorage.getItem(LS_QUEUE)
      return saved ? JSON.parse(saved) : mockQueue
    } catch { return mockQueue }
  })

  // Estados de Controle de UI e Filtros
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [readinessFilter, setReadinessFilter] = useState('todos')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [allocationId, setAllocationId] = useState<string | null>(null)
  const [allocationForm, setAllocationForm] = useState(defaultAllocationForm)
  const [allocatedBikes, setAllocatedBikes] = useState<string[]>([])
  const [addForm, setAddForm] = useState(defaultForm)
  const [docsPerson, setDocsPerson] = useState<PersonInQueue | null>(null)
  const [moveModal, setMoveModal] = useState<{ id: string; direction: 'up' | 'down' } | null>(null)
  const [moveReason, setMoveReason] = useState('')

  /**
   * @effect
   * @description Sincroniza o estado da Fila com o LocalStorage sempre que há mudanças.
   */
  useEffect(() => {
    localStorage.setItem(LS_QUEUE, JSON.stringify(queue))
  }, [queue])

  // Definição das abas de filtro rápido
  const readinessTabs = [
    { label: 'Todos', value: 'todos' },
    { label: 'Prontos', value: 'pronto' },
    { label: 'Sem Docs', value: 'sem_docs' },
    { label: 'Com Alerta', value: 'alerta' },
  ]

  // Filtragem e separação de registros ativos e históricos
  const allActive = queue.filter((p) => !p.alert && getDaysElapsed(p.joinedAt) < 30)
  const filteredActive = allActive.filter((p) => {
    const matchesSearch = !searchTerm || [p.name, p.phone, p.taxId].some(
      (v) => v?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const { isReady, okCount } = getReadiness(p)
    const matchesFilter =
      readinessFilter === 'pronto' ? isReady :
      readinessFilter === 'sem_docs' ? okCount === 0 :
      true
    return matchesSearch && matchesFilter
  })
  const historyList = queue.filter((p) => p.alert || getDaysElapsed(p.joinedAt) >= 30)
  
  const personToAllocate = queue.find((p) => p.id === allocationId)
  const selectedBike = ALL_MOTORCYCLES.find((m) => m.id === allocationForm.bikeId)

  /**
   * @function handleOpenAllocation
   * @description Abre o modal de alocação e carrega a lista de motos já ocupadas.
   */
  function handleOpenAllocation(id: string) {
    try {
      const allocated = JSON.parse(localStorage.getItem(LS_ALLOCATED_MOTORCYCLES) ?? '[]')
      setAllocatedBikes(allocated)
    } catch { setAllocatedBikes([]) }
    setAllocationId(id)
    setAllocationForm({ ...defaultAllocationForm, startDate: new Date().toISOString().split('T')[0] })
  }

  /**
   * @function handleAllocationTypeChange
   * @description Muda o tipo de contrato e atualiza o valor padrão correspondente.
   */
  function handleAllocationTypeChange(type: string) {
    setAllocationForm((prev) => ({ ...prev, type, periodValue: DEFAULT_VALUES[type] }))
  }

  /**
   * @function handleToggleExpand
   * @description Alterna a expansão de um card de candidato.
   */
  function handleToggleExpand(id: string) { setExpandedId((prev) => (prev === id ? null : id)) }

  /**
   * @function handleRemovePerson
   * @description Remove uma pessoa da Fila e reordena as posições subsequentes.
   */
  function handleRemovePerson(id: string) {
    setQueue((prev) => prev.filter((p) => p.id !== id).map((p, i) => ({ ...p, position: i + 1 })))
  }

  /**
   * @function handleMoveClick
   * @description Inicia o processo de movimentação manual na Fila.
   */
  function handleMoveClick(id: string, direction: 'up' | 'down') {
    setMoveReason('')
    setMoveModal({ id, direction })
  }

  /**
   * @function confirmMovePosition
   * @description Executa a troca de posições entre dois candidatos adjacentes e a registra no histórico.
   */
  function confirmMovePosition() {
    if (!moveModal) return
    const { id, direction } = moveModal
    setQueue((prev) => {
      const arr = [...prev]
      const idx = arr.findIndex((p) => p.id === id)
      if (idx < 0) return arr
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= arr.length) return arr

      const posOrigin = arr[idx].position
      const posDestiny = arr[swapIdx].position

      const movement: QueueMovement = {
        date: new Date().toISOString(),
        from: posOrigin,
        to: posDestiny,
        reason: moveReason || 'Reordenação manual',
      }
      const movementSwap: QueueMovement = {
        date: new Date().toISOString(),
        from: posDestiny,
        to: posOrigin,
        reason: moveReason || 'Reordenação manual',
      }

      arr[idx] = { ...arr[idx], position: posDestiny, positionHistory: [...arr[idx].positionHistory, movement] }
      arr[swapIdx] = { ...arr[swapIdx], position: posOrigin, positionHistory: [...arr[swapIdx].positionHistory, movementSwap] }

      return [...arr].sort((a, b) => a.position - b.position)
    })
    setMoveModal(null)
    setMoveReason('')
  }

  /**
   * @function handleConfirmAllocation
   * @description Finaliza a alocação, gerando um novo contrato e removendo o candidato da Fila.
   * O "porquê": Este é o ponto de conversão. O candidato se torna cliente, e uma moto
   * que estava disponível passa a estar ocupada. A comunicação entre as telas
   * (Fila -> Contratos) é feita via LocalStorage para simular uma API.
   */
  function handleConfirmAllocation() {
    if (!allocationId || !personToAllocate || !selectedBike) return
    const type = parseInt(allocationForm.type) as 1 | 2 | 3
    const start = new Date(allocationForm.startDate + 'T12:00:00')
    const end = new Date(start)
    if (type === 1) end.setDate(end.getDate() + 90)
    else end.setFullYear(end.getFullYear() + 2)

    const newContract = {
      id: String(Date.now()),
      type: type,
      customer_id: personToAllocate.id,
      customerName: personToAllocate.name,
      customerCpf: personToAllocate.taxId ?? '',
      customerPhone: personToAllocate.phone,
      customerAddress: personToAllocate.address,
      motorcycle_id: selectedBike.id,
      motorcycle_plate: selectedBike.license_plate,
      motorcycleModel: selectedBike.model,
      motorcycleBrand: selectedBike.make, // Corrigido de make para brand
      motorcycleYear: selectedBike.year,
      motorcycleColor: selectedBike.color,
      start_date: allocationForm.startDate,
      end_date: end.toISOString().split('T')[0],
      // Ajuste para taxa semanal/quinzenal
      weekly_rate: type !== 2 ? parseFloat(allocationForm.periodValue) : undefined,
      biweekly_rate: type === 2 ? parseFloat(allocationForm.periodValue) : undefined,
      status: 'active' as const,
      signed: false, // O contrato começa como não assinado
      observations: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const existingContracts = JSON.parse(localStorage.getItem(LS_NEW_CONTRACTS) ?? '[]')
    localStorage.setItem(LS_NEW_CONTRACTS, JSON.stringify([...existingContracts, newContract]))
    localStorage.setItem(LS_ALLOCATED_MOTORCYCLES, JSON.stringify([...allocatedBikes, selectedBike.id]))

    setQueue((prev) => prev.filter((p) => p.id !== allocationId).map((p, i) => ({ ...p, position: i + 1 })))
    setAllocationId(null)
  }

  /**
   * @function handleAddPerson
   * @description Adiciona um novo candidato ao final da Fila ativa.
   */
  function handleAddPerson(e: React.FormEvent) {
    e.preventDefault()
    setQueue((prev) => [...prev, {
      id: String(Date.now()),
      position: allActive.length + 1,
      name: addForm.name,
      taxId: addForm.taxId || undefined,
      phone: addForm.phone,
      address: addForm.address || undefined,
      identification: addForm.identification || undefined,
      objective: addForm.objective || undefined,
      progress: addForm.progress || undefined,
      social: addForm.social || undefined,
      joinedAt: new Date().toISOString().split('T')[0],
      documents: [],
      positionHistory: [],
    }])
    setAddForm(defaultForm)
    setIsAddModalOpen(false)
  }

  /**
   * @function handleUpdateDocs
   * @description Atualiza a lista de documentos para um candidato específico.
   */
  function handleUpdateDocs(personId: string, docs: Document[]) {
    setQueue((prev) => prev.map((p) => p.id === personId ? { ...p, documents: docs } : p))
    setDocsPerson((prev) => prev && prev.id === personId ? { ...prev, documents: docs } : prev)
  }

  /**
   * @function handleReactivatePerson
   * @description Reativa um registro expirado, atualizando sua data de entrada para hoje.
   */
  function handleReactivatePerson(id: string) {
    setQueue((prev) => prev.map((p) => p.id === id
      ? { ...p, joinedAt: new Date().toISOString().split('T')[0] }
      : p
    ))
  }

  const moveModalPerson = moveModal ? queue.find((p) => p.id === moveModal.id) : null

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Fila de Locadores"
        subtitle={`${filteredActive.length} aguardando`}
        actions={
          <Button onClick={() => setIsAddModalOpen(true)}>
            <UserPlus className="w-4 h-4" /> Adicionar
          </Button>
        }
      />

      <div className="p-6 space-y-3">
        {/* Barra de Ferramentas: Filtros Rápidos e Busca */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {readinessTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setReadinessFilter(tab.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  readinessFilter === tab.value
                    ? 'bg-[#BAFF1A] text-[#121212]'
                    : 'bg-[#202020] border border-[#333333] text-[#A0A0A0] hover:text-white hover:border-[#555555]'
                }`}
              >
                {tab.label}
                {tab.value !== 'todos' && (
                  <span className="ml-1.5 opacity-70">
                    ({tab.value === 'alerta'
                      ? queue.filter((p) => p.alert).length
                      : tab.value === 'pronto'
                      ? allActive.filter((p) => getReadiness(p).isReady).length
                      : allActive.filter((p) => getReadiness(p).okCount === 0).length})
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-lg bg-[#202020] border border-[#333333] text-sm text-white placeholder-[#A0A0A0] focus:outline-none focus:border-[#555555] w-64"
            />
          </div>
        </div>

        {/* Listagem de Candidatos Ativos */}
        {filteredActive.length === 0 ? (
          <div className="text-center py-16">
            <UserPlus className="w-10 h-10 text-[#888888] mx-auto mb-3" />
            <p className="text-[#A0A0A0] text-sm">Nenhuma pessoa na Fila ativa</p>
          </div>
        ) : (
          filteredActive.map((p, idx) => (
            <CardPerson
              key={p.id} person={p}
              isFirst={idx === 0} isLast={idx === filteredActive.length - 1}
              expandedId={expandedId}
              onToggle={handleToggleExpand}
              onAllocate={handleOpenAllocation}
              onRemove={handleRemovePerson}
              onMove={handleMoveClick}
              onDocs={setDocsPerson}
              onReactivate={handleReactivatePerson}
            />
          ))
        )}

        {/* Acordeão para Visualizar Histórico (Inativos e Alertas) */}
        {historyList.length > 0 && (
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="flex items-center gap-2 text-xs text-[#A0A0A0] hover:text-[#A0A0A0] transition-colors pt-2"
          >
            <History className="w-3.5 h-3.5" />
            {showHistory ? 'Ocultar histórico' : `Ver histórico (${historyList.length})`}
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}

        {showHistory && (
          <div className="space-y-2 pt-1">
            {historyList.map((p) => (
              <CardPerson
                key={p.id} person={p} isDimmed
                isFirst isLast
                expandedId={expandedId}
                onToggle={handleToggleExpand}
                onAllocate={handleOpenAllocation}
                onRemove={handleRemovePerson}
                onMove={handleMoveClick}
                onDocs={setDocsPerson}
                onReactivate={handleReactivatePerson}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Confirmação de Movimentação na Fila */}
      <Modal open={!!moveModal} onClose={() => setMoveModal(null)} title="Mover na Fila" size="sm">
        {moveModalPerson && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-white/[0.03] border border-[#333333]">
              <div className="flex items-center gap-2">
                <span className="text-[#A0A0A0] text-sm">{moveModalPerson.position}º lugar</span>
                {moveModal?.direction === 'up'
                  ? <ArrowUp className="w-4 h-4 text-green-400" />
                  : <ArrowDown className="w-4 h-4 text-amber-400" />
                }
                <span className="text-white text-sm font-medium">
                  {moveModal?.direction === 'up' ? moveModalPerson.position - 1 : moveModalPerson.position + 1}º lugar
                </span>
              </div>
              <p className="text-white font-semibold mt-1">{moveModalPerson.name}</p>
            </div>
            <Input
              label="Motivo (opcional)"
              placeholder="Ex: documentação completa, caução pago..."
              value={moveReason}
              onChange={(e) => setMoveReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => setMoveModal(null)}>Cancelar</Button>
              <Button onClick={confirmMovePosition}>Confirmar</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Alocação de Moto (Criação de Contrato) */}
      <Modal open={!!allocationId} onClose={() => setAllocationId(null)} title="Vincular a uma Moto" size="md">
        {personToAllocate && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-white/[0.03] border border-[#333333]">
              <p className="text-xs text-[#A0A0A0] mb-1">Cliente</p>
              <p className="font-semibold text-white">{personToAllocate.name}</p>
              <p className="text-sm text-[#A0A0A0]">{personToAllocate.phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '$1 $2-$3')}</p>
              {personToAllocate.taxId && <p className="text-xs text-[#A0A0A0] font-mono mt-0.5">{personToAllocate.taxId}</p>}
            </div>

            <Select
              label="Tipo de Contrato"
              options={[
                { value: '1', label: 'Tipo 1 — Locação (semanal · 90 dias renovável)' },
                { value: '2', label: 'Tipo 2 — Fidelidade Quinzenal (quinzenal · 24 meses)' },
                { value: '3', label: 'Tipo 3 — Fidelidade Semanal (semanal · 24 meses)' },
              ]}
              value={allocationForm.type}
              onChange={(e) => handleAllocationTypeChange(e.target.value)}
            />

            {/* Listagem de motos — apenas as não alocadas no LS */}
            {(() => {
              const availableBikes = ALL_MOTORCYCLES.filter((m) => !allocatedBikes.includes(m.id))
              return (
                <Select
                  label={`Moto disponível${availableBikes.length === 0 ? ' (nenhuma no momento)' : ''}`}
                  options={[
                    { value: '', label: availableBikes.length === 0 ? 'Nenhuma moto disponível' : 'Selecione a moto...' },
                    ...availableBikes.map((m) => ({ value: m.id, label: `${m.license_plate} — ${m.model} (${m.color})` })),
                  ]}
                  value={allocationForm.bikeId}
                  onChange={(e) => setAllocationForm((prev) => ({ ...prev, bikeId: e.target.value }))}
                />
              )
            })()}

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={`Valor por ${allocationForm.type === '2' ? 'quinzena' : 'semana'} (R$)`}
                type="number" step="0.01"
                value={allocationForm.periodValue}
                onChange={(e) => setAllocationForm((prev) => ({ ...prev, periodValue: e.target.value }))}
              />
              <Input
                label="Data de início"
                type="date"
                value={allocationForm.startDate}
                onChange={(e) => setAllocationForm((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <p className="text-xs text-amber-400/80 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2">
              O contrato será criado com status <strong>Pendente Assinatura</strong>. Vá para a tela de Contratos para anexar o PDF assinado.
            </p>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => setAllocationId(null)}>Cancelar</Button>
              <Button
                onClick={handleConfirmAllocation}
                disabled={!allocationForm.bikeId || !allocationForm.periodValue}
              >
                <ArrowRight className="w-4 h-4" /> Confirmar e gerar contrato
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Gerenciamento de Documentos do Candidato */}
      {docsPerson && (
        <QueueDocsModal
          person={queue.find((p) => p.id === docsPerson.id) ?? docsPerson}
          onClose={() => setDocsPerson(null)}
          onUpdate={handleUpdateDocs}
        />
      )}

      {/* MODAL: Novo Cadastro de Pessoa na Fila */}
      <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adicionar à Fila" size="lg">
        <form onSubmit={handleAddPerson} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome" placeholder="Nome completo" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} required />
            <Input label="Telefone" placeholder="21 99999-0000" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="CPF" placeholder="000.000.000-00" value={addForm.taxId} onChange={(e) => setAddForm({ ...addForm, taxId: e.target.value })} />
            <Input label="Identificação (RG / Doc)" placeholder="000000000" value={addForm.identification} onChange={(e) => setAddForm({ ...addForm, identification: e.target.value })} />
          </div>
          <Input label="Endereço" placeholder="Rua, número - Bairro - Cidade - Estado - CEP" value={addForm.address} onChange={(e) => setAddForm({ ...addForm, address: e.target.value })} />
          <Input label="Instagram / Facebook" placeholder="https://www.instagram.com/usuario" value={addForm.social} onChange={(e) => setAddForm({ ...addForm, social: e.target.value })} />
          <Textarea label="Objetivo" placeholder="Por que deseja alugar?" rows={2} value={addForm.objective} onChange={(e) => setAddForm({ ...addForm, objective: e.target.value })} />
          <Textarea label="Andamento" placeholder="Histórico de contato..." rows={2} value={addForm.progress} onChange={(e) => setAddForm({ ...addForm, progress: e.target.value })} />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button type="submit"><UserPlus className="w-4 h-4" /> Adicionar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
