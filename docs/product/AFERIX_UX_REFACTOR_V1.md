# AFERIX UX REFACTOR V1
**FIELD-FIRST, ONE-HAND, VALUE-FIRST**

## 1. Auditoria UX Completa (O Veredicto Bruto)
O Aferix, em sua concepção original, foi infectado pelo "Vídeo ERP" — a ideia de que um software corporativo precisa começar por formulários e painéis de controle. **Isto é um erro fatal para softwares operacionais de campo.** 
Em campo (sol, chuva, luvas, escadas), a carga cognitiva precisa ser próxima de zero. O usuário atual é punido com burocracia antes de receber a recompensa. A arquitetura atual cobra pedágio (cadastros) para deixar o técnico ver o que realmente importa: o laudo. Isso destrói a conversão e aumenta o abandono. O produto precisa inverter a lógica: o valor é entregue primeiro, a organização dos dados (CRM) vem depois, como consequência natural do uso.

---

## 2. Jornada Atual (O Caminho do Atrito)
1. Login
2. Ver Dashboard vazio (Métricas inúteis no D0).
3. Entender que precisa criar Cliente.
4. Digitar dados do Cliente -> Salvar.
5. Criar Local -> Salvar.
6. Criar Ativos (repetitivo) -> Salvar.
7. Criar OS, vincular Cliente, Local e Ativos.
8. Executar.
*TTV (Time To Value): 12 a 20 minutos.*
*Risco de Abandono: Crítico.*

## 3. Jornada Ideal (O Caminho do Valor)
1. Login
2. Tela: "NOVA OS EXPRESSA"
3. Digita apenas: "Shopping Central - Climatização"
4. App cria toda a árvore (Cliente/Local/OS) em background.
5. Técnico bate o dedo em "Tudo Conforme" para 10 ativos.
6. Assina.
7. Vê o PDF pronto.
8. Envia no WhatsApp.
*TTV (Time To Value): < 2 minutos.*
*Risco de Abandono: Quase Nulo.*

---

## 4. Fluxo Refatorado (Arquitetura "Do It Now")
A regra é **Valor Antes de Cadastro**. Nenhuma entidade (Cliente, Local, Ativo) deve bloquear a execução. O sistema deve suportar a criação "anônima" ou "temporária" em background e consolidar (merge) os dados no futuro, se o usuário assim desejar.

## 5. Arquitetura de Navegação Nova
Eliminar o menu "Pulso/Dashboard" como Home. A navegação base mobile deve ser:
*   **Hoje:** O que tenho pra fazer hoje? (Cards grandes, OS Expressa).
*   **Serviços:** Lista de OS em andamento/arquivadas.
*   **Histórico (PDFs):** O baú de troféus (Laudos entregues).
*   **Ajustes:** Paywall, Sync, Perfil.

## 6. Home Nova
Sem gráficos de faturamento no primeiro uso.
**Call to Action principal:** Botão gigantesco `[ INICIAR SERVIÇO ]`. A UI deve gritar "Ação", encorajando o técnico a começar a apertar botões.

## 7. Modo Técnico (Interface Restrita)
Se o usuário logado for de nível "Técnico", o app sofre uma mutação:
*   **Desaparece:** Financeiro, Faturamento, Custos, Contratos.
*   **Foca em:** Minha Agenda, OS do Dia, Assinatura, Reporte de Anomalias.
*   **Por quê?** O dono da empresa não quer que o técnico saiba quanto o contrato fatura. O técnico não quer ver botões que não pode usar.

---

## 8. OS Expressa
A maior arma de *Product-Led Growth (PLG)* da plataforma.
*   **Benefícios:** Destrói a barreira de entrada. Dopamina imediata.
*   **Riscos:** Banco de dados pode acumular "Clientes Lixo" (ex: Cliente Teste 1).
*   **Mitigação:** Uma rotina de limpeza ou consolidação no fechamento do faturamento. O risco vale 100% a pena pela conversão gerada.

## 9. Checklist Refatorado (Fadiga Operacional Zero)
*   **10 ativos:** Execução manual rápida.
*   **50 ativos:** Funcionalidade "Marcar Tudo Conforme". Trabalhar **por exceção** (o técnico só anota o que está quebrado).
*   **Ergonomia (One-Hand):** Remoção de inputs de teclado para números. Usar `QuickStepper` (botões gigantes de `+` e `-`).
*   **Swipe Navigation:** Deslizar para os lados para trocar de ativo, sem voltar para a lista (Redução de 50% dos cliques).
*   **Haptic:** O celular deve vibrar (`navigator.vibrate`) a cada check. O feedback tátil confirma a ação sem o usuário olhar para a tela sob o sol.

---

## 10. Estratégia de TTV (Time To Value)
O TTV atual do SaaS B2B é de dias. A meta do Aferix é **120 segundos**.
A injeção de dados via `DemoBootstrapService` e a `OS Expressa` garantem que qualquer eletricista ou mecânico gere um PDF real no meio da rua antes mesmo de colocar o cartão de crédito.

## 11. Estratégia de Paywall
*   **O pior momento:** Logo após criar a conta, antes de usar.
*   **O melhor momento:** Segundos após o sistema dizer "Laudo Gerado com Sucesso!". O usuário já investiu trabalho, viu o PDF incrível, está com a dopamina em alta e precisa enviar para o cliente.
*   **A Abordagem:** O primeiro laudo é de graça. O Paywall trava a criação da *segunda* OS, exigindo a assinatura (R$ 89/mês). Isso constrói confiança absoluta.

---

## 12. Módulos Ausentes (Oportunidades de Retenção Ocultas)
*   **Assinatura via Link (Touchless):** Enviar um link para o cliente assinar no próprio celular (clientes odeiam assinar com o dedo no celular sujo do técnico).
*   **Gestão de Retorno / Garantia:** Se um equipamento quebrou 15 dias após a visita, o sistema deve alertar que está em garantia (reduz dor de cabeça do dono da empresa).
*   **Câmera In-App Otimizada:** Tirar foto sem sair do app, com compressão nativa drástica para não estourar o banco de dados e acelerar o sync offline.
*   **Painel de Evidências (Antes/Depois):** Laudos focados puramente em justificar orçamentos através de fotos lado-a-lado.

---

## 13. Matriz de Priorização & Roadmap UX

### P0 - Bloqueadores de Conversão (Fazer Agora)
1. OS Expressa (Bypass de CRM).
2. Botão "Tudo Conforme" & Auto-save no Checklist.
3. Paywall reposicionado para *depois* da entrega do PDF.
*(Nota: Estes foram implementados na Sprint atual).*

### P1 - Aceleradores Operacionais (Próxima Sprint)
1. Swipe Navigation entre Ativos (Eliminar a necessidade de voltar à lista).
2. `QuickStepper` para inputs numéricos (Chega de teclados nativos irritantes).
3. Modo Técnico (Esconder financeiro para usuários peão).
4. Compressão inteligente de fotos In-App.

### P2 - Diferenciais Competitivos (Futuro)
1. Assinatura via Link (WhatsApp do cliente).
2. Módulo de Garantias e Retornos.
3. Dashboard Analytics apenas para a versão Desktop/Web (Gestor).

---

## 16. Veredicto Final

O Aferix deve parar imediatamente de tentar ser o "SAP" da manutenção e abraçar a sua vocação: ser o **"iPhone" das operações de campo**.

Técnicos não amam softwares, eles amam ir embora pra casa mais cedo. O Aferix será vendido porque reduz o tempo de preenchimento de papelada de 40 minutos para 4 minutos. 

**Ergonomia é a nova *feature* matadora.** Botões grandes, alto contraste, ausência de botão "Salvar", trabalho por exceção (marcar anomalias, não conformidades) e arquitetura offline-first. A partir de hoje, **nenhuma tela deve ser aprovada se um técnico não conseguir utilizá-la usando luvas de proteção, segurando uma escada com a outra mão, sob o sol do meio-dia.**
