/**
 * @file src/app/(dashboard)/contratos/page.tsx
 * @description Modulo de Gestao de Modelos de Contrato (.docx).
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

interface ContractTemplate {
  id?: string
  slug: string
  name: string
  description: string
  file_url: string | null
  updated_at: string | null
}

const SUPPORTED_VARIABLES = [
  { tag: '{{data_hoje}}', desc: 'Data atual' },
  { tag: '{{nome_cliente}}', desc: 'Nome locatario' },
  { tag: '{{cpf_cliente}}', desc: 'CPF locatario' },
  { tag: '{{placa_moto}}', desc: 'Placa moto' },
  { tag: '{{modelo_moto}}', desc: 'Modelo moto' },
  { tag: '{{valor_semanal}}', desc: 'R$ semanal' },
  { tag: '{{km_inicial}}', desc: 'KM inicial' },
  { tag: '{{data_inicio}}', desc: 'Data inicio' },
]

export default function ModelosContratoPage() {
  const [templates, setTemplates] = useState<ContractTemplate[]>([
    { slug: 'locacao', name: 'Contrato de Locacao', description: 'Padrao semanal sem fidelidade.', file_url: null, updated_at: null },
    { slug: 'fidelidade', name: 'Contrato com Fidelidade', description: 'Modelo com clausula de permanencia.', file_url: null, updated_at: null },
  ])
  
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function fetchTemplates() {
    setLoading(true)
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
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => { fetchTemplates() }, [])

  const handleTriggerUpload = (slug: string) => {
    setActiveSlug(slug)
    fileInputRef.current?.click()
  }

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
      setSuccess('Modelo atualizado!')
      fetchTemplates()
    } catch (err: any) { setError('Falha no upload.') } finally {
      setUploading(null)
      setActiveSlug(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveTemplate = async (slug: string) => {
    if (!confirm('Deseja remover este modelo?')) return
    setLoading(true)
    try {
      const { error: dbErr } = await supabase.from('contract_templates').update({ file_url: null, updated_at: null }).eq('slug', slug)
      if (dbErr) throw dbErr
      setSuccess('Modelo removido.')
      fetchTemplates()
    } catch (err: any) { setError('Erro ao remover.') } finally { setLoading(false) }
  }

  return (
    <div className="h-screen bg-[#121212] flex flex-col overflow-hidden select-none">
      <header className="h-16 border-b border-[#323232] flex items-center justify-between px-6 shrink-0 bg-[#121212]">
        <h1 className="text-[28px] font-bold text-[#f5f5f5]">Modelos de Contrato</h1>
        <div className="flex items-center gap-3">
          {(error || success) && (
            <div className={(error ? 'bg-[#7c1c1c] text-[#ff9c9a]' : 'bg-[#0e2f13] text-[#28b438]') + " px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2"}>
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
                <div className="bg-[#323232] p-4 rounded-full shrink-0">
                  <FileEdit className="w-8 h-8 text-[#BAFF1A]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[20px] font-bold text-[#f5f5f5] truncate">{template.name}</h3>
                  <p className="text-[14px] text-[#9e9e9e] leading-tight">{template.description}</p>
                </div>
              </div>
              <div className="px-8 border-x border-[#323232] mx-8 flex flex-col items-center shrink-0 w-64">
                <p className="text-[12px] text-[#9e9e9e] uppercase font-bold tracking-widest mb-1">Arquivo Atual</p>
                {template.file_url ? (
                  <div className="flex items-center gap-2 text-[#28b438] font-mono text-[13px] font-medium">
                    <CheckCircle className="w-4 h-4" />
                    <span className="truncate">modelo_{template.slug}.docx</span>
                  </div>
                ) : (
                  <span className="text-[#616161] italic text-sm">Aguardando arquivo</span>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="primary" size="md" className="px-6 h-11 rounded-full font-semibold" onClick={() => handleTriggerUpload(template.slug)} loading={uploading === template.slug}>
                  <Upload className="w-4 h-4 mr-2" />
                  {template.file_url ? 'Substituir' : 'Fazer Upload'}
                </Button>
                {template.file_url && (
                  <div className="flex gap-2">
                    <Button variant="secondary" className="w-11 h-11 p-0 rounded-full" onClick={() => window.open(template.file_url!, '_blank')} title="Baixar modelo">
                      <Download className="w-5 h-5" />
                    </Button>
                    <Button variant="danger" className="w-11 h-11 p-0 rounded-full" onClick={() => handleRemoveTemplate(template.slug)} title="Remover modelo">
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
