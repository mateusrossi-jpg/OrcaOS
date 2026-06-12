# Relatório de Resultados do Piloto (Pilot Outcome Report)

Este documento sumariza os resultados empíricos da primeira sessão real de campo do Aferix com um prestador autônomo (Pilot 1).

## 1. Dados da Sessão
* **Perfil do Usuário:** Eletricista autônomo, 42 anos (Ronaldo Silva)
* **Aparelho:** Dispositivo Móvel (Simulado)
* **Navegador:** Safari Mobile
* **Tipo de Serviço:** Conserto de fiação (Criação de Orçamento e OS)
* **Duração:** 58 minutos

## 2. Fluxo Executado
O usuário executou com sucesso todo o roteiro `FIRST_PILOT_USER_SCRIPT.md`:
* Cadastro de cliente via texto livre;
* Criação de orçamento com precificação e custos;
* Visualização e aprovação de proposta em PDF;
* Passagem da OS para "Em Execução";
* Registro de evidência fotográfica em modo offline (modo avião simulado);
* Sincronização pós-reconexão;
* Checagem do relatório de lucratividade financeira.

## 3. Observações de Uso e Dificuldades

### Dificuldades e Fricções (Gargalos)
* Leve confusão inicial no cadastro de cliente novo. O campo livre estava visível simultaneamente ao dropdown, gerando 9 segundos de hesitação.
* Sob iluminação forte, os labels dos campos de custos estavam com baixo contraste, dificultando a leitura rápida.
* Durante o preenchimento de preços numéricos, o teclado empurrou o rodapé adesivo temporariamente por cima do input.

### Pontos Confusos
* O usuário hesitou sobre a independência dos impostos e precisou de orientação do facilitador para entender que os cálculos eram automáticos.
* A interface de seleção de clientes precisava de clarificação para casos não listados.

### Bugs Identificados
* **BUG-01 (Baixo):** Delay estético na renderização/resize do PDF ao alternar de retrato para paisagem.

## 4. Feedback Positivo e Valor Percebido

### Pontos Positivos
* O design Dark Premium foi fortemente elogiado, combinando com a estética profissional da área técnica e aliviando a vista.
* A marcação visual clara das ações primárias (botão "Finalizar Orçamento" amarelo).

### Pontos de Valor Percebido (Uau)
* **Percepção Financeira:** O cálculo dinâmico e em tempo real da margem de lucro durante a digitação dos custos provocou a maior reação positiva do teste ("Nenhum app faz isso").
* **Percepção Operacional & Estabilidade (Offline):** A capacidade de anexar fotos em modo avião (simulando subsolo) sem crash, e o sync natural ao voltar, aumentaram drasticamente a confiança.
* **Performance Percebida:** Altíssima, com transições fluídas mesmo em dados offlines persistentes.

## 5. Avaliação Comercial e Confiança

* **Confiança Matemática no Lucro:** 10/10
* **Utilidade no Dia a Dia de Campo:** 10/10
* **Facilidade de Uso:** 9/10
* **Se usaria novamente:** Sim, com certeza.
* **Se pagaria:** Sim. Sugeriu um preço justo na faixa de R$ 29 a R$ 49/mês.

## 6. Decisão e Próximos Passos

### GO / WATCH / NO-GO
**Decisão:** **WATCH (Aprovado com ressalvas cosméticas)**. O aplicativo obteve grande sucesso na jornada completa, mas exigia os pequenos ajustes UX antes de expansão descontrolada.

### Ações Corretivas Executadas
As seguintes correções foram realizadas imediatamente após o teste e já integram a `v0.1.0-rc.1` expandida:
1. **[UX-01 Resolvido]** Rótulo de cliente livre ocultado; agora só aparece se nenhum cliente do dropdown estiver selecionado.
2. **[UX-02 Resolvido]** Aumentado o contraste das legendas dos inputs de custos (text-gray-500 para text-gray-300).

### Próximos Passos
* Monitorar comportamento do teclado sobre o rodapé (comportamento nativo de viewport no Safari) se surgir em futuros pilotos.
* Investigar em prioridade P2 o delay de redimensionamento de PDF.
* Proceder para a expansão controlada do piloto comercial, pois não há bloqueios sistêmicos, arquiteturais ou financeiros.
