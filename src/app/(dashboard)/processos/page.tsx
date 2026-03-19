/**
 * @file src/app/(dashboard)/processos/page.tsx
 * @description Página de Gestão de Processos e Base de Conhecimento da GoMoto.
 * 
 * @summary
 * Esta página funciona como uma base de conhecimento centralizada (FAQ) para os funcionários.
 * O "porquê" de sua existência é padronizar o atendimento e as operações, garantindo
 * que todos na equipe sigam as mesmas regras e tenham acesso rápido a respostas
 * para as dúvidas mais comuns de clientes sobre locação, cobrança, manutenção, etc.
 * Isso reduz erros, agiliza o treinamento e melhora a consistência do serviço.
 * 
 * @funcionalidades
 * 1.  **Visualização em Acordeão**: Exibe os processos como uma lista de perguntas e respostas expansíveis.
 * 2.  **Agrupamento por Categoria**: Organiza os processos em seções (Locação, Cobrança, etc.) para fácil navegação.
 * 3.  **Filtro Rápido**: Permite filtrar a lista para ver apenas uma categoria por vez.
 * 4.  **CRUD de Processos**: Interface para administradores criarem, editarem e excluírem processos internos.
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
 * @constant categories
 * @description Lista fixa de categorias para classificar os processos da empresa.
 * O "porquê": Garante consistência na categorização e alimenta os filtros da UI.
 */
const categories = ['Locação', 'Cobrança', 'Manutenção', 'Documentação', 'Geral']

/**
 * @constant mockProcesses
 * @description Dados iniciais para simular os processos já cadastrados.
 * O "porquê": Permite o desenvolvimento da UI sem dependência do banco de dados,
 * populando a lista com exemplos realistas de perguntas e respostas.
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
 * @constant categoryBadgeVariant
 * @description Mapeamento de estilos visuais (cores do Badge) para cada categoria.
 * O "porquê": Centraliza a lógica de estilização, tornando fácil alterar a cor
 * associada a uma categoria em um único local.
 */
const categoryBadgeVariant: Record<string, 'success' | 'info' | 'warning' | 'muted' | 'brand' | 'danger'> = {
  Locação: 'brand',
  Cobrança: 'warning',
  Manutenção: 'info',
  Documentação: 'success',
  Geral: 'muted',
}

/**
 * @constant defaultForm
 * @description Estado inicial para o formulário de criação/edição de processos.
 * O "porquê": Garante que o modal de "Adicionar Processo" sempre abra com os campos limpos.
 */
const defaultForm = { question: '', answer: '', category: 'Geral' }

/**
 * @component ProcessesPage
 * @description Componente principal que renderiza a lista de processos em formato de acordeão.
 */
export default function ProcessesPage() {
  /**
   * @state processes
   * @description Armazena a lista completa de processos. É a fonte da verdade para a UI.
   */
  const [processes, setProcesses] = useState<Process[]>(mockProcesses)
  /**
   * @state expandedId
   * @description Guarda o ID do processo que está atualmente expandido, mostrando a resposta. Se `null`, todos estão fechados.
   */
  const [expandedId, setExpandedId] = useState<string | null>(null)
  /**
   * @state categoryFilter
   * @description Armazena o valor do filtro de categoria selecionado pelo usuário.
   */
  const [categoryFilter, setCategoryFilter] = useState('')
  /**
   * @state isModalOpen
   * @description Controla a visibilidade do modal de cadastro/edição.
   */
  const [isModalOpen, setIsModalOpen] = useState(false)
  /**
   * @state editingProcess
   * @description Guarda o objeto do processo em edição. Se `null`, o modal está em modo de "criação".
   */
  const [editingProcess, setEditingProcess] = useState<Process | null>(null)
  /**
   * @state form
   * @description Armazena os valores atuais do formulário no modal.
   */
  const [form, setForm] = useState(defaultForm)

  /**
   * @const filteredProcesses
   * @description Aplica o filtro de categoria à lista de processos. Se nenhum filtro
   * estiver ativo, retorna a lista completa.
   */
  const filteredProcesses = categoryFilter
    ? processes.filter((p) => p.category === categoryFilter)
    : processes

  /**
   * @const groupedProcesses
   * @description Organiza os processos filtrados em um objeto onde a chave é a categoria.
   * O "porquê": Facilita a renderização da UI em blocos agrupados por categoria,
   * ao invés de uma lista única desordenada.
   */
  const groupedProcesses = categories.reduce<Record<string, Process[]>>((acc, cat) => {
    const items = filteredProcesses.filter((p) => p.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  /**
   * @function handleSubmit
   * @description Processa o envio do formulário, salvando um novo processo ou atualizando um existente.
   * @param e - O evento do formulário, para prevenir o recarregamento da página.
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingProcess) {
      // Lógica de Atualização
      setProcesses((prev) =>
        prev.map((p) =>
          p.id === editingProcess.id
            ? { ...p, question: form.question, answer: form.answer, category: form.category, updated_at: new Date().toISOString() }
            : p
        )
      )
    } else {
      // Lógica de Criação
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
   * @function handleEdit
   * @description Prepara o modal para edição, carregando os dados do processo selecionado.
   * @param process - O objeto do processo a ser editado.
   */
  function handleEdit(process: Process) {
    setEditingProcess(process)
    setForm({ question: process.question, answer: process.answer, category: process.category })
    setIsModalOpen(true)
  }

  /**
   * @function handleDelete
   * @description Remove um processo da lista.
   * O "porquê": A remoção é feita de forma otimista na UI, filtrando o array de estado.
   * Em uma aplicação real, aqui seria chamada uma API para deletar no banco.
   * @param id - O ID do processo a ser removido.
   */
  function handleDelete(id: string) {
    setProcesses((prev) => prev.filter((p) => p.id !== id))
  }

  /**
   * @function handleOpenModal
   * @description Abre o modal em modo de "criação".
   */
  function handleOpenModal() {
    setEditingProcess(null)
    setForm(defaultForm)
    setIsModalOpen(true)
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Cabeçalho da página com título, contador e botão de ação principal. */}
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
        {/* SEÇÃO DE FILTROS: Permite filtrar os processos por categoria. */}
        <div className="flex items-center gap-3 flex-wrap">
          <BookOpen className="w-4 h-4 text-[#A0A0A0]" />
          <div className="flex gap-2 flex-wrap">
            {/* Botões de filtro rápido, incluindo "Todas". */}
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

        {/* LISTAGEM AGRUPADA: Itera sobre as categorias que possuem itens. */}
        {Object.entries(groupedProcesses).map(([category, items]) => (
          <div key={category} className="space-y-2">
            {/* Cabeçalho de cada Categoria */}
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
                  {/* Botão de Expansão que contém a pergunta. */}
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation() // Impede que o clique no botão também expanda/recolha o acordeão.
                          handleEdit(process)
                        }}
                        className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
                        title="Editar processo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(process.id)
                        }}
                        className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-colors"
                        title="Excluir processo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {/* Ícone de Seta que muda conforme o estado expandido. */}
                      {expandedId === process.id ? (
                        <ChevronUp className="w-4 h-4 text-[#A0A0A0]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#A0A0A0]" />
                      )}
                    </div>
                  </button>

                  {/* Conteúdo Expansível (A resposta para a pergunta). */}
                  {expandedId === process.id && (
                    <div className="px-4 pb-4 border-t border-[#2a2a2a] pt-3">
                      <p className="text-sm text-[#A0A0A0] leading-relaxed whitespace-pre-wrap">{process.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* FEEDBACK DE LISTA VAZIA: Exibido se nenhum processo corresponder ao filtro. */}
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
        title={editingProcess ? 'Editar Processo' : 'Adicionar Novo Processo'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Categoria"
            options={categories.map((c) => ({ value: c, label: c }))}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <Input
            label="Pergunta"
            placeholder="Ex: Como funciona o processo de locação?"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            required
          />
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
