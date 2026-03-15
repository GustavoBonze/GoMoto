export type MotoStatus = 'disponivel' | 'alugada' | 'manutencao' | 'inativa'

export type DocumentoTipo =
  | 'cnh'
  | 'comprovante_residencia'
  | 'contrato'
  | 'identificacao'
  | 'caucao'
  | 'outro'

export interface Documento {
  id: string
  tipo: DocumentoTipo
  nome: string
  url?: string
  uploaded_at: string
}

export interface MovimentacaoFila {
  data: string
  de: number
  para: number
  motivo: string
}
export type CobrancaStatus = 'pendente' | 'pago' | 'vencido' | 'prejuizo'
export type ContratoStatus = 'ativo' | 'encerrado' | 'cancelado' | 'quebrado'
export type ContratoTipo = 1 | 2 | 3
export type MultaStatus = 'pendente' | 'pago'

export interface Moto {
  id: string
  placa: string
  modelo: string
  marca: string
  ano: string
  cor: string
  renavam: string
  chassi: string
  combustivel?: string
  potencia_cilindrada?: string
  dono_antigo?: string
  cpf_dono_antigo?: string
  data_compra?: string
  valor_fipe?: number
  manutencao_em_dia?: boolean
  status: MotoStatus
  foto_url?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface HistoricoLocacaoCliente {
  data_inicio: string
  data_fim?: string
  moto_placa?: string
  moto_modelo?: string
  motivo_saida: string
  valor_devido?: number
}

export interface Cliente {
  id: string
  nome: string
  cpf: string
  rg?: string
  uf?: string
  telefone: string
  email?: string
  endereco?: string
  cep?: string
  contato_emergencia?: string
  cnh: string
  cnh_validade?: string
  cnh_categoria?: string
  data_nascimento?: string
  status_pagamento?: string
  foto_cnh_url?: string
  foto_documento_url?: string
  observacoes?: string
  documentos?: Documento[]
  na_fila: boolean
  ativo?: boolean
  data_saida?: string
  motivo_saida?: string
  historico_locacao?: HistoricoLocacaoCliente[]
  created_at: string
  updated_at: string
}

export interface Contrato {
  id: string
  cliente_id: string
  moto_id: string
  data_inicio: string
  data_fim?: string
  valor_mensal: number
  status: ContratoStatus
  pdf_url?: string
  observacoes?: string
  created_at: string
  updated_at: string
  cliente?: Cliente
  moto?: Moto
}

export interface Cobranca {
  id: string
  contrato_id: string
  cliente_id: string
  descricao: string
  valor: number
  vencimento: string
  status: CobrancaStatus
  data_pagamento?: string
  observacoes?: string
  created_at: string
  updated_at: string
  cliente?: Cliente
  contrato?: Contrato
}

export interface Entrada {
  id: string
  veiculo: string           // placa da moto
  data: string              // data do pagamento
  locatario: string         // nome do cliente
  valor: number
  referencia: string        // Semanal, Quinzenal, Mensal, Caução, Multa, Proporcional, Outros
  forma_pagamento: string   // PIX, Boleto, Cartão de crédito, etc.
  periodo_de?: string       // início do período referente
  periodo_ate?: string      // fim do período referente
  observacoes?: string
  created_at: string
}

export interface Despesa {
  id: string
  descricao: string
  valor: number
  categoria: string
  data: string
  moto_id?: string
  observacoes?: string
  created_at: string
  moto?: Moto
}

export interface Multa {
  id: string
  cliente_id: string
  moto_id: string
  descricao: string
  valor: number
  data_infração: string
  status: MultaStatus
  data_pagamento?: string
  responsavel: 'cliente' | 'empresa'
  observacoes?: string
  created_at: string
  cliente?: Cliente
  moto?: Moto
}

export interface ItemManutencaoPadrao {
  id: string
  nome: string
  intervalo_km: number | null   // null = baseado em data (vistoria)
  intervalo_dias: number | null // para vistoria mensal
  tipo: 'preventiva' | 'corretiva' | 'vistoria'
  dica: string
}

export type ManutencaoStatus = 'vencida' | 'proxima' | 'agendada' | 'realizada'

export interface Manutencao {
  id: string
  moto_id: string
  item_padrao_id: string | null
  tipo: 'preventiva' | 'corretiva' | 'vistoria'
  descricao: string
  km_previsto: number | null
  km_realizado: number | null
  data_agendada: string | null
  data_realizada: string | null
  custo: number | null
  realizada: boolean
  oficina: string | null
  foto_odometro_url: string | null
  foto_nota_fiscal_url: string | null
  observacoes: string | null
  created_at: string
  updated_at: string
  moto?: Moto
}

export interface Checklist {
  id: string
  moto_id: string
  contrato_id?: string
  tipo: 'entrega' | 'devolucao'
  data: string
  km_atual: number
  combustivel: number
  itens: ChecklistItem[]
  assinatura_url?: string
  observacoes?: string
  created_at: string
  moto?: Moto
}

export interface ChecklistItem {
  item: string
  ok: boolean
  observacao?: string
}

export interface Processo {
  id: string
  pergunta: string
  resposta: string
  categoria: string
  ordem: number
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  motos_disponiveis: number
  motos_alugadas: number
  motos_manutencao: number
  contratos_ativos: number
  cobrancas_vencidas: number
  receita_mes: number
  despesas_mes: number
  clientes_fila: number
}
