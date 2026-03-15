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

interface Usuario {
  id: string
  nome: string
  email: string
  papel: 'admin' | 'funcionario'
  ativo: boolean
}

const mockUsuarios: Usuario[] = [
  {
    id: '1',
    nome: 'Gustavo Proprietário',
    email: 'gustavo@gomoto.com.br',
    papel: 'admin',
    ativo: true,
  },
  {
    id: '2',
    nome: 'Ana Atendente',
    email: 'ana@gomoto.com.br',
    papel: 'funcionario',
    ativo: true,
  },
  {
    id: '3',
    nome: 'Pedro Mecânico',
    email: 'pedro@gomoto.com.br',
    papel: 'funcionario',
    ativo: true,
  },
  {
    id: '4',
    nome: 'Maria Financeiro',
    email: 'maria@gomoto.com.br',
    papel: 'funcionario',
    ativo: false,
  },
]

const defaultEmpresa = {
  nome: 'GoMoto Locações',
  cnpj: '12.345.678/0001-90',
  telefone: '(11) 3333-4444',
  email: 'contato@gomoto.com.br',
  endereco: 'Rua das Motos, 500 - Santana, São Paulo/SP - CEP: 02000-000',
}

const defaultPrefs = {
  notificacoes_email: true,
  notificacoes_vencimento: true,
  notificacoes_manutencao: false,
}

const papelOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'funcionario', label: 'Funcionário' },
]

const defaultUserForm = {
  nome: '',
  email: '',
  papel: 'funcionario',
}

export default function ConfiguracoesPage() {
  const [empresa, setEmpresa] = useState(defaultEmpresa)
  const [empresaSalva, setEmpresaSalva] = useState(false)
  const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios)
  const [prefs, setPrefs] = useState(defaultPrefs)
  const [prefsSalvas, setPrefsSalvas] = useState(false)
  const [modalUsuario, setModalUsuario] = useState(false)
  const [editandoUsuarioId, setEditandoUsuarioId] = useState<string | null>(null)
  const [userForm, setUserForm] = useState(defaultUserForm)
  const [excluindoUsuario, setExcluindoUsuario] = useState<Usuario | null>(null)

  function handleSalvarEmpresa(e: React.FormEvent) {
    e.preventDefault()
    setEmpresaSalva(true)
    setTimeout(() => setEmpresaSalva(false), 2500)
  }

  function handleSalvarPrefs() {
    setPrefsSalvas(true)
    setTimeout(() => setPrefsSalvas(false), 2500)
  }

  function handleToggleUsuario(id: string) {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ativo: !u.ativo } : u))
    )
  }

  function abrirNovoUsuario() {
    setEditandoUsuarioId(null)
    setUserForm(defaultUserForm)
    setModalUsuario(true)
  }

  function abrirEdicaoUsuario(row: Usuario) {
    setEditandoUsuarioId(row.id)
    setUserForm({ nome: row.nome, email: row.email, papel: row.papel })
    setModalUsuario(true)
  }

  function handleSubmitUsuario(e: React.FormEvent) {
    e.preventDefault()
    if (editandoUsuarioId) {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === editandoUsuarioId
            ? { ...u, nome: userForm.nome, email: userForm.email, papel: userForm.papel as 'admin' | 'funcionario' }
            : u
        )
      )
    } else {
      const novoUsuario: Usuario = {
        id: String(Date.now()),
        nome: userForm.nome,
        email: userForm.email,
        papel: userForm.papel as 'admin' | 'funcionario',
        ativo: true,
      }
      setUsuarios((prev) => [...prev, novoUsuario])
    }
    setModalUsuario(false)
  }

  function confirmarExclusaoUsuario() {
    if (!excluindoUsuario) return
    setUsuarios((prev) => prev.filter((u) => u.id !== excluindoUsuario.id))
    setExcluindoUsuario(null)
  }

  const usuariosColumns = [
    {
      key: 'nome',
      header: 'Nome',
      render: (row: Usuario) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#BAFF1A]/10 border border-[#BAFF1A]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-[#BAFF1A]">
              {row.nome.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-white text-sm">{row.nome}</p>
            <p className="text-xs text-[#A0A0A0]">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'E-mail',
      render: (row: Usuario) => <span className="hidden">{row.email}</span>,
      className: 'hidden',
    },
    {
      key: 'papel',
      header: 'Papel',
      render: (row: Usuario) => (
        <Badge variant={row.papel === 'admin' ? 'brand' : 'muted'}>
          {row.papel === 'admin' ? 'Administrador' : 'Funcionário'}
        </Badge>
      ),
    },
    {
      key: 'ativo',
      header: 'Status',
      render: (row: Usuario) => (
        <Badge variant={row.ativo ? 'success' : 'muted'}>{row.ativo ? 'Ativo' : 'Inativo'}</Badge>
      ),
    },
    {
      key: 'acoes',
      header: 'Ações',
      render: (row: Usuario) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleToggleUsuario(row.id)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors text-[#A0A0A0] border-[#333333] hover:text-white hover:border-[#555555]"
          >
            {row.ativo ? 'Desativar' : 'Ativar'}
          </button>
          <button
            onClick={() => abrirEdicaoUsuario(row)}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExcluindoUsuario(row)}
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
        {/* Seção 1: Dados da Empresa */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-[#BAFF1A]/10 border border-[#BAFF1A]/20">
              <Building2 className="w-4 h-4 text-[#BAFF1A]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Dados da Empresa</h2>
              <p className="text-xs text-[#A0A0A0]">Informações básicas da empresa</p>
            </div>
          </div>

          <Card>
            <form onSubmit={handleSalvarEmpresa} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nome da Empresa"
                  value={empresa.nome}
                  onChange={(e) => setEmpresa({ ...empresa, nome: e.target.value })}
                />
                <Input
                  label="CNPJ"
                  value={empresa.cnpj}
                  onChange={(e) => setEmpresa({ ...empresa, cnpj: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Telefone"
                  value={empresa.telefone}
                  onChange={(e) => setEmpresa({ ...empresa, telefone: e.target.value })}
                />
                <Input
                  label="E-mail"
                  type="email"
                  value={empresa.email}
                  onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })}
                />
              </div>
              <Input
                label="Endereço"
                value={empresa.endereco}
                onChange={(e) => setEmpresa({ ...empresa, endereco: e.target.value })}
              />
              <div className="flex items-center justify-between pt-2">
                {empresaSalva && (
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

        {/* Seção 2: Usuários */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Usuários do Sistema</h2>
                <p className="text-xs text-[#A0A0A0]">{usuarios.length} usuários cadastrados</p>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={abrirNovoUsuario}>
              <Plus className="w-3.5 h-3.5" />
              Novo Usuário
            </Button>
          </div>

          <Card padding="none">
            <Table
              columns={usuariosColumns}
              data={usuarios}
              keyExtractor={(row) => row.id}
            />
          </Card>
        </section>

        {/* Seção 3: Preferências */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Settings className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Preferências</h2>
              <p className="text-xs text-[#A0A0A0]">Notificações e comportamento do sistema</p>
            </div>
          </div>

          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  {prefs.notificacoes_email ? (
                    <Bell className="w-4 h-4 text-[#BAFF1A]" />
                  ) : (
                    <BellOff className="w-4 h-4 text-[#A0A0A0]" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">Notificações por e-mail</p>
                    <p className="text-xs text-[#A0A0A0]">Receber alertas gerais por e-mail</p>
                  </div>
                </div>
                <button
                  onClick={() => setPrefs({ ...prefs, notificacoes_email: !prefs.notificacoes_email })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                    prefs.notificacoes_email ? 'bg-[#BAFF1A]' : 'bg-[#333333]'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      prefs.notificacoes_email ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="border-t border-[#333333]" />

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Bell className={`w-4 h-4 ${prefs.notificacoes_vencimento ? 'text-amber-400' : 'text-[#A0A0A0]'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">Alertas de vencimento</p>
                    <p className="text-xs text-[#A0A0A0]">Avisar sobre cobranças e CNH próximas do vencimento</p>
                  </div>
                </div>
                <button
                  onClick={() => setPrefs({ ...prefs, notificacoes_vencimento: !prefs.notificacoes_vencimento })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                    prefs.notificacoes_vencimento ? 'bg-[#BAFF1A]' : 'bg-[#333333]'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      prefs.notificacoes_vencimento ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="border-t border-[#333333]" />

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Bell className={`w-4 h-4 ${prefs.notificacoes_manutencao ? 'text-blue-400' : 'text-[#A0A0A0]'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">Alertas de manutenção</p>
                    <p className="text-xs text-[#A0A0A0]">Notificar quando uma manutenção estiver próxima</p>
                  </div>
                </div>
                <button
                  onClick={() => setPrefs({ ...prefs, notificacoes_manutencao: !prefs.notificacoes_manutencao })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                    prefs.notificacoes_manutencao ? 'bg-[#BAFF1A]' : 'bg-[#333333]'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      prefs.notificacoes_manutencao ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                {prefsSalvas && (
                  <p className="text-sm text-green-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Preferências salvas!
                  </p>
                )}
                <div className="ml-auto">
                  <Button onClick={handleSalvarPrefs}>
                    <Save className="w-4 h-4" />
                    Salvar Preferências
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* Modal Novo / Editar Usuário */}
      <Modal
        open={modalUsuario}
        onClose={() => setModalUsuario(false)}
        title={editandoUsuarioId ? 'Editar Usuário' : 'Novo Usuário'}
        size="sm"
      >
        <form onSubmit={handleSubmitUsuario} className="space-y-4">
          <Input
            label="Nome"
            placeholder="Nome completo"
            value={userForm.nome}
            onChange={(e) => setUserForm({ ...userForm, nome: e.target.value })}
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
            options={papelOptions}
            value={userForm.papel}
            onChange={(e) => setUserForm({ ...userForm, papel: e.target.value })}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalUsuario(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4" />
              {editandoUsuarioId ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirmar Exclusão de Usuário */}
      <Modal open={!!excluindoUsuario} onClose={() => setExcluindoUsuario(null)} title="Excluir Usuário" size="sm">
        <div className="space-y-4">
          <p className="text-[#A0A0A0] text-sm">
            Tem certeza que deseja excluir o usuário{' '}
            <span className="text-white font-medium">{excluindoUsuario?.nome}</span>?
            Esta ação não poderá ser desfeita.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setExcluindoUsuario(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmarExclusaoUsuario}>
              <Trash2 className="w-4 h-4" />
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
