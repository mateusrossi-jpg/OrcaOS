# QA Visual de Release — Aferix

## Data
16 de Maio de 2026 (Local Time) / 17 de Maio de 2026 (UTC)

## Objetivo
Registrar a revisão visual final do *dark theme* premium do **Aferix**, mapeando a consistência dos componentes, alinhamentos responsivos e a segurança estrutural das telas para a Release Candidate (RC).

---

## Telas revisadas

| Tela | Status | Observações |
| :--- | :---: | :--- |
| **Dashboard** | **OK** | KPIs alinhados de forma compacta. Ações rápidas visíveis e limpas. Grids se adequam perfeitamente sem quebrar no mobile. |
| **Clientes / Atendimentos** | **OK** | **ContextBanner corrigido de forma definitiva no mobile** usando CSS Grid. O botão "Novo atendimento" desce para a linha inferior com largura total de 100%, sem sobrepor o título "Nenhum atendimento ativo". Métricas e grids empilham elegantemente. |
| **Propostas / Orçamento** | **OK** | Fluxo comercial intacto e super polido. Stepper, abas e o resumo comercial preservam a excelente responsividade desenvolvida. Livre de variáveis legadas Orca. |
| **Financeiro** | **OK** | Cards de indicadores consistentes com destaque dourado sutil no lucro líquido. Botão de novo lançamento perfeitamente posicionado e tabelas com rolagem horizontal segura no mobile. |
| **Compras** | **OK** | Listagem de compras limpa. Botão de cópia rápida e o resumo de custos bem integrados com o padrão dark premium do Aferix. |
| **Relatórios** | **OK** | Prévia do documento clara (modo light de alta legibilidade protegido) funcionando perfeitamente sem estourar e sem textos escuros sobre fundos escuros. Ação de imprimir/exportar PDF bem destacada. |
| **Configurações** | **OK** | Tabs mobile funcionam com scroll horizontal. Tela de Preferências exibe labels alinhados acima dos inputs. Segurança e backups limpos e responsivos. |
| **Licença** | **OK** | Plan Cards (Free, Pro, Vitalício) altamente premium, coerentes com a paleta dark. Benefícios e preços limpos e sem qualquer texto colado. |
| **Simulador / Precificação** | **OK** | Foco comercial prioritário com contexto de cálculo limpo e tabs perfeitamente alinhadas, livre de textos colados ou de módulos técnicos legados dominando a tela inicial. |
| **Catálogo / Estoque** | **OK** | Interface profissional. Paleta adaptada ao Aferix (dourado/amber e dark). Itens e pontes de fornecedor integradas e sem ruídos visuais. |
| **Base técnica** | **OK** | Módulo de dados da visita / registros técnicos opcional preservado de forma discreta e alinhada ao design system dark, sem poluir a abordagem principal do app. |

---

## Ajustes realizados

* **[aferixTheme.css](file:///home/mateus/dev/github/OrcaOS/src/styles/aferixTheme.css)**
  * Substituição completa da regra original de `.context-banner` de `display: flex` para um layout em `display: grid` seguro em todas as resoluções.
  * Implementação da quebra de linha responsiva automática no breakpoint `@media (max-width: 760px)` para empilhar o botão de ação na base com `grid-column: 1 / -1`, largura total (`100%`) e alinhamento `stretch`.
  * Adicionado espaçamento responsivo seguro em `.client-os-workspace` para o banner de contexto e os painéis financeiros.
* **[visual-qa.mjs](file:///home/mateus/dev/github/OrcaOS/scripts/visual-qa.mjs)**
  * Reestruturação e adição da validação automatizada de regressão **`ContextBanner / Atendimentos`** que assegura a integridade estrutural do Grid do banner, largura completa, e a ausência absoluta de `position: absolute`, transformações ou margens negativas nocivas no botão principal.

---

## Regressões bloqueadas

O script de validação de regressão visual protege de forma estável e robusta os seguintes problemas críticos do passado:
1. **`visual:qa`**: Executado a cada ciclo de CI/CD para assegurar zero regressões estruturais e de design system.
2. **ContextBanner mobile**: Bloqueia botões flutuando de forma absoluta ou margens que sobrepunham o texto do banner.
3. **Preferências com labels empilhados**: Evita desalinhamentos nos formulários de preferências do profissional.
4. **Relatório com documento claro**: Evita a quebra da visibilidade do preview de alta legibilidade.
5. **Propostas/Orçamento sem variáveis Orca**: Garante a migração de marca completa e impede o retorno de variáveis legadas do OrcaOS.
6. **Licença sem textos colados**: Protege o espaçamento elegante dos cards de planos do Aferix.
7. **Simulador sem textos colados**: Mantém a apresentação limpa das tabs e módulos financeiros de precificação.

---

## Pendências visuais
Nenhuma pendência crítica visual para RC. Apenas polimentos futuros.

---

## Comandos executados

Abaixo está o registro de sucesso de todas as validações de integridade executadas na suíte de testes e compilação do Aferix:

```bash
# 1. Typecheck (TypeScript)
$ npm run typecheck
> tsc --noEmit
✔ Compilado com sucesso (zero erros de tipos).

# 2. Testes Unitários e Funcionais (Vitest)
$ npm test
✓ Test Files  42 passed (42)
✓ Tests  222 passed (222)
✔ Todos os 222 testes unitários e funcionais da suíte de segurança passaram!

# 3. Production Build (Vite)
$ npm run build
> tsc -b && vite build
✔ Build de produção otimizado criado com sucesso em dist/ (zero avisos ou erros).

# 4. Visual QA Check
$ npm run visual:qa
> node scripts/visual-qa.mjs
✔ Preferências do App (ProfessionalProfileWorkspace) - Passou com sucesso!
✔ Configurações / Tabs (global.css) - Passou com sucesso!
✔ Relatórios (ReportWorkspace.css) - Passou com sucesso!
✔ Propostas / Orçamento (BudgetWorkspace.css) - Passou com sucesso!
✔ Licença (StoreScreen.tsx) - Passou com sucesso!
✔ Simulador / Precificação (CalculationsScreen.tsx) - Passou com sucesso!
✔ ContextBanner / Atendimentos (aferixTheme.css) - Passou com sucesso!
✔ Design Tokens (aferixTheme.css) - Passou com sucesso!
✔ QA Visual Passou com sucesso!

# 5. RC Check (Release Candidate Pipeline)
$ npm run rc:check
✔ Todo o fluxo de typecheck, unit tests, build e visual QA executados sequencialmente com sucesso absoluto.
```
