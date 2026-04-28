# 🧪 Testes — [[GoMoto]]

Framework: **Playwright 1.59.1** (E2E apenas — sem testes unitários).

## Configuração

`playwright.config.ts`:
- `fullyParallel: false, workers: 1` — sequencial (evita conflito de dados)
- `baseURL: http://localhost:3000`
- Trace/screenshot/video apenas em falhas
- Action timeout: 15s, Navigation timeout: 30s

## Setup inicial (auth.setup.ts)

- Faz login **uma vez** via `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`
- Salva estado em `tests/.auth/user.json`
- Todos os specs reutilizam (não refaz login)

## Specs existentes

| Spec | Cobertura |
|---|---|
| `clientes.spec.ts` | Editar e excluir cliente |
| `motos.spec.ts` | Listar, criar, editar, deletar moto |
| `cobrancas.spec.ts` | CRUD de billings |
| `despesas.spec.ts` | CRUD de despesas |
| `entradas.spec.ts` | Registrar entradas |
| `fila.spec.ts` | Gerenciar fila de espera |
| `multas.spec.ts` | CRUD de multas |
| `manutencao.spec.ts` | Criar e atualizar manutenções |
| `processos.spec.ts` | CRUD de processos |

**Cobertura:** ~80% dos fluxos CRUD. Não cobre dashboard, gráficos, fluxos complexos de contratos.

## Helpers (tests/helpers.ts)

- `createTestCustomer()`, `deleteTestCustomer()` — fixtures
- `getModal()`, `waitForPageLoad()` — utilitários de espera

## Scripts npm

```bash
npm run test          # headless
npm run test:ui       # dashboard UI
npm run test:headed   # browser visível
npm run test:report   # abre HTML report
```

## Gaps

- ❌ Sem testes unitários (componentes, utils)
- ❌ Sem testes de integração isolados (só E2E)
- ❌ Sem cobertura de dashboard/relatórios

## Tags
`#projeto/testes` `#ferramenta/playwright`
