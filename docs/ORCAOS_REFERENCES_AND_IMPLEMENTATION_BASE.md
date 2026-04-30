# OrçaOS — Referências e Base de Implementação dos Módulos

Este documento organiza as referências técnicas que devem guiar a implementação dos módulos do OrçaOS.

## Princípio geral

O OrçaOS deve ser implementado como uma ferramenta de apoio técnico e comercial. Ele pode calcular, estimar, orientar e gerar levantamentos/orçamentos, mas não deve prometer substituir projeto técnico, ART/RRT, laudo, inspeção profissional ou validação normativa.

## Regras para implementação

1. Fórmulas universais podem ser implementadas diretamente.
2. Tabelas normativas protegidas por direito autoral não devem ser copiadas integralmente no app.
3. Tabelas comerciais públicas podem ser usadas como referência quando permitido, mas devem ter origem registrada.
4. Cálculos normativos sensíveis devem exibir aviso de validação profissional.
5. Sempre que o cálculo for simplificado, o app deve deixar claro que é estimativa preliminar.
6. Cada cálculo deve ter: entradas, fórmula/base, resultado, observação técnica e opção de enviar para levantamento/orçamento/relatório.

## Referências por domínio

### Elétrica / instalações

Referências principais:

- ABNT NBR 5410 — Instalações elétricas de baixa tensão.
- NR-10 — Segurança em instalações e serviços em eletricidade.
- ABNT NBR 5419 — Proteção contra descargas atmosféricas.
- Catálogos de cabos: Prysmian, Nexans, Sil, Corfio ou equivalentes.
- Catálogos de proteção: Schneider, WEG, Siemens, Steck ou equivalentes.
- Catálogos de tomadas, módulos e materiais: Tramontina, Schneider, Margirius, Fame, Pial/Legrand e equivalentes.

Implementar primeiro:

- corrente;
- potência;
- Lei de Ohm;
- consumo;
- queda de tensão;
- cabo/disjuntor preliminar;
- eletroduto;
- transformador básico;
- AWG/mm²;
- iluminação;
- ar-condicionado;
- motor;
- 4–20 mA e 0–10 V.

### Construção civil / obras

Referências principais:

- SINAPI — custos e composições de construção civil.
- ABNT NBR 6118 — projeto de estruturas de concreto.
- normas ABNT de alvenaria, revestimentos, argamassas, concreto e desempenho de edificações.
- práticas de mercado e catálogos de fabricantes para rendimento de materiais.

Implementar primeiro:

- área de parede;
- área de piso;
- área de teto;
- volume de concreto;
- contrapiso;
- argamassa;
- tijolos/blocos;
- pisos/revestimentos;
- telhado básico.

### Pintura

Referências principais:

- catálogos e fichas técnicas de fabricantes: Suvinil, Coral, Sherwin-Williams, Eucatex, Quartzolit e equivalentes.
- rendimento por litro, demãos, tipo de superfície e perda informada pelo fabricante.
- coleções/serviços ABNT relacionados a pintura, quando disponíveis.

Implementar primeiro:

- área total a pintar;
- desconto de portas e janelas;
- quantidade de tinta;
- demãos;
- selador;
- massa corrida;
- custo por m²;
- orçamento por cômodo.

### Hidráulica

Referências principais:

- ABNT NBR 5626 — sistemas prediais de água fria e água quente.
- catálogos Tigre, Amanco/Wavin, Krona e equivalentes.
- curvas e dados de fabricantes para bombas e pressurizadores.

Implementar primeiro:

- volume de caixa d'água;
- consumo diário;
- vazão;
- tempo de enchimento;
- conversão mca/bar/psi;
- bomba básica;
- perda de carga simplificada;
- lista de conexões.

### Refrigeração / ar-condicionado

Referências principais:

- ABNT NBR 16401 — instalações de ar-condicionado, sistemas centrais e unitários.
- catálogos de fabricantes: LG, Samsung, Springer/Midea, Daikin, Fujitsu, Elgin, Gree e equivalentes.
- Procel/Inmetro para eficiência energética, quando aplicável.

Implementar primeiro:

- BTU/h por ambiente;
- pessoas;
- insolação;
- eletrônicos;
- capacidade comercial sugerida;
- corrente estimada;
- cabo/disjuntor dedicado;
- consumo mensal.

### Motores / comandos

Referências principais:

- catálogos WEG para motores, contatores, relés térmicos e inversores.
- catálogos Schneider, Siemens, ABB e equivalentes.
- práticas de comando elétrico e dados de placa.

Implementar primeiro:

- corrente de motor;
- CV/HP/kW;
- rotação síncrona;
- escorregamento;
- torque básico;
- relação de polias;
- capacitor de motor monofásico;
- proteção preliminar.

### Rebobinagem / transformadores

Referências principais:

- literatura técnica de máquinas elétricas.
- dados de placa e medições reais.
- tabelas de fios esmaltados e catálogos de fabricantes.
- práticas de oficina de rebobinagem.

Implementar primeiro:

- registro técnico do motor;
- número de ranhuras;
- polos;
- tensão de trabalho;
- mapa de ligação;
- capacitor;
- sentido de rotação;
- espiras por volt para transformador;
- primário/secundário;
- potência VA;
- fio preliminar.

### Eletrônica

Referências principais:

- fórmulas universais de eletrônica básica;
- datasheets de componentes;
- catálogos de resistores, capacitores, reguladores, LEDs, MOSFETs e transistores.

Implementar primeiro:

- resistor para LED;
- divisor de tensão;
- potência dissipada;
- capacitor série/paralelo;
- constante RC;
- PWM;
- ADC;
- autonomia de bateria;
- regulador linear;
- ripple de fonte.

### Orçamento / composição de serviços

Referências principais:

- SINAPI para referência de composição/custos públicos.
- preços próprios do profissional.
- catálogo interno de serviços e materiais.
- histórico de orçamento do usuário.

Implementar primeiro:

- mão de obra por ponto;
- mão de obra por m²;
- diária/hora;
- custo de material;
- margem de lucro;
- desconto;
- deslocamento;
- impostos;
- preço final;
- comparação básico/premium.

## Implementação recomendada no código

### Etapa 1 — Catálogo declarativo de módulos

Criar uma base de módulos planejados com:

- id;
- nome;
- domínio;
- descrição;
- status: ativo, parcial, em breve;
- plano: grátis, pro ou pacote;
- prioridade;
- cálculos vinculados.

### Etapa 2 — Catálogo declarativo de cálculos

Cada cálculo deve ter:

- id;
- módulo;
- categoria;
- nome;
- descrição;
- campos de entrada;
- função de cálculo;
- resultado;
- avisos técnicos;
- destino permitido: levantamento, orçamento e relatório.

### Etapa 3 — MVP ampliado

Implementar primeiro:

1. elétrica;
2. obras básicas;
3. pintura;
4. orçamento;
5. conversores;
6. motores/automação básicos.

### Etapa 4 — expansão

Depois implementar:

- hidráulica;
- refrigeração avançada;
- eletrônica;
- transformadores;
- rebobinagem;
- solar;
- diagnóstico técnico.

## Observação importante

O OrçaOS deve diferenciar visualmente:

- cálculo exato por fórmula;
- estimativa simplificada;
- pré-dimensionamento;
- cálculo que exige validação normativa;
- cálculo que depende de tabela comercial/fabricante.
