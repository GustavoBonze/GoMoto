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
  { id: '1', placa: 'AAA0A00', modelo: 'HONDA/CG 160 START',     marca: 'HONDA',  ano: '21/22', cor: 'VERMELHO', renavam: '00000000000',  chassi: '9C2JC0000XX000000' },
  { id: '2', placa: 'BBB1B11', modelo: 'YAMAHA/YS150 FAZER SED', marca: 'YAMAHA', ano: '23/24', cor: 'CINZA',    renavam: '11111111111',  chassi: '9C6RG00000XX00000' },
  { id: '3', placa: 'CCC2C22', modelo: 'HONDA/CG 160 CARGO',     marca: 'HONDA',  ano: '23/24', cor: 'BRANCO',  renavam: '22222222222',  chassi: '9C2JH0000XX000000' },
  { id: '4', placa: 'DDD3D33', modelo: 'HONDA/CG 160 START',     marca: 'HONDA',  ano: '24/25', cor: 'PRETO',   renavam: '33333333333',  chassi: '9C2JC0000YY000000' },
]

/** localStorage keys — espelham as tabelas do Supabase */
export const LS_MOTOS_ALOCADAS = 'gomoto_motos_alocadas'
export const LS_FILA            = 'gomoto_fila'
export const LS_NEW_CONTRACTS   = 'gomoto_new_contracts'
