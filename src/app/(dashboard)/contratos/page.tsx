/**
 * ARQUIVO: src/app/(dashboard)/contratos/page.tsx
 * 
 * DESCRIÇÃO GERAL:
 * Esta página representa o módulo de "Gestão Contratual" do ecossistema GoMoto.
 * Sua principal função é formalizar juridicamente e financeiramente a entrega de um veículo a um locatário.
 * 
 * REGRAS DE NEGÓCIO POR TIPO DE CONTRATO:
 * - TIPO 1 (Locação Pura): Focado em flexibilidade. Ciclos de 90 dias com renovação automática.
 *   Manutenção preventiva dividida (GoMoto fornece peças, cliente paga mão de obra ou vice-versa).
 * - TIPO 2 (Fidelidade Quinzenal): Plano de aquisição (Rent-to-own). Pagamentos a cada 15 dias.
 *   Duração de 24 meses. Ao final, a moto é transferida para o cliente.
 * - TIPO 3 (Fidelidade Semanal): Similar ao Tipo 2, mas com fluxo de caixa semanal.
 *   Responsabilidade de manutenção 100% do cliente para acelerar a quitação.
 * 
 * FLUXO OPERACIONAL:
 * 1. Geração: O contrato nasce a partir da alocação de uma moto a um cliente da fila.
 * 2. Assinatura: O sistema marca como "Pendente" até que o PDF assinado seja carregado.
 * 3. Vigência: Monitoramento dinâmico de semanas restantes e alertas de proximidade do fim.
 * 4. Encerramento: Finalização por conclusão, distrato (cancelamento) ou inadimplência (quebra).
 */

'use client' // Define como Client Component para gerenciar estados de modais e filtros

// Importação de hooks do React para ciclo de vida e estado
import { useEffect, useRef, useState } from 'react'

// Importação da biblioteca Lucide para iconografia de interface
import {
  Plus,             // Ícone para criar novo contrato
  Eye,              // Ícone para visualizar detalhes
  FileText,         // Ícone representativo de documento/PDF
  Upload,           // Ícone para envio de arquivos
  ExternalLink,     // Ícone para abrir links externos (PDF)
  ChevronDown,      // Seta para baixo (expansão)
  ChevronUp,        // Seta para cima (recolhimento)
  Clock,            // Ícone de tempo/vencimento
  Bike,             // Ícone de veículo
  User,             // Ícone de cliente
  CheckCircle,      // Ícone de sucesso/concluído
  History,          // Ícone de arquivo morto/histórico
  XCircle,          // Ícone de erro/cancelamento
  AlertCircle,      // Ícone de alerta/aviso
  X,                // Ícone de fechar
  Search,           // Ícone de busca
} from 'lucide-react'

// Importação de componentes de Layout e UI atômicos
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

// Importação de constantes de integração com LocalStorage (persistência temporária)
import { LS_ALLOCATED_MOTORCYCLES, LS_NEW_CONTRACTS } from '@/data/motos'

// Importação de tipos globais para segurança de tipos (TypeScript)
import type { 
  ContractType,     // Enum numérico (1, 2, 3) para tipos de plano
  ContractStatus  // Enum string (ativo, encerrado, etc) para status
} from '@/types'

/**
 * INTERFACE: Contract
 * 
 * Representa a "Fotografia" (Snapshot) do acordo no momento da assinatura.
 * IMPORTANTE: Dados como endereço e telefone são salvos aqui para que, mesmo que o cliente mude de endereço no futuro, 
 * o registro do contrato assinado permaneça fiel ao documento físico da época.
 */
interface Contract {
  id: string                        // Identificador único do contrato
  type: ContractType                // Categoria do plano (Locação ou Fidelidade)
  customer_id: string               // ID de referência do cliente no banco
  customerName: string              // Nome completo do locatário
  customerCpf: string               // CPF para validade jurídica
  customerPhone: string             // Contato principal
  customerRg?: string               // Identidade
  customerState?: string            // UF de origem
  customerAddress?: string          // Endereço na data da assinatura
  customerZipCode?: string          // CEP
  customerCnh?: string              // Número da CNH do motorista
  customerCnhCategory?: string      // Categoria (deve conter 'A')
  customerEmergencyContact?: string // Contato de segurança
  motorcycle_id: string             // ID de referência do veículo
  motorcycle_plate: string          // Placa (identificação visual)
  motorcycleModel: string           // Modelo da moto (Ex: Pop 110)
  motorcycleBrand: string           // Fabricante (Ex: Honda)
  motorcycleYear: string            // Ano de fabricação
  motorcycleColor: string           // Cor predominante
  motorcycleRenavam?: string        // Código RENAVAM
  motorcycleChassis?: string        // Número do Chassi
  start_date: string                // Data de início da vigência (YYYY-MM-DD)
  end_date: string                  // Data prevista para término (YYYY-MM-DD)
  closing_date?: string             // Data de encerramento
  weekly_rate?: number              // Valor pactuado por ciclo (Semana)
  biweekly_rate?: number            // Valor pactuado por ciclo (Quinzena)
  monthly_rate?: number             // Valor pactuado por ciclo (Mês)
  deposit?: number                  // Valor de caução
  status: ContractStatus            // Estado atual do acordo
  signed?: boolean                  // Flag que indica assinatura
  pdf_url?: string                  // Link para o arquivo PDF no storage
  closureReason?: string            // Justificativa caso o contrato seja encerrado precocemente
  observations?: string             // Observações administrativas gerais
  created_at: string                // Timestamp de registro
  updated_at: string                // Timestamp de última modificação
}

/**
 * CONSTANTE: TYPE_INFO
 * 
 * Dicionário de configuração das regras de cada modalidade de contrato.
 * Utilizado para automatizar textos explicativos e cálculos na interface.
 */
const TYPE_INFO: Record<ContractType, {
  label: string                     // Nome comercial do plano
  frequency: string                 // Periodicidade de cobrança
  duration: string                  // Tempo total de validade
  acquisition: boolean              // Indica se o cliente ganha a moto no final
  maintenance: string               // Regra de divisão de custos de oficina
}> = {
  1: { 
    label: 'Locação Convencional', 
    frequency: 'Semanal',    
    duration: '90 dias (renovável)', 
    acquisition: false, 
    maintenance: 'Peças por conta da GoMoto / Mão de obra pelo cliente' 
  },
  2: { 
    label: 'Fidelidade Quinzenal', 
    frequency: 'Quinzenal',  
    duration: '24 meses (Quitação)', 
    acquisition: true,  
    maintenance: 'Dividida 50/50 entre locador e locatário' 
  },
  3: { 
    label: 'Fidelidade Semanal',   
    frequency: 'Semanal',    
    duration: '24 meses (Quitação)', 
    acquisition: true,  
    maintenance: '100% Responsabilidade do Cliente' 
  },
}

/**
 * MAPAS DE CORES E ESTILOS VISUAIS
 * 
 * Padronizam a identidade visual baseada no estado dos dados.
 */
const TYPE_COLORS: Record<ContractType, string> = {
  1: 'bg-blue-500/15 border-blue-500/30 text-blue-400',      // Azul para Locação
  2: 'bg-purple-500/15 border-purple-500/30 text-purple-400', // Roxo para Fidelidade Quinzenal
  3: 'bg-[#BAFF1A]/10 border-[#BAFF1A]/20 text-[#BAFF1A]',   // Verde Limão para Fidelidade Semanal
}

const STATUS_COLORS: Record<ContractStatus, string> = {
  active:     'bg-green-500/15 border-green-500/30 text-green-400',  // Verde para em vigor
  closed: 'bg-white/5 border-white/10 text-[#888888]',           // Cinza para concluído
  cancelled: 'bg-amber-500/15 border-amber-500/30 text-amber-400',  // Laranja para distrato
  broken:  'bg-red-500/15 border-red-500/30 text-red-400',        // Vermelho para inadimplência
}

const STATUS_LABELS: Record<ContractStatus, string> = {
  active: 'Em Vigência', 
  closed: 'Concluído', 
  cancelled: 'Cancelado', 
  broken: 'Quebra de Contrato',
}

/**
 * LISTA: mockContracts
 * 
 * Lista inicial de contratos para popular a UI.
 */
const mockContracts: Contract[] = [
  {
    id: '1', type: 1,
    customer_id: '1', customerName: 'FABRICIO DO VALE NEPOMUCENO', customerCpf: '129.616.867-09',
    customerPhone: '21 98776-4348', customerRg: '207189267', customerState: 'RJ',
    customerAddress: 'R ADELINO 12 - ROLLAS 2 - SANTA CRUZ - RIO DE JANEIRO - RJ',
    customerZipCode: '23590-170', customerCnh: '4372430975', customerCnhCategory: 'A',
    customerEmergencyContact: 'MÃE: (21) 99184-7214 | IRMÃO: (21) 96577-2573',
    motorcycle_id: '4', motorcycle_plate: 'RJA5J85', motorcycleModel: 'HONDA/CG 160 START',
    motorcycleBrand: 'HONDA', motorcycleYear: '24/25', motorcycleColor: 'PRETO',
    start_date: '2026-02-05', end_date: '2026-05-06',
    weekly_rate: 350, status: 'active', signed: true,
    observations: '', created_at: '2026-02-05T10:00:00Z', updated_at: '2026-02-05T10:00:00Z',
  },
  {
    id: '2', type: 2,
    customer_id: '2', customerName: 'DOUGLAS DOS SANTOS SIMÔES', customerCpf: '173.964.027-60',
    customerPhone: '21 97389-7602', customerRg: '300246329', customerState: 'RJ',
    customerAddress: 'ESTRADA DE SEPETIBA N 595 - BLOCO 09 CASA 02 - SANTA CRUZ - RIO DE JANEIRO - RJ',
    customerZipCode: '23520-660', customerCnh: '7601971200', customerCnhCategory: 'A',
    customerEmergencyContact: 'ESPOSA: (21) 96683-1232 | MÃE: (21) 97876-1439',
    motorcycle_id: '2', motorcycle_plate: 'KYN9J41', motorcycleModel: 'YAMAHA/YS150 FAZER SED',
    motorcycleBrand: 'YAMAHA', motorcycleYear: '23/24', motorcycleColor: 'CINZA',
    start_date: '2025-10-23', end_date: '2027-10-23',
    biweekly_rate: 630, status: 'active', signed: true,
    observations: 'Moto será transferida ao final do contrato.',
    created_at: '2025-10-23T10:00:00Z', updated_at: '2025-10-23T10:00:00Z',
  },
]

/* 
 * FUNÇÕES UTILITÁRIAS DE CÁLCULO E FORMATAÇÃO
 */

/**
 * Calcula quantas semanas faltam para o término do contrato.
 * Utilizado para gerar alertas visuais de proximidade de encerramento.
 */
function getWeeksRemaining(endDate: string): number {
  const diff = new Date(endDate + 'T12:00:00').getTime() - new Date().getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24 * 7)))
}

/**
 * Converte o valor do período (semanal ou quinzenal) em uma média mensal estimada.
 * Baseia-se em 52 semanas/ano ou 26 quinzenas/ano dividido por 12 meses.
 */
function getMonthlyValue(type: ContractType, value: number): number {
  if (type === 2) return (value * 26) / 12  // Projeção mensal para plano quinzenal
  return (value * 52) / 12                  // Projeção mensal para plano semanal
}

/**
 * Formata números para o padrão de moeda Real Brasileiro (R$).
 */
function formatLocalCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/**
 * Formata strings de data YYYY-MM-DD para o padrão brasileiro DD/MM/YYYY.
 */
function formatLocalDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR')
}

/**
 * COMPONENTE: TypeBadge
 * 
 * Exibe visualmente o tipo do contrato com cores semânticas.
 */
function TypeBadge({ type }: { type: ContractType }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${TYPE_COLORS[type]}`}>
      PLANO T{type} • {TYPE_INFO[type].label}
    </span>
  )
}

/**
 * COMPONENTE: StatusBadge
 * 
 * Exibe visualmente o estado atual do contrato.
 */
function StatusBadge({ status }: { status: ContractStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-tight ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

/**
 * MODAL: PDFModal
 * 
 * Gerencia o ciclo de vida do documento digitalizado do contrato.
 */
function PDFModal({ contract, onClose, onUpdate }: {
  contract: Contract
  onClose: () => void
  onUpdate: (id: string, url: string) => void
}) {
  // Referência ao input de arquivo para acionamento via botão estilizado
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Processa a seleção do arquivo PDF e gera uma URL de visualização.
   */
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Em produção, aqui ocorreria o upload para Supabase Storage
    onUpdate(contract.id, URL.createObjectURL(file))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <Modal open onClose={onClose} title="Arquivo Digital do Contrato" size="md">
      <div className="space-y-5">
        {/* Identificação do Contrato no Modal */}
        <div className="p-4 rounded-xl bg-[#2a2a2a]/50 border border-[#333333]">
          <p className="text-[10px] text-[#606060] font-black uppercase mb-1">Locatário Responsável</p>
          <p className="font-bold text-white text-base">{contract.customerName}</p>
          <p className="text-xs text-[#A0A0A0] mt-1 font-medium">{contract.motorcycle_plate} — {contract.motorcycleModel}</p>
        </div>

        {/* Verificação de existência do arquivo */}
        {contract.pdf_url ? (
          /* Estado: Arquivo Carregado */
          <div className="flex items-center gap-4 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
               <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white uppercase tracking-tight">Documento Armazenado</p>
              <p className="text-[11px] text-green-400/70 font-medium">O contrato assinado está disponível para auditoria.</p>
            </div>
            <a
              href={contract.pdf_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-[#BAFF1A] text-black hover:scale-105 transition-all shadow-lg shadow-[#BAFF1A]/20"
            >
              <ExternalLink className="w-4 h-4" /> VER PDF
            </a>
          </div>
        ) : (
          /* Estado: Aguardando Documento */
          <div className="text-center py-12 border-2 border-dashed border-[#333333] rounded-2xl bg-black/10">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-[#444444] mx-auto mb-4">
               <Upload className="w-8 h-8" />
            </div>
            <p className="text-sm text-[#A0A0A0] font-medium italic">Nenhum scan ou PDF foi vinculado a este contrato.</p>
          </div>
        )}

        {/* Input Oculto */}
        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
        
        {/* Ações de Rodapé */}
        <div className="flex justify-between items-center pt-2">
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="px-6 font-bold">
            <Upload className="w-4 h-4" /> {contract.pdf_url ? 'SUBSTITUIR ARQUIVO' : 'CARREGAR CONTRATO ASSINADO'}
          </Button>
          <Button variant="ghost" onClick={onClose} className="px-8 uppercase font-black text-[10px] tracking-widest text-[#606060]">FECHAR</Button>
        </div>
      </div>
    </Modal>
  )
}

/**
 * MODAL: DetailsModal
 * 
 * Visão holística de todos os termos e dados técnicos de um contrato específico.
 */
function DetailsModal({ contract, onClose }: { contract: Contract; onClose: () => void }) {
  // Cálculos financeiros e temporais para exibição
  const periodValue = contract.type === 2 ? contract.biweekly_rate || 0 : contract.weekly_rate || 0;
  const monthlyValue = getMonthlyValue(contract.type, periodValue)
  const weeksLeft = getWeeksRemaining(contract.end_date)
  const info = TYPE_INFO[contract.type]

  /**
   * Helper visual para renderizar pares de chave/valor com consistência.
   */
  function DetailRow({ label, value, mono = true }: { label: string; value?: string; mono?: boolean }) {
    return (
      <div className="space-y-1">
        <p className="text-[10px] text-[#606060] font-black uppercase tracking-widest">{label}</p>
        <p className={`text-sm text-white font-bold ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
      </div>
    )
  }

  return (
    <Modal open onClose={onClose} title="Dossiê Completo do Contrato" size="lg">
      <div className="space-y-8 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">

        {/* Cabeçalho do Detalhamento: Status e Projeção Financeira */}
        <div className="flex items-start justify-between gap-6 pb-6 border-b border-[#333333]">
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <TypeBadge type={contract.type} />
              <StatusBadge status={contract.status} />
            </div>
            <p className="text-sm text-[#A0A0A0] font-medium leading-relaxed italic">
              Ciclo de Cobrança {info.frequency} • Vigência de {info.duration}
              {info.acquisition && <span className="block text-[#BAFF1A] not-italic font-bold mt-1 uppercase text-[10px]">✓ Veículo com Promessa de Transferência</span>}
            </p>
          </div>
          <div className="text-right flex-shrink-0 bg-[#BAFF1A]/5 p-4 rounded-2xl border border-[#BAFF1A]/10">
            <p className="text-[10px] text-[#BAFF1A] font-black uppercase tracking-widest mb-1">Média de Faturamento Mensal</p>
            <p className="text-2xl font-black text-white tracking-tight">{formatLocalCurrency(monthlyValue)}</p>
          </div>
        </div>

        {/* SEÇÃO: CRONOGRAMA E VALORES */}
        <section>
          <h5 className="text-[10px] text-[#606060] font-black uppercase tracking-[0.2em] mb-5 ml-1">Vigência & Compromisso Financeiro</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-[#1a1a1a] p-5 rounded-2xl border border-white/5">
            <DetailRow label="Data de Ativação" value={formatLocalDate(contract.start_date)} />
            <DetailRow label="Data de Término" value={formatLocalDate(contract.end_date)} />
            <DetailRow label={`Valor por ${contract.type === 2 ? 'Quinzena' : 'Semana'}`} value={formatLocalCurrency(periodValue)} />
            <DetailRow label="Tempo Restante" value={contract.status === 'active' ? `${weeksLeft} Semanas` : 'CONTRATO FINALIZADO'} />
          </div>
        </section>

        {/* SEÇÃO: REGRAS E CLAUSULAS (Informativo para o gestor) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#202020] to-[#151515] border border-[#2a2a2a] shadow-inner">
          <h5 className="text-[10px] text-[#BAFF1A] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Resumo das Condições Pactuadas
          </h5>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-[11px] text-[#A0A0A0] font-medium">
            <li className="flex items-start gap-2"><span className="text-[#BAFF1A]">»</span> Vencimento recorrente toda quarta-feira</li>
            <li className="flex items-start gap-2"><span className="text-[#BAFF1A]">»</span> Multa por atraso fixa de 10% do valor da parcela</li>
            <li className="flex items-start gap-2"><span className="text-[#BAFF1A]">»</span> Manutenção: {info.maintenance}</li>
            {info.acquisition && <li className="flex items-start gap-2"><span className="text-[#BAFF1A]">»</span> Transferência do bem condicionada à quitação integral</li>}
          </ul>
        </div>

        {/* SEÇÃO: DADOS DO LOCATÁRIO (SNAPSHOTTED) */}
        <section>
          <h5 className="text-[10px] text-[#606060] font-black uppercase tracking-[0.2em] mb-5 ml-1">Identificação do Locatário na Assinatura</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white/[0.01] p-6 rounded-2xl border border-white/5">
            <div className="md:col-span-2">
              <p className="text-[10px] text-[#606060] font-black uppercase mb-1">Nome Completo</p>
              <p className="text-base text-white font-black uppercase italic tracking-tight">{contract.customerName}</p>
            </div>
            <DetailRow label="Documento CPF" value={contract.customerCpf} />
            <DetailRow label="WhatsApp de Contato" value={contract.customerPhone} />
            <div className="md:col-span-2">
              <p className="text-[10px] text-[#606060] font-black uppercase mb-1">Endereço Residencial Declarado</p>
              <p className="text-sm text-[#A0A0A0] font-medium leading-relaxed italic">{contract.customerAddress || '—'}</p>
            </div>
            <DetailRow label="Nº de Registro CNH" value={contract.customerCnh} />
            <DetailRow label="Categoria de Habilitação" value={contract.customerCnhCategory} />
          </div>
        </section>

        {/* SEÇÃO: DADOS DO VEÍCULO (SNAPSHOTTED) */}
        <section>
          <h5 className="text-[10px] text-[#606060] font-black uppercase tracking-[0.2em] mb-5 ml-1">Características do Objeto Locado</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-[#1a1a1a] p-5 rounded-2xl border border-white/5">
            <DetailRow label="Placa de Identificação" value={contract.motorcycle_plate} />
            <DetailRow label="Modelo Comercial" value={contract.motorcycleModel} />
            <DetailRow label="Marca/Fabricante" value={contract.motorcycleBrand} />
            <DetailRow label="Ano de Fabricação" value={contract.motorcycleYear} />
          </div>
        </section>

        {/* SEÇÃO: HISTÓRICO DE ENCERRAMENTO E NOTAS */}
        {(contract.observations || contract.closureReason) && (
          <div className="space-y-6">
            {contract.observations && (
              <section>
                <h5 className="text-[10px] text-[#606060] font-black uppercase tracking-[0.2em] mb-3 ml-1">Observações Administrativas</h5>
                <div className="p-4 rounded-xl bg-[#2a2a2a]/30 border border-[#333333]">
                   <p className="text-sm text-[#A0A0A0] leading-relaxed italic">{contract.observations}</p>
                </div>
              </section>
            )}

            {contract.closureReason && (
              <section>
                <h5 className="text-[10px] text-red-400 font-black uppercase tracking-[0.2em] mb-3 ml-1">Laudo de Encerramento do Contrato</h5>
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                   <p className="text-sm text-red-200/70 leading-relaxed font-medium italic">
                     <span className="not-italic font-black text-red-400 mr-2 uppercase text-[10px]">Justificativa:</span>
                     {contract.closureReason}
                   </p>
                </div>
              </section>
            )}
          </div>
        )}

        {/* Ações do Modal */}
        <div className="flex justify-end pt-4 border-t border-[#333333]">
          <Button variant="ghost" onClick={onClose} className="px-12 font-black uppercase text-xs tracking-widest text-[#606060]">FECHAR DETALHES</Button>
        </div>
      </div>
    </Modal>
  )
}

/**
 * COMPONENTE: ContractCard
 * 
 * Representação visual resumida do contrato para as listagens.
 */
function ContractCard({ contract, dim, onDetails, onPDF, onTerminate }: {
  contract: Contract
  dim?: boolean                      // Se verdadeiro, reduz opacidade (histórico)
  onDetails: (c: Contract) => void   // Gatilho para abrir detalhes
  onPDF: (c: Contract) => void       // Gatilho para gerir PDF
  onTerminate?: (c: Contract) => void // Gatilho para encerrar contrato
}) {
  // Dados calculados para o card
  const weeksLeft = getWeeksRemaining(contract.end_date)
  const periodValue = contract.type === 2 ? contract.biweekly_rate || 0 : contract.weekly_rate || 0;
  const monthlyValue = getMonthlyValue(contract.type, periodValue)
  const periodLabel = contract.type === 2 ? 'QUINZENA' : 'SEMANA'
  
  // Lógica de criticidade de prazo
  const isCritical = contract.status === 'active' && weeksLeft <= 2
  const isWarning  = contract.status === 'active' && weeksLeft > 2 && weeksLeft <= 4
  // Lógica de alerta de assinatura pendente
  const noSignedPdf = contract.status === 'active' && !contract.pdf_url && !contract.signed

  return (
    <div className={`group bg-[#202020] border rounded-2xl p-5 transition-all duration-300 ${
      dim           ? 'border-[#2a2a2a] opacity-65 grayscale hover:opacity-100 hover:grayscale-0'
      : noSignedPdf  ? 'border-red-500/40 shadow-lg shadow-red-500/5'
      : 'border-[#333333] hover:border-[#555555] hover:shadow-2xl hover:shadow-black/40'
    }`}>
      
      {/* Cabeçalho do Card: Status e Badges de Alerta */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <TypeBadge type={contract.type} />
          <StatusBadge status={contract.status} />
          
          {/* ALERTA: FALTA DE PDF ASSINADO */}
          {noSignedPdf && (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black uppercase italic animate-pulse">
              <AlertCircle className="w-3 h-3" /> AGUARDANDO SCAN
            </span>
          )}
          
          {/* ALERTA: PROXIMIDADE DO FIM */}
          {contract.status === 'active' && (isCritical || isWarning) && (
            <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase ${
              isCritical ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <Clock className="w-3 h-3" /> {weeksLeft} SEMANAS RESTANTES
            </span>
          )}
        </div>

        {/* Ações Rápidas no Card */}
        <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Botão PDF */}
          <button
            onClick={() => onPDF(contract)}
            className={`p-2 rounded-xl transition-all border border-transparent ${
              contract.pdf_url || contract.signed
                ? 'text-green-400 hover:bg-green-500/10 hover:border-green-500/20' 
                : noSignedPdf ? 'text-red-400 bg-red-500/5 border-red-500/20' : 'text-[#606060]'
            }`}
            title="Gerenciar Documento PDF"
          >
            <FileText className="w-4.5 h-4.5" />
          </button>
          {/* Botão Detalhes */}
          <button 
            onClick={() => onDetails(contract)} 
            className="p-2 rounded-xl text-[#606060] hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
            title="Ver Ficha Completa"
          >
            <Eye className="w-4.5 h-4.5" />
          </button>
          {/* Botão Encerrar (Apenas Ativos) */}
          {onTerminate && contract.status === 'active' && (
            <button 
              onClick={() => onTerminate(contract)} 
              className="p-2 rounded-xl text-[#606060] hover:text-amber-400 hover:bg-amber-500/10 transition-all border border-transparent hover:border-amber-500/20" 
              title="Baixar Contrato / Encerrar"
            >
              <XCircle className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid Central: Informação das Partes e Objeto */}
      <div className="grid grid-cols-2 gap-6 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#606060] flex-shrink-0">
             <User className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-[#606060] font-black uppercase tracking-widest mb-0.5">Locatário</p>
            <p className="text-sm text-white font-bold truncate uppercase italic group-hover:text-[#BAFF1A] transition-colors">{contract.customerName}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#606060] flex-shrink-0">
             <Bike className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-[#606060] font-black uppercase tracking-widest mb-0.5">Veículo</p>
            <p className="text-sm text-white font-mono font-black tracking-tighter uppercase">{contract.motorcycle_plate}</p>
          </div>
        </div>
      </div>

      {/* Rodapé do Card: Datas e Valores de Cobrança */}
      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-[#2a2a2a] bg-black/10 -mx-5 px-5 pb-0">
        <div>
          <p className="text-[9px] text-[#606060] font-black uppercase tracking-tighter mb-1">ATIVAÇÃO</p>
          <p className="text-[11px] text-[#A0A0A0] font-bold">{formatLocalDate(contract.start_date)}</p>
        </div>
        <div>
          <p className="text-[9px] text-[#606060] font-black uppercase tracking-tighter mb-1">VENCIMENTO</p>
          <p className={`text-[11px] font-bold ${isCritical ? 'text-red-400' : 'text-[#A0A0A0]'}`}>{formatLocalDate(contract.end_date)}</p>
        </div>
        <div>
          <p className="text-[9px] text-[#606060] font-black uppercase tracking-tighter mb-1">PARCELA/{periodLabel}</p>
          <p className="text-[11px] text-white font-black">{formatLocalCurrency(periodValue)}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-[#606060] font-black uppercase tracking-tighter mb-1">MÉD. MENSAL</p>
          <p className="text-[11px] text-[#BAFF1A] font-black">{formatLocalCurrency(monthlyValue)}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * COMPONENTE PRINCIPAL: ContractsPage
 * 
 * Gerencia a lógica de negócio, filtros e criação de novos contratos.
 */
export default function ContractsPage() {
  /* 
   * ESTADOS DE DADOS E VISUALIZAÇÃO 
   */
  // Lista mestre de contratos do sistema
  const [contracts, setContracts] = useState<Contract[]>(mockContracts)
  // Controla se a seção de histórico está aberta
  const [showHistory, setShowHistory] = useState(false)
  // Valor do filtro de modalidade (Todos, T1, T2, T3)
  const [typeFilter, setTypeFilter] = useState('todos')
  // Termo de pesquisa global
  const [search, setSearch] = useState('')
  
  /* ESTADOS DE MODAIS */
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [contractDetails, setContractDetails] = useState<Contract | null>(null)
  const [contractPdf, setContractPdf] = useState<Contract | null>(null)
  const [terminatingContract, setTerminatingContract] = useState<Contract | null>(null)
  
  /* ESTADOS DE FORMULÁRIOS */
  const [terminationForm, setTerminationForm] = useState<{ status: ContractStatus; reason: string }>({ 
    status: 'closed', 
    reason: '' 
  })
  const [form, setForm] = useState({
    type: '1', customerName: '', customerCpf: '', customerPhone: '',
    motorcycle_plate: '', motorcycleModel: '', motorcycleBrand: '', motorcycleYear: '', motorcycleColor: '',
    motorcycleRenavam: '', motorcycleChassis: '', start_date: '', periodValue: '', observations: '',
  })

  /**
   * EFEITO: Sincronização com LocalStorage (Integração com a Fila de Locadores)
   * 
   * Verifica se existem contratos recém-gerados por outras telas (ex: Fila) e os importa.
   */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_NEW_CONTRACTS)
      if (!raw) return
      const pending: Contract[] = JSON.parse(raw)
      if (pending.length > 0) {
        setContracts((prev) => {
          // Evita duplicidade baseada no ID
          const existingIds = new Set(prev.map((c) => c.id))
          const uniqueNew = pending.filter((c) => !existingIds.has(c.id))
          return [...uniqueNew, ...prev]
        })
        // Limpa a fila após importar com sucesso
        localStorage.removeItem(LS_NEW_CONTRACTS)
      }
    } catch (e) {
      console.error("Falha ao sincronizar novos contratos:", e)
    }
  }, [])

  /**
   * FUNÇÃO: filterContracts
   * 
   * Filtra uma lista de contratos baseada nos critérios de UI (Tipo e Busca).
   */
  function filterContracts(list: Contract[]) {
    return list.filter((c) => {
      // Filtro por categoria técnica
      const passesType = typeFilter === 'todos' || String(c.type) === typeFilter
      // Filtro por busca textual (Nome ou Placa)
      const passesSearch = !search || [c.customerName, c.motorcycle_plate, c.motorcycleModel].some(
        (v) => v?.toLowerCase().includes(search.toLowerCase())
      )
      return passesType && passesSearch
    })
  }

  /* 
   * SEPARAÇÃO LÓGICA DAS LISTAS PARA RENDERIZAÇÃO 
   */
  // Contratos marcados como pendentes de assinatura (Críticos)
  const pending = contracts.filter((c) => c.signed === false && !c.pdf_url)
  // Contratos ativos e já assinados (Operação normal)
  const active  = filterContracts(contracts.filter((c) => c.status === 'active' && (c.signed !== false || c.pdf_url)))
  // Contratos encerrados ou quebrados (Histórico)
  const history = filterContracts(contracts.filter((c) => c.status !== 'active'))

  /**
   * HANDLER: handleUpdatePDF
   * 
   * Atualiza a URL do PDF e retira o contrato do estado de pendência de assinatura.
   */
  function handleUpdatePDF(id: string, url: string) {
    setContracts((prev) => prev.map((c) => c.id === id ? { ...c, pdf_url: url, signed: true } : c))
    // Sincroniza o modal se estiver aberto
    setContractPdf((prev) => prev && prev.id === id ? { ...prev, pdf_url: url, signed: true } : prev)
  }

  /**
   * HANDLER: handleTerminateContract
   * 
   * Executa a lógica de baixa de um contrato ativo.
   */
  function handleTerminateContract() {
    if (!terminatingContract) return
    setContracts((prev) => prev.map((c) => c.id === terminatingContract.id
      ? {
          ...c,
          status: terminationForm.status,
          closureReason: terminationForm.reason,
          closing_date: new Date().toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0], // Força a data final para hoje
          updated_at: new Date().toISOString(),
        }
      : c
    ))
    setTerminatingContract(null)
    setTerminationForm({ status: 'closed', reason: '' })
  }

  /**
   * HANDLER: handleCreateContract
   * 
   * Consolida o formulário manual em um novo objeto Contract.
   */
  function handleCreateContract(e: React.FormEvent) {
    e.preventDefault()
    const type = parseInt(form.type) as ContractType
    const start = new Date(form.start_date + 'T12:00:00')
    const end = new Date(start)
    
    // Regra automática de duração baseada no tipo
    if (type === 1) end.setDate(end.getDate() + 90) // 90 dias para locação
    else end.setFullYear(end.getFullYear() + 2)    // 24 meses para fidelidade

    const newContract: Contract = {
      id: String(Date.now()),
      type,
      customer_id: String(Date.now()),
      customerName: form.customerName.toUpperCase(),
      customerCpf: form.customerCpf,
      customerPhone: form.customerPhone,
      motorcycle_id: String(Date.now() + 1),
      motorcycle_plate: form.motorcycle_plate.toUpperCase(),
      motorcycleModel: form.motorcycleModel.toUpperCase(),
      motorcycleBrand: form.motorcycleBrand.toUpperCase(),
      motorcycleYear: form.motorcycleYear,
      motorcycleColor: form.motorcycleColor.toUpperCase(),
      motorcycleRenavam: form.motorcycleRenavam || undefined,
      motorcycleChassis: form.motorcycleChassis || undefined,
      start_date: form.start_date,
      end_date: end.toISOString().split('T')[0],
      weekly_rate: type === 1 || type === 3 ? parseFloat(form.periodValue) : undefined,
      biweekly_rate: type === 2 ? parseFloat(form.periodValue) : undefined,
      status: 'active',
      signed: false,
      observations: form.observations,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setContracts((prev) => [newContract, ...prev])
    setAddModalOpen(false)
    // Reseta o estado do formulário para o próximo uso
    setForm({ type: '1', customerName: '', customerCpf: '', customerPhone: '', motorcycle_plate: '', motorcycleModel: '', motorcycleBrand: '', motorcycleYear: '', motorcycleColor: '', motorcycleRenavam: '', motorcycleChassis: '', start_date: '', periodValue: '', observations: '' })
  }

  /**
   * RENDERIZAÇÃO DA PÁGINA: ContractsPage
   */
  return (
    <div className="flex flex-col min-h-full">
      {/* 
        * CABEÇALHO DA PÁGINA
        * Controla a ação primária de abertura do formulário de novo contrato.
        */}
      <Header
        title="Gestão de Contratos"
        subtitle={`${active.length + pending.length} contratos vigentes na base de dados`}
        actions={
          <Button onClick={() => setAddModalOpen(true)} className="shadow-lg shadow-[#BAFF1A]/10">
            <Plus className="w-4 h-4" /> NOVO CONTRATO
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        
        {/* BARRA DE FERRAMENTAS: Filtros por Tipo e Busca Global */}
        <div className="flex items-center gap-4 flex-wrap">
          
          {/* BOTÕES DE FILTRO DE TIPO */}
          <div className="flex gap-2 flex-wrap bg-[#1a1a1a] p-1 rounded-xl border border-[#333333]">
            {['todos', '1', '2', '3'].map((val) => (
              <button
                key={val}
                onClick={() => setTypeFilter(val)}
                className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  typeFilter === val 
                    ? 'bg-[#BAFF1A] text-[#121212] shadow-inner' 
                    : 'text-[#606060] hover:text-white hover:bg-white/5'
                }`}
              >
                {val === 'todos' ? 'TODOS OS PLANOS' : `TIPO ${val}`}
              </button>
            ))}
          </div>

          {/* CAMPO DE BUSCA DINÂMICA */}
          <div className="ml-auto relative min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444444]" />
            <input
              type="text" 
              placeholder="Pesquisar por Locatário ou Placa..."
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#202020] border border-[#333333] text-sm text-white placeholder-[#444444] focus:outline-none focus:border-[#BAFF1A]/40 transition-all"
            />
          </div>
        </div>

        {/* RESUMO ESTATÍSTICO RÁPIDO */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-green-500/10 bg-green-500/[0.02]">
            <p className="text-[10px] text-[#606060] font-black uppercase tracking-widest">Contratos em Vigência</p>
            <p className="text-4xl font-black text-white mt-2 tracking-tighter">{active.length}</p>
          </Card>
          <Card className="border-white/5 bg-white/[0.01]">
            <p className="text-[10px] text-[#606060] font-black uppercase tracking-widest">Arquivo Morto (Histórico)</p>
            <p className="text-4xl font-black text-[#444444] mt-2 tracking-tighter">{history.length}</p>
          </Card>
        </div>

        {/* SEÇÃO CRÍTICA: CONTRATOS SEM ASSINATURA CARREGADA */}
        {pending.length > 0 && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-5 space-y-4">
            <div className="flex items-center gap-2 text-red-400 font-black uppercase text-[11px] tracking-[0.2em] mb-2">
               <AlertCircle className="w-4 h-4" /> ALERTA DE COMPLIANCE: AGUARDANDO ASSINATURA ({pending.length})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pending.map((c) => (
                <ContractCard key={c.id} contract={c} onDetails={setContractDetails} onPDF={setContractPdf} onTerminate={setTerminatingContract} />
              ))}
            </div>
          </div>
        )}

        {/* LISTAGEM PRINCIPAL: CONTRATOS ATIVOS */}
        <div className="space-y-4">
          <h5 className="text-[10px] text-[#606060] font-black uppercase tracking-[0.2em] ml-1">Contratos Operacionais</h5>
          <div className="grid grid-cols-1 gap-4">
            {active.map((c) => (
              <ContractCard key={c.id} contract={c} onDetails={setContractDetails} onPDF={setContractPdf} onTerminate={setTerminatingContract} />
            ))}
            
            {/* Estado Vazio para Contratos Ativos */}
            {active.length === 0 && pending.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-[#1a1a1a]/50 rounded-2xl border border-dashed border-[#252525]">
                <FileText className="w-12 h-12 text-[#333333] mb-4" />
                <p className="text-sm text-[#555555] font-medium italic">Nenhum contrato ativo corresponde aos filtros aplicados.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEÇÃO: HISTÓRICO EXPANSÍVEL (Contratos Encerrados) */}
        {history.length > 0 && (
          <div className="pt-4">
            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#606060] hover:text-white transition-all w-full justify-center py-4 border border-white/5 rounded-2xl hover:bg-white/[0.02]"
            >
              <History className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" />
              {showHistory ? 'OCULTAR ARQUIVO DE CONTRATOS' : `EXIBIR HISTÓRICO DE CONTRATOS ENCERRADOS (${history.length})`}
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showHistory && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-in slide-in-from-top-4 duration-500">
                {history.map((c) => (
                  <ContractCard key={c.id} contract={c} dim onDetails={setContractDetails} onPDF={setContractPdf} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 
        * MODAL: CRIAÇÃO MANUAL DE CONTRATO 
        * Utilizado em casos de exceção onde o contrato não vem da fila automática.
        */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Formalizar Novo Contrato Manual" size="lg">
        <form onSubmit={handleCreateContract} className="space-y-6 p-1">
          {/* Seleção de Modalidade */}
          <Select 
            label="Modalidade de Plano" 
            value={form.type} 
            onChange={(e) => setForm({ ...form, type: e.target.value })} 
            options={[
              { value: '1', label: 'TIPO 1 — Locação (90 dias renováveis)' },
              { value: '2', label: 'TIPO 2 — Fidelidade Quinzenal (24 meses)' },
              { value: '3', label: 'TIPO 3 — Fidelidade Semanal (24 meses)' },
            ]}
          />
          
          {/* Dados Resumidos das Partes */}
          <div className="grid grid-cols-2 gap-5">
            <Input label="Nome do Locatário" placeholder="EX: JOÃO DA SILVA" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
            <Input label="Placa da Moto" placeholder="EX: ABC1D23" value={form.motorcycle_plate} onChange={(e) => setForm({ ...form, motorcycle_plate: e.target.value })} required />
            <Input label="Início da Vigência" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
            <Input label="Valor da Parcela (R$)" type="number" step="0.01" placeholder="0.00" value={form.periodValue} onChange={(e) => setForm({ ...form, periodValue: e.target.value })} required />
          </div>

          {/* Campo de Notas */}
          <Textarea label="Notas Administrativas" placeholder="Observações sobre o fechamento..." rows={3} value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} />
          
          {/* Ações do Form */}
          <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)} className="px-8 font-black text-[10px] tracking-widest text-[#606060]">CANCELAR</Button>
            <Button type="submit" className="px-12 shadow-lg shadow-[#BAFF1A]/20 font-black">GERAR REGISTRO</Button>
          </div>
        </form>
      </Modal>

      {/* 
        * MODAIS CONDICIONAIS (DETALHES E PDF) 
        */}
      {contractDetails && <DetailsModal contract={contractDetails} onClose={() => setContractDetails(null)} />}
      
      {contractPdf && <PDFModal contract={contractPdf} onClose={() => setContractPdf(null)} onUpdate={handleUpdatePDF} />}

      {/* 
        * MODAL: ENCERRAMENTO (BAIXA DE CONTRATO)
        * Define o destino final do veículo e do histórico do cliente.
        */}
      {terminatingContract && (
        <Modal open onClose={() => setTerminatingContract(null)} title="Encerramento de Vigência" size="sm">
          <div className="space-y-6">
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
               <p className="text-xs text-amber-200/70 font-medium leading-relaxed italic text-center">
                 Você está finalizando o contrato de <br />
                 <strong className="text-white font-black not-italic text-sm">{terminatingContract.customerName}</strong>.
               </p>
            </div>

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleTerminateContract(); }}>
              <Select 
                label="Qual o status final do acordo?" 
                value={terminationForm.status} 
                onChange={(e) => setTerminationForm({ ...terminationForm, status: e.target.value as ContractStatus })}
                options={[
                  { value: 'closed', label: 'ENCERRADO (Fim de prazo / Quitado)' },
                  { value: 'cancelled', label: 'CANCELADO (Devolução amigável)' },
                  { value: 'broken',  label: 'QUEBRADO (Inadimplência / Sinistro)' },
                ]}
              />
              <Textarea 
                label="Descreva o motivo do fechamento" 
                placeholder="Ex: Cliente atingiu os 24 meses / Cliente devolveu por falta de demanda..." 
                rows={4} 
                value={terminationForm.reason} 
                onChange={(e) => setTerminationForm({ ...terminationForm, reason: e.target.value })} 
                required
              />
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => setTerminatingContract(null)} className="flex-1 font-black text-[10px] tracking-widest text-[#606060]">VOLTAR</Button>
                <Button type="submit" variant="danger" className="flex-1 font-black shadow-lg shadow-red-500/20">CONFIRMAR BAIXA</Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  )
}

/**
 * NOTAS DE EVOLUÇÃO TÉCNICA:
 * - Implementar integração com Docusign/Clicksign para assinaturas digitais nativas.
 * - Gerar avisos automáticos via WhatsApp quando o contrato estiver a 4 semanas do fim.
 * - Adicionar upload de fotos da moto no momento da devolução (Check-out) no Modal de Encerramento.
 */
