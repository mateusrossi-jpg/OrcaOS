# Aferix — Critério de UX dos cálculos

Este documento define como cada cálculo do Aferix deve ser construído para uso humano real, especialmente no celular e em campo.

## Princípio principal

Todo cálculo deve ser pensado para um profissional usando o app em serviço, com pressa, no celular e muitas vezes em ambiente desconfortável.

Regra base:

```text
Poucos campos obrigatórios.
Resultado direto.
Explicação curta.
Opções avançadas escondidas.
```

O app não deve parecer um formulário técnico pesado.

## Objetivo de experiência

O usuário deve conseguir:

1. abrir o cálculo;
2. entender rapidamente o que preencher;
3. preencher poucos campos;
4. receber o resultado;
5. saber o próximo passo prático.

## Regra dos campos

Cada cálculo deve ter três níveis de campos.

### 1. Campos essenciais

São os únicos campos que aparecem de início.

Devem responder à pergunta:

```text
Sem esse campo, o cálculo não existe?
```

Exemplos:

- potência e tensão para corrente;
- largura e comprimento para área;
- área e rendimento para tinta;
- volume e vazão para tempo de enchimento.

### 2. Campos opcionais

Podem aparecer com valor padrão simples ou em uma seção “Ajustes”.

Exemplos:

- perda percentual;
- demãos;
- desconto de portas/janelas;
- tarifa de energia;
- deslocamento;
- margem.

### 3. Campos avançados

Devem ficar escondidos em “Avançado”, “Ajustes técnicos” ou “Mais opções”.

Exemplos:

- fator de potência;
- tipo de circuito/fase;
- rendimento;
- temperatura;
- agrupamento;
- queda máxima;
- margem técnica;
- parâmetros normativos.

## Regra de quantidade de campos

Para a V1 publicável:

- cálculo simples: 1 a 3 campos visíveis;
- cálculo médio: 3 a 5 campos visíveis;
- cálculo técnico: até 5 campos visíveis + avançado recolhido;
- acima de 5 campos visíveis deve ser dividido em etapas.

Se um cálculo precisar de muitos campos, usar fluxo guiado:

```text
Passo 1 — dados básicos
Passo 2 — ajustes opcionais
Passo 3 — resultado e orientação
```

## Conversores

Conversores não devem exigir todos os campos ao mesmo tempo.

Errado:

```text
bar
psi
mca
```

Correto:

```text
Valor
Unidade de origem
Unidade de destino
Resultado
```

Exemplo:

```text
Valor: 1
De: bar
Para: mca
Resultado: 10,2 mca
```

Ou, em modo rápido:

```text
Digite um valor em bar
→ mostra psi e mca automaticamente
```

Mas não pedir bar, psi e mca juntos como se todos fossem entrada obrigatória.

## Cálculos compostos

Cálculos muito amplos devem ser quebrados.

Exemplo de pintura:

Não misturar tudo em uma única tela pesada:

```text
largura
altura
paredes
descontos
demãos
rendimento
perda
preço por litro
mão de obra por m²
```

Melhor dividir em:

1. Área a pintar;
2. Tinta necessária;
3. Orçamento de pintura.

O app pode permitir encadear resultados, mas não deve obrigar o usuário a preencher tudo de uma vez.

## Cálculos elétricos

Para uso humano, a maioria dos cálculos elétricos deve trazer padrões inteligentes.

Exemplo: Corrente por potência.

Campos visíveis:

- potência;
- tensão.

Campos avançados:

- fator de potência;
- tipo de circuito;
- margem;
- observação técnica.

Resultado:

- corrente calculada;
- disjuntor comercial inicial;
- cabo preliminar;
- alerta de validação.

## Resultado

Todo cálculo deve mostrar:

1. resultado principal em destaque;
2. resultado complementar, se fizer sentido;
3. explicação curta;
4. orientação prática;
5. alerta técnico quando necessário.

Exemplo:

```text
Corrente calculada: 10 A
Sugestão inicial: disjuntor 16 A / cabo 2,5 mm²
Atenção: validar queda de tensão, método de instalação e norma aplicável.
```

## Linguagem

Usar linguagem de campo, não linguagem excessivamente acadêmica.

Preferir:

```text
Potência do equipamento
Tensão disponível
Distância até a carga
Quantidade de pontos
```

Evitar, quando possível:

```text
parâmetro de entrada
coeficiente
variável independente
valor escalar
```

## Valores padrão

O Aferix pode preencher valores padrão úteis, mas deve deixar claro que são ajustáveis.

Exemplos:

- perda: 10%;
- demãos: 2;
- fator de potência: 1 para carga resistiva simples;
- tensão: 127 V ou 220 V, conforme padrão escolhido;
- consumo por pessoa: 150 L/dia;
- tarifa: valor editável.

## Validação e segurança

O app deve alertar quando:

- valor está zerado;
- campo essencial está faltando;
- resultado parece fora do comum;
- cálculo é apenas preliminar;
- exige validação profissional;
- depende de norma/tabela/condição de instalação.

## Aplicação na interface

Cada tela de cálculo deve seguir este modelo:

```text
Título do cálculo
Descrição curta
Campos essenciais
Resultado principal
Orientação prática
Botões: adicionar ao levantamento / orçamento
Ajustes avançados recolhidos
Nota técnica curta
```

## Regra de aprovação de cálculo

Nenhum cálculo deve ser considerado pronto para publicação se:

- tiver campos demais visíveis;
- pedir unidades equivalentes como campos obrigatórios simultâneos;
- não tiver resultado principal claro;
- não tiver orientação prática;
- não tiver alerta quando for cálculo técnico;
- usar nome confuso para usuário comum;
- não indicar unidade do campo.

## Conclusão

A V1 deve priorizar simplicidade.

Cálculos avançados podem existir, mas devem aparecer como evolução natural, não como barreira para o usuário comum.
