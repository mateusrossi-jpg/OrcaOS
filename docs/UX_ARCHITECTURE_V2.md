# AFERIX — P107 OPERATIONAL UX ARCHITECTURE (V2)
**Visão Estratégica: ERP Operacional Premium Mobile-First**

## 1. Nova Arquitetura UX Global
O Aferix deixa de ser um "app de formulários e dashboards abstratos" para se tornar uma **Trilha Operacional**. A arquitetura UX agora é baseada em funis de trabalho. O usuário nunca deve se perguntar "para onde vou agora?", a interface deve conduzi-lo.

*   **Menos é Mais:** Remoção de abas secundárias. Foco total em 4 pilares: **Home (Pulse)**, **Orçamentos (Pipeline)**, **Financeiro (Controle)** e **Mais (Settings/Cloud)**.
*   **Ação no Rodapé:** O *Safe Area Bottom* e o *StickyActionBar* são os motores do app. Tudo que exige decisão do usuário deve estar acessível pelo polegar direito.
*   **Visibilidade Progressiva:** Informações complexas só aparecem quando a etapa atual exige.

## 2. Estrutura Ideal da HOME (Centro Operacional)
A Home (Pulse) não é um museu de gráficos, é uma **mesa de trabalho**.

**Hierarquia de Cima para Baixo:**
1.  **Kpi Principal (Hero):** Lucro do Mês (Estimado vs Realizado). Número grande, cor semântica.
2.  **Call to Action Primário:** Botão `[+ Novo Orçamento]` de fácil acesso.
3.  **Fila de Atenção (Alertas):** Orçamentos aguardando resposta do cliente há mais de 3 dias, OS com prazo estourando.
4.  **Agenda / Próximos Trabalhos:** Lista das Ordens de Serviço "Em Execução" ou "Autorizadas" para o dia/semana.
5.  **Atividade Recente:** Últimos 3 a 5 orçamentos tocados, com acesso rápido via clique direto no card.

## 3. Estrutura Ideal do FLUXO DE ORÇAMENTO (O Pipeline)
O orçamento deixa de ser um "Accordion" ou form longo e se torna um **Wizard Operacional** (Stepper) com 10 etapas claras. O usuário preenche uma tela por vez.

**As 10 Etapas:**
1.  **Identificação:** Título e tags.
2.  **Cliente:** Busca rápida na base ou preenchimento avulso.
3.  **Serviços & Catálogo:** Adição ágil com ajuste de quantidade inline.
4.  **Custos Diretos:** Materiais, frete, ajudantes.
5.  **Deduções:** Impostos, taxas de cartão, desconto comercial.
6.  **Margem & Preço:** Visualização da margem desejada vs preço final. Ajuste de markup.
7.  **Aprovação & Proposta:** Geração do link/PDF e botão "Marcar como Enviado". *[Pausa natural do fluxo]*
8.  **Ordem de Serviço (Execução):** Cliente aprovou. Abre-se o checklist, anotações de campo, diário de obra e evidências (fotos/materiais consumidos reais).
9.  **Fechamento:** Check final entre "Custo Orçado" vs "Custo Real".
10. **Arquivamento & Financeiro:** O lucro vira "Realizado" e alimenta o dashboard.

## 4. Estrutura Ideal da OPERAÇÃO (Execução de Campo)
Quando o status vira `EM_EXECUCAO`, o card do orçamento se transforma em uma **Ordem de Serviço (OS)** visual.

**O que o profissional vê em campo:**
*   **Cabeçalho Fixo:** Nome do cliente, endereço, telefone e botão rápido de "WhatsApp" ou "Navegar (Maps)".
*   **Checklist de Serviços:** O que deve ser feito (extraído da Etapa 3).
*   **Materiais Necessários:** Lista de compras/separação.
*   **Diário de Bordo:** Campo de texto rápido para anotar imprevistos.
*   **Botão de Ação:** `[Concluir Trabalho]` (gigante, na base).

## 5. Estrutura Ideal do FINANCEIRO (Controle Empresarial)
O financeiro abandona a visão de "feed de redes sociais" e adota uma postura de **Extrato Bancário Premium / DRE Simplificado**.

**Elementos Chave:**
*   **DRE de Bolso:** Receita Bruta, Deduções, Custos Operacionais e Lucro Líquido do mês atual.
*   **Filtro de Competência:** Navegação rápida entre os meses (Jan, Fev, Mar).
*   **Lançamentos (Extrato):** Lista limpa, separando Entradas (Verde) e Saídas (Vermelho).
*   **Previsão de Caixa:** Se houver orçamentos "Autorizados", mostrar o montante que está "A Receber".

## 6. Sugestões de Navegação (Mobile-First)
*   **Bottom Navigation Bar (Sempre visível):** 
    1. 🏠 Home
    2. 📑 Orçamentos
    3. 💰 Financeiro
    4. ⚙️ Mais
*   **Navegação Lateral Escondida:** Remover o *Drawer* lateral no mobile se possível, movendo tudo para a aba "Mais", reduzindo toques falsos.
*   **Fuga Rápida (Escape Hatch):** Todo modal, bottom-sheet ou tela de formulário deve ter um botão "X" ou "Voltar" óbvio no topo esquerdo, e poder ser fechado arrastando para baixo (Swipe to dismiss).

## 7. Organização Correta das Funções e Descoberta de Features
*   **Catálogo:** Não deve ser uma tela isolada. A descoberta do catálogo deve ocorrer *dentro* da Etapa 3 do orçamento. Um botão "Importar do Catálogo" ensina o usuário a usar.
*   **Backups e Sync:** Retirados do menu principal e confinados em "Configurações", pois são ações passivas/automáticas. O ícone de nuvem (`☁️`) nos cards ensina ao usuário que o app é cloud-ready.

## 8. Melhorias de Hierarquia Visual (Dark Premium)
*   **Regra do Contraste 60-30-10:** 60% fundo grafite (`var(--bg-app)`), 30% superfícies elevadas (`var(--bg-surface)`), 10% de brilho (`var(--brand-primary)`).
*   **Erradicação de Fontes Micro:** Nenhuma fonte no app terá menos de 12px. Textos de apoio terão contraste reduzido (`var(--text-muted)`), não tamanho microscópico.
*   **Touch Targets Implacáveis:** Qualquer elemento clicável terá no mínimo 48x48px de área interativa (invisível ou visível).
*   **Sem Sombras "Sujas":** As sombras no tema escuro serão opacas e baseadas em `rgba(0,0,0,0.6)` apenas para destacar modais. Cartões comuns usarão bordas sutis (`var(--border-soft)`) em vez de sombras.

## 9. Fluxo Premium Business ERP (A Sensação)
O Aferix deve soar **silencioso**. Um software barato grita pedindo atenção ("Clique aqui!", animações excessivas, cores berrantes). Um software premium apenas apresenta a ferramenta.
*   As animações devem ser rápidas (150ms a 200ms) e objetivas (Fade-in, Slide-up).
*   O feedback tátil (botões que afundam levemente `scale(0.96)`) garante a sensação de robustez.
*   O uso de "Monetary Inputs" alinhados à direita e com máscara profissional passa a sensação de precisão de uma fintech.
