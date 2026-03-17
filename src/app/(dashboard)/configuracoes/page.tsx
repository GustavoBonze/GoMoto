/**
 * ARQUIVO: src/app/(dashboard)/configuracoes/page.tsx
 * DESCRIÇÃO: Página de Configurações do Sistema GoMoto.
 *            Permite gerenciar os dados cadastrais da empresa, administrar os usuários 
 *            com acesso ao sistema (admins e funcionários) e definir preferências de notificações.
 */

'use client'

import { useState } from 'react'
import { Save, Plus, Edit2, Trash2, Building2, Users, Settings, Bell, BellOff } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'

/**
 * Interface que define a estrutura de um usuário do sistema.
 */
interface User {
  id: string              // Identificador único do usuário
  name: string            // Nome completo exibido na interface
  email: string           // E-mail usado para login e comunicações
  role: 'admin' | 'funcionario' // Nível de permissão no sistema
  active: boolean         // Indica se o acesso está habilitado
}

/**
 * Dados simulados de usuários para a listagem inicial.
 */
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Gustavo Proprietário',
    email: 'gustavo@gomoto.com.br',
    role: 'admin',
    active: true,
  },
  {
    id: '2',
    name: 'Ana Atendente',
    email: 'ana@gomoto.com.br',
    role: 'funcionario',
    active: true,
  },
  {
    id: '3',
    name: 'Pedro Mecânico',
    email: 'pedro@gomoto.com.br',
    role: 'funcionario',
    active: true,
  },
  {
    id: '4',
    name: 'Maria Financeiro',
    email: 'maria@gomoto.com.br',
    role: 'funcionario',
    active: false,
  },
]

/**
 * Dados padrão da empresa GoMoto (utilizados para preencher o formulário inicial).
 */
const defaultCompany = {
  name: 'GoMoto Locações',
  taxId: '12.345.678/0001-90', // CNPJ
  phone: '(11) 3333-4444',
  email: 'contato@gomoto.com.br',
  address: 'Rua das Motos, 500 - Santana, São Paulo/SP - CEP: 02000-000',
}

/**
 * Preferências padrão de notificações do sistema.
 */
const defaultPrefs = {
  emailNotifications: true,       // Envio de alertas gerais por e-mail
  expirationNotifications: true, // Alertas sobre vencimento de contratos/cobranças
  maintenanceNotifications: false, // Alertas sobre agendamento de manutenções
}

/**
 * Opções de papéis/níveis de acesso para o seletor de usuários.
 */
const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'funcionario', label: 'Funcionário' },
]

/**
 * Estado inicial para o formulário de cadastro de novo usuário.
 */
const defaultUserForm = {
  name: '',
  email: '',
  role: 'funcionario',
}

/**
 * COMPONENTE PRINCIPAL: SettingsPage
 * Organizado em três seções: Dados da Empresa, Usuários e Preferências.
 */
export default function SettingsPage() {
  /**
   * ESTADOS: Gerenciamento de dados da empresa e feedback de salvamento.
   */
  const [company, setCompany] = useState(defaultCompany)
  const [isCompanySaved, setIsCompanySaved] = useState(false)

  /**
   * ESTADOS: Gerenciamento da lista de usuários.
   */
  const [users, setUsers] = useState<User[]>(mockUsers)

  /**
   * ESTADOS: Gerenciamento de preferências do sistema e feedback de salvamento.
   */
  const [prefs, setPrefs] = useState(defaultPrefs)
  const [arePrefsSaved, setArePrefsSaved] = useState(false)

  /**
   * ESTADOS: Controle de Modais (Novo Usuário e Exclusão).
   */
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [userForm, setUserForm] = useState(defaultUserForm)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  /**
   * FUNÇÃO: handleSaveCompany
   * Processa o salvamento dos dados cadastrais da empresa.
   */
  function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault()
    setIsCompanySaved(true)
    // Simula delay de rede e remove mensagem de sucesso após 2.5s
    setTimeout(() => setIsCompanySaved(false), 2500)
  }

  /**
   * FUNÇÃO: handleSavePrefs
   * Processa o salvamento das preferências de notificação.
   */
  function handleSavePrefs() {
    setArePrefsSaved(true)
    setTimeout(() => setArePrefsSaved(false), 2500)
  }

  /**
   * FUNÇÃO: handleToggleUser
   * Inverte o status de atividade de um usuário (Ativo/Inativo).
   */
  function handleToggleUser(id: string) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    )
  }

  /**
   * FUNÇÃO: handleOpenNewUser
   * Abre o modal limpo para criação de um novo acesso.
   */
  function handleOpenNewUser() {
    setEditingUserId(null)
    setUserForm(defaultUserForm)
    setIsUserModalOpen(true)
  }

  /**
   * FUNÇÃO: handleOpenEditUser
   * Abre o modal preenchido com os dados do usuário selecionado para edição.
   */
  function handleOpenEditUser(row: User) {
    setEditingUserId(row.id)
    setUserForm({ name: row.name, email: row.email, role: row.role })
    setIsUserModalOpen(true)
  }

  /**
   * FUNÇÃO: handleSubmitUser
   * Processa a criação ou atualização de um usuário no estado local.
   */
  function handleSubmitUser(e: React.FormEvent) {
    e.preventDefault()
    if (editingUserId) {
      // Atualização de usuário existente
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUserId
            ? { ...u, name: userForm.name, email: userForm.email, role: userForm.role as 'admin' | 'funcionario' }
            : u
        )
      )
    } else {
      // Criação de novo usuário
      const newUser: User = {
        id: String(Date.now()),
        name: userForm.name,
        email: userForm.email,
        role: userForm.role as 'admin' | 'funcionario',
        active: true,
      }
      setUsers((prev) => [...prev, newUser])
    }
    setIsUserModalOpen(false)
  }

  /**
   * FUNÇÃO: confirmDeleteUser
   * Executa a remoção definitiva de um usuário da lista.
   */
  function confirmDeleteUser() {
    if (!userToDelete) return
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
    setUserToDelete(null)
  }

  /**
   * CONFIGURAÇÃO: Colunas da Tabela de Usuários.
   * Define como cada campo deve ser renderizado, incluindo badges e botões de ação.
   */
  const usersColumns = [
    {
      key: 'name',
      header: 'Nome',
      render: (row: User) => (
        <div className="flex items-center gap-3">
          {/* Avatar com a inicial do nome */}
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
    {
      key: 'email',
      header: 'E-mail',
      render: (row: User) => <span className="hidden">{row.email}</span>,
      className: 'hidden',
    },
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
          {/* Alternar Status (Ativar/Desativar) */}
          <button
            onClick={() => handleToggleUser(row.id)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors text-[#A0A0A0] border-[#333333] hover:text-white hover:border-[#555555]"
          >
            {row.active ? 'Desativar' : 'Ativar'}
          </button>
          {/* Botão Editar */}
          <button
            onClick={() => handleOpenEditUser(row)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {/* Botão Excluir (Abre confirmação) */}
          <button
            onClick={() => setUserToDelete(row)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/5 transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Configurações" subtitle="Dados da empresa e preferências do sistema" />

      <div className="p-6 space-y-6">
        {/* SEÇÃO 1: Dados Cadastrais da Empresa */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-[#BAFF1A]/10 border border-[#BAFF1A]/20">
              <Building2 className="w-4 h-4 text-[#BAFF1A]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Dados da Empresa</h2>
              <p className="text-xs text-[#A0A0A0]">Informações básicas da empresa para documentos</p>
            </div>
          </div>

          <Card>
            <form onSubmit={handleSaveCompany} className="space-y-4">
              {/* Grid: Nome e CNPJ */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nome da Empresa"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                />
                <Input
                  label="CNPJ"
                  value={company.taxId}
                  onChange={(e) => setCompany({ ...company, taxId: e.target.value })}
                />
              </div>
              {/* Grid: Contato */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Telefone"
                  value={company.phone}
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                />
                <Input
                  label="E-mail"
                  type="email"
                  value={company.email}
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                />
              </div>
              {/* Endereço Completo */}
              <Input
                label="Endereço"
                value={company.address}
                onChange={(e) => setCompany({ ...company, address: e.target.value })}
              />
              
              {/* Feedback e Botão de Salvar */}
              <div className="flex items-center justify-between pt-2">
                {isCompanySaved && (
                  <p className="text-sm text-green-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Dados salvos com sucesso!
                  </p>
                )}
                <div className="ml-auto">
                  <Button type="submit">
                    <Save className="w-4 h-4" />
                    Salvar Dados
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </section>

        {/* SEÇÃO 2: Gestão de Usuários com acesso ao painel */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Usuários do Sistema</h2>
                <p className="text-xs text-[#A0A0A0]">{users.length} usuários cadastrados</p>
              </div>
            </div>
            {/* Gatilho para criar novo usuário */}
            <Button size="sm" variant="secondary" onClick={handleOpenNewUser}>
              <Plus className="w-3.5 h-3.5" />
              Novo Usuário
            </Button>
          </div>

          <Card padding="none">
            {/* Tabela de listagem reaproveitável */}
            <Table
              columns={usersColumns}
              data={users}
              keyExtractor={(row) => row.id}
            />
          </Card>
        </section>

        {/* SEÇÃO 3: Preferências de Notificação e Comportamento */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Settings className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Preferências</h2>
              <p className="text-xs text-[#A0A0A0]">Ajustes de notificações e alertas automáticos</p>
            </div>
          </div>

          <Card>
            <div className="space-y-4">
              {/* Notificação por E-mail (Switch) */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  {prefs.emailNotifications ? (
                    <Bell className="w-4 h-4 text-[#BAFF1A]" />
                  ) : (
                    <BellOff className="w-4 h-4 text-[#A0A0A0]" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">Notificações por e-mail</p>
                    <p className="text-xs text-[#A0A0A0]">Receber alertas gerais por e-mail institucional</p>
                  </div>
                </div>
                <button
                  onClick={() => setPrefs({ ...prefs, emailNotifications: !prefs.emailNotifications })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                    prefs.emailNotifications ? 'bg-[#BAFF1A]' : 'bg-[#333333]'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      prefs.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="border-t border-[#333333]" />

              {/* Alertas de Vencimento (Switch) */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Bell className={`w-4 h-4 ${prefs.expirationNotifications ? 'text-amber-400' : 'text-[#A0A0A0]'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">Alertas de vencimento</p>
                    <p className="text-xs text-[#A0A0A0]">Avisar sobre cobranças e CNH próximas do vencimento</p>
                  </div>
                </div>
                <button
                  onClick={() => setPrefs({ ...prefs, expirationNotifications: !prefs.expirationNotifications })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                    prefs.expirationNotifications ? 'bg-[#BAFF1A]' : 'bg-[#333333]'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      prefs.expirationNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="border-t border-[#333333]" />

              {/* Alertas de Manutenção (Switch) */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Bell className={`w-4 h-4 ${prefs.maintenanceNotifications ? 'text-blue-400' : 'text-[#A0A0A0]'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">Alertas de manutenção</p>
                    <p className="text-xs text-[#A0A0A0]">Notificar quando uma manutenção preventiva estiver próxima</p>
                  </div>
                </div>
                <button
                  onClick={() => setPrefs({ ...prefs, maintenanceNotifications: !prefs.maintenanceNotifications })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                    prefs.maintenanceNotifications ? 'bg-[#BAFF1A]' : 'bg-[#333333]'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      prefs.maintenanceNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Feedback e Botão de Salvar Preferências */}
              <div className="flex items-center justify-between pt-2">
                {arePrefsSaved && (
                  <p className="text-sm text-green-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Preferências salvas!
                  </p>
                )}
                <div className="ml-auto">
                  <Button onClick={handleSavePrefs}>
                    <Save className="w-4 h-4" />
                    Salvar Preferências
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* MODAL: Criação ou Edição de Usuário */}
      <Modal
        open={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={editingUserId ? 'Editar Usuário' : 'Novo Usuário'}
        size="sm"
      >
        <form onSubmit={handleSubmitUser} className="space-y-4">
          <Input
            label="Nome"
            placeholder="Nome completo"
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            required
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="email@gomoto.com.br"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            required
          />
          <Select
            label="Papel"
            options={roleOptions}
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsUserModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4" />
              {editingUserId ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Confirmação de Exclusão Definitiva de Usuário */}
      <Modal open={!!userToDelete} onClose={() => setUserToDelete(null)} title="Excluir Usuário" size="sm">
        <div className="space-y-4">
          <p className="text-[#A0A0A0] text-sm">
            Tem certeza que deseja excluir o usuário{' '}
            <span className="text-white font-medium">{userToDelete?.name}</span>?
            Esta ação não poderá ser desfeita.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setUserToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDeleteUser}>
              <Trash2 className="w-4 h-4" />
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
