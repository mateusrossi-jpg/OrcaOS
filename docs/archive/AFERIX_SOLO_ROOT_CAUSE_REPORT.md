# AFERIX_SOLO_ROOT_CAUSE_REPORT
MISSÃO: Identificar a causa raiz da invisibilidade de fluxos críticos no perfil SOLO.

## 1. Origem da Simplificação (Linha do Tempo)

* **Data:** 02 de Junho de 2026 (commits `f1f3883`, `65732fa`, `1c000f7`).
* **Evento:** Implementação do `SoloShell` e consolidação do padrão "Scroll-First UX".
* **Ação:** O perfil SOLO foi criado como um fork simplificado do `OwnerShell`, removendo abas como `Equipe` e, inadvertidamente, a aba `Propostas` (Budgets).
* **Justificativa Encontrada:** Commits indicam foco em "Product Polish" e "Business Flow Foundation Hardening", priorizando a unificação técnica (Garantias no Dossiê) em detrimento da visibilidade de navegação macro para o autônomo.

## 2. Intenção Original vs. Realidade

A intenção era **Ambas (A e B)**:
* **Reduzir Complexidade:** O perfil SOLO removeu abas de gestão de equipe para limpar o Menu.
* **Ocultar "Corporativo":** Ocultou o módulo de `Relatórios` e `Contratos` por serem considerados (erroneamente) funcionalidades de escala enterprise.

**Evidência de Misalignment:** O `AFERIX_POSICIONAMENTO_V1.md` define que **Contratos, Relatórios e Financeiro** são parte do **NÚCLEO UNIVERSAL (CORE)**. A implementação atual do perfil SOLO contradiz o posicionamento oficial ao tratar o autônomo apenas como um "executador de ordens".

## 3. Impacto na Proposta de Valor

| Módulo | Papel no Negócio | Status Atual | Impacto no Valor |
| :--- | :--- | :--- | :--- |
| **Orçamentos** | Conversão/Venda | **Oculto (Menu)** | Impede gestão do pipeline de faturamento. |
| **Contratos** | Recorrência/MRR | **Enterrado (4º Nível)** | Transforma receita recorrente em algo invisível. |
| **Garantias** | Pós-Venda/Confiança | **Enterrado (4º Nível)** | Dificulta a consulta rápida de cobertura em campo. |
| **Relatórios** | Prova Técnica | **Inacessível** | O operador não consegue extrair o valor de seu trabalho. |
| **Portal Cliente** | Experiência Premium | **Inacessível** | Elimina o principal diferencial competitivo do Aferix. |

## 4. Contradição Filosófica

* **Posicionamento:** "Aferix = Sistema Operacional de Bolso do técnico autônomo."
* **Realidade SOLO:** "Aferix = Checklist e Agenda de Campo."

A implementação atual amputou o "Sistema Operacional" (as camadas estratégicas e comerciais) para favorecer apenas a "Execução". O autônomo perdeu a visão de empresário.

## 5. Hipótese Principal

**B) EXCESSO DE SIMPLIFICAÇÃO DO PERFIL SOLO.**

**Justificativa:** Não foi um erro de código (bug técnico), mas uma decisão de UX (design failure) que removeu abas essenciais para o negócio individual na tentativa de "limpar" a interface. O sistema parou de seguir o Mandato Mestre: "TUDO GIRA EM TORNO DO ORÇAMENTO". Sem a aba de Propostas, o sistema não tem centro.

## 6. Conclusão e Nível de Confiança

* **Causa Raiz Provável:** A estratégia de simplificação do perfil SOLO focou excessivamente no uso "técnico de campo" (agenda/OS) e negligenciou o fato de que o SOLO também é o seu próprio "Owner" e "Sales".
* **Nível de Confiança:** 100% (Baseado na análise direta do `RoleShells.tsx` e contradição com o `GEMINI.md`).

---
*Relatório de Causa Raiz - Gemini CLI (Observation Only Mode)*
