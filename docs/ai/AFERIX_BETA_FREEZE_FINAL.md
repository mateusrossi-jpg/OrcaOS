# FECHAMENTO FINAL DO AFERIX — ESTABILIZAÇÃO BETA

Atue como Engenheiro Front-end Sênior, QA Engineer, UX Designer mobile-first e Arquiteto de Produto.

Estamos em feature freeze do Aferix.

NÃO adicionar novas funcionalidades.
NÃO criar novos templates.
NÃO mexer em monetização.
NÃO refatorar arquitetura inteira.
NÃO reescrever fluxo do zero.

Objetivo:
fechar o Aferix para beta estável, corrigindo apenas bugs críticos de uso, responsividade, touch, orçamento, PDF e relatório.

## 1. PRIORIDADE MÁXIMA: TOUCH MOBILE

Bug crítico:
o touch não funciona corretamente no iPhone/mobile.

Investigar e corrigir:
- overlays invisíveis;
- z-index incorreto;
- pointer-events;
- touch-action;
- body/html travando scroll;
- drawer/sidebar invisível bloqueando cliques;
- AferixIntro/splash cobrindo app;
- PDF preview bloqueando interação;
- elementos fixed/absolute ocupando tela toda;
- botões/cards sem área clicável adequada.

Critérios:
- menu abre e fecha por toque;
- botões respondem;
- cards respondem;
- scroll funciona;
- inputs focam;
- Próximo/Voltar funcionam;
- PDF preview não bloqueia o app.

## 2. ORÇAMENTOS

Corrigir:
- orçamento pendente deve abrir direto na edição;
- novo orçamento deve começar no ponto correto;
- fluxo não deve pular para etapa errada;
- cards devem crescer conforme conteúdo;
- campos devem autoajustar;
- inputs monetários devem formatar corretamente;
- lista de itens não pode sobrepor conteúdo.

Fluxo esperado:
Cliente → Atendimento/Serviço → Itens → Custos → Revisão → PDF

## 3. PDF DE SAÍDA

Corrigir PDF branco final.

O PDF deve:
- ser limpo;
- legível;
- profissional;
- A4;
- com preview mobile ajustado;
- sem cortes laterais;
- sem aparência de print do app;
- sem tabela crua;
- sem texto apagado.

Manter simples:
- cabeçalho;
- cliente;
- resumo;
- itens;
- total;
- observações;
- assinatura.

## 4. RELATÓRIOS

Corrigir apenas visual e responsividade.

Relatórios devem:
- abrir corretamente;
- não quebrar no mobile;
- usar cards proporcionais;
- ter leitura clara;
- não ter overflow horizontal;
- não parecer desktop comprimido.

Não adicionar métricas novas agora.

## 5. RESPONSIVIDADE GERAL

Corrigir:
- cards pequenos demais;
- blocos fixos;
- textos cortados;
- campos comprimidos;
- grids desktop no mobile;
- overflow horizontal;
- scroll travado.

Regras:
- mobile em coluna;
- cards width 100%;
- height auto;
- min-height apenas quando necessário;
- textareas autoexpansíveis.

## 6. VALIDAÇÃO OBRIGATÓRIA

Antes de alterar:
- ler arquivos reais;
- verificar package.json;
- verificar props reais;
- verificar CSS real;
- não assumir nada.

Arquivos prováveis:
- App.tsx
- AppShell.tsx
- AppShell.css
- AferixIntro.tsx
- HomeScreen.tsx
- BudgetsScreen.tsx
- ReportsScreen.tsx
- savedBudgetsStorage.ts
- CSS global

## 7. TESTE FINAL

Testar obrigatoriamente:
- abrir app;
- tocar no menu;
- navegar por todas abas;
- abrir orçamento;
- criar orçamento;
- editar orçamento pendente;
- preencher campos;
- adicionar item;
- remover item;
- gerar PDF;
- abrir relatório;
- voltar para Home;
- testar scroll no iPhone.

## 8. BUILD

Rodar:
- npm run build
- npm run lint se existir
- npm run test se existir

Corrigir erros reais.

## 9. ENTREGA FINAL

Ao final, entregar:
1. bugs corrigidos;
2. arquivos alterados;
3. testes feitos;
4. resultado do build;
5. pendências reais restantes.

Prioridade absoluta:
Aferix usável no iPhone, touch funcionando, orçamento funcionando, PDF legível e beta estável.
