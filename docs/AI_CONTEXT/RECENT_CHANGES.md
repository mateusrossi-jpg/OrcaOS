# Mudanças recentes
 M docs/ARQUITETURA.md
 M package-lock.json
 M package.json
 M src/core/types/business.ts
 M src/core/workflow/timeline.ts
 M src/features/budgets/components/BudgetDetailWorkspace.tsx
 M src/features/budgets/components/OperationalTimelinePanel.test.tsx
 M src/features/budgets/components/OperationalTimelinePanel.tsx
 M src/features/budgets/storage/savedBudgetsStorage.test.ts
 M src/features/budgets/storage/savedBudgetsStorage.ts
 M src/styles/premiumSystem.css
?? GEMINI.md
?? docs/AI_CONTEXT/
?? docs/CONTEXTO_MASTER.md
?? docs/MVP_ROADMAP.md
?? docs/REGRAS_DE_DESENVOLVIMENTO.md
?? docs/UI_UX.md
?? scripts/aferix-ai-context.sh
?? src/domain/
?? src/features/budgets/components/SnapshotInspector.test.tsx
?? src/features/budgets/components/SnapshotInspector.tsx
?? src/hooks/
?? src/pages/
?? src/repositories/
?? src/services/
?? src/storage/

 docs/ARQUITETURA.md                                | 183 ++----------------
 package-lock.json                                  |   7 +
 package.json                                       |   1 +
 src/core/types/business.ts                         |  34 ++++
 src/core/workflow/timeline.ts                      |  10 +-
 .../budgets/components/BudgetDetailWorkspace.tsx   |   4 +
 .../components/OperationalTimelinePanel.test.tsx   |  22 +++
 .../components/OperationalTimelinePanel.tsx        |  11 ++
 .../budgets/storage/savedBudgetsStorage.test.ts    | 131 ++++++++++++-
 .../budgets/storage/savedBudgetsStorage.ts         |  68 ++++++-
 src/styles/premiumSystem.css                       | 211 +++++++++++++++++++++
 11 files changed, 507 insertions(+), 175 deletions(-)
