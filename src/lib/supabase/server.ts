/**
 * @file server.ts
 * @description Configuração e instanciação do cliente Supabase para execução no lado do servidor (Server-side).
 * Essencial para operações realizadas em Server Components, Server Actions e Route Handlers do Next.js.
 * Utiliza o @supabase/ssr para gerenciar a persistência da sessão via Cookies.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * @function createClient
 * @description Cria uma instância do cliente Supabase injetando o gerenciamento de cookies do Next.js.
 * Isso permite que o servidor leia e escreva tokens de autenticação diretamente no navegador do usuário.
 * 
 * @returns Uma instância do SupabaseClient configurada para operações no servidor.
 */
export function createClient() {
  /**
   * @constant cookieStore
   * @description Acessa a API de cookies do cabeçalho da requisição atual do Next.js.
   */
  const cookieStore = cookies();

  /**
   * Inicialização do cliente utilizando as chaves de ambiente obrigatórias.
   * O objeto de configuração de cookies é crucial para manter o estado da sessão do usuário.
   */
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * @method getAll
         * @description Recupera todos os cookies disponíveis no cabeçalho da requisição.
         * @returns Lista completa de cookies.
         */
        getAll() {
          return cookieStore.getAll();
        },
        /**
         * @method setAll
         * @description Define novos cookies no navegador através da resposta do servidor.
         * @param cookiesToSet - Array de objetos contendo nome, valor e opções do cookie.
         */
        setAll(cookiesToSet) {
          try {
            /**
             * Itera sobre cada cookie fornecido pelo Supabase para gravação.
             * Nota: Em Server Components (RSC), o 'set' pode falhar se a resposta já tiver sido enviada.
             */
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            /**
             * Silencia erros de gravação em RSC, pois o gerenciamento de middleware cuidará
             * da atualização dos tokens quando necessário.
             */
          }
        },
      },
    }
  );
}
