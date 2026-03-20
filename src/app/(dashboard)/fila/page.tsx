/**
 * @file page.tsx
 * @description Página de gerenciamento da fila de espera de clientes para locação de motos.
 * Permite adicionar clientes à fila, reordenar prioridades e remover clientes.
 * Conectada ao banco de dados Supabase real via queries diretas.
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Select, Textarea } from '@/components/ui/Input'
import { Header } from '@/components/layout/Header'
import {
  UserPlus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Users,
  Bike,
  AlertTriangle,
} from 'lucide-react'

/**
 * @interface QueueEntry
 * @description Representa uma entrada na fila de espera com join dos dados do cliente.
 */
interface QueueEntry {
  id: string
  customer_id: string
  position: number
  notes: string | null
  created_at: string
  updated_at: string
  /** Dados do cliente vinculado via join (nullable se o join falhar) */
  customers: {
    name: string
    phone: string
    drivers_license: string
  } | null
}

/**
 * @interface AvailableCustomer
 * @description Cliente disponível para ser adicionado à fila (ativo e não está na fila).
 */
interface AvailableCustomer {
  id: string
  name: string
  phone: string
}

/**
 * @component QueuePage
 * @description Página principal de gerenciamento da fila de espera do GoMoto.
 * Permite visualizar, adicionar, reordenar e remover clientes da fila.
 */
export default function QueuePage() {
  const supabase = createClient()

  /** Lista de entradas da fila ordenadas por posição */
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([])
  /** Clientes disponíveis para adicionar à fila (sem moto, ativos) */
  const [availableCustomers, setAvailableCustomers] = useState<AvailableCustomer[]>([])
  /** Quantidade de motos com status 'available' no momento */
  const [availableMotosCount, setAvailableMotosCount] = useState<number>(0)

  /** Estado de carregamento inicial da página */
  const [loading, setLoading] = useState(true)
  /** Estado de salvamento de operações de escrita */
  const [saving, setSaving] = useState(false)

  /** Controle de visibilidade da modal de adicionar à fila */
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  /** Controle de visibilidade da modal de confirmação de remoção */
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)

  /** Entrada selecionada para ações (remoção, etc.) */
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null)

  /** Dados do formulário de adição à fila */
  const [formData, setFormData] = useState({
    customer_id: '',
    notes: '',
  })

  /**
   * @function fetchQueue
   * @description Busca os registros atuais da fila ordenados por posição,
   * incluindo os dados do cliente via join.
   */
  const fetchQueue = async () => {
    const { data, error } = await supabase
      .from('queue_entries')
      .select('*, customers(name, phone, drivers_license)')
      .order('position', { ascending: true })

    if (error) {
      console.error('Erro ao buscar fila:', error)
      return
    }

    setQueueEntries((data as unknown as QueueEntry[]) || [])
  }

  /**
   * @function fetchAvailableCustomers
   * @description Busca os clientes que podem ser adicionados à fila:
   * apenas os que estão ativos e ainda não estão na fila (in_queue=false).
   */
  const fetchAvailableCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, phone')
      .eq('in_queue', false)
      .eq('active', true)
      .order('name')

    if (error) {
      console.error('Erro ao buscar clientes disponíveis:', error)
      return
    }

    setAvailableCustomers(data || [])
  }

  /**
   * @function fetchMotosCount
   * @description Conta a quantidade de motos com status 'available' para
   * exibir no contador e acionar o alerta visual de alocação.
   */
  const fetchMotosCount = async () => {
    const { count, error } = await supabase
      .from('motorcycles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'available')

    if (error) {
      console.error('Erro ao buscar quantidade de motos:', error)
      return
    }

    setAvailableMotosCount(count || 0)
  }

  /**
   * @function loadData
   * @description Carrega todos os dados da página em paralelo.
   * Chamado na montagem do componente via useEffect.
   */
  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchQueue(), fetchAvailableCustomers(), fetchMotosCount()])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  /** Carrega dados ao montar o componente */
  useEffect(() => {
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * @function reorderQueuePositions
   * @description Após remoção, reordena as posições da fila para garantir
   * sequência contínua (1, 2, 3... sem buracos).
   */
  const reorderQueuePositions = async () => {
    const { data: currentQueue } = await supabase
      .from('queue_entries')
      .select('id, position')
      .order('position', { ascending: true })

    if (!currentQueue) return

    for (let i = 0; i < currentQueue.length; i++) {
      const expectedPosition = i + 1
      if (currentQueue[i].position !== expectedPosition) {
        await supabase
          .from('queue_entries')
          .update({ position: expectedPosition })
          .eq('id', currentQueue[i].id)
      }
    }
  }

  /**
   * @function handleAddToQueue
   * @description Adiciona um novo cliente ao final da fila de espera.
   * Calcula a próxima posição (MAX+1), insere em queue_entries e
   * atualiza in_queue=true no cliente.
   */
  const handleAddToQueue = async () => {
    if (!formData.customer_id) return

    setSaving(true)
    try {
      /** Calcula próxima posição: maior posição atual + 1, ou 1 se a fila está vazia */
      const nextPosition =
        queueEntries.length > 0
          ? Math.max(...queueEntries.map((e) => e.position)) + 1
          : 1

      const { error: insertError } = await supabase.from('queue_entries').insert({
        customer_id: formData.customer_id,
        position: nextPosition,
        notes: formData.notes || null,
      })

      if (insertError) throw insertError

      /** Marca o cliente como 'na fila' para evitar duplicatas */
      const { error: updateError } = await supabase
        .from('customers')
        .update({ in_queue: true })
        .eq('id', formData.customer_id)

      if (updateError) throw updateError

      setIsAddModalOpen(false)
      setFormData({ customer_id: '', notes: '' })
      await Promise.all([fetchQueue(), fetchAvailableCustomers()])
    } catch (error) {
      console.error('Erro ao adicionar à fila:', error)
    } finally {
      setSaving(false)
    }
  }

  /**
   * @function handleRemoveFromQueue
   * @description Remove o cliente selecionado da fila.
   * Exclui o registro de queue_entries, libera o cliente (in_queue=false)
   * e reordena as posições dos demais clientes.
   */
  const handleRemoveFromQueue = async () => {
    if (!selectedEntry) return

    setSaving(true)
    try {
      const { error: deleteError } = await supabase
        .from('queue_entries')
        .delete()
        .eq('id', selectedEntry.id)

      if (deleteError) throw deleteError

      /** Libera o cliente para poder entrar na fila novamente ou receber moto */
      const { error: updateError } = await supabase
        .from('customers')
        .update({ in_queue: false })
        .eq('id', selectedEntry.customer_id)

      if (updateError) throw updateError

      /** Reordena posições para não deixar buracos na sequência */
      await reorderQueuePositions()

      setIsRemoveModalOpen(false)
      setSelectedEntry(null)
      await Promise.all([fetchQueue(), fetchAvailableCustomers()])
    } catch (error) {
      console.error('Erro ao remover da fila:', error)
    } finally {
      setSaving(false)
    }
  }

  /**
   * @function handleMoveUp
   * @description Move o cliente uma posição para cima (número menor) na fila.
   * Troca o position com o cliente imediatamente anterior.
   * @param entry - A entrada da fila a ser movida
   */
  const handleMoveUp = async (entry: QueueEntry) => {
    if (entry.position <= 1) return

    setSaving(true)
    try {
      const prevEntry = queueEntries.find((e) => e.position === entry.position - 1)
      if (!prevEntry) return

      /** Troca as posições dos dois registros envolvidos */
      await supabase
        .from('queue_entries')
        .update({ position: entry.position })
        .eq('id', prevEntry.id)

      await supabase
        .from('queue_entries')
        .update({ position: entry.position - 1 })
        .eq('id', entry.id)

      await fetchQueue()
    } catch (error) {
      console.error('Erro ao subir na fila:', error)
    } finally {
      setSaving(false)
    }
  }

  /**
   * @function handleMoveDown
   * @description Move o cliente uma posição para baixo (número maior) na fila.
   * Troca o position com o cliente imediatamente posterior.
   * @param entry - A entrada da fila a ser movida
   */
  const handleMoveDown = async (entry: QueueEntry) => {
    const maxPosition = Math.max(...queueEntries.map((e) => e.position))
    if (entry.position >= maxPosition) return

    setSaving(true)
    try {
      const nextEntry = queueEntries.find((e) => e.position === entry.position + 1)
      if (!nextEntry) return

      /** Troca as posições dos dois registros envolvidos */
      await supabase
        .from('queue_entries')
        .update({ position: entry.position })
        .eq('id', nextEntry.id)

      await supabase
        .from('queue_entries')
        .update({ position: entry.position + 1 })
        .eq('id', entry.id)

      await fetchQueue()
    } catch (error) {
      console.error('Erro ao descer na fila:', error)
    } finally {
      setSaving(false)
    }
  }

  /** Abre modal de confirmação de remoção para a entrada selecionada */
  const openRemoveModal = (entry: QueueEntry) => {
    setSelectedEntry(entry)
    setIsRemoveModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#121212] p-8">
        <div className="text-[#9e9e9e]">Carregando fila...</div>
      </div>
    )
  }

  /** Nome do primeiro da fila para exibir no card "Próximo da Fila" */
  const nextInLine = queueEntries.length > 0 ? queueEntries[0].customers?.name : 'Nenhum'

  /** Opções do select de clientes com opção vazia inicial para evitar seleção acidental */
  const customerOptions = [
    { value: '', label: 'Selecione um cliente...' },
    ...availableCustomers.map((c) => ({
      value: c.id,
      label: `${c.name} — ${c.phone}`,
    })),
  ]

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-[#121212] p-6 sm:p-8">
      <Header
        title="Fila de Espera"
        subtitle={`${queueEntries.length} pessoa(s) aguardando · ${availableMotosCount} moto(s) disponível(is)`}
        actions={
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Adicionar à Fila
          </Button>
        }
      />

      {/* Alerta visual quando há motos livres e clientes esperando */}
      {availableMotosCount > 0 && queueEntries.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-[#BAFF1A]/30 bg-[#BAFF1A]/10 p-4 text-[#BAFF1A]">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            Há {availableMotosCount} moto(s) disponível(is) e {queueEntries.length} pessoa(s) na fila!
            Considere alocar alguém.
          </p>
        </div>
      )}

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-[#474747] bg-[#202020] p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#323232] text-[#f5f5f5]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#9e9e9e]">Total na Fila</p>
            <p className="text-2xl font-bold text-[#f5f5f5]">{queueEntries.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-[#474747] bg-[#202020] p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#BAFF1A]/10 text-[#BAFF1A]">
            <Bike className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#9e9e9e]">Motos Disponíveis</p>
            <p className="text-2xl font-bold text-[#f5f5f5]">{availableMotosCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-[#474747] bg-[#202020] p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#323232] text-[#f5f5f5]">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#9e9e9e]">Próximo da Fila</p>
            <p className="truncate text-xl font-bold text-[#f5f5f5]" title={nextInLine ?? ''}>
              {nextInLine}
            </p>
          </div>
        </div>
      </div>

      {/* Tabela da fila */}
      <div className="overflow-hidden rounded-2xl border border-[#474747] bg-[#202020]">
        {queueEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Users className="mb-4 h-12 w-12 text-[#474747]" />
            <p className="text-lg font-medium text-[#f5f5f5]">Nenhum cliente na fila de espera.</p>
            <p className="mt-1 text-sm text-[#9e9e9e]">
              Adicione clientes para iniciar a fila de locação.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#f5f5f5]">
              <thead className="bg-[#121212] text-xs uppercase text-[#9e9e9e]">
                <tr>
                  <th className="px-6 py-4 font-medium">#</th>
                  <th className="px-6 py-4 font-medium">Cliente</th>
                  <th className="px-6 py-4 font-medium">Telefone</th>
                  <th className="px-6 py-4 font-medium">CNH</th>
                  <th className="px-6 py-4 font-medium">Desde</th>
                  <th className="px-6 py-4 font-medium">Observações</th>
                  <th className="px-6 py-4 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#474747]">
                {queueEntries.map((entry, index) => (
                  <tr key={entry.id} className="transition-colors hover:bg-[#121212]/50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <Badge variant="brand">{entry.position}º</Badge>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {entry.customers?.name || 'Cliente Desconhecido'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {entry.customers?.phone || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {entry.customers?.drivers_license || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-[#9e9e9e]">
                      {formatDate(entry.created_at)}
                    </td>
                    <td
                      className="max-w-xs truncate px-6 py-4 text-[#9e9e9e]"
                      title={entry.notes || ''}
                    >
                      {entry.notes || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveUp(entry)}
                          disabled={index === 0 || saving}
                          title="Subir posição"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveDown(entry)}
                          disabled={index === queueEntries.length - 1 || saving}
                          title="Descer posição"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => openRemoveModal(entry)}
                          disabled={saving}
                          title="Remover da fila"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Adicionar à Fila */}
      <Modal
        open={isAddModalOpen}
        onClose={() => !saving && setIsAddModalOpen(false)}
        title="Adicionar à Fila de Espera"
        size="md"
      >
        <div className="flex flex-col gap-4 py-2">
          {availableCustomers.length === 0 ? (
            <div className="rounded-lg bg-[#323232] p-4 text-center text-sm text-[#9e9e9e]">
              Não há clientes disponíveis para adicionar à fila.
              Verifique se todos já estão na fila ou se estão inativos.
            </div>
          ) : (
            <>
              <Select
                label="Cliente"
                options={customerOptions}
                value={formData.customer_id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, customer_id: e.target.value }))
                }
              />
              <Textarea
                label="Observações (opcional)"
                placeholder="Preferência de moto, urgência, etc."
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
              />
            </>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={() => setIsAddModalOpen(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleAddToQueue}
            disabled={saving || !formData.customer_id}
            loading={saving}
          >
            Adicionar
          </Button>
        </div>
      </Modal>

      {/* Modal: Confirmar Remoção */}
      <Modal
        open={isRemoveModalOpen}
        onClose={() => !saving && setIsRemoveModalOpen(false)}
        title="Remover da Fila"
        size="sm"
      >
        <div className="py-2 text-[#f5f5f5]">
          <p>
            Tem certeza que deseja remover{' '}
            <strong>{selectedEntry?.customers?.name}</strong> da fila de espera?
          </p>
          <p className="mt-2 text-sm text-[#9e9e9e]">
            O cliente será liberado e os demais serão reposicionados automaticamente.
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={() => setIsRemoveModalOpen(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleRemoveFromQueue}
            disabled={saving}
            loading={saving}
          >
            Remover
          </Button>
        </div>
      </Modal>
    </div>
  )
}
