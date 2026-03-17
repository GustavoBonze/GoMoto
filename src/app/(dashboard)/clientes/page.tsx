/**
 * ARQUIVO: src/app/(dashboard)/clientes/page.tsx
 * 
 * DESCRIÇÃO GERAL:
 * Esta página é o módulo central de "Gestão de Clientes" (Locatários) do sistema GoMoto.
 * Ela gerencia todo o ciclo de vida do cliente, desde o cadastro inicial até o encerramento.
 * 
 * FUNCIONALIDADES CHAVE:
 * 1. CRUD de Clientes: Criação, Leitura, Atualização e Exclusão de registros.
 * 2. Gestão de Fila: Diferenciação entre clientes com contrato ativo e interessados em espera.
 * 3. Repositório de Documentos: Sistema de upload simulado e checklist de validação de docs (CNH, RG, etc).
 * 4. Histórico de Inativos: Seção dedicada para ex-clientes, com destaque para dívidas e motivos de saída.
 * 5. Integração WhatsApp: Atalhos para iniciar conversas rápidas com os clientes.
 * 
 * ARQUITETURA:
 * - Desenvolvido como "Client Component" (Next.js) para suportar estados interativos complexos.
 * - Utiliza uma tabela dinâmica (Table) para listagem principal.
 * - Emprega modais (Modal) para formulários e visualizações detalhadas, mantendo a navegação fluida.
 */

'use client' // Habilita o uso de hooks e interatividade do lado do cliente

// Importação de hooks fundamentais do React
import { useRef, useState } from 'react'

// Importação da biblioteca Lucide para iconografia semântica
import { 
  Plus,             // Adicionar novo registro
  Edit2,            // Editar dados existentes
  Trash2,           // Remover registro
  Eye,              // Visualizar detalhes profundos
  Search,           // Pesquisar na listagem
  CheckCircle,      // Indicação de sucesso ou item concluído
  AlertCircle,      // Indicação de pendência ou erro
  FolderOpen,       // Abrir pasta de documentos
  Upload,           // Enviar arquivo para o servidor
  FileText,         // Ícone genérico de documento
  X,                // Fechar ou cancelar ação
  ExternalLink,     // Abrir link em nova aba
  UserX,            // Representa cliente inativo ou excluído
  ChevronDown,      // Expandir conteúdo
  ChevronUp,        // Recolher conteúdo
  DollarSign,       // Representa valores monetários ou dívidas
  History           // Acessar logs ou histórico passado
} from 'lucide-react'

// Importação dos componentes de Layout e UI atômicos do projeto
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'

// Importação das definições de tipos para garantir integridade de dados (TypeScript)
import type { 
  Customer,                  // Estrutura principal do objeto Cliente
  Document,                // Estrutura de um arquivo anexo
  DocumentType,        // Enum de tipos suportados (cnh, rg, etc)
  CustomerRentalHistory // Registro de locações passadas
} from '@/types'

/**
 * MAPA: DOCUMENT_LABELS
 * 
 * Traduz as chaves técnicas do banco de dados para nomes amigáveis em Português.
 * Utilizado em labels de formulários e cabeçalhos de visualização.
 */
const DOCUMENT_LABELS: Record<DocumentType, string> = {
  drivers_license: 'Carteira de Habilitação (CNH)',
  proof_of_residence: 'Comprovante de Residência',
  contract: 'Contrato',
  identification: 'Identidade (RG)',
  deposit: 'Caução',
  other: 'Outro',
}

/**
 * ARRAY: DOCUMENT_TYPES
 * 
 * Converte o objeto DOCUMENT_LABELS em um formato compatível com o componente <Select />.
 */
const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = Object.entries(DOCUMENT_LABELS).map(
  ([value, label]) => ({ value: value as DocumentType, label })
)

/**
 * MOCK DATA: mockCustomers
 * 
 * Conjunto de dados estáticos para desenvolvimento e testes de interface.
 * Simula clientes reais do sistema GoMoto, incluindo ex-clientes com pendências.
 */
const mockCustomers: Customer[] = [
  {
    id: '1', 
    name: 'FABRICIO DO VALE NEPOMUCENO', 
    cpf: '129.616.867-09', 
    rg: '207189267', 
    state: 'RJ',
    phone: '21 98776-4348', 
    email: '', 
    address: 'R ADELINO 12 - ROLLAS 2 - SANTA CRUZ - RIO DE JANEIRO - RJ',
    zip_code: '23590-170', 
    emergency_contact: 'MÃE: (21) 99184-7214 | IRMÃO: (21) 96577-2573',
    drivers_license: '4372430975', 
    drivers_license_validity: '', 
    drivers_license_category: 'A', 
    payment_status: 'Caução pago',
    in_queue: false, 
    observations: '', 
    documents: [],
    created_at: '2025-06-20T10:00:00Z', 
    updated_at: '2025-06-20T10:00:00Z',
  },
  {
    id: '2', 
    name: 'DOUGLAS DOS SANTOS SIMÔES', 
    cpf: '173.964.027-60', 
    rg: '300246329', 
    state: 'RJ',
    phone: '21 97389-7602', 
    email: '', 
    address: 'ESTRADA DE SEPETIBA N 595 - BLOCO 09 CASA 02 - SANTA CRUZ - RIO DE JANEIRO - RJ',
    zip_code: '23520-660', 
    emergency_contact: 'ESPOSA: (21) 96683-1232 | MÃE: (21) 97876-1439',
    drivers_license: '7601971200', 
    drivers_license_validity: '', 
    drivers_license_category: 'A', 
    payment_status: 'Caução pago',
    in_queue: false, 
    observations: '', 
    documents: [],
    created_at: '2025-10-23T10:00:00Z', 
    updated_at: '2025-10-23T10:00:00Z',
  },
  {
    id: '3', 
    name: 'FLAVIO SILVA COUTINHO', 
    cpf: '054.666.677-41', 
    rg: '8466667741', 
    state: 'RJ',
    phone: '21 96445-2588', 
    email: '', 
    address: 'RUA ITAMBARACA SN CASA 2 LT 11 QD 124 - COSMOS - RIO DE JANEIRO - RJ',
    zip_code: '23060-070', 
    emergency_contact: 'GUILHERME (filho): (21) 95947-8641 | MARIANA (filha): (21) 95904-1370',
    drivers_license: '4201494036', 
    drivers_license_validity: '', 
    drivers_license_category: 'A', 
    payment_status: 'Caução pago',
    in_queue: false, 
    observations: '', 
    documents: [],
    created_at: '2025-02-06T10:00:00Z', 
    updated_at: '2025-02-06T10:00:00Z',
  },
  {
    id: '4', 
    name: 'ALEXANDRE DANTAS DAS SILVA', 
    cpf: '099.762.467-14', 
    rg: '12488178', 
    state: 'RJ',
    phone: '21 98116-5350', 
    email: '', 
    address: 'CAMINHO DE TUTOIA 1SN QD 120 FUNDOS - COSMOS - RIO DE JANEIRO - RJ',
    zip_code: '23060-275', 
    emergency_contact: '(21) 98116-5350',
    drivers_license: '9225925768', 
    drivers_license_validity: '', 
    drivers_license_category: 'A', 
    payment_status: 'Caução pago',
    in_queue: false, 
    observations: '', 
    documents: [],
    created_at: '2026-03-09T10:00:00Z', 
    updated_at: '2026-03-09T10:00:00Z',
  },
  
  /* 
   * SEÇÃO: EX-CLIENTES (HISTÓRICO)
   * Representa clientes que já utilizaram o sistema mas estão inativos.
   * Crucial para identificar inadimplentes recorrentes.
   */
  {
    id: 'ex1', 
    name: 'JOHNNY TAVARES', 
    cpf: '145.525.957-84', 
    rg: '271370075', 
    state: 'RJ',
    phone: '21 98662-9070', 
    email: '', 
    address: 'AV. JOÃO XXIII, 1050 BL 08 APT 401 MIKONOS - SANTA CRUZ - RIO DE JANEIRO - RJ',
    zip_code: '23560-903', 
    emergency_contact: '',
    drivers_license: '', 
    drivers_license_validity: '', 
    drivers_license_category: 'A', 
    payment_status: '',
    in_queue: false, 
    active: false, // Flag de inatividade
    departure_date: '2024-10-15',
    departure_reason: 'Encerrou contrato com dívida em aberto.',
    rental_history: [
      { 
        start_date: '2024-06-01', 
        end_date: '2024-10-15', 
        motorcycle_license_plate: 'BBB1B11', 
        motorcycle_model: 'YAMAHA/YS150 FAZER SED', 
        departure_reason: 'Encerrou contrato com dívida em aberto.', 
        amount_due: 850 
      },
    ],
    observations: 'Motorista de aplicativo. Comprovante de residência de Realengo — pendência de Santa Cruz.', 
    documents: [],
    created_at: '2024-06-01T10:00:00Z', 
    updated_at: '2024-10-15T10:00:00Z',
  },
  {
    id: 'ex2', 
    name: 'ANDERSON LIMA', 
    cpf: '143.985.447-55', 
    rg: '268137676', 
    state: 'RJ',
    phone: '21 97632-6541', 
    email: '', 
    address: 'ESTRADA DA PEDRA, 1700 - GUARATIBA - RIO DE JANEIRO - RJ',
    zip_code: '23030-380', 
    emergency_contact: '',
    drivers_license: '', 
    drivers_license_validity: '', 
    drivers_license_category: 'A', 
    payment_status: '',
    in_queue: false, 
    active: false,
    departure_date: '2025-01-20',
    departure_reason: 'Abandonou a moto e sumiu com dívida em aberto.',
    rental_history: [
      { 
        start_date: '2024-08-01', 
        end_date: '2025-01-20', 
        motorcycle_license_plate: 'AAA0A00', 
        motorcycle_model: 'HONDA/CG 160 START', 
        departure_reason: 'Abandonou a moto e sumiu com dívida em aberto.', 
        amount_due: 1200 
      },
    ],
    observations: '', 
    documents: [],
    created_at: '2024-08-01T10:00:00Z', 
    updated_at: '2025-01-20T10:00:00Z',
  },
]

/**
 * ESTADO INICIAL: defaultFormState
 * 
 * Define o esqueleto de dados para o formulário de cadastro/edição.
 * Garante que os componentes Input do React sejam "Controlled Components".
 */
const defaultFormState = {
  name: '',               // Nome completo
  cpf: '',                // Documento CPF
  rg: '',                 // Documento RG
  state: 'RJ',            // Estado de origem
  phone: '',              // Telefone (WhatsApp)
  email: '',              // Endereço eletrônico
  address: '',            // Rua, número, complemento
  zipCode: '',            // Código postal (CEP)
  emergencyContact: '',   // Nome e tel de parentes
  cnh: '',                // Número do registro da CNH
  cnhExpiry: '',          // Data de validade da CNH
  cnhCategory: '',        // Categorias habilitadas (A, B, AB)
  paymentStatus: '',      // Descritivo do caução
  notes: '',              // Campo de observações de texto livre
}

/**
 * FUNÇÃO: customerToForm
 * 
 * Converte o objeto de domínio 'Customer' para o formato plano do formulário.
 * Lida com valores nulos ou indefinidos convertendo-os em strings vazias.
 */
function customerToForm(customer: Customer) {
  return {
    name: customer.name, 
    cpf: customer.cpf, 
    rg: customer.rg ?? '', 
    state: customer.state ?? 'RJ',
    phone: customer.phone, 
    email: customer.email ?? '',
    address: customer.address ?? '', 
    zipCode: customer.zip_code ?? '',
    emergencyContact: customer.emergency_contact ?? '',
    cnh: customer.drivers_license, 
    cnhExpiry: customer.drivers_license_validity ?? '',
    cnhCategory: customer.drivers_license_category ?? '',
    paymentStatus: customer.payment_status ?? '',
    notes: customer.observations ?? '',
  }
}

/**
 * CONFIGURAÇÃO: STATE_OPTIONS
 * 
 * Gera uma lista de objetos para o Select de Unidades Federativas.
 */
const STATE_OPTIONS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
].map((uf) => ({ value: uf, label: uf }))

/**
 * FUNÇÃO: getDocumentIconColor
 * 
 * Atribui cores semânticas aos ícones de documentos para facilitar a distinção visual.
 */
function getDocumentIconColor(type: DocumentType) {
  const colors: Record<DocumentType, string> = {
    drivers_license: 'text-blue-400',                   // Azul para habilitação
    proof_of_residence: 'text-green-400', // Verde para residência
    contract: 'text-purple-400',            // Roxo para termos legais
    identification: 'text-yellow-400',       // Amarelo para RG/CPF
    deposit: 'text-[#BAFF1A]',               // Cor da marca para financeiro
    other: 'text-[#A0A0A0]',                // Cinza para outros
  }
  return colors[type] ?? 'text-[#A0A0A0]'
}

/**
 * SUB-COMPONENTE: FormerCustomerCard
 * 
 * Renderiza um painel específico para ex-clientes.
 * Focado em transparência de dívidas e histórico operacional.
 */
function FormerCustomerCard({ customer }: { customer: Customer }) {
  // Estado local para controlar a abertura do histórico de locações
  const [isExpanded, setIsExpanded] = useState(false)
  // Cálculo somatório do montante devido pelo ex-cliente
  const totalDebt = (customer.rental_history ?? []).reduce((sum, h) => sum + (h.amount_due ?? 0), 0)

  return (
    <div className="bg-[#202020] border border-[#2a2a2a] rounded-xl overflow-hidden opacity-85 hover:opacity-100 transition-opacity">
      {/* Cabeçalho do Card */}
      <div className="flex items-center gap-4 p-4">
        {/* Avatar/Ícone de Inativo */}
        <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
          <UserX className="w-5 h-5 text-red-400" />
        </div>
        
        {/* Informações Resumidas */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="font-bold text-sm text-[#E0E0E0]">{customer.name}</p>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase">
              <UserX className="w-3 h-3" /> EX-CLIENTE
            </span>
            {/* Alerta de Dívida: Só exibe se houver valor > 0 */}
            {totalDebt > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase animate-pulse">
                <DollarSign className="w-3 h-3" />
                DÉBITO: R$ {totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1.5 flex-wrap">
            <p className="text-[11px] text-[#606060] font-mono font-bold">{customer.cpf}</p>
            {customer.departure_date && (
              <p className="text-[11px] text-[#606060] font-medium italic">
                Encerramento em {new Date(customer.departure_date + 'T12:00:00').toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </div>
        
        {/* Gatilho de Expansão (Accordion) */}
        {(customer.rental_history ?? []).length > 0 && (
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="p-2 rounded-xl text-[#606060] hover:text-white hover:bg-white/5 transition-all flex-shrink-0 border border-transparent hover:border-white/10"
            title={isExpanded ? "Ocultar Histórico" : "Ver Histórico de Locações"}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* PAINEL EXPANSÍVEL: Histórico e Motivações */}
      {isExpanded && (
        <div className="border-t border-[#2a2a2a] px-4 pb-4 pt-4 space-y-4 bg-black/10">
          <h6 className="text-[10px] text-[#BAFF1A] font-black uppercase tracking-[0.2em] ml-1">Log de Locações Passadas</h6>
          
          <div className="grid grid-cols-1 gap-3">
            {(customer.rental_history ?? []).map((h: CustomerRentalHistory, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] space-y-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    {h.motorcycle_license_plate && <span className="font-mono text-xs text-white font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10">{h.motorcycle_license_plate}</span>}
                    {h.motorcycle_model && <span className="text-xs text-[#A0A0A0] font-medium">{h.motorcycle_model}</span>}
                  </div>
                  <span className="text-[11px] text-[#606060] font-bold">
                    {new Date(h.start_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    {h.end_date && ` — ${new Date(h.end_date + 'T12:00:00').toLocaleDateString('pt-BR')}`}
                  </span>
                </div>
                
                {/* Detalhamento do encerramento */}
                <div className="space-y-1">
                  <p className="text-xs text-[#A0A0A0] font-medium leading-relaxed">
                    <span className="text-red-400 font-bold uppercase text-[9px] mr-2">Motivo da Saída:</span> 
                    {h.departure_reason}
                  </p>
                  {h.amount_due && (
                    <p className="flex items-center gap-1.5 text-xs text-orange-400 font-black">
                      <AlertCircle className="w-3.5 h-3.5" />
                      VALOR EM ABERTO NO CONTRATO: R$ {h.amount_due.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Observações administrativas críticas */}
          {customer.observations && (
            <div className="mt-4 p-3 bg-red-500/5 rounded-lg border border-red-500/10">
              <p className="text-[11px] text-red-300 font-medium italic leading-relaxed">
                <span className="font-black not-italic text-red-400 mr-2">NOTA INTERNA:</span>
                {customer.observations}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * MODAL: DocumentsModal
 * 
 * Interface dedicada para o gerenciamento documental do locatário.
 */
function DocumentsModal({
  customer,
  onClose,
  onUpdate,
}: {
  customer: Customer
  onClose: () => void
  onUpdate: (id: string, docs: Document[]) => void
}) {
  // Estado local sincronizado com a lista de documentos do cliente
  const [docs, setDocs] = useState<Document[]>(customer.documents ?? [])
  // Tipo de documento selecionado no dropdown de envio
  const [selectedType, setSelectedType] = useState<DocumentType>('drivers_license')
  // Referência para o input hidden de arquivos
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * HANDLER: handleFileChange
   * 
   * Simula o fluxo de upload: lê arquivo local, gera ID e URL Blob.
   */
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return // Sai se o usuário cancelar a seleção
    
    // Criação do objeto Documento
    const newDoc: Document = {
      id: String(Date.now()),           // Gera ID único por timestamp
      type: selectedType,              // Tipo definido no Select
      name: file.name,                 // Nome original do arquivo
      url: URL.createObjectURL(file),  // Gera URL temporária para preview
      uploaded_at: new Date().toISOString(), // Timestamp do upload
    }
    
    const updatedDocs = [...docs, newDoc]
    setDocs(updatedDocs)               // Atualiza estado local do modal
    onUpdate(customer.id, updatedDocs) // Notifica o componente pai
    
    // Reseta o input para permitir enviar o mesmo arquivo novamente se necessário
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /**
   * HANDLER: handleRemoveDocument
   * 
   * Remove fisicamente um documento do registro.
   */
  function handleRemoveDocument(id: string) {
    const updatedDocs = docs.filter((d) => d.id !== id)
    setDocs(updatedDocs)
    onUpdate(customer.id, updatedDocs)
  }

  // Ordenação alfabética por tipo para exibição consistente
  const sortedDocs = [...docs].sort((a, b) => a.type.localeCompare(b.type))

  return (
    <Modal open onClose={onClose} title="Gestão de Arquivos e Documentação" size="lg">
      <div className="space-y-6">
        
        {/* HEADER DO MODAL: Identificação rápida do proprietário dos docs */}
        <div className="p-4 rounded-xl bg-[#2a2a2a]/50 border border-[#333333] flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#606060] font-black uppercase tracking-widest mb-1">Dono do Documento</p>
            <p className="font-bold text-white text-base">{customer.name}</p>
            <p className="text-xs text-[#A0A0A0] font-mono mt-0.5">{customer.cpf}</p>
          </div>
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-[#606060]">
            <FolderOpen className="w-6 h-6" />
          </div>
        </div>

        {/* ÁREA DE ENVIO: Seleção de tipo e Gatilho de arquivo */}
        <div className="flex gap-4 items-end bg-[#1a1a1a] p-5 rounded-2xl border border-white/5">
          <div className="flex-1">
            <Select
              label="Selecione o tipo de documento a enviar"
              options={DOCUMENT_TYPES}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as DocumentType)}
            />
          </div>
          {/* Input oculto acionado programaticamente */}
          <input 
            ref={fileInputRef} 
            type="file" 
            className="hidden" 
            onChange={handleFileChange} 
            accept=".pdf,.jpg,.jpeg,.png,.webp" 
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="secondary" 
            className="mb-0.5 h-[42px] px-6 shadow-xl"
          >
            <Upload className="w-4 h-4" />
            SUBIR ARQUIVO
          </Button>
        </div>

        {/* LISTAGEM: Arquivos armazenados no sistema */}
        <div className="space-y-3">
          <h6 className="text-[10px] text-[#606060] font-black uppercase tracking-[0.2em] ml-1">Arquivos no Prontuário</h6>
          
          {sortedDocs.length === 0 ? (
            /* Estado Vazio */
            <div className="text-center py-16 border-2 border-dashed border-[#2a2a2a] rounded-2xl bg-black/5">
              <FolderOpen className="w-12 h-12 text-[#333333] mx-auto mb-3" />
              <p className="text-sm text-[#555555] font-medium italic">Nenhum documento digitalizado até o momento.</p>
            </div>
          ) : (
            /* Lista de Cards de Documento */
            <div className="grid grid-cols-1 gap-2">
              {sortedDocs.map((doc) => (
                <div key={doc.id} className="group flex items-center gap-4 p-4 rounded-xl bg-[#202020] border border-[#333333] hover:border-[#555555] transition-all">
                  <div className={`p-2.5 rounded-lg bg-white/5 ${getDocumentIconColor(doc.type)}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{doc.name}</p>
                    <p className="text-[10px] text-[#606060] font-black uppercase tracking-tight mt-1">
                      {DOCUMENT_LABELS[doc.type]} • Enviado em {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Botão de Visualização */}
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-[#A0A0A0] hover:text-[#BAFF1A] hover:bg-[#BAFF1A]/10 transition-colors"
                        title="Ver arquivo original"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {/* Botão de Remoção */}
                    <button
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="p-2 rounded-xl text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Excluir documento permanentemente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CHECKLIST: Status da Documentação Obrigatória */}
        <div className="border-t border-[#333333] pt-6 mt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] text-[#606060] font-black uppercase tracking-[0.2em]">Checklist de Auditoria</p>
            {/* Indicador de progresso total */}
            <span className="text-[10px] font-bold text-[#A0A0A0] bg-white/5 px-2 py-0.5 rounded">
              {docs.length}/5 ITENS
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(['drivers_license', 'identification', 'proof_of_residence', 'contract', 'deposit'] as DocumentType[]).map((type) => {
              const isSent = docs.some((d) => d.type === type)
              return (
                <div key={type} className={`flex items-center gap-3 text-[11px] font-bold px-3 py-2.5 rounded-xl border transition-all ${
                  isSent 
                    ? 'text-green-400 bg-green-500/5 border-green-500/10' 
                    : 'text-[#555555] bg-white/[0.01] border-[#252525] grayscale'
                }`}>
                  {isSent
                    ? <CheckCircle className="w-4 h-4 flex-shrink-0 animate-in zoom-in-50" />
                    : <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  }
                  <span className="truncate">{DOCUMENT_LABELS[type].split(' (')[0]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Ações de Fechamento */}
        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onClose} className="px-10">CONCLUÍDO</Button>
        </div>
      </div>
    </Modal>
  )
}

/**
 * COMPONENTE PRINCIPAL: CustomersPage
 * 
 * Gerencia a listagem dinâmica e operações de negócio de Clientes.
 */
export default function CustomersPage() {
  /*
   * ESTADOS DE DADOS E NAVEGAÇÃO
   */
  // Master list de clientes vindos do "DB"
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  // Texto dinâmico de busca global
  const [search, setSearch] = useState('')
  // Visibilidade do modal de CRUD
  const [modalOpen, setModalOpen] = useState(false)
  // Identificador de edição: null = Novo / string = ID existente
  const [editingId, setEditingId] = useState<string | null>(null)
  // Estado local do formulário preenchido pelo usuário
  const [form, setForm] = useState(defaultFormState)
  // Seleção de um cliente para ver o perfil completo em modo leitura
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null)
  // Seleção de um cliente para confirmação de deleção
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)
  // Seleção de um cliente para o fluxo de documentos
  const [customerDocsModal, setCustomerDocsModal] = useState<Customer | null>(null)
  // Controla a visibilidade da seção de inativos
  const [showFormerCustomers, setShowFormerCustomers] = useState(false)
  // Valor da tab ativa (Todos, Ativos, Fila)
  const [statusFilter, setStatusFilter] = useState('todos')

  /*
   * DERIVAÇÃO DE DADOS (Memoized Logic)
   */
  // Separação lógica entre quem está no sistema e quem já saiu
  const activeCustomers = customers.filter((c) => c.active !== false)
  const formerCustomers = customers.filter((c) => c.active === false)

  // Configuração das abas de filtro superior
  const statusTabs = [
    { label: 'Todos os Clientes', value: 'todos' },
    { label: 'Contratos Ativos', value: 'ativo' },
    { label: 'Na Fila de Espera', value: 'fila' },
  ]

  /**
   * LÓGICA: filteredCustomers
   * 
   * Filtra em tempo real os clientes ativos com base no texto de busca e na tab selecionada.
   */
  const filteredCustomers = activeCustomers.filter((c) => {
    // Busca por Nome, CPF ou Telefone (case-insensitive)
    const passesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.cpf.includes(search) ||
      c.phone.includes(search)
    
    // Filtro por categoria operacional
    const passesFilter =
      statusFilter === 'fila' ? c.in_queue === true :      // Apenas quem aguarda moto
      statusFilter === 'ativo' ? !c.in_queue :             // Apenas quem já está rodando
      true                                               // Exibe ambos
      
    return passesSearch && passesFilter
  })

  /*
   * HANDLERS OPERACIONAIS
   */
  // Inicia cadastro de novo cliente limpando o formulário
  function openNewCustomer() { 
    setEditingId(null); 
    setForm(defaultFormState); 
    setModalOpen(true) 
  }
  
  // Inicia edição carregando dados atuais do cliente no form
  function openEditCustomer(c: Customer) { 
    setEditingId(c.id); 
    setForm(customerToForm(c)); 
    setModalOpen(true) 
  }

  /**
   * HANDLER: handleSubmit
   * 
   * Salva os dados capturados pelo formulário.
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault() // Impede postback do form HTML
    
    // Objeto de dados higienizado e formatado
    const data: Partial<Customer> = {
      name: form.name.toUpperCase(),           // Padroniza nomes em MAIÚSCULO
      cpf: form.cpf, 
      rg: form.rg, 
      state: form.state,
      phone: form.phone, 
      email: form.email.toLowerCase(),         // E-mail em minúsculo
      address: form.address, 
      zip_code: form.zipCode,
      emergency_contact: form.emergencyContact,
      drivers_license: form.cnh, 
      drivers_license_validity: form.cnhExpiry, 
      drivers_license_category: form.cnhCategory.toUpperCase(),
      payment_status: form.paymentStatus, 
      observations: form.notes,
      updated_at: new Date().toISOString(),
    }

    if (editingId) {
      // ATUALIZAÇÃO: Substitui o item no array preservando campos não editáveis
      setCustomers((prev) => prev.map((c) => (c.id === editingId ? { ...c, ...data } : c)))
    } else {
      // INSERÇÃO: Cria novo objeto com campos obrigatórios do sistema
      setCustomers((prev) => [{
        id: String(Date.now()), // ID fictício
        in_queue: false,         // Por padrão entra como ativo (ajustável no dashboard)
        documents: [],         // Inicia sem documentos
        created_at: new Date().toISOString(), 
        ...data,
      } as Customer, ...prev])
    }
    
    setModalOpen(false) // Fecha o modal após sucesso
  }

  // Remove o cliente do estado local
  function handleDeleteCustomer(c: Customer) {
    setCustomers((prev) => prev.filter((x) => x.id !== c.id))
    setDeletingCustomer(null)
  }

  // Atualiza a sub-coleção de documentos de um cliente específico
  function handleUpdateDocuments(customerId: string, docs: Document[]) {
    // Atualiza na lista principal de clientes
    setCustomers((prev) => prev.map((c) => c.id === customerId ? { ...c, documents: docs } : c))
    // Sincroniza o modal de detalhes se estiver aberto para o mesmo cliente
    setCustomerDocsModal((prev) => prev && prev.id === customerId ? { ...prev, documents: docs } : prev)
  }

  /**
   * DEFINIÇÃO: columns
   * 
   * Estrutura de dados que descreve como renderizar cada célula da tabela de clientes.
   */
  const columns = [
    {
      key: 'name', 
      header: 'Nome do Locatário',
      render: (row: Customer) => (
        <div className="py-1">
          <p className="font-bold text-white text-sm group-hover:text-[#BAFF1A] transition-colors">{row.name}</p>
          <p className="text-[10px] text-[#606060] font-mono font-bold mt-1 tracking-tighter">{row.cpf}</p>
        </div>
      ),
    },
    {
      key: 'phone', 
      header: 'Contato WhatsApp',
      render: (row: Customer) => {
        // Remove caracteres não numéricos para o link da API do WhatsApp
        const cleanedNumber = row.phone.replace(/\D/g, '')
        return (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#A0A0A0]">{row.phone}</span>
            {/* Atalho WebWhatsApp com DDI fixo para Brasil (55) */}
            <a 
              href={`https://web.whatsapp.com/send?phone=55${cleanedNumber}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              title="Iniciar conversa no WhatsApp" 
              className="w-7 h-7 bg-[#25D366]/10 rounded-lg flex items-center justify-center hover:bg-[#25D366]/20 transition-all border border-[#25D366]/20"
            >
              <svg viewBox="0 0 32 32" className="w-4 h-4"><path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.742 5.493 2.043 7.805L0 32l8.418-2.01A15.937 15.937 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0z" fill="#25D366"/><path d="M23.07 19.44c-.356-.178-2.107-1.04-2.434-1.16-.327-.12-.565-.178-.803.178-.238.356-.921 1.16-1.129 1.397-.208.238-.416.267-.772.089-.356-.178-1.503-.554-2.863-1.766-1.058-.944-1.772-2.109-1.98-2.465-.208-.356-.022-.548.156-.726.16-.16.356-.416.534-.624.178-.208.237-.356.356-.594.119-.238.06-.446-.03-.624-.089-.178-.803-1.935-1.1-2.649-.29-.695-.585-.6-.803-.611l-.683-.012c-.238 0-.624.089-.951.446-.327.356-1.248 1.219-1.248 2.974 0 1.754 1.278 3.449 1.456 3.687.178.238 2.514 3.836 6.092 5.381.852.367 1.517.587 2.035.752.855.272 1.634.234 2.249.142.686-.102 2.107-.861 2.404-1.693.297-.832.297-1.545.208-1.693-.089-.149-.327-.238-.683-.416z" fill="#fff"/></svg>
            </a>
          </div>
        )
      },
    },
    {
      key: 'drivers_license', 
      header: 'Registro CNH',
      render: (row: Customer) => (
        <div className="min-w-[120px]">
          <p className="font-mono text-sm text-white font-bold">{row.drivers_license}</p>
          {row.drivers_license_validity
            ? <p className="text-[10px] text-[#606060] font-bold mt-0.5 uppercase tracking-tighter">Val.: {new Date(row.drivers_license_validity + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
            : <p className="text-[10px] text-amber-500/60 font-black mt-0.5 uppercase tracking-tighter">Validade não informada</p>
          }
        </div>
      ),
    },
    {
      key: 'documents', 
      header: 'Docs.',
      render: (row: Customer) => {
        // Lógica para contar quantos docs obrigatórios foram enviados
        const required: DocumentType[] = ['drivers_license', 'identification', 'proof_of_residence', 'contract', 'deposit']
        const completed = required.filter((t) => row.documents?.some((d) => d.type === t)).length
        
        // Cores semânticas baseadas na completude
        const colorClass = completed === required.length ? 'text-green-400' : completed > 0 ? 'text-amber-400' : 'text-[#606060]'
        
        return (
          <div className="flex flex-col items-center">
             <span className={`text-[11px] font-black font-mono ${colorClass}`}>
              {completed === 5 ? 'COMPLETO' : `${completed}/5`}
            </span>
            <div className="w-12 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
               <div className={`h-full transition-all duration-500 ${completed === 5 ? 'bg-green-500' : 'bg-amber-500'}`} style={{width: `${(completed/5)*100}%`}} />
            </div>
          </div>
        )
      },
    },
    {
      key: 'payment_status', 
      header: 'Caução / Dep.',
      render: (row: Customer) =>
        row.payment_status ? (
          <span className="flex items-center gap-1.5 text-[10px] font-black text-green-400 uppercase tracking-tight bg-green-500/5 px-2 py-1 rounded-full border border-green-500/10">
            <CheckCircle className="w-3 h-3" /> CONFIRMADO
          </span>
        ) : <span className="text-[10px] font-bold text-[#606060] uppercase tracking-widest italic">— PENDENTE —</span>,
    },
    {
      key: 'in_queue', 
      header: 'Estado Atual',
      render: (row: Customer) => row.in_queue
        ? <Badge variant="warning" className="font-black italic">NA FILA</Badge>
        : <Badge variant="success" className="font-black">RODANDO</Badge>,
    },
    {
      key: 'acoes', 
      header: 'Ações de Gestão',
      render: (row: Customer) => (
        <div className="flex items-center gap-1.5">
          {/* Visualizar Perfil */}
          <button 
            onClick={() => setCustomerDetails(row)} 
            className="p-2 rounded-xl text-[#606060] hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10" 
            title="Ver ficha completa"
          >
            <Eye className="w-4.5 h-4.5" />
          </button>
          {/* Editar Dados */}
          <button 
            onClick={() => openEditCustomer(row)} 
            className="p-2 rounded-xl text-[#606060] hover:text-[#BAFF1A] hover:bg-[#BAFF1A]/10 transition-all border border-transparent hover:border-[#BAFF1A]/10" 
            title="Editar informações"
          >
            <Edit2 className="w-4.5 h-4.5" />
          </button>
          {/* Gerir Documentos */}
          <button 
            onClick={() => setCustomerDocsModal(row)} 
            className="p-2 rounded-xl text-[#606060] hover:text-blue-400 hover:bg-blue-400/10 transition-all border border-transparent hover:border-blue-400/10" 
            title="Arquivos e Documentos"
          >
            <FolderOpen className="w-4.5 h-4.5" />
          </button>
          {/* Excluir Registro */}
          <button 
            onClick={() => setDeletingCustomer(row)} 
            className="p-2 rounded-xl text-[#606060] hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/10" 
            title="Remover do sistema"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      ),
    },
  ]

  /**
   * RENDERIZAÇÃO DA PÁGINA: CustomersPage
   */
  return (
    <div className="flex flex-col min-h-full">
      {/* 
        * CABEÇALHO PRINCIPAL
        * Controla o título e a ação primária de adição de novo locatário.
        */}
      <Header
        title="Gestão de Clientes"
        subtitle={`${activeCustomers.length} locatários ativos cadastrados`}
        actions={
          <Button onClick={openNewCustomer} className="shadow-lg shadow-[#BAFF1A]/10">
            <Plus className="w-4 h-4" /> 
            NOVO CADASTRO
          </Button>
        }
      />

      {/* ÁREA DE CONTEÚDO */}
      <div className="p-6 space-y-6">
        
        {/* BARRA DE FERRAMENTAS: Filtros e Busca Global */}
        <div className="flex items-center gap-4 flex-wrap">
          
          {/* NAVEGAÇÃO POR ABAS (STATUS) */}
          <div className="flex gap-2 flex-wrap bg-[#1a1a1a] p-1 rounded-xl border border-[#333333]">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                  statusFilter === tab.value
                    ? 'bg-[#BAFF1A] text-[#121212] shadow-inner'
                    : 'text-[#606060] hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
                {/* Badge numérica dentro da aba */}
                {tab.value !== 'todos' && (
                  <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded-full ${
                    statusFilter === tab.value ? 'bg-black/10' : 'bg-white/5'
                  }`}>
                    {tab.value === 'fila'
                      ? activeCustomers.filter((c) => c.in_queue).length
                      : activeCustomers.filter((c) => !c.in_queue).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* INPUT DE PESQUISA INTELIGENTE */}
          <div className="ml-auto relative min-w-[350px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444444]" />
            <input
              type="text" 
              placeholder="Pesquisar por Nome, CPF ou WhatsApp..."
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#202020] border border-[#333333] text-sm text-white placeholder-[#444444] focus:outline-none focus:border-[#BAFF1A]/40 focus:ring-1 focus:ring-[#BAFF1A]/10 transition-all"
            />
          </div>
        </div>

        {/* LISTAGEM DE RESULTADOS (TABELA) */}
        <Card padding="none" className="overflow-hidden border-[#333333] shadow-2xl">
          <Table 
            columns={columns} 
            data={filteredCustomers} 
            keyExtractor={(row) => row.id} 
            emptyMessage="Nenhum registro encontrado para os critérios de busca." 
          />
        </Card>

        {/* SEÇÃO: HISTÓRICO DE EX-CLIENTES (Inativos/Devedores) */}
        {formerCustomers.length > 0 && (
          <div className="pt-4">
            <button
              onClick={() => setShowFormerCustomers((v) => !v)}
              className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#606060] hover:text-[#BAFF1A] transition-all px-2 py-3 border border-dashed border-[#252525] rounded-xl hover:border-[#BAFF1A]/30 w-full justify-center bg-[#1a1a1a]/40"
            >
              <History className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" />
              {showFormerCustomers ? 'OCULTAR HISTÓRICO DE INATIVOS' : `EXIBIR ARQUIVO DE EX-CLIENTES (${formerCustomers.length})`}
              {showFormerCustomers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Renderização Condicional do Bloco de Inativos */}
            {showFormerCustomers && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-in slide-in-from-top-4 duration-500">
                {formerCustomers.map((c) => (
                  <FormerCustomerCard key={c.id} customer={c} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 
        * MODAL: FORMULÁRIO DE CADASTRO / EDIÇÃO
        * Lida com a coleta de dados cadastrais profundos.
        */}
      <Modal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingId ? 'Atualizar Dados do Locatário' : 'Novo Cadastro de Locatário'} 
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6 p-1">
          {/* Seção 1: Identificação Básica */}
          <div className="grid grid-cols-2 gap-5">
            <Input 
              label="Nome Completo (Conforme CNH/RG)" 
              placeholder="EX: JOÃO DA SILVA" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              required 
            />
            <Input 
              label="Número do CPF" 
              placeholder="000.000.000-00" 
              value={form.cpf} 
              onChange={(e) => setForm({ ...form, cpf: e.target.value })} 
              required 
            />
          </div>

          {/* Seção 2: Documentos e Contato */}
          <div className="grid grid-cols-3 gap-5">
            <Input 
              label="Número do RG" 
              placeholder="Digite apenas números" 
              value={form.rg} 
              onChange={(e) => setForm({ ...form, rg: e.target.value })} 
            />
            <Select 
              label="UF Emissor" 
              options={STATE_OPTIONS} 
              value={form.state} 
              onChange={(e) => setForm({ ...form, state: e.target.value })} 
            />
            <Input 
              label="WhatsApp / Celular" 
              placeholder="(21) 90000-0000" 
              value={form.phone} 
              onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              required 
            />
          </div>

          {/* Seção 3: Endereço Residencial */}
          <div className="grid grid-cols-4 gap-5">
            <div className="col-span-3">
              <Input 
                label="Endereço Completo (Rua, Número, Comp.)" 
                placeholder="Rua Exemplo, 123 - Bloco 4 Apt 101" 
                value={form.address} 
                onChange={(e) => setForm({ ...form, address: e.target.value })} 
              />
            </div>
            <Input 
              label="CEP" 
              placeholder="00000-000" 
              value={form.zipCode} 
              onChange={(e) => setForm({ ...form, zipCode: e.target.value })} 
            />
          </div>

          {/* Seção 4: Contatos Críticos */}
          <Textarea 
            label="Contatos de Emergência (Nome, Parentesco e Telefone)" 
            placeholder="Ex: Mãe: (21) 98888-7777 | Esposa: (21) 99999-0000" 
            rows={3} 
            value={form.emergencyContact} 
            onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} 
          />
          
          {/* BLOCO: DADOS TÉCNICOS DA CNH (Habilitação) */}
          <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-white/5 space-y-4">
            <h5 className="text-[10px] font-black text-[#BAFF1A] uppercase tracking-[0.2em] mb-4">Informações de Trânsito (CNH)</h5>
            <div className="grid grid-cols-3 gap-5">
              <Input 
                label="Número de Registro CNH" 
                placeholder="00000000000" 
                value={form.cnh} 
                onChange={(e) => setForm({ ...form, cnh: e.target.value })} 
                required 
              />
              <Input 
                label="Validade da Carteira" 
                type="date" 
                value={form.cnhExpiry} 
                onChange={(e) => setForm({ ...form, cnhExpiry: e.target.value })} 
              />
              <Input 
                label="Categoria (A, AB, etc)" 
                placeholder="EX: A" 
                value={form.cnhCategory} 
                onChange={(e) => setForm({ ...form, cnhCategory: e.target.value })} 
              />
            </div>
          </div>
          
          {/* Seção 5: Financeiro e Extra */}
          <div className="grid grid-cols-2 gap-5">
            <Input 
              label="E-mail de Contato" 
              type="email" 
              placeholder="cliente@exemplo.com" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
            />
            <Input 
              label="Status do Caução / Garantia" 
              placeholder="Ex: R$ 500,00 Pago em 10/10" 
              value={form.paymentStatus} 
              onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })} 
            />
          </div>

          {/* Seção 6: Observações Internas */}
          <Textarea 
            label="Prontuário Interno / Notas Administrativas" 
            placeholder="Histórico de comportamento, restrições ou detalhes observados na entrevista..." 
            rows={4} 
            value={form.notes} 
            onChange={(e) => setForm({ ...form, notes: e.target.value })} 
          />
          
          {/* BARRA DE AÇÕES DO FORMULÁRIO */}
          <div className="flex gap-4 justify-end pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="px-8">
              DESCARTAR
            </Button>
            <Button type="submit" className="px-12 shadow-lg shadow-[#BAFF1A]/20">
              {editingId ? (
                /* Botão para edição */
                <>
                  <Edit2 className="w-4 h-4" /> 
                  EFETIVAR ALTERAÇÕES
                </>
              ) : (
                /* Botão para novo cadastro */
                <>
                  <Plus className="w-4 h-4" /> 
                  CONCLUIR CADASTRO
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 
        * MODAL: PERFIL COMPLETO DO CLIENTE (Módulo de Leitura/Detalhes)
        */}
      {customerDetails && (
        <Modal 
          open={!!customerDetails} 
          onClose={() => setCustomerDetails(null)} 
          title="Ficha Cadastral do Locatário" 
          size="lg"
        >
          <div className="space-y-8 p-1">
            {/* CABEÇALHO DO PERFIL */}
            <div className="flex items-start justify-between gap-6 pb-6 border-b border-white/5">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-2xl flex items-center justify-center border border-[#333333] shadow-2xl">
                   <span className="text-2xl font-black text-[#BAFF1A]">{customerDetails.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase italic">{customerDetails.name}</h3>
                  <p className="text-sm text-[#A0A0A0] font-mono font-bold mt-1.5 tracking-widest">{customerDetails.cpf}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                {/* Badge de status operacional */}
                {customerDetails.in_queue ? (
                  <Badge variant="warning" className="px-4 py-1 font-black italic">AGUARDANDO MOTO</Badge>
                ) : (
                  <Badge variant="success" className="px-4 py-1 font-black">LOCAÇÃO ATIVA</Badge>
                )}
                {/* Indicador visual de caução */}
                {customerDetails.payment_status && (
                  <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase italic">
                    <CheckCircle className="w-3.5 h-3.5" /> CAUÇÃO: {customerDetails.payment_status}
                  </span>
                )}
              </div>
            </div>
            
            {/* GRID DE INFORMAÇÕES PESSOAIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="space-y-5">
                <h5 className="text-[10px] font-black text-[#BAFF1A] uppercase tracking-[0.2em] mb-4">Identificação Civil</h5>
                <div className="grid grid-cols-2 gap-y-5">
                   <div><p className="text-[10px] text-[#606060] font-bold uppercase mb-1">Registro RG</p><p className="text-sm text-white font-mono font-bold">{customerDetails.rg || '—'}</p></div>
                   <div><p className="text-[10px] text-[#606060] font-bold uppercase mb-1">Órgão/UF</p><p className="text-sm text-white font-bold">{customerDetails.state || '—'}</p></div>
                   <div className="col-span-2"><p className="text-[10px] text-[#606060] font-bold uppercase mb-1">Endereço de Residência</p><p className="text-sm text-[#A0A0A0] leading-relaxed italic">{customerDetails.address || '—'}</p></div>
                   <div><p className="text-[10px] text-[#606060] font-bold uppercase mb-1">Código CEP</p><p className="text-sm text-white font-mono font-bold">{customerDetails.zip_code || '—'}</p></div>
                </div>
              </section>

              <section className="space-y-5">
                <h5 className="text-[10px] font-black text-[#BAFF1A] uppercase tracking-[0.2em] mb-4">Meios de Contato</h5>
                <div className="grid grid-cols-1 gap-y-5">
                   <div><p className="text-[10px] text-[#606060] font-bold uppercase mb-1">WhatsApp / Primário</p><p className="text-sm text-white font-black">{customerDetails.phone}</p></div>
                   <div><p className="text-[10px] text-[#606060] font-bold uppercase mb-1">E-mail Cadastrado</p><p className="text-sm text-white font-medium">{customerDetails.email || '—'}</p></div>
                </div>
              </section>
            </div>
            
            {/* SEÇÃO: CONTATO EMERGENCIAL (Destaque visual para situações de crise) */}
            {customerDetails.emergency_contact && (
              <div className="bg-[#2a2a2a]/30 p-5 rounded-2xl border border-dashed border-[#444444]">
                <h5 className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> CONTATOS DE EMERGÊNCIA
                </h5>
                <p className="text-sm text-[#E0E0E0] font-medium leading-relaxed italic">"{customerDetails.emergency_contact}"</p>
              </div>
            )}
            
            {/* BLOCO: PRONTUÁRIO DE TRÂNSITO (CNH) */}
            <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
              <h5 className="text-[10px] font-black text-[#BAFF1A] uppercase tracking-[0.2em] mb-6">Prontuário de Motorista (CNH)</h5>
              <div className="grid grid-cols-3 gap-6">
                <div><p className="text-[10px] text-[#606060] font-bold uppercase mb-1">Nº Registro</p><p className="text-sm text-white font-mono font-black tracking-widest">{customerDetails.drivers_license}</p></div>
                <div><p className="text-[10px] text-[#606060] font-bold uppercase mb-1">Habilitação</p><p className="text-sm text-white font-black">CAT: {customerDetails.drivers_license_category || '—'}</p></div>
                <div>
                  <p className="text-[10px] text-[#606060] font-bold uppercase mb-1">Validade Legal</p>
                  {customerDetails.drivers_license_validity
                    ? <p className="text-sm text-white font-black">{new Date(customerDetails.drivers_license_validity + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                    : <span className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase"><AlertCircle className="w-3.5 h-3.5" /> PENDENTE</span>
                  }
                </div>
              </div>
            </div>

            {/* SEÇÃO: OBSERVAÇÕES E NOTAS INTERNAS */}
            {customerDetails.observations && (
              <div className="space-y-3">
                <h5 className="text-[10px] font-black text-[#606060] uppercase tracking-[0.2em] ml-1">Observações do Gestor</h5>
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                   <p className="text-xs text-[#808080] leading-relaxed italic">{customerDetails.observations}</p>
                </div>
              </div>
            )}

            {/* BARRA DE AÇÕES DO PERFIL */}
            <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
              <Button variant="ghost" onClick={() => setCustomerDetails(null)} className="px-8">FECHAR</Button>
              <Button 
                variant="secondary" 
                onClick={() => { setCustomerDetails(null); setCustomerDocsModal(customerDetails) }}
                className="px-8"
              >
                <FolderOpen className="w-4 h-4" /> REPOSITÓRIO DE DOCS
              </Button>
              <Button 
                onClick={() => { setCustomerDetails(null); openEditCustomer(customerDetails) }}
                className="px-10"
              >
                <Edit2 className="w-4 h-4" /> EDITAR PERFIL
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 
        * MODAL: DOCUMENTOS (Lógica isolada)
        */}
      {customerDocsModal && (
        <DocumentsModal
          customer={customers.find((c) => c.id === customerDocsModal.id) ?? customerDocsModal}
          onClose={() => setCustomerDocsModal(null)}
          onUpdate={handleUpdateDocuments}
        />
      )}

      {/* 
        * MODAL: CONFIRMAÇÃO DE DELEÇÃO
        */}
      {deletingCustomer && (
        <Modal 
          open={!!deletingCustomer} 
          onClose={() => setDeletingCustomer(null)} 
          title="Confirmar Exclusão de Cadastro" 
          size="sm"
        >
          <div className="space-y-6">
            <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-2xl text-center">
              <p className="text-[#A0A0A0] text-sm leading-relaxed">
                Você está prestes a remover permanentemente o locatário <br />
                <strong className="text-white text-base font-black uppercase tracking-tight">{deletingCustomer.name}</strong>
                <br /><br />
                <span className="text-red-400 font-bold uppercase text-[10px]">Aviso: Esta ação destruirá todo o histórico vinculado e não pode ser desfeita.</span>
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setDeletingCustomer(null)} className="flex-1">CANCELAR</Button>
              <Button variant="danger" onClick={() => handleDeleteCustomer(deletingCustomer)} className="flex-1 shadow-lg shadow-red-500/20">
                <Trash2 className="w-4 h-4" /> REMOVER DEFINITIVO
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

/**
 * NOTAS DE MANUTENÇÃO:
 * - O upload de arquivos atualmente é fictício (URL.createObjectURL). Em produção, integrar com Supabase Storage.
 * - Adicionar suporte para máscaras de CPF e Telefone nos Inputs em versões futuras.
 * - Implementar lógica de paginação na tabela caso a lista de clientes ultrapasse 100 registros.
 */
