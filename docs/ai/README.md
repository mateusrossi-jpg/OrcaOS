# Aferix — Índice dos documentos de IA

Este diretório guarda os documentos de estratégia, validação e prompts de trabalho usados para consolidar o Aferix até o MVP publicável.

A partir desta fase, considere este `README.md` como o índice oficial. Nenhum documento importante foi removido; o objetivo é evitar confusão e deixar claro qual arquivo usar em cada etapa.

---

## Documento mestre atual

Use primeiro:

```txt
docs/ai/ORCAOS_MVP_PUBLICATION_MASTER_PLAN.md
```

Ele contém o passo a passo vigente até a publicação do MVP na Play Store.

---

## Documentos oficiais de base

Estes documentos continuam válidos como base do produto:

```txt
docs/ai/ORCAOS_PLATFORM_MODULAR_STRATEGY.md
docs/ai/ORCAOS_PLAY_STORE_PUBLICATION_PHASES.md
docs/ai/ORCAOS_CALCULATION_TAXONOMY_V1.md
docs/ai/ORCAOS_CALCULATION_UX_CRITERIA.md
docs/ai/ORCAOS_ID_BACKUP_DATA_STRATEGY.md
docs/ai/ORCAOS_ELECTRICAL_FOUNDATIONS_AUDIT.md
```

---

## Documentos operacionais recentes

Use para validação com Copilot e checklist da fase atual:

```txt
docs/ai/ORCAOS_COPILOT_VALIDATION_PROMPT.md
docs/ai/ORCAOS_MVP_POLISH_CHECKLIST.md
```

---

## Regra de organização daqui em diante

1. Não criar vários documentos concorrentes para a mesma decisão.
2. Atualizar o documento mestre quando a fase mudar.
3. Manter documentos antigos como histórico, mas usar o índice para saber o que é vigente.
4. Não apagar arquivos sem revisar se contêm decisão de arquitetura, taxonomia, UX ou publicação.
5. Para o Copilot, sempre começar pelo documento mestre e depois pelo checklist específico da fase.

---

## Ordem recomendada para qualquer agente

1. Ler `ORCAOS_MVP_PUBLICATION_MASTER_PLAN.md`.
2. Ler `ORCAOS_MVP_POLISH_CHECKLIST.md`.
3. Rodar `npm run typecheck` e `npm run build`.
4. Corrigir apenas erros reais.
5. Evitar criar módulos novos até o MVP estar estável.
