import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

const policies = [
  `CREATE POLICY "maintenance-files: upload autenticado" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'maintenance-files' AND auth.role() = 'authenticated')`,
  `CREATE POLICY "maintenance-files: delecao autenticada" ON storage.objects FOR DELETE USING (bucket_id = 'maintenance-files' AND auth.role() = 'authenticated')`,
]

for (const sql of policies) {
  const { error } = await supabase.rpc('exec_sql', { sql }).catch(() => ({ error: { message: 'rpc indisponível' } }))
  if (error) {
    // Tentar via query direta
    const res = await fetch(`${url}/rest/v1/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }
    })
  }
  console.log(error ? `Policy já existe ou erro: ${error.message}` : 'Policy criada.')
}
