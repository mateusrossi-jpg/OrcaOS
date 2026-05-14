# Aferix — Revisão dos fundamentos elétricos

Este documento registra a revisão dos cálculos elétricos fundamentais antes da reorganização da taxonomia e da publicação.

## Contexto

Durante testes manuais, foi observado que alguns cálculos de potência e fundamentos elétricos estavam com campos confusos ou excessivos para uso humano em campo.

A revisão mostrou que a matemática base está em boa parte correta, mas a experiência de uso precisa ser simplificada.

## Estado atual encontrado

No módulo de fundamentos existem atualmente:

- Corrente;
- Potência;
- Lei de Ohm;
- Potência/R;
- Resistores;
- W / VA / A;
- Consumo.

Esses blocos são importantes e devem continuar existindo, mas precisam ser melhor nomeados e separados.

## Problema principal

Alguns cálculos estão agrupando fórmulas diferentes dentro da mesma tela.

Isso gera formulários que parecem pedir campos demais.

Exemplo crítico:

```text
Potência por resistência
```

Hoje a interface tende a pedir:

- tensão;
- corrente;
- resistência.

Mas, no uso real, o profissional normalmente escolhe uma das duas formas:

```text
P = V² / R
```

ou

```text
P = I² × R
```

Não é obrigatório informar tensão, corrente e resistência juntos.

## Regra correta para potência

A palavra “potência” precisa ser separada em tipos diferentes.

### 1. Potência elétrica simples

Uso:

Calcular potência a partir de tensão e corrente.

Fórmula:

```text
P = V × I
```

Com fator de potência em ajuste avançado:

```text
P = V × I × FP
```

Campos visíveis:

- tensão;
- corrente.

Campos avançados:

- fator de potência;
- tipo de circuito/fase.

### 2. Corrente por potência

Uso:

Descobrir corrente de uma carga.

Fórmula:

```text
I = P / V
```

Com fator de potência em ajuste avançado:

```text
I = P / (V × FP)
```

Campos visíveis:

- potência;
- tensão.

Campos avançados:

- fator de potência;
- tipo de circuito/fase.

### 3. Tensão por potência e corrente

Uso:

Descobrir tensão quando potência e corrente são conhecidas.

Fórmula:

```text
V = P / I
```

Campos visíveis:

- potência;
- corrente.

Campos avançados:

- fator de potência.

### 4. Potência por resistência e tensão

Uso:

Calcular potência dissipada por resistor/carga resistiva usando tensão.

Fórmula:

```text
P = V² / R
```

Campos visíveis:

- tensão;
- resistência.

Não pedir corrente nesse modo.

### 5. Potência por resistência e corrente

Uso:

Calcular potência dissipada por resistor/carga resistiva usando corrente.

Fórmula:

```text
P = I² × R
```

Campos visíveis:

- corrente;
- resistência.

Não pedir tensão nesse modo.

## Lei de Ohm

A Lei de Ohm não deve calcular apenas resistência.

Ela deve ser apresentada como três modos simples:

### Calcular resistência

```text
R = V / I
```

Campos:

- tensão;
- corrente.

### Calcular corrente

```text
I = V / R
```

Campos:

- tensão;
- resistência.

### Calcular tensão

```text
V = R × I
```

Campos:

- resistência;
- corrente.

## Estrutura recomendada para Fundamentos elétricos V1

A interface deve ficar assim:

```text
Fundamentos elétricos
├── Corrente por potência
├── Potência por corrente
├── Tensão por potência/corrente
├── Lei de Ohm
│   ├── calcular resistência
│   ├── calcular corrente
│   └── calcular tensão
├── Potência em resistência
│   ├── por tensão e resistência
│   └── por corrente e resistência
├── Potência aparente / VA
├── Resistores série/paralelo
└── Consumo em kWh
```

## O que deve mudar na interface

### Corrente

Nome recomendado:

```text
Corrente por potência
```

Campos visíveis:

- potência do equipamento;
- tensão disponível.

Avançado:

- fator de potência;
- tipo de circuito.

### Potência

Nome recomendado:

```text
Potência por corrente
```

Campos visíveis:

- tensão;
- corrente.

Avançado:

- fator de potência;
- tipo de circuito.

### Lei de Ohm

Nome recomendado:

```text
Lei de Ohm
```

Deve ter seletor simples:

```text
Quero calcular:
- resistência
- corrente
- tensão
```

E mostrar apenas os dois campos necessários.

### Potência/R

Nome recomendado:

```text
Potência em resistência
```

Deve ter seletor simples:

```text
Tenho tensão e resistência
Tenho corrente e resistência
```

E mostrar apenas os dois campos correspondentes.

### W / VA / A

Nome recomendado:

```text
Potência aparente / VA
```

Evitar pedir W, VA e A como se tudo fosse entrada obrigatória.

Modelo correto:

```text
Quero calcular:
- VA a partir de W e FP
- Corrente a partir de VA e tensão
```

## Critério humano de uso

O usuário não deve precisar saber qual fórmula escolher mentalmente antes de entender a tela.

A tela deve perguntar de forma prática:

```text
O que você quer descobrir?
```

Depois disso, o app mostra apenas os campos necessários.

## Decisão

Antes de implementar a nova taxonomia geral, corrigir a UX dos fundamentos elétricos.

Prioridade:

1. Corrigir potência;
2. Corrigir Lei de Ohm;
3. Corrigir Potência em resistência;
4. Corrigir Potência aparente / VA;
5. Só depois aplicar taxonomia visual final.

## Regra final

Não misturar três fórmulas em uma tela se o profissional só precisa de duas entradas para resolver uma delas.
