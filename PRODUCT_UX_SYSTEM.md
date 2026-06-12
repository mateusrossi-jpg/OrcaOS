# Aferix — UX/UI Design System

> [!IMPORTANT]
> A partir da V12, toda a governança visual do sistema é regida pela [Constituição da Home e do Header](./PRODUCT_HOME_HEADER_CONSTITUTION.md). A Home serve como a tela-mãe de design do sistema e o Header é o componente global unificado obrigatório para todas as telas.

## 1. Visual Aesthetics (AFERIX V12 — OWNER UX REFINEMENT)
O Aferix V12 consagra o layout de um "software de wireframe" para um **Field OS Comercial Premium**. Ele equilibra legibilidade sob luz solar, ergonomia tátil extrema e volumetria visual de altíssima confiabilidade:

* **Background Canvas:** Gradiente linear vertical suave `#2C2C2E 0%` a `#262628 100%` (sem ruído/textura).
* **Surface / Variation:** `#363638` — Nível de profundidade dos cards secundários, indicadores de apoio e módulos.
* **Cards / Elevated:** `#3A3A3C` — Nível de profundidade do Card de Missão em Foco e Campo de Busca.
* **Borders:** Sem bordas visíveis por padrão em cards normais. Bordas são restritas a:
  * Campos de entrada de texto (Inputs)
  * Estados selecionados (Selected/Active)
  * Foco de interação (Focus/Hover)
* **Shadow Scale (Sombras e Profundidade):**
  * Cards normais/módulos: `box-shadow: 0 4px 16px rgba(0,0,0,0.12)`
  * Card de Missão em Foco: `box-shadow: 0 8px 24px rgba(0,0,0,0.16)`
  * Floating Nav Bar (Dock): `box-shadow: 0 12px 32px rgba(0,0,0,0.35)`
* **Floating Glassmorphic Dock (Aferix V12):**
  * Posicionado de forma flutuante em `bottom-[env(safe-area-inset-bottom)+12px]` com largura `w-[calc(100%-32px)] max-w-[390px]`.
  * Visual de cápsula arredondada (`rounded-[20px]`) e contorno brilhante (`border border-white/8%`).
  * Rótulos do menu reduzidos para `text-[10px] font-semibold tracking-wider` para evitar qualquer possibilidade de quebra de texto em dispositivos menores.
* **Tactility System (Física de Toque):**
  * Todos os botões interativos e cards dinâmicos utilizam a física `.aferix-tactile-card`.
  * Micro-elevação vertical em hover (`hover:-translate-y-0.5`) e diminuição de escala em toque/clique (`active:scale-[0.975]`).
* **Text Hierarchy:**
  * **Título Principal / Valor Métrico:** `text-[24px]` (Substituindo o antigo `32px` para evitar sensação de aperto).
  * **Subtítulo / Descrição Principal:** `text-[15px]` (Corpo dos cards e listas).
  * **Informação Auxiliar / Meta-dados / Section Headers:** `text-[13px]` ou `text-[12px]`.
* **Colors & Contrast:**
  * **Primary Text:** `#FFFFFF` (Restrito a títulos e métricas principais).
  * **Secondary Text:** `#C7C7CC` (Corpo de texto e subtítulos).
  * **Muted Text:** `#8E8E93` (Pequenos rótulos e informações de apoio).
* **Color-Coded Indicators (Destaque Operacional):**
  * **Verde (`#30D158`):** Receitas, recebimentos acumulados e valores de oportunidades (lucro potencial).
  * **Amarelo (`#FFD60A`):** Itens que requerem atenção imediata (ex. orçamentos enviados).
  * **Vermelho (`#FF453A`):** Atrasos operacionais ou pendências financeiras vencidas.
* **Primary Action (CTA):** `#FFFFFF` com texto `#2C2C2E` (`font-bold`, `h-14` (56px) e `rounded-full` ou `rounded-[16px]`). Botão sólido branco de altíssimo contraste, encontrado instantaneamente.
* **Garantia de Não-Transbordo (Auto-Scale):** Valores monetários longos e títulos possuem limites de largura (`max-w`), quebras inteligentes (`break-words`) e truncamento (`truncate`) para garantir que NENHUM número escape das bordas dos containers.

## 2. Componentes & Regras de Destaque
* **Card da Missão (Hero Card):** Altura reduzida em 30% para melhor aproveitamento do espaço mobile. O valor estimado (`text-[24px]`) fica alinhado inline com o título da OS. Os botões de ação ("Detalhes" e "Iniciar Rota") são posicionados lado a lado no rodapé do card.
  * **Estado Vazio (Empty State):** Centralizado visualmente com o selo `✓ LIVRO LIMPO`, subtexto `Nenhuma OS pendente hoje` e botão principal de criação de OS destacado no centro como um **botão pílula** (`rounded-full w-auto px-10 h-14`).
* **Busca Global (Estilo ChatGPT iOS):** Reconstruída como um container flex-row horizontal slim (`h-12`, `rounded-[14px]`, `bg-[#3A3A3C]`, `px-4`), com o ícone de busca menor (`size={18}`) alinhado à esquerda e o input de texto (`text-[15px]`) ocupando o restante do espaço.
* **Unificação de Cards e Módulos:** Todos os cards secundários (Oportunidades, A Receber, Orçamentos, Clientes, Financeiro, Ajustes) são obrigados a possuir a mesma altura (`min-h-[150px]`), mesmo alinhamento e mesmo espaçamento interno (`p-6`), mas com textos 20% menores para criar grande sensação de respiro interno e controle.
* **Header Unificado com Menu:** Exibe o botão de menu hambúrguer (`.aferix-menu-btn` com ícone `Menu` de `size={22}`), a logo `AFERIX` (`text-[20px] font-black` tracking `0.25em` uppercase) e o status `Online` com indicador pulsante de batimento no lado direito.
* **Menu Retrátil (Side Drawer):**
  * Drawer de navegação flutuante lateral (`.side-drawer`) que desliza da esquerda para a direita.
  * Ocupa `width: 300px` e `height: 100dvh` com fundo escuro sólido `var(--bg-surface)` (`#363638`) e sombra física proeminente.
  * Inclui um backdrop escuro transparente desfocado (`.drawer-backdrop` com `backdrop-filter: blur(6px)`) posicionado em `zIndex: 1090` que fecha o menu ao ser clicado/tocado.
  * Contém dois grupos de navegação: "Navegação Principal" (sincronizada com as abas do papel/role ativo) e "Módulos do Sistema" (links rápidos para recursos avançados como Atlas, Caixa, Diagnósticos, PMOC/Checklists, Equipamentos, Reputação, Next Money).
* **Espaçamento e Respiro:** O espaçamento global vertical entre seções da Home é ampliado para `gap-10` (40px) para proporcionar clara separação entre as categorias.

## 3. Interaction & Mobile Rules
* **Regra dos 3 Segundos:** Ao abrir o aplicativo, em no máximo 3 segundos, o operador deve identificar claramente:
  1. Qual é sua próxima ação (missão ou criação de OS).
  2. O que está pendente (propostas/pendências).
  3. Quanto dinheiro existe na operação (valores de oportunidade e contas a receber).
* **Prevenção de Toques Duplos:** Alvos de toque com área mínima de **44px por 44px**. Rótulos de formulário legíveis e visual limpo.


