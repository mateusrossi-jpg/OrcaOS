# Aferix — estratégia de plataforma modular

Este documento registra a decisão estratégica: o Aferix deve evoluir como **plataforma modular**, não como vários aplicativos isolados para cada função.

## Decisão principal

O Aferix deve ser uma plataforma profissional com núcleo comum e módulos por área.

Evitar criar, neste momento, apps separados como:

- app só de elétrica;
- app só de pintura;
- app só de hidráulica;
- app só de orçamento;
- app só de fornecedores;
- app só de estoque.

A prioridade é criar um núcleo forte e reaproveitável.

## Por que plataforma

Um app separado por função gera repetição de:

- login;
- clientes;
- orçamentos;
- PDFs;
- relatórios;
- catálogo;
- fornecedores;
- estoque;
- visual;
- pagamentos;
- manutenção;
- suporte.

Isso aumenta custo e risco de cada app ficar diferente, incompleto ou abandonado.

Como plataforma, o Aferix consegue manter um único fluxo principal:

```text
cliente → levantamento → cálculo → orçamento → relatório → OS → compra/estoque → gestão
```

E adicionar módulos por profissão.

## Núcleo comum da plataforma

O núcleo comum deve conter:

- clientes;
- ordens de serviço;
- orçamento guiado;
- orçamento/proposta;
- relatórios;
- catálogo de itens e serviços;
- fornecedores;
- compras;
- estoque;
- margem;
- impostos gerenciais;
- configurações da empresa;
- identidade visual;
- planos/licenças.

Esse núcleo deve servir para qualquer módulo profissional.

## Módulos profissionais

A plataforma pode crescer por módulos:

- elétrica;
- hidráulica;
- pintura;
- construção civil;
- refrigeração;
- automação;
- eletrônica;
- custos fixos;
- transformadores;
- solar fotovoltaico;
- manutenção preventiva;
- custos fixos/CFTV/rede.

Cada módulo pode ter:

- cálculos próprios;
- kits próprios;
- relatório próprio;
- itens de catálogo sugeridos;
- linguagem técnica específica;
- modelos de proposta.

## Experiência por perfil

O app deve permitir uma experiência simples por perfil:

```text
Sou prestador de serviço
Sou técnico de refrigeração
Sou pintor
Sou pedreiro/mestre de obras
Sou instalador de custos fixos
Sou empresa multisserviços
```

O perfil define o que aparece primeiro, sem remover o núcleo comum.

## Monetização modular

Modelo recomendado:

### Grátis

- cálculos fundamentais;
- alguns cálculos por área;
- orçamento simples;
- relatório básico;
- catálogo limitado ou local.

### Pro Elétrica

- cálculos elétricos completos;
- dimensionamentos guiados;
- kits elétricos;
- relatórios elétricos;
- propostas elétricas.

### Pro Obras

- pintura;
- construção civil;
- hidráulica;
- levantamento por cômodo;
- kits por ambiente.

### Pro Empresa

- clientes;
- OS;
- fornecedores;
- estoque;
- margem;
- impostos gerenciais;
- relatórios avançados;
- múltiplos usuários no futuro.

### Futuro

- marketplace de templates;
- catálogos conectados;
- módulos de terceiros;
- Aferix Cliente;
- área web.

## Aferix Profissional primeiro

O primeiro produto deve ser o **Aferix Profissional**.

Prioridade:

1. elétrica como primeiro módulo forte;
2. orçamento guiado;
3. catálogo/fornecedores/compras;
4. relatórios e proposta;
5. estética profissional;
6. publicação para validação real.

## Aferix Cliente depois

O Aferix Cliente deve vir depois.

Antes de criar app separado, começar com:

- PDF profissional;
- link compartilhável;
- proposta com QR Code;
- área simples de aprovação;
- status de OS;
- visualização simplificada de diagnóstico.

O app cliente separado só deve ser avaliado depois que o fluxo profissional estiver validado.

## Regra comercial importante

Dados internos do profissional não devem aparecer para o cliente:

- custo real;
- margem;
- markup;
- fornecedor;
- imposto gerencial;
- observações internas;
- estoque interno.

O cliente deve ver:

- preço final;
- descrição clara;
- prazo;
- validade;
- condições de pagamento;
- diagnóstico simplificado;
- lista de materiais quando ele for comprar;
- status da OS.

## Frase de posicionamento

O Aferix não é apenas um app de cálculo.

O Aferix é uma plataforma profissional para transformar levantamento técnico em orçamento, proposta, OS, relatório e gestão.
