# Cálculos elétricos do OrçaOS

Este documento registra os cálculos elétricos iniciais do OrçaOS. A ideia é manter as fórmulas, limites, observações e validações documentadas junto com o código.

## Aviso importante

Os cálculos iniciais são uma base de desenvolvimento. Antes de uso real como recomendação profissional, precisam ser validados com normas aplicáveis, tabelas técnicas, prática profissional e testes.

No Brasil, instalações elétricas de baixa tensão devem observar a ABNT NBR 5410 e demais normas aplicáveis. O OrçaOS deve tratar seus resultados como apoio técnico, não como substituto da responsabilidade profissional.

---

## Corrente por potência

### Monofásico ou corrente contínua simplificada

```text
I = P / V
```

Onde:

- `I` = corrente em ampères;
- `P` = potência em watts;
- `V` = tensão em volts.

### Com fator de potência

```text
I = P / (V × FP)
```

### Trifásico

```text
I = P / (√3 × V × FP)
```

---

## Potência por tensão e corrente

### Monofásico

```text
P = V × I × FP
```

### Trifásico

```text
P = √3 × V × I × FP
```

---

## Conversão W / VA / A

### Potência aparente

```text
VA = W / FP
```

### Corrente por potência aparente

Monofásico:

```text
I = VA / V
```

Trifásico:

```text
I = VA / (√3 × V)
```

Uso inicial:

- comparar potência ativa e potência aparente;
- estimar corrente a partir de VA;
- apoiar análise de equipamentos com fator de potência informado.

---

## Consumo em kWh

```text
kWh = (P × horas × dias) / 1000
```

Exemplo:

- potência: 1000 W;
- uso: 2 horas por dia;
- período: 30 dias.

Resultado:

```text
(1000 × 2 × 30) / 1000 = 60 kWh
```

Custo estimado:

```text
custo = kWh × tarifa
```

---

## Queda de tensão simplificada

A queda de tensão depende de:

- corrente;
- distância;
- seção do condutor;
- material do condutor;
- tipo de circuito;
- temperatura;
- método de instalação;
- fator de potência.

Fórmula simplificada monofásica com cobre:

```text
quedaV = (2 × ρ × L × I) / S
```

Trifásico simplificado:

```text
quedaV = (√3 × ρ × L × I) / S
```

Percentual:

```text
quedaPercentual = (quedaV / tensão) × 100
```

---

## Cabo e disjuntor preliminar

O app pode sugerir uma seção mínima inicial com base na corrente calculada, mas isso deve ser tratado como **pré-dimensionamento**.

Entrada inicial:

- potência;
- tensão;
- fator de potência;
- tipo de circuito.

Saídas:

- corrente estimada;
- disjuntor comercial sugerido;
- seção preliminar de cabo.

Atenção:

- o disjuntor protege o circuito/condutor, não apenas a carga;
- a seção do cabo e o método de instalação precisam ser compatíveis;
- curva do disjuntor depende da carga;
- uso real deve ser validado por profissional.

---

## Iluminação por ambiente

Fluxo luminoso necessário:

```text
lumens = área_m² × lux_desejado
```

Quantidade de luminárias:

```text
quantidade = arredondar_para_cima(lumens_necessários / lumens_por_luminária)
```

Uso inicial:

- estimar lúmens necessários para um cômodo;
- comparar luminárias;
- montar orçamento preliminar de iluminação.

---

## Ar-condicionado

Estimativa inicial de BTU/h:

```text
BTU = (área_m² × 600) + ((pessoas - 1) × 600) + (equipamentos × 600)
```

Com fator de sol/calor:

```text
BTU_final = BTU × fator
```

O app arredonda para uma capacidade comercial acima da estimativa, como 9000, 12000, 18000, 22000, 24000, 30000 BTU/h etc.

Atenção:

- é estimativa inicial;
- não substitui carga térmica completa;
- insolação, pé-direito, isolamento, janelas e região influenciam muito.

---

## Eletroduto por ocupação

Área aproximada de um cabo circular:

```text
área_cabo = π × diâmetro² / 4
```

Área total dos cabos:

```text
área_total = área_cabo × quantidade
```

Área interna aproximada do eletroduto:

```text
área_eletroduto = π × diâmetro_interno² / 4
```

Percentual de ocupação:

```text
ocupação = (área_total / área_eletroduto) × 100
```

Atenção:

- usa diâmetro externo do cabo;
- usa diâmetro interno real do eletroduto;
- precisa validar norma, tipo de cabo e quantidade de curvas.

---

## Regras de validação inicial

Todo cálculo deve validar:

- valor vazio;
- valor zero quando inválido;
- número negativo;
- fator de potência fora de faixa;
- tensão inválida;
- corrente excessiva;
- resultado fora de uma faixa comum;
- necessidade de revisão profissional.

---

## Prioridade de testes

Cada cálculo deve ter casos simples e fáceis de conferir manualmente.

Exemplo:

```text
P = 2200 W
V = 220 V
FP = 1
I = 10 A
```

Esse tipo de caso ajuda a validar rapidamente se a função básica está correta.