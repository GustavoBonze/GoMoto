/**
 * @file page.tsx
 * @description Página de Gestão de Despesas do Sistema GoMoto.
 *
 * Gerencia o registro de todas as saídas financeiras da empresa.
 * Conectada ao banco de dados Supabase real, substituindo os dados mockados.
 *
 * Funcionalidades principais:
 * - Listagem de despesas filtrada por mês com total destacado no topo.
 * - CRUD completo: criar, editar e excluir despesas via modais.
 * - Busca textual por descrição ou categoria.
 * - Cards de resumo: Total do Mês, Quantidade de Lançamentos, Ticket Médio.
 *
 * Colunas da tabela 'despesas' no Supabase:
 * id, description, amount, category, date, motorcycle_id, observations, created_at
 *
 * Identificadores seguem o padrão Inglês e a documentação o padrão Português Brasil.
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, TrendingDown, Receipt, Activity, Search } from 'lucide-react';
import type { Expense } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';

// --- INTERFACES LOCAIS ---

/**
 * @interface ExpenseFormData
 * @description Estrutura dos campos do formulário de criação/edição de despesa.
 */
interface ExpenseFormData {
  description: string;
  amount: string;
  date: string;
  category: string;
  observations: string;
}

// --- CONSTANTES ---

/**
 * @constant defaultForm
 * @description Estado inicial do formulário para criação de nova despesa.
 */
const defaultForm: ExpenseFormData = {
  description: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  category: '',
  observations: '',
};

/**
 * @constant EXPENSE_CATEGORIES
 * @description Lista fixa de categorias disponíveis para classificação das despesas.
 */
const EXPENSE_CATEGORIES = [
  'Manutenção',
  'Combustível',
  'Aluguel',
  'Salário',
  'Impostos',
  'Seguro',
  'Marketing',
  'Outros',
];

// --- COMPONENTE PRINCIPAL ---

/**
 * @component ExpensesPage
 * @description Componente principal da página de despesas.
 * Gerencia o estado, operações CRUD e renderização da interface.
 */
export default function ExpensesPage() {
  /** @state expenses - Lista completa de despesas carregadas do Supabase. */
  const [expenses, setExpenses] = useState<Expense[]>([]);
  /** @state loading - Indica se os dados estão sendo carregados. */
  const [loading, setLoading] = useState(true);

  // Filtros
  /** @state search - Texto de busca por descrição ou categoria. */
  const [search, setSearch] = useState('');
  /**
   * @state monthFilter - Mês selecionado no filtro, no formato 'YYYY-MM'.
   * Inicializado com o mês atual por padrão.
   */
  const [monthFilter, setMonthFilter] = useState(() => {
    const now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  });

  // Controle de modais
  /** @state modalOpen - Controla a visibilidade do modal de criação/edição. */
  const [modalOpen, setModalOpen] = useState(false);
  /** @state editing - Despesa sendo editada; null quando criando nova. */
  const [editing, setEditing] = useState<Expense | null>(null);
  /** @state deleting - Despesa selecionada para exclusão; null quando inativo. */
  const [deleting, setDeleting] = useState<Expense | null>(null);

  // Formulário
  /** @state form - Dados do formulário de criação/edição. */
  const [form, setForm] = useState<ExpenseFormData>(defaultForm);
  /** @state saving - Indica se uma operação de salvar está em andamento. */
  const [saving, setSaving] = useState(false);

  /**
   * @effect
   * @description Carrega as despesas do Supabase na montagem inicial do componente.
   */
  useEffect(() => {
    fetchExpenses();
  }, []);

  /**
   * @function fetchExpenses
   * @description Busca todas as despesas do banco de dados Supabase, ordenadas por data decrescente.
   */
  async function fetchExpenses() {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar despesas:', error);
    } else {
      setExpenses((data as Expense[]) ?? []);
    }
    setLoading(false);
  }

  /**
   * @variable filteredExpenses
   * @description Lista de despesas filtradas pelo mês e pelo texto de busca.
   * Recalculada apenas quando expenses, monthFilter ou search mudam.
   */
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesMonth = expense.date.startsWith(monthFilter);
      const matchesSearch =
        expense.description.toLowerCase().includes(search.toLowerCase()) ||
        expense.category.toLowerCase().includes(search.toLowerCase());
      return matchesMonth && matchesSearch;
    });
  }, [expenses, monthFilter, search]);

  /** @variable monthTotal - Soma dos valores das despesas filtradas. */
  const monthTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  /** @variable monthCount - Quantidade de lançamentos no período filtrado. */
  const monthCount = filteredExpenses.length;
  /** @variable monthAverage - Valor médio por despesa no período filtrado. */
  const monthAverage = monthCount > 0 ? monthTotal / monthCount : 0;

  /**
   * @function handleOpenModal
   * @description Abre o modal de criação ou edição.
   * Se receber uma despesa, pré-popula o formulário para edição.
   * @param {Expense} [expense] - Despesa a editar (opcional).
   */
  function handleOpenModal(expense?: Expense) {
    if (expense) {
      setEditing(expense);
      setForm({
        description: expense.description,
        amount: expense.amount.toString(),
        date: expense.date,
        category: expense.category,
        observations: expense.observations || '',
      });
    } else {
      setEditing(null);
      setForm(defaultForm);
    }
    setModalOpen(true);
  }

  /**
   * @function handleCloseModal
   * @description Fecha o modal e limpa o estado do formulário.
   */
  function handleCloseModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(defaultForm);
  }

  /**
   * @function handleSave
   * @description Persiste a despesa no Supabase (inserção ou atualização).
   * Valida campos obrigatórios antes de prosseguir.
   * @param {React.FormEvent} e - Evento de submissão do formulário.
   */
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description || !form.amount || !form.date || !form.category) return;

    setSaving(true);
    const supabase = createClient();

    /** @constant payload - Dados formatados para envio ao Supabase. */
    const payload = {
      description: form.description,
      amount: parseFloat(form.amount),
      date: form.date,
      category: form.category,
      observations: form.observations || null,
    };

    if (editing) {
      const { error } = await supabase.from('expenses').update(payload).eq('id', editing.id);
      if (error) console.error('Erro ao editar despesa:', error);
    } else {
      const { error } = await supabase.from('expenses').insert(payload);
      if (error) console.error('Erro ao criar despesa:', error);
    }

    setSaving(false);
    handleCloseModal();
    await fetchExpenses();
  }

  /**
   * @function handleDelete
   * @description Remove a despesa selecionada do banco de dados Supabase.
   */
  async function handleDelete() {
    if (!deleting) return;
    const supabase = createClient();
    const { error } = await supabase.from('expenses').delete().eq('id', deleting.id);
    if (error) console.error('Erro ao excluir despesa:', error);
    setDeleting(null);
    await fetchExpenses();
  }

  /** @constant categoryOptions - Opções formatadas para o componente Select de categorias. */
  const categoryOptions = [
    { value: '', label: 'Selecione a categoria' },
    ...EXPENSE_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  /** @constant tableColumns - Definição das colunas da tabela de despesas. */
  const tableColumns = [
    {
      key: 'date',
      header: 'Data',
      render: (row: Expense) => <span>{formatDate(row.date)}</span>,
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (row: Expense) => (
        <div>
          <span className="font-medium text-[#f5f5f5]">{row.description}</span>
          {row.observations && (
            <p className="text-xs text-[#9e9e9e] mt-0.5 truncate max-w-xs">{row.observations}</p>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoria',
      render: (row: Expense) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#323232] text-[#c7c7c7] border border-[#474747]">
          {row.category}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (row: Expense) => (
        <span className="text-red-400 font-semibold">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row: Expense) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleOpenModal(row)}
            title="Editar despesa"
            className="p-1.5 rounded-lg text-[#c7c7c7] hover:text-[#f5f5f5] hover:bg-[#323232] transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleting(row)}
            title="Excluir despesa"
            className="p-1.5 rounded-lg text-[#c7c7c7] hover:text-red-400 hover:bg-[#323232] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // --- RENDERIZAÇÃO ---

  return (
    <div className="bg-[#121212] min-h-screen">
      {/* Cabeçalho da página com botão de nova despesa */}
      <Header
        title="Despesas"
        subtitle="Gerencie as saídas financeiras da sua frota"
        actions={
          <Button variant="primary" size="md" onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4" />
            Nova Despesa
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Cards de KPIs do mês filtrado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Card: Total do Mês */}
          <div className="bg-[#202020] border border-[#474747] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#c7c7c7]">Total do Mês</span>
              <div className="p-2 bg-red-500/10 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#BAFF1A]">{formatCurrency(monthTotal)}</p>
            <p className="text-xs text-[#9e9e9e] mt-1">{monthCount} lançamento{monthCount !== 1 ? 's' : ''}</p>
          </div>

          {/* Card: Quantidade de Lançamentos */}
          <div className="bg-[#202020] border border-[#474747] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#c7c7c7]">Lançamentos</span>
              <div className="p-2 bg-[#323232] rounded-lg">
                <Receipt className="w-5 h-5 text-[#BAFF1A]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#f5f5f5]">{monthCount}</p>
            <p className="text-xs text-[#9e9e9e] mt-1">no período selecionado</p>
          </div>

          {/* Card: Ticket Médio */}
          <div className="bg-[#202020] border border-[#474747] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#c7c7c7]">Ticket Médio</span>
              <div className="p-2 bg-[#323232] rounded-lg">
                <Activity className="w-5 h-5 text-[#BAFF1A]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#f5f5f5]">{formatCurrency(monthAverage)}</p>
            <p className="text-xs text-[#9e9e9e] mt-1">por despesa</p>
          </div>
        </div>

        {/* Barra de filtros: busca textual + filtro por mês */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#616161]" />
            </div>
            <input
              type="text"
              placeholder="Buscar por descrição ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-3 h-12 bg-[#323232] border border-[#323232] rounded-lg text-sm text-[#f5f5f5] placeholder:text-[#616161] focus:outline-none focus:border-[#BAFF1A] focus:ring-1 focus:ring-[#BAFF1A]/30 transition-colors"
            />
          </div>
          <div>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full sm:w-48 px-3 py-3 h-12 bg-[#323232] border border-[#323232] rounded-lg text-sm text-[#f5f5f5] focus:outline-none focus:border-[#BAFF1A] focus:ring-1 focus:ring-[#BAFF1A]/30 transition-colors"
            />
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="flex items-center justify-between text-sm text-[#c7c7c7] mb-3 px-1">
          <span>{monthCount} despesa{monthCount !== 1 ? 's' : ''} encontrada{monthCount !== 1 ? 's' : ''}</span>
        </div>

        {/* Tabela de despesas */}
        <div className="bg-[#202020] border border-[#474747] rounded-2xl overflow-hidden">
          <Table
            columns={tableColumns}
            data={filteredExpenses}
            keyExtractor={(row) => row.id}
            loading={loading}
            emptyMessage="Nenhuma despesa encontrada para os filtros selecionados."
          />
        </div>
      </main>

      {/* Modal: Criar / Editar Despesa */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editing ? 'Editar Despesa' : 'Nova Despesa'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">

          {/* Campo: Descrição */}
          <Input
            label="Descrição"
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Ex: Troca de óleo da ABC-1234"
            required
          />

          {/* Linha: Valor + Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0,00"
              required
            />
            <Input
              label="Data"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          {/* Campo: Categoria */}
          <Select
            label="Categoria"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={categoryOptions}
            required
          />

          {/* Campo: Observações */}
          <Textarea
            label="Observações"
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
            placeholder="Detalhes adicionais, número de nota fiscal, etc. (opcional)"
          />

          {/* Botões de ação do formulário */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={handleCloseModal} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editing ? 'Salvar Alterações' : 'Criar Despesa'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirmar Exclusão */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Excluir Despesa"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-[#c7c7c7]">
            Tem certeza que deseja excluir a despesa{' '}
            <strong className="text-[#f5f5f5]">&ldquo;{deleting?.description}&rdquo;</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
