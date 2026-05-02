# OrçaOS — Plano de expansão de cálculos V1

Data: 2026-05-02

## Objetivo

Expandir os cálculos do OrçaOS sem transformar o app em uma lista solta de fórmulas. Cada cálculo deve apoiar decisão técnica, levantamento, orçamento, relatório ou orientação ao cliente.

## Auditoria dos módulos existentes

- **Fundamentos elétricos**: corrente por potência, potência por corrente, Lei de Ohm, potência em resistência, resistores, VA/corrente e consumo.
- **Instalações elétricas**: queda de tensão, seção por queda, distância máxima, transformador inicial, AWG, cabo/disjuntor e eletroduto.
- **Iluminação**: cálculo de lúmens e luminárias.
- **Construção civil**: área de parede, área de piso, concreto, blocos e piso/revestimento.
- **Medições de obra**: área, perímetro, volume simples e perda.
- **Pintura e acabamento**: área, tinta, orçamento, selador, massa, tempo e cômodo.
- **Hidráulica**: reservatórios, consumo diário, autonomia, vazão, enchimento e pressão.
- **Conversores**: volume, pressão, potência e potência térmica.
- **Financeiro técnico**: mão de obra, preço final, diária, hora técnica, parcelamento e sinal.
- **Automação industrial**: escalas 4-20 mA e 0-10 V.

## Cálculos novos adicionados nesta etapa

### Refrigeração e climatização

- BTU por área, pessoas, equipamentos e insolação. **Pro**. Gera relatório/orçamento.
- Consumo mensal de ar-condicionado. **Free**. Gera relatório/orçamento.
- Circuito elétrico para ar-condicionado. **Pro**. Gera relatório/orçamento.

### Motores e comandos

- Corrente nominal por kW/CV/HP. **Pro**. Gera relatório/orçamento.
- Corrente de partida estimada. **Pro**. Gera relatório.
- Relé térmico. **Pro**. Gera relatório/orçamento.
- Contator. **Pro**. Gera relatório/orçamento.
- Capacitor de motor monofásico. **Pro**. Gera relatório.
- Relação de polias. **Pro**. Gera relatório.
- Escorregamento. **Pro**. Gera relatório.
- Torque. **Pro**. Gera relatório.

### Rebobinagem

- Rotação síncrona. **Pro**. Gera relatório.
- Número de polos. **Pro**. Gera relatório.
- Passo polar básico. **Pro**. Gera relatório.
- Checklist textual de bobinagem. **Soon/experimental**. Gera relatório, sem mapa avançado.

### Transformadores

- VA do transformador. **Pro**. Gera relatório/orçamento.
- Correntes primária/secundária. **Pro**. Gera relatório.
- Relação de transformação. **Pro**. Gera relatório.
- Espiras por volt. **Pro**. Gera relatório.
- Estimativa de espiras. **Pro**. Gera relatório.
- Potência aproximada por núcleo. **Pro**. Gera relatório com aviso de estimativa.

### Solar fotovoltaico

- Consumo mensal em kWh. **Free**. Gera relatório/orçamento.
- Potência do sistema estimada em kWp. **Pro**. Gera relatório.
- Quantidade de módulos. **Pro**. Gera relatório/orçamento.
- Área necessária. **Pro**. Gera relatório.
- Geração mensal estimada. **Pro**. Gera relatório.
- Payback simples. **Free**. Gera relatório/comercial.
- Bateria/autonomia básica. **Pro**. Gera relatório.

### Diagnóstico técnico

- Classificação de urgência. **Pro**. Gera relatório.
- Classificação de risco. **Pro**. Gera relatório.
- Manutenção preventiva. **Free**. Gera relatório.
- Preventiva vs corretiva. **Pro**. Gera relatório/comercial.
- Checklist de diagnóstico por categoria. **Free**. Gera relatório.

## Cálculos já cobertos por módulos existentes

- Cabo/disjuntor, queda de tensão, seção por queda e eletroduto: já existem em Instalações elétricas.
- Carga/consumo elétrico residencial básico: já existe em Fundamentos e Instalações.
- Reservatório, autonomia, vazão, enchimento e pressão: já existem em Hidráulica.
- Tinta, selador, massa, custo e tempo de pintura: já existem em Pintura.
- Concreto, blocos e revestimento: já existem em Construção civil.
- Preço final, diária, hora técnica, parcelamento e sinal: já existem em Financeiro técnico.

## Cálculos planejados para depois

- Divisão de circuitos por ambiente com assistente de cargas.
- Balanceamento entre fases com lista editável de cargas.
- Aterramento simplificado com histórico de medição.
- DR/DPS checklist dentro de Elétrica residencial.
- Argamassa de assentamento detalhada e reboco com composições.
- Escada, rampa, telhado por tipo de telha e rodapé avançado.
- Vazão coletada por torneira/chuveiro, piscina, esgoto e bomba simplificada em Hidráulica.
- Conversores adicionais: mm²/AWG avançado, polegada fracionária, kgf/cm², kPa, L/s e kWh/R$.
- Solar com perdas por orientação, inclinação, sombra e inversor.
- Rebobinagem avançada com mapa de bobinas somente após validação técnica.

## Riscos técnicos

- **Normas técnicas**: os cálculos são estimativas e não copiam textos normativos. Resultados precisam de validação profissional e normativa.
- **Segurança elétrica**: cabo, disjuntor, DR, DPS, aterramento e motor exigem validação de campo.
- **Rebobinagem**: mapa completo de bobinagem não foi implementado para evitar automação arriscada sem validação.
- **Solar**: estimativas não substituem projeto fotovoltaico com dados locais, concessionária e normas.
- **Orçamento**: cálculos comerciais não substituem análise tributária/contábil.

## Integração com fluxo

Todos os novos cálculos geram `CalculationCapture` compatível com o fluxo existente:

- `summary`;
- `details`;
- `calculatorLabel`;
- `moduleLabel`;
- `destination`;
- `technicalNote`;
- `reportReady`;
- envio para levantamento, orçamento ou ambos.

Assistentes de diagnóstico usam `itemType: diagnostic` e não geram item de orçamento por padrão.

## Organização Free / Pro

### Free

- Fundamentos elétricos.
- Hidráulica básica.
- Pintura básica.
- Medições e construção base.
- Conversores base.
- Financeiro básico.
- Consumo mensal de ar-condicionado.
- Consumo solar mensal.
- Payback simples.
- Manutenção preventiva.
- Checklist de diagnóstico.

### Pro

- Instalações elétricas avançadas.
- Refrigeração técnica.
- Motores e comandos.
- Transformadores.
- Solar técnico.
- Rebobinagem inicial.
- Diagnóstico avançado.

### Soon / experimental

- Checklist de bobinagem segura como estrutura inicial.
- Mapa completo de bobinagem, apenas depois de validação.

