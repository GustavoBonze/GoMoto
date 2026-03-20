/**
 * @file middleware.ts
 * @description Interceptor de requisições (Middleware) do Next.js para o Sistema GoMoto.
 * Este arquivo é responsável por gerenciar a sessão do usuário, atualizar tokens de autenticação
 * e proteger rotas privadas contra acesso não autorizado.
 * A lógica aqui garante que apenas usuários autenticados acessem o dashboard.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * @constant SUPABASE_URL
 * @description URL de API do projeto Supabase, recuperada das variáveis de ambiente.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * @constant SUPABASE_KEY
 * @description Chave anônima pública para acesso ao Supabase.
 */
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * @constant isSupabaseConfigured
 * @description Validação booleana para verificar se o ambiente do Supabase foi devidamente configurado.
 * Previne erros de execução caso as chaves estejam ausentes ou com valores padrão de exemplo.
 */
const isSupabaseConfigured =
  !!SUPABASE_URL &&
  !!SUPABASE_KEY &&
  SUPABASE_URL.startsWith('http') &&
  !SUPABASE_URL.includes('your_supabase');

/**
 * @function middleware
 * @async
 * @description Função principal executada para cada requisição que corresponda ao 'matcher' configurado.
 * Realiza a ponte entre os cookies do navegador e a sessão do Supabase.
 * 
 * @param {NextRequest} request - Objeto da requisição recebida pelo servidor.
 * @returns {NextResponse} Resposta modificada (redirecionamento ou continuação).
 */
export async function middleware(request: NextRequest) {
  /**
   * Se o Supabase não estiver configurado no .env, o middleware libera o acesso total.
   * Isso facilita o desenvolvimento inicial e testes de UI sem necessidade de banco de dados.
   */
  if (!isSupabaseConfigured) {
    return NextResponse.next({ request });
  }

  /**
   * Inicializa o objeto de resposta padrão.
   */
  let supabaseResponse = NextResponse.next({ request });

  /**
   * Criação do cliente Supabase específico para o Middleware.
   * Configurado para sincronizar cookies de sessão entre a requisição e a resposta.
   */
  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_KEY!, {
    cookies: {
      /**
       * @method getAll
       * @description Recupera todos os cookies da requisição para verificar a sessão atual.
       */
      getAll() {
        return request.cookies.getAll();
      },
      /**
       * @method setAll
       * @description Sincroniza a atualização de cookies na requisição e na resposta.
       * Garante que o usuário permaneça logado ao renovar o token de acesso.
       */
      setAll(cookiesToSet) {
        // Atualiza a requisição com os cookies renovados
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
        // Cria nova resposta e aplica os cookies com as opções completas
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  /**
   * Recupera os dados do usuário autenticado a partir do token contido nos cookies.
   */
  const { data: { user } } = await supabase.auth.getUser();

  /**
   * @constant isLoginPage
   * @description Verifica se a rota atual é a página de login.
   */
  const isLoginPage = request.nextUrl.pathname === '/login';

  /**
   * @constant isPublicPath
   * @description Identifica rotas de autenticação (como callback de login) que devem ser públicas.
   */
  const isPublicPath = request.nextUrl.pathname.startsWith('/auth');

  /**
   * LÓGICA DE REDIRECIONAMENTO:
   * 1. Se o usuário não está logado e tenta acessar uma página privada (que não seja /login ou /auth/*),
   *    ele é redirecionado para a tela de login.
   */
  if (!user && !isLoginPage && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  /**
   * 2. Se o usuário já está logado e tenta acessar a página de /login,
   *    ele é redirecionado automaticamente para o dashboard.
   */
  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  /**
   * Retorna a resposta processada, mantendo os cookies atualizados.
   */
  return supabaseResponse;
}

/**
 * @constant config
 * @description Configuração de escopo do middleware.
 * O 'matcher' utiliza uma expressão regular para ignorar arquivos estáticos (JS, CSS, Imagens)
 * e focar apenas nas rotas de aplicação.
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
