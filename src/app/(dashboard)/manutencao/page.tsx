'use client'

import { useState, useMemo } from 'react'
import {
  Plus, Search, Wrench, CheckCircle2, AlertTriangle,
  Clock, Trash2, Edit2, Camera, FileText, Gauge, ChevronDown,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { formatDate } from '@/lib/utils'
import type { ItemManutencaoPadrao, Manutencao, ManutencaoStatus } from '@/types'

// ─── tipos internos ───────────────────────────────────────────────────────────

// Dados financeiros individuais por item registrado (etapa 2 do modal de registro)
type RespItem = 'empresa' | 'cliente' | '50/50'
type ItemFinanceiro = {
  id: string           // mesmo id do ManutencaoItem
  valor: string        // custo digitado pelo usuário (string para o input)
  tem_foto_odometro: boolean
  tem_foto_nf: boolean
  resp: RespItem       // responsabilidade — auto-detectada, mas editável pelo usuário
}

// Dados de contrato usados apenas para a lógica financeira do registro de manutenção.
// Substituir por consulta real ao Supabase quando a integração estiver pronta.
type ContratoMock = {
  tipo: 'promessa' | 'locacao'  // promessa = cliente paga 100%; locacao = 50/50 preventiva
  cliente_nome: string
  valor_semanal: number
  cobranca_proxima: string      // data (YYYY-MM-DD) da cobrança pendente mais próxima
}

type MotoComKm = { id: string; placa: string; modelo: string; km_atual: number; contrato?: ContratoMock }

type ManutencaoItem = Manutencao & {
  moto_placa: string
  moto_modelo: string
  moto_km_atual: number
}

// ─── catálogo dos 13 itens padrão ────────────────────────────────────────────

const ITENS_PADRAO: ItemManutencaoPadrao[] = [
  { id: 'ip1',  nome: 'Troca de óleo',                          intervalo_km: 1000,  intervalo_dias: null, tipo: 'preventiva', dica: 'Use óleo 20W50 ou 10W30; troque o filtro a cada 2 trocas.' },
  { id: 'ip2',  nome: 'Filtro de óleo',                         intervalo_km: 4000,  intervalo_dias: null, tipo: 'preventiva', dica: 'Trocar a cada duas trocas de óleo.' },
  { id: 'ip5',  nome: 'Troca da relação (corrente/coroa/pinhão)', intervalo_km: 12000, intervalo_dias: null, tipo: 'preventiva', dica: 'Prefira relação original para maior durabilidade.' },
  { id: 'ip6',  nome: 'Lona de freio traseira',                 intervalo_km: 12000, intervalo_dias: null, tipo: 'preventiva', dica: 'Evite manter o pé no freio.' },
  { id: 'ip7',  nome: 'Pastilha de freio dianteira',            intervalo_km: 8000,  intervalo_dias: null, tipo: 'preventiva', dica: 'Use o freio dianteiro de forma equilibrada.' },
  { id: 'ip8',  nome: 'Pneu dianteiro',                         intervalo_km: 12000, intervalo_dias: null, tipo: 'preventiva', dica: 'Calibre semanalmente (32 psi dianteiro).' },
  { id: 'ip9',  nome: 'Pneu traseiro',                          intervalo_km: 8000,  intervalo_dias: null, tipo: 'preventiva', dica: 'Calibre semanalmente (36 psi traseiro).' },
  { id: 'ip10', nome: 'Filtro de ar',                           intervalo_km: 7000,  intervalo_dias: null, tipo: 'preventiva', dica: 'Limpar ou trocar; poeira urbana reduz durabilidade.' },
  { id: 'ip11', nome: 'Velas de ignição',                       intervalo_km: 10000, intervalo_dias: null, tipo: 'preventiva', dica: 'Verificar e ajustar folga antes de trocar.' },
  { id: 'ip12', nome: 'Amortecedores',                          intervalo_km: 25000, intervalo_dias: null, tipo: 'preventiva', dica: 'Peso extra acelera desgaste do óleo interno.' },
  { id: 'ip13', nome: 'Vistoria mensal',                        intervalo_km: null,  intervalo_dias: 30,   tipo: 'vistoria',   dica: 'Vistoria obrigatória mensal de todas as motos.' },
]

// ─── mock: motos ──────────────────────────────────────────────────────────────

// PLACEHOLDER — substituir nomes/valores reais e tipo de contrato quando integrar Supabase
const mockMotosInit: MotoComKm[] = [
  { id: '1', placa: 'AAA0A00', modelo: 'Honda CG 160 START',       km_atual: 46578,
    contrato: { tipo: 'locacao',  cliente_nome: 'Cliente AAA0A00',  valor_semanal: 350, cobranca_proxima: '2026-03-21' } },
  { id: '2', placa: 'BBB1B11', modelo: 'Yamaha YS150 FAZER SED',   km_atual: 30987,
    contrato: { tipo: 'locacao',  cliente_nome: 'Cliente BBB1B11',  valor_semanal: 350, cobranca_proxima: '2026-03-21' } },
  { id: '3', placa: 'CCC2C22', modelo: 'Yamaha YS150 FAZER SED',   km_atual: 67908,
    contrato: { tipo: 'locacao',  cliente_nome: 'Cliente CCC2C22',  valor_semanal: 350, cobranca_proxima: '2026-03-21' } },
  { id: '4', placa: 'DDD3D33', modelo: 'Yamaha YBR150 FACTOR SED', km_atual: 29282,
    contrato: { tipo: 'promessa', cliente_nome: 'Cliente DDD3D33',  valor_semanal: 400, cobranca_proxima: '2026-03-28' } },
]

// ─── mock: manutenções ────────────────────────────────────────────────────────
// Data de hoje (mock): 2026-03-14
// Dados baseados no histórico real de despesas/manutenções da frota

const mkBase = (overrides: Partial<ManutencaoItem>): ManutencaoItem => ({
  id: '', moto_id: '', item_padrao_id: null, tipo: 'preventiva',
  descricao: '', km_previsto: null, km_realizado: null,
  data_agendada: null, data_realizada: null, custo: null,
  realizada: false, oficina: null,
  foto_odometro_url: null, foto_nota_fiscal_url: null,
  observacoes: null,
  created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
  moto_placa: '', moto_modelo: '', moto_km_atual: 0,
  ...overrides,
})

const mockManutencoesInit: ManutencaoItem[] = [

  // ── AAA0A00 — Honda CG 160 START (km: 46.578) ─────────────────────────────
  // Status geral: todas agendadas, moto bem mantida

  // Troca de óleo: última em 15/01/2026 @ 46.578 km → próxima: 47.578
  mkBase({ id: 's_r1', moto_id: '1', item_padrao_id: 'ip1', descricao: 'Troca de óleo', km_previsto: 46578, km_realizado: 46578, data_realizada: '2026-01-15', realizada: true, oficina: 'Oficina do Careca', moto_placa: 'AAA0A00', moto_modelo: 'Honda CG 160 START', moto_km_atual: 46578 }),
  mkBase({ id: 's1',   moto_id: '1', item_padrao_id: 'ip1', descricao: 'Troca de óleo', km_previsto: 47578, moto_placa: 'AAA0A00', moto_modelo: 'Honda CG 160 START', moto_km_atual: 46578 }),

  // Filtro de óleo: próxima @ 48.578 (a cada 2 trocas de óleo)
  mkBase({ id: 's2',   moto_id: '1', item_padrao_id: 'ip2', descricao: 'Filtro de óleo', km_previsto: 48578, moto_placa: 'AAA0A00', moto_modelo: 'Honda CG 160 START', moto_km_atual: 46578 }),

  // Relação: trocada em 12/12/2025 @ ~41.000 km → próxima: 53.000
  mkBase({ id: 's_r2', moto_id: '1', item_padrao_id: 'ip5', descricao: 'Troca da relação (corrente/coroa/pinhão)', km_previsto: 41000, km_realizado: 41000, data_realizada: '2025-12-12', realizada: true, oficina: 'Oficina do Careca', moto_placa: 'AAA0A00', moto_modelo: 'Honda CG 160 START', moto_km_atual: 46578 }),
  mkBase({ id: 's3',   moto_id: '1', item_padrao_id: 'ip5', descricao: 'Troca da relação (corrente/coroa/pinhão)', km_previsto: 53000, moto_placa: 'AAA0A00', moto_modelo: 'Honda CG 160 START', moto_km_atual: 46578 }),

  // Lona de freio traseira: última @ 14.832 → estimado próxima: 50.832
  mkBase({ id: 's4',   moto_id: '1', item_padrao_id: 'ip6', descricao: 'Lona de freio traseira', km_previsto: 50832, moto_placa: 'AAA0A00', moto_modelo: 'Honda CG 160 START', moto_km_atual: 46578 }),

  // Pastilha de freio dianteira: próxima @ 50.578
  mkBase({ id: 's5',   moto_id: '1', item_padrao_id: 'ip7', descricao: 'Pastilha de freio dianteira', km_previsto: 50578, moto_placa: 'AAA0A00', moto_modelo: 'Honda CG 160 START', moto_km_atual: 46578 }),

  // Pneu dianteiro: trocado em 27/02/2026 → próxima: 58.578
  mkBase({ id: 's_r3', moto_id: '1', item_padrao_id: 'ip8', descricao: 'Pneu dianteiro', km_previsto: 46578, km_realizado: 46578, data_realizada: '2026-02-27', realizada: true, oficina: 'Oficina do Careca', moto_placa: 'AAA0A00', moto_modelo: 'Honda CG 160 START', moto_km_atual: 46578 }),
  mkBase({ id: 's6',   moto_id: '1', item_padrao_id: 'ip8', descricao: 'Pneu dianteiro', km_previsto: 58578, moto_placa: 'AAA0A00', moto_modelo: 'Honda CG 160 START', moto_km_atual: 46578 }),

  // Pneu traseiro: último @ 27.999 → estimado próxima: 51.999
  mkBase({ id: 's7',   moto_id: '1', item_padrao_id: 'ip9', descricao: 'Pneu traseiro', km_previsto: 51999, moto_placa: 'AAA0A00', moto_modelo: 'Honda CG 160 START', moto_km_atual: 46578 }),

  // Filtro de ar: próxima @ 49.000
  mkBase({ id: 's8',   moto_id: '1', item_padrao_id: 'ip10', descricao: 'Filtro de ar', km_previsto: 49000, moto_placa: 'AAA0A00', moto_modelo: 'Honda CG 160 START', moto_km_atual: 46578 }),

  // Velas de ignição: próxima @ 50.578
  mkBase({ id: 's9',   moto_id: '1', item_padrao_id: 'ip11', descricao: 'Velas de ignição', km_previsto: 50578, moto_placa: 'AAA0A00', moto_modelo: 'Honda CG 160 START', moto_km_atual: 46578 }),

  // Amortecedores: próxima @ 52.500 (primeira troca desde compra a ~2.500 km)
  mkBase({ id: 's10',  moto_id: '1', item_padrao_id: 'ip12', descricao: 'Amortecedores', km_previsto: 52500, moto_placa: 'AAA0A00', moto_modelo: 'Honda CG 160 START', moto_km_atual: 46578 }),

  // Vistoria mensal: próxima 13/04/2026
  mkBase({ id: 'sv1',  moto_id: '1', item_padrao_id: 'ip13', tipo: 'vistoria', descricao: 'Vistoria mensal', data_agendada: '2026-04-13', moto_placa: 'AAA0A00', moto_modelo: 'Honda CG 160 START', moto_km_atual: 46578 }),


  // ── BBB1B11 — Yamaha YS150 FAZER SED (km: 30.987) ─────────────────────────
  // Obs: painel trocado na compra (jan/2025); odômetro zerado; registrava ~35.000 km antes.
  // ⚠ ATENÇÃO: amortecedores VENCIDOS; velas PRÓXIMAS

  // Troca de óleo: última em 10/09/2025 @ 30.987 km → próxima: 31.987
  mkBase({ id: 'k_r1', moto_id: '2', item_padrao_id: 'ip1', descricao: 'Troca de óleo', km_previsto: 30987, km_realizado: 30987, data_realizada: '2025-09-10', realizada: true, oficina: 'Oficina do Careca', moto_placa: 'BBB1B11', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 30987 }),
  mkBase({ id: 'k1',   moto_id: '2', item_padrao_id: 'ip1', descricao: 'Troca de óleo', km_previsto: 31987, moto_placa: 'BBB1B11', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 30987 }),

  // Filtro de óleo: próxima @ 33.000
  mkBase({ id: 'k2',   moto_id: '2', item_padrao_id: 'ip2', descricao: 'Filtro de óleo', km_previsto: 33000, moto_placa: 'BBB1B11', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 30987 }),

  // Relação: trocada em 13/08/2025 @ ~23.000 km → próxima: 35.000
  mkBase({ id: 'k_r2', moto_id: '2', item_padrao_id: 'ip5', descricao: 'Troca da relação (corrente/coroa/pinhão)', km_previsto: 23000, km_realizado: 23000, data_realizada: '2025-08-13', realizada: true, oficina: 'Oficina do Careca', moto_placa: 'BBB1B11', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 30987 }),
  mkBase({ id: 'k3',   moto_id: '2', item_padrao_id: 'ip5', descricao: 'Troca da relação (corrente/coroa/pinhão)', km_previsto: 35000, moto_placa: 'BBB1B11', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 30987 }),

  // Lona de freio traseira: próxima @ 35.700
  mkBase({ id: 'k4',   moto_id: '2', item_padrao_id: 'ip6', descricao: 'Lona de freio traseira', km_previsto: 35700, moto_placa: 'BBB1B11', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 30987 }),

  // Pastilha de freio dianteira: próxima @ 33.700
  mkBase({ id: 'k5',   moto_id: '2', item_padrao_id: 'ip7', descricao: 'Pastilha de freio dianteira', km_previsto: 33700, moto_placa: 'BBB1B11', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 30987 }),

  // Pneu dianteiro: próxima @ 37.700
  mkBase({ id: 'k6',   moto_id: '2', item_padrao_id: 'ip8', descricao: 'Pneu dianteiro', km_previsto: 37700, moto_placa: 'BBB1B11', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 30987 }),

  // Pneu traseiro: próxima @ 33.700
  mkBase({ id: 'k7',   moto_id: '2', item_padrao_id: 'ip9', descricao: 'Pneu traseiro', km_previsto: 33700, moto_placa: 'BBB1B11', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 30987 }),

  // Filtro de ar: próxima @ 36.700
  mkBase({ id: 'k8',   moto_id: '2', item_padrao_id: 'ip10', descricao: 'Filtro de ar', km_previsto: 36700, moto_placa: 'BBB1B11', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 30987 }),

  // Velas de ignição: PRÓXIMA — faltam apenas 713 km (alerta: 1.000 km)
  mkBase({ id: 'k9',   moto_id: '2', item_padrao_id: 'ip11', descricao: 'Velas de ignição', km_previsto: 31700, moto_placa: 'BBB1B11', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 30987 }),

  // Amortecedores: VENCIDA — due @ 26.700, atual 30.987 (+4.287 km atrasado)
  mkBase({ id: 'k10',  moto_id: '2', item_padrao_id: 'ip12', descricao: 'Amortecedores', km_previsto: 26700, moto_placa: 'BBB1B11', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 30987 }),

  // Vistoria mensal: próxima 13/04/2026
  mkBase({ id: 'kv1',  moto_id: '2', item_padrao_id: 'ip13', tipo: 'vistoria', descricao: 'Vistoria mensal', data_agendada: '2026-04-13', moto_placa: 'BBB1B11', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 30987 }),


  // ── CCC2C22 — Yamaha YS150 FAZER SED (km: 67.908) ─────────────────────────
  // ⚠ ATENÇÃO: pastilha dianteira VENCIDA; amortecedores VENCIDOS

  // Troca de óleo: última em 06/01/2026 @ 67.908 km → próxima: 68.908
  mkBase({ id: 'r_r1', moto_id: '3', item_padrao_id: 'ip1', descricao: 'Troca de óleo', km_previsto: 67908, km_realizado: 67908, data_realizada: '2026-01-06', realizada: true, oficina: 'Oficina do Careca', moto_placa: 'CCC2C22', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 67908 }),
  mkBase({ id: 'r1',   moto_id: '3', item_padrao_id: 'ip1', descricao: 'Troca de óleo', km_previsto: 68908, moto_placa: 'CCC2C22', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 67908 }),

  // Filtro de óleo: próxima @ 68.360 (faltam 452 km — quase no limite)
  mkBase({ id: 'r2',   moto_id: '3', item_padrao_id: 'ip2', descricao: 'Filtro de óleo', km_previsto: 68360, moto_placa: 'CCC2C22', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 67908 }),

  // Relação: trocada em 26/11/2025 @ ~60.000 km → próxima: 72.000
  mkBase({ id: 'r_r2', moto_id: '3', item_padrao_id: 'ip5', descricao: 'Troca da relação (corrente/coroa/pinhão)', km_previsto: 60000, km_realizado: 60000, data_realizada: '2025-11-26', realizada: true, oficina: 'Oficina do Careca', moto_placa: 'CCC2C22', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 67908 }),
  mkBase({ id: 'r3',   moto_id: '3', item_padrao_id: 'ip5', descricao: 'Troca da relação (corrente/coroa/pinhão)', km_previsto: 72000, moto_placa: 'CCC2C22', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 67908 }),

  // Lona de freio traseira: próxima @ 72.360
  mkBase({ id: 'r4',   moto_id: '3', item_padrao_id: 'ip6', descricao: 'Lona de freio traseira', km_previsto: 72360, moto_placa: 'CCC2C22', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 67908 }),

  // Pastilha de freio dianteira: VENCIDA — due @ 55.500, atual 67.908 (+12.408 km atrasado)
  mkBase({ id: 'r5',   moto_id: '3', item_padrao_id: 'ip7', descricao: 'Pastilha de freio dianteira', km_previsto: 55500, moto_placa: 'CCC2C22', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 67908 }),

  // Pneu dianteiro: próxima @ 72.360
  mkBase({ id: 'r6',   moto_id: '3', item_padrao_id: 'ip8', descricao: 'Pneu dianteiro', km_previsto: 72360, moto_placa: 'CCC2C22', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 67908 }),

  // Pneu traseiro: próxima @ 72.360
  mkBase({ id: 'r7',   moto_id: '3', item_padrao_id: 'ip9', descricao: 'Pneu traseiro', km_previsto: 72360, moto_placa: 'CCC2C22', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 67908 }),

  // Filtro de ar: próxima @ 73.360
  mkBase({ id: 'r8',   moto_id: '3', item_padrao_id: 'ip10', descricao: 'Filtro de ar', km_previsto: 73360, moto_placa: 'CCC2C22', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 67908 }),

  // Velas de ignição: próxima @ 74.360
  mkBase({ id: 'r9',   moto_id: '3', item_padrao_id: 'ip11', descricao: 'Velas de ignição', km_previsto: 74360, moto_placa: 'CCC2C22', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 67908 }),

  // Amortecedores: VENCIDA — due @ 49.360, atual 67.908 (+18.548 km atrasado)
  mkBase({ id: 'r10',  moto_id: '3', item_padrao_id: 'ip12', descricao: 'Amortecedores', km_previsto: 49360, moto_placa: 'CCC2C22', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 67908 }),

  // Vistoria mensal: próxima 13/04/2026
  mkBase({ id: 'rv1',  moto_id: '3', item_padrao_id: 'ip13', tipo: 'vistoria', descricao: 'Vistoria mensal', data_agendada: '2026-04-13', moto_placa: 'CCC2C22', moto_modelo: 'Yamaha YS150 FAZER SED', moto_km_atual: 67908 }),


  // ── DDD3D33 — Yamaha YBR150 FACTOR SED (km: 29.282) ──────────────────────
  // ⚠ ATENÇÃO: velas PRÓXIMAS

  // Troca de óleo: última em 09/03/2026 @ 29.282 km → próxima: 30.282
  mkBase({ id: 'f_r1', moto_id: '4', item_padrao_id: 'ip1', descricao: 'Troca de óleo', km_previsto: 29282, km_realizado: 29282, data_realizada: '2026-03-09', realizada: true, oficina: 'Oficina do Careca', moto_placa: 'DDD3D33', moto_modelo: 'Yamaha YBR150 FACTOR SED', moto_km_atual: 29282 }),
  mkBase({ id: 'f1',   moto_id: '4', item_padrao_id: 'ip1', descricao: 'Troca de óleo', km_previsto: 30282, moto_placa: 'DDD3D33', moto_modelo: 'Yamaha YBR150 FACTOR SED', moto_km_atual: 29282 }),

  // Filtro de óleo: próxima @ 31.058
  mkBase({ id: 'f2',   moto_id: '4', item_padrao_id: 'ip2', descricao: 'Filtro de óleo', km_previsto: 31058, moto_placa: 'DDD3D33', moto_modelo: 'Yamaha YBR150 FACTOR SED', moto_km_atual: 29282 }),

  // Relação: trocada em 27/02/2026 @ 27.058 km → próxima: 39.058
  mkBase({ id: 'f_r2', moto_id: '4', item_padrao_id: 'ip5', descricao: 'Troca da relação (corrente/coroa/pinhão)', km_previsto: 27058, km_realizado: 27058, data_realizada: '2026-02-27', realizada: true, oficina: 'Oficina do Careca', moto_placa: 'DDD3D33', moto_modelo: 'Yamaha YBR150 FACTOR SED', moto_km_atual: 29282 }),
  mkBase({ id: 'f3',   moto_id: '4', item_padrao_id: 'ip5', descricao: 'Troca da relação (corrente/coroa/pinhão)', km_previsto: 39058, moto_placa: 'DDD3D33', moto_modelo: 'Yamaha YBR150 FACTOR SED', moto_km_atual: 29282 }),

  // Lona de freio traseira: trocada em 13/02/2026 @ ~25.500 km → próxima: 37.500
  mkBase({ id: 'f_r3', moto_id: '4', item_padrao_id: 'ip6', descricao: 'Lona de freio traseira', km_previsto: 25500, km_realizado: 25500, data_realizada: '2026-02-13', realizada: true, oficina: 'Oficina do Careca', moto_placa: 'DDD3D33', moto_modelo: 'Yamaha YBR150 FACTOR SED', moto_km_atual: 29282 }),
  mkBase({ id: 'f4',   moto_id: '4', item_padrao_id: 'ip6', descricao: 'Lona de freio traseira', km_previsto: 37500, moto_placa: 'DDD3D33', moto_modelo: 'Yamaha YBR150 FACTOR SED', moto_km_atual: 29282 }),

  // Pastilha de freio dianteira: próxima @ 35.750
  mkBase({ id: 'f5',   moto_id: '4', item_padrao_id: 'ip7', descricao: 'Pastilha de freio dianteira', km_previsto: 35750, moto_placa: 'DDD3D33', moto_modelo: 'Yamaha YBR150 FACTOR SED', moto_km_atual: 29282 }),

  // Pneu dianteiro: próxima @ 31.750
  mkBase({ id: 'f6',   moto_id: '4', item_padrao_id: 'ip8', descricao: 'Pneu dianteiro', km_previsto: 31750, moto_placa: 'DDD3D33', moto_modelo: 'Yamaha YBR150 FACTOR SED', moto_km_atual: 29282 }),

  // Pneu traseiro: próxima @ 35.750
  mkBase({ id: 'f7',   moto_id: '4', item_padrao_id: 'ip9', descricao: 'Pneu traseiro', km_previsto: 35750, moto_placa: 'DDD3D33', moto_modelo: 'Yamaha YBR150 FACTOR SED', moto_km_atual: 29282 }),

  // Filtro de ar: próxima @ 33.750
  mkBase({ id: 'f8',   moto_id: '4', item_padrao_id: 'ip10', descricao: 'Filtro de ar', km_previsto: 33750, moto_placa: 'DDD3D33', moto_modelo: 'Yamaha YBR150 FACTOR SED', moto_km_atual: 29282 }),

  // Velas de ignição: PRÓXIMA — faltam apenas 468 km (alerta: 1.000 km)
  mkBase({ id: 'f9',   moto_id: '4', item_padrao_id: 'ip11', descricao: 'Velas de ignição', km_previsto: 29750, moto_placa: 'DDD3D33', moto_modelo: 'Yamaha YBR150 FACTOR SED', moto_km_atual: 29282 }),

  // Amortecedores: próxima @ 44.750 (comprada a ~19.750 km)
  mkBase({ id: 'f10',  moto_id: '4', item_padrao_id: 'ip12', descricao: 'Amortecedores', km_previsto: 44750, moto_placa: 'DDD3D33', moto_modelo: 'Yamaha YBR150 FACTOR SED', moto_km_atual: 29282 }),

  // Vistoria mensal: próxima 13/04/2026
  mkBase({ id: 'fv1',  moto_id: '4', item_padrao_id: 'ip13', tipo: 'vistoria', descricao: 'Vistoria mensal', data_agendada: '2026-04-13', moto_placa: 'DDD3D33', moto_modelo: 'Yamaha YBR150 FACTOR SED', moto_km_atual: 29282 }),
]

// ─── helpers ──────────────────────────────────────────────────────────────────

const HOJE = new Date('2026-03-14')

// Média de uso dos clientes: ~1.000 km/semana (varia entre 800–1.200 km/semana).
// Usado para converter distância em km para dias e comparar manutenções km-based vs date-based.
const KM_POR_SEMANA = 1000
const KM_POR_DIA = KM_POR_SEMANA / 7 // ≈ 143 km/dia

function calcularStatus(item: ManutencaoItem): ManutencaoStatus {
  if (item.realizada) return 'realizada'

  const padrao = ITENS_PADRAO.find((p) => p.id === item.item_padrao_id)

  // baseado em data (vistoria)
  if (item.data_agendada && !padrao?.intervalo_km) {
    const data = new Date(item.data_agendada)
    const diffDias = Math.floor((data.getTime() - HOJE.getTime()) / 86400000)
    if (diffDias < 0) return 'vencida'
    if (diffDias <= 3) return 'proxima'
    return 'agendada'
  }

  // baseado em km
  if (item.km_previsto !== null) {
    const intervalo = padrao?.intervalo_km ?? 1000
    const alertaKm = Math.floor(intervalo * 0.1)
    if (item.moto_km_atual >= item.km_previsto) return 'vencida'
    if (item.moto_km_atual >= item.km_previsto - alertaKm) return 'proxima'
    return 'agendada'
  }

  return 'agendada'
}

function statusOrder(s: ManutencaoStatus) {
  return { vencida: 0, proxima: 1, agendada: 2, realizada: 3 }[s]
}

function fmtKm(km: number) {
  return km.toLocaleString('pt-BR') + ' km'
}

function diffKm(item: ManutencaoItem) {
  if (!item.km_previsto) return null
  return item.km_previsto - item.moto_km_atual
}

function diffDias(item: ManutencaoItem) {
  if (!item.data_agendada) return null
  const data = new Date(item.data_agendada)
  return Math.floor((data.getTime() - HOJE.getTime()) / 86400000)
}

// ─── badge de status ──────────────────────────────────────────────────────────

function BadgeStatus({ status }: { status: ManutencaoStatus }) {
  const map: Record<ManutencaoStatus, { label: string; cls: string }> = {
    vencida:  { label: 'Vencida',  cls: 'bg-red-500/15 text-red-400 border-red-500/25' },
    proxima:  { label: 'Próxima',  cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
    agendada: { label: 'Agendada', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
    realizada:{ label: 'Realizada',cls: 'bg-green-500/15 text-green-400 border-green-500/25' },
  }
  const b = map[status]
  return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${b.cls}`}>{b.label}</span>
}

function BadgeTipo({ tipo }: { tipo: 'preventiva' | 'corretiva' | 'vistoria' }) {
  const map = {
    preventiva: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    corretiva:  'bg-orange-500/10 text-orange-400 border-orange-500/20',
    vistoria:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border capitalize ${map[tipo]}`}>
      {tipo}
    </span>
  )
}

// ─── formulários padrão ───────────────────────────────────────────────────────

const defaultRegistro = {
  // etapa 1 — dados técnicos
  etapa: 1 as 1 | 2,
  km_realizado: '',
  oficina: 'Oficina do Careca',
  observacoes: '',
  itensExtras: [] as string[],
  // etapa 2 — dados financeiros por item (inicializado ao avançar para etapa 2)
  itensFinanceiros: [] as ItemFinanceiro[],
  desconto_confirmado: false, // confirmação explícita para descontar na cobrança (caso 50/50)
}

const defaultNova = {
  moto_id: '',
  item_padrao_id: '',
  tipo: 'preventiva' as 'preventiva' | 'corretiva' | 'vistoria',
  descricao: '',
  km_previsto: '',
  data_agendada: '',
  observacoes: '',
}

const defaultAtualizarKm = { moto_id: '', km_atual: '' }

// ─── componente principal ─────────────────────────────────────────────────────

export default function ManutencaoPage() {
  const [motos, setMotos] = useState<MotoComKm[]>(mockMotosInit)
  const [manutencoes, setManutencoes] = useState<ManutencaoItem[]>(mockManutencoesInit)

  // filtros
  const [filtroStatus, setFiltroStatus] = useState<string>('todas')
  const [filtroMoto, setFiltroMoto] = useState('')
  const [busca, setBusca] = useState('')

  // modais
  const [registrandoItem, setRegistrandoItem] = useState<ManutencaoItem | null>(null)
  const [formRegistro, setFormRegistro] = useState(defaultRegistro)

  const [modalNovaOpen, setModalNovaOpen] = useState(false)
  const [formNova, setFormNova] = useState(defaultNova)

  const [modalKmOpen, setModalKmOpen] = useState(false)
  const [formKm, setFormKm] = useState(defaultAtualizarKm)

  const [excluindo, setExcluindo] = useState<ManutencaoItem | null>(null)
  const [detalhe, setDetalhe] = useState<ManutencaoItem | null>(null)

  // histórico por moto (colapsado por padrão)
  const [historyMotos, setHistoryMotos] = useState<Set<string>>(new Set())
  function toggleHistory(id: string) {
    setHistoryMotos((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── computed ────────────────────────────────────────────────────────────────

  const comStatus = useMemo(() =>
    manutencoes.map((m) => {
      const moto = motos.find((mo) => mo.id === m.moto_id)
      const kmAtual = moto?.km_atual ?? m.moto_km_atual
      const mAtual = { ...m, moto_km_atual: kmAtual }
      return { ...mAtual, _status: calcularStatus(mAtual) }
    }),
    [manutencoes, motos]
  )

  const filtrado = useMemo(() => {
    return comStatus
      .filter((m) => {
        if (filtroStatus !== 'todas' && m._status !== filtroStatus) return false
        if (filtroMoto && m.moto_id !== filtroMoto) return false
        if (busca) {
          const b = busca.toLowerCase()
          if (![m.moto_placa, m.moto_modelo, m.descricao, m.observacoes].some((v) => v?.toLowerCase().includes(b))) return false
        }
        return true
      })
      .sort((a, b) => statusOrder(a._status) - statusOrder(b._status))
  }, [comStatus, filtroStatus, filtroMoto, busca])

  // ── agrupamento por moto ────────────────────────────────────────────────────

  type ManutencaoComStatus = ManutencaoItem & { _status: ManutencaoStatus }

  const porMoto = useMemo(() => {
    const map = new Map<string, { moto: MotoComKm; itens: ManutencaoComStatus[] }>()
    filtrado.forEach((item) => {
      if (!map.has(item.moto_id)) {
        const moto = motos.find((m) => m.id === item.moto_id) ?? {
          id: item.moto_id, placa: item.moto_placa, modelo: item.moto_modelo, km_atual: item.moto_km_atual,
        }
        map.set(item.moto_id, { moto, itens: [] })
      }
      map.get(item.moto_id)!.itens.push(item)
    })
    return Array.from(map.values()).sort((a, b) => {
      const pior = (itens: ManutencaoComStatus[]) =>
        itens.some((i) => i._status === 'vencida') ? 0
        : itens.some((i) => i._status === 'proxima') ? 1
        : itens.some((i) => i._status === 'agendada') ? 2
        : 3
      return pior(a.itens) - pior(b.itens)
    })
  }, [filtrado, motos])

  // por padrão todas as motos começam expandidas; quando o usuário clica, entra no set de colapsadas
  const [collapsedMotos, setCollapsedMotos] = useState<Set<string>>(new Set())
  function toggleMoto(id: string) {
    setCollapsedMotos((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totVencidas  = comStatus.filter((m) => m._status === 'vencida').length
  const totProximas  = comStatus.filter((m) => m._status === 'proxima').length
  const totAgendadas = comStatus.filter((m) => m._status === 'agendada').length
  const totMes = comStatus.filter((m) => {
    if (!m.data_realizada) return false
    const d = new Date(m.data_realizada)
    return d.getFullYear() === HOJE.getFullYear() && d.getMonth() === HOJE.getMonth()
  }).length

  // ── tabs ────────────────────────────────────────────────────────────────────

  const tabs = [
    { value: 'todas',    label: 'Todas',    count: comStatus.length },
    { value: 'vencida',  label: 'Vencidas', count: totVencidas },
    { value: 'proxima',  label: 'Próximas', count: totProximas },
    { value: 'agendada', label: 'Agendadas',count: totAgendadas },
    { value: 'realizada',label: 'Realizadas', count: comStatus.filter(m => m.realizada).length },
  ]

  // ── ações ───────────────────────────────────────────────────────────────────

  function abrirRegistro(item: ManutencaoItem) {
    setRegistrandoItem(item)
    setFormRegistro({ ...defaultRegistro, km_realizado: item.moto_km_atual ? String(item.moto_km_atual) : '' })
  }

  // helper: registra um item como realizado e agenda o próximo
  function registrarItem(
    lista: ManutencaoItem[],
    item: ManutencaoItem,
    kmReal: number,
    hoje: string,
    oficina: string,
    observacoes: string,
    temFotoOdometro: boolean,
    temFotoNf: boolean,
    custo: number | null,
    seed: number,
  ) {
    const padrao = ITENS_PADRAO.find((p) => p.id === item.item_padrao_id)
    const idx = lista.findIndex((m) => m.id === item.id)
    if (idx !== -1) {
      lista[idx] = {
        ...lista[idx],
        realizada: true,
        km_realizado: kmReal,
        data_realizada: hoje,
        custo,
        oficina,
        observacoes: observacoes || lista[idx].observacoes,
        foto_odometro_url: temFotoOdometro ? 'foto_odometro.jpg' : lista[idx].foto_odometro_url,
        foto_nota_fiscal_url: temFotoNf ? 'nota_fiscal.jpg' : lista[idx].foto_nota_fiscal_url,
      }
    }
    // auto-agenda próxima (km-based)
    if (padrao?.intervalo_km) {
      lista.push({
        ...item,
        id: String(Date.now() + seed),
        realizada: false,
        km_previsto: kmReal + padrao.intervalo_km,
        km_realizado: null,
        data_realizada: null,
        custo: null,
        oficina: null,
        foto_odometro_url: null,
        foto_nota_fiscal_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
    // auto-agenda próxima vistoria (30 dias)
    if (padrao?.intervalo_dias) {
      const proxData = new Date(HOJE)
      proxData.setDate(proxData.getDate() + padrao.intervalo_dias)
      lista.push({
        ...item,
        id: String(Date.now() + seed + 1),
        realizada: false,
        km_previsto: null,
        km_realizado: null,
        data_agendada: proxData.toISOString().split('T')[0],
        data_realizada: null,
        custo: null,
        oficina: null,
        foto_odometro_url: null,
        foto_nota_fiscal_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }

  function confirmarRegistro() {
    if (!registrandoItem) return
    const kmReal = parseInt(formRegistro.km_realizado) || 0
    const hoje   = HOJE.toISOString().split('T')[0]
    const motoContrato = motos.find((m) => m.id === registrandoItem.moto_id)?.contrato

    // ── TODO: substituir console.log por chamadas Supabase ao integrar ───────
    // Para cada item: criar despesa e (se 50/50 confirmado) atualizar cobrança
    const todosItensLog: ManutencaoItem[] = [
      registrandoItem,
      ...formRegistro.itensExtras
        .map((id) => { /* acesso read-only ao prev não disponível aqui; usamos estado direto */ return manutencoes.find((m) => m.id === id) })
        .filter((m): m is ManutencaoItem => !!m),
    ]
    todosItensLog.forEach((item) => {
      const fin = formRegistro.itensFinanceiros.find((f) => f.id === item.id)
      const v = parseFloat(fin?.valor.replace(',', '.') ?? '0') || 0
      if (v <= 0) return
      const r = fin?.resp ?? 'empresa' // usa a seleção manual do usuário
      const descr = `Manutenção — ${item.descricao} (${item.moto_placa})`
      if (r === 'empresa') {
        console.log('[DESPESA] categoria=Manutenção | valor=', v, '| descrição=', descr, '| forma=Caixa da empresa')
      } else if (r === 'cliente') {
        console.log('[DESPESA] categoria=Manutenção | valor=', v, '| descrição=', descr, '| forma=Pago pelo cliente')
      } else {
        console.log('[DESPESA] categoria=Manutenção | valor empresa=', v / 2, '| descrição=', descr)
        if (formRegistro.desconto_confirmado && motoContrato) {
          console.log('[COBRANÇA] desconto=', v / 2, '| cliente=', motoContrato.cliente_nome, '| semana=', motoContrato.cobranca_proxima)
        }
      }
    })

    setManutencoes((prev) => {
      const atualizado = [...prev]

      // registra o item principal com seu custo individual
      const finPrincipal = formRegistro.itensFinanceiros.find((f) => f.id === registrandoItem.id)
      const custoPrincipal = parseFloat(finPrincipal?.valor.replace(',', '.') ?? '0') || null
      registrarItem(
        atualizado, registrandoItem, kmReal, hoje,
        formRegistro.oficina, formRegistro.observacoes,
        finPrincipal?.tem_foto_odometro ?? false,
        finPrincipal?.tem_foto_nf ?? false,
        custoPrincipal, 0,
      )

      // registra itens extras com custo e fotos individuais
      formRegistro.itensExtras.forEach((extraId, i) => {
        const extraItem = prev.find((m) => m.id === extraId)
        if (!extraItem) return
        const finExtra = formRegistro.itensFinanceiros.find((f) => f.id === extraId)
        const custoExtra = parseFloat(finExtra?.valor.replace(',', '.') ?? '0') || null
        registrarItem(
          atualizado, extraItem, kmReal, hoje,
          formRegistro.oficina, '',
          finExtra?.tem_foto_odometro ?? false,
          finExtra?.tem_foto_nf ?? false,
          custoExtra, (i + 1) * 100,
        )
      })

      return atualizado
    })

    // atualiza km_atual da moto
    if (kmReal > 0) {
      setMotos((prev) =>
        prev.map((mo) =>
          mo.id === registrandoItem.moto_id && kmReal > mo.km_atual
            ? { ...mo, km_atual: kmReal }
            : mo
        )
      )
    }

    setRegistrandoItem(null)
    setFormRegistro(defaultRegistro)
  }

  function handleNovaManu(e: React.FormEvent) {
    e.preventDefault()
    const moto = motos.find((m) => m.id === formNova.moto_id)
    if (!moto) return
    const padrao = ITENS_PADRAO.find((p) => p.id === formNova.item_padrao_id)
    const nova: ManutencaoItem = {
      id: String(Date.now()),
      moto_id: formNova.moto_id,
      item_padrao_id: formNova.item_padrao_id || null,
      tipo: padrao?.tipo ?? formNova.tipo,
      descricao: formNova.descricao || padrao?.nome || '',
      km_previsto: formNova.km_previsto ? parseInt(formNova.km_previsto) : null,
      km_realizado: null,
      data_agendada: formNova.data_agendada || null,
      data_realizada: null,
      custo: null,
      realizada: false,
      oficina: null,
      foto_odometro_url: null,
      foto_nota_fiscal_url: null,
      observacoes: formNova.observacoes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      moto_placa: moto.placa,
      moto_modelo: moto.modelo,
      moto_km_atual: moto.km_atual,
    }
    setManutencoes((prev) => [nova, ...prev])
    setFormNova(defaultNova)
    setModalNovaOpen(false)
  }

  function handleAtualizarKm(e: React.FormEvent) {
    e.preventDefault()
    const km = parseInt(formKm.km_atual)
    if (!formKm.moto_id || !km) return
    setMotos((prev) =>
      prev.map((m) => m.id === formKm.moto_id ? { ...m, km_atual: km } : m)
    )
    setManutencoes((prev) =>
      prev.map((m) => m.moto_id === formKm.moto_id ? { ...m, moto_km_atual: km } : m)
    )
    setFormKm(defaultAtualizarKm)
    setModalKmOpen(false)
  }

  function confirmarExclusao() {
    if (!excluindo) return
    setManutencoes((prev) => prev.filter((m) => m.id !== excluindo.id))
    setExcluindo(null)
  }

  // ── colunas tabela pendentes (mantidas para referência / uso futuro) ────────

  const colsPendentes = [
    {
      key: 'moto',
      header: 'Moto',
      render: (row: ManutencaoComStatus) => (
        <div>
          <p className="font-mono text-sm font-semibold text-white">{row.moto_placa}</p>
          <p className="text-xs text-[#A0A0A0]">{row.moto_modelo}</p>
        </div>
      ),
    },
    {
      key: 'item',
      header: 'Item',
      render: (row: ManutencaoComStatus) => (
        <div className="max-w-[200px]">
          <p className="text-white text-sm">{row.descricao}</p>
          <BadgeTipo tipo={row.tipo} />
        </div>
      ),
    },
    {
      key: 'previsao',
      header: 'Previsão',
      render: (row: ManutencaoComStatus) => {
        if (row.km_previsto !== null) {
          return (
            <div>
              <p className="text-white text-sm">{fmtKm(row.km_previsto)}</p>
              <p className="text-xs text-[#A0A0A0]">Atual: {fmtKm(row.moto_km_atual)}</p>
            </div>
          )
        }
        if (row.data_agendada) {
          return (
            <div>
              <p className="text-white text-sm">{formatDate(row.data_agendada)}</p>
              <p className="text-xs text-[#A0A0A0]">Vistoria mensal</p>
            </div>
          )
        }
        return <span className="text-[#A0A0A0]">—</span>
      },
    },
    {
      key: 'faltam',
      header: 'Situação',
      render: (row: ManutencaoComStatus) => {
        const km = diffKm(row)
        const dias = diffDias(row)
        if (km !== null) {
          if (km <= 0) return <span className="text-red-400 text-sm font-medium">Vencida há {fmtKm(Math.abs(km))}</span>
          return <span className={`text-sm font-medium ${km <= 100 ? 'text-amber-400' : 'text-[#A0A0A0]'}`}>Faltam {fmtKm(km)}</span>
        }
        if (dias !== null) {
          if (dias < 0) return <span className="text-red-400 text-sm font-medium">Vencida há {Math.abs(dias)} dias</span>
          if (dias === 0) return <span className="text-amber-400 text-sm font-medium">Vence hoje</span>
          return <span className={`text-sm font-medium ${dias <= 3 ? 'text-amber-400' : 'text-[#A0A0A0]'}`}>Em {dias} dias</span>
        }
        return <span className="text-[#A0A0A0]">—</span>
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: ManutencaoComStatus) => <BadgeStatus status={row._status} />,
    },
    {
      key: 'acoes',
      header: 'Ações',
      render: (row: ManutencaoComStatus) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            onClick={() => abrirRegistro(row)}
            className="text-xs px-2 py-1 h-auto text-[#BAFF1A] hover:bg-[#BAFF1A]/10"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Registrar
          </Button>
          <button
            onClick={() => setExcluindo(row)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  const colsRealizadas = [
    {
      key: 'moto',
      header: 'Moto',
      render: (row: ManutencaoComStatus) => (
        <div>
          <p className="font-mono text-sm font-semibold text-white">{row.moto_placa}</p>
          <p className="text-xs text-[#A0A0A0]">{row.moto_modelo}</p>
        </div>
      ),
    },
    {
      key: 'item',
      header: 'Item',
      render: (row: ManutencaoComStatus) => (
        <div>
          <p className="text-white text-sm">{row.descricao}</p>
          <BadgeTipo tipo={row.tipo} />
        </div>
      ),
    },
    {
      key: 'km_realizado',
      header: 'KM Realizado',
      render: (row: ManutencaoComStatus) => (
        <span className="text-white text-sm">
          {row.km_realizado !== null ? fmtKm(row.km_realizado) : '—'}
        </span>
      ),
    },
    {
      key: 'data',
      header: 'Data',
      render: (row: ManutencaoComStatus) => (
        <span>{row.data_realizada ? formatDate(row.data_realizada) : '—'}</span>
      ),
    },
    {
      key: 'oficina',
      header: 'Oficina',
      render: (row: ManutencaoComStatus) => (
        <span className="text-sm text-[#A0A0A0]">{row.oficina ?? '—'}</span>
      ),
    },
    {
      key: 'fotos',
      header: 'Docs',
      render: (row: ManutencaoComStatus) => (
        <div className="flex gap-1">
          {row.foto_odometro_url
            ? <span title="Odômetro" className="text-green-400"><Camera className="w-4 h-4" /></span>
            : <span title="Sem foto odômetro" className="text-[#333333]"><Camera className="w-4 h-4" /></span>}
          {row.foto_nota_fiscal_url
            ? <span title="Nota fiscal" className="text-green-400"><FileText className="w-4 h-4" /></span>
            : <span title="Sem nota fiscal" className="text-[#333333]"><FileText className="w-4 h-4" /></span>}
        </div>
      ),
    },
    {
      key: 'acoes',
      header: '',
      render: (row: ManutencaoComStatus) => (
        <div className="flex gap-1">
          <button
            onClick={() => setDetalhe(row)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
            title="Ver detalhes"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExcluindo(row)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  // ── colunas unificadas (usadas nas sub-tabelas agrupadas) ───────────────────

  const colsUnificadas = [
    {
      key: 'item',
      header: 'Item',
      render: (row: ManutencaoComStatus) => (
        <div className="max-w-[180px]">
          <p className="text-white text-sm">{row.descricao}</p>
          <BadgeTipo tipo={row.tipo} />
        </div>
      ),
    },
    {
      key: 'previsao',
      header: 'Previsão / Realizado',
      render: (row: ManutencaoComStatus) => {
        if (row.realizada) {
          return (
            <div>
              <p className="text-white text-sm">{row.km_realizado !== null ? fmtKm(row.km_realizado) : '—'}</p>
              {row.data_realizada && <p className="text-xs text-[#A0A0A0]">{formatDate(row.data_realizada)}</p>}
            </div>
          )
        }
        if (row.km_previsto !== null) {
          return (
            <div>
              <p className="text-white text-sm">{fmtKm(row.km_previsto)}</p>
              <p className="text-xs text-[#A0A0A0]">Atual: {fmtKm(row.moto_km_atual)}</p>
            </div>
          )
        }
        if (row.data_agendada) return <p className="text-white text-sm">{formatDate(row.data_agendada)}</p>
        return <span className="text-[#A0A0A0]">—</span>
      },
    },
    {
      key: 'situacao',
      header: 'Situação',
      render: (row: ManutencaoComStatus) => {
        if (row.realizada) return <span className="text-xs text-[#A0A0A0]">{row.oficina ?? '—'}</span>
        const km = diffKm(row)
        const dias = diffDias(row)
        if (km !== null) {
          if (km <= 0) return <span className="text-red-400 text-sm font-medium">Vencida há {fmtKm(Math.abs(km))}</span>
          return <span className={`text-sm font-medium ${km <= 100 ? 'text-amber-400' : 'text-[#A0A0A0]'}`}>Faltam {fmtKm(km)}</span>
        }
        if (dias !== null) {
          if (dias < 0) return <span className="text-red-400 text-sm font-medium">Vencida há {Math.abs(dias)} dias</span>
          if (dias === 0) return <span className="text-amber-400 text-sm font-medium">Vence hoje</span>
          return <span className={`text-sm font-medium ${dias <= 3 ? 'text-amber-400' : 'text-[#A0A0A0]'}`}>Em {dias} dias</span>
        }
        return <span className="text-[#A0A0A0]">—</span>
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: ManutencaoComStatus) => <BadgeStatus status={row._status} />,
    },
    {
      key: 'docs',
      header: 'Docs',
      render: (row: ManutencaoComStatus) => row.realizada ? (
        <div className="flex gap-1">
          <span title="Odômetro" className={row.foto_odometro_url ? 'text-green-400' : 'text-[#333333]'}><Camera className="w-4 h-4" /></span>
          <span title="Nota fiscal" className={row.foto_nota_fiscal_url ? 'text-green-400' : 'text-[#333333]'}><FileText className="w-4 h-4" /></span>
        </div>
      ) : <span className="text-[#333333]">—</span>,
    },
    {
      key: 'acoes',
      header: '',
      render: (row: ManutencaoComStatus) => (
        <div className="flex items-center gap-1">
          {!row.realizada && (
            <Button
              variant="ghost"
              onClick={() => abrirRegistro(row)}
              className="text-xs px-2 py-1 h-auto text-[#BAFF1A] hover:bg-[#BAFF1A]/10"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Registrar
            </Button>
          )}
          {row.realizada && (
            <button
              onClick={() => setDetalhe(row)}
              className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
              title="Ver detalhes"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setExcluindo(row)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  const motoOptions = [
    { value: '', label: 'Todas as motos' },
    ...motos.map((m) => ({ value: m.id, label: `${m.placa} — ${m.modelo}` })),
  ]

  const motoSelectOptions = [
    { value: '', label: 'Selecione a moto' },
    ...motos.map((m) => ({ value: m.id, label: `${m.placa} — ${m.modelo}` })),
  ]

  const itemSelectOptions = [
    { value: '', label: 'Selecione o item (ou deixe vazio p/ corretiva livre)' },
    ...ITENS_PADRAO.map((p) => ({ value: p.id, label: p.nome })),
  ]

  const padraoSelecionado = ITENS_PADRAO.find((p) => p.id === formNova.item_padrao_id)

  // ─── render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Manutenção"
        subtitle="Controle inteligente por km e data"
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => { setFormKm(defaultAtualizarKm); setModalKmOpen(true) }}>
              <Gauge className="w-4 h-4" />
              Atualizar KM
            </Button>
            <Button onClick={() => { setFormNova(defaultNova); setModalNovaOpen(true) }}>
              <Plus className="w-4 h-4" />
              Nova Manutenção
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-5">

        {/* ── Cards de resumo ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Vencidas</p>
            </div>
            <p className="text-2xl font-bold text-red-400">{totVencidas}</p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-400" />
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Próximas</p>
            </div>
            <p className="text-2xl font-bold text-amber-400">{totProximas}</p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Agendadas</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">{totAgendadas}</p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Realizadas este mês</p>
            </div>
            <p className="text-2xl font-bold text-green-400">{totMes}</p>
          </Card>
        </div>

        {/* ── Filtros ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
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
                {tab.count > 0 && (
                  <span className="ml-1.5 opacity-70">({tab.count})</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={filtroMoto}
              onChange={(e) => setFiltroMoto(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#202020] border border-[#333333] text-sm text-white focus:outline-none focus:border-[#555555] appearance-none cursor-pointer"
            >
              {motoOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
              <input
                type="text"
                placeholder="Buscar item ou moto..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-lg bg-[#202020] border border-[#333333] text-sm text-white placeholder-[#A0A0A0] focus:outline-none focus:border-[#555555] w-56"
              />
            </div>
          </div>
        </div>

        {/* ── Agrupado por moto (expansível) ──────────────────────────────── */}
        {porMoto.length === 0 ? (
          <Card>
            <p className="text-center text-[#A0A0A0] py-8">Nenhuma manutenção encontrada para os filtros selecionados.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {porMoto.map(({ moto, itens }) => {
              // Na tab "Realizadas" mostra tudo; nas demais, separa pendentes do histórico
              const mostraRealizadasDireto = filtroStatus === 'realizada'
              const itensPendentes  = mostraRealizadasDireto ? itens : itens.filter((i) => !i.realizada)
              const itensRealizadas = itens.filter((i) => i.realizada)

              const nVencidas  = itensPendentes.filter((i) => i._status === 'vencida').length
              const nProximas  = itensPendentes.filter((i) => i._status === 'proxima').length
              const nAgendadas = itensPendentes.filter((i) => i._status === 'agendada').length
              const semaforo   = nVencidas > 0 ? 'red' : nProximas > 0 ? 'amber' : 'green'
              const expanded      = !collapsedMotos.has(moto.id)
              const histExpanded  = historyMotos.has(moto.id)

              return (
                <Card key={moto.id} padding="none">
                  {/* cabeçalho da moto */}
                  <button
                    onClick={() => toggleMoto(moto.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
                  >
                    <ChevronDown
                      className={`w-4 h-4 text-[#555555] shrink-0 transition-transform duration-150 ${expanded ? '' : '-rotate-90'}`}
                    />
                    {/* semáforo (baseado apenas em pendentes) */}
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      semaforo === 'red' ? 'bg-red-400' : semaforo === 'amber' ? 'bg-amber-400' : 'bg-green-400'
                    }`} />
                    {/* identidade */}
                    <span className="font-mono font-bold text-white text-sm">{moto.placa}</span>
                    <span className="text-sm text-[#A0A0A0]">{moto.modelo}</span>
                    <span className="text-xs text-[#555555]">· {fmtKm(moto.km_atual)}</span>
                    {/* badges de pendentes */}
                    <div className="ml-auto flex items-center gap-1.5">
                      {nVencidas > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/25">
                          {nVencidas} vencida{nVencidas > 1 ? 's' : ''}
                        </span>
                      )}
                      {nProximas > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/25">
                          {nProximas} próxima{nProximas > 1 ? 's' : ''}
                        </span>
                      )}
                      {nAgendadas > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/25">
                          {nAgendadas} agendada{nAgendadas > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* itens expandidos */}
                  {expanded && (
                    <div className="border-t border-[#2A2A2A]">
                      {/* tabela de pendentes (ou realizadas se tab ativa) */}
                      {itensPendentes.length > 0 ? (
                        <Table
                          columns={colsUnificadas}
                          data={itensPendentes}
                          keyExtractor={(r) => r.id}
                          emptyMessage="Sem itens"
                        />
                      ) : !mostraRealizadasDireto ? (
                        <p className="text-center text-[#555555] py-5 text-sm">Todas as manutenções em dia.</p>
                      ) : null}

                      {/* toggle de histórico — só nas tabs que não são "Realizadas" */}
                      {!mostraRealizadasDireto && itensRealizadas.length > 0 && (
                        <div className={itensPendentes.length > 0 ? 'border-t border-[#2A2A2A]' : ''}>
                          <button
                            onClick={() => toggleHistory(moto.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#555555] hover:text-[#A0A0A0] transition-colors"
                          >
                            <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${histExpanded ? '' : '-rotate-90'}`} />
                            {histExpanded
                              ? 'Ocultar histórico'
                              : `Ver histórico (${itensRealizadas.length} realizada${itensRealizadas.length > 1 ? 's' : ''})`}
                          </button>
                          {histExpanded && (
                            <div className="border-t border-[#1E1E1E]">
                              <Table
                                columns={colsUnificadas}
                                data={itensRealizadas.slice(-5).reverse()}
                                keyExtractor={(r) => r.id}
                                emptyMessage="Sem histórico"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Modal: Registrar Realização ───────────────────────────────────── */}
      <Modal
        open={!!registrandoItem}
        onClose={() => setRegistrandoItem(null)}
        title="Registrar Manutenção Realizada"
        size="lg"
      >
        {/* ── Etapa 1: Dados Técnicos ────────────────────────────────────────── */}
        {registrandoItem && formRegistro.etapa === 1 && (
          <div className="space-y-3">
            {/* info do item */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-3 space-y-1">
              <p className="text-white font-medium">{registrandoItem.descricao}</p>
              <p className="text-xs text-[#A0A0A0]">{registrandoItem.moto_placa} — {registrandoItem.moto_modelo}</p>
              {registrandoItem.km_previsto && (
                <p className="text-xs text-amber-400">KM previsto: {fmtKm(registrandoItem.km_previsto)}</p>
              )}
              {registrandoItem.data_agendada && (
                <p className="text-xs text-amber-400">Data prevista: {formatDate(registrandoItem.data_agendada)}</p>
              )}
              {(() => {
                const p = ITENS_PADRAO.find((ip) => ip.id === registrandoItem.item_padrao_id)
                return p?.dica ? <p className="text-xs text-[#666666] mt-1 italic">{p.dica}</p> : null
              })()}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="KM do Odômetro *"
                type="number"
                placeholder={String(registrandoItem.moto_km_atual)}
                value={formRegistro.km_realizado}
                onChange={(e) => setFormRegistro({ ...formRegistro, km_realizado: e.target.value })}
                required
              />
              <Input
                label="Oficina"
                value={formRegistro.oficina}
                onChange={(e) => setFormRegistro({ ...formRegistro, oficina: e.target.value })}
              />
            </div>

            <Textarea
              label="Observações"
              rows={1}
              value={formRegistro.observacoes}
              onChange={(e) => setFormRegistro({ ...formRegistro, observacoes: e.target.value })}
            />

            {(() => {
              const kmReal = parseInt(formRegistro.km_realizado) || registrandoItem.moto_km_atual
              const padrao = ITENS_PADRAO.find((ip) => ip.id === registrandoItem.item_padrao_id)

              // próximo deste item
              const proxKmItem = padrao?.intervalo_km ? kmReal + padrao.intervalo_km : null
              const proxDataItem = padrao?.intervalo_dias
                ? (() => { const d = new Date(HOJE); d.setDate(d.getDate() + padrao.intervalo_dias!); return d.toISOString().split('T')[0] })()
                : null

              // outros pendentes desta moto (vencidos ou próximos) → sugerir juntar
              const sugeridos = comStatus.filter(
                (m) => m.moto_id === registrandoItem.moto_id
                  && !m.realizada
                  && m.id !== registrandoItem.id
                  && (m._status === 'vencida' || m._status === 'proxima')
              )

              // helper: "A, B e C"
              function joinNomes(nomes: string[]) {
                if (nomes.length === 0) return ''
                if (nomes.length === 1) return nomes[0]
                return nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1]
              }

              // converte km em dias estimados usando a taxa média de uso da frota
              function kmEmDias(km: number) { return km / KM_POR_DIA }

              // IDs dos itens que serão feitos nesta operação (este item + extras marcados)
              const idsSendoFeitos = new Set([registrandoItem.id, ...formRegistro.itensExtras])

              // sugeridos: split entre marcados (serão feitos) e pendentes (ficam em aberto)
              const sugeridosChecked = sugeridos.filter((m) => formRegistro.itensExtras.includes(m.id))
              const sugeridosPending = sugeridos.filter((m) => !formRegistro.itensExtras.includes(m.id))

              // vencidos que NÃO serão feitos agora → próxima visita é "imediata"
              const vencidasRestantes = sugeridosPending.filter((m) => m._status === 'vencida')

              // todos os itens pendentes desta moto (não sendo feitos agora)
              const todosPendentes = comStatus.filter(
                (m) => m.moto_id === registrandoItem.moto_id && !m.realizada && !idsSendoFeitos.has(m.id)
              )

              // ── candidatos para "próxima visita" ─────────────────────────────────
              // Regra: itens sendo feitos → usa kmReal + intervalo (próximo ciclo)
              //        itens pendentes restantes → usa km_previsto/data atual deles
              type Cand = { km: number | null; dias: number | null; nome: string }
              const candidatos: Cand[] = []

              // próximo ciclo deste item (sendo feito agora)
              if (proxKmItem)   candidatos.push({ km: proxKmItem, dias: null, nome: padrao!.nome })
              if (proxDataItem) candidatos.push({ km: null, dias: 30, nome: padrao!.nome })

              // próximo ciclo dos extras marcados (sendo feitos agora)
              sugeridosChecked.forEach((m) => {
                const p = ITENS_PADRAO.find((ip) => ip.id === m.item_padrao_id)
                if (p?.intervalo_km)  candidatos.push({ km: kmReal + p.intervalo_km, dias: null, nome: m.descricao })
                if (p?.intervalo_dias) candidatos.push({ km: null, dias: p.intervalo_dias, nome: m.descricao })
              })

              // itens que FICAM pendentes → usam seu km_previsto/data atual (podem ser mais próximos!)
              todosPendentes.forEach((m) => {
                if (m.km_previsto !== null && m.km_previsto > kmReal) {
                  candidatos.push({ km: m.km_previsto, dias: null, nome: m.descricao })
                }
                if (m.data_agendada) {
                  const d = Math.floor((new Date(m.data_agendada).getTime() - HOJE.getTime()) / 86400000)
                  if (d >= 0) candidatos.push({ km: null, dias: d, nome: m.descricao })
                }
              })

              // menor candidato km-based e date-based
              const kmCands  = candidatos.filter((c) => c.km  !== null).sort((a, b) => a.km!  - b.km!)
              const diaCands = candidatos.filter((c) => c.dias !== null).sort((a, b) => a.dias! - b.dias!)
              const proximaKm  = kmCands[0]  ?? null
              const proximaDia = diaCands[0] ?? null

              const todosSugeridosVencidos = sugeridos.length > 0 && sugeridos.every((m) => m._status === 'vencida')
              const algumVencido = sugeridos.some((m) => m._status === 'vencida')

              // frase da próxima ida — considera vencidas restantes como caso urgente
              function fraseProximaIda() {
                // Se há vencidas não selecionadas → próxima visita é IMEDIATA
                if (vencidasRestantes.length > 0) {
                  return (
                    <>
                      há{' '}
                      {vencidasRestantes.length === 1
                        ? 'uma manutenção vencida ainda pendente'
                        : 'manutenções vencidas ainda pendentes'}
                      : <strong>{joinNomes(vencidasRestantes.map((m) => m.descricao))}</strong>. Resolva o quanto antes!
                    </>
                  )
                }

                if (!proximaKm && !proximaDia) return null

                const diasParaKm   = proximaKm  ? kmEmDias(proximaKm.km! - kmReal) : Infinity
                const diasParaData = proximaDia ? proximaDia.dias!                  : Infinity

                if (diasParaKm <= diasParaData) {
                  // próximo item é km-based — mostra km e estimativa em semanas
                  const nomesMesmaKm = kmCands.filter((c) => c.km === proximaKm!.km).map((c) => c.nome)
                  const semanasAprox = Math.round(diasParaKm / 7)
                  return (
                    <>
                      a próxima ida à oficina será somente daqui{' '}
                      <strong>{fmtKm(proximaKm!.km! - kmReal)}</strong>
                      {semanasAprox > 0 && <span> (~{semanasAprox} {semanasAprox === 1 ? 'semana' : 'semanas'})</span>}
                      {' '}para <strong>{joinNomes(nomesMesmaKm)}</strong>.
                    </>
                  )
                }
                // próximo item é date-based
                const diasRestantes = proximaDia!.dias!
                const semanasAprox  = Math.round(diasRestantes / 7)
                return (
                  <>
                    a próxima manutenção será daqui{' '}
                    <strong>{diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'}</strong>
                    {semanasAprox > 1 && <span> (~{semanasAprox} semanas)</span>}
                    {' '}para <strong>{proximaDia!.nome}</strong>.
                  </>
                )
              }

              return (
                <div className="space-y-2 text-xs">
                  {/* próximo deste item */}
                  {(proxKmItem || proxDataItem) && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-blue-400">
                      Próxima <strong>{padrao!.nome}</strong>:{' '}
                      {proxKmItem
                        ? <><strong>{fmtKm(proxKmItem)}</strong> <span className="text-blue-300">— daqui {fmtKm(proxKmItem - kmReal)}</span></>
                        : <><strong>{formatDate(proxDataItem!)}</strong> <span className="text-blue-300">— daqui 30 dias</span></>
                      }
                    </div>
                  )}

                  {/* sem padrao (corretiva): mostra próxima da moto */}
                  {!proxKmItem && !proxDataItem && (() => {
                    const prox = comStatus
                      .filter((m) => m.moto_id === registrandoItem.moto_id && !m.realizada && m.id !== registrandoItem.id && m.km_previsto !== null)
                      .sort((a, b) => (a.km_previsto ?? 0) - (b.km_previsto ?? 0))[0]
                    if (!prox) return null
                    return (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-blue-400">
                        Próxima manutenção desta moto: <strong>{prox.descricao}</strong> em{' '}
                        <strong>{fmtKm(prox.km_previsto!)}</strong>{' '}
                        <span className="text-blue-300">— daqui {fmtKm(prox.km_previsto! - kmReal)}</span>
                      </div>
                    )
                  })()}

                  {/* sugestão de juntar com checkboxes */}
                  {sugeridos.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 space-y-2">
                      <p className="text-amber-300 leading-relaxed">
                        Aproveite e faça também
                        {sugeridos.length === 1
                          ? todosSugeridosVencidos ? ' (já vencida):' : ' (chegando no limite):'
                          : todosSugeridosVencidos ? ' (já vencidas):'
                          : algumVencido ? ' (algumas vencidas):'
                          : ' (chegando no limite):'}
                      </p>
                      <div className="space-y-1.5">
                        {sugeridos.map((sug) => {
                          const checked = formRegistro.itensExtras.includes(sug.id)
                          return (
                            <label
                              key={sug.id}
                              className="flex items-center gap-2.5 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setFormRegistro((prev) => ({
                                    ...prev,
                                    itensExtras: checked
                                      ? prev.itensExtras.filter((id) => id !== sug.id)
                                      : [...prev.itensExtras, sug.id],
                                  }))
                                }}
                                className="w-4 h-4 rounded border-amber-500/40 bg-transparent accent-amber-400 cursor-pointer"
                              />
                              <span className="text-amber-200 text-xs group-hover:text-white transition-colors">
                                {sug.descricao}
                                {sug._status === 'vencida'
                                  ? <span className="ml-1 text-red-400">(vencida)</span>
                                  : <span className="ml-1 text-amber-400">(próxima)</span>}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                      <p className={`text-xs pt-1 border-t border-amber-500/20 leading-relaxed ${vencidasRestantes.length > 0 ? 'text-red-300' : 'text-amber-300'}`}>
                        {formRegistro.itensExtras.length > 0 ? 'Juntando tudo, ' : 'Após registrar este item, '}
                        {fraseProximaIda()}
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}

            <div className="flex gap-3 justify-end pt-1">
              <Button variant="ghost" onClick={() => setRegistrandoItem(null)}>Cancelar</Button>
              <Button
                onClick={() => {
                  if (!registrandoItem) return
                  const itemPrincipal = registrandoItem // captura para uso em funções aninhadas
                  // detecta responsabilidade padrão de cada item conforme contrato da moto
                  const contrato = motos.find((m) => m.id === itemPrincipal.moto_id)?.contrato
                  function autoResp(itemId: string): RespItem {
                    const item = itemId === itemPrincipal.id
                      ? itemPrincipal
                      : manutencoes.find((m) => m.id === itemId)
                    if (!contrato) return 'empresa'
                    if (contrato.tipo === 'promessa') return 'cliente'
                    return item?.tipo === 'preventiva' ? '50/50' : 'cliente'
                  }
                  const todosIds = [registrandoItem.id, ...formRegistro.itensExtras]
                  const itensFinanceiros: ItemFinanceiro[] = todosIds.map((id) => ({
                    id,
                    valor: '',
                    tem_foto_odometro: false,
                    tem_foto_nf: false,
                    resp: autoResp(id),
                  }))
                  setFormRegistro((prev) => ({ ...prev, etapa: 2, itensFinanceiros }))
                }}
                disabled={!formRegistro.km_realizado && !!registrandoItem.km_previsto}
              >
                Continuar →
              </Button>
            </div>
          </div>
        )}

        {/* ── Etapa 2: Dados Financeiros (por item) ──────────────────────────── */}
        {registrandoItem && formRegistro.etapa === 2 && (() => {
          const contrato = motos.find((m) => m.id === registrandoItem.moto_id)?.contrato

          // Todos os itens desta operação (principal + extras)
          const todosItens: ManutencaoItem[] = [
            registrandoItem,
            ...formRegistro.itensExtras
              .map((id) => manutencoes.find((m) => m.id === id))
              .filter((m): m is ManutencaoItem => !!m),
          ]

          function updateFin(id: string, updates: Partial<ItemFinanceiro>) {
            setFormRegistro((prev) => ({
              ...prev,
              itensFinanceiros: prev.itensFinanceiros.map((f) =>
                f.id === id ? { ...f, ...updates } : f
              ),
            }))
          }

          // Totais para o resumo final (usa resp individual de cada item)
          let totalEmpresa = 0
          let totalCliente = 0
          let totalDescontoCliente = 0
          let algum5050ComValor = false
          todosItens.forEach((item) => {
            const fin = formRegistro.itensFinanceiros.find((f) => f.id === item.id)
            const v = parseFloat(fin?.valor.replace(',', '.') ?? '0') || 0
            const r = fin?.resp ?? 'empresa'
            if (r === 'empresa') totalEmpresa += v
            else if (r === 'cliente') totalCliente += v
            else if (r === '50/50' && v > 0) { totalEmpresa += v / 2; totalDescontoCliente += v / 2; algum5050ComValor = true }
          })

          // Ao menos um item com valor preenchido
          const algumValor = formRegistro.itensFinanceiros.some(
            (f) => parseFloat(f.valor.replace(',', '.')) > 0
          )

          // cores do botão ativo no toggle por opção
          const toggleAtivo: Record<RespItem, string> = {
            '50/50':   'bg-amber-500/20 text-amber-300 border-amber-500/40',
            empresa:   'bg-blue-500/20  text-blue-300  border-blue-500/40',
            cliente:   'bg-green-500/20 text-green-300 border-green-500/40',
          }

          return (
            <div className="space-y-3">
              {/* Cabeçalho: moto + KM */}
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-[#A0A0A0]">
                  {registrandoItem.moto_placa} · {fmtKm(parseInt(formRegistro.km_realizado) || registrandoItem.moto_km_atual)} · {formRegistro.oficina}
                </p>
                <p className="text-xs text-[#555555]">{todosItens.length} item{todosItens.length > 1 ? 's' : ''}</p>
              </div>

              {/* Card por item */}
              <div className="space-y-2">
                {todosItens.map((item) => {
                  const fin = formRegistro.itensFinanceiros.find((f) => f.id === item.id) ?? {
                    id: item.id, valor: '', tem_foto_odometro: false, tem_foto_nf: false, resp: 'empresa' as RespItem,
                  }
                  const v = parseFloat(fin.valor.replace(',', '.')) || 0
                  const resp = fin.resp

                  return (
                    <div key={item.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-2.5 space-y-2">
                      {/* Nome + tipo */}
                      <div className="flex items-center gap-2">
                        <BadgeTipo tipo={item.tipo} />
                        <span className="text-sm text-white font-medium flex-1 truncate">{item.descricao}</span>
                      </div>

                      {/* Label + toggle numa linha só */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-[#555555] shrink-0">Quem paga?</span>
                        <div className="flex rounded-lg overflow-hidden border border-[#2A2A2A] text-xs">
                          {(['50/50', 'empresa', 'cliente'] as RespItem[]).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => updateFin(item.id, { resp: opt })}
                              className={`px-3 py-1.5 transition-colors border-r border-[#2A2A2A] last:border-r-0 ${
                                resp === opt
                                  ? toggleAtivo[opt]
                                  : 'bg-transparent text-[#555555] hover:text-[#A0A0A0]'
                              }`}
                            >
                              {opt === '50/50' ? '50/50' : opt === 'empresa' ? 'Empresa' : 'Cliente'}
                            </button>
                          ))}
                        </div>
                        <span className="text-xs text-[#444444]">
                          {resp === '50/50' && 'Custo dividido pela metade.'}
                          {resp === 'empresa' && 'Sairá do caixa da empresa.'}
                          {resp === 'cliente' && 'Cliente pagou — lançado em Despesas.'}
                        </span>
                      </div>

                      {/* Valor + fotos em linha */}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="R$ 0,00"
                          step="0.01"
                          value={fin.valor}
                          onChange={(e) => updateFin(item.id, { valor: e.target.value })}
                          className="flex-1 bg-[#111111] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#555555]"
                        />
                        <button
                          type="button"
                          title="Foto do odômetro"
                          onClick={() => updateFin(item.id, { tem_foto_odometro: !fin.tem_foto_odometro })}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors whitespace-nowrap ${
                            fin.tem_foto_odometro
                              ? 'border-green-500/40 bg-green-500/10 text-green-400'
                              : 'border-[#333333] bg-[#111111] text-[#555555] hover:border-[#555555] hover:text-[#A0A0A0]'
                          }`}
                        >
                          <Camera className="w-3.5 h-3.5" />
                          {fin.tem_foto_odometro ? 'Odôm ✓' : 'Odôm'}
                        </button>
                        <button
                          type="button"
                          title="Nota fiscal"
                          onClick={() => updateFin(item.id, { tem_foto_nf: !fin.tem_foto_nf })}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors whitespace-nowrap ${
                            fin.tem_foto_nf
                              ? 'border-green-500/40 bg-green-500/10 text-green-400'
                              : 'border-[#333333] bg-[#111111] text-[#555555] hover:border-[#555555] hover:text-[#A0A0A0]'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {fin.tem_foto_nf ? 'NF ✓' : 'NF'}
                        </button>
                      </div>

                      {/* Preview do lançamento */}
                      {v > 0 && (
                        <div className="text-xs pt-1.5 border-t border-[#2A2A2A]">
                          {resp === 'empresa' && (
                            <p className="text-blue-400">→ Despesas: <strong>R$ {v.toFixed(2)}</strong> — Caixa da empresa</p>
                          )}
                          {resp === 'cliente' && (
                            <p className="text-green-400">→ Despesas: <strong>R$ {v.toFixed(2)}</strong> — pago pelo cliente</p>
                          )}
                          {resp === '50/50' && (
                            <p className="text-amber-400">→ Empresa <strong>R$ {(v / 2).toFixed(2)}</strong> + desconto <strong>R$ {(v / 2).toFixed(2)}</strong> na cobrança</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Resumo total dos lançamentos */}
              {algumValor && (
                <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-3 space-y-1.5">
                  <p className="text-xs text-[#555555] pb-0.5">Resumo dos lançamentos</p>
                  {totalEmpresa > 0 && (
                    <p className="text-xs text-blue-400">
                      Despesa empresa: <strong>R$ {totalEmpresa.toFixed(2)}</strong>
                      <span className="text-blue-600"> — caixa da empresa</span>
                    </p>
                  )}
                  {totalCliente > 0 && (
                    <p className="text-xs text-green-400">
                      Pago pelo cliente: <strong>R$ {totalCliente.toFixed(2)}</strong>
                      <span className="text-green-600"> — lançado em Despesas</span>
                    </p>
                  )}
                  {totalDescontoCliente > 0 && contrato && (
                    <p className="text-xs text-amber-400">
                      Desconto na cobrança: <strong>R$ {totalDescontoCliente.toFixed(2)}</strong>
                      <span className="text-amber-600"> → semana de {formatDate(contrato.cobranca_proxima)}: </span>
                      <strong>R$ {(contrato.valor_semanal - totalDescontoCliente).toFixed(2)}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Confirmação para aplicar desconto na cobrança (caso 50/50) */}
              {algum5050ComValor && contrato && (
                <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={formRegistro.desconto_confirmado}
                    onChange={() => setFormRegistro((prev) => ({ ...prev, desconto_confirmado: !prev.desconto_confirmado }))}
                    className="w-4 h-4 mt-0.5 accent-amber-400 cursor-pointer"
                  />
                  <span className="text-xs text-amber-200 leading-relaxed">
                    Confirmo: aplicar desconto de <strong>R$ {totalDescontoCliente.toFixed(2)}</strong> na cobrança da semana de{' '}
                    <strong>{formatDate(contrato.cobranca_proxima)}</strong> — {contrato.cliente_nome}
                  </span>
                </label>
              )}

              <div className="flex gap-3 justify-end pt-1">
                <Button variant="ghost" onClick={() => setFormRegistro((prev) => ({ ...prev, etapa: 1 }))}>
                  ← Voltar
                </Button>
                <Button
                  onClick={confirmarRegistro}
                  disabled={!algumValor || (algum5050ComValor && !formRegistro.desconto_confirmado)}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {todosItens.length > 1
                    ? `Confirmar ${todosItens.length} itens`
                    : 'Confirmar Registro'}
                </Button>
              </div>
            </div>
          )
        })()}
      </Modal>

      {/* ── Modal: Nova Manutenção ─────────────────────────────────────────── */}
      <Modal
        open={modalNovaOpen}
        onClose={() => setModalNovaOpen(false)}
        title="Nova Manutenção"
        size="md"
      >
        <form onSubmit={handleNovaManu} className="space-y-4">
          <Select
            label="Moto *"
            options={motoSelectOptions}
            value={formNova.moto_id}
            onChange={(e) => setFormNova({ ...formNova, moto_id: e.target.value })}
            required
          />
          <Select
            label="Item padrão"
            options={itemSelectOptions}
            value={formNova.item_padrao_id}
            onChange={(e) => {
              const p = ITENS_PADRAO.find((ip) => ip.id === e.target.value)
              setFormNova({ ...formNova, item_padrao_id: e.target.value, descricao: p?.nome ?? formNova.descricao, tipo: p?.tipo ?? formNova.tipo })
            }}
          />
          {!formNova.item_padrao_id && (
            <>
              <Input
                label="Descrição *"
                placeholder="Ex: Troca do cabo do freio"
                value={formNova.descricao}
                onChange={(e) => setFormNova({ ...formNova, descricao: e.target.value })}
                required
              />
              <Select
                label="Tipo"
                options={[
                  { value: 'preventiva', label: 'Preventiva' },
                  { value: 'corretiva', label: 'Corretiva' },
                  { value: 'vistoria', label: 'Vistoria' },
                ]}
                value={formNova.tipo}
                onChange={(e) => setFormNova({ ...formNova, tipo: e.target.value as 'preventiva' | 'corretiva' | 'vistoria' })}
              />
            </>
          )}
          {padraoSelecionado && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-400">
              {padraoSelecionado.dica}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {(!padraoSelecionado || padraoSelecionado.intervalo_km) && (
              <Input
                label="KM Previsto"
                type="number"
                placeholder="Ex: 12000"
                value={formNova.km_previsto}
                onChange={(e) => setFormNova({ ...formNova, km_previsto: e.target.value })}
              />
            )}
            {(!padraoSelecionado || padraoSelecionado.intervalo_dias) && (
              <Input
                label="Data Agendada"
                type="date"
                value={formNova.data_agendada}
                onChange={(e) => setFormNova({ ...formNova, data_agendada: e.target.value })}
              />
            )}
          </div>
          <Textarea
            label="Observações"
            rows={2}
            value={formNova.observacoes}
            onChange={(e) => setFormNova({ ...formNova, observacoes: e.target.value })}
          />
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="ghost" onClick={() => setModalNovaOpen(false)}>Cancelar</Button>
            <Button type="submit">
              <Plus className="w-4 h-4" />
              Adicionar
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Atualizar KM ───────────────────────────────────────────── */}
      <Modal
        open={modalKmOpen}
        onClose={() => setModalKmOpen(false)}
        title="Atualizar KM da Moto"
        size="sm"
      >
        <form onSubmit={handleAtualizarKm} className="space-y-4">
          <Select
            label="Moto *"
            options={motoSelectOptions}
            value={formKm.moto_id}
            onChange={(e) => {
              const moto = motos.find((m) => m.id === e.target.value)
              setFormKm({ moto_id: e.target.value, km_atual: moto ? String(moto.km_atual) : '' })
            }}
            required
          />
          {formKm.moto_id && (
            <div className="text-xs text-[#A0A0A0]">
              KM atual registrado: <span className="text-white font-medium">
                {fmtKm(motos.find((m) => m.id === formKm.moto_id)?.km_atual ?? 0)}
              </span>
            </div>
          )}
          <Input
            label="Novo KM *"
            type="number"
            placeholder="Ex: 12500"
            value={formKm.km_atual}
            onChange={(e) => setFormKm({ ...formKm, km_atual: e.target.value })}
            required
          />
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="ghost" onClick={() => setModalKmOpen(false)}>Cancelar</Button>
            <Button type="submit">
              <Gauge className="w-4 h-4" />
              Atualizar
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Ver Detalhes (realizada) ──────────────────────────────── */}
      <Modal
        open={!!detalhe}
        onClose={() => setDetalhe(null)}
        title="Detalhes da Manutenção"
        size="sm"
      >
        {detalhe && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-[#A0A0A0]">Moto</p><p className="text-white font-medium">{detalhe.moto_placa}</p></div>
              <div><p className="text-xs text-[#A0A0A0]">Modelo</p><p className="text-white">{detalhe.moto_modelo}</p></div>
              <div><p className="text-xs text-[#A0A0A0]">Item</p><p className="text-white">{detalhe.descricao}</p></div>
              <div><p className="text-xs text-[#A0A0A0]">Tipo</p><BadgeTipo tipo={detalhe.tipo} /></div>
              <div><p className="text-xs text-[#A0A0A0]">KM Realizado</p><p className="text-white">{detalhe.km_realizado !== null ? fmtKm(detalhe.km_realizado) : '—'}</p></div>
              <div><p className="text-xs text-[#A0A0A0]">Data</p><p className="text-white">{detalhe.data_realizada ? formatDate(detalhe.data_realizada) : '—'}</p></div>
              <div><p className="text-xs text-[#A0A0A0]">Oficina</p><p className="text-white">{detalhe.oficina ?? '—'}</p></div>
            </div>
            <div className="flex gap-3">
              <div className={`flex items-center gap-1.5 text-xs ${detalhe.foto_odometro_url ? 'text-green-400' : 'text-[#555555]'}`}>
                <Camera className="w-3.5 h-3.5" />
                Foto odômetro {detalhe.foto_odometro_url ? '✓' : '—'}
              </div>
              <div className={`flex items-center gap-1.5 text-xs ${detalhe.foto_nota_fiscal_url ? 'text-green-400' : 'text-[#555555]'}`}>
                <FileText className="w-3.5 h-3.5" />
                Nota fiscal {detalhe.foto_nota_fiscal_url ? '✓' : '—'}
              </div>
            </div>
            {detalhe.observacoes && (
              <div><p className="text-xs text-[#A0A0A0]">Observações</p><p className="text-white">{detalhe.observacoes}</p></div>
            )}
            <div className="flex justify-end pt-1">
              <Button variant="ghost" onClick={() => setDetalhe(null)}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal: Confirmar Exclusão ─────────────────────────────────────── */}
      <Modal open={!!excluindo} onClose={() => setExcluindo(null)} title="Excluir Manutenção" size="sm">
        <div className="space-y-4">
          <p className="text-[#A0A0A0] text-sm">
            Deseja excluir <span className="text-white font-medium">{excluindo?.descricao}</span> de{' '}
            <span className="text-white font-medium">{excluindo?.moto_placa}</span>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setExcluindo(null)}>Cancelar</Button>
            <Button variant="danger" onClick={confirmarExclusao}>
              <Trash2 className="w-4 h-4" />
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
