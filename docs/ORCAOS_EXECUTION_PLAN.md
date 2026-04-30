# OrçaOS — Plano de Execução do App

Este documento define a direção prática de construção do OrçaOS para evitar que o app cresça de forma bagunçada.

## Objetivo do produto

O OrçaOS nasce como uma ferramenta de bolso para profissionais técnicos, começando pelo eletricista e evoluindo para uma plataforma maior de cálculo, levantamento, orçamento, relatório e OS.

A base inicial deve priorizar:

1. cálculos técnicos úteis;
2. levantamento de campo;
3. orçamento editável;
4. relatório técnico/PDF;
5. clientes e OS;
6. evolução gradual para módulos profissionais e ERP leve.

## Direção visual mínima

Nesta fase, o objetivo não é buscar o visual definitivo, e sim uma base aceitável, limpa e consistente.

Regras:

- evitar estética grosseira;
- evitar excesso de brilhos e sombras;
- manter preto, branco e verde como identidade principal;
- usar estilo flat bem acabado;
- manter tipografia clara e legível;
- evitar cards brancos quebrando o tema escuro;
- evitar telas parecendo desktop comprimido no celular;
- priorizar usabilidade e estabilidade.

## Estrutura principal do app

A navegação principal deve seguir esta hierarquia:

1. Início
   - ações rápidas;
   - acesso a cálculos;
   - acesso a levantamento;
   - acesso a orçamento;
   - acesso a clientes/OS.

2. Cálculos
   - módulos técnicos separados;
   - calculadoras por categoria;
   - tela dedicada para executar cada cálculo;
   - resultado com opção de enviar para levantamento/orçamento.

3. Levantamento
   - serviços guiados;
   - peças/catálogo;
   - bloco manual;
   - itens salvos;
   - imagens e observações no futuro.

4. Orçamentos
   - proposta comercial;
   - dados da empresa;
   - cliente;
   - itens técnicos convertidos;
   - produtos e serviços;
   - modelos de orçamento;
   - PDF.

5. Relatórios
   - diagnóstico técnico;
   - itens vindos do levantamento;
   - imagens;
   - parecer;
   - PDF.

6. Clientes / OS
   - cadastro de clientes;
   - ordens de serviço;
   - histórico;
   - vínculo com orçamento/relatório.

7. Loja / Pro e Configurações
   - plano grátis/pro;
   - pacotes;
   - perfil da empresa;
   - preferências;
   - roadmap.

## Módulos de cálculo previstos

### 1. Fundamentos

Base livre do app:

- corrente;
- potência;
- Lei de Ohm;
- potência por resistência;
- associação de resistores;
- W / VA / A;
- consumo em kWh.

### 2. Instalações elétricas

Módulo profissional:

- queda de tensão;
- seção por queda;
- distância máxima;
- transformador;
- AWG/mm²;
- cabo/disjuntor;
- eletroduto;
- aterramento básico futuramente;
- demanda e circuitos futuramente.

### 3. Iluminação

Módulo profissional:

- lúmens/lux;
- quantidade de luminárias;
- distribuição futura por ambiente.

### 4. Refrigeração

Módulo separado, sem misturar com instalações elétricas:

- BTU/h;
- carga térmica inicial;
- equipamentos e ambientes futuros.

### 5. Motores

Módulo profissional:

- corrente de motor;
- rotação síncrona;
- escorregamento;
- polias;
- partida e proteções futuramente.

### 6. Automação industrial

Módulo profissional:

- escala 4–20 mA;
- escala 0–10 V;
- valor de engenharia;
- instrumentação futura;
- temporizadores/relés lógicos futuramente.

### 7. Rebobinagem

Módulo futuro:

- tensão de trabalho;
- fechamento;
- sentido de rotação;
- mapa de bobinagem;
- dados de motor;
- alertas de ligação incorreta.

### 8. Eletrônica

Módulo futuro importante:

- resistor para LED;
- divisor de tensão;
- potência dissipada;
- capacitores;
- resistores em série/paralelo mais avançados;
- noções úteis para bancada e automação.

## Fluxo principal desejado

O fluxo mais importante do app é:

```txt
Cálculo → Resultado técnico → Levantamento → Orçamento → Relatório/PDF
```

Cada cálculo deve poder gerar uma captura técnica, permitindo:

- adicionar ao levantamento;
- adicionar ao orçamento;
- adicionar aos dois;
- usar depois em relatório técnico.

## Prioridade até apresentação

### Prioridade 1 — estabilidade visual mínima

- menu funcionando;
- home limpa;
- tema escuro coerente;
- cálculos sem cards brancos;
- mobile sem overflow crítico.

### Prioridade 2 — cálculos

- completar módulos principais;
- manter fórmulas confiáveis;
- evitar misturar categorias;
- testar manualmente valores comuns.

### Prioridade 3 — levantamento e orçamento

- peças;
- serviços;
- blocos manuais;
- envio para orçamento;
- orçamento editável;
- PDF razoável.

### Prioridade 4 — apresentação

- telas principais organizadas;
- fluxo demonstrável;
- exemplos reais de uso;
- PDF apresentável.

## Regras de implementação

- Não quebrar cálculos existentes.
- Não adicionar dependências visuais instáveis.
- Evitar grandes experimentos visuais agora.
- Preferir CSS simples e controlado.
- Fazer mudanças incrementais e testáveis.
- Priorizar funcionalidades úteis até o final do mês.

## Próximas etapas técnicas

1. estabilizar visual atual;
2. organizar módulos de cálculo;
3. adicionar novos cálculos por módulo;
4. reforçar captura de resultado;
5. melhorar orçamento guiado;
6. corrigir PDF;
7. preparar roteiro de apresentação.
