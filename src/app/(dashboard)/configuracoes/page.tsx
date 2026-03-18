/**
 * @file src/app/(dashboard)/configuracoes/page.tsx
 * @description Página de Configurações Globais do Sistema GoMoto.
 * 
 * @summary
 * Este arquivo centraliza todas as configurações que governam o comportamento do sistema.
 * O "porquê" desta página é fornecer um único ponto de controle para administradores
 * ajustarem parâmetros vitais da operação sem a necessidade de intervenção no código.
 * 
 * @funcionalidades
 * 1.  **Dados da Empresa**: Permite que o administrador edite as informações cadastrais
 *     da locadora (Nome, CNPJ, Endereço), que serão usadas em contratos e relatórios.
 * 2.  **Gestão de Usuários**: Oferece um CRUD completo para gerenciar quem pode acessar
 *     o painel administrativo, definindo seus papéis (permissões) e status (ativo/inativo).
 * 3.  **Preferências do Sistema**: Controla configurações de comportamento, como a ativação
 *     ou desativação de notificações automáticas por e-mail para eventos críticos.
 * 
 * @arquitetura
 * A página é estruturada como um "Client Component" para permitir interatividade e manipulação
 * de estado em tempo real. Cada seção (Empresa, Usuários, Preferências) é encapsulada
 * em seu próprio componente visual `<Card>`, e as ações de edição/criação utilizam
 * modais para não interromper o fluxo principal da visualização.
 */

'use client'

// Importações de hooks do React para gerenciamento de estado.
import { useState } from 'react'
// Importação de ícones para dar feedback visual e semântico às ações.
import { Save, Plus, Edit2, Trash2, Building2, Users, Settings, Bell, BellOff } from 'lucide-react'
// Importação de componentes de UI reutilizáveis do projeto.
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'

/**
 * @interface User
 * @description Define o contrato de dados para um usuário do sistema.
 * O "porquê" desta interface é garantir a consistência e a tipagem segura
 * dos objetos de usuário em todo o componente, prevenindo erros em tempo de desenvolvimento.
 */
interface User {
  id: string              // Identificador único (UUID ou similar) do usuário.
  name: string            // Nome completo para exibição na interface.
  email: string           // E-mail usado para login e envio de notificações.
  role: 'admin' | 'funcionario' // Nível de permissão que define o que o usuário pode ver e fazer.
  active: boolean         // Flag para habilitar ou desabilitar o acesso do usuário sem excluí-lo.
}

/**
 * @constant mockUsers
 * @description Dados simulados de usuários para desenvolvimento e demonstração.
 * O "porquê": Permite construir e testar a interface de gestão de usuários
 * sem depender de uma conexão real com o banco de dados, agilizando o desenvolvimento do front-end.
 */
const mockUsers: User[] = [
  { id: '1', name: 'Gustavo Proprietário', email: 'gustavo@gomoto.com.br', role: 'admin', active: true },
  { id: '2', name: 'Ana Atendente', email: 'ana@gomoto.com.br', role: 'funcionario', active: true },
  { id: '3', name: 'Pedro Mecânico', email: 'pedro@gomoto.com.br', role: 'funcionario', active: true },
  { id: '4', name: 'Maria Financeiro', email: 'maria@gomoto.com.br', role: 'funcionario', active: false },
]

/**
 * @constant defaultCompany
 * @description Objeto com os dados padrão da empresa.
 * O "porquê": Serve como estado inicial para o formulário de dados da empresa,
 * garantindo que a UI já carregue com informações preenchidas ou um formato válido.
 */
const defaultCompany = {
  name: 'GoMoto Locações',
  taxId: '12.345.678/0001-90', // CNPJ da empresa.
  phone: '(11) 3333-4444',
  email: 'contato@gomoto.com.br',
  address: 'Rua das Motos, 500 - Santana, São Paulo/SP - CEP: 02000-000',
}

/**
 * @constant defaultPrefs
 * @description Define as preferências padrão de notificação.
 * O "porquê": Garante um estado inicial consistente para os controles de preferência,
 * evitando estados indefinidos na primeira renderização.
 */
const defaultPrefs = {
  emailNotifications: true,       // Controla o envio de alertas gerais por e-mail.
  expirationNotifications: true, // Controla alertas sobre vencimento de CNH/contratos.
  maintenanceNotifications: false, // Controla alertas sobre agendamento de manutenções.
}

/**
 * @constant roleOptions
 * @description Opções para o campo de seleção de "Papel" do usuário.
 * O "porquê": Centraliza as opções disponíveis, facilitando a manutenção e garantindo
 * que apenas valores válidos ('admin', 'funcionario') possam ser selecionados na UI.
 */
const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'funcionario', label: 'Funcionário' },
]

/**
 * @constant defaultUserForm
 * @description Estado inicial para o formulário de criação de usuário.
 * O "porquê": Assegura que o modal de "Novo Usuário" sempre abra com os campos limpos
 * e com um valor padrão para o "Papel", evitando dados residuais de edições anteriores.
 */
const defaultUserForm = {
  name: '',
  email: '',
  role: 'funcionario',
}

/**
 * @component SettingsPage
 * @description Componente principal da página de Configurações.
 * Ele orquestra os estados e as interações para todas as seções de gerenciamento.
 */
export default function SettingsPage() {
  // --- ESTADOS DE DADOS DA EMPRESA ---
  /**
   * @state company
   * @description Armazena os dados do formulário de informações da empresa.
   * O "porquê": Permite que os campos do formulário sejam "componentes controlados",
   * onde o estado do React é a única fonte da verdade para os valores dos inputs.
   */
  const [company, setCompany] = useState(defaultCompany)
  /**
   * @state isCompanySaved
   * @description Controla a exibição da mensagem de sucesso ao salvar dados da empresa.
   * O "porquê": Fornece feedback visual imediato ao usuário de que sua ação foi concluída
   * com sucesso, melhorando a experiência de uso.
   */
  const [isCompanySaved, setIsCompanySaved] = useState(false)

  // --- ESTADOS DE GESTÃO DE USUÁRIOS ---
  /**
   * @state users
   * @description Armazena a lista de usuários do sistema.
   * O "porquê": Funciona como a fonte de dados para a tabela de usuários.
   * Qualquer alteração (adição, edição, exclusão) nesta lista refletirá na UI.
   */
  const [users, setUsers] = useState<User[]>(mockUsers)

  // --- ESTADOS DE PREFERÊNCIAS ---
  /**
   * @state prefs
   * @description Armazena o estado atual das preferências de notificação.
   * O "porquê": Controla o estado (ligado/desligado) dos interruptores (toggles) na UI.
   */
  const [prefs, setPrefs] = useState(defaultPrefs)
  /**
   * @state arePrefsSaved
   * @description Controla a exibição da mensagem de sucesso ao salvar preferências.
   */
  const [arePrefsSaved, setArePrefsSaved] = useState(false)

  // --- ESTADOS DE CONTROLE DE UI (MODAIS) ---
  /**
   * @state isUserModalOpen
   * @description Controla a visibilidade do modal de criação/edição de usuário.
   */
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  /**
   * @state editingUserId
   * @description Armazena o ID do usuário que está sendo editado. Se for `null`, o modal está em modo de "criação".
   * O "porquê": Permite reutilizar o mesmo modal e formulário tanto para criar um novo usuário quanto para editar um existente.
   */
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  /**
   * @state userForm
   * @description Armazena os dados do formulário do modal de usuário.
   */
  const [userForm, setUserForm] = useState(defaultUserForm)
  /**
   * @state userToDelete
   * @description Armazena o objeto do usuário selecionado para exclusão.
   * O "porquê": Passa o contexto do usuário para o modal de confirmação, garantindo
   * que a ação de exclusão seja executada sobre o alvo correto.
   */
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  /**
   * @function handleSaveCompany
   * @description Simula o salvamento dos dados da empresa e exibe um feedback temporário.
   * @param e O evento do formulário, para prevenir o recarregamento da página.
   */
  function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault() // Impede o comportamento padrão de submissão do formulário.
    setIsCompanySaved(true)
    // O "porquê" do setTimeout: Em uma aplicação real, haveria uma chamada de API.
    // Aqui, ele simula a assincronicidade e remove a mensagem de sucesso após um tempo.
    setTimeout(() => setIsCompanySaved(false), 2500)
  }

  /**
   * @function handleSavePrefs
   * @description Simula o salvamento das preferências e exibe feedback.
   */
  function handleSavePrefs() {
    setArePrefsSaved(true)
    setTimeout(() => setArePrefsSaved(false), 2500)
  }

  /**
   * @function handleToggleUser
   * @description Inverte o status de atividade de um usuário (de ativo para inativo e vice-versa).
   * @param id O identificador do usuário a ser modificado.
   */
  function handleToggleUser(id: string) {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    )
  }

  /**
   * @function handleOpenNewUser
   * @description Prepara o estado para abrir o modal de criação de um novo usuário.
   * O "porquê": Garante que o formulário esteja limpo e no modo "novo",
   * resetando o `editingUserId` para `null` e usando o `defaultUserForm`.
   */
  function handleOpenNewUser() {
    setEditingUserId(null)
    setUserForm(defaultUserForm)
    setIsUserModalOpen(true)
  }

  /**
   * @function handleOpenEditUser
   * @description Prepara o estado para abrir o modal de edição de um usuário existente.
   * @param row O objeto do usuário selecionado na tabela.
   */
  function handleOpenEditUser(row: User) {
    setEditingUserId(row.id)
    setUserForm({ name: row.name, email: row.email, role: row.role })
    setIsUserModalOpen(true)
  }

  /**
   * @function handleSubmitUser
   * @description Processa a submissão do formulário de usuário, seja para criar ou editar.
   * @param e O evento do formulário.
   */
  function handleSubmitUser(e: React.FormEvent) {
    e.preventDefault()
    if (editingUserId) {
      // Lógica de ATUALIZAÇÃO: encontra o usuário pelo ID e substitui seus dados.
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUserId
            ? { ...u, name: userForm.name, email: userForm.email, role: userForm.role as 'admin' | 'funcionario' }
            : u
        )
      )
    } else {
      // Lógica de CRIAÇÃO: adiciona um novo usuário à lista com um ID gerado.
      const newUser: User = {
        id: String(Date.now()), // Em um app real, seria um UUID gerado no servidor.
        name: userForm.name,
        email: userForm.email,
        role: userForm.role as 'admin' | 'funcionario',
        active: true, // Novos usuários são criados como ativos por padrão.
      }
      setUsers((prev) => [...prev, newUser])
    }
    setIsUserModalOpen(false) // Fecha o modal após a conclusão.
  }

  /**
   * @function confirmDeleteUser
   * @description Executa a remoção definitiva do usuário previamente selecionado.
   * O "porquê": Esta função é separada para ser chamada apenas após a confirmação
   * do usuário no modal de exclusão, prevenindo exclusões acidentais.
   */
  function confirmDeleteUser() {
    if (!userToDelete) return
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
    setUserToDelete(null)
  }

  /**
   * @const usersColumns
   * @description Configuração das colunas para a Tabela de Usuários.
   * O "porquê": Desacopla a definição da estrutura da tabela da sua renderização.
   * Cada objeto define uma coluna, seu cabeçalho e como renderizar a célula para cada
   * linha de dados, permitindo a inclusão de componentes complexos como Badges e botões.
   */
  const usersColumns = [
    {
      key: 'name',
      header: 'Nome',
      render: (row: User) => (
        <div className="flex items-center gap-3">
          {/* Avatar visual com a inicial do nome para identificação rápida. */}
          <div className="w-8 h-8 rounded-full bg-[#BAFF1A]/10 border border-[#BAFF1A]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-[#BAFF1A]">
              {row.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-white text-sm">{row.name}</p>
            <p className="text-xs text-[#A0A0A0]">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'email', header: 'E-mail', render: (row: User) => <span className="hidden">{row.email}</span>, className: 'hidden' },
    {
      key: 'role',
      header: 'Papel',
      render: (row: User) => (
        <Badge variant={row.role === 'admin' ? 'brand' : 'muted'}>
          {row.role === 'admin' ? 'Administrador' : 'Funcionário'}
        </Badge>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      render: (row: User) => (
        <Badge variant={row.active ? 'success' : 'muted'}>{row.active ? 'Ativo' : 'Inativo'}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row: User) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleToggleUser(row.id)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors text-[#A0A0A0] border-[#333333] hover:text-white hover:border-[#555555]"
            title={row.active ? 'Desativar acesso do usuário' : 'Reativar acesso do usuário'}
          >
            {row.active ? 'Desativar' : 'Ativar'}
          </button>
          <button
            onClick={() => handleOpenEditUser(row)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
            title="Editar dados do usuário"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setUserToDelete(row)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-colors"
            title="Excluir usuário permanentemente"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col min-h-full">
      {/* Cabeçalho padrão da página. */}
      <Header title="Configurações" subtitle="Dados da empresa e preferências do sistema" />

      <div className="p-6 space-y-8">
        {/* SEÇÃO 1: Dados Cadastrais da Empresa */}
        <section>
          {/* Cabeçalho da seção com ícone e descrição. */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-[#BAFF1A]/10 border border-[#BAFF1A]/20">
              <Building2 className="w-5 h-5 text-[#BAFF1A]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Dados da Empresa</h2>
              <p className="text-sm text-[#A0A0A0]">Informações que aparecerão em documentos e contratos.</p>
            </div>
          </div>

          <Card>
            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nome da Empresa" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
                <Input label="CNPJ" value={company.taxId} onChange={(e) => setCompany({ ...company, taxId: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Telefone" value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} />
                <Input label="E-mail" type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
              </div>
              <Input label="Endereço" value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
              
              {/* Área de Ações do Formulário com feedback de salvamento */}
              <div className="flex items-center justify-between pt-2">
                {isCompanySaved && (
                  <p className="text-sm text-green-400 flex items-center gap-1.5 animate-in fade-in">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Dados da empresa salvos com sucesso!
                  </p>
                )}
                <Button type="submit" className="ml-auto">
                  <Save className="w-4 h-4" />
                  Salvar Dados da Empresa
                </Button>
              </div>
            </form>
          </Card>
        </section>

        {/* SEÇÃO 2: Gestão de Usuários com acesso ao painel */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Usuários do Sistema</h2>
                <p className="text-sm text-[#A0A0A0]">{users.length} usuários com acesso ao painel.</p>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={handleOpenNewUser}>
              <Plus className="w-3.5 h-3.5" />
              Convidar Novo Usuário
            </Button>
          </div>

          <Card padding="none">
            <Table columns={usersColumns} data={users} keyExtractor={(row) => row.id} />
          </Card>
        </section>

        {/* SEÇÃO 3: Preferências de Notificação e Comportamento */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Settings className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Preferências</h2>
              <p className="text-sm text-[#A0A0A0]">Ajustes de notificações e alertas automáticos.</p>
            </div>
          </div>

          <Card>
            <div className="space-y-2">
              {/* Item de Preferência: Notificações por E-mail */}
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                <div className="flex items-center gap-3">
                  {prefs.emailNotifications ? <Bell className="w-4 h-4 text-[#BAFF1A]" /> : <BellOff className="w-4 h-4 text-[#A0A0A0]" />}
                  <div>
                    <p className="text-sm font-medium text-white">Notificações por e-mail</p>
                    <p className="text-xs text-[#A0A0A0]">Receber alertas gerais no e-mail institucional.</p>
                  </div>
                </div>
                {/* Interruptor (Toggle Switch) customizado */}
                <button
                  onClick={() => setPrefs({ ...prefs, emailNotifications: !prefs.emailNotifications })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${prefs.emailNotifications ? 'bg-[#BAFF1A]' : 'bg-[#333333]'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${prefs.emailNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="border-t border-[#333333]" />

              {/* Item de Preferência: Alertas de Vencimento */}
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                <div className="flex items-center gap-3">
                  <Bell className={`w-4 h-4 ${prefs.expirationNotifications ? 'text-amber-400' : 'text-[#A0A0A0]'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">Alertas de vencimento</p>
                    <p className="text-xs text-[#A0A0A0]">Avisar sobre cobranças e CNHs próximas de vencer.</p>
                  </div>
                </div>
                <button
                  onClick={() => setPrefs({ ...prefs, expirationNotifications: !prefs.expirationNotifications })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${prefs.expirationNotifications ? 'bg-[#BAFF1A]' : 'bg-[#333333]'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${prefs.expirationNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="border-t border-[#333333]" />
              
              {/* Item de Preferência: Alertas de Manutenção */}
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                <div className="flex items-center gap-3">
                  <Bell className={`w-4 h-4 ${prefs.maintenanceNotifications ? 'text-blue-400' : 'text-[#A0A0A0]'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">Alertas de manutenção</p>
                    <p className="text-xs text-[#A0A0A0]">Notificar quando uma manutenção preventiva estiver próxima.</p>
                  </div>
                </div>
                <button
                  onClick={() => setPrefs({ ...prefs, maintenanceNotifications: !prefs.maintenanceNotifications })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${prefs.maintenanceNotifications ? 'bg-[#BAFF1A]' : 'bg-[#333333]'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${prefs.maintenanceNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Ações e Feedback */}
              <div className="flex items-center justify-between pt-4">
                {arePrefsSaved && (
                   <p className="text-sm text-green-400 flex items-center gap-1.5 animate-in fade-in">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Preferências salvas com sucesso!
                  </p>
                )}
                <Button onClick={handleSavePrefs} className="ml-auto">
                  <Save className="w-4 h-4" />
                  Salvar Preferências
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* MODAL: Gerenciamento de Usuário (Criação e Edição) */}
      <Modal open={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={editingUserId ? 'Editar Usuário' : 'Novo Usuário'} size="sm">
        <form onSubmit={handleSubmitUser} className="space-y-4">
          <Input label="Nome" placeholder="Nome completo" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required />
          <Input label="E-mail" type="email" placeholder="email@gomoto.com.br" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
          <Select label="Papel" options={roleOptions} value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsUserModalOpen(false)}>Cancelar</Button>
            <Button type="submit"><Save className="w-4 h-4" />{editingUserId ? 'Salvar Alterações' : 'Criar Usuário'}</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Confirmação de Exclusão de Usuário */}
      <Modal open={!!userToDelete} onClose={() => setUserToDelete(null)} title="Excluir Usuário" size="sm">
        <div className="space-y-4">
          <p className="text-[#A0A0A0] text-sm">
            Tem certeza que deseja excluir permanentemente o acesso de <strong className="text-white font-medium">{userToDelete?.name}</strong>?
            <br/>
            <span className="text-red-400 font-bold">Esta ação não pode ser desfeita.</span>
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setUserToDelete(null)}>Cancelar</Button>
            <Button variant="danger" onClick={confirmDeleteUser}><Trash2 className="w-4 h-4" />Excluir</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
