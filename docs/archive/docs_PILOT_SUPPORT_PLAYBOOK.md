# Playbook de Suporte e Diagnóstico do Piloto — Aferix

Este guia tem como objetivo fornecer ao facilitador e ao suporte do Aferix **v0.1.0-rc.1** soluções rápidas para os problemas e dúvidas operacionais mais comuns encontrados pelos prestadores durante a fase de testes reais.

---

## 1. Problemas e Soluções Rápidas

### Sintoma A: O Aplicativo Não Abre (Tela Totalmente Preta ou Branca)
* **Causa provável:** Versão desatualizada do navegador do celular ou cache local de versões legadas corrompido.
* **Solução recomendada:**
  1. Forçar a redefinição de dados locais do navegador (Chrome ou Safari) conforme seção *Como Resetar Dados Locais* do manual de instalação.
  2. Certificar-se de que o dispositivo móvel suporta os requisitos mínimos de navegadores (iOS >=15 ou Android >=9).

### Sintoma B: O Celular Não Consegue Acessar a URL de Preview
* **Causa provável:** Celular e Computador Host não estão conectados **exatamente na mesma rede Wi-Fi local**, ou o firewall do computador está bloqueando a porta de preview (`4173` ou `5173`).
* **Solução recomendada:**
  1. No computador, verifique se a rede Wi-Fi selecionada é a mesma do celular (redes 5G e 2.4G com o mesmo nome às vezes operam isoladas dependendo do roteador).
  2. Verifique se o IP inserido no celular condiz exatamente com o IP fornecido pela linha `Network URL` no terminal de preview.
  3. Desative temporariamente o Firewall do sistema operacional do computador host para testar.

### Sintoma C: Orçamentos Criados "Sumiram" ao Atualizar a Página
* **Causa provável:** O navegador limpou o IndexedDB (Dexie) por falta de espaço em disco no celular, ou o teste foi executado em Modo de Navegação Anônima (que bloqueia o Dexie em alguns dispositivos).
* **Solução recomendada:**
  1. Certifique-se de que o testador **não está usando guias anônimas/privadas** no Safari ou Chrome.
  2. Verifique se há espaço disponível para armazenamento no aparelho móvel.

### Sintoma D: O Aplicativo Travou no Meio de uma Edição
* **Causa provável:** Erro de runtime isolado (unhandled boundary error).
* **Solução recomendada:**
  1. O Aferix conta com o `RuntimeErrorBoundary` integrado. Caso uma tela trave, observe o card vermelho de recuperação e clique em **Recuperar App**. Isso restaurará a viewport sem perder o cache Dexie de atendimentos criados.
  2. Se a travada persistir, recarregue a página (F5/Reload).

### Sintoma E: Valores Matemáticos nos Relatórios Estão Diferentes da Criação
* **Causa provável:** O orçamento de teste ainda está com status "Rascunho" ou "Enviado". Os relatórios de faturamento consolidam **apenas orçamentos finalizados/congelados** para fins de lucros reais realizados.
* **Solução recomendada:**
  1. Acesse o Histórico de Orçamentos.
  2. Clique no orçamento em questão, mude o status para "Autorizado" e transicione até "Finalizar e Congelar".
  3. Retorne à aba de Relatórios e observe a consolidação.

### Sintoma F: Evidências Permanecem Pendentes na Fila por Muito Tempo
* **Causa provável:** Celular continua sem internet ou o restabelecimento da conexão local foi lento demais.
* **Solução recomendada:**
  1. Verifique as configurações de rede do celular.
  2. Faça uma pequena interação no app (como transicionar de aba) para forçar o esvaziamento silencioso do `evidenceUploadQueue`.

---

## 2. Procedimento de Coleta de Evidências de Bug

Sempre que um testador reportar um bug crítico em campo:
1. **Captura de Tela:** Solicite um print ou gravação de tela com o problema.
2. **Coleta de Telemetria de Uso:**
   * Vá em *Configurações > Segurança > Telemetria de Uso*.
   * Copie o relatório JSON do `PilotUsageMetrics` e envie para o WhatsApp de suporte técnico.

---

## 3. Diretrizes de Governança Técnico-Comercial

### Quando Decidir Encerrar o Teste Prematuramente (Interrupção Crítica):
* Se o IndexedDB (Dexie) corromper dados repetidamente, impedindo que o prestador realize orçamentos básicos.
* Se houver qualquer divergência superior a R$ 0,01 no lucro matemático de orçamentos calculados após a finalização.
* Em caso de superaquecimento extremo do smartphone de campo devido a render storms.

### Quando Registrar um Bug Crítico no Time de Desenvolvimento:
Se os testes passarem mas o usuário apontar que uma etapa do design mobile-first impede fisicamente o encerramento do serviço (ex: botão de concluir inacessível sob viewports pequenas), o bug deve ser registrado e corrigido imediatamente antes do próximo técnico iniciar.
