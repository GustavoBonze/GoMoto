import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_KEY

if (!url || !serviceKey) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false }
})

// Criar bucket
const { data, error } = await supabase.storage.createBucket('maintenance-files', {
  public: true,
  fileSizeLimit: 10 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif'],
})

if (error && !error.message.includes('already exists')) {
  console.error('Erro ao criar bucket:', error.message)
  process.exit(1)
}

console.log(data ? 'Bucket criado com sucesso.' : 'Bucket já existe.')
