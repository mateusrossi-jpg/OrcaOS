# Workspace Consistency Audit: Aferix OS
*Data da Auditoria: 2026-05-31*

## Objetivo e Pergunta Principal
**Se escondermos os títulos das páginas, ainda é possível reconhecer que todas pertencem ao mesmo produto?**

**Resposta:** Sim, visualmente. A identidade "Premium Dark" (fundo grafite, acentos em neon/gold, vidro sólido) está perfeitamente distribuída. Porém, **estruturalmente e comportamentalmente a resposta é "Quase"**. O ritmo da tela e a posição de ações cruciais mudam dependendo do módulo, gerando micro-fricções cognitivas no operador.

---

## 📊 Scores de Unificação

* **Consistência Visual:** 85/100 (Cores, Fontes e Componentes base são estritos).
* **Consistência Estrutural:** 70/100 (Espaçamentos de grid, paddings internos e pesos de blocos divergem).
* **Consistência Comportamental:** 80/100 (Uso do `InteractiveRow` e modais é previsível, mas localização de ações primárias varia).

---

## 🔍 Mapeamento de Divergências

### 1. Cabeçalhos (Headers) & Ações Primárias
* **Padrão Encontrado:** Todas as telas usam o componente `AppHeader` (Excelente).
* **Divergência:** O *slot* `action` do Header é tratado de forma concorrente. 
  * No `ClientsWorkspace`, o Header abriga a **Ação Primária Dourada** (`Novo Cliente`).
  * No `SimpleFinanceWorkspace`, o Header abriga um **Filtro Secundário Transparente** (`Mês`).
  * **Problema:** O usuário não tem um padrão motor (memória muscular) para "Onde eu clico para criar algo novo?". Às vezes é no Header, às vezes é num FAB (Floating Action Button), às vezes no meio da tela.

### 2. Espaçamentos (Rhythm & Layout)
* **Padrão Encontrado:** Telas envelopadas no `ScreenContainer` e seções em `Section`.
* **Divergência:** A macro-estrutura tem vãos (gaps) concorrentes.
  * `HomeScreen`: Espaçamento principal `gap-12` (48px) com subseções `gap-5`.
  * `ClientsWorkspace`: Espaçamento principal `gap-8` (32px) com subseções `gap-4`.
  * `SimpleFinanceWorkspace`: Espaçamento principal `gap-8` (32px) com subseções `gap-3`.
  * **Problema:** A tela de Home parece mais espaçosa e "respirável", enquanto as workspaces parecem mais densas. O ritmo vertical quebra.

### 3. Listas (`InteractiveRow`) e Avatares/Ícones
* **Padrão Encontrado:** Extensivo e ótimo uso do `InteractiveRow` para todas as listas.
* **Divergência:** Os avatares/ícones no slot esquerdo possuem construtores manuais concorrentes.
  * No `Clients`, o avatar é construído com `w-10 h-10 bg-white/[0.03]`.
  * No `Finance`, o ícone do ledger é construído com `w-9 h-9 bg-white/[0.03]`.
  * **Problema:** Ao trocar de aba, o tamanho da zona de clique e o alinhamento da lista sofrem um micro-salto (pixel shifting) por causa do tamanho do ícone.

### 4. Cards de Destaque (`SurfaceCard variant="cinematic"`)
* **Padrão Encontrado:** O primeiro elemento de dados é sempre o Hero Card Cinematic.
* **Divergência:** O envelopamento de dados internos concorrem.
  * `Clients`: Bloco interno de dados usando `bg-black/20 border-white/[0.05] p-5`.
  * `Finance`: Bloco interno usando `bg-white/[0.025] border-white/[0.07] p-4`.
  * **Problema:** Um parece encovado (sombra interna preta) e o outro parece elevado (branco com borda). Dois produtos diferentes.

### 5. Formulários e Modais de Detalhe (Dossiês)
* **Divergência:** A forma como a navegação ocorre dentro de modais.
  * O `ClientsWorkspace` possui abas (`RESUMO`, `PATRIMÔNIO`, `CADASTRO`) baseadas em botões renderizados manualmente no modal.
  * Outras áreas podem utilizar blocos contínuos (`Stack`) sem tabulação.
  * **Problema:** Não há um componente `Tabs` oficializado para separar contexto, forçando cada desenvolvedor a recriar o padrão.

---

## 🛠 Proposta de Unificação (Sem Redesign)

1. **Unificar o Ritmo Vertical (Gaps):**
   * Padronizar o layout de TODAS as workspaces para espelhar a densidade da Home. O `ScreenContainer` filho deve ter sempre `<div className="flex flex-col gap-12">`. Subseções devem usar `gap-5`.
2. **Unificar a Hierarquia do Header:**
   * O `AppHeader` sempre deve conter apenas *Filtros de Contexto* (como Mês ou Local) no slot de ação? Ou sempre a *Ação Primária*? Sugestão: O Header carrega a configuração (Secundário), e as ações primárias (Ouro) vivem soltas coladas ao final do Hero Card, ou na Tactical Bar.
3. **Consolidar `InteractiveRow`:**
   * Criar variantes oficiais no componente: `iconSize="md" | "lg"` para que nenhum desenvolvedor precise reescrever o avatar (`w-10 h-10 rounded-xl`).
4. **Consolidar o Inner Card:**
   * Atualizar o `SurfaceCard` para ter um submódulo `<SurfaceCard.Inner>` garantindo que os painéis de saldo/LTV usem a mesma cor exata e padding em todo o app.
