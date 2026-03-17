/**
 * @file client.ts
 * @description Configuração e instanciação do cliente Supabase para uso no lado do cliente (Client-side).
 * Este módulo utiliza a biblioteca @supabase/ssr para criar uma conexão estável
 * entre o front-end da aplicação GoMoto e o backend as a Service (BaaS) do Supabase.
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * @function createClient
 * @description Inicializa uma instância única do cliente Supabase configurada especificamente
 * para o ambiente de execução do navegador (Browser).
 * 
 * @returns Uma instância funcional do SupabaseClient configurada com as variáveis de ambiente do projeto.
 */
export function createClient() {
  /**
   * O método createBrowserClient recupera automaticamente as chaves do ambiente configuradas
   * através das variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.
   * Essas variáveis devem estar presentes no arquivo .env.local para que a conexão funcione.
   */
  return createBrowserClient(
    // A exclamação (!) ao final indica ao TypeScript que garantimos a existência dessas variáveis.
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
