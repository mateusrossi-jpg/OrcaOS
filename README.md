# Aferix

**Aferix** é um ERP financeiro local-first para autônomos e pequenos prestadores de serviço. O foco do produto é ajudar o profissional a controlar atendimentos, orçamentos, entradas, saídas, custos, lucro real e pendências financeiras de forma simples, rápida e utilizável no dia a dia.

## Visão do produto

O Aferix é centrado na saúde financeira do pequeno prestador de serviço:

- **Clientes e Atendimentos**: Gestão de contatos e histórico de serviços.
- **Levantamento de Campo**: Checklist de ambientes, materiais e mão de obra.
- **Precificação Inteligente**: Cálculos de margem real, markup, taxas e lucro líquido.
- **Orçamentos e Propostas**: Geração de documentos profissionais para aprovação.
- **Controle Financeiro**: Acompanhamento de entradas, saídas e lucro por período.
- **Local-First & Offline**: Seus dados ficam no seu dispositivo, funcionando em qualquer lugar.

## Público-alvo

O foco inicial são profissionais autônomos e pequenos prestadores de serviço que precisam controlar melhor o dinheiro do próprio trabalho:

- eletricistas;
- instaladores;
- técnicos de manutenção;
- prestadores de serviço residencial e comercial;
- profissionais de pequenas reformas;
- autônomos que trabalham por orçamento, visita, execução e recebimento.

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

Base usando React + TypeScript + Vite.

```bash
npm install
npm run dev
```

## Princípios

- **Simplicidade**: Interface limpa e direta para uso rápido em campo.
- **Privacidade**: Dados armazenados localmente por padrão.
- **Profissionalismo**: Propostas e relatórios que geram confiança no cliente.
- **Estabilidade**: Foco em um fluxo operacional robusto e sem redundâncias.

## Aviso de escopo

O Aferix deve ser tratado como um produto financeiro para gestão de serviços autônomos. Qualquer funcionalidade que aumente complexidade sem melhorar diretamente controle financeiro, orçamento, atendimento ou lucro real deve ser adiada.
