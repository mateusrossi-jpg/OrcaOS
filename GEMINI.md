# AFERIX — MASTER CONSTITUTION

## 🚨 EXECUTION UNLOCKED 🚨
Conforme Sprint de Limpeza de Documentação de Junho de 2026, as restrições de congelamento de UI/UX e modo somente de observação foram totalmente removidas.
O projeto encontra-se em **Product Refinement Mode**, autorizando evoluções de UI, UX, usabilidade, fluxos de conversão e retenção.

## SINGLE SOURCE OF TRUTH
Toda a governança, regras e roadmap do produto foram consolidados nos seguintes arquivos mestres na raiz do projeto:
1. [PRODUCT_VISION.md](./PRODUCT_VISION.md) - Visão do produto, posicionamento, PMF e diferenciais competitivos.
2. [PRODUCT_ARCHITECTURE.md](./PRODUCT_ARCHITECTURE.md) - Módulos do sistema, modelo de dados offline-first, navegação e fluxos de dados.
3. [PRODUCT_UX_SYSTEM.md](./PRODUCT_UX_SYSTEM.md) - Sistema visual, regras de UX, usabilidade e design.
4. [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md) - Próximas fases, prioridades RC18+ e pendências.
5. [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md) - Registro de decisões arquiteturais e operacionais aprovadas/rejeitadas.
6. [PRODUCT_HOME_HEADER_CONSTITUTION.md](./PRODUCT_HOME_HEADER_CONSTITUTION.md) - Constituição da Home e do Header, definindo a referência oficial de UX/UI e Design System.

Toda a documentação antiga e histórica foi arquivada em [docs/archive/](./docs/archive).

## 🚀 JUNE 2026 PURIFICATION COMPLETE
A Sprint de Limpeza de Junho de 2026 foi finalizada com sucesso. 
- Centenas de arquivos de auditoria e documentos legados foram arquivados ou removidos.
- A base de código foi sincronizada com o GitHub (`origin main`).
- Os arquivos `PRODUCT_*.md` agora são as únicas fontes de verdade para o produto.

## 🛠️ OPERATIONAL PROTOCOLS
1. **Commits:** Siga o padrão `feat:`, `fix:`, `refactor:`, `docs:`. Seja conciso e focado no "porquê".
2. **Surgical Edits:** Prefira edições cirúrgicas em vez de reescritas completas, a menos que instruído.
3. **Offline-First:** Todas as novas funcionalidades devem respeitar a arquitetura de 5 camadas (UI -> Hooks -> Services -> Repositories -> Storage) e o princípio offline-first.
4. **Validation:** Nunca finalize uma tarefa sem validar o impacto visual e funcional (especialmente em mobile).
