// ============================================================
// Dados de motos — dados reais da frota
// TODO Supabase: substituir por → supabase.from('motos').select('*')
// ============================================================

export interface MotoData {
  id: string
  placa: string
  modelo: string
  marca: string
  ano: string
  cor: string
  renavam?: string
  chassi?: string
}

export const TODAS_MOTOS: MotoData[] = [
  { id: '1', placa: 'SYF1C42', modelo: 'HONDA/CG 160 START',     marca: 'HONDA',  ano: '21/22', cor: 'VERMELHO', renavam: '00775000018',  chassi: '9C2JC3110MR999999' },
  { id: '2', placa: 'KYN9J41', modelo: 'YAMAHA/YS150 FAZER SED', marca: 'YAMAHA', ano: '23/24', cor: 'CINZA',    renavam: '01169440800',  chassi: '9C6RG17Y0PR000000' },
  { id: '3', placa: 'RIW4J89', modelo: 'HONDA/CG 160 CARGO',     marca: 'HONDA',  ano: '23/24', cor: 'BRANCO',  renavam: '01265799001',  chassi: '9C2JH1280PR123456' },
  { id: '4', placa: 'RJA5J85', modelo: 'HONDA/CG 160 START',     marca: 'HONDA',  ano: '24/25', cor: 'PRETO',   renavam: '01267415698',  chassi: '9C2JC3110RR001234' },
]

/** localStorage keys — espelham as tabelas do Supabase */
export const LS_MOTOS_ALOCADAS = 'gomoto_motos_alocadas'
export const LS_FILA            = 'gomoto_fila'
export const LS_NEW_CONTRACTS   = 'gomoto_new_contracts'
