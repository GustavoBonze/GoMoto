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
import type { StandardMaintenanceItem, Maintenance, MaintenanceStatus } from '@/types'

// ─── tipos internos ───────────────────────────────────────────────────────────

// Dados financeiros individuais por item registrado (step 2 do modal de registro)
type ResponsibleItem = 'empresa' | 'cliente' | '50/50'
type FinancialItem = {
  id: string           // mesmo id do MaintenanceRecord
  value: string        // cost digitado pelo usuário (string para o input)
  has_odometer_photo: boolean
  has_invoice_photo: boolean
  responsibility: ResponsibleItem       // responsabilidade — auto-detectada, mas editável pelo usuário
}

// Dados de contract usados apenas para a lógica financeira do registro de manutenção.
// Substituir por consulta real ao Supabase quando a integração estiver pronta.
type MockContract = {
  type: 'promessa' | 'locacao'  // promessa = cliente paga 100%; locacao = 50/50 preventiva
  customer_name: string
  weekly_value: number
  next_billing: string      // data (YYYY-MM-DD) da cobrança pendente mais próxima
}

type MotorcycleWithKm = { id: string; plate: string; model: string; current_km: number; contract?: MockContract }

type MaintenanceRecord = Maintenance & {
  motorcycle_plate: string
  motorcycle_model: string
  motorcycle_current_km: number
}

// ─── catálogo dos 13 items padrão ────────────────────────────────────────────

const DEFAULT_ITEMS: StandardMaintenanceItem[] = [
  { id: 'ip1',  name: 'Troca de óleo',                          km_interval: 1000,  day_interval: null, type: 'preventive', tip: 'Use óleo 20W50 ou 10W30; troque o filtro a cada 2 trocas.' },
  { id: 'ip2',  name: 'Filtro de óleo',                         km_interval: 4000,  day_interval: null, type: 'preventive', tip: 'Trocar a cada duas trocas de óleo.' },
  { id: 'ip5',  name: 'Troca da relação (corrente/coroa/pinhão)', km_interval: 12000, day_interval: null, type: 'preventive', tip: 'Prefira relação original para maior durabilidade.' },
  { id: 'ip6',  name: 'Lona de freio traseira',                 km_interval: 12000, day_interval: null, type: 'preventive', tip: 'Evite manter o pé no freio.' },
  { id: 'ip7',  name: 'Pastilha de freio dianteira',            km_interval: 8000,  day_interval: null, type: 'preventive', tip: 'Use o freio dianteiro de forma equilibrada.' },
  { id: 'ip8',  name: 'Pneu dianteiro',                         km_interval: 12000, day_interval: null, type: 'preventive', tip: 'Calibre semanalmente (32 psi dianteiro).' },
  { id: 'ip9',  name: 'Pneu traseiro',                          km_interval: 8000,  day_interval: null, type: 'preventive', tip: 'Calibre semanalmente (36 psi traseiro).' },
  { id: 'ip10', name: 'Filtro de ar',                           km_interval: 7000,  day_interval: null, type: 'preventive', tip: 'Limpar ou trocar; poeira urbana reduz durabilidade.' },
  { id: 'ip11', name: 'Velas de ignição',                       km_interval: 10000, day_interval: null, type: 'preventive', tip: 'Verificar e ajustar folga antes de trocar.' },
  { id: 'ip12', name: 'Amortecedores',                          km_interval: 25000, day_interval: null, type: 'preventive', tip: 'Peso extra acelera desgaste do óleo interno.' },
  { id: 'ip13', name: 'Vistoria mensal',                        km_interval: null,  day_interval: 30,   type: 'inspection',   tip: 'Vistoria obrigatória mensal de todas as motorcycles.' },
]

// ─── mock: motorcycles ──────────────────────────────────────────────────────────────

// PLACEHOLDER — substituir nomes/valores reais e type de contract quando integrar Supabase
const mockMotorcyclesInit: MotorcycleWithKm[] = [
  { id: '1', plate: 'SYF1C42', model: 'Honda CG 160 START',       current_km: 46578,
    contract: { type: 'locacao',  customer_name: 'Cliente SYF1C42',  weekly_value: 350, next_billing: '2026-03-21' } },
  { id: '2', plate: 'KYN9J41', model: 'Yamaha YS150 FAZER SED',   current_km: 30987,
    contract: { type: 'locacao',  customer_name: 'Cliente KYN9J41',  weekly_value: 350, next_billing: '2026-03-21' } },
  { id: '3', plate: 'RIW4J89', model: 'Yamaha YS150 FAZER SED',   current_km: 67908,
    contract: { type: 'locacao',  customer_name: 'Cliente RIW4J89',  weekly_value: 350, next_billing: '2026-03-21' } },
  { id: '4', plate: 'RJA5J85', model: 'Yamaha YBR150 FACTOR SED', current_km: 29282,
    contract: { type: 'promessa', customer_name: 'Cliente RJA5J85',  weekly_value: 400, next_billing: '2026-03-28' } },
]

// ─── mock: manutenções ────────────────────────────────────────────────────────
// Data de TODAY (mock): 2026-03-14
// Dados baseados no histórico real de despesas/manutenções da frota

const mkBase = (overrides: Partial<MaintenanceRecord>): MaintenanceRecord => ({
  id: '', motorcycle_id: '', standard_item_id: null, type: 'preventive',
  description: '', predicted_km: null, actual_km: null,
  scheduled_date: null, completed_date: null, cost: null,
  completed: false, workshop: null,
  odometer_photo_url: null, invoice_photo_url: null,
  observations: null,
  created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
  motorcycle_plate: '', motorcycle_model: '', motorcycle_current_km: 0,
  ...overrides,
})

const mockMaintenancesInit: MaintenanceRecord[] = [

  // ── SYF1C42 — Honda CG 160 START (km: 46.578) ─────────────────────────────
  // Status geral: todas agendadas, motorcycle bem mantida

  // Troca de óleo: última em 15/01/2026 @ 46.578 km → próxima: 47.578
  mkBase({ id: 's_r1', motorcycle_id: '1', standard_item_id: 'ip1', description: 'Troca de óleo', predicted_km: 46578, actual_km: 46578, completed_date: '2026-01-15', completed: true, workshop: 'Oficina do Careca', motorcycle_plate: 'SYF1C42', motorcycle_model: 'Honda CG 160 START', motorcycle_current_km: 46578 }),
  mkBase({ id: 's1',   motorcycle_id: '1', standard_item_id: 'ip1', description: 'Troca de óleo', predicted_km: 47578, motorcycle_plate: 'SYF1C42', motorcycle_model: 'Honda CG 160 START', motorcycle_current_km: 46578 }),

  // Filtro de óleo: próxima @ 48.578 (a cada 2 trocas de óleo)
  mkBase({ id: 's2',   motorcycle_id: '1', standard_item_id: 'ip2', description: 'Filtro de ar', predicted_km: 48578, motorcycle_plate: 'SYF1C42', motorcycle_model: 'Honda CG 160 START', motorcycle_current_km: 46578 }),

  // Relação: trocada em 12/12/2025 @ ~41.000 km → próxima: 53.000
  mkBase({ id: 's_r2', motorcycle_id: '1', standard_item_id: 'ip5', description: 'Troca da relação (corrente/coroa/pinhão)', predicted_km: 41000, actual_km: 41000, completed_date: '2025-12-12', completed: true, workshop: 'Oficina do Careca', motorcycle_plate: 'SYF1C42', motorcycle_model: 'Honda CG 160 START', motorcycle_current_km: 46578 }),
  mkBase({ id: 's3',   motorcycle_id: '1', standard_item_id: 'ip5', description: 'Troca da relação (corrente/coroa/pinhão)', predicted_km: 53000, motorcycle_plate: 'SYF1C42', motorcycle_model: 'Honda CG 160 START', motorcycle_current_km: 46578 }),

  // Lona de freio traseira: última @ 14.832 → estimado próxima: 50.832
  mkBase({ id: 's4',   motorcycle_id: '1', standard_item_id: 'ip6', description: 'Lona de freio traseira', predicted_km: 50832, motorcycle_plate: 'SYF1C42', motorcycle_model: 'Honda CG 160 START', motorcycle_current_km: 46578 }),

  // Pastilha de freio dianteira: próxima @ 50.578
  mkBase({ id: 's5',   motorcycle_id: '1', standard_item_id: 'ip7', description: 'Pastilha de freio dianteira', predicted_km: 50578, motorcycle_plate: 'SYF1C42', motorcycle_model: 'Honda CG 160 START', motorcycle_current_km: 46578 }),

  // Pneu dianteiro: trocado em 27/02/2026 → próxima: 58.578
  mkBase({ id: 's_r3', motorcycle_id: '1', standard_item_id: 'ip8', description: 'Pneu dianteiro', predicted_km: 46578, actual_km: 46578, completed_date: '2026-02-27', completed: true, workshop: 'Oficina do Careca', motorcycle_plate: 'SYF1C42', motorcycle_model: 'Honda CG 160 START', motorcycle_current_km: 46578 }),
  mkBase({ id: 's6',   motorcycle_id: '1', standard_item_id: 'ip8', description: 'Pneu dianteiro', predicted_km: 58578, motorcycle_plate: 'SYF1C42', motorcycle_model: 'Honda CG 160 START', motorcycle_current_km: 46578 }),

  // Pneu traseiro: último @ 27.999 → estimado próxima: 51.999
  mkBase({ id: 's7',   motorcycle_id: '1', standard_item_id: 'ip9', description: 'Pneu traseiro', predicted_km: 51999, motorcycle_plate: 'SYF1C42', motorcycle_model: 'Honda CG 160 START', motorcycle_current_km: 46578 }),

  // Filtro de ar: próxima @ 49.000
  mkBase({ id: 's8',   motorcycle_id: '1', standard_item_id: 'ip10', description: 'Filtro de ar', predicted_km: 49000, motorcycle_plate: 'SYF1C42', motorcycle_model: 'Honda CG 160 START', motorcycle_current_km: 46578 }),

  // Velas de ignição: próxima @ 50.578
  mkBase({ id: 's9',   motorcycle_id: '1', standard_item_id: 'ip11', description: 'Velas de ignição', predicted_km: 50578, motorcycle_plate: 'SYF1C42', motorcycle_model: 'Honda CG 160 START', motorcycle_current_km: 46578 }),

  // Amortecedores: próxima @ 52.500 (primeira troca desde compra a ~2.500 km)
  mkBase({ id: 's10',  motorcycle_id: '1', standard_item_id: 'ip12', description: 'Amortecedores', predicted_km: 52500, motorcycle_plate: 'SYF1C42', motorcycle_model: 'Honda CG 160 START', motorcycle_current_km: 46578 }),

  // Vistoria mensal: próxima 13/04/2026
  mkBase({ id: 'sv1',  motorcycle_id: '1', standard_item_id: 'ip13', type: 'inspection', description: 'Vistoria mensal', scheduled_date: '2026-04-13', motorcycle_plate: 'SYF1C42', motorcycle_model: 'Honda CG 160 START', motorcycle_current_km: 46578 }),


  // ── KYN9J41 — Yamaha YS150 FAZER SED (km: 30.987) ─────────────────────────
  // Obs: painel trocado na compra (jan/2025); odômetro zerado; registrava ~35.000 km antes.
  // ⚠ ATENÇÃO: amortecedores VENCIDOS; velas PRÓXIMAS

  // Troca de óleo: última em 10/09/2025 @ 30.987 km → próxima: 31.987
  mkBase({ id: 'k_r1', motorcycle_id: '2', standard_item_id: 'ip1', description: 'Troca de óleo', predicted_km: 30987, actual_km: 30987, completed_date: '2025-09-10', completed: true, workshop: 'Oficina do Careca', motorcycle_plate: 'KYN9J41', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 30987 }),
  mkBase({ id: 'k1',   motorcycle_id: '2', standard_item_id: 'ip1', description: 'Troca de óleo', predicted_km: 31987, motorcycle_plate: 'KYN9J41', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 30987 }),

  // Filtro de óleo: próxima @ 33.000
  mkBase({ id: 'k2',   motorcycle_id: '2', standard_item_id: 'ip2', description: 'Filtro de ar', predicted_km: 33000, motorcycle_plate: 'KYN9J41', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 30987 }),

  // Relação: trocada em 13/08/2025 @ ~23.000 km → próxima: 35.000
  mkBase({ id: 'k_r2', motorcycle_id: '2', standard_item_id: 'ip5', description: 'Troca da relação (corrente/coroa/pinhão)', predicted_km: 23000, actual_km: 23000, completed_date: '2025-08-13', completed: true, workshop: 'Oficina do Careca', motorcycle_plate: 'KYN9J41', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 30987 }),
  mkBase({ id: 'k3',   motorcycle_id: '2', standard_item_id: 'ip5', description: 'Troca da relação (corrente/coroa/pinhão)', predicted_km: 35000, motorcycle_plate: 'KYN9J41', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 30987 }),

  // Lona de freio traseira: próxima @ 35.700
  mkBase({ id: 'k4',   motorcycle_id: '2', standard_item_id: 'ip6', description: 'Lona de freio traseira', predicted_km: 35700, motorcycle_plate: 'KYN9J41', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 30987 }),

  // Pastilha de freio dianteira: próxima @ 33.700
  mkBase({ id: 'k5',   motorcycle_id: '2', standard_item_id: 'ip7', description: 'Pastilha de freio dianteira', predicted_km: 33700, motorcycle_plate: 'KYN9J41', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 30987 }),

  // Pneu dianteiro: próxima @ 37.700
  mkBase({ id: 'k6',   motorcycle_id: '2', standard_item_id: 'ip8', description: 'Pneu dianteiro', predicted_km: 37700, motorcycle_plate: 'KYN9J41', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 30987 }),

  // Pneu traseiro: próxima @ 33.700
  mkBase({ id: 'k7',   motorcycle_id: '2', standard_item_id: 'ip9', description: 'Pneu traseiro', predicted_km: 33700, motorcycle_plate: 'KYN9J41', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 30987 }),

  // Filtro de ar: próxima @ 36.700
  mkBase({ id: 'k8',   motorcycle_id: '2', standard_item_id: 'ip10', description: 'Filtro de ar', predicted_km: 36700, motorcycle_plate: 'KYN9J41', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 30987 }),

  // Velas de ignição: PRÓXIMA — faltam apenas 713 km (alerta: 1.000 km)
  mkBase({ id: 'k9',   motorcycle_id: '2', standard_item_id: 'ip11', description: 'Velas de ignição', predicted_km: 31700, motorcycle_plate: 'KYN9J41', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 30987 }),

  // Amortecedores: VENCIDA — due @ 26.700, atual 30.987 (+4.287 km atrasado)
  mkBase({ id: 'k10',  motorcycle_id: '2', standard_item_id: 'ip12', description: 'Amortecedores', predicted_km: 26700, motorcycle_plate: 'KYN9J41', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 30987 }),

  // Vistoria mensal: próxima 13/04/2026
  mkBase({ id: 'kv1',  motorcycle_id: '2', standard_item_id: 'ip13', type: 'inspection', description: 'Vistoria mensal', scheduled_date: '2026-04-13', motorcycle_plate: 'KYN9J41', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 30987 }),


  // ── RIW4J89 — Yamaha YS150 FAZER SED (km: 67.908) ─────────────────────────
  // ⚠ ATENÇÃO: pastilha dianteira VENCIDA; amortecedores VENCIDOS

  // Troca de óleo: última em 06/01/2026 @ 67.908 km → próxima: 68.908
  mkBase({ id: 'r_r1', motorcycle_id: '3', standard_item_id: 'ip1', description: 'Troca de óleo', predicted_km: 67908, actual_km: 67908, completed_date: '2026-01-06', completed: true, workshop: 'Oficina do Careca', motorcycle_plate: 'RIW4J89', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 67908 }),
  mkBase({ id: 'r1',   motorcycle_id: '3', standard_item_id: 'ip1', description: 'Troca de óleo', predicted_km: 68908, motorcycle_plate: 'RIW4J89', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 67908 }),

  // Filtro de óleo: próxima @ 68.360 (faltam 452 km — quase no limite)
  mkBase({ id: 'r2',   motorcycle_id: '3', standard_item_id: 'ip2', description: 'Filtro de ar', predicted_km: 68360, motorcycle_plate: 'RIW4J89', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 67908 }),

  // Relação: trocada em 26/11/2025 @ ~60.000 km → próxima: 72.000
  mkBase({ id: 'r_r2', motorcycle_id: '3', standard_item_id: 'ip5', description: 'Troca da relação (corrente/coroa/pinhão)', predicted_km: 60000, actual_km: 60000, completed_date: '2025-11-26', completed: true, workshop: 'Oficina do Careca', motorcycle_plate: 'RIW4J89', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 67908 }),
  mkBase({ id: 'r3',   motorcycle_id: '3', standard_item_id: 'ip5', description: 'Troca da relação (corrente/coroa/pinhão)', predicted_km: 72000, motorcycle_plate: 'RIW4J89', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 67908 }),

  // Lona de freio traseira: próxima @ 72.360
  mkBase({ id: 'r4',   motorcycle_id: '3', standard_item_id: 'ip6', description: 'Lona de freio traseira', predicted_km: 72360, motorcycle_plate: 'RIW4J89', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 67908 }),

  // Pastilha de freio dianteira: VENCIDA — due @ 55.500, atual 67.908 (+12.408 km atrasado)
  mkBase({ id: 'r5',   motorcycle_id: '3', standard_item_id: 'ip7', description: 'Pastilha de freio dianteira', predicted_km: 55500, motorcycle_plate: 'RIW4J89', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 67908 }),

  // Pneu dianteiro: próxima @ 72.360
  mkBase({ id: 'r6',   motorcycle_id: '3', standard_item_id: 'ip8', description: 'Pneu dianteiro', predicted_km: 72360, motorcycle_plate: 'RIW4J89', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 67908 }),

  // Pneu traseiro: próxima @ 72.360
  mkBase({ id: 'r7',   motorcycle_id: '3', standard_item_id: 'ip9', description: 'Pneu traseiro', predicted_km: 72360, motorcycle_plate: 'RIW4J89', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 67908 }),

  // Filtro de ar: próxima @ 73.360
  mkBase({ id: 'r8',   motorcycle_id: '3', standard_item_id: 'ip10', description: 'Filtro de ar', predicted_km: 73360, motorcycle_plate: 'RIW4J89', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 67908 }),

  // Velas de ignição: próxima @ 74.360
  mkBase({ id: 'r9',   motorcycle_id: '3', standard_item_id: 'ip11', description: 'Velas de ignição', predicted_km: 74360, motorcycle_plate: 'RIW4J89', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 67908 }),

  // Amortecedores: VENCIDA — due @ 49.360, atual 67.908 (+18.548 km atrasado)
  mkBase({ id: 'r10',  motorcycle_id: '3', standard_item_id: 'ip12', description: 'Amortecedores', predicted_km: 49360, motorcycle_plate: 'RIW4J89', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 67908 }),

  // Vistoria mensal: próxima 13/04/2026
  mkBase({ id: 'rv1',  motorcycle_id: '3', standard_item_id: 'ip13', type: 'inspection', description: 'Vistoria mensal', scheduled_date: '2026-04-13', motorcycle_plate: 'RIW4J89', motorcycle_model: 'Yamaha YS150 FAZER SED', motorcycle_current_km: 67908 }),


  // ── RJA5J85 — Yamaha YBR150 FACTOR SED (km: 29.282) ──────────────────────
  // ⚠ ATENÇÃO: velas PRÓXIMAS

  // Troca de óleo: última em 09/03/2026 @ 29.282 km → próxima: 30.282
  mkBase({ id: 'f_r1', motorcycle_id: '4', standard_item_id: 'ip1', description: 'Troca de óleo', predicted_km: 29282, actual_km: 29282, completed_date: '2026-03-09', completed: true, workshop: 'Oficina do Careca', motorcycle_plate: 'RJA5J85', motorcycle_model: 'Yamaha YBR150 FACTOR SED', motorcycle_current_km: 29282 }),
  mkBase({ id: 'f1',   motorcycle_id: '4', standard_item_id: 'ip1', description: 'Troca de óleo', predicted_km: 30282, motorcycle_plate: 'RJA5J85', motorcycle_model: 'Yamaha YBR150 FACTOR SED', motorcycle_current_km: 29282 }),

  // Filtro de óleo: próxima @ 31.058
  mkBase({ id: 'f2',   motorcycle_id: '4', standard_item_id: 'ip2', description: 'Filtro de ar', predicted_km: 31058, motorcycle_plate: 'RJA5J85', motorcycle_model: 'Yamaha YBR150 FACTOR SED', motorcycle_current_km: 29282 }),

  // Relação: trocada em 27/02/2026 @ 27.058 km → próxima: 39.058
  mkBase({ id: 'f_r2', motorcycle_id: '4', standard_item_id: 'ip5', description: 'Troca da relação (corrente/coroa/pinhão)', predicted_km: 27058, actual_km: 27058, completed_date: '2026-02-27', completed: true, workshop: 'Oficina do Careca', motorcycle_plate: 'RJA5J85', motorcycle_model: 'Yamaha YBR150 FACTOR SED', motorcycle_current_km: 29282 }),
  mkBase({ id: 'f3',   motorcycle_id: '4', standard_item_id: 'ip5', description: 'Troca da relação (corrente/coroa/pinhão)', predicted_km: 39058, motorcycle_plate: 'RJA5J85', motorcycle_model: 'Yamaha YBR150 FACTOR SED', motorcycle_current_km: 29282 }),

  // Lona de freio traseira: trocada em 13/02/2026 @ ~25.500 km → próxima: 37.500
  mkBase({ id: 'f_r3', motorcycle_id: '4', standard_item_id: 'ip6', description: 'Lona de freio traseira', predicted_km: 25500, actual_km: 25500, completed_date: '2026-02-13', completed: true, workshop: 'Oficina do Careca', motorcycle_plate: 'RJA5J85', motorcycle_model: 'Yamaha YBR150 FACTOR SED', motorcycle_current_km: 29282 }),
  mkBase({ id: 'f4',   motorcycle_id: '4', standard_item_id: 'ip6', description: 'Lona de freio traseira', predicted_km: 37500, motorcycle_plate: 'RJA5J85', motorcycle_model: 'Yamaha YBR150 FACTOR SED', motorcycle_current_km: 29282 }),

  // Pastilha de freio dianteira: próxima @ 35.750
  mkBase({ id: 'f5',   motorcycle_id: '4', standard_item_id: 'ip7', description: 'Pastilha de freio dianteira', predicted_km: 35750, motorcycle_plate: 'RJA5J85', motorcycle_model: 'Yamaha YBR150 FACTOR SED', motorcycle_current_km: 29282 }),

  // Pneu dianteiro: próxima @ 31.750
  mkBase({ id: 'f6',   motorcycle_id: '4', standard_item_id: 'ip8', description: 'Pneu dianteiro', predicted_km: 31750, motorcycle_plate: 'RJA5J85', motorcycle_model: 'Yamaha YBR150 FACTOR SED', motorcycle_current_km: 29282 }),

  // Pneu traseiro: próxima @ 35.750
  mkBase({ id: 'f7',   motorcycle_id: '4', standard_item_id: 'ip9', description: 'Pneu traseiro', predicted_km: 35750, motorcycle_plate: 'RJA5J85', motorcycle_model: 'Yamaha YBR150 FACTOR SED', motorcycle_current_km: 29282 }),

  // Filtro de ar: próxima @ 33.750
  mkBase({ id: 'f8',   motorcycle_id: '4', standard_item_id: 'ip10', description: 'Filtro de ar', predicted_km: 33750, motorcycle_plate: 'RJA5J85', motorcycle_model: 'Yamaha YBR150 FACTOR SED', motorcycle_current_km: 29282 }),

  // Velas de ignição: PRÓXIMA — faltam apenas 468 km (alerta: 1.000 km)
  mkBase({ id: 'f9',   motorcycle_id: '4', standard_item_id: 'ip11', description: 'Velas de ignição', predicted_km: 29750, motorcycle_plate: 'RJA5J85', motorcycle_model: 'Yamaha YBR150 FACTOR SED', motorcycle_current_km: 29282 }),

  // Amortecedores: próxima @ 44.750 (comprada a ~19.750 km)
  mkBase({ id: 'f10',  motorcycle_id: '4', standard_item_id: 'ip12', description: 'Amortecedores', predicted_km: 44750, motorcycle_plate: 'RJA5J85', motorcycle_model: 'Yamaha YBR150 FACTOR SED', motorcycle_current_km: 29282 }),

  // Vistoria mensal: próxima 13/04/2026
  mkBase({ id: 'fv1',  motorcycle_id: '4', standard_item_id: 'ip13', type: 'inspection', description: 'Vistoria mensal', scheduled_date: '2026-04-13', motorcycle_plate: 'RJA5J85', motorcycle_model: 'Yamaha YBR150 FACTOR SED', motorcycle_current_km: 29282 }),
]

// ─── helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date('2026-03-14')

// Média de uso dos clientes: ~1.000 km/semana (varia entre 800–1.200 km/semana).
// Usado para converter distância em km para days e comparar manutenções km-based vs date-based.
const KM_PER_WEEK = 1000
const KM_PER_DAY = KM_PER_WEEK / 7 // ≈ 143 km/dia

function calculateStatus(item: MaintenanceRecord): MaintenanceStatus {
  if (item.completed) return 'completed'

  const standard = DEFAULT_ITEMS.find((p) => p.id === item.standard_item_id)

  // baseado em data (vistoria)
  if (item.scheduled_date && !standard?.km_interval) {
    const data = new Date(item.scheduled_date)
    const diffDays = Math.floor((data.getTime() - TODAY.getTime()) / 86400000)
    if (diffDays < 0) return 'overdue'
    if (diffDays <= 3) return 'upcoming'
    return 'scheduled'
  }

  // baseado em km
  if (item.predicted_km !== null) {
    const interval = standard?.km_interval ?? 1000
    const alertKm = Math.floor(interval * 0.1)
    if (item.motorcycle_current_km >= item.predicted_km) return 'overdue'
    if (item.motorcycle_current_km >= item.predicted_km - alertKm) return 'upcoming'
    return 'scheduled'
  }

  return 'scheduled'
}

function statusOrder(s: MaintenanceStatus) {
  return { overdue: 0, upcoming: 1, scheduled: 2, completed: 3 }[s]
}

function fmtKm(km: number) {
  return km.toLocaleString('pt-BR') + ' km'
}

function diffKm(item: MaintenanceRecord) {
  if (!item.predicted_km) return null
  return item.predicted_km - item.motorcycle_current_km
}

function diffDays(item: MaintenanceRecord) {
  if (!item.scheduled_date) return null
  const data = new Date(item.scheduled_date)
  return Math.floor((data.getTime() - TODAY.getTime()) / 86400000)
}

// ─── badge de status ──────────────────────────────────────────────────────────

function BadgeStatus({ status }: { status: MaintenanceStatus }) {
  const map: Record<MaintenanceStatus, { label: string; cls: string }> = {
    overdue:  { label: 'Vencida',  cls: 'bg-red-500/15 text-red-400 border-red-500/25' },
    upcoming:  { label: 'Próxima',  cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
    scheduled: { label: 'Agendada', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
    completed:{ label: 'Realizada',cls: 'bg-green-500/15 text-green-400 border-green-500/25' },
  }
  const b = map[status]
  return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${b.cls}`}>{b.label}</span>
}

function BadgeType({ type }: { type: 'preventive' | 'corrective' | 'inspection' }) {
  const map = {
    preventive: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    corrective:  'bg-orange-500/10 text-orange-400 border-orange-500/20',
    inspection:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border capitalize ${map[type]}`}>
      {type}
    </span>
  )
}

// ─── formulários padrão ───────────────────────────────────────────────────────

const defaultRegister = {
  // step 1 — dados técnicos
  step: 1 as 1 | 2,
  actual_km: '',
  workshop: 'Oficina do Careca',
  observations: '',
  extraItems: [] as string[],
  // step 2 — dados financeiros por item (inicializado ao avançar para step 2)
  financialItems: [] as FinancialItem[],
  discountConfirmed: false, // confirmação explícita para descontar na cobrança (caso 50/50)
}

const defaultNew = {
  motorcycle_id: '',
  standard_item_id: '',
  type: 'preventive' as 'preventive' | 'corrective' | 'inspection',
  description: '',
  predicted_km: '',
  scheduled_date: '',
  observations: '',
}

const defaultUpdateKm = { motorcycle_id: '', current_km: '' }

// ─── componente principal ─────────────────────────────────────────────────────

export default function MaintenancePage() {
  const [motorcycles, setMotorcycles] = useState<MotorcycleWithKm[]>(mockMotorcyclesInit)
  const [maintenances, setMaintenances] = useState<MaintenanceRecord[]>(mockMaintenancesInit)

  // filtros
  const [statusFilter, setStatusFilter] = useState<string>('todas')
  const [motorcycleFilter, setMotorcycleFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // modais
  const [registeringItem, setRegisteringItem] = useState<MaintenanceRecord | null>(null)
  const [registerForm, setRegisterForm] = useState(defaultRegister)

  const [newModalOpen, setNewModalOpen] = useState(false)
  const [newForm, setNewForm] = useState(defaultNew)

  const [kmModalOpen, setKmModalOpen] = useState(false)
  const [kmForm, setKmForm] = useState(defaultUpdateKm)

  const [deletingItem, setDeletingItem] = useState<MaintenanceRecord | null>(null)
  const [detailItem, setDetailItem] = useState<MaintenanceRecord | null>(null)

  // histórico por motorcycle (colapsado por padrão)
  const [historyMotorcycles, setHistoryMotorcycles] = useState<Set<string>>(new Set())
  function toggleHistory(id: string) {
    setHistoryMotorcycles((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── computed ────────────────────────────────────────────────────────────────

  const withStatus = useMemo(() =>
    maintenances.map((m) => {
      const motorcycle = motorcycles.find((mo) => mo.id === m.motorcycle_id)
      const currentKm = motorcycle?.current_km ?? m.motorcycle_current_km
      const mCurrent = { ...m, motorcycle_current_km: currentKm }
      return { ...mCurrent, _status: calculateStatus(mCurrent) }
    }),
    [maintenances, motorcycles]
  )

  const filtered = useMemo(() => {
    return withStatus
      .filter((m) => {
        if (statusFilter !== 'todas' && m._status !== statusFilter) return false
        if (motorcycleFilter && m.motorcycle_id !== motorcycleFilter) return false
        if (searchQuery) {
          const b = searchQuery.toLowerCase()
          if (![m.motorcycle_plate, m.motorcycle_model, m.description, m.observations].some((v) => v?.toLowerCase().includes(b))) return false
        }
        return true
      })
      .sort((a, b) => statusOrder(a._status) - statusOrder(b._status))
  }, [withStatus, statusFilter, motorcycleFilter, searchQuery])

  // ── agrupamento por motorcycle ────────────────────────────────────────────────────

  type MaintenanceWithStatus = MaintenanceRecord & { _status: MaintenanceStatus }

  const byMotorcycle = useMemo(() => {
    const map = new Map<string, { motorcycle: MotorcycleWithKm; items: MaintenanceWithStatus[] }>()
    filtered.forEach((item) => {
      if (!map.has(item.motorcycle_id)) {
        const motorcycle = motorcycles.find((m) => m.id === item.motorcycle_id) ?? {
          id: item.motorcycle_id, plate: item.motorcycle_plate, model: item.motorcycle_model, current_km: item.motorcycle_current_km,
        }
        map.set(item.motorcycle_id, { motorcycle, items: [] })
      }
      map.get(item.motorcycle_id)!.items.push(item)
    })
    return Array.from(map.values()).sort((a, b) => {
      const worstStatusPriority = (items: MaintenanceWithStatus[]) =>
        items.some((i) => i._status === 'overdue') ? 0
        : items.some((i) => i._status === 'upcoming') ? 1
        : items.some((i) => i._status === 'scheduled') ? 2
        : 3
      return worstStatusPriority(a.items) - worstStatusPriority(b.items)
    })
  }, [filtered, motorcycles])

  // por padrão todas as motorcycles começam expandidas; quando o usuário clica, entra no set de colapsadas
  const [collapsedMotorcycles, setCollapsedMotorcycles] = useState<Set<string>>(new Set())
  function toggleMotorcycle(id: string) {
    setCollapsedMotorcycles((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalOverdue  = withStatus.filter((m) => m._status === 'overdue').length
  const totalUpcoming  = withStatus.filter((m) => m._status === 'upcoming').length
  const totalScheduled = withStatus.filter((m) => m._status === 'scheduled').length
  const totalMonth = withStatus.filter((m) => {
    if (!m.completed_date) return false
    const d = new Date(m.completed_date)
    return d.getFullYear() === TODAY.getFullYear() && d.getMonth() === TODAY.getMonth()
  }).length

  // ── tabs ────────────────────────────────────────────────────────────────────

  const tabs = [
    { value: 'todas',    label: 'Todas',    count: withStatus.length },
    { value: 'overdue',  label: 'Vencidas', count: totalOverdue },
    { value: 'upcoming',  label: 'Próximas', count: totalUpcoming },
    { value: 'scheduled', label: 'Agendadas',count: totalScheduled },
    { value: 'completed',label: 'Realizadas', count: withStatus.filter(m => m.completed).length },
  ]

  // ── ações ───────────────────────────────────────────────────────────────────

  function openRecord(item: MaintenanceRecord) {
    setRegisteringItem(item)
    setRegisterForm({ ...defaultRegister, actual_km: item.motorcycle_current_km ? String(item.motorcycle_current_km) : '' })
  }

  // helper: registra um item como realizado e agenda o próximo
  function registerItem(
    list: MaintenanceRecord[],
    item: MaintenanceRecord,
    actualKm: number,
    today: string,
    workshop: string,
    observations: string,
    hasOdometerPhoto: boolean,
    hasInvoicePhoto: boolean,
    cost: number | null,
    seed: number,
  ) {
    const standard = DEFAULT_ITEMS.find((p) => p.id === item.standard_item_id)
    const idx = list.findIndex((m) => m.id === item.id)
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        completed: true,
        actual_km: actualKm,
        completed_date: today,
        cost,
        workshop,
        observations: observations || list[idx].observations,
        odometer_photo_url: hasOdometerPhoto ? 'foto_odometro.jpg' : list[idx].odometer_photo_url,
        invoice_photo_url: hasInvoicePhoto ? 'nota_fiscal.jpg' : list[idx].invoice_photo_url,
      }
    }
    // auto-agenda próxima (km-based)
    if (standard?.km_interval) {
      list.push({
        ...item,
        id: String(Date.now() + seed),
        completed: false,
        predicted_km: actualKm + standard.km_interval,
        actual_km: null,
        completed_date: null,
        cost: null,
        workshop: null,
        odometer_photo_url: null,
        invoice_photo_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
    // auto-agenda próxima vistoria (30 days)
    if (standard?.day_interval) {
      const nextDate = new Date(TODAY)
      nextDate.setDate(nextDate.getDate() + standard.day_interval)
      list.push({
        ...item,
        id: String(Date.now() + seed + 1),
        completed: false,
        predicted_km: null,
        actual_km: null,
        scheduled_date: nextDate.toISOString().split('T')[0],
        completed_date: null,
        cost: null,
        workshop: null,
        odometer_photo_url: null,
        invoice_photo_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }

  function confirmRecord() {
    if (!registeringItem) return
    const actualKm = parseInt(registerForm.actual_km) || 0
    const today   = TODAY.toISOString().split('T')[0]
    const motorcycleContract = motorcycles.find((m) => m.id === registeringItem.motorcycle_id)?.contract

    // ── TODO: substituir console.log por chamadas Supabase ao integrar ───────
    // Para cada item: criar despesa e (se 50/50 confirmado) atualizar cobrança
    const allItemsLog: MaintenanceRecord[] = [
      registeringItem,
      ...registerForm.extraItems
        .map((id) => { /* acesso read-only ao prev não disponível aqui; usamos estado direto */ return maintenances.find((m) => m.id === id) })
        .filter((m): m is MaintenanceRecord => !!m),
    ]
    allItemsLog.forEach((item) => {
      const fin = registerForm.financialItems.find((f) => f.id === item.id)
      const v = parseFloat(fin?.value.replace(',', '.') ?? '0') || 0
      if (v <= 0) return
      const r = fin?.responsibility ?? 'empresa' // usa a seleção manual do usuário
      const desc = `Manutenção — ${item.description} (${item.motorcycle_plate})`
      if (r === 'empresa') {
        console.log('[DESPESA] categoria=Manutenção | value=', v, '| descrição=', desc, '| forma=Caixa da empresa')
      } else if (r === 'cliente') {
        console.log('[DESPESA] categoria=Manutenção | value=', v, '| descrição=', desc, '| forma=Pago pelo cliente')
      } else {
        console.log('[DESPESA] categoria=Manutenção | value empresa=', v / 2, '| descrição=', desc)
        if (registerForm.discountConfirmed && motorcycleContract) {
          console.log('[COBRANÇA] desconto=', v / 2, '| cliente=', motorcycleContract.customer_name, '| semana=', motorcycleContract.next_billing)
        }
      }
    })

    setMaintenances((prev) => {
      const updated = [...prev]

      // registra o item principal com seu cost individual
      const mainFin = registerForm.financialItems.find((f) => f.id === registeringItem.id)
      const mainCost = parseFloat(mainFin?.value.replace(',', '.') ?? '0') || null
      registerItem(
        updated, registeringItem, actualKm, today,
        registerForm.workshop, registerForm.observations,
        mainFin?.has_odometer_photo ?? false,
        mainFin?.has_invoice_photo ?? false,
        mainCost, 0,
      )

      // registra items extras com cost e fotos individuais
      registerForm.extraItems.forEach((extraId, i) => {
        const extraItem = prev.find((m) => m.id === extraId)
        if (!extraItem) return
        const extraFin = registerForm.financialItems.find((f) => f.id === extraId)
        const extraCost = parseFloat(extraFin?.value.replace(',', '.') ?? '0') || null
        registerItem(
          updated, extraItem, actualKm, today,
          registerForm.workshop, '',
          extraFin?.has_odometer_photo ?? false,
          extraFin?.has_invoice_photo ?? false,
          extraCost, (i + 1) * 100,
        )
      })

      return updated
    })

    // atualiza current_km da motorcycle
    if (actualKm > 0) {
      setMotorcycles((prev) =>
        prev.map((mo) =>
          mo.id === registeringItem.motorcycle_id && actualKm > mo.current_km
            ? { ...mo, current_km: actualKm }
            : mo
        )
      )
    }

    setRegisteringItem(null)
    setRegisterForm(defaultRegister)
  }

  function handleNewMaintenance(e: React.FormEvent) {
    e.preventDefault()
    const motorcycle = motorcycles.find((m) => m.id === newForm.motorcycle_id)
    if (!motorcycle) return
    const standard = DEFAULT_ITEMS.find((p) => p.id === newForm.standard_item_id)
    const newMaintenance: MaintenanceRecord = {
      id: String(Date.now()),
      motorcycle_id: newForm.motorcycle_id,
      standard_item_id: newForm.standard_item_id || null,
      type: standard?.type ?? newForm.type,
      description: newForm.description || standard?.name || '',
      predicted_km: newForm.predicted_km ? parseInt(newForm.predicted_km) : null,
      actual_km: null,
      scheduled_date: newForm.scheduled_date || null,
      completed_date: null,
      cost: null,
      completed: false,
      workshop: null,
      odometer_photo_url: null,
      invoice_photo_url: null,
      observations: newForm.observations || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      motorcycle_plate: motorcycle.plate,
      motorcycle_model: motorcycle.model,
      motorcycle_current_km: motorcycle.current_km,
    }
    setMaintenances((prev) => [newMaintenance, ...prev])
    setNewForm(defaultNew)
    setNewModalOpen(false)
  }

  function handleUpdateKm(e: React.FormEvent) {
    e.preventDefault()
    const km = parseInt(kmForm.current_km)
    if (!kmForm.motorcycle_id || !km) return
    setMotorcycles((prev) =>
      prev.map((m) => m.id === kmForm.motorcycle_id ? { ...m, current_km: km } : m)
    )
    setMaintenances((prev) =>
      prev.map((m) => m.motorcycle_id === kmForm.motorcycle_id ? { ...m, motorcycle_current_km: km } : m)
    )
    setKmForm(defaultUpdateKm)
    setKmModalOpen(false)
  }

  function confirmDeletion() {
    if (!deletingItem) return
    setMaintenances((prev) => prev.filter((m) => m.id !== deletingItem.id))
    setDeletingItem(null)
  }

  // ── colunas tabela pendentes (mantidas para referência / uso futuro) ────────

  const pendingCols = [
    {
      key: 'motorcycle',
      header: 'Motorcycle',
      render: (row: MaintenanceWithStatus) => (
        <div>
          <p className="font-mono text-sm font-semibold text-white">{row.motorcycle_plate}</p>
          <p className="text-xs text-[#A0A0A0]">{row.motorcycle_model}</p>
        </div>
      ),
    },
    {
      key: 'item',
      header: 'Item',
      render: (row: MaintenanceWithStatus) => (
        <div className="max-w-[200px]">
          <p className="text-white text-sm">{row.description}</p>
          <BadgeType type={row.type} />
        </div>
      ),
    },
    {
      key: 'prediction',
      header: 'Prediction',
      render: (row: MaintenanceWithStatus) => {
        if (row.predicted_km !== null) {
          return (
            <div>
              <p className="text-white text-sm">{fmtKm(row.predicted_km)}</p>
              <p className="text-xs text-[#A0A0A0]">Atual: {fmtKm(row.motorcycle_current_km)}</p>
            </div>
          )
        }
        if (row.scheduled_date) {
          return (
            <div>
              <p className="text-white text-sm">{formatDate(row.scheduled_date)}</p>
              <p className="text-xs text-[#A0A0A0]">Vistoria mensal</p>
            </div>
          )
        }
        return <span className="text-[#A0A0A0]">—</span>
      },
    },
    {
      key: 'remaining',
      header: 'Situação',
      render: (row: MaintenanceWithStatus) => {
        const km = diffKm(row)
        const days = diffDays(row)
        if (km !== null) {
          if (km <= 0) return <span className="text-red-400 text-sm font-medium">Vencida há {fmtKm(Math.abs(km))}</span>
          return <span className={`text-sm font-medium ${km <= 100 ? 'text-amber-400' : 'text-[#A0A0A0]'}`}>Faltam {fmtKm(km)}</span>
        }
        if (days !== null) {
          if (days < 0) return <span className="text-red-400 text-sm font-medium">Overdue for {Math.abs(days)} days</span>
          if (days === 0) return <span className="text-amber-400 text-sm font-medium">Due today</span>
          return <span className={`text-sm font-medium ${days <= 3 ? 'text-amber-400' : 'text-[#A0A0A0]'}`}>In {days} days</span>
        }
        return <span className="text-[#A0A0A0]">—</span>
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: MaintenanceWithStatus) => <BadgeStatus status={row._status} />,
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row: MaintenanceWithStatus) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            onClick={() => openRecord(row)}
            className="text-xs px-2 py-1 h-auto text-[#BAFF1A] hover:bg-[#BAFF1A]/10"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Registrar
          </Button>
          <button
            onClick={() => setDeletingItem(row)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  const completedCols = [
    {
      key: 'motorcycle',
      header: 'Motorcycle',
      render: (row: MaintenanceWithStatus) => (
        <div>
          <p className="font-mono text-sm font-semibold text-white">{row.motorcycle_plate}</p>
          <p className="text-xs text-[#A0A0A0]">{row.motorcycle_model}</p>
        </div>
      ),
    },
    {
      key: 'item',
      header: 'Item',
      render: (row: MaintenanceWithStatus) => (
        <div>
          <p className="text-white text-sm">{row.description}</p>
          <BadgeType type={row.type} />
        </div>
      ),
    },
    {
      key: 'actual_km',
      header: 'KM Realizado',
      render: (row: MaintenanceWithStatus) => (
        <span className="text-white text-sm">
          {row.actual_km !== null ? fmtKm(row.actual_km) : '—'}
        </span>
      ),
    },
    {
      key: 'data',
      header: 'Data',
      render: (row: MaintenanceWithStatus) => (
        <span>{row.completed_date ? formatDate(row.completed_date) : '—'}</span>
      ),
    },
    {
      key: 'workshop',
      header: 'Oficina',
      render: (row: MaintenanceWithStatus) => (
        <span className="text-sm text-[#A0A0A0]">{row.workshop ?? '—'}</span>
      ),
    },
    {
      key: 'fotos',
      header: 'Docs',
      render: (row: MaintenanceWithStatus) => (
        <div className="flex gap-1">
          {row.odometer_photo_url
            ? <span title="Odômetro" className="text-green-400"><Camera className="w-4 h-4" /></span>
            : <span title="Sem foto odômetro" className="text-[#333333]"><Camera className="w-4 h-4" /></span>}
          {row.invoice_photo_url
            ? <span title="Nota fiscal" className="text-green-400"><FileText className="w-4 h-4" /></span>
            : <span title="Sem nota fiscal" className="text-[#333333]"><FileText className="w-4 h-4" /></span>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: MaintenanceWithStatus) => (
        <div className="flex gap-1">
          <button
            onClick={() => setDetailItem(row)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
            title="Ver detalhes"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingItem(row)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  // ── colunas unificadas (usadas nas sub-tabelas agrupadas) ───────────────────

  const unifiedCols = [
    {
      key: 'item',
      header: 'Item',
      render: (row: MaintenanceWithStatus) => (
        <div className="max-w-[180px]">
          <p className="text-white text-sm">{row.description}</p>
          <BadgeType type={row.type} />
        </div>
      ),
    },
    {
      key: 'prediction',
      header: 'Prediction / Completed',
      render: (row: MaintenanceWithStatus) => {
        if (row.completed) {
          return (
            <div>
              <p className="text-white text-sm">{row.actual_km !== null ? fmtKm(row.actual_km) : '—'}</p>
              {row.completed_date && <p className="text-xs text-[#A0A0A0]">{formatDate(row.completed_date)}</p>}
            </div>
          )
        }
        if (row.predicted_km !== null) {
          return (
            <div>
              <p className="text-white text-sm">{fmtKm(row.predicted_km)}</p>
              <p className="text-xs text-[#A0A0A0]">Atual: {fmtKm(row.motorcycle_current_km)}</p>
            </div>
          )
        }
        if (row.scheduled_date) return <p className="text-white text-sm">{formatDate(row.scheduled_date)}</p>
        return <span className="text-[#A0A0A0]">—</span>
      },
    },
    {
      key: 'situation',
      header: 'Situação',
      render: (row: MaintenanceWithStatus) => {
        if (row.completed) return <span className="text-xs text-[#A0A0A0]">{row.workshop ?? '—'}</span>
        const km = diffKm(row)
        const days = diffDays(row)
        if (km !== null) {
          if (km <= 0) return <span className="text-red-400 text-sm font-medium">Vencida há {fmtKm(Math.abs(km))}</span>
          return <span className={`text-sm font-medium ${km <= 100 ? 'text-amber-400' : 'text-[#A0A0A0]'}`}>Faltam {fmtKm(km)}</span>
        }
        if (days !== null) {
          if (days < 0) return <span className="text-red-400 text-sm font-medium">Overdue for {Math.abs(days)} days</span>
          if (days === 0) return <span className="text-amber-400 text-sm font-medium">Due today</span>
          return <span className={`text-sm font-medium ${days <= 3 ? 'text-amber-400' : 'text-[#A0A0A0]'}`}>In {days} days</span>
        }
        return <span className="text-[#A0A0A0]">—</span>
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: MaintenanceWithStatus) => <BadgeStatus status={row._status} />,
    },
    {
      key: 'docs',
      header: 'Docs',
      render: (row: MaintenanceWithStatus) => row.completed ? (
        <div className="flex gap-1">
          <span title="Odômetro" className={row.odometer_photo_url ? 'text-green-400' : 'text-[#333333]'}><Camera className="w-4 h-4" /></span>
          <span title="Nota fiscal" className={row.invoice_photo_url ? 'text-green-400' : 'text-[#333333]'}><FileText className="w-4 h-4" /></span>
        </div>
      ) : <span className="text-[#333333]">—</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (row: MaintenanceWithStatus) => (
        <div className="flex items-center gap-1">
          {!row.completed && (
            <Button
              variant="ghost"
              onClick={() => openRecord(row)}
              className="text-xs px-2 py-1 h-auto text-[#BAFF1A] hover:bg-[#BAFF1A]/10"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Registrar
            </Button>
          )}
          {row.completed && (
            <button
              onClick={() => setDetailItem(row)}
              className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
              title="Ver detalhes"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setDeletingItem(row)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  const motorcycleOptions = [
    { value: '', label: 'Todas as motorcycles' },
    ...motorcycles.map((m) => ({ value: m.id, label: `${m.plate} — ${m.model}` })),
  ]

  const motorcycleSelectOptions = [
    { value: '', label: 'Selecione a motorcycle' },
    ...motorcycles.map((m) => ({ value: m.id, label: `${m.plate} — ${m.model}` })),
  ]

  const itemSelectOptions = [
    { value: '', label: 'Selecione o item (ou deixe vazio p/ corretiva livre)' },
    ...DEFAULT_ITEMS.map((p) => ({ value: p.id, label: p.name })),
  ]

  const selectedStandard = DEFAULT_ITEMS.find((p) => p.id === newForm.standard_item_id)

  // ─── render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Manutenção"
        subtitle="Controle inteligente por km e data"
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => { setKmForm(defaultUpdateKm); setKmModalOpen(true) }}>
              <Gauge className="w-4 h-4" />
              Atualizar KM
            </Button>
            <Button onClick={() => { setNewForm(defaultNew); setNewModalOpen(true) }}>
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
            <p className="text-2xl font-bold text-red-400">{totalOverdue}</p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-400" />
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Próximas</p>
            </div>
            <p className="text-2xl font-bold text-amber-400">{totalUpcoming}</p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Agendadas</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">{totalScheduled}</p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Realizadas este mês</p>
            </div>
            <p className="text-2xl font-bold text-green-400">{totalMonth}</p>
          </Card>
        </div>

        {/* ── Filtros ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  statusFilter === tab.value
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
              value={motorcycleFilter}
              onChange={(e) => setMotorcycleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#202020] border border-[#333333] text-sm text-white focus:outline-none focus:border-[#555555] appearance-none cursor-pointer"
            >
              {motorcycleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
              <input
                type="text"
                placeholder="Buscar item ou motorcycle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-lg bg-[#202020] border border-[#333333] text-sm text-white placeholder-[#A0A0A0] focus:outline-none focus:border-[#555555] w-56"
              />
            </div>
          </div>
        </div>

        {/* ── Agrupado por motorcycle (expansível) ──────────────────────────────── */}
        {byMotorcycle.length === 0 ? (
          <Card>
            <p className="text-center text-[#A0A0A0] py-8">Nenhuma manutenção encontrada para os filtros selecionados.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {byMotorcycle.map(({ motorcycle, items }) => {
              // Na tab "Realizadas" mostra tudo; nas demais, separa pendentes do histórico
              const showCompletedDirectly = statusFilter === 'completed'
              const pendingItems  = showCompletedDirectly ? items : items.filter((i) => !i.completed)
              const completedItems = items.filter((i) => i.completed)

              const nOverdue  = pendingItems.filter((i) => i._status === 'overdue').length
              const nUpcoming  = pendingItems.filter((i) => i._status === 'upcoming').length
              const nScheduled = pendingItems.filter((i) => i._status === 'scheduled').length
              const trafficLight   = nOverdue > 0 ? 'red' : nUpcoming > 0 ? 'amber' : 'green'
              const expanded      = !collapsedMotorcycles.has(motorcycle.id)
              const histExpanded  = historyMotorcycles.has(motorcycle.id)

              return (
                <Card key={motorcycle.id} padding="none">
                  {/* cabeçalho da motorcycle */}
                  <button
                    onClick={() => toggleMotorcycle(motorcycle.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
                  >
                    <ChevronDown
                      className={`w-4 h-4 text-[#555555] shrink-0 transition-transform duration-150 ${expanded ? '' : '-rotate-90'}`}
                    />
                    {/* semáforo (baseado apenas em pendentes) */}
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      trafficLight === 'red' ? 'bg-red-400' : trafficLight === 'amber' ? 'bg-amber-400' : 'bg-green-400'
                    }`} />
                    {/* identidade */}
                    <span className="font-mono font-bold text-white text-sm">{motorcycle.plate}</span>
                    <span className="text-sm text-[#A0A0A0]">{motorcycle.model}</span>
                    <span className="text-xs text-[#555555]">· {fmtKm(motorcycle.current_km)}</span>
                    {/* badges de pendentes */}
                    <div className="ml-auto flex items-center gap-1.5">
                      {nOverdue > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/25">
                          {nOverdue} vencida{nOverdue > 1 ? 's' : ''}
                        </span>
                      )}
                      {nUpcoming > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/25">
                          {nUpcoming} próxima{nUpcoming > 1 ? 's' : ''}
                        </span>
                      )}
                      {nScheduled > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/25">
                          {nScheduled} agendada{nScheduled > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* items expandidos */}
                  {expanded && (
                    <div className="border-t border-[#2A2A2A]">
                      {/* tabela de pendentes (ou realizadas se tab ativa) */}
                      {pendingItems.length > 0 ? (
                        <Table
                          columns={unifiedCols}
                          data={pendingItems}
                          keyExtractor={(r) => r.id}
                          emptyMessage="Sem items"
                        />
                      ) : !showCompletedDirectly ? (
                        <p className="text-center text-[#555555] py-5 text-sm">Todas as manutenções em dia.</p>
                      ) : null}

                      {/* toggle de histórico — só nas tabs que não são "Realizadas" */}
                      {!showCompletedDirectly && completedItems.length > 0 && (
                        <div className={pendingItems.length > 0 ? 'border-t border-[#2A2A2A]' : ''}>
                          <button
                            onClick={() => toggleHistory(motorcycle.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#555555] hover:text-[#A0A0A0] transition-colors"
                          >
                            <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${histExpanded ? '' : '-rotate-90'}`} />
                            {histExpanded
                              ? 'Ocultar histórico'
                              : `Ver histórico (${completedItems.length} realizada${completedItems.length > 1 ? 's' : ''})`}
                          </button>
                          {histExpanded && (
                            <div className="border-t border-[#1E1E1E]">
                              <Table
                                columns={unifiedCols}
                                data={completedItems.slice(-5).reverse()}
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
        open={!!registeringItem}
        onClose={() => setRegisteringItem(null)}
        title="Registrar Manutenção Realizada"
        size="lg"
      >
        {/* ── Etapa 1: Dados Técnicos ────────────────────────────────────────── */}
        {registeringItem && registerForm.step === 1 && (
          <div className="space-y-3">
            {/* info do item */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-3 space-y-1">
              <p className="text-white font-medium">{registeringItem.description}</p>
              <p className="text-xs text-[#A0A0A0]">{registeringItem.motorcycle_plate} — {registeringItem.motorcycle_model}</p>
              {registeringItem.predicted_km && (
                <p className="text-xs text-amber-400">KM previsto: {fmtKm(registeringItem.predicted_km)}</p>
              )}
              {registeringItem.scheduled_date && (
                <p className="text-xs text-amber-400">Data prevista: {formatDate(registeringItem.scheduled_date)}</p>
              )}
              {(() => {
                const p = DEFAULT_ITEMS.find((ip) => ip.id === registeringItem.standard_item_id)
                return p?.tip ? <p className="text-xs text-[#666666] mt-1 italic">{p.tip}</p> : null
              })()}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="KM do Odômetro *"
                type="number"
                placeholder={String(registeringItem.motorcycle_current_km)}
                value={registerForm.actual_km}
                onChange={(e) => setRegisterForm({ ...registerForm, actual_km: e.target.value })}
                required
              />
              <Input
                label="Oficina"
                value={registerForm.workshop}
                onChange={(e) => setRegisterForm({ ...registerForm, workshop: e.target.value })}
              />
            </div>

            <Textarea
              label="Observações"
              rows={1}
              value={registerForm.observations}
              onChange={(e) => setRegisterForm({ ...registerForm, observations: e.target.value })}
            />

            {(() => {
              const actualKm = parseInt(registerForm.actual_km) || registeringItem.motorcycle_current_km
              const standard = DEFAULT_ITEMS.find((ip) => ip.id === registeringItem.standard_item_id)

              // próximo deste item
              const nextKmItem = standard?.km_interval ? actualKm + standard.km_interval : null
              const nextDateItem = standard?.day_interval
                ? (() => { const d = new Date(TODAY); d.setDate(d.getDate() + standard.day_interval!); return d.toISOString().split('T')[0] })()
                : null

              // outros pendentes desta motorcycle (vencidos ou próximos) → sugerir juntar
              const suggested = withStatus.filter(
                (m) => m.motorcycle_id === registeringItem.motorcycle_id
                  && !m.completed
                  && m.id !== registeringItem.id
                  && (m._status === 'overdue' || m._status === 'upcoming')
              )

              // helper: "A, B e C"
              function joinNames(nomes: string[]) {
                if (nomes.length === 0) return ''
                if (nomes.length === 1) return nomes[0]
                return nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1]
              }

              // converte km em days estimados usando a taxa média de uso da frota
              function kmInDays(km: number) { return km / KM_PER_DAY }

              // IDs dos items que serão feitos nesta operação (este item + extras marcados)
              const idsBeingDone = new Set([registeringItem.id, ...registerForm.extraItems])

              // suggested: split entre marcados (serão feitos) e pendentes (ficam em aberto)
              const suggestedChecked = suggested.filter((m) => registerForm.extraItems.includes(m.id))
              const suggestedPending = suggested.filter((m) => !registerForm.extraItems.includes(m.id))

              // vencidos que NÃO serão feitos agora → próxima visita é "imediata"
              const remainingOverdue = suggestedPending.filter((m) => m._status === 'overdue')

              // todos os items pendentes desta motorcycle (não sendo feitos agora)
              const allPending = withStatus.filter(
                (m) => m.motorcycle_id === registeringItem.motorcycle_id && !m.completed && !idsBeingDone.has(m.id)
              )

              // ── candidates para "próxima visita" ─────────────────────────────────
              // Regra: items sendo feitos → usa actualKm + intervalo (próximo ciclo)
              //        items pendentes restantes → usa predicted_km/data atual deles
              type Cand = { km: number | null; dias: number | null; name: string }
              const candidates: Cand[] = []

              // próximo ciclo deste item (sendo feito agora)
              if (nextKmItem)   candidates.push({ km: nextKmItem, dias: null, name: standard!.name })
              if (nextDateItem) candidates.push({ km: null, dias: 30, name: standard!.name })

              // próximo ciclo dos extras marcados (sendo feitos agora)
              suggestedChecked.forEach((m) => {
                const p = DEFAULT_ITEMS.find((ip) => ip.id === m.standard_item_id)
                if (p?.km_interval)  candidates.push({ km: actualKm + p.km_interval, dias: null, name: m.description })
                if (p?.day_interval) candidates.push({ km: null, dias: p.day_interval, name: m.description })
              })

              // items que FICAM pendentes → usam seu predicted_km/data atual (podem ser mais próximos!)
              allPending.forEach((m) => {
                if (m.predicted_km !== null && m.predicted_km > actualKm) {
                  candidates.push({ km: m.predicted_km, dias: null, name: m.description })
                }
                if (m.scheduled_date) {
                  const d = Math.floor((new Date(m.scheduled_date).getTime() - TODAY.getTime()) / 86400000)
                  if (d >= 0) candidates.push({ km: null, dias: d, name: m.description })
                }
              })

              // menor candidato km-based e date-based
              const kmCands  = candidates.filter((c) => c.km  !== null).sort((a, b) => a.km!  - b.km!)
              const dayCands = candidates.filter((c) => c.dias !== null).sort((a, b) => a.dias! - b.dias!)
              const nextKm  = kmCands[0]  ?? null
              const nextDay = dayCands[0] ?? null

              const allSuggestedOverdue = suggested.length > 0 && suggested.every((m) => m._status === 'overdue')
              const someOverdue = suggested.some((m) => m._status === 'overdue')

              // frase da próxima ida — considera vencidas restantes como caso urgente
              function phraseNextVisit() {
                // Se há vencidas não selecionadas → próxima visita é "imediata"
                if (remainingOverdue.length > 0) {
                  return (
                    <>
                      há{' '}
                      {remainingOverdue.length === 1
                        ? 'uma manutenção vencida ainda pendente'
                        : 'manutenções vencidas ainda pendentes'}
                      : <strong>{joinNames(remainingOverdue.map((m) => m.description))}</strong>. Resolva o quanto antes!
                    </>
                  )
                }

                if (!nextKm && !nextDay) return null

                const daysForKm   = nextKm  ? kmInDays(nextKm.km! - actualKm) : Infinity
                const daysForDate = nextDay ? nextDay.dias!                  : Infinity

                if (daysForKm <= daysForDate) {
                  // próximo item é km-based — mostra km e estimativa em semanas
                  const namesSameKm = kmCands.filter((c) => c.km === nextKm!.km).map((c) => c.name)
                  const approxWeeks = Math.round(daysForKm / 7)
                  return (
                    <>
                      a próxima ida à workshop será somente daqui{' '}
                      <strong>{fmtKm(nextKm!.km! - actualKm)}</strong>
                      {approxWeeks > 0 && <span> (~{approxWeeks} {approxWeeks === 1 ? 'semana' : 'semanas'})</span>}
                      {' '}para <strong>{joinNames(namesSameKm)}</strong>.
                    </>
                  )
                }
                // próximo item é date-based
                const remainingDays = nextDay!.dias!
                const approxWeeks  = Math.round(remainingDays / 7)
                return (
                  <>
                    a próxima manutenção será daqui{' '}
                    <strong>{remainingDays} {remainingDays === 1 ? 'dia' : 'days'}</strong>
                    {approxWeeks > 1 && <span> (~{approxWeeks} semanas)</span>}
                    {' '}para <strong>{nextDay!.name}</strong>.
                  </>
                )
              }

              return (
                <div className="space-y-2 text-xs">
                  {/* próximo deste item */}
                  {(nextKmItem || nextDateItem) && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-blue-400">
                      Próxima <strong>{standard!.name}</strong>:{' '}
                      {nextKmItem
                        ? <><strong>{fmtKm(nextKmItem)}</strong> <span className="text-blue-300">— daqui {fmtKm(nextKmItem - actualKm)}</span></>
                        : <><strong>{formatDate(nextDateItem!)}</strong> <span className="text-blue-300">— daqui 30 days</span></>
                      }
                    </div>
                  )}

                  {/* sem standard (corretiva): mostra próxima da motorcycle */}
                  {!nextKmItem && !nextDateItem && (() => {
                    const next = withStatus
                      .filter((m) => m.motorcycle_id === registeringItem.motorcycle_id && !m.completed && m.id !== registeringItem.id && m.predicted_km !== null)
                      .sort((a, b) => (a.predicted_km ?? 0) - (b.predicted_km ?? 0))[0]
                    if (!next) return null
                    return (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-blue-400">
                        Próxima manutenção desta motorcycle: <strong>{next.description}</strong> em{' '}
                        <strong>{fmtKm(next.predicted_km!)}</strong>{' '}
                        <span className="text-blue-300">— daqui {fmtKm(next.predicted_km! - actualKm)}</span>
                      </div>
                    )
                  })()}

                  {/* sugestão de juntar com checkboxes */}
                  {suggested.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 space-y-2">
                      <p className="text-amber-300 leading-relaxed">
                        Aproveite e faça também
                        {suggested.length === 1
                          ? allSuggestedOverdue ? ' (já vencida):' : ' (chegando no limite):'
                          : allSuggestedOverdue ? ' (já vencidas):'
                          : someOverdue ? ' (algumas vencidas):'
                          : ' (chegando no limite):'}
                      </p>
                      <div className="space-y-1.5">
                        {suggested.map((sug) => {
                          const checked = registerForm.extraItems.includes(sug.id)
                          return (
                            <label
                              key={sug.id}
                              className="flex items-center gap-2.5 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setRegisterForm((prev) => ({
                                    ...prev,
                                    extraItems: checked
                                      ? prev.extraItems.filter((id) => id !== sug.id)
                                      : [...prev.extraItems, sug.id],
                                  }))
                                }}
                                className="w-4 h-4 rounded border-amber-500/40 bg-transparent accent-amber-400 cursor-pointer"
                              />
                              <span className="text-amber-200 text-xs group-hover:text-white transition-colors">
                                {sug.description}
                                {sug._status === 'overdue'
                                  ? <span className="ml-1 text-red-400">(vencida)</span>
                                  : <span className="ml-1 text-amber-400">(próxima)</span>}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                      <p className={`text-xs pt-1 border-t border-amber-500/20 leading-relaxed ${remainingOverdue.length > 0 ? 'text-red-300' : 'text-amber-300'}`}>
                        {registerForm.extraItems.length > 0 ? 'Juntando tudo, ' : 'Após registrar este item, '}
                        {phraseNextVisit()}
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}

            <div className="flex gap-3 justify-end pt-1">
              <Button variant="ghost" onClick={() => setRegisteringItem(null)}>Cancelar</Button>
              <Button
                onClick={() => {
                  if (!registeringItem) return
                  const mainItem = registeringItem // captura para uso em funções aninhadas
                  // detecta responsabilidade padrão de cada item conforme contract da motorcycle
                  const contract = motorcycles.find((m) => m.id === mainItem.motorcycle_id)?.contract
                  function autoResp(itemId: string): ResponsibleItem {
                    const item = itemId === mainItem.id
                      ? mainItem
                      : maintenances.find((m) => m.id === itemId)
                    if (!contract) return 'empresa'
                    if (contract.type === 'promessa') return 'cliente'
                    return item?.type === 'preventive' ? '50/50' : 'cliente'
                  }
                  const allIds = [registeringItem.id, ...registerForm.extraItems]
                  const financialItems: FinancialItem[] = allIds.map((id) => ({
                    id,
                    value: '',
                    has_odometer_photo: false,
                    has_invoice_photo: false,
                    responsibility: autoResp(id),
                  }))
                  setRegisterForm((prev) => ({ ...prev, step: 2, financialItems }))
                }}
                disabled={!registerForm.actual_km && !!registeringItem.predicted_km}
              >
                Continuar →
              </Button>
            </div>
          </div>
        )}

        {/* ── Etapa 2: Dados Financeiros (por item) ──────────────────────────── */}
        {registeringItem && registerForm.step === 2 && (() => {
          const contract = motorcycles.find((m) => m.id === registeringItem.motorcycle_id)?.contract

          // Todos os items desta operação (principal + extras)
          const allItems: MaintenanceRecord[] = [
            registeringItem,
            ...registerForm.extraItems
              .map((id) => maintenances.find((m) => m.id === id))
              .filter((m): m is MaintenanceRecord => !!m),
          ]

          function updateFin(id: string, updates: Partial<FinancialItem>) {
            setRegisterForm((prev) => ({
              ...prev,
              financialItems: prev.financialItems.map((f) =>
                f.id === id ? { ...f, ...updates } : f
              ),
            }))
          }

          // Totais para o resumo final (usa responsibility individual de cada item)
          let totalCompany = 0
          let totalCustomer = 0
          let totalCustomerDiscount = 0
          let some5050WithValue = false
          allItems.forEach((item) => {
            const fin = registerForm.financialItems.find((f) => f.id === item.id)
            const v = parseFloat(fin?.value.replace(',', '.') ?? '0') || 0
            const r = fin?.responsibility ?? 'empresa'
            if (r === 'empresa') totalCompany += v
            else if (r === 'cliente') totalCustomer += v
            else if (r === '50/50' && v > 0) { totalCompany += v / 2; totalCustomerDiscount += v / 2; some5050WithValue = true }
          })

          // Ao menos um item com value preenchido
          const someValue = registerForm.financialItems.some(
            (f) => parseFloat(f.value.replace(',', '.')) > 0
          )

          // cores do botão ativo no toggle por opção
          const activeToggle: Record<ResponsibleItem, string> = {
            '50/50':   'bg-amber-500/20 text-amber-300 border-amber-500/40',
            empresa:   'bg-blue-500/20  text-blue-300  border-blue-500/40',
            cliente:   'bg-green-500/20 text-green-300 border-green-500/40',
          }

          return (
            <div className="space-y-3">
              {/* Cabeçalho: motorcycle + KM */}
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-[#A0A0A0]">
                  {registeringItem.motorcycle_plate} · {fmtKm(parseInt(registerForm.actual_km) || registeringItem.motorcycle_current_km)} · {registerForm.workshop}
                </p>
                <p className="text-xs text-[#555555]">{allItems.length} item{allItems.length > 1 ? 's' : ''}</p>
              </div>

              {/* Card por item */}
              <div className="space-y-2">
                {allItems.map((item) => {
                  const fin = registerForm.financialItems.find((f) => f.id === item.id) ?? {
                    id: item.id, value: '', has_odometer_photo: false, has_invoice_photo: false, responsibility: 'empresa' as ResponsibleItem,
                  }
                  const v = parseFloat(fin.value.replace(',', '.')) || 0
                  const responsibility = fin.responsibility

                  return (
                    <div key={item.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-2.5 space-y-2">
                      {/* Nome + type */}
                      <div className="flex items-center gap-2">
                        <BadgeType type={item.type} />
                        <span className="text-sm text-white font-medium flex-1 truncate">{item.description}</span>
                      </div>

                      {/* Label + toggle numa linha só */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-[#555555] shrink-0">Quem paga?</span>
                        <div className="flex rounded-lg overflow-hidden border border-[#2A2A2A] text-xs">
                          {(['50/50', 'empresa', 'cliente'] as ResponsibleItem[]).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => updateFin(item.id, { responsibility: opt })}
                              className={`px-3 py-1.5 transition-colors border-r border-[#2A2A2A] last:border-r-0 ${
                                responsibility === opt
                                  ? activeToggle[opt]
                                  : 'bg-transparent text-[#555555] hover:text-[#A0A0A0]'
                              }`}
                            >
                              {opt === '50/50' ? '50/50' : opt === 'empresa' ? 'Empresa' : 'Cliente'}
                            </button>
                          ))}
                        </div>
                        <span className="text-xs text-[#444444]">
                          {responsibility === '50/50' && 'Custo dividido pela metade.'}
                          {responsibility === 'empresa' && 'Sairá do caixa da empresa.'}
                          {responsibility === 'cliente' && 'Cliente pagou — lançado em Despesas.'}
                        </span>
                      </div>

                      {/* Valor + fotos em linha */}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="R$ 0,00"
                          step="0.01"
                          value={fin.value}
                          onChange={(e) => updateFin(item.id, { value: e.target.value })}
                          className="flex-1 bg-[#111111] border border-[#333333] rounded-lg px-3 py-1.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#555555]"
                        />
                        <button
                          type="button"
                          title="Foto do odômetro"
                          onClick={() => updateFin(item.id, { has_odometer_photo: !fin.has_odometer_photo })}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors whitespace-nowrap ${
                            fin.has_odometer_photo
                              ? 'border-green-500/40 bg-green-500/10 text-green-400'
                              : 'border-[#333333] bg-[#111111] text-[#555555] hover:border-[#555555] hover:text-[#A0A0A0]'
                          }`}
                        >
                          <Camera className="w-3.5 h-3.5" />
                          {fin.has_odometer_photo ? 'Odôm ✓' : 'Odôm'}
                        </button>
                        <button
                          type="button"
                          title="Nota fiscal"
                          onClick={() => updateFin(item.id, { has_invoice_photo: !fin.has_invoice_photo })}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors whitespace-nowrap ${
                            fin.has_invoice_photo
                              ? 'border-green-500/40 bg-green-500/10 text-green-400'
                              : 'border-[#333333] bg-[#111111] text-[#555555] hover:border-[#555555] hover:text-[#A0A0A0]'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {fin.has_invoice_photo ? 'NF ✓' : 'NF'}
                        </button>
                      </div>

                      {/* Preview do lançamento */}
                      {v > 0 && (
                        <div className="text-xs pt-1.5 border-t border-[#2A2A2A]">
                          {responsibility === 'empresa' && (
                            <p className="text-blue-400">→ Despesas: <strong>R$ {v.toFixed(2)}</strong> — Caixa da empresa</p>
                          )}
                          {responsibility === 'cliente' && (
                            <p className="text-green-400">→ Despesas: <strong>R$ {v.toFixed(2)}</strong> — pago pelo cliente</p>
                          )}
                          {responsibility === '50/50' && (
                            <p className="text-amber-400">→ Empresa <strong>R$ {(v / 2).toFixed(2)}</strong> + desconto <strong>R$ {(v / 2).toFixed(2)}</strong> na cobrança</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Resumo total dos lançamentos */}
              {someValue && (
                <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-3 space-y-1.5">
                  <p className="text-xs text-[#555555] pb-0.5">Resumo dos lançamentos</p>
                  {totalCompany > 0 && (
                    <p className="text-xs text-blue-400">
                      Despesa empresa: <strong>R$ {totalCompany.toFixed(2)}</strong>
                      <span className="text-blue-600"> — caixa da empresa</span>
                    </p>
                  )}
                  {totalCustomer > 0 && (
                    <p className="text-xs text-green-400">
                      Pago pelo cliente: <strong>R$ {totalCustomer.toFixed(2)}</strong>
                      <span className="text-green-600"> — lançado em Despesas</span>
                    </p>
                  )}
                  {totalCustomerDiscount > 0 && contract && (
                    <p className="text-xs text-amber-400">
                      Desconto na cobrança: <strong>R$ {totalCustomerDiscount.toFixed(2)}</strong>
                      <span className="text-amber-600"> → semana de {formatDate(contract.next_billing)}: </span>
                      <strong>R$ {(contract.weekly_value - totalCustomerDiscount).toFixed(2)}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Confirmação para aplicar desconto na cobrança (caso 50/50) */}
              {some5050WithValue && contract && (
                <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={registerForm.discountConfirmed}
                    onChange={() => setRegisterForm((prev) => ({ ...prev, discountConfirmed: !prev.discountConfirmed }))}
                    className="w-4 h-4 mt-0.5 accent-amber-400 cursor-pointer"
                  />
                  <span className="text-xs text-amber-200 leading-relaxed">
                    Confirmo: aplicar desconto de <strong>R$ {totalCustomerDiscount.toFixed(2)}</strong> na cobrança da semana de{' '}
                    <strong>{formatDate(contract.next_billing)}</strong> — {contract.customer_name}
                  </span>
                </label>
              )}

              <div className="flex gap-3 justify-end pt-1">
                <Button variant="ghost" onClick={() => setRegisterForm((prev) => ({ ...prev, step: 1 }))}>
                  ← Voltar
                </Button>
                <Button
                  onClick={confirmRecord}
                  disabled={!someValue || (some5050WithValue && !registerForm.discountConfirmed)}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {allItems.length > 1
                    ? `Confirmar ${allItems.length} items`
                    : 'Confirmar Registro'}
                </Button>
              </div>
            </div>
          )
        })()}
      </Modal>

      {/* ── Modal: Nova Manutenção ─────────────────────────────────────────── */}
      <Modal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        title="Nova Manutenção"
        size="md"
      >
        <form onSubmit={handleNewMaintenance} className="space-y-4">
          <Select
            label="Motorcycle *"
            options={motorcycleSelectOptions}
            value={newForm.motorcycle_id}
            onChange={(e) => setNewForm({ ...newForm, motorcycle_id: e.target.value })}
            required
          />
          <Select
            label="Item padrão"
            options={itemSelectOptions}
            value={newForm.standard_item_id}
            onChange={(e) => {
              const p = DEFAULT_ITEMS.find((ip) => ip.id === e.target.value)
              setNewForm({ ...newForm, standard_item_id: e.target.value, description: p?.name ?? newForm.description, type: p?.type ?? newForm.type })
            }}
          />
          {!newForm.standard_item_id && (
            <>
              <Input
                label="Descrição *"
                placeholder="Ex: Troca do cabo do freio"
                value={newForm.description}
                onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                required
              />
              <Select
                label="Tipo"
                options={[
                  { value: 'preventive', label: 'Preventiva' },
                  { value: 'corrective', label: 'Corretiva' },
                  { value: 'inspection', label: 'Vistoria' },
                ]}
                value={newForm.type}
                onChange={(e) => setNewForm({ ...newForm, type: e.target.value as 'preventive' | 'corrective' | 'inspection' })}
              />
            </>
          )}
          {selectedStandard && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-400">
              {selectedStandard.tip}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {(!selectedStandard || selectedStandard.km_interval) && (
              <Input
                label="KM Previsto"
                type="number"
                placeholder="Ex: 12000"
                value={newForm.predicted_km}
                onChange={(e) => setNewForm({ ...newForm, predicted_km: e.target.value })}
              />
            )}
            {(!selectedStandard || selectedStandard.day_interval) && (
              <Input
                label="Data Agendada"
                type="date"
                value={newForm.scheduled_date}
                onChange={(e) => setNewForm({ ...newForm, scheduled_date: e.target.value })}
              />
            )}
          </div>
          <Textarea
            label="Observações"
            rows={2}
            value={newForm.observations}
            onChange={(e) => setNewForm({ ...newForm, observations: e.target.value })}
          />
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="ghost" onClick={() => setNewModalOpen(false)}>Cancelar</Button>
            <Button type="submit">
              <Plus className="w-4 h-4" />
              Adicionar
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Atualizar KM ───────────────────────────────────────────── */}
      <Modal
        open={kmModalOpen}
        onClose={() => setKmModalOpen(false)}
        title="Atualizar KM da Moto"
        size="sm"
      >
        <form onSubmit={handleUpdateKm} className="space-y-4">
          <Select
            label="Motorcycle *"
            options={motorcycleSelectOptions}
            value={kmForm.motorcycle_id}
            onChange={(e) => {
              const motorcycle = motorcycles.find((m) => m.id === e.target.value)
              setKmForm({ motorcycle_id: e.target.value, current_km: motorcycle ? String(motorcycle.current_km) : '' })
            }}
            required
          />
          {kmForm.motorcycle_id && (
            <div className="text-xs text-[#A0A0A0]">
              KM atual registrado: <span className="text-white font-medium">
                {fmtKm(motorcycles.find((m) => m.id === kmForm.motorcycle_id)?.current_km ?? 0)}
              </span>
            </div>
          )}
          <Input
            label="Novo KM *"
            type="number"
            placeholder="Ex: 12500"
            value={kmForm.current_km}
            onChange={(e) => setKmForm({ ...kmForm, current_km: e.target.value })}
            required
          />
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="ghost" onClick={() => setKmModalOpen(false)}>Cancelar</Button>
            <Button type="submit">
              <Gauge className="w-4 h-4" />
              Atualizar
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Ver Detalhes (realizada) ──────────────────────────────── */}
      <Modal
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        title="Detalhes da Manutenção"
        size="sm"
      >
        {detailItem && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-[#A0A0A0]">Motorcycle</p><p className="text-white font-medium">{detailItem.motorcycle_plate}</p></div>
              <div><p className="text-xs text-[#A0A0A0]">Modelo</p><p className="text-white">{detailItem.motorcycle_model}</p></div>
              <div><p className="text-xs text-[#A0A0A0]">Item</p><p className="text-white">{detailItem.description}</p></div>
              <div><p className="text-xs text-[#A0A0A0]">Tipo</p><BadgeType type={detailItem.type} /></div>
              <div><p className="text-xs text-[#A0A0A0]">KM Realizado</p><p className="text-white">{detailItem.actual_km !== null ? fmtKm(detailItem.actual_km) : '—'}</p></div>
              <div><p className="text-xs text-[#A0A0A0]">Data</p><p className="text-white">{detailItem.completed_date ? formatDate(detailItem.completed_date) : '—'}</p></div>
              <div><p className="text-xs text-[#A0A0A0]">Oficina</p><p className="text-white">{detailItem.workshop ?? '—'}</p></div>
            </div>
            <div className="flex gap-3">
              <div className={`flex items-center gap-1.5 text-xs ${detailItem.odometer_photo_url ? 'text-green-400' : 'text-[#555555]'}`}>
                <Camera className="w-3.5 h-3.5" />
                Foto odômetro {detailItem.odometer_photo_url ? '✓' : '—'}
              </div>
              <div className={`flex items-center gap-1.5 text-xs ${detailItem.invoice_photo_url ? 'text-green-400' : 'text-[#555555]'}`}>
                <FileText className="w-3.5 h-3.5" />
                Nota fiscal {detailItem.invoice_photo_url ? '✓' : '—'}
              </div>
            </div>
            {detailItem.observations && (
              <div><p className="text-xs text-[#A0A0A0]">Observações</p><p className="text-white">{detailItem.observations}</p></div>
            )}
            <div className="flex justify-end pt-1">
              <Button variant="ghost" onClick={() => setDetailItem(null)}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal: Confirmar Exclusão ─────────────────────────────────────── */}
      <Modal open={!!deletingItem} onClose={() => setDeletingItem(null)} title="Excluir Manutenção" size="sm">
        <div className="space-y-4">
          <p className="text-[#A0A0A0] text-sm">
            Deseja excluir <span className="text-white font-medium">{deletingItem?.description}</span> de{' '}
            <span className="text-white font-medium">{deletingItem?.motorcycle_plate}</span>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeletingItem(null)}>Cancelar</Button>
            <Button variant="danger" onClick={confirmDeletion}>
              <Trash2 className="w-4 h-4" />
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
