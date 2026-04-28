-- Cria bucket maintenance-files (público, máx 10MB, apenas imagens)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'maintenance-files',
  'maintenance-files',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública (qualquer um pode ver as fotos)
CREATE POLICY "maintenance-files: leitura publica"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'maintenance-files');

-- Upload apenas para usuários autenticados
CREATE POLICY "maintenance-files: upload autenticado"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'maintenance-files' AND auth.role() = 'authenticated');

-- Deleção apenas para usuários autenticados
CREATE POLICY "maintenance-files: delecao autenticada"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'maintenance-files' AND auth.role() = 'authenticated');
