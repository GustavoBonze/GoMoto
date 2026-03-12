'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { Processo } from '@/types'

const categorias = ['Locação', 'Cobrança', 'Manutenção', 'Documentação', 'Geral']

const mockProcessos: Processo[] = [
  {
    id: '1',
    pergunta: 'Quais documentos são necessários para alugar uma moto?',
    resposta:
      'Para alugar uma moto, o cliente precisa apresentar: RG ou CNH válida, CPF, comprovante de residência recente (últimos 3 meses), e CNH na categoria A com no mínimo 2 anos de habilitação. Também é exigido um comprovante de renda ou referência de trabalho.',
    categoria: 'Locação',
    ordem: 1,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    pergunta: 'Como funciona o pagamento do aluguel?',
    resposta:
      'O pagamento é mensal e deve ser realizado até o dia acordado em contrato. Aceitamos PIX, transferência bancária ou dinheiro. O não pagamento até o vencimento pode gerar cobrança de juros de 2% ao mês mais multa de 5% sobre o valor.',
    categoria: 'Cobrança',
    ordem: 2,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '3',
    pergunta: 'O cliente é responsável por multas de trânsito?',
    resposta:
      'Sim. Todas as multas geradas durante o período de locação são de responsabilidade do locatário, exceto aquelas originadas por problemas de documentação da moto (como IPVA ou licenciamento atrasado), que são responsabilidade da empresa.',
    categoria: 'Locação',
    ordem: 3,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '4',
    pergunta: 'Como solicitar manutenção da moto?',
    resposta:
      'O cliente deve entrar em contato com a empresa assim que identificar qualquer problema mecânico na moto. Não é permitido ao locatário realizar reparos sem autorização prévia. A empresa agendará a manutenção com uma oficina parceira e arcará com os custos de desgaste natural.',
    categoria: 'Manutenção',
    ordem: 4,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '5',
    pergunta: 'O que acontece se a moto sofrer um acidente?',
    resposta:
      'Em caso de acidente, o locatário deve acionar imediatamente a empresa e o seguro, registrar Boletim de Ocorrência quando houver terceiros envolvidos, e não movimentar a moto sem orientação. Os custos de reparo por culpa do locatário são de sua responsabilidade.',
    categoria: 'Locação',
    ordem: 5,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '6',
    pergunta: 'Qual o prazo para devolução da moto?',
    resposta:
      'O cliente deve comunicar a intenção de encerrar o contrato com no mínimo 15 dias de antecedência. A devolução deve ser feita no endereço da empresa, com a moto limpa e no mesmo estado em que foi entregue, acompanhada de toda a documentação.',
    categoria: 'Documentação',
    ordem: 6,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '7',
    pergunta: 'Existe carência antes de cobrar juros por atraso?',
    resposta:
      'Há uma carência de 3 dias úteis após o vencimento antes de iniciar a cobrança de juros e multa. Após esse prazo, incidirá juros de 2% ao mês (pro-rata) e multa fixa de 5% sobre o valor em aberto.',
    categoria: 'Cobrança',
    ordem: 7,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '8',
    pergunta: 'Como funciona a caução?',
    resposta:
      'É cobrada uma caução equivalente a um mês de aluguel no início do contrato. O valor é devolvido integralmente ao encerramento, desde que a moto seja devolvida sem danos e sem débitos pendentes.',
    categoria: 'Geral',
    ordem: 8,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '9',
    pergunta: 'Com que frequência deve ser feita a revisão da moto?',
    resposta:
      'A moto deve passar por revisão a cada 3 meses ou 5.000 km rodados, o que ocorrer primeiro. A empresa agenda e cobre os custos da revisão preventiva. O locatário deve estar disponível para deixar a moto por até 1 dia útil para a revisão.',
    categoria: 'Manutenção',
    ordem: 9,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '10',
    pergunta: 'Posso transferir o contrato para outra pessoa?',
    resposta:
      'Não é permitida a transferência de contrato sem autorização expressa da empresa. O locatário também não pode ceder ou sublocar a moto a terceiros. Qualquer violação dessa cláusula poderá resultar no encerramento imediato do contrato.',
    categoria: 'Documentação',
    ordem: 10,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
]

const categoriaBadgeVariant: Record<string, 'success' | 'info' | 'warning' | 'muted' | 'brand' | 'danger'> = {
  Locação: 'brand',
  Cobrança: 'warning',
  Manutenção: 'info',
  Documentação: 'success',
  Geral: 'muted',
}

const categoriaFilterOptions = [
  { value: '', label: 'Todas as categorias' },
  ...categorias.map((c) => ({ value: c, label: c })),
]

const defaultForm = { pergunta: '', resposta: '', categoria: 'Geral' }

export default function ProcessosPage() {
  const [processos, setProcessos] = useState<Processo[]>(mockProcessos)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Processo | null>(null)
  const [form, setForm] = useState(defaultForm)

  const filtered = filtroCategoria
    ? processos.filter((p) => p.categoria === filtroCategoria)
    : processos

  const grouped = categorias.reduce<Record<string, Processo[]>>((acc, cat) => {
    const items = filtered.filter((p) => p.categoria === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editando) {
      setProcessos((prev) =>
        prev.map((p) =>
          p.id === editando.id
            ? { ...p, pergunta: form.pergunta, resposta: form.resposta, categoria: form.categoria }
            : p
        )
      )
    } else {
      const novo: Processo = {
        id: String(Date.now()),
        pergunta: form.pergunta,
        resposta: form.resposta,
        categoria: form.categoria,
        ordem: processos.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setProcessos((prev) => [...prev, novo])
    }
    setForm(defaultForm)
    setEditando(null)
    setModalOpen(false)
  }

  function handleEditar(processo: Processo) {
    setEditando(processo)
    setForm({ pergunta: processo.pergunta, resposta: processo.resposta, categoria: processo.categoria })
    setModalOpen(true)
  }

  function handleExcluir(id: string) {
    setProcessos((prev) => prev.filter((p) => p.id !== id))
  }

  function handleOpenModal() {
    setEditando(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Processos da Empresa"
        subtitle={`${processos.length} processos cadastrados`}
        actions={
          <Button onClick={handleOpenModal}>
            <Plus className="w-4 h-4" />
            Adicionar Processo
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <BookOpen className="w-4 h-4 text-[#666666]" />
          <div className="flex gap-2 flex-wrap">
            {[{ value: '', label: 'Todas' }, ...categorias.map((c) => ({ value: c, label: c }))].map(
              (opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFiltroCategoria(opt.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                    filtroCategoria === opt.value
                      ? 'bg-[#BAFF1A] text-[#121212]'
                      : 'bg-[#202020] border border-[#333333] text-[#A0A0A0] hover:text-white hover:border-[#555555]'
                  }`}
                >
                  {opt.label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Accordion grouped by category */}
        {Object.entries(grouped).map(([categoria, items]) => (
          <div key={categoria} className="space-y-2">
            <div className="flex items-center gap-2 py-1">
              <Badge variant={categoriaBadgeVariant[categoria] ?? 'muted'}>{categoria}</Badge>
              <span className="text-xs text-[#666666]">{items.length} processo(s)</span>
            </div>

            <div className="space-y-1">
              {items.map((processo) => (
                <div
                  key={processo.id}
                  className="bg-[#202020] border border-[#333333] rounded-xl overflow-hidden transition-colors hover:border-[#444444]"
                >
                  <button
                    className="w-full flex items-center justify-between gap-4 p-4 text-left"
                    onClick={() =>
                      setExpandedId((prev) => (prev === processo.id ? null : processo.id))
                    }
                  >
                    <p className="font-medium text-white text-sm leading-relaxed">
                      {processo.pergunta}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditar(processo)
                        }}
                        className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExcluir(processo.id)
                        }}
                        className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {expandedId === processo.id ? (
                        <ChevronUp className="w-4 h-4 text-[#666666]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#666666]" />
                      )}
                    </div>
                  </button>

                  {expandedId === processo.id && (
                    <div className="px-4 pb-4 border-t border-[#2a2a2a] pt-3">
                      <p className="text-sm text-[#A0A0A0] leading-relaxed">{processo.resposta}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <BookOpen className="w-12 h-12 text-[#333333] mx-auto mb-3" />
              <p className="text-[#666666]">Nenhum processo encontrado</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Adicionar/Editar Processo */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar Processo' : 'Adicionar Processo'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Categoria"
            options={categorias.map((c) => ({ value: c, label: c }))}
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          />
          <Input
            label="Pergunta"
            placeholder="Como funciona o processo de locação?"
            value={form.pergunta}
            onChange={(e) => setForm({ ...form, pergunta: e.target.value })}
            required
          />
          <Textarea
            label="Resposta"
            placeholder="Descreva o processo de forma clara e objetiva..."
            rows={5}
            value={form.resposta}
            onChange={(e) => setForm({ ...form, resposta: e.target.value })}
            required
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editando ? (
                <>
                  <Edit2 className="w-4 h-4" />
                  Salvar Alterações
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Adicionar Processo
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
