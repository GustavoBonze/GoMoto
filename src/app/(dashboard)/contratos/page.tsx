/**
 * @file src/app/(dashboard)/contratos/page.tsx
 * @description Pagina Client Component responsavel pela gestao de modelos de contrato (.docx).
 * Permite ao usuario fazer upload de arquivos .docx para o Supabase Storage e registrar
 * os metadados correspondentes (nome, descricao, URL publica e data de atualizacao) na
 * tabela `contract_templates` do banco de dados. Exibe tambem as variaveis dinamicas
 * suportadas que devem ser inseridas literalmente no documento Word para preenchimento
 * automatico no momento da geracao do contrato.
 * @author GustavoBonze
 * @module contratos/page
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Upload,
  Download,
  Info,
  CheckCircle,
  AlertCircle,
  Trash2,
  FileEdit
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

/**
 * Representa um modelo de contrato armazenado no banco de dados.
 * Utilizada tanto para os modelos padroes definidos localmente quanto
 * para os registros recuperados da tabela `contract_templates` no Supabase.
 * Os dois sao mesclados por slug para garantir que modelos sem registro
 * no banco ainda aparecam na interface.
 */
interface ContractTemplate {
  /** ID do registro no banco (opcional, ausente antes do primeiro save) */
  id?: string
  /** Identificador unico do modelo (ex: 'locacao', 'fidelidade'), usado como chave de conflito no upsert */
  slug: string
  /** Nome exibido na UI para identificar o modelo */
  name: string
  /** Descricao curta do modelo, exibida abaixo do nome na listagem */
  description: string
  /** URL publica do arquivo no Supabase Storage; null enquanto nenhum arquivo foi enviado */
  file_url: string | null
  /** ISO string do ultimo upload realizado; null se o modelo nunca foi atualizado */
  updated_at: string | null
}

/**
 * Lista de tags de substituicao dinamica suportadas pelo sistema.
 * Essas tags sao injetadas automaticamente nos arquivos .docx durante
 * a geracao de contratos, substituindo cada marcador pelo valor real
 * correspondente ao cliente, moto e locacao em questao.
 * O usuario deve inserir essas tags literalmente no documento Word
 * para que o preenchimento automatico funcione corretamente.
 */
const SUPPORTED_VARIABLES = [
  { tag: '{{data_hoje}}', desc: 'Data atual' },
  { tag: '{{nome_cliente}}', desc: 'Nome locatario' },
  { tag: '{{cpf_cliente}}', desc: 'CPF locatario' },
  { tag: '{{placa_moto}}', desc: 'Placa moto' },
  { tag: '{{modelo_moto}}', desc: 'Modelo moto' },
  { tag: '{{valor_semanal}}', desc: 'Valor semanal' },
  { tag: '{{km_inicial}}', desc: 'KM inicial' },
  { tag: '{{data_inicio}}', desc: 'Data inicio' },
]

/**
 * Componente principal da rota `/contratos`.
 * Responsavel por listar os modelos de contrato disponiveis, permitir o upload
 * de novos arquivos .docx para cada modelo, exibir o status do arquivo atual
 * e apresentar a tabela de variaveis dinamicas suportadas.
 * @returns JSX da pagina de gestao de modelos de contrato
 */
export default function ModelosContratoPage() {
  // Lista de modelos de contrato; inicializada com os dois modelos padrao (locacao e fidelidade)
  // e depois mesclada com os dados reais recuperados do banco via fetchTemplates
  const [templates, setTemplates] = useState<ContractTemplate[]>([
    { slug: 'locacao', name: 'Contrato de Locacao', description: 'Padrao semanal sem fidelidade.', file_url: null, updated_at: null },
    { slug: 'fidelidade', name: 'Contrato com Fidelidade', description: 'Modelo com permanencia minima.', file_url: null, updated_at: null },
  ])

  // Slug do modelo sendo enviado no momento; null quando nenhum upload esta em progresso;
  // usado para exibir o estado de loading no botao correto
  const [uploading, setUploading] = useState<string | null>(null)
  // Mensagem de erro da ultima operacao (upload ou remocao); null quando nao ha erro ativo
  const [error, setError] = useState<string | null>(null)
  // Mensagem de sucesso da ultima operacao; null quando nao ha mensagem de confirmacao ativa
  const [success, setSuccess] = useState<string | null>(null)
  // Slug do modelo selecionado para upload; usado para associar o arquivo escolhido no input hidden ao modelo correto
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  // Instancia do cliente Supabase para uso no browser (client-side)
  const supabase = createClient()
  // Referencia ao input[type=file] oculto; acionado programaticamente via handleTriggerUpload para abrir o seletor de arquivos nativo
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Busca todos os registros da tabela `contract_templates` no Supabase e
   * mescla com a lista local de modelos padroes.
   * Estrategia de merge: a lista local e usada como base (garantindo que slugs
   * padrao sempre aparecam na UI), e os dados do banco sao sobrepostos por slug
   * quando existem. Erros de rede sao silenciados via console.error para nao
   * bloquear a interface do usuario.
   */
  async function fetchTemplates() {
    try {
      const { data, error: fetchError } = await supabase.from('contract_templates').select('*')
      if (!fetchError && data && data.length > 0) {
        const merged = templates.map(t => {
          const dbTemplate = data.find(d => d.slug === t.slug)
          return dbTemplate ? { ...t, ...dbTemplate } : t
        })
        setTemplates(merged)
        setError(null)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Executa fetchTemplates apenas na montagem do componente para carregar os dados iniciais do banco
  useEffect(() => {
    fetchTemplates()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Armazena o slug do modelo selecionado e aciona programaticamente o input
   * de arquivo oculto para simular um clique, abrindo o seletor de arquivos
   * nativo do sistema operacional sem expor o elemento na UI.
   * @param slug - Identificador unico do modelo que receberá o novo arquivo
   */
  const handleTriggerUpload = (slug: string) => {
    setActiveSlug(slug)
    fileInputRef.current?.click()
  }

  /**
   * Processa o arquivo selecionado pelo usuario e realiza o upload para o Supabase Storage,
   * seguido do registro dos metadados no banco de dados. O fluxo e dividido em 4 etapas:
   *
   * 1. Validacao: verifica se o arquivo existe, se activeSlug esta definido e se a extensao e .docx
   * 2. Upload: envia o arquivo para o bucket `contract-templates` no caminho
   *    `models/{slug}_template.docx` com a opcao upsert=true (substitui se ja existir)
   * 3. Registro: realiza upsert na tabela `contract_templates` com slug, nome, descricao,
   *    URL publica gerada pelo Storage e timestamp ISO da operacao
   * 4. Cleanup: limpa os estados de loading e slug ativo, e zera o value do input para
   *    permitir que o mesmo arquivo seja selecionado novamente em uploads futuros
   *
   * @param e - Evento de mudanca do input[type=file]
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeSlug) return

    if (!file.name.endsWith('.docx')) {
      setError('Apenas arquivos .docx sao permitidos.')
      return
    }

    setUploading(activeSlug)
    setError(null)
    setSuccess(null)

    try {
      const filePath = 'models/' + activeSlug + '_template.docx'
      const { error: uploadErr } = await supabase.storage.from('contract-templates').upload(filePath, file, { upsert: true })

      if (uploadErr) throw uploadErr

      const { data: urlData } = supabase.storage.from('contract-templates').getPublicUrl(filePath)

      const currentTemplate = templates.find(t => t.slug === activeSlug)
      const { error: dbErr } = await supabase.from('contract_templates').upsert({
        slug: activeSlug,
        name: currentTemplate?.name,
        description: currentTemplate?.description,
        file_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      }, { onConflict: 'slug' })

      if (dbErr) throw dbErr

      setSuccess('Modelo atualizado com sucesso!')
      fetchTemplates()
    } catch {
      setError('Falha no upload do arquivo.')
    } finally {
      setUploading(null)
      setActiveSlug(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  /**
   * Remove o arquivo associado ao modelo indicado pelo slug.
   * Importante: esta funcao NAO exclui o registro do banco — apenas anula os campos
   * `file_url` e `updated_at` via UPDATE, preservando o registro para historico e
   * mantendo o modelo visivel na lista com o status "Aguardando arquivo".
   * @param slug - Identificador unico do modelo cujo arquivo sera removido
   */
  const handleRemoveTemplate = async (slug: string) => {
    if (!confirm('Deseja remover este modelo?')) return
    try {
      const { error: dbErr } = await supabase.from('contract_templates').update({ file_url: null, updated_at: null }).eq('slug', slug)
      if (dbErr) throw dbErr
      setSuccess('Modelo removido.')
      fetchTemplates()
    } catch {
      setError('Erro ao remover.')
    }
  }

  return (
    <div className="h-screen bg-[#121212] flex flex-col overflow-hidden select-none">
      <header className="h-20 border-b border-[#474747] flex items-center justify-between px-6 shrink-0 bg-[#121212]">
        <h1 className="text-[28px] font-bold text-[#f5f5f5]">Modelos de Contrato</h1>
        <div className="flex items-center gap-3">
          {(error || success) && (
            <div className={(error ? 'bg-[#7c1c1c] text-[#ff9c9a]' : 'bg-[#0e2f13] text-[#229731]') + " px-4 py-1.5 rounded-full text-[13px] font-medium flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300"}>
              {error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              {error || success}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".docx" className="hidden" />

        <section className="grid grid-rows-2 gap-4 shrink-0">
          {templates.map((template) => (
            <div key={template.slug} className="bg-[#202020] rounded-2xl p-5 border border-[#474747] flex items-center justify-between h-[120px] transition-all hover:border-[#616161]">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#323232]">
                  <FileEdit className="h-5 w-5 text-[#BAFF1A]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[20px] font-bold text-[#f5f5f5] truncate">{template.name}</h3>
                  <p className="text-[14px] text-[#9e9e9e] leading-tight">{template.description}</p>
                </div>
              </div>

              <div className="px-8 border-x border-[#323232] mx-8 flex flex-col items-center shrink-0 w-64">
                <p className="text-[12px] text-[#9e9e9e] font-normal mb-1">Arquivo Atual</p>
                {template.file_url ? (
                  <div className="flex items-center gap-2 text-[#229731] font-mono text-[13px] font-medium">
                    <CheckCircle className="w-4 h-4" />
                    <span className="truncate">modelo_{template.slug}.docx</span>
                  </div>
                ) : (
                  <span className="text-[#616161] italic text-[13px]">Aguardando arquivo</span>
                )}
              </div>

              <div className="flex gap-2 shrink-0">
                <Button variant="primary" size="md" className="px-6 h-10 rounded-full font-medium" onClick={() => handleTriggerUpload(template.slug)} loading={uploading === template.slug}>
                  <Upload className="w-4 h-4 mr-2" />
                  {template.file_url ? 'Substituir' : 'Fazer Upload'}
                </Button>

                {template.file_url && (
                  <div className="flex gap-2">
                    <Button variant="secondary" className="w-10 h-10 p-0 rounded-full" onClick={() => window.open(template.file_url!, '_blank')} title="Baixar modelo">
                      <Download className="w-5 h-5" />
                    </Button>
                    <Button variant="danger" className="w-10 h-10 p-0 rounded-full" onClick={() => handleRemoveTemplate(template.slug)} title="Remover modelo">
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>

        <section className="bg-[#202020] rounded-2xl p-6 border border-[#474747] flex-1 min-h-0 flex flex-col">
          <header className="flex items-center gap-3 border-b border-[#474747] pb-3 mb-4 shrink-0">
            <Info className="w-5 h-5 text-[#BAFF1A]" />
            <h3 className="text-[20px] font-bold text-[#f5f5f5]">Variaveis Dinamicas</h3>
            <span className="text-[14px] text-[#9e9e9e] ml-4 font-normal">Tags para preenchimento automatico no Word.</span>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 overflow-y-auto pr-2 custom-scrollbar">
            {SUPPORTED_VARIABLES.map((v) => (
              <div key={v.tag} className="bg-[#121212] rounded-xl p-4 border border-[#323232] flex items-center justify-between hover:border-[#BAFF1A] transition-all duration-150 group">
                <code className="text-[#BAFF1A] font-mono text-[16px] font-bold">{v.tag}</code>
                <span className="text-[13px] text-[#9e9e9e] group-hover:text-[#c7c7c7]">{v.desc}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
