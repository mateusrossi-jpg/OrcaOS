# AFERIX ASSET 360 AUDIT

## AUDITORIA DE VISÃO DE ATIVO (EQUIPAMENTO)

### Descoberta e Acesso
* **Tempo para encontrar a tela:** Falha (> 5s). O acesso a ativos só acontece de forma reativa após encerramento de OS ou profundamente escondido.
* **Tempo para descobrir informações na tela (quando aberta):**
  * **Health Score:** < 1 segundo. Visível em vermelho (ex: 42/100).
  * **Garantia:** < 1 segundo. Card amarelo claro "Expira: Out/2026".
  * **Última Manutenção:** < 2 segundos. Timeline de "Prontuário do Equipamento" mostra histórico cronológico (ex: "PMOC - Manutenção Prev.").
  * **Reincidência:** < 1 segundo. Alerta na timeline e "MTBF" em nível crítico logo no cabeçalho.
  * **Histórico:** < 1 segundo. Timeline clara.

### Veredito
A tela `Asset360Page` é o estado da arte do sistema. Informações essenciais para suporte (Garantia, MTBF e Health Score) são processadas em milissegundos.

**PROBLEMA (P0):** Assim como o Cliente, o Ativo não tem acesso primário. Se o técnico está na frente da máquina e quer abrir o prontuário dela via QR Code ou busca, não existe caminho rápido e óbvio a partir do Pulse. O Asset 360 precisa ser integrável via busca global ou scanner.
