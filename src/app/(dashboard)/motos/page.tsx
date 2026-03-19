/**
 * @file src/app/(dashboard)/motos/page.tsx
 * @description Página de gestão de frota do sistema GoMoto.
 * 
 * @summary
 * Esta página é o centro de controle dos ativos físicos da empresa (as motocicletas).
 * O "porquê" desta página é fornecer uma visão completa e controle total sobre cada
 * veículo, desde seu cadastro inicial até seu status operacional diário.
 * 
 * @funcionalidades
 * 1.  **Visualização da Frota**: Exibe todas as motocicletas cadastradas em um formato de grade (cards).
 * 2.  **Filtros Rápidos**: Permite filtrar a frota por status (Disponível, Alugada, Manutenção).
 * 3.  **Busca Detalhada**: Oferece pesquisa por placa, modelo ou marca.
 * 4.  **Cadastro Guiado (Wizard)**: Um fluxo de 2 passos para registrar novas motos, garantindo
 *     que dados técnicos e de manutenção inicial sejam coletados corretamente.
 * 5.  **Edição e Detalhes**: Permite editar informações e visualizar uma ficha técnica completa de cada veículo.
 * 
 * @arquitetura
 * - **Client Component**: A página é interativa, usando estado do React para filtros, modais e formulários.
 * - **Estrutura de Dados Mock**: Simula a tabela `motos` do Supabase para desenvolvimento ágil.
 * - **Componentização**: A ficha técnica e os cards são componentizados para reutilização e clareza.
 * - **Cores Semânticas**: O status de cada moto é refletido visualmente na borda do card,
 *   permitindo uma identificação rápida do estado operacional da frota.
 */

'use client' // Diretiva para indicar que este é um Client Component (interatividade React)

// Importação de hooks do React para gerenciamento de estado local
import { useState } from 'react'
// Importação de ícones da biblioteca Lucide para auxílio visual na interface
import { 
  Plus,          // Ícone de adição para novo cadastro
  Edit2,         // Ícone de lápis para edição
  Trash2,        // Ícone de lixeira para exclusão
  Eye,           // Ícone de olho para visualização de detalhes
  Bike,          // Ícone representativo de motocicleta
  X,             // Ícone de fechamento/cancelamento
  CheckCircle,   // Ícone de sucesso (manutenção em dia)
  AlertCircle,   // Ícone de alerta (revisão pendente)
  Search         // Ícone de lupa para o campo de busca
} from 'lucide-react'

// Importação de componentes de layout e UI personalizados do projeto
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

// Importação de funções utilitárias
import { formatCurrency } from '@/lib/utils'

// Importação de definições de tipos TypeScript globais
import type { Motorcycle, MotorcycleStatus } from '@/types'

/**
 * @constant mockMotorcycles
 * @description Lista estática de motos para popular a interface durante o desenvolvimento.
 * O "porquê": Permite construir e testar a UI sem depender de uma conexão real com o banco de dados,
 * agilizando o desenvolvimento do front-end. Reflete a estrutura da tabela `motos` no Supabase.
 */
const mockMotorcycles: Motorcycle[] = [
  {
    id: '1',                                      // Identificador único (UUID no banco real)
    renavam: '1373480839',                       // Código RENAVAM do veículo
    license_plate: 'SYF1C42',                            // Placa Mercosul
    make: 'HONDA',                              // Fabricante
    model: 'CG 160 START',                      // Modelo comercial
    year: '23/24',                                // Ano de fabricação e modelo
    chassis: '9C2KC2500RR028495',                 // Número de chassi para conferência
    color: 'VERMELHA',                             // Cor predominante
    fuel: 'GASOLINA',                     // Tipo de combustível
    engine_capacity: '0CV/149',              // Especificações técnicas do motor
    previous_owner: 'BRUNO CESAR SOUZA DA COSTA',   // Nome do proprietário anterior (compra usada)
    previous_owner_cpf: '114.967.617-58',           // Documento do vendedor
    purchase_date: '2025-01-10',                   // Data em que a GoMoto adquiriu o bem
    fipe_value: 15791,                           // Valor de mercado na data da compra
    maintenance_up_to_date: true,                     // Flag de controle de revisão
    status: 'rented',                           // Estado operacional atual
    observations: 'Veículo em excelentes condições, com a quilometragem atual de aproximadamente 2.500 km rodados.',
    created_at: '2025-01-10T10:00:00Z',          // Timestamp de criação do registro
    updated_at: '2025-01-10T10:00:00Z',          // Timestamp de última alteração
  },
  {
    id: '2',
    renavam: '1141548353',
    license_plate: 'KYN9J41',
    make: 'YAMAHA',
    model: 'YS150 FAZER SED',
    year: '17/18',
    chassis: '9C6RG3810J0015498',
    color: 'VERMELHA',
    fuel: 'ÁLCOOL/GASOLINA',
    engine_capacity: '0CV/149',
    previous_owner: 'JUAREZ RIBEIRO DE SOUZA FILHO',
    previous_owner_cpf: '738.321.897-34',
    purchase_date: '2025-01-16',
    fipe_value: 12865,
    maintenance_up_to_date: false,
    status: 'rented',
    observations: 'O veículo teve o painel substituído. Atualmente, possui 1.700 km rodados. O antigo proprietário informou que, no momento da troca, o veículo registrava 35.000 km.',
    created_at: '2025-01-16T10:00:00Z',
    updated_at: '2025-01-16T10:00:00Z',
  },
  {
    id: '3',
    renavam: '1353627230',
    license_plate: 'RIW4J89',
    make: 'YAMAHA',
    model: 'YS150 FAZER SED',
    year: '23/24',
    chassis: '9C6RG3850R0048746',
    color: 'VERMELHA',
    fuel: 'ÁLCOOL/GASOLINA',
    engine_capacity: '0CV/149',
    previous_owner: 'LUIZ ADRIANO GOMES',
    previous_owner_cpf: '009.523.047-59',
    purchase_date: '2025-05-22',
    fipe_value: 13000,
    maintenance_up_to_date: false,
    status: 'rented',
    observations: 'Veículo em excelentes condições, com a quilometragem atual de aproximadamente 24.360 km rodados.',
    created_at: '2026-05-22T10:00:00Z',
    updated_at: '2026-05-22T10:00:00Z',
  },
  {
    id: '4',
    renavam: '1291640719',
    license_plate: 'RJA5J85',
    make: 'YAMAHA',
    model: 'YBR150 FACTOR SED',
    year: '22/22',
    chassis: '9C6RG3160N0035522',
    color: 'VERMELHA',
    fuel: 'ÁLCOOL/GASOLINA',
    engine_capacity: '0CV/149',
    previous_owner: 'VANIO DA SILVA LUCENA',
    previous_owner_cpf: '099.559.627-12',
    purchase_date: '2025-09-04',
    fipe_value: 13500,
    maintenance_up_to_date: true,
    status: 'rented',
    observations: 'Veículo em excelentes condições, com a quilometragem atual de aproximadamente 19.750 km rodados.',
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',
  },
]

/**
 * @constant filterOptions
 * @description Define os botões de filtro rápido acima da listagem.
 */
const filterOptions = [
  { label: 'Todas', value: 'all' },
  { label: 'Disponíveis', value: 'available' },
  { label: 'Alugadas', value: 'rented' },
  { label: 'Em Manutenção', value: 'maintenance' },
]

/**
 * @constant statusOptions
 * @description Opções para o campo Select do formulário de cadastro.
 */
const statusOptions = [
  { value: 'available', label: 'Disponível' },
  { value: 'rented', label: 'Alugada' },
  { value: 'maintenance', label: 'Em Manutenção' },
  { value: 'inactive', label: 'Inativa' },
]

/**
 * @constant fuelOptions
 * @description Tipos de combustíveis suportados pelo sistema.
 */
const fuelOptions = [
  { value: 'GASOLINA', label: 'Gasolina' },
  { value: 'ÁLCOOL/GASOLINA', label: 'Álcool/Gasolina (Flex)' },
  { value: 'ELÉTRICO', label: 'Elétrico' },
]

/**
 * @constant BOOTSTRAP_MAINTENANCE_ITEMS
 * @description Lista de itens de manutenção preventiva padrão para motos 150/160cc.
 * O "porquê": Estes itens são a base para o sistema de previsão de manutenções.
 * Ao cadastrar uma nova moto, o Passo 2 (Bootstrap) usa esta lista para criar
 * o histórico inicial, permitindo que o sistema agende as próximas revisões.
 */
const BOOTSTRAP_MAINTENANCE_ITEMS = [
  { id: 'ip1',  name: 'Troca de óleo',                        type: 'km'   as const, interval: 1000,  hint: 'a cada 1.000 km'      },
  { id: 'ip2',  name: 'Filtro de óleo',                        type: 'km'   as const, interval: 4000,  hint: 'a cada 4.000 km'      },
  { id: 'ip5',  name: 'Troca da relação (corrente/coroa/pinhão)', type: 'km'   as const, interval: 12000, hint: 'a cada 12.000 km'     },
  { id: 'ip6',  name: 'Lona de freio traseira',                   type: 'km'   as const, interval: 12000, hint: 'a cada 12.000 km'     },
  { id: 'ip7',  name: 'Pastilha de freio dianteira',            type: 'km'   as const, interval: 8000,  hint: 'a cada 8.000 km'      },
  { id: 'ip8',  name: 'Pneu dianteiro',                        type: 'km'   as const, interval: 12000, hint: 'a cada 12.000 km'     },
  { id: 'ip9',  name: 'Pneu traseiro',                         type: 'km'   as const, interval: 8000,  hint: 'a cada 8.000 km'      },
  { id: 'ip10', name: 'Filtro de ar',                        type: 'km'   as const, interval: 7000,  hint: 'a cada 7.000 km'      },
  { id: 'ip11', name: 'Velas de ignição',                       type: 'km'   as const, interval: 10000, hint: 'a cada 10.000 km'     },
  { id: 'ip12', name: 'Amortecedores',                   type: 'km'   as const, interval: 25000, hint: 'a cada 25.000 km'     },
  { id: 'ip13', name: 'Vistoria mensal',                type: 'data' as const, interval: 30,    hint: 'a cada mês'         },
]

/**
 * @constant defaultFormState
 * @description Define os valores padrão para o formulário de criação de moto.
 * O "porquê": Garante que todos os campos controlados do formulário tenham um valor inicial
 * definido, evitando erros de "uncontrolled to controlled component" no React.
 */
const defaultFormState = {
  licensePlate: '',         // Placa do veículo
  model: '',                // Modelo (Ex: Titan 160)
  make: '',                 // Marca (Ex: Honda)
  year: '',                 // Ano (Ex: 2024)
  color: '',                // Cor (Ex: Azul)
  renavam: '',              // Código RENAVAM
  chassis: '',              // Número do Chassi
  fuel: 'GASOLINA',         // Combustível padrão
  engineCapacity: '',       // CC/Potência
  previousOwnerName: '',    // Nome do vendedor anterior
  previousOwnerDocument: '',// CPF do vendedor anterior
  purchaseDate: '',         // Data de aquisição
  fipeValue: '',            // Valor de mercado
  currentKm: '',            // Quilometragem atual de entrada
  maintenanceUpToDate: 'true', // Status de manutenção inicial
  status: 'available',      // Status operacional inicial
  observations: '',         // Observações de vistoria de entrada
}

/**
 * @constant cardBorderMap
 * @description Associa cada status de moto a uma classe de borda do Tailwind CSS.
 * O "porquê": Permite que a UI indique visualmente o status sem precisar ler o texto,
 * usando cores semânticas para uma identificação rápida do estado operacional da frota.
 */
const cardBorderMap: Record<string, string> = {
  available: 'border-green-500/20', // Borda sutil verde
  rented: 'border-blue-500/20',     // Borda sutil azul
  maintenance: 'border-amber-500/20', // Borda sutil laranja
  inactive: 'border-white/10',        // Borda cinza neutra
}

/**
 * @function motorcycleToForm
 * @description Converte um objeto Moto (formato do banco) para o formato esperado pelo formulário (Strings).
 * O "porquê": Essencial para popular os campos durante a edição de um registro existente,
 * adaptando os tipos de dados (ex: number para string) para os inputs HTML.
 */
function motorcycleToForm(motorcycle: Motorcycle) {
  return {
    licensePlate: motorcycle.license_plate,
    model: motorcycle.model,
    make: motorcycle.make,
    year: motorcycle.year,
    color: motorcycle.color,
    renavam: motorcycle.renavam,
    chassis: motorcycle.chassis,
    fuel: motorcycle.fuel ?? 'GASOLINA',
    engineCapacity: motorcycle.engine_capacity ?? '',
    previousOwnerName: motorcycle.previous_owner ?? '',
    previousOwnerDocument: motorcycle.previous_owner_cpf ?? '',
    purchaseDate: motorcycle.purchase_date ?? '',
    fipeValue: motorcycle.fipe_value ? String(motorcycle.fipe_value) : '',
    currentKm: '', // KM atual não vem do objeto moto base (geralmente vem de logs de manutenção)
    maintenanceUpToDate: motorcycle.maintenance_up_to_date !== false ? 'true' : 'false',
    status: motorcycle.status,
    observations: motorcycle.observations ?? '',
  }
}

/**
 * @component MotorcyclesPage
 * @description Gerencia toda a lógica e renderização da tela de frota.
 */
export default function MotorcyclesPage() {
  /* 
   * GERENCIAMENTO DE ESTADOS (React State):
   */
  // Lista principal de motos exibida na tela.
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>(mockMotorcycles)
  // Valor atual do filtro de status (todas, disponivel, etc).
  const [filter, setFilter] = useState('all')
  // Texto digitado no campo de busca para filtragem dinâmica.
  const [search, setSearch] = useState('')
  // Controla se o modal de formulário está visível.
  const [modalOpen, setModalOpen] = useState(false)
  // Armazena o ID da moto sendo editada. Se for `null`, o modal funciona como "Novo Cadastro".
  const [editingId, setEditingId] = useState<string | null>(null)
  // Objeto contendo os dados atuais digitados no formulário do modal.
  const [form, setForm] = useState(defaultFormState)
  // Objeto da moto selecionada para visualização detalhada no modal de leitura.
  const [motorcycleDetails, setMotorcycleDetails] = useState<Motorcycle | null>(null)
  // Objeto da moto marcada para exclusão definitiva.
  const [deletingMotorcycle, setDeletingMotorcycle] = useState<Motorcycle | null>(null)
  // Passo atual do Wizard de cadastro (1 = Dados Básicos, 2 = Manutenções Iniciais).
  const [step, setStep] = useState<1 | 2>(1)
  // Mapa de valores (KM ou Data) informados no passo 2 do cadastro.
  const [bootstrapItems, setBootstrapItems] = useState<Record<string, string>>({})

  /**
   * @const filteredMotorcycles
   * @description Filtra a lista de motos em tempo real com base no status e busca.
   * O "porquê" de ser uma constante derivada: Evita a necessidade de um estado
   * separado para a lista filtrada, recalculando-a apenas quando as dependências
   * (`motorcycles`, `filter`, `search`) mudam, o que é eficiente.
   */
  const filteredMotorcycles = motorcycles.filter((m) => {
    // Verifica se a moto pertence à categoria de status selecionada.
    const passesFilter = filter === 'all' || m.status === filter
    // Verifica se algum campo da moto contém o texto da busca (case-insensitive).
    const passesSearch = !search || [m.license_plate, m.model, m.make, m.color].some(
      (v) => v?.toLowerCase().includes(search.toLowerCase())
    )
    return passesFilter && passesSearch
  })

  /**
   * @function openNewMotorcycle
   * @description Prepara o estado para abrir o modal de criação de um novo veículo.
   */
  function openNewMotorcycle() {
    setEditingId(null)           // Modo: Criação
    setForm(defaultFormState)    // Limpa os campos
    setBootstrapItems({})        // Limpa manutenções
    setStep(1)                   // Volta ao passo 1
    setModalOpen(true)           // Abre o modal
  }

  /**
   * @function closeModal
   * @description Reseta os estados auxiliares e fecha o modal.
   */
  function closeModal() {
    setModalOpen(false)
    setStep(1)
    setBootstrapItems({})
  }

  /**
   * @function openEditMotorcycle
   * @description Prepara o estado para abrir o modal de edição de um veículo existente.
   */
  function openEditMotorcycle(motorcycle: Motorcycle) {
    setEditingId(motorcycle.id)                  // Modo: Edição
    setForm(motorcycleToForm(motorcycle))        // Popula com dados atuais
    setModalOpen(true)                           // Abre o modal
  }

  /**
   * @function handleStep1
   * @description Processa a submissão do passo 1. Se for edição, finaliza. Se for criação, avança.
   */
  function handleStep1(e: React.FormEvent) {
    e.preventDefault() // Evita recarregamento da página
    if (editingId) {
      handleSubmitFinal() // Edição não passa pelo passo 2 (bootstrap)
    } else {
      setStep(2) // Avança para configuração de manutenções
    }
  }

  /**
   * @function handleSubmitFinal
   * @description Consolida os dados do formulário e salva no estado global (simula o DB).
   */
  function handleSubmitFinal() {
    // Criação do objeto de dados higienizado
    const motorcycleData: Partial<Motorcycle> = {
      license_plate: form.licensePlate.toUpperCase(),          // Placa sempre em maiúscula
      model: form.model,
      make: form.make.toUpperCase(),
      year: form.year,
      color: form.color.toUpperCase(),
      renavam: form.renavam,
      chassis: form.chassis.toUpperCase(),
      fuel: form.fuel,
      engine_capacity: form.engineCapacity,
      previous_owner: form.previousOwnerName,
      previous_owner_cpf: form.previousOwnerDocument,
      purchase_date: form.purchaseDate,
      // Converte string monetária para número decimal
      fipe_value: form.fipeValue ? parseFloat(form.fipeValue.replace(',', '.')) : undefined,
      maintenance_up_to_date: form.maintenanceUpToDate === 'true',
      status: form.status as MotorcycleStatus,
      observations: form.observations,
      updated_at: new Date().toISOString(),
    }

    if (editingId) {
      // CASO EDIÇÃO: Atualiza o item correspondente no array
      setMotorcycles((prev) =>
        prev.map((m) => (m.id === editingId ? { ...m, ...motorcycleData } : m))
      )
    } else {
      // CASO CRIAÇÃO: Adiciona novo item ao início da lista
      const newMotorcycle: Motorcycle = {
        id: String(Date.now()), // Gera ID temporário baseado no timestamp
        created_at: new Date().toISOString(),
        ...motorcycleData,
      } as Motorcycle
      setMotorcycles((prev) => [newMotorcycle, ...prev])
      
      // LÓGICA FUTURA: Aqui os 'bootstrapItems' seriam enviados para uma API
      // para criar os registros iniciais na tabela de histórico de manutenção.
    }

    closeModal() // Fecha modal e limpa estados
  }

  /**
   * @function confirmDeletion
   * @description Executa a remoção definitiva da moto da lista.
   */
  function confirmDeletion() {
    if (!deletingMotorcycle) return
    setMotorcycles((prev) => prev.filter((m) => m.id !== deletingMotorcycle.id))
    setDeletingMotorcycle(null) // Fecha modal de confirmação
  }

  // Renderização principal do componente
  return (
    <div className="flex flex-col min-h-full">
      {/* 
        * COMPONENTE: Cabeçalho da Página
        * Exibe o título e o contador total de veículos.
        * Fornece a ação principal para cadastrar nova moto.
        */}
      <Header
        title="Motocicletas"
        subtitle={`${motorcycles.length} motos registradas na frota`}
        actions={
          <Button onClick={openNewMotorcycle} className="shadow-lg shadow-[#BAFF1A]/10">
            <Plus className="w-4 h-4" />
            Nova Moto
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        
        {/* 
          * ÁREA DE FILTROS E BUSCA
          * Combina Tabs de status com um campo de busca textual.
          */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* BOTÕES DE FILTRO (TABS) */}
          <div className="flex gap-2 flex-wrap">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  filter === opt.value
                    ? 'bg-[#BAFF1A] text-[#121212] shadow-md shadow-[#BAFF1A]/20 scale-[1.02]'
                    : 'bg-[#202020] border border-[#333333] text-[#A0A0A0] hover:text-white hover:border-[#555555]'
                }`}
              >
                {opt.label}
                {/* Contador específico por categoria de status */}
                {opt.value !== 'all' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    filter === opt.value ? 'bg-black/10' : 'bg-white/5'
                  }`}>
                    {motorcycles.filter((m) => m.status === opt.value).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {/* CAMPO DE PESQUISA DINÂMICA */}
          <div className="ml-auto relative min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <input
              type="text"
              placeholder="Buscar placa, modelo, marca ou cor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#202020] border border-[#333333] text-sm text-white placeholder-[#606060] focus:outline-none focus:border-[#BAFF1A]/50 focus:ring-1 focus:ring-[#BAFF1A]/20 transition-all"
            />
          </div>
        </div>

        {/* 
          * LISTAGEM DE MOTOS (GRID)
          * Renderiza os cards das motos filtradas ou uma mensagem de "vazio".
          */}
        {filteredMotorcycles.length === 0 ? (
          /* ESTADO VAZIO: Quando a busca/filtro não retorna resultados */
          <div className="flex flex-col items-center justify-center py-24 bg-[#1a1a1a]/50 rounded-2xl border border-dashed border-[#333333]">
            <div className="w-16 h-16 bg-[#252525] rounded-full flex items-center justify-center text-[#555555] mb-4">
              <Bike className="w-8 h-8" />
            </div>
            <p className="text-[#A0A0A0] font-medium">Nenhum veículo encontrado para os filtros atuais.</p>
            <button 
              onClick={() => {setFilter('all'); setSearch('');}}
              className="text-xs text-[#BAFF1A] mt-2 hover:underline"
            >
              Limpar todos os filtros
            </button>
          </div>
        ) : (
          /* GRADE DE RESULTADOS */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredMotorcycles.map((moto) => (
              <div
                key={moto.id}
                className={`bg-[#202020] border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1 group ${
                  cardBorderMap[moto.status] ?? 'border-[#333333]'
                }`}
              >
                {/* ÁREA SUPERIOR: Imagem/Placeholder e Selos de Status */}
                <div className="h-40 bg-gradient-to-b from-[#2a2a2a] to-[#202020] flex items-center justify-center border-b border-[#333333] relative">
                  <div className="flex flex-col items-center gap-2 text-[#444444] group-hover:text-[#666666] transition-colors">
                    <Bike className="w-14 h-14" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Sem Imagem</span>
                  </div>
                  
                  {/* SELO DE MANUTENÇÃO: Indicativo crítico de segurança */}
                  <div className="absolute top-3 right-3">
                    {moto.maintenance_up_to_date ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-tight">
                        <CheckCircle className="w-3 h-3" />
                        Manutenção em Dia
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-tight">
                        <AlertCircle className="w-3 h-3" />
                        Revisão Pendente
                      </span>
                    )}
                  </div>
                </div>

                {/* ÁREA DE CONTEÚDO: Informações principais do veículo */}
                <div className="p-5 space-y-4">
                  {/* Título e Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-base leading-tight truncate group-hover:text-[#BAFF1A] transition-colors">
                        {moto.make} {moto.model}
                      </h4>
                      <p className="text-xs text-[#606060] mt-1 font-medium">Fab/Mod: {moto.year}</p>
                    </div>
                    <StatusBadge status={moto.status} />
                  </div>

                  {/* Detalhes Técnicos Secundários */}
                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5">
                    <div>
                      <p className="text-[10px] font-bold text-[#606060] uppercase tracking-wider">Placa</p>
                      <p className="text-sm font-mono font-bold text-white mt-0.5">{moto.license_plate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-[#606060] uppercase tracking-wider">Cor Principal</p>
                      <p className="text-sm text-[#A0A0A0] mt-0.5 font-medium">{moto.color}</p>
                    </div>
                  </div>

                  {/* Informação Financeira (Opcional) */}
                  {moto.fipe_value && (
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-[#606060] uppercase tracking-wider">Valor de Mercado (FIPE)</p>
                      <p className="text-sm text-[#BAFF1A] font-bold">{formatCurrency(moto.fipe_value)}</p>
                    </div>
                  )}

                  {/* BARRA DE AÇÕES: Interatividade rápida por card */}
                  <div className="flex items-center gap-2 pt-2">
                    {/* Botão de Detalhes Completo */}
                    <button
                      onClick={() => setMotorcycleDetails(moto)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-all font-bold border border-transparent hover:border-white/10"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      DETALHES
                    </button>
                    {/* Botão de Edição */}
                    <button
                      onClick={() => openEditMotorcycle(moto)}
                      className="p-2.5 rounded-xl text-[#A0A0A0] hover:text-[#BAFF1A] hover:bg-[#BAFF1A]/5 transition-all border border-transparent hover:border-[#BAFF1A]/20"
                      title="Editar informações do veículo"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {/* Botão de Exclusão */}
                    <button
                      onClick={() => setDeletingMotorcycle(moto)}
                      className="p-2.5 rounded-xl text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-all border border-transparent hover:border-red-500/20"
                      title="Remover veículo da frota"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 
        * MODAL: FORMULÁRIO DE CADASTRO / EDIÇÃO
        * Implementa o wizard de 2 passos para novos cadastros.
        */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Editar Dados da Moto' : step === 1 ? 'Cadastrar Moto — Passo 1: Identificação' : 'Cadastrar Moto — Passo 2: Configurar Revisões'}
        size="lg"
      >
        {/* ── SEÇÃO: PASSO 1 - DADOS BÁSICOS E TÉCNICOS ──────────────────────────────── */}
        {(editingId || step === 1) && (
        <form onSubmit={handleStep1} className="space-y-5 p-1">
          {/* Identificação Legal */}
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="Placa do Veículo"
              placeholder="Ex: ABC1D23"
              value={form.licensePlate}
              onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
              required
              
            />
            <Input
              label="Código RENAVAM"
              placeholder="Digite os 11 dígitos"
              value={form.renavam}
              onChange={(e) => setForm({ ...form, renavam: e.target.value })}
              required
            />
          </div>

          {/* Dados de Fabricação */}
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="Marca / Fabricante"
              placeholder="Ex: HONDA"
              value={form.make}
              onChange={(e) => setForm({ ...form, make: e.target.value })}
              required
            />
            <Input
              label="Modelo Comercial"
              placeholder="Ex: CG 160 FAN"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              required
            />
          </div>

          {/* Características Físicas e Motorização */}
          <div className="grid grid-cols-3 gap-5">
            <Input
              label="Ano (Fab/Mod)"
              placeholder="Ex: 2024/2024"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              required
            />
            <Input
              label="Cor Predominante"
              placeholder="Ex: PRETA"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              required
            />
            <Select
              label="Combustível"
              options={fuelOptions}
              value={form.fuel}
              onChange={(e) => setForm({ ...form, fuel: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Input
              label="Número do Chassi"
              placeholder="Digite o código gravado no chassi"
              value={form.chassis}
              onChange={(e) => setForm({ ...form, chassis: e.target.value })}
              required
            />
            <Input
              label="Cilindrada do Motor (CC)"
              placeholder="Ex: 162cc"
              value={form.engineCapacity}
              onChange={(e) => setForm({ ...form, engineCapacity: e.target.value })}
            />
          </div>

          {/* HISTÓRICO DE AQUISIÇÃO: Detalhes de quem a GoMoto comprou o veículo */}
          <div className="border-t border-white/5 pt-4 mt-2">
            <h5 className="text-[10px] font-bold text-[#BAFF1A] uppercase tracking-widest mb-4">Informações da Compra</h5>
            <div className="grid grid-cols-2 gap-5">
              <Input
                label="Dono Anterior (Vendedor)"
                placeholder="Nome conforme documento"
                value={form.previousOwnerName}
                onChange={(e) => setForm({ ...form, previousOwnerName: e.target.value })}
              />
              <Input
                label="CPF do Vendedor"
                placeholder="000.000.000-00"
                value={form.previousOwnerDocument}
                onChange={(e) => setForm({ ...form, previousOwnerDocument: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-5 mt-5">
              <Input
                label="Data da Compra"
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
              />
              <Input
                label="Valor de Aquisição / FIPE (R$)"
                placeholder="0,00"
                value={form.fipeValue}
                onChange={(e) => setForm({ ...form, fipeValue: e.target.value })}
              />
            </div>
          </div>

          {/* STATUS OPERACIONAL E USO ATUAL */}
          <div className="grid grid-cols-2 gap-5 border-t border-white/5 pt-4">
            <Select
              label="Status Atual na Frota"
              options={statusOptions}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            />
            <Input
              label="Quilometragem de Entrada"
              type="number"
              placeholder="KM atual indicado no painel"
              value={form.currentKm}
              onChange={(e) => setForm({ ...form, currentKm: e.target.value })}
            />
          </div>

          {/* CAMPO DE TEXTO LIVRE PARA VISTORIA */}
          <Textarea
            label="Laudo de Vistoria / Observações Adicionais"
            placeholder="Descreva arranhões, avarias ou detalhes observados na entrega do veículo..."
            rows={4}
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
          />

          {/* BOTÕES DE NAVEGAÇÃO DO MODAL */}
          <div className="flex gap-4 justify-end pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={closeModal}>
              CANCELAR
            </Button>
            <Button type="submit" className="min-w-[180px]">
              {editingId ? (
                /* Botão se estiver editando */
                <>
                  <Edit2 className="w-4 h-4" />
                  SALVAR ALTERAÇÕES
                </>
              ) : (
                /* Botão se estiver criando nova moto */
                <>
                  PRÓXIMO PASSO: REVISÕES →
                </>
              )}
            </Button>
          </div>
        </form>
        )}

        {/* ── SEÇÃO: PASSO 2 - BOOTSTRAP DE MANUTENÇÃO (APENAS PARA NOVAS MOTOS) ─────────────────── */}
        {!editingId && step === 2 && (
          <div className="space-y-6 p-1">
            <div className="bg-[#BAFF1A]/5 border border-[#BAFF1A]/10 rounded-xl p-4">
              <p className="text-sm text-[#A0A0A0] leading-relaxed">
                Para o sistema prever as próximas revisões, informe a <strong className="text-white">última vez</strong> que cada item abaixo foi trocado ou revisado. 
                <br /><span className="text-[10px] text-[#606060]">DICA: Se não souber, deixe em branco e o sistema marcará como "Revisão Imediata".</span>
              </p>
            </div>

            {/* LISTAGEM DOS ITENS DE MANUTENÇÃO PREVENTIVA */}
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {BOOTSTRAP_MAINTENANCE_ITEMS.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-[#1A1A1A] rounded-xl px-4 py-3 hover:bg-[#222222] transition-colors border border-transparent hover:border-white/5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white uppercase tracking-tight">{item.name}</p>
                    <p className="text-[10px] text-[#606060] font-medium">{item.hint}</p>
                  </div>
                  
                  {/* INPUT DINÂMICO: KM ou DATA dependendo do tipo da métrica */}
                  <div className="flex-shrink-0">
                    {item.type === 'km' ? (
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="KM da Última Troca"
                          value={bootstrapItems[item.id] ?? ''}
                          onChange={(e) => setBootstrapItems((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          className="w-36 px-4 py-2 rounded-lg bg-[#2A2A2A] border border-[#333333] text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#BAFF1A]/40 text-right font-mono"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#555555] font-bold">KM</span>
                      </div>
                    ) : (
                      <input
                        type="date"
                        value={bootstrapItems[item.id] ?? ''}
                        onChange={(e) => setBootstrapItems((prev) => ({ ...prev, [item.id]: e.target.value }))}
                        className="w-44 px-4 py-2 rounded-lg bg-[#2A2A2A] border border-[#333333] text-sm text-white focus:outline-none focus:border-[#BAFF1A]/40"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* FEEDBACK DE CONFIGURAÇÃO */}
            {Object.keys(bootstrapItems).filter((k) => bootstrapItems[k]).length > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <p className="text-[11px] text-blue-400 font-medium">
                  {Object.keys(bootstrapItems).filter((k) => bootstrapItems[k]).length} itens de manutenção serão programados automaticamente.
                </p>
              </div>
            )}

            {/* AÇÕES DE NAVEGAÇÃO DO WIZARD */}
            <div className="flex gap-4 justify-between pt-4 border-t border-white/5">
              <Button variant="ghost" onClick={() => setStep(1)} className="px-6">
                ← VOLTAR AOS DADOS
              </Button>
              <Button onClick={handleSubmitFinal} className="px-10 shadow-lg shadow-[#BAFF1A]/20">
                <Plus className="w-4 h-4" />
                CONCLUIR CADASTRO
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 
        * MODAL: CONFIRMAÇÃO DE EXCLUSÃO
        * Medida de segurança para evitar exclusão acidental.
        */}
      <Modal open={!!deletingMotorcycle} onClose={() => setDeletingMotorcycle(null)} title="Confirmar Exclusão Permanente" size="sm">
        <div className="space-y-6">
          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
            <p className="text-[#A0A0A0] text-sm leading-relaxed text-center">
              Você está prestes a remover a moto <br />
              <strong className="text-white text-base font-bold">{deletingMotorcycle?.make} {deletingMotorcycle?.model} — Placa {deletingMotorcycle?.license_plate}</strong>
              <br /><br />
              Esta operação <span className="text-red-400 font-bold underline">não pode ser desfeita</span> e todos os históricos vinculados serão perdidos.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setDeletingMotorcycle(null)} className="flex-1">
              CANCELAR
            </Button>
            <Button variant="danger" onClick={confirmDeletion} className="flex-1 shadow-lg shadow-red-500/20">
              <Trash2 className="w-4 h-4" />
              CONFIRMAR EXCLUSÃO
            </Button>
          </div>
        </div>
      </Modal>

      {/* 
        * MODAL: VISUALIZAÇÃO DETALHADA (FICHA TÉCNICA)
        * Exibe todas as informações de forma organizada e apenas para leitura.
        */}
      {motorcycleDetails && (
        <Modal
          open={!!motorcycleDetails}
          onClose={() => setMotorcycleDetails(null)}
          title="Ficha Técnica do Veículo"
          size="lg"
        >
          <div className="space-y-8 p-1">
            {/* CABEÇALHO DO MODAL: Título e Status Principal */}
            <div className="flex items-start justify-between gap-6 pb-6 border-b border-white/5">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase italic">
                  {motorcycleDetails.make} {motorcycleDetails.model}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-bold text-[#606060] bg-white/5 px-2 py-0.5 rounded">ANO {motorcycleDetails.year}</span>
                  <span className="text-sm font-bold text-[#606060] bg-white/5 px-2 py-0.5 rounded uppercase">{motorcycleDetails.color}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <StatusBadge status={motorcycleDetails.status} />
                {/* Repetição do selo de manutenção para ênfase */}
                {motorcycleDetails.maintenance_up_to_date ? (
                  <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Manutenção em Dia
                  </span>
                ) : (
                  <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Revisão Pendente
                  </span>
                )}
              </div>
            </div>

            {/* SEÇÃO: INFORMAÇÕES TÉCNICAS E LEGAIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="space-y-4">
                <h5 className="text-[10px] font-black text-[#BAFF1A] uppercase tracking-[0.2em] mb-4">Dados de Registro</h5>
                <div className="space-y-4">
                  <DetailRow label="Placa do Veículo" value={motorcycleDetails.license_plate} mono />
                  <DetailRow label="Código RENAVAM" value={motorcycleDetails.renavam} mono />
                  <DetailRow label="Número do Chassi" value={motorcycleDetails.chassis} mono />
                </div>
              </section>

              <section className="space-y-4">
                <h5 className="text-[10px] font-black text-[#BAFF1A] uppercase tracking-[0.2em] mb-4">Especificações do Motor</h5>
                <div className="space-y-4">
                  <DetailRow label="Tipo de Combustível" value={motorcycleDetails.fuel} />
                  <DetailRow label="Potência / Cilindrada" value={motorcycleDetails.engine_capacity} />
                  <DetailRow label="Identificador de Frota" value={`ID-#${motorcycleDetails.id}`} />
                </div>
              </section>
            </div>

            {/* SEÇÃO: HISTÓRICO DE PROPRIEDADE (Renderização Condicional) */}
            {(motorcycleDetails.previous_owner || motorcycleDetails.purchase_date || motorcycleDetails.fipe_value) && (
              <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5">
                <h5 className="text-[10px] font-black text-[#BAFF1A] uppercase tracking-[0.2em] mb-6">Informações de Aquisição GoMoto</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  {motorcycleDetails.previous_owner && (
                    <DetailRow label="Vendedor / Dono Anterior" value={motorcycleDetails.previous_owner} fullWidth />
                  )}
                  {motorcycleDetails.previous_owner_cpf && (
                    <DetailRow label="CPF do Vendedor" value={motorcycleDetails.previous_owner_cpf} mono />
                  )}
                  {motorcycleDetails.purchase_date && (
                    <DetailRow
                      label="Data da Transferência"
                      value={new Date(motorcycleDetails.purchase_date + 'T12:00:00').toLocaleDateString('pt-BR', { dateStyle: 'long' })}
                    />
                  )}
                  {motorcycleDetails.fipe_value && (
                    <DetailRow
                      label="Avaliação FIPE na Compra"
                      value={formatCurrency(motorcycleDetails.fipe_value)}
                      highlight
                    />
                  )}
                </div>
              </div>
            )}

            {/* SEÇÃO: OBSERVAÇÕES E NOTAS DE VISTORIA */}
            {motorcycleDetails.observations && (
              <div className="space-y-3">
                <h5 className="text-[10px] font-black text-[#BAFF1A] uppercase tracking-[0.2em]">Notas do Veículo & Vistoria</h5>
                <div className="bg-[#2a2a2a]/30 rounded-xl p-5 border border-white/5">
                  <p className="text-sm text-[#A0A0A0] leading-relaxed italic">
                    "{motorcycleDetails.observations}"
                  </p>
                </div>
              </div>
            )}

            {/* AÇÕES DE RODAPÉ DO MODAL */}
            <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
              <Button
                variant="ghost"
                onClick={() => setMotorcycleDetails(null)}
                className="px-8"
              >
                FECHAR
              </Button>
              <Button
                onClick={() => {
                  setMotorcycleDetails(null)
                  openEditMotorcycle(motorcycleDetails)
                }}
                className="px-8"
              >
                <Edit2 className="w-4 h-4" />
                EDITAR INFORMAÇÕES
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

/**
 * @component DetailRow
 * @description Sub-componente para padronizar a exibição de pares Rótulo/Valor na Ficha Técnica.
 * O "porquê": Melhora a manutenção do código ao evitar repetição de classes CSS.
 * 
 * @param {string} label - O texto explicativo do campo.
 * @param {string | number | null} value - O conteúdo a ser exibido.
 * @param {boolean} mono - Se verdadeiro, usa fonte monoespaçada.
 * @param {boolean} highlight - Se verdadeiro, destaca o valor em verde.
 * @param {boolean} fullWidth - Se verdadeiro, ocupa a largura total do grid.
 */
function DetailRow({
  label,
  value,
  mono = false,
  highlight = false,
  fullWidth = false,
}: {
  label: string
  value?: string | number | null
  mono?: boolean
  highlight?: boolean
  fullWidth?: boolean
}) {
  // Se não houver valor, não renderiza nada para manter a UI limpa
  if (!value) return null
  
  return (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <p className="text-[10px] font-bold text-[#555555] uppercase tracking-wider mb-1.5">{label}</p>
      <p
        className={`text-[13px] leading-tight ${mono ? 'font-mono tracking-tighter' : 'font-medium'} ${
          highlight ? 'text-[#BAFF1A]' : 'text-white'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
