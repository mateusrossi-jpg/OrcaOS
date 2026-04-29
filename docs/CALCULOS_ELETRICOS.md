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

Onde:

- `FP` = fator de potência.

### Trifásico

```text
I = P / (√3 × V × FP)
```

Onde:

- `V` = tensão de linha;
- `FP` = fator de potência.

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

Na primeira fase, o OrçaOS terá uma função simplificada para apoio inicial, com aviso claro de que o resultado precisa ser validado.

Fórmula simplificada monofásica com cobre:

```text
quedaV = (2 × ρ × L × I) / S
```

Onde:

- `ρ` = resistividade aproximada do cobre;
- `L` = distância em metros;
- `I` = corrente em ampères;
- `S` = seção do condutor em mm².

Percentual:

```text
quedaPercentual = (quedaV / tensão) × 100
```

---

## Dimensionamento preliminar de condutor

O app pode sugerir uma seção mínima inicial com base em corrente, mas isso deve ser tratado como **pré-dimensionamento**.

Critérios futuros:

- corrente de projeto;
- método de instalação;
- agrupamento;
- temperatura ambiente;
- material do condutor;
- queda de tensão;
- proteção por disjuntor;
- tipo de carga;
- norma aplicável.

---

## Disjuntor recomendado

O app poderá sugerir disjuntores comerciais acima da corrente calculada, mas com alerta:

- o disjuntor protege o circuito/condutor, não apenas a carga;
- a seção do cabo e o método de instalação precisam ser compatíveis;
- curva do disjuntor depende da carga;
- uso real deve ser validado por profissional.

---

## Eletroduto por ocupação

Futuro cálculo:

- diâmetro externo dos cabos;
- área interna do eletroduto;
- percentual máximo de ocupação;
- quantidade de cabos;
- tipo de cabo;
- norma aplicável.

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