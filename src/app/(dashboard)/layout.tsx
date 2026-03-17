/**
 * ARQUIVO: src/app/(dashboard)/layout.tsx
 * DESCRIÇÃO: Este arquivo define o layout estrutural comum para todas as rotas dentro do grupo de rotas (dashboard).
 * O layout inclui uma barra lateral fixa (Sidebar) e uma área principal de conteúdo que recebe os componentes filhos.
 * Ele garante a consistência visual e funcional da navegação interna do sistema GoMoto.
 * 
 * PROPÓSITO:
 * - Prover uma estrutura de "Shell" para a aplicação.
 * - Gerenciar a disposição espacial da Sidebar e do conteúdo principal.
 * - Definir o estilo de fundo global para as páginas do dashboard.
 * 
 * REGRAS DE NEGÓCIO:
 * - O Sidebar deve ser renderizado em todas as páginas do dashboard.
 * - O conteúdo principal deve ter um recuo à esquerda (margin-left) para não ser sobreposto pela Sidebar fixa.
 * - O layout deve ocupar pelo menos a altura total da janela (min-h-screen).
 */

import { Sidebar } from '@/components/layout/Sidebar'

/**
 * INTERFACE / PROPS:
 * @param children - Elementos React que representam a página específica sendo acessada dentro do dashboard.
 */
interface DashboardLayoutProps {
  children: React.ReactNode
}

/**
 * COMPONENTE: DashboardLayout
 * Este componente envolve todas as páginas protegidas após o login.
 * Ele utiliza uma estrutura Flexbox para organizar a navegação lateral e o conteúdo.
 * 
 * ESTRUTURA DOM:
 * 1. <div> (Container Principal): Define a altura mínima e a cor de fundo escura (#121212).
 * 2. <Sidebar />: Componente de navegação lateral.
 * 3. <main> (Área de Conteúdo): Contêiner flexível que gerencia o scroll e o espaçamento da Sidebar.
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  /*
   * RENDERIZAÇÃO:
   * O layout é montado com a Sidebar fixa e o conteúdo dinâmico (children) à direita.
   * A classe 'ml-[240px]' na tag <main> compensa a largura da Sidebar que é de 240px.
   */
  return (
    // Container externo com altura mínima da tela e fundo escuro
    <div className="flex min-h-screen bg-[#121212]">
      
      {/* 
        * COMPONENTE DE NAVEGAÇÃO LATERAL
        * Contém os links de acesso rápido às funcionalidades: Motos, Clientes, Contratos, etc.
        */}
      <Sidebar />

      {/* 
        * ÁREA PRINCIPAL DE CONTEÚDO
        * 'flex-1': Ocupa o restante do espaço disponível horizontalmente.
        * 'ml-[240px]': Margem esquerda para acomodar a Sidebar fixa.
        * 'min-h-screen': Garante que o fundo cubra toda a altura da tela.
        * 'overflow-auto': Permite scroll interno caso o conteúdo exceda a altura da tela.
        */}
      <main className="flex-1 ml-[240px] min-h-screen overflow-auto">
        {/* 
          * CONTEÚDO DINÂMICO DA ROTA
          * Aqui é onde as páginas individuais (dashboard/page, motos/page, etc.) são injetadas.
          */}
        {children}
      </main>
    </div>
  )
}

/**
 * NOTAS ADICIONAIS:
 * - A cor de fundo #121212 segue o padrão de design escuro (Dark Mode) do projeto.
 * - O uso de 'min-h-screen' no <main> evita que páginas com pouco conteúdo fiquem com o fundo cortado.
 * - Este layout é aplicado automaticamente pelo Next.js a todas as pastas filhas de (dashboard).
 */
