# AFERIX OBSERVABILITY PROTOCOL
MISSÃO: CAPTURAR A VERDADE OPERACIONAL DO USUÁRIO

## 1. Mandato: Observation Only
* **Papel:** Observador Silencioso.
* **Regra do Silêncio:** Identificou? Não corrija. Registre no `AFERIX_OBSERVATION_LOG.md`. Meça a frequência e o impacto.
* **Critério de Decisão:** Nenhuma melhoria sem evidência (Regra dos 3 Eventos).

## 2. Perguntas-Chave (A Verdade Operacional)
1. O operador abre o Aferix espontaneamente?
2. O operador conclui o trabalho 100% dentro do sistema?
3. Onde o operador abandona o sistema?
4. O Aferix substituiu ferramentas externas (WhatsApp/Excel/Papel)?
5. O operador sentiria falta se o Aferix sumisse amanhã?

## 3. Telemetria Enxuta (Prioridades)
* **P1 — FUGAS:** Saídas para ferramentas externas.
* **P2 — CENTRALIDADE:** Qual é o verdadeiro painel principal.
* **P3 — IGNORADOS:** Módulos que não geram valor evidente.
* **P4 — BLOQUEIOS:** Apenas o que impede a operação (Permitido corrigir).

## 4. Moment of Truth (Indispensabilidade)
* **Objetivo:** Descobrir se o operador sentiria falta do Aferix se ele desaparecesse.
* **Teste da Falta:** O que o usuário perderia? Qual atividade voltaria para o papel/Excel?
* **Teste de Centralidade:** Qual sistema é aberto primeiro ao iniciar o dia e consultado por último antes de encerrar?
* **Teste de Substituição:** Mapear se o Aferix substituiu efetivamente:
    - Excel
    - WhatsApp (Controle)
    - Papel/Calculadora
* **Teste de Cobrança:** Você pagaria para continuar usando? (Indispensável | Me ajuda | Só se for barato | Não pagaria).
