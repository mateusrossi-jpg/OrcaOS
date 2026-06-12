# AFERIX — PLANO DE 30 DIAS PARA PRIMEIRA RECEITA
**Status:** CONGELADO E RATIFICADO  
**Métrica do Sucesso:** R$ 89,00 recorrentes cobrados no cartão do primeiro prestador de climatização antes do Dia 30.

---

## 📅 ROTEIRO SEMANAL DE EXECUÇÃO PRAGMÁTICA

Para garantir que o Aferix monetize nos próximos 30 dias, toda a capacidade de engenharia será canalizada em eliminar os pontos quebrados da jornada operacional. Segue o cronograma semanal de prioridade absoluta:

---

### 🔨 SEMANA 1: PREPARAÇÃO DA BASE E ERGONOMIA DE CAMPO (Foco: Retirar Atrito)
* **Objetivo:** Garantir que o técnico consiga abrir o app pela primeira vez e preencher uma vistoria PMOC demonstrativa em menos de 30 segundos.
* **Tarefas Técnicas de Engenharia:**
  1. **Injeção de Carga no Bootstrap (Zero-friction DB):** Atualizar `dexieDatabase.ts` para carregar dados fictícios no primeiro login (1 Cliente Ativo, 2 Aparelhos de ar-condicionado de exemplo e 1 Cronograma ativo).
  2. **Pré-população do Checklist Regulamentar ANVISA:** Pré-carregar a tabela local de checklists com a especificação técnica completa da Portaria MS nº 3.523/98 e da Resolução RE nº 9/03 da ANVISA.
  3. **Ergonomia Industrial de Toque:** Revisar e expandir os botões de resposta dos checklists (`SIM` / `NÃO` / `N.A`) na UI para garantir altura física mínima de `44px` com margem adequada para cliques com luvas de campo ou tela molhada no celular.

---

### 📄 SEMANA 2: MOTOR DE EMISSÃO DE LAUDO TÉCNICO PMOC (Foco: A Entrega Física)
* **Objetivo:** O técnico deve conseguir exportar um PDF impecável de PMOC contendo as assinaturas e termos regulamentares para enviar imediatamente pelo WhatsApp de seu cliente.
* **Tarefas Técnicas de Engenharia:**
  1. **Componente de Assinatura Táteis:** Ajustar o componente Canvas de coleta de assinatura digital em campo, garantindo compatibilidade de toque perfeita para celulares Android simples e iPhones (resolvendo problemas de scrolling ou bloqueio de toque no iOS).
  2. **PDF PMOC Generator Engine:** Construir o template de PDF específico de PMOC regulamentar ANVISA no `@react-pdf/renderer` em substituição ao layout comercial de orçamentos.
  3. **Mapeamento de Responsabilidade Técnica (CRT/CREA):** Adicionar campos na tela de perfil técnico e no cabeçalho do PDF para que o técnico insira seu número de registro profissional e o laudo saia blindado juridicamente.

---

### 🔒 SEMANA 3: SEGURANÇA DE CLOUD E PORTÃO DE PAGAMENTO (Foco: Monetização e Confiança)
* **Objetivo:** Blindar os dados do técnico contra perdas e habilitar o faturamento automático Stripe do plano recorrente.
* **Tarefas Técnicas de Engenharia:**
  1. **Hardening de Sincronismo Cloud:** Ativar a replicação unidirecional de eventos do Dexie para o Supabase PostgreSQL, garantindo que o backup rode em silêncio a cada transação finalizada de OS, exibindo o indicador de LED verde de segurança.
  2. **Trial Engine Scheduler:** Criar a regra de checagem de data de criação da conta. Se a conta ultrapassar 14 dias de cadastro, redirecionar o usuário para a interface de Paywall.
  3. **Stripe Checkout Paywall Integration:** Montar a tela de faturamento em Preto OLED contendo a proposta de valor irrecusável e o botão de checkout Stripe / Pix Recorrente conectado à conta comercial Aferix.

---

### 🚀 SEMANA 4: LANÇAMENTO GTM COM ENGENHARIA DO TRETCHO (Foco: Fechar e Cobrar)
* **Objetivo:** Fechar de forma ativa a primeira venda recorrente com o ICP focado, acompanhando pessoalmente a vistoria para garantir sucesso absoluto de usabilidade.
* **Ações Comerciais do Fundador (Zero CAC):**
  1. **Abordagem de WhatsApp Direta:** Entrar em 5 grupos de climatização e refrigeração no WhatsApp e abordar de forma privada instaladores regionais:
     > *"Amigo, sou desenvolvedor do Aferix. Fizemos um aplicativo simples para celulares Android/iOS que gera o laudo PDF PMOC padrão ANVISA completo com assinatura digital em 2 minutos na casa de máquinas e acaba com a digitação no computador à noite. Liberei seu acesso Pro sem custo por 14 dias. Me passa sua logo e o seu CFT que eu mesmo cadastro sua conta aqui pra você testar amanhã."*
  2. **Implantação Assistida (Acompanhamento no Trecho):** O fundador agenda e acompanha fisicamente o técnico em sua primeira vistoria mensal real em campo. Observa atritos de uso e faz ajustes de bugs no mesmo dia.
  3. **Fechamento e Emissão do PIX/Stripe:** Assim que o cliente do técnico recebe o primeiro PDF PMOC limpo e assinado por e-mail no final da vistoria e elogia a prestadora, o fundador faz o fechamento comercial no Stripe.
