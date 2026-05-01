# OrçaOS — Checklist de polimento MVP Play Store

Este checklist registra o ponto atual após a consolidação dos cálculos humanos e deve guiar a próxima fase antes de avançar para publicação.

---

## Estado atual

Os principais módulos humanos já possuem:

- campos obrigatórios reduzidos;
- campos avançados recolhidos;
- resultado direto;
- orientação prática;
- unidades explícitas;
- caixa `Como este cálculo é feito`;
- fórmulas salvas no levantamento/orçamento.

Módulos consolidados:

```txt
Fundamentos elétricos
Hidráulica
Conversores técnicos
Pintura e acabamento
Construção civil
Orçamento técnico
```

---

## Validação obrigatória

Antes de qualquer expansão de módulo, rodar:

```bash
npm install
npm run typecheck
npm run build
```

Corrigir somente erros reais de build, TypeScript, import ou CSS.

---

## Pontos para testar manualmente no app

### 1. Cálculos

Abrir a tela `Cálculos` e validar:

- grupos visuais da taxonomia V1 aparecem corretamente;
- cards ainda abrem os módulos certos;
- Construção civil aparece visualmente como `5 cálculos consolidados`;
- Conversores aparece visualmente como `4 conversores técnicos`;
- cards `Em breve` não quebram navegação.

### 2. Fundamentos elétricos

Testar:

- Corrente por potência;
- Potência por corrente;
- Tensão por potência/corrente;
- Lei de Ohm;
- Potência em resistência;
- Potência aparente / VA;
- Resistores série/paralelo;
- Consumo em kWh.

Confirmar que cada cálculo mostra:

- resultado;
- orientação;
- `Como este cálculo é feito`;
- envio para levantamento/orçamento.

### 3. Hidráulica

Testar:

- reservatório retangular;
- reservatório cilíndrico;
- consumo diário;
- autonomia;
- vazão;
- tempo de enchimento;
- pressão / MCA.

Validar especialmente conversões:

```txt
L/min ↔ L/h ↔ m³/h
bar ↔ psi ↔ mca
```

### 4. Conversores técnicos

Testar:

- m³ ↔ litros;
- bar / psi / mca;
- CV / HP / kW;
- BTU/h ↔ W.

Confirmar que só uma unidade de entrada é exigida por vez.

### 5. Pintura

Testar:

- Área a pintar;
- Tinta necessária;
- Orçamento de pintura.

Confirmar que área, demãos, rendimento e perda aparecem de forma compreensível.

### 6. Construção civil

Testar:

- Área de parede;
- Área de piso/teto;
- Volume de concreto;
- Tijolos/blocos;
- Piso/revestimento.

Confirmar arredondamentos para:

```txt
sacos
blocos
peças
caixas
```

### 7. Orçamento técnico

Testar especialmente `Preço final`:

- Markup sobre custo;
- Margem sobre venda;
- desconto;
- impostos/taxas;
- fórmula exibida;
- margem real exibida.

Validar diferença:

```txt
Markup sobre custo: preço = custo × (1 + markup ÷ 100)
Margem sobre venda: preço = custo ÷ (1 - margem ÷ 100)
```

---

## Fluxo de captura

Para cada módulo principal, testar pelo menos um cálculo com:

```txt
Adicionar ao levantamento
Adicionar ao orçamento
Adicionar aos dois
```

Depois validar se os detalhes aparecem em:

```txt
Levantamento → Itens salvos
Orçamentos → Itens técnicos
Relatórios
```

Os detalhes devem incluir:

- valores usados;
- resultado;
- fórmulas;
- orientação prática.

---

## Restrições da próxima fase

Não fazer ainda:

- criar módulos novos;
- expandir cálculos Pro;
- reescrever `AppOrcaNext.tsx` sem necessidade;
- alterar taxonomia V1;
- remover os workspaces humanos;
- trocar arquitetura local-first.

---

## Próxima fase após build limpo

Se `typecheck` e `build` passarem:

1. polir textos e nomes dos cards;
2. revisar fluxo Levantamento → Orçamento → Relatório;
3. melhorar proposta/PDF/WhatsApp;
4. revisar backup local;
5. preparar checklist Play Store;
6. começar testes reais em celular.
