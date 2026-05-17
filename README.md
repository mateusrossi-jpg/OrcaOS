# Aferix

**Aferix** é um ERP financeiro local-first para prestadores de serviço, focado na clareza do lucro real: cliente, levantamento, precificação, orçamento e fluxo de caixa. O produto organiza atendimentos e propostas comerciais sem transformar a rotina do autônomo em um sistema complexo.

## Visão do produto

O Aferix é centrado na saúde financeira do pequeno prestador de serviço:

- **Clientes e Atendimentos**: Gestão de contatos e histórico de serviços.
- **Levantamento de Campo**: Checklist de ambientes, materiais e mão de obra.
- **Precificação Inteligente**: Cálculos de margem real, markup, taxas e lucro líquido.
- **Orçamentos e Propostas**: Geração de documentos profissionais para aprovação.
- **Controle Financeiro**: Acompanhamento de entradas, saídas e lucro por período.
- **Local-First & Offline**: Seus dados ficam no seu dispositivo, funcionando em qualquer lugar.

## Público-alvo

O foco são **profissionais autônomos e pequenos prestadores de serviço** (manutenção, instalação, reformas, consultoria técnica) que precisam saber exatamente quanto estão ganhando em cada serviço.

## Estrutura do Projeto

```text
Aferix/
├── src/
│   ├── app/        # Telas e componentes da interface
│   ├── core/       # Regras de negócio, cálculos financeiros e acesso
│   ├── features/   # Módulos do ERP (clientes, orçamentos, financeiro)
│   └── styles/     # Identidade visual Dark Premium
└── docs/           # Documentação e planejamento
```

## Desenvolvimento

Baseado em React + TypeScript + Vite.

```bash
npm install
npm run dev
```

## Princípios

- **Simplicidade**: Interface limpa e direta para uso rápido em campo.
- **Privacidade**: Dados armazenados localmente por padrão.
- **Profissionalismo**: Propostas e relatórios que geram confiança no cliente.
- **Estabilidade**: Foco em um fluxo operacional robusto e sem redundâncias.
