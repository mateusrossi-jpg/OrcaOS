# OrçaOS — Taxonomia de cálculos V2

Data: 2026-05-02

## Diretriz

A tela de cálculos deve ser organizada por setor de trabalho e por decisão prática, não por arquivo interno nem por uma lista solta de fórmulas.

Cada módulo deve responder a uma pergunta clara:

- que informação eu tenho?
- que decisão preciso tomar?
- isso vai para levantamento, orçamento ou relatório?

## Setores atuais

### Elétrica

Elétrica fica com um módulo principal para rotina predial e módulos específicos para rotinas especializadas.

**Elétrica predial** tem abas internas:

- **Base**: Ohm, corrente, potência, resistores, VA e consumo.
- **Residencial**: cabo, disjuntor, cargas, fases, aterramento e DR/DPS.
- **Dimensionamento**: queda de tensão, seção, distância máxima, AWG, transformador, cabo/disjuntor e eletroduto.
- **Iluminação**: lúmens, lux e quantidade inicial de luminárias.
- **Sinais**: escalas 4-20 mA, 0-10 V e valor de engenharia.

Módulos específicos continuam separados quando representam uma rotina profissional própria:

- **Climatização**.
- **Motores e comandos**.
- **Transformadores**.
- **Solar fotovoltaico**.
- **Rebobinagem**.

### Hidráulica

Hidráulica fica em um único módulo, com duas abas internas:

- **Básico**: reservatório, consumo, autonomia, vazão, enchimento e pressão.
- **Instalações**: caixa por pessoas, piscina, esgoto, pressão por coluna e bomba simples.

### Construção civil

Construção civil fica em um único módulo, com três abas internas:

- **Medições**: medir área, perímetro, volume e perda.
- **Materiais**: transformar medidas em concreto, blocos, piso e revestimento.
- **Composição**: argamassas, rodapé, telhado, escada e rampa.

### Pintura e acabamento

- Área, rendimento, tinta, selador, massa, custo e tempo.

### Financeiro

O financeiro fica em um único módulo, com quatro abas internas:

- **Orçamento**: mão de obra, diária, hora técnica, parcelamento, sinal e preço final.
- **Produtividade**: custo por área, unidade, metro e tempo.
- **Percentuais**: regra de três, porcentagem, acréscimo, desconto, margem e markup.
- **Preço e margem**: margem real, markup, desconto máximo, taxas, entrada, hora real e faixas.

### Conversores e unidades

Os conversores ficam em um único módulo, com duas abas internas:

- **Conversores rápidos**: o usuário escolhe a unidade de entrada e converte as equivalências principais.
- **Conversores técnicos**: conversões mais específicas de rotina técnica, como AWG, polegada, vazão completa, pressão completa, temperatura e kWh/R$.

Essa organização remove a duplicidade de cards na navegação, mas mantém os dois modos de uso.

### Relatório e diagnóstico

Diagnóstico não é cálculo puro. É assistente de decisão para relatório e fica organizado por intenção:

- **Relatório**: checklist por categoria e texto técnico inicial.
- **Risco**: urgência e classificação de risco.
- **Manutenção**: manutenção preventiva e preventiva vs corretiva.

Esses itens devem gerar texto técnico e relatório, não item comercial automaticamente.

## Free / Pro

### Free

- Elétrica predial: base elétrica e cálculos livres internos.
- Construção civil básica.
- Pintura.
- Hidráulica.
- Conversores técnicos.
- Financeiro e preços.
- Alguns cálculos internos de módulos Pro quando funcionam como entrada de produto.

### Pro

- Instalação residencial dentro de elétrica predial.
- Dimensionamento elétrico dentro de elétrica predial.
- Iluminação e sinais dentro de elétrica predial.
- Climatização.
- Motores e comandos.
- Automação e sinais dentro de elétrica predial.
- Transformadores.
- Solar.
- Rebobinagem.
- Instalações hidráulicas avançadas dentro do módulo de hidráulica.
- Composição de obra avançada dentro do módulo de construção.
- Preço e margem avançado dentro do módulo financeiro.
- Assistentes de diagnóstico.

## Pontos pendentes

- Separar diagnóstico também em Relatórios/Levantamento, não apenas Cálculos.
- Deixar bloqueio Free/Pro consistente dentro dos workspaces, pois hoje alguns módulos Pro ainda possuem cálculos internos livres.
- Revisar nomes internos depois da publicação inicial, sem quebrar storage nem histórico de capturas.
