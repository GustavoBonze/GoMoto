/**
 * CAMADA DE QUERIES — preparada para Supabase
 *
 * Cada função retorna dados mock enquanto o Supabase não está configurado.
 * Quando as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
 * estiverem no .env.local, substitua o bloco "mock" pelo bloco "supabase" de cada função.
 *
 * Tabelas esperadas no Supabase (ver supabase-schema.sql):
 *   motos, clientes, contratos, fila, cobrancas, entradas, despesas, multas, manutencoes
 */

// import { createClient } from './client'

// ——————————————————————————————————————————
// MOTOS
// ——————————————————————————————————————————

/**
 * Retorna todas as motos da frota.
 *
 * TODO Supabase:
 *   const supabase = createClient()
 *   const { data } = await supabase.from('motos').select('*').order('placa')
 *   return data ?? []
 */
export async function getMotos() {
  const { TODAS_MOTOS } = await import('@/data/motos')
  return TODAS_MOTOS
}

/**
 * Retorna somente motos disponíveis (sem contrato ativo).
 *
 * TODO Supabase:
 *   const supabase = createClient()
 *   const { data } = await supabase
 *     .from('motos')
 *     .select('*')
 *     .eq('status', 'disponivel')
 *     .order('placa')
 *   return data ?? []
 */
export async function getMotosDisponiveis() {
  const { TODAS_MOTOS } = await import('@/data/motos')
  return TODAS_MOTOS // filtro real virá do Supabase (status = 'disponivel')
}

// ——————————————————————————————————————————
// FILA
// ——————————————————————————————————————————

/**
 * Retorna a fila de locadores ordenada por posição.
 *
 * TODO Supabase:
 *   const supabase = createClient()
 *   const { data } = await supabase
 *     .from('fila')
 *     .select('*, historico_posicao(*), documentos(*)')
 *     .order('posicao', { ascending: true })
 *   return data ?? []
 */
export async function getFila() {
  return [] // mock gerenciado via localStorage enquanto Supabase não está ativo
}

/**
 * Salva movimentação de posição na fila.
 *
 * TODO Supabase:
 *   const supabase = createClient()
 *   await supabase.from('fila_movimentacoes').insert({
 *     fila_id: pessoaId,
 *     de: posicaoAnterior,
 *     para: novaPosicao,
 *     motivo,
 *     data: new Date().toISOString(),
 *   })
 */
export async function registrarMovimentacao(_pessoaId: string, _de: number, _para: number, _motivo: string) {
  // mock: já salvo via localStorage em fila/page.tsx
}

// ——————————————————————————————————————————
// CONTRATOS
// ——————————————————————————————————————————

/**
 * Retorna todos os contratos com dados de cliente e moto.
 *
 * TODO Supabase:
 *   const supabase = createClient()
 *   const { data } = await supabase
 *     .from('contratos')
 *     .select('*, clientes(*), motos(*)')
 *     .order('created_at', { ascending: false })
 *   return data ?? []
 */
export async function getContratos() {
  return [] // mock gerenciado em contratos/page.tsx
}

/**
 * Cria um novo contrato.
 *
 * TODO Supabase:
 *   const supabase = createClient()
 *   const { data } = await supabase.from('contratos').insert(contrato).select().single()
 *   // Após criar: atualizar status da moto para 'alugada'
 *   await supabase.from('motos').update({ status: 'alugada' }).eq('id', contrato.moto_id)
 *   return data
 */
export async function criarContrato(_contrato: Record<string, unknown>) {
  // mock: salvo via localStorage
}

/**
 * Encerra um contrato (atualiza status + data_fim + motivo).
 *
 * TODO Supabase:
 *   const supabase = createClient()
 *   await supabase.from('contratos').update({
 *     status, motivo_encerramento, data_fim: new Date().toISOString(),
 *   }).eq('id', contratoId)
 *   // Após encerrar: atualizar status da moto para 'disponivel'
 *   await supabase.from('motos').update({ status: 'disponivel' }).eq('id', motoId)
 */
export async function encerrarContrato(_contratoId: string, _status: string, _motivo: string, _motoId: string) {
  // mock: gerenciado via setState
}

/**
 * Faz upload do PDF do contrato assinado.
 *
 * TODO Supabase Storage:
 *   const supabase = createClient()
 *   const path = `contratos/${contratoId}/assinado.pdf`
 *   const { data } = await supabase.storage.from('documentos').upload(path, file, { upsert: true })
 *   const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(path)
 *   await supabase.from('contratos').update({ pdf_url: urlData.publicUrl }).eq('id', contratoId)
 */
export async function uploadContratoAssinado(_contratoId: string, _file: File) {
  // mock: usa URL.createObjectURL
}

// ——————————————————————————————————————————
// CLIENTES
// ——————————————————————————————————————————

/**
 * TODO Supabase:
 *   const supabase = createClient()
 *   const { data } = await supabase
 *     .from('clientes')
 *     .select('*, documentos(*)')
 *     .order('nome')
 *   return data ?? []
 */
export async function getClientes() {
  return []
}
