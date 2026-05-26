# Registro de Sessão do Piloto Comercial — Aferix

Este diário estruturado foi preenchido pelo facilitador técnico durante o acompanhamento em tempo real das sessões com os usuários testadores do Aferix **v0.1.0-rc.1**.

---

## 1. Dados Gerais da Sessão
* **Data do Teste:** 26/05/2026
* **Horário de Início:** 11:15 | **Horário de Término:** 12:13
* **Duração Total da Sessão:** 58 minutos
* **Usuário Testador:** Ronaldo Silva (Eletricista autônomo, 42 anos)
* **Cenário de Teste Executado:** [x] Cenário 1 (Orçamento)  [x] Cenário 2 (OS/Campo)  [x] Cenário 3 (Offline)

---

## 2. Telemetria de Tempos Operacionais
Registre a minutagem de conclusão de cada marco operacional a partir do início da sessão:

* **Tempo até a criação do primeiro orçamento:** 7 minutos (incluindo onboarding rápido)
* **Tempo até a primeira aprovação (OS criada):** 14 minutos
* **Tempo até o início da primeira execução em campo:** 21 minutos
* **Quantidade de evidências anexadas:** 2 fotos
* **Teste Offline Realizado?** [x] Sim  [ ] Não
* **Reconexão de Rede Validada?** [x] Sim  [ ] Não

---

## 3. Registro Qualitativo de Comportamento

### Frases Reais Ditas pelo Usuário (Verbatim):
* *"Caramba, a margem de lucro atualiza na hora que eu digito o valor do ajudante! Isso é maravilhoso, nenhum app faz isso."*
* *"O preto escuro com dourado ajuda muito a ver na luz do sol quando estou no telhado ou na rua. App claro dói a vista."*
* *"Gostei que posso tirar foto mesmo sem internet. Geralmente em subsolo de prédio não pega nada, mas o app não travou."*
* *"O botão de 'Finalizar Orçamento' é bem grande e amarelo, impossível não achar. But fiquei em dúvida se podia digitar o nome do cliente direto no campo embaixo do seletor."*

### Dúvidas Levantadas pelo Testador:
* *"Se eu trocar o preço final, o imposto de 6% recalcula sozinho também?"* (Sim, explicado pelo facilitador).
* *"Como eu faço se o cliente não estiver na lista cadastrada? Ah, tem esse campo livre aqui embaixo..."* (Sugeriu tornar o fluxo de cliente novo mais unificado).

### Pontos de Fricção Observados (Dificuldades):
* **Fricção de Cadastro de Cliente (9s):** Hesitou por 9 segundos no seletor de cliente antes de perceber que podia usar a caixa de texto livre logo abaixo para inserir o nome diretamente.
* **Fricção de Contraste sob Luz Solar:** Ao simular a iluminação forte de campo, percebeu que as legendas dos campos de custos (`Materiais`, `Ajudante`) que usam cinza escuro ficam levemente apagadas, sugerindo maior contraste.
* **Fricção de Viewport no Teclado Móvel:** Ao abrir o teclado para preencher o preço do serviço, o rodapé fixo de lucro real ficou temporariamente sobreposto, mas reajustou corretamente após fechar o input.

### Pontos de Alto Valor Percebidos (Uau!):
* **Cálculo em Tempo Real:** Reação extremamente positiva ao ver a margem flutuando instantaneamente de 100% para 61.5% ao inserir os custos.
* **Robustez Offline:** O usuário colocou em modo avião e tirou foto de evidência da OS. Ao religar a rede, viu que os envios pendentes sumiram silenciosamente da fila local sem duplicar registros no histórico.
* **Visual Dark Premium:** O design industrial OLED combinou com a estética de ferramentas profissionais robustas que Ronaldo utiliza.

---

## 4. Governança de Problemas Técnicos

### Problemas Percebidos de UX:
* **UX-01:** Rótulo do campo livre de cliente redundante com o dropdown. Sugerido tornar o campo de texto livre um fallback elegante apenas se "Cliente Avulso/Outro" for selecionado.
* **UX-02:** Contraste baixo das legendas dos inputs de custos no celular sob sol forte.

### Bugs Confirmados no Dispositivo:
* **BUG-01 (Baixa):** Pequeno delay estético no redimensionamento da janela gráfica do visualizador de PDF (BudgetPrintPreview) ao alternar entre orientações Retrato e Paisagem no Safari Mobile.

---

## 5. Decisão Pós-Sessão (Próximos Passos)
* [ ] **Homologado:** O usuário completou a jornada móvel de campo com louvor e o app está livre de atritos críticos.
* [x] **Ajustes cosméticos pendentes:** Necessário polimento de textos ou rótulos secundários (resolução das fricções UX-01 e UX-02 de contraste/cliente).
* [ ] **Re-teste exigido:** Sessão abortada devido a falhas críticas funcionais. Re-testar após a correção do backlog.
