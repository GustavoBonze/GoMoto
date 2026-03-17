/**
 * ARQUIVO: src/app/(dashboard)/processos/page.tsx
 * DESCRIÇÃO: Página de Gestão de Processos da GoMoto.
 *            Funciona como uma base de conhecimento (FAQ) para os funcionários, 
 *            centralizando regras de locação, cobrança, manutenção e documentação.
 *            Permite a criação, edição e exclusão de processos internos.
 */

'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { Process } from '@/types'

/**
 * Lista fixa de categorias disponíveis para classificar os processos da empresa.
 */
const categories = ['Locação', 'Cobrança', 'Manutenção', 'Documentação', 'Geral']

/**
 * Dados iniciais para simulação de processos cadastrados.
 * Cada processo possui uma pergunta, uma resposta detalhada e uma categoria.
 */
const mockProcesses: Process[] = [
  {
    id: '1',
    question: 'Quais documentos são necessários para alugar uma moto?',
    answer:
      'Para alugar uma moto, o cliente precisa apresentar: RG ou CNH válida, CPF, comprovante de residência recente (últimos 3 meses), e CNH na categoria A com no mínimo 2 anos de habilitação. Também é exigido um comprovante de renda ou referência de trabalho.',
    category: 'Locação',
    order: 1,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    question: 'Como funciona o pagamento do aluguel?',
    answer:
      'O pagamento é mensal e deve ser realizado até o dia acordado em contrato. Aceitamos PIX, transferência bancária ou dinheiro. O não pagamento até o vencimento pode gerar cobrança de juros de 2% ao mês mais multa de 5% sobre o valor.',
    category: 'Cobrança',
    order: 2,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '3',
    question: 'O cliente é responsável por multas de trânsito?',
    answer:
      'Sim. Todas as multas geradas durante o período de locação são de responsabilidade do locatário, exceto aquelas originadas por problemas de documentação da moto (como IPVA ou licenciamento atrasado), que são responsabilidade da empresa.',
    category: 'Locação',
    order: 3,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '4',
    question: 'Como solicitar manutenção da moto?',
    answer:
      'O cliente deve entrar em contato com a empresa assim que identificar qualquer problema mecânico na moto. Não é permitido ao locatário realizar reparos sem autorização prévia. A empresa agendará a manutenção com uma oficina parceira e arcará com os custos de desgaste natural.',
    category: 'Manutenção',
    order: 4,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '5',
    question: 'O que acontece se a moto sofrer um acidente?',
    answer:
      'Em caso de acidente, o locatário deve acionar imediatamente a empresa e o seguro, registrar Boletim de Ocorrência quando houver terceiros envolvidos, e não movimentar a moto sem orientação. Os custos de reparo por culpa do locatário são de sua responsabilidade.',
    category: 'Locação',
    order: 5,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '6',
    question: 'Qual o prazo para devolução da moto?',
    answer:
      'O cliente deve comunicar a intenção de encerrar o contrato com no mínimo 15 dias de antecedência. A devolução deve ser feita no endereço da empresa, com a moto limpa e no mesmo estado em que foi entregue, acompanhada de toda a documentação.',
    category: 'Documentação',
    order: 6,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '7',
    question: 'Existe carência antes de cobrar juros por atraso?',
    answer:
      'Há uma carência de 3 dias úteis após o vencimento antes de iniciar a cobrança de juros e multa. Após esse prazo, incidirá juros de 2% ao mês (pro-rata) e multa fixa de 5% sobre o valor em aberto.',
    category: 'Cobrança',
    order: 7,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '8',
    question: 'Como funciona a caução?',
    answer:
      'É cobrada uma caução equivalente a um mês de aluguel no início do contrato. O valor é devolvido integralmente ao encerramento, desde que a moto seja devolvida sem danos e sem débitos pendentes.',
    category: 'Geral',
    order: 8,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '9',
    question: 'Com que frequência deve ser feita a revisão da moto?',
    answer:
      'A moto deve passar por revisão a cada 3 meses ou 5.000 km rodados, o que ocorrer primeiro. A empresa agenda e cobre os custos da revisão preventiva. O locatário deve estar disponível para deixar a moto por até 1 dia útil para a revisão.',
    category: 'Manutenção',
    order: 9,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '10',
    question: 'Posso transferir o contrato para outra pessoa?',
    answer:
      'Não é permitida a transferência de contrato sem autorização expressa da empresa. O locatário também não pode ceder ou sublocar a moto a terceiros. Qualquer violação dessa cláusula poderá resultar no encerramento imediato do contrato.',
    category: 'Documentação',
    order: 10,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
]

/**
 * Mapeamento de estilos visuais (variantes do componente Badge) para cada categoria.
 */
const categoryBadgeVariant: Record<string, 'success' | 'info' | 'warning' | 'muted' | 'brand' | 'danger'> = {
  Locação: 'brand',
  Cobrança: 'warning',
  Manutenção: 'info',
  Documentação: 'success',
  Geral: 'muted',
}

/**
 * Estado inicial para o formulário de criação/edição de processos.
 */
const defaultForm = { question: '', answer: '', category: 'Geral' }

/**
 * COMPONENTE PRINCIPAL: ProcessesPage
 * Renderiza uma lista sanfonada (accordion) de processos agrupados por categoria.
 */
export default function ProcessesPage() {
  /**
   * ESTADO: Lista de processos atualmente exibida.
   */
  const [processes, setProcesses] = useState<Process[]>(mockProcesses)
  /**
   * ESTADO: ID do processo que está com a resposta visível (expandido).
   */
  const [expandedId, setExpandedId] = useState<string | null>(null)
  /**
   * ESTADO: Valor do filtro de categoria selecionado pelo usuário.
   */
  const [categoryFilter, setCategoryFilter] = useState('')
  /**
   * ESTADO: Controla a visibilidade do modal de cadastro/edição.
   */
  const [isModalOpen, setIsModalOpen] = useState(false)
  /**
   * ESTADO: Armazena o objeto do processo que está sendo editado, ou null para novo.
   */
  const [editingProcess, setEditingProcess] = useState<Process | null>(null)
  /**
   * ESTADO: Dados temporários do formulário no modal.
   */
  const [form, setForm] = useState(defaultForm)

  /**
   * CONSTANTE: filteredProcesses
   * Aplica o filtro de categoria selecionado sobre a lista total de processos.
   */
  const filteredProcesses = categoryFilter
    ? processes.filter((p) => p.category === categoryFilter)
    : processes

  /**
   * CONSTANTE: groupedProcesses
   * Organiza os processos filtrados em um objeto onde a chave é a categoria.
   * Facilita a renderização de grupos visualmente separados.
   */
  const groupedProcesses = categories.reduce<Record<string, Process[]>>((acc, cat) => {
    const items = filteredProcesses.filter((p) => p.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  /**
   * FUNÇÃO: handleSubmit
   * Processa o envio do formulário para salvar um novo processo ou atualizar um existente.
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingProcess) {
      // Lógica de Atualização
      setProcesses((prev) =>
        prev.map((p) =>
          p.id === editingProcess.id
            ? { ...p, question: form.question, answer: form.answer, category: form.category }
            : p
        )
      )
    } else {
      // Lógica de Inserção de Novo Processo
      const newProcess: Process = {
        id: String(Date.now()),
        question: form.question,
        answer: form.answer,
        category: form.category,
        order: processes.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setProcesses((prev) => [...prev, newProcess])
    }
    // Reseta o estado e fecha o modal
    setForm(defaultForm)
    setEditingProcess(null)
    setIsModalOpen(false)
  }

  /**
   * FUNÇÃO: handleEdit
   * Prepara o modal para edição de um processo específico carregando seus dados atuais.
   */
  function handleEdit(process: Process) {
    setEditingProcess(process)
    setForm({ question: process.question, answer: process.answer, category: process.category })
    setIsModalOpen(true)
  }

  /**
   * FUNÇÃO: handleDelete
   * Remove um processo da lista baseada no seu identificador.
   */
  function handleDelete(id: string) {
    setProcesses((prev) => prev.filter((p) => p.id !== id))
  }

  /**
   * FUNÇÃO: handleOpenModal
   * Abre o modal limpo para a criação de um novo processo.
   */
  function handleOpenModal() {
    setEditingProcess(null)
    setForm(defaultForm)
    setIsModalOpen(true)
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Processos da Empresa"
        subtitle={`${processes.length} processos cadastrados`}
        actions={
          <Button onClick={handleOpenModal}>
            <Plus className="w-4 h-4" />
            Adicionar Processo
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {/* SEÇÃO DE FILTROS: Permite filtrar os processos por categoria */}
        <div className="flex items-center gap-3 flex-wrap">
          <BookOpen className="w-4 h-4 text-[#A0A0A0]" />
          <div className="flex gap-2 flex-wrap">
            {/* Botões de filtro rápido */}
            {[{ value: '', label: 'Todas' }, ...categories.map((c) => ({ value: c, label: c }))].map(
              (opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCategoryFilter(opt.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                    categoryFilter === opt.value
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

        {/* LISTAGEM AGRUPADA: Itera sobre as categorias que possuem itens */}
        {Object.entries(groupedProcesses).map(([category, items]) => (
          <div key={category} className="space-y-2">
            {/* Cabeçalho da Categoria */}
            <div className="flex items-center gap-2 py-1">
              <Badge variant={categoryBadgeVariant[category] ?? 'muted'}>{category}</Badge>
              <span className="text-xs text-[#A0A0A0]">{items.length} processo(s)</span>
            </div>

            {/* Itens da Categoria em formato de Acordeão */}
            <div className="space-y-1">
              {items.map((process) => (
                <div
                  key={process.id}
                  className="bg-[#202020] border border-[#333333] rounded-xl overflow-hidden transition-colors hover:border-[#444444]"
                >
                  {/* Botão de Expansão (Pergunta) */}
                  <button
                    className="w-full flex items-center justify-between gap-4 p-4 text-left"
                    onClick={() =>
                      setExpandedId((prev) => (prev === process.id ? null : process.id))
                    }
                  >
                    <p className="font-medium text-white text-sm leading-relaxed">
                      {process.question}
                    </p>
                    
                    {/* Ações e Indicador de Status do Acordeão */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Botão Editar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(process)
                        }}
                        className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {/* Botão Excluir */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(process.id)
                        }}
                        className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {/* Ícone de Seta (Cima/Baixo) */}
                      {expandedId === process.id ? (
                        <ChevronUp className="w-4 h-4 text-[#A0A0A0]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#A0A0A0]" />
                      )}
                    </div>
                  </button>

                  {/* Conteúdo Expansível (Resposta) */}
                  {expandedId === process.id && (
                    <div className="px-4 pb-4 border-t border-[#2a2a2a] pt-3">
                      <p className="text-sm text-[#A0A0A0] leading-relaxed">{process.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* FEEDBACK: Exibido quando nenhum processo corresponde ao filtro ou a lista está vazia */}
        {filteredProcesses.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <BookOpen className="w-12 h-12 text-[#888888] mx-auto mb-3" />
              <p className="text-[#A0A0A0]">Nenhum processo encontrado</p>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Interface para Adicionar ou Editar um Processo */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProcess ? 'Editar Processo' : 'Adicionar Processo'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seletor de Categoria */}
          <Select
            label="Categoria"
            options={categories.map((c) => ({ value: c, label: c }))}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          {/* Campo da Pergunta */}
          <Input
            label="Pergunta"
            placeholder="Como funciona o processo de locação?"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            required
          />
          {/* Campo da Resposta Detalhada */}
          <Textarea
            label="Resposta"
            placeholder="Descreva o processo de forma clara e objetiva..."
            rows={5}
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            required
          />
          
          {/* Ações do Modal */}
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingProcess ? (
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
