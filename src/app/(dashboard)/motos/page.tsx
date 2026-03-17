/**
 * ARQUIVO: src/app/(dashboard)/motos/page.tsx
 * 
 * DESCRIÇÃO GERAL:
 * Esta é a página de gestão de frota do sistema GoMoto. Ela permite ao administrador:
 * 1. Visualizar todas as motocicletas cadastradas em um formato de grade (cards).
 * 2. Filtrar a frota por status operacional (Disponível, Alugada, Manutenção).
 * 3. Pesquisar veículos específicos por placa, modelo ou marca.
 * 4. Cadastrar novas motos através de um fluxo guiado (Wizard) em dois passos.
 * 5. Editar informações técnicas, financeiras e de aquisição de cada veículo.
 * 6. Visualizar detalhes profundos de cada moto em um modal dedicado.
 * 
 * FLUXO DE CADASTRO (WIZARD):
 * - Passo 1: Coleta de dados básicos (Placa, Renavam, Chassi, Cor, Dados de compra).
 * - Passo 2: Configuração de "Bootstrap" de manutenção (Último KM/Data de cada item).
 * 
 * PADRÕES DE UI/UX:
 * - Uso de cores semânticas nas bordas dos cards para identificação rápida de status.
 * - Modais responsivos para diferentes níveis de informação.
 * - Feedbacks visuais para status de manutenção (OK ou Pendente).
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
 * MOCK DATA: mockMotorcycles
 * 
 * Lista estática de motos para popular a interface durante o desenvolvimento.
 * Reflete a estrutura real da tabela 'motos' no banco de dados Supabase.
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
 * CONFIGURAÇÕES: filterOptions
 * Define os botões de filtro rápido acima da listagem.
 */
const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'Rented', value: 'rented' },
  { label: 'Maintenance', value: 'maintenance' },
]

/**
 * CONFIGURAÇÕES: statusOptions
 * Opções para o campo Select do formulário de cadastro.
 */
const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'rented', label: 'Rented' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inactive', label: 'Inactive' },
]

/**
 * CONFIGURAÇÕES: fuelOptions
 * Tipos de combustíveis suportados pelo sistema.
 */
const fuelOptions = [
  { value: 'GASOLINA', label: 'Gasoline' },
  { value: 'ÁLCOOL/GASOLINA', label: 'Ethanol/Gasoline (Flex)' },
  { value: 'ELÉTRICO', label: 'Electric' },
]

/**
 * CONSTANTE: BOOTSTRAP_MAINTENANCE_ITEMS
 * 
 * Lista de itens de manutenção preventiva padrão para motos 150/160cc.
 * Estes itens são exibidos no Passo 2 do cadastro de uma nova moto para inicializar o histórico.
 */
const BOOTSTRAP_MAINTENANCE_ITEMS = [
  { id: 'ip1',  name: 'Oil change',                        type: 'km'   as const, interval: 1000,  hint: 'every 1,000 km'      },
  { id: 'ip2',  name: 'Oil filter',                        type: 'km'   as const, interval: 4000,  hint: 'every 4,000 km'      },
  { id: 'ip5',  name: 'Chain/sprocket/pinion replacement', type: 'km'   as const, interval: 12000, hint: 'every 12,000 km'     },
  { id: 'ip6',  name: 'Rear brake shoe',                   type: 'km'   as const, interval: 12000, hint: 'every 12,000 km'     },
  { id: 'ip7',  name: 'Front brake pad',                   type: 'km'   as const, interval: 8000,  hint: 'every 8,000 km'      },
  { id: 'ip8',  name: 'Front tire',                        type: 'km'   as const, interval: 12000, hint: 'every 12,000 km'     },
  { id: 'ip9',  name: 'Rear tire',                         type: 'km'   as const, interval: 8000,  hint: 'every 8,000 km'      },
  { id: 'ip10', name: 'Air filter',                        type: 'km'   as const, interval: 7000,  hint: 'every 7,000 km'      },
  { id: 'ip11', name: 'Spark plugs',                       type: 'km'   as const, interval: 10000, hint: 'every 10,000 km'     },
  { id: 'ip12', name: 'Shock absorbers',                   type: 'km'   as const, interval: 25000, hint: 'every 25,000 km'     },
  { id: 'ip13', name: 'Monthly inspection',                type: 'data' as const, interval: 30,    hint: 'every month'         },
]

/**
 * ESTADO INICIAL: defaultFormState
 * 
 * Define os valores padrão para o formulário de criação de moto.
 * Garante que todos os campos controlados tenham um valor inicial (evita erros de undefined).
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
 * MAPA DE CORES: cardBorderMap
 * 
 * Associa cada status de moto a uma classe de borda do Tailwind CSS.
 * Permite que a UI indique visualmente o status sem precisar ler o texto.
 */
const cardBorderMap: Record<string, string> = {
  available: 'border-green-500/20', // Borda sutil verde
  rented: 'border-blue-500/20',     // Borda sutil azul
  maintenance: 'border-amber-500/20', // Borda sutil laranja
  inactive: 'border-white/10',        // Borda cinza neutra
}

/**
 * FUNÇÃO UTILITÁRIA: motorcycleToForm
 * 
 * Converte um objeto Moto (formato do banco) para o formato esperado pelo formulário (Strings).
 * Essencial para popular os campos durante a edição de um registro existente.
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
 * COMPONENTE DE PÁGINA: MotosPage
 * 
 * Gerencia toda a lógica e renderização da tela de frota.
 */
export default function MotorcyclesPage() {
  /* 
   * GERENCIAMENTO DE ESTADOS (React State):
   */
  // Lista principal de motos exibida na tela
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>(mockMotorcycles)
  // Valor atual do filtro de status (todas, disponivel, etc)
  const [filter, setFilter] = useState('all')
  // Texto digitado no campo de busca para filtragem dinâmica
  const [search, setSearch] = useState('')
  // Controla se o modal de formulário está visível
  const [modalOpen, setModalOpen] = useState(false)
  // Armazena o ID da moto sendo editada. Se for null, o modal funciona como "Novo Cadastro".
  const [editingId, setEditingId] = useState<string | null>(null)
  // Objeto contendo os dados atuais digitados no formulário do modal
  const [form, setForm] = useState(defaultFormState)
  // Objeto da moto selecionada para visualização detalhada no modal de leitura
  const [motorcycleDetails, setMotorcycleDetails] = useState<Motorcycle | null>(null)
  // Objeto da moto marcada para exclusão definitiva
  const [deletingMotorcycle, setDeletingMotorcycle] = useState<Motorcycle | null>(null)
  // Passo atual do Wizard de cadastro (1 = Dados Básicos, 2 = Manutenções Iniciais)
  const [step, setStep] = useState<1 | 2>(1)
  // Mapa de valores (KM ou Data) informados no passo 2 do cadastro
  const [bootstrapItems, setBootstrapItems] = useState<Record<string, string>>({})

  /**
   * CONSTANTE: filteredMotorcycles
   * 
   * Filtra a lista de motos em tempo real com base no status selecionado e no termo de busca.
   * A busca ignora maiúsculas/minúsculas e procura em Placa, Modelo, Marca e Cor.
   */
  const filteredMotorcycles = motorcycles.filter((m) => {
    // Verifica se a moto pertence à categoria de status selecionada
    const passesFilter = filter === 'all' || m.status === filter
    // Verifica se algum campo da moto contém o texto da busca
    const passesSearch = !search || [m.license_plate, m.model, m.make, m.color].some(
      (v) => v?.toLowerCase().includes(search.toLowerCase())
    )
    return passesFilter && passesSearch
  })

  /**
   * HANDLER: openNewMotorcycle
   * Prepara o estado para abrir o modal de criação de um novo veículo.
   */
  function openNewMotorcycle() {
    setEditingId(null)           // Modo: Criação
    setForm(defaultFormState)    // Limpa os campos
    setBootstrapItems({})        // Limpa manutenções
    setStep(1)                   // Volta ao passo 1
    setModalOpen(true)           // Abre o modal
  }

  /**
   * HANDLER: closeModal
   * Reseta os estados auxiliares e fecha o modal.
   */
  function closeModal() {
    setModalOpen(false)
    setStep(1)
    setBootstrapItems({})
  }

  /**
   * HANDLER: openEditMotorcycle
   * Prepara o estado para abrir o modal de edição de um veículo existente.
   */
  function openEditMotorcycle(motorcycle: Motorcycle) {
    setEditingId(motorcycle.id)                  // Modo: Edição
    setForm(motorcycleToForm(motorcycle))        // Popula com dados atuais
    setModalOpen(true)                           // Abre o modal
  }

  /**
   * HANDLER: handleStep1
   * 
   * Processa a submissão do formulário de dados básicos.
   * Se for edição, finaliza imediatamente. Se for nova, avança para o passo 2.
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
   * HANDLER: handleSubmitFinal
   * 
   * Consolida todos os dados do formulário e salva no estado global (emula banco de dados).
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
      
      // LOGICA FUTURA: Aqui os 'bootstrapItems' seriam enviados para API 
      // para criar registros iniciais na tabela de histórico de manutenção.
    }

    closeModal() // Fecha modal e limpa estados
  }

  /**
   * HANDLER: confirmDeletion
   * Executa a remoção física da moto da lista atual.
   */
  function confirmDeletion() {
    if (!deletingMotorcycle) return
    setMotorcycles((prev) => prev.filter((m) => m.id !== deletingMotorcycle.id))
    setDeletingMotorcycle(null) // Fecha modal de confirmação
  }

  /**
   * RENDERIZAÇÃO: MotosPage
   */
  return (
    <div className="flex flex-col min-h-full">
      {/* 
        * COMPONENTE: Cabeçalho
        * Exibe o título "Motos" e o contador total de veículos cadastrados.
        * Fornece o botão de ação principal para cadastrar nova moto.
        */}
      <Header
        title="Motorcycles"
        subtitle={`${motorcycles.length} motorcycles registered in the fleet`}
        actions={
          <Button onClick={openNewMotorcycle} className="shadow-lg shadow-[#BAFF1A]/10">
            <Plus className="w-4 h-4" />
            Nova Motorcycle
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
              placeholder="Search license plate, model, make, or color..."
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
          /* ESTADO VAZIO: Quando nenhum critério de busca/filtro retorna resultados */
          <div className="flex flex-col items-center justify-center py-24 bg-[#1a1a1a]/50 rounded-2xl border border-dashed border-[#333333]">
            <div className="w-16 h-16 bg-[#252525] rounded-full flex items-center justify-center text-[#555555] mb-4">
              <Bike className="w-8 h-8" />
            </div>
            <p className="text-[#A0A0A0] font-medium">No vehicles found for current filters.</p>
            <button 
              onClick={() => {setFilter('all'); setSearch('');}}
              className="text-xs text-[#BAFF1A] mt-2 hover:underline"
            >
              Clear all filters
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
                    <span className="text-[10px] font-bold uppercase tracking-widest">No image</span>
                  </div>
                  
                  {/* SELO DE MANUTENÇÃO: Indicativo crítico de segurança */}
                  <div className="absolute top-3 right-3">
                    {moto.maintenance_up_to_date ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-tight">
                        <CheckCircle className="w-3 h-3" />
                        Maintenance Up-to-Date
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-tight">
                        <AlertCircle className="w-3 h-3" />
                        Review Pending
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
                      <p className="text-xs text-[#606060] mt-1 font-medium">Mfg/Model Year: {moto.year}</p>
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
        title={editingId ? 'Edit Motorcycle Data' : step === 1 ? 'Register Motorcycle — Step 1: Identification' : 'Register Motorcycle — Step 2: Configure Revisions'}
        size="lg"
      >
        {/* ── SECTION: STEP 1 - BASIC AND TECHNICAL DATA ──────────────────────────────── */}
        {(editingId || step === 1) && (
        <form onSubmit={handleStep1} className="space-y-5 p-1">
          {/* Identificação Legal */}
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="Vehicle License Plate"
              placeholder="Ex: ABC1D23"
              value={form.licensePlate}
              onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
              required
              
            />
            <Input
              label="RENAVAM Code"
              placeholder="Enter the 11 digits"
              value={form.renavam}
              onChange={(e) => setForm({ ...form, renavam: e.target.value })}
              required
            />
          </div>

          {/* Dados de Fabricação */}
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="Make / Manufacturer"
              placeholder="Ex: HONDA"
              value={form.make}
              onChange={(e) => setForm({ ...form, make: e.target.value })}
              required
            />
            <Input
              label="Commercial Model"
              placeholder="Ex: CG 160 FAN"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              required
            />
          </div>

          {/* Características Físicas e Motorização */}
          <div className="grid grid-cols-3 gap-5">
            <Input
              label="Year (Mfg/Model)"
              placeholder="Ex: 2024/2024"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              required
            />
            <Input
              label="Predominant Color"
              placeholder="Ex: PRETA"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              required
            />
            <Select
              label="Fuel"
              options={fuelOptions}
              value={form.fuel}
              onChange={(e) => setForm({ ...form, fuel: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Input
              label="Chassis Number"
              placeholder="Enter the code engraved on the frame"
              value={form.chassis}
              onChange={(e) => setForm({ ...form, chassis: e.target.value })}
              required
            />
            <Input
              label="Engine Displacement (CC)"
              placeholder="Ex: 162cc"
              value={form.engineCapacity}
              onChange={(e) => setForm({ ...form, engineCapacity: e.target.value })}
            />
          </div>

          {/* ACQUISITION HISTORY: Details who GoMoto bought the vehicle from */}
          <div className="border-t border-white/5 pt-4 mt-2">
            <h5 className="text-[10px] font-bold text-[#BAFF1A] uppercase tracking-widest mb-4">Purchase Information</h5>
            <div className="grid grid-cols-2 gap-5">
              <Input
                label="Previous Owner (Seller)"
                placeholder="Nome conforme documento"
                value={form.previousOwnerName}
                onChange={(e) => setForm({ ...form, previousOwnerName: e.target.value })}
              />
              <Input
                label="Seller's CPF"
                placeholder="000.000.000-00"
                value={form.previousOwnerDocument}
                onChange={(e) => setForm({ ...form, previousOwnerDocument: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-5 mt-5">
              <Input
                label="Purchase Date"
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
              />
              <Input
                label="Acquisition Value / FIPE (R$)"
                placeholder="0.00"
                value={form.fipeValue}
                onChange={(e) => setForm({ ...form, fipeValue: e.target.value })}
              />
            </div>
          </div>

          {/* STATUS OPERACIONAL E USO ATUAL */}
          <div className="grid grid-cols-2 gap-5 border-t border-white/5 pt-4">
            <Select
              label="Current Fleet Status"
              options={statusOptions}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            />
            <Input
              label="Entry Mileage"
              type="number"
              placeholder="Current KM indicated on the panel"
              value={form.currentKm}
              onChange={(e) => setForm({ ...form, currentKm: e.target.value })}
            />
          </div>

          {/* CAMPO DE TEXTO LIVRE PARA VISTORIA */}
          <Textarea
            label="Inspection Report / Additional Observations"
            placeholder="Describe scratches, damages, or details observed upon vehicle delivery..."
            rows={4}
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
          />

          {/* BOTÕES DE NAVEGAÇÃO DO MODAL */}
          <div className="flex gap-4 justify-end pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={closeModal}>
              CANCEL
            </Button>
            <Button type="submit" className="min-w-[180px]">
              {editingId ? (
                /* Botão se estiver editando */
                <>
                  <Edit2 className="w-4 h-4" />
                  SAVE CHANGES
                </>
              ) : (
                /* Botão se estiver criando nova moto */
                <>
                  NEXT STEP: REVISIONS →
                </>
              )}
            </Button>
          </div>
        </form>
        )}

        {/* ── SECTION: STEP 2 - MAINTENANCE BOOTSTRAP (ONLY FOR NEW MOTORCYCLES) ─────────────────── */}
        {!editingId && step === 2 && (
          <div className="space-y-6 p-1">
            <div className="bg-[#BAFF1A]/5 border border-[#BAFF1A]/10 rounded-xl p-4">
              <p className="text-sm text-[#A0A0A0] leading-relaxed">
                For the system to predict upcoming revisions, inform the <strong className="text-white">last time</strong> each item below was changed or revised. 
                <br /><span className="text-[10px] text-[#606060]">TIP: If unknown, leave blank and the system will mark it as "Immediate Revision Needed".</span>
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
                          placeholder="Last Change KM"
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
                ← BACK TO DATA
              </Button>
              <Button onClick={handleSubmitFinal} className="px-10 shadow-lg shadow-[#BAFF1A]/20">
                <Plus className="w-4 h-4" />
                FINISH REGISTRATION
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 
        * MODAL: CONFIRMAÇÃO DE EXCLUSÃO
        * Medida de segurança para evitar exclusão acidental.
        */}
      <Modal open={!!deletingMotorcycle} onClose={() => setDeletingMotorcycle(null)} title="Confirm Permanent Deletion" size="sm">
        <div className="space-y-6">
          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
            <p className="text-[#A0A0A0] text-sm leading-relaxed text-center">
              You are about to remove the motorcycle <br />
              <strong className="text-white text-base font-bold">{deletingMotorcycle?.make} {deletingMotorcycle?.model} — Placa {deletingMotorcycle?.license_plate}</strong>
              <br /><br />
              This operation <span className="text-red-400 font-bold underline">cannot be undone</span>, and all linked histories will be lost.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setDeletingMotorcycle(null)} className="flex-1">
              CANCEL
            </Button>
            <Button variant="danger" onClick={confirmDeletion} className="flex-1 shadow-lg shadow-red-500/20">
              <Trash2 className="w-4 h-4" />
              CONFIRM DELETION
            </Button>
          </div>
        </div>
      </Modal>

      {/* 
        * MODAL: VISUALIZAÇÃO DETALHADA (READ-ONLY)
        * Exibe todas as informações técnicas e de histórico do veículo de forma organizada.
        */}
      {motorcycleDetails && (
        <Modal
          open={!!motorcycleDetails}
          onClose={() => setMotorcycleDetails(null)}
          title="Vehicle Technical Sheet"
          size="lg"
        >
          <div className="space-y-8 p-1">
            {/* MODAL HEADER: Title and Main Status */}
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
                  <DetailRow label="Placa (Letras/Números)" value={motorcycleDetails.license_plate} mono />
                  <DetailRow label="Código RENAVAM (11 dígitos)" value={motorcycleDetails.renavam} mono />
                  <DetailRow label="Número do Chassi (Gravação)" value={motorcycleDetails.chassis} mono />
                </div>
              </section>

              <section className="space-y-4">
                <h5 className="text-[10px] font-black text-[#BAFF1A] uppercase tracking-[0.2em] mb-4">Especificações Motoras</h5>
                <div className="space-y-4">
                  <DetailRow label="Tipo de Combustível" value={motorcycleDetails.fuel} />
                  <DetailRow label="Potência Nominal / Cilindrada" value={motorcycleDetails.engine_capacity} />
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
 * SUB-COMPONENTE: DetailRow
 * 
 * Finalidade: Padronizar a exibição de pares Rótulo/Valor na Ficha Técnica.
 * Melhora a manutenção do código ao evitar repetição de classes CSS de grid e texto.
 * 
 * PROPS:
 * - label: Texto explicativo do campo (Ex: "Placa")
 * - value: O conteúdo em si.
 * - mono: Se verdadeiro, usa fonte monoespaçada (ideal para códigos/placas).
 * - highlight: Se verdadeiro, destaca o valor em verde limão (ideal para dinheiro).
 * - fullWidth: Se verdadeiro, ocupa as duas colunas do grid.
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

/**
 * NOTAS FINAIS DE DESENVOLVIMENTO:
 * - O sistema de paginação de dados e scroll infinito pode ser implementado futuramente na grid.
 * - A integração com API de CEP/Placa pode automatizar parte do preenchimento no Passo 1.
 * - Este arquivo é o coração operacional da frota e deve manter alto rigor em validações.
 */
