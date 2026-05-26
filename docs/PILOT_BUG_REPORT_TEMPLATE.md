# Template de Reporte de Bug do Piloto — Aferix

Este modelo deve ser utilizado para documentar formalmente qualquer bug ou comportamento técnico incorreto identificado durante o piloto comercial controlado do Aferix **v0.1.0-rc.1**.

---

## 1. Informações Básicas do Bug
* **Título do Problema:** [Descrever de forma objetiva. Ex: "Botão de Concluir OS ocultado sob teclado no iPhone SE"]
* **ID do Bug:** BUG-RC1-XXXX
* **Módulo Afetado:** [ ] Clientes  [ ] Orçamentos  [ ] OS/Execução  [ ] Fila Offline  [ ] Relatórios  [ ] Configurações

---

## 2. Severidade & Impacto

### Severidade:
* [ ] **Crítica:** Perda de dados, erros matemáticos no motor financeiro ou crash geral irremediável.
* [ ] **Alta:** Funcionalidade principal quebrada sem workaround simples.
* [ ] **Média:** Bug funcional com workaround disponível ou desalinhamento de viewport.
* [ ] **Baixa:** Erro estético, erro de ortografia ou atraso visual de render.

### Prioridade:
* [ ] **P0 (Imediata):** Bloqueia a continuidade dos testes com os outros usuários.
* [ ] **P1 (Urgente):** Deve ser corrigido antes de liberar a versão final comercial.
* [ ] **P2 (Normal):** Pode ser postergado para a próxima sprint/beta público.

---

## 3. Ambiente de Reprodução
* **Aparelho:** ________________________ (Ex: iPhone XR, Motorola G54)
* **Sistema Operacional:** ________________________ (Ex: iOS 16.5, Android 13)
* **Navegador:** ________________________ (Ex: Safari Mobile 16, Chrome Mobile 120)
* **Estado de Conectividade:** [ ] Online Wi-Fi  [ ] Offline  [ ] Transição de Rede (Drops)

---

## 4. Passos para Reproduzir o Problema
1. ____________________________________________________________________________
2. ____________________________________________________________________________
3. ____________________________________________________________________________

---

## 5. Resultados
* **Resultado Esperado:** ____________________________________________________________________________
* **Resultado Obtido:** ____________________________________________________________________________

---

## 6. Diagnóstico Técnico (Logs e Prints)
* **Log do Console (`[PilotMetrics]` ou browser logs):**
  ```json
  [Insira o log colado ou dados de telemetria aqui]
  ```
* **Imagens de Evidência:**
  [Anexe a captura de tela ou descreva a falha visual]

---

## 7. Questionário de Governança
* **Bloqueia a continuação do Piloto?** [ ] Sim  [ ] Não
* **Causa perda ou corrupção de dados?** [ ] Sim  [ ] Não
* **Afeta cálculos matemáticos do motor financeiro?** [ ] Sim  [ ] Não
* **Afeta fisicamente a operação de campo do técnico?** [ ] Sim  [ ] Não

---

## 8. Decisão Técnica Final (Facilitador/Suporte)
* [ ] **Corrigir antes de continuar:** O piloto está suspenso para este usuário até a correção ser implantada.
* [ ] **Aceitar no piloto:** Bug de baixo impacto, o teste continuará registrando o workaround.
* [ ] **Investigar depois:** Falha de difícil reprodução, catalogada para posterior auditoria profunda.
