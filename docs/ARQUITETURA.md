# Arquitetura inicial do Aferix

A arquitetura do Aferix deve permitir começar simples e crescer para uma plataforma profissional sem quebrar a base inicial.

## Princípio central

Separar claramente:

- interface;
- regras de negócio;
- cálculos técnicos;
- tabelas técnicas;
- orçamento;
- clientes;
- relatórios;
- ordens de serviço;
- módulos por profissão.

Assim, uma calculadora elétrica pode ser usada na tela, em um orçamento, em um relatório técnico ou em uma futura API sem duplicar lógica.

---

## Camadas principais

```text
src/
├── app/          # entrada visual da aplicação
├── core/         # regras reutilizáveis e independentes de tela
├── data/         # tabelas técnicas e dados base
├── features/     # módulos funcionais do produto
└── styles/       # estilos globais
```

---

## Camada `core`

A camada `core` deve conter código puro, testável e sem dependência de interface.

```text
core/
├── calculations/ # fórmulas técnicas
├── pricing/      # regras de preço e orçamento
├── validation/   # validações de entrada e alertas
└── types/        # tipos compartilhados
```

Exemplos:

- corrente por potência;
- queda de tensão;
- consumo em kWh;
- cálculo de orçamento;
- validação de campos;
- classificação de risco/alerta.

---

## Camada `data`

A camada `data` armazena tabelas usadas pelos cálculos.

```text
data/
├── electrical-tables/
├── service-prices/
└── professions/
```

Exemplos:

- bitolas de cabos;
- disjuntores comerciais;
- fatores de potência base;
- serviços comuns de prestador de serviço;
- preços padrão sugeridos;
- categorias profissionais.

---

## Camada `features`

Cada recurso grande do app deve ficar em seu próprio módulo.

```text
features/
├── calculators/
├── budgets/
├── clients/
├── reports/
├── work-orders/
└── preventive-maintenance/
```

A interface pode mudar, mas as regras de negócio devem continuar estáveis.

---

## Modo gratuito e Pro

A arquitetura deve prever o controle de recursos por plano sem duplicar o app.

Exemplo conceitual:

```ts
featureAccess.canUse('advanced-voltage-drop', userPlan)
```

O modo gratuito deve ser útil. O Pro deve ampliar capacidade, automação, exportação e recursos profissionais.

---

## Evolução para ERP

O Aferix não deve perder a identidade de ferramenta técnica ao virar sistema maior. A evolução para ERP deve adicionar módulos, não substituir o núcleo.

Base futura:

- clientes;
- agenda;
- orçamento;
- OS;
- estoque simples;
- financeiro básico;
- relatórios;
- módulos por profissão;
- licenciamento;
- sincronização em nuvem.

---

## Regras para manter o projeto saudável

1. Cálculo técnico nunca deve ficar preso à tela.
2. Todo cálculo importante deve ter teste.
3. Toda tabela técnica deve ter origem documentada.
4. Toda fórmula deve ter explicação em `docs/`.
5. O app deve funcionar bem no celular antes de pensar em desktop.
6. O visual deve ser simples, profissional e direto.
7. Recursos futuros devem entrar como módulos, não como remendos.

---

## Decisão inicial de stack

Base inicial:

- React;
- TypeScript;
- Vite;
- CSS modular/global simples.

Motivo:

- desenvolvimento rápido;
- fácil teste no navegador;
- possibilidade de evoluir para PWA;
- possibilidade futura de empacotar para Android;
- boa integração com ferramentas de IA e GitHub.

A decisão final para publicação Android/iOS poderá ser revista entre:

- PWA;
- Capacitor;
- React Native;
- Flutter;
- app nativo.

No momento, a prioridade é validar produto, cálculo e experiência.