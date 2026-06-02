# AFERIX ASSET TIMELINE AUDIT V1
**Transformando Cadastros Estáticos em Organismos Vivos (O Prontuário Médico)**

## 1. Asset Timeline Architecture (A Estrutura Viva)
Hoje, um equipamento no Aferix é um formulário com marca, modelo e potência. Isso não tem valor. O valor real de um ativo para uma empresa de engenharia e manutenção é o seu **comportamento ao longo do tempo**. A arquitetura do Asset Timeline (O Facebook da Máquina) converte o Ativo no Agregador Raiz (*Aggregate Root*) de uma trilha de eventos. 
Quando o ativo "nasce" no sistema (Instalação ou Primeiro Cadastro), ele ganha um feed infinito onde cada interação gera um snapshot permanente. Toda Ordem de Serviço, toda peça trocada, toda anomalia reportada será um nó indexado nesse feed. 

## 2. Timeline UX (O Facebook do Equipamento)
O técnico em campo precisa de contexto cirúrgico rápido. 
A UI é composta por:
1.  **O Cabeçalho do Paciente:** Nome, Tag (`AC-045`), QR Code rápido, Foto principal e o **Health Score** destacado.
2.  **Filtros Rápidos (Pílulas):** `[Tudo]`, `[Anomalias]`, `[Corretivas]`, `[Garantias]`, `[Fotos]`.
3.  **O Feed Vertical:** Uma timeline cronológica com ícones de fácil escaneamento (ex: Chave de fenda para corretiva, Calendário para preventiva, Câmera para evidência fotográfica).
4.  **Custo Acumulado Total (TCO):** Informação fatal para o dono da empresa negociar renovações de contrato (ex: "Já gastamos R$ 8.500 arrumando esta máquina, melhor trocar").

## 3. Timeline Events (O Que Entra no Feed)
Cada nó na linha do tempo deve ter uma hierarquia visual baseada no peso do evento.

*   🗓️ **Preventiva Realizada:** "Manutenção Mensal concluída por João" (Card Verde, Baixo impacto).
*   ⚠️ **Anomalia Registrada:** "Vazamento de fluido refrigerante" (Card Laranja, Alto impacto, Exibe a foto expandida no feed).
*   🔧 **Corretiva Finalizada:** "Substituição do Compressor" (Card Azul, Mostra as peças trocadas e o custo).
*   🛡️ **Garantia Acionada:** "Retorno em Garantia - Carga de Gás" (Card Vermelho, Mostra prejuízo assumido).
*   📄 **Contrato Adicionado/Renovado:** "Ativo incluído no PMOC Shopping".

## 4. Health Engine (O Score da Saúde)
Uma métrica sintética de 0 a 100 exibida em destaque. 
*   **100 - 80 (Verde):** Manutenções em dia, falhas quase inexistentes.
*   **79 - 50 (Amarelo):** Histórico de anomalias frequentes ou idade avançada.
*   **Abaixo de 50 (Vermelho):** O "Suga-Lucro". Equipamento que quebra demais, custa caro manter e estraga o indicador (SLA) do contrato.
Essa métrica é calculada no cliente com Dexie baseada na razão entre intervenções preventivas *versus* corretivas dos últimos 12 meses.

## 5. Warranty Engine (O Guardião do Caixa)
As garantias não devem depender da memória humana. O motor de garantia do Aferix opera nos bastidores da Timeline:
*   Se o evento de tipo "Corretiva" (Ex: Troca de Placa) ocorre no dia 01/01/2026.
*   O Aferix liga um cronômetro invisível de 90 dias amarrado àquela OS e àquele ativo.
*   Se no dia 15/02/2026 outro técnico marca uma anomalia elétrica no mesmo equipamento, um modal bloqueante aparece: **"⚠️ Atenção: Placa trocada há 45 dias por Roberto. Esta máquina está coberta pela OS #409. Confirmar acionamento de garantia?"**
*   Isso impede faturamentos indevidos que geram brigas com clientes, ou pior: impede que o dono pague por uma peça que estava coberta pelo fabricante.

## 6. Predictive Readiness (A Fundação para IA Futura)
A verdadeira força estrutural desta timeline é o armazenamento determinístico.
O Aferix deixará de ser reativo e passará a ser preditivo. Quando tivermos dezenas de milhares de Timelines gravadas, um modelo de IA poderá inferir: *"Aferix alerta: Equipamentos da marca X, modelo Y, instalados no litoral, tendem a falhar o compressor na marca de 3,2 anos. Agende uma preventiva profunda."*
Ao tratar cada item do checklist e cada falha como um objeto imutável, pavimentamos o banco de dados para treinar LLMs operacionais no futuro.

---

## 7. Estrutura de Dados (Dexie Indexing & Performance)
A performance precisa ser absurda (Offline-First).
**Índices recomendados para busca ultra-rápida (V19/20):**
`assetTimelineEvents`: `id, assetId, timestamp, eventType, companyId, workspaceId`
A busca por `assetId` ordenada por `timestamp` inverso garantirá que, mesmo com 1000 intervenções em uma máquina, a timeline carregue em < 50 milissegundos localmente.

---

## 8. Final Executive Verdict (O Maior Fosso Competitivo do Software)
Nós estamos criando um "Lock-in" brutal de valor. 
Se uma empresa usa o Aferix por 3 anos para gerenciar o Shopping Central, a **Timeline dos Ativos se torna tão rica e vital que é impossível trocar de software**. Pior ainda para o contratante: O Shopping não pode demitir a empresa de manutenção, porque a empresa tem o "prontuário médico" de cada chiller e bomba de água do prédio gravados em anos de histórico impecável.
**A Timeline não é uma *feature*. A Timeline é o patrimônio de dados do usuário.** Ela vende renovações de contrato sozinha. Deve entrar como foco assim que a Máquina de Receita (P0) estiver estabelecida.
