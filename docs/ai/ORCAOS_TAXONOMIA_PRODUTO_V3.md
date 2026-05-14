# Aferix - Taxonomia de Produto V3

Data: 2026-05-02

## Decisão

O Aferix não deve se comportar como uma lista de fórmulas. A navegação deve refletir o uso real do profissional:

- **Trabalho**: início, atendimentos e campo.
- **Técnico**: cálculos objetivos, relatórios e assistentes de decisão.
- **Comercial**: orçamento e proposta.
- **Gestão**: catálogo, fornecedores, estoque e compras.
- **Sistema**: configurações, backup, conta e plano.

## Separação de responsabilidades

### Cálculos técnicos

Entram aqui ferramentas que respondem com valor, unidade ou dimensionamento:

- corrente, potência, resistência;
- queda de tensão;
- cabo e disjuntor preliminar;
- volume, área, vazão, BTU, consumo;
- preço, margem, desconto e parcelamento;
- conversores de unidades.

Critério: se existe fórmula e resultado numérico principal, é cálculo.

### Assistentes de campo

Entram aqui ferramentas que ajudam a decidir, registrar e explicar:

- DR/DPS;
- risco e prioridade;
- checklist de diagnóstico;
- manutenção preventiva;
- checklist seguro de bobinagem.

Critério: se a saída principal é orientação, checklist ou texto para relatório, não deve ser apresentado como cálculo puro.

### ERP / gestão

Entram aqui controles internos do negócio:

- clientes e OS;
- catálogo;
- fornecedores;
- estoque;
- compras;
- financeiro futuro;
- recorrência e histórico.

Critério: se controla operação e dados do negócio, não deve ficar misturado com cálculo de campo.

## Ajuste DR/DPS

DR e DPS não são fórmula de cálculo no app.

- **DR**: proteção relacionada a fuga de corrente e risco de choque, especialmente em locais com água, uso externo ou contato humano.
- **DPS**: proteção contra surtos, útil quando existem eletrônicos sensíveis, histórico de queima ou risco de transientes.

O app deve apresentar DR/DPS como checklist de proteção elétrica, com perguntas claras:

- existe área molhada ou uso com água?
- existe tomada ou circuito externo?
- há chuveiro, aquecedor ou carga de maior risco?
- existem equipamentos sensíveis?
- o cliente relata queima por surto?
- aterramento foi confirmado?
- neutro e terra estão separados no quadro?

Resultado esperado:

- avaliar DR;
- avaliar DPS;
- revisar aterramento/quadro;
- gerar orientação técnica para relatório.

## Ajuste diagnóstico técnico

Diagnóstico técnico deve ser tratado como assistente de campo ou relatório, não como cálculo genérico.

A saída deve ser útil ao cliente:

- prioridade do atendimento;
- risco técnico;
- checklist do que foi conferido;
- orientação de manutenção;
- texto aproveitável no relatório.

Escalas numéricas internas devem ser evitadas quando o usuário final precisa decidir rapidamente. O app deve preferir escolhas como:

- baixo / médio / alto;
- pontual / recorrente / constante;
- uso normal / uso limitado / impede uso.

