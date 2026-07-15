---
tags: [projeto/gomoto, claude/instrucoes]
updated: 2026-07-15
---

# 🤖 Claude — Instruções GoMoto

> Projeto: [[GoMoto]]

Instruções de comportamento para o Claude Code neste projeto.

## ⚠️ Regra Fundamental de Idioma

**Inglês obrigatório** em todo código: variáveis, funções, interfaces, valores de enum, colunas de banco, slugs, rotas, nomes de arquivo.

**Português permitido apenas** em: labels de UI, mensagens de toast, placeholders, textos de modal, comentários JSDoc.

Exemplo correto:
- Valor no banco/código: `contract_type: 'rental' | 'loyalty'`
- Label exibida ao usuário: `'Locação'` / `'Com Fidelidade'`

Referência completa: ver [[Guia de Desenvolvimento]] — "Regras invioláveis ao modificar código"

## Mapa de Consulta de Contexto

Antes de qualquer tarefa não-trivial, ler as notas relevantes via MCP do Obsidian:

| Tipo de tarefa | Notas a ler |
|---|---|
| Início de sessão / contexto geral | `GoMoto.md` + `Estado Atual.md` |
| Entender estrutura / App Router / pastas | `Arquitetura.md` |
| UI / visual / nova tela | `Design System.md` + `Componentes UI.md` + `Telas/Telas.md` + `Telas/<NomeDaTela>.md` |
| Banco de dados / schema / migration | `Banco de Dados.md` |
| Upload / fotos / storage | `Storage Supabase.md` |
| Nova funcionalidade / padrão de código | `Guia de Desenvolvimento.md` + `Tipos TypeScript.md` + `Utilitários e Libs.md` |
| Fluxo de negócio / regras | `Fluxos de Negócio.md` |
| Segurança / RLS / middleware | `Segurança.md` |
| Testes (Playwright) | `Testes.md` |
| Configurar ambiente / deploy / secrets | `Variáveis de Ambiente.md` |
| Decidir próxima tarefa / prioridade | `Roadmap.md` |

**Tarefas simples** (typo, rename, fix pontual de uma linha) → pular consulta.

**Fallback** se o MCP falhar: ler `/Users/gustavobonze/Projetos/Gustavo/GoMoto/obsidian-notes/` (cópia — pode estar desatualizada).

## Preferências de Escrita do Usuário

Corrigir o português do usuário quando necessário — pontuação, vírgulas, concordância, acentuação. Fazer de forma breve no início ou fim da resposta, apenas quando houver algo a corrigir.
