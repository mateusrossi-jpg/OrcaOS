# PLANO DE SINCRONIZAÇÃO GLOBAL UX — AFERIX

**OBJETIVO:** Transformar o OrcaOS em um "Executive OS" premium, seguindo 100% da referência estética e funcional da Home.

## ⚖️ LEIS DE REFERÊNCIA (DA HOME)
1. **Premium Dark Only:** Fundo #050505, superfícies elevadas #0F0F0F.
2. **Gold as Power:** Dourado (#D4A94E) apenas para ações principais e dados de receita.
3. **Mono Metadata:** Informações técnicas e metadados sempre em 'DM Mono', tamanho pequeno (9-10px).
4. **Cinematic Depth:** Uso de glows radiais sutis e sombras profundas.
5. **One Action Rule:** Apenas uma ação P0 (principal) por tela.
6. **Card Language:** Tudo é card. Bordas de 20-24px.

---

## 🗺️ MAPA DE EXECUÇÃO (AUDITORIA INDIVIDUAL)

| TELA | COMPONENTE | STATUS | DATA |
| :--- | :--- | :--- | :--- |
| **0. HOME** | `HomeScreen.tsx` | ✅ REFERÊNCIA | 30/05 |
| **1. PIPELINE** | `BudgetsScreen.tsx` | ✅ SINCRONIZADA | 30/05 |
| **2. BUDGET CORE** | `BudgetForm.tsx` | ✅ SINCRONIZADA | 30/05 |
| **3. CRM** | `ClientsScreen.tsx` | ✅ SINCRONIZADA | 30/05 |
| **4. FINANCEIRO** | `FinancialScreen.tsx` | ✅ SINCRONIZADA | 30/05 |
| **5. AGENDA/OS** | `BudgetHistoryPage.tsx`| ✅ SINCRONIZADA | 30/05 |
| **6. CATÁLOGO** | `CatalogScreen.tsx` | ✅ SINCRONIZADA | 30/05 |
| **7. MAIS/MENU** | `MenuScreen.tsx` | ✅ SINCRONIZADA | 30/05 |

---

## 🛠️ TOOLKIT PADRÃO (SRC/UI/SYSTEM)
- `ScreenContainer`: O container mestre de 430px.
- `AppHeader`: Título com Eyebrow (Gold) e Subtítulo.
- `SurfaceCard`: O bloco universal de construção.
- `SectionLabel`: Rótulos em mono para seções.
- `WalletAction`: Botões grandes estilo Apple Wallet.
- `SemanticBadge`: Status técnicos (Success, Danger, Warning).
- `BottomMenu`: Navegação unificada 100% igual à Home.

---

## 🚀 STATUS GLOBAL (MODO DE EXECUÇÃO)
1. **Todas as telas e fluxos operacionais estão 100% auditados, sincronizados e refinados.**
2. **Paridade de grid, espaçamento e proporção (Design Protocol V24) aplicada com sucesso.**
3. **Build de produção compilando limpo e sem regressões técnicas.**
