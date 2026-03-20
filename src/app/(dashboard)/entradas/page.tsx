/**
 * @file page.tsx
 * @description Página de gestão de Entradas (Receitas) do Sistema GoMoto.
 *
 * Gerencia o registro de todas as entradas financeiras reais no caixa da empresa.
 * Diferente da tela de cobranças (que foca no que deve ser recebido), esta tela
 * foca no que já foi efetivamente pago pelos locatários.
 *
 * Funcionalidades principais:
 * - Listagem de entradas filtrada por mês com total destacado no topo.
 * - CRUD completo: criar, editar e excluir entradas via modais.
 * - Busca por placa, locatário ou tipo de referência.
 * - Autocomplete de placas a partir das motos cadastradas no Supabase.
 * - Cards de resumo: Total do Mês, Quantidade de Lançamentos, Ticket Médio.
 *
 * O código utiliza identificadores em Inglês para conformidade técnica e
 * comentários em Português Brasil para clareza da regra de negócio local.
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, Calendar, DollarSign, Search } from 'lucide-react';
import type { Income } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// --- INTERFACES LOCAIS ---

/**
 * @interface Moto
 * @description Estrutura simplificada de moto usada no datalist de autocomplete de placas.
 */
interface Moto {
  id: string;
  license_plate: string;
  model: string;
  make: string;
}

// --- CONSTANTES ---

/** @constant REFERENCIAS — Tipos possíveis para uma entrada financeira. */
const REFERENCIAS = [
  'Aluguel Semanal',
  'Aluguel Quinzenal',
  'Aluguel Mensal',
  'Caução',
  'Multa',
  'Proporcional',
  'Outros',
];

/** @constant METODOS_PAGAMENTO — Formas de pagamento aceitas pela empresa. */
const METODOS_PAGAMENTO = [
  'PIX',
  'Dinheiro',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Boleto',
  'Transferência',
];

/** @constant FORM_INICIAL — Estado padrão do formulário ao criar uma nova entrada. */
const FORM_INICIAL = {
  vehicle: '',
  date: new Date().toISOString().split('T')[0],
  lessee: '',
  amount: '',
  reference: 'Aluguel Semanal',
  payment_method: 'PIX',
  period_from: '',
  period_to: '',
  observations: '',
};

// --- COMPONENTE PRINCIPAL ---

/**
 * @component EntradasPage
 * @description Página principal de gestão de entradas financeiras do GoMoto.
 */
export default function EntradasPage() {
  const supabase = createClient();

  // --- Estados de Dados ---
  /** Lista de entradas carregadas do Supabase para o mês selecionado. */
  const [incomes, setIncomes] = useState<Income[]>([]);
  /** Lista de motos cadastradas para o autocomplete de placas. */
  const [motos, setMotos] = useState<Moto[]>([]);

  // --- Estados de Carregamento e Ações ---
  /** Indica se os dados da tabela estão sendo buscados. */
  const [loading, setLoading] = useState(true);
  /** Indica se o formulário está sendo submetido (criar ou editar). */
  const [saving, setSaving] = useState(false);
  /** Indica se a exclusão está em andamento. */
  const [deleting, setDeleting] = useState(false);

  // --- Estados de Filtro ---
  /** Texto digitado no campo de busca rápida. */
  const [searchQuery, setSearchQuery] = useState('');
  /** Mês selecionado no filtro, no formato 'YYYY-MM'. Padrão: mês atual. */
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // --- Estados de Controle de Modais ---
  /** Controla a visibilidade do modal de criação/edição. */
  const [isModalOpen, setIsModalOpen] = useState(false);
  /** Controla a visibilidade do modal de confirmação de exclusão. */
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  /** Guarda a entrada em edição ou exclusão; null indica modo de criação. */
  const [currentIncome, setCurrentIncome] = useState<Income | null>(null);

  // --- Estado do Formulário ---
  /** Dados preenchidos no formulário do modal. */
  const [formData, setFormData] = useState(FORM_INICIAL);
  /** Erros de validação do formulário. */
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // --- BUSCA DE DADOS ---

  /**
   * @description Busca as entradas e as motos do Supabase.
   * Filtra as entradas pelo mês selecionado usando os limites de data.
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [yearStr, monthStr] = selectedMonth.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);

      const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).toISOString().split('T')[0];

      const [incomesResult, motosResult] = await Promise.all([
        supabase
          .from('incomes')
          .select('*')
          .gte('date', firstDay)
          .lte('date', lastDay)
          .order('date', { ascending: false }),
        supabase
          .from('motorcycles')
          .select('id, license_plate, model, make')
          .order('license_plate'),
      ]);

      if (incomesResult.error) throw incomesResult.error;
      if (motosResult.error) throw motosResult.error;

      setIncomes((incomesResult.data as Income[]) || []);
      setMotos((motosResult.data as Moto[]) || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, supabase]);

  /** Recarrega os dados sempre que o mês do filtro mudar. */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- CÁLCULOS E FILTRAGEM ---

  /**
   * @description Lista de entradas filtrada pelo texto de busca.
   */
  const filteredIncomes = useMemo(() => {
    if (!searchQuery) return incomes;
    const lowerQuery = searchQuery.toLowerCase();
    return incomes.filter(
      (income) =>
        income.vehicle?.toLowerCase().includes(lowerQuery) ||
        income.lessee?.toLowerCase().includes(lowerQuery) ||
        income.reference?.toLowerCase().includes(lowerQuery)
    );
  }, [incomes, searchQuery]);

  /** Totais calculados do período filtrado. */
  const { totalAmount, launchCount, averageTicket } = useMemo(() => {
    const total = filteredIncomes.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const count = filteredIncomes.length;
    const avg = count > 0 ? total / count : 0;
    return { totalAmount: total, launchCount: count, averageTicket: avg };
  }, [filteredIncomes]);

  // --- HANDLERS DE MODAL ---

  /**
   * @description Abre o modal em modo de criação ou edição.
   * @param income — Dados da entrada que será editada; undefined para criar nova.
   */
  const handleOpenModal = (income?: Income) => {
    if (income) {
      setCurrentIncome(income);
      setFormData({
        vehicle: income.vehicle || '',
        date: income.date || new Date().toISOString().split('T')[0],
        lessee: income.lessee || '',
        amount: String(income.amount || ''),
        reference: income.reference || 'Aluguel Semanal',
        payment_method: income.payment_method || 'PIX',
        period_from: income.period_from || '',
        period_to: income.period_to || '',
        observations: income.observations || '',
      });
    } else {
      setCurrentIncome(null);
      setFormData(FORM_INICIAL);
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  /** @description Fecha o modal de criação/edição e limpa o estado. */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentIncome(null);
    setFormData(FORM_INICIAL);
    setFormErrors({});
  };

  /**
   * @description Abre o modal de confirmação de exclusão.
   * @param income — Entrada que será excluída.
   */
  const handleOpenDeleteModal = (income: Income) => {
    setCurrentIncome(income);
    setIsDeleteModalOpen(true);
  };

  /** @description Fecha o modal de confirmação de exclusão. */
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentIncome(null);
  };

  // --- HANDLERS DE FORMULÁRIO ---

  /** @description Handler genérico para campos input e textarea do formulário. */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** @description Handler genérico para campos select do formulário. */
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- OPERAÇÕES CRUD ---

  /**
   * @description Valida os campos obrigatórios antes de salvar.
   * @returns true se o formulário for válido, false caso contrário.
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.vehicle) errors.vehicle = 'A placa é obrigatória';
    if (!formData.date) errors.date = 'A data é obrigatória';
    if (!formData.lessee) errors.lessee = 'O locatário é obrigatório';
    if (!formData.amount || isNaN(Number(formData.amount))) errors.amount = 'Informe um valor válido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * @description Salva os dados do formulário no Supabase (INSERT ou UPDATE).
   */
  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        vehicle: formData.vehicle.toUpperCase(),
        date: formData.date,
        lessee: formData.lessee,
        amount: Number(formData.amount),
        reference: formData.reference,
        payment_method: formData.payment_method,
        period_from: formData.period_from || null,
        period_to: formData.period_to || null,
        observations: formData.observations || null,
      };

      if (currentIncome) {
        const { error } = await supabase
          .from('incomes')
          .update(payload)
          .eq('id', currentIncome.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('incomes').insert([payload]);
        if (error) throw error;
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar entrada:', error);
      alert('Erro ao salvar os dados. Verifique e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * @description Executa a exclusão definitiva da entrada selecionada.
   */
  const handleDelete = async () => {
    if (!currentIncome) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', currentIncome.id);

      if (error) throw error;

      handleCloseDeleteModal();
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir entrada:', error);
      alert('Erro ao excluir a entrada.');
    } finally {
      setDeleting(false);
    }
  };

  // --- DEFINIÇÃO DE COLUNAS DA TABELA ---

  /** @description Configuração das colunas da tabela de entradas. */
  const columns = [
    {
      key: 'date',
      header: 'Data',
      render: (item: Income) => formatDate(item.date),
    },
    {
      key: 'vehicle',
      header: 'Placa',
      render: (item: Income) => (
        <span className="bg-[#323232] text-[#BAFF1A] px-2 py-0.5 rounded text-xs font-mono">
          {item.vehicle}
        </span>
      ),
    },
    {
      key: 'lessee',
      header: 'Locatário',
      render: (item: Income) => (
        <span className="font-medium text-[#f5f5f5]">{item.lessee}</span>
      ),
    },
    {
      key: 'reference',
      header: 'Tipo',
      render: (item: Income) => <Badge variant="muted">{item.reference}</Badge>,
    },
    {
      key: 'period',
      header: 'Período',
      render: (item: Income) =>
        item.period_from && item.period_to
          ? `${formatDate(item.period_from)} - ${formatDate(item.period_to)}`
          : '—',
    },
    {
      key: 'payment_method',
      header: 'Método',
      render: (item: Income) => item.payment_method,
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (item: Income) => (
        <span className="text-[#BAFF1A] font-semibold">
          {formatCurrency(Number(item.amount))}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'text-right',
      render: (item: Income) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal(item)}
            aria-label="Editar entrada"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleOpenDeleteModal(item)}
            aria-label="Excluir entrada"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // --- RENDERIZAÇÃO ---

  return (
    <div className="bg-[#121212] min-h-screen">
      {/* Cabeçalho da página com botão de nova entrada */}
      <Header
        title="Entradas"
        actions={
          <Button onClick={() => handleOpenModal()} variant="primary">
            <Plus className="w-4 h-4 mr-1" />
            Nova Entrada
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Cards de Estatísticas do Mês */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total do mês em destaque com barra lateral verde limão */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[#c7c7c7] font-medium">Total do Mês</p>
              <TrendingUp className="w-5 h-5 text-[#BAFF1A]" />
            </div>
            <p className="text-3xl font-bold text-[#BAFF1A]">{formatCurrency(totalAmount)}</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[#c7c7c7] font-medium">Lançamentos no Mês</p>
              <Calendar className="w-5 h-5 text-[#c7c7c7]" />
            </div>
            <p className="text-3xl font-bold text-[#f5f5f5]">{launchCount}</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[#c7c7c7] font-medium">Ticket Médio</p>
              <DollarSign className="w-5 h-5 text-[#c7c7c7]" />
            </div>
            <p className="text-3xl font-bold text-[#f5f5f5]">{formatCurrency(averageTicket)}</p>
          </Card>
        </div>

        {/* Filtros: Busca e Seleção de Mês */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#616161]" />
            </div>
            <input
              type="text"
              placeholder="Buscar por placa, locatário ou tipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 h-12 rounded-lg text-sm text-[#f5f5f5] bg-[#323232] border border-[#323232] placeholder:text-[#616161] focus:outline-none focus:border-[#BAFF1A] focus:ring-1 focus:ring-[#BAFF1A]/30 transition-colors"
            />
          </div>

          <div className="relative">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block w-full sm:w-48 px-3 h-12 rounded-lg text-sm text-[#f5f5f5] bg-[#323232] border border-[#323232] focus:outline-none focus:border-[#BAFF1A] focus:ring-1 focus:ring-[#BAFF1A]/30 transition-colors"
            />
          </div>
        </div>

        {/* Linha de resumo acima da tabela */}
        <div className="flex items-center justify-between text-sm text-[#c7c7c7] mb-3 px-1">
          <span>{filteredIncomes.length} {filteredIncomes.length === 1 ? 'entrada encontrada' : 'entradas encontradas'}</span>
          <span>
            Total:{' '}
            <span className="font-semibold text-[#BAFF1A]">{formatCurrency(totalAmount)}</span>
          </span>
        </div>

        {/* Tabela de Entradas */}
        <div className="bg-[#202020] border border-[#474747] rounded-2xl overflow-hidden">
          <Table
            columns={columns}
            data={filteredIncomes}
            keyExtractor={(row) => row.id}
            loading={loading}
            emptyMessage="Nenhuma entrada encontrada para este período."
          />
        </div>
      </main>

      {/* Modal de Nova Entrada / Edição */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={currentIncome ? 'Editar Entrada' : 'Nova Entrada'}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Placa com datalist para autocomplete */}
          <div>
            <Input
              label="Placa da Moto *"
              name="vehicle"
              value={formData.vehicle}
              onChange={handleInputChange}
              list="motos-list"
              placeholder="Ex: ABC-1234"
              error={formErrors.vehicle}
              required
            />
            <datalist id="motos-list">
              {motos.map((moto) => (
                <option key={moto.id} value={moto.license_plate}>
                  {moto.license_plate} — {moto.make} {moto.model}
                </option>
              ))}
            </datalist>
          </div>

          <Input
            label="Data do Pagamento *"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            error={formErrors.date}
            required
          />

          <Input
            label="Locatário *"
            name="lessee"
            value={formData.lessee}
            onChange={handleInputChange}
            placeholder="Nome completo"
            error={formErrors.lessee}
            required
          />

          <Input
            label="Valor (R$) *"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0.00"
            error={formErrors.amount}
            required
          />

          <Select
            label="Tipo de Referência *"
            name="reference"
            value={formData.reference}
            onChange={handleSelectChange}
            options={REFERENCIAS.map((r) => ({ value: r, label: r }))}
          />

          <Select
            label="Método de Pagamento *"
            name="payment_method"
            value={formData.payment_method}
            onChange={handleSelectChange}
            options={METODOS_PAGAMENTO.map((m) => ({ value: m, label: m }))}
          />

          <Input
            label="Período De (opcional)"
            name="period_from"
            type="date"
            value={formData.period_from}
            onChange={handleInputChange}
          />

          <Input
            label="Período Até (opcional)"
            name="period_to"
            type="date"
            value={formData.period_to}
            onChange={handleInputChange}
          />

          <div className="md:col-span-2">
            <Textarea
              label="Descrição / Observações (opcional)"
              name="observations"
              rows={3}
              value={formData.observations}
              onChange={handleInputChange}
              placeholder="Detalhes adicionais sobre este recebimento..."
            />
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={handleCloseModal} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            {currentIncome ? 'Salvar Alterações' : 'Salvar Entrada'}
          </Button>
        </div>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="mb-6">
          <p className="text-[#c7c7c7] text-sm leading-relaxed">
            Tem certeza que deseja excluir a entrada de{' '}
            <span className="font-semibold text-[#BAFF1A]">
              {currentIncome ? formatCurrency(Number(currentIncome.amount)) : ''}
            </span>{' '}
            do locatário{' '}
            <span className="font-semibold text-[#f5f5f5]">{currentIncome?.lessee}</span>?
            Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={handleCloseDeleteModal}
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  );
}
