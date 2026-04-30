# OrçaOS — estratégia futura de dois aplicativos

Este documento registra a decisão estratégica de preparar o OrçaOS para uma possível separação futura entre aplicativo profissional/empresa e aplicativo do cliente.

## Ideia central

Avaliar a possibilidade de produzir dois aplicativos conectados:

1. **OrçaOS Empresa / OrçaOS Profissional**
2. **OrçaOS Cliente**

A ideia não é obrigatoriamente criar dois apps agora. A decisão atual é preparar a arquitetura para que isso seja possível no futuro sem reescrever tudo.

## OrçaOS Empresa / Profissional

Versão completa, voltada para:

- eletricistas;
- técnicos autônomos;
- empresas de prestação de serviço;
- integradores;
- pequenos negócios técnicos;
- profissionais que precisam de orçamento, OS, relatório, cálculos, estoque e gestão.

Funcionalidades esperadas:

- cálculos técnicos;
- orçamento guiado;
- levantamento por cômodo/ambiente;
- cadastro de cliente;
- ordens de serviço;
- relatórios técnicos;
- propostas comerciais;
- cadastro de materiais e serviços;
- fornecedores;
- compras;
- estoque;
- margem de lucro;
- impostos gerenciais;
- controle financeiro básico;
- versões Pro/pacotes/licenças.

Esta é a versão principal de trabalho do profissional.

## OrçaOS Cliente

Versão mais simples, voltada para o cliente final.

Possíveis funções:

- receber orçamento/proposta;
- visualizar diagnóstico técnico;
- aprovar ou rejeitar proposta;
- acompanhar status da OS;
- ver fotos/observações do serviço;
- consultar histórico de atendimentos;
- receber lembretes de manutenção preventiva;
- confirmar dados de contato/endereço;
- conversar ou enviar observações para o profissional.

A versão cliente deve ser muito mais simples, sem expor cálculos complexos, estoque, margem, impostos ou gestão interna do profissional.

## Comunicação entre os apps

No futuro, os dois apps podem se comunicar:

```text
OrçaOS Empresa cria orçamento/OS/relatório
→ envia para OrçaOS Cliente
→ cliente visualiza/aprova
→ profissional recebe retorno
→ OS muda de status
```

Possíveis modos de comunicação futura:

- link compartilhável;
- PDF com QR Code;
- login do cliente;
- painel web simples;
- app separado do cliente;
- notificação por WhatsApp/e-mail;
- backend/API central.

## Estratégia recomendada agora

Não criar dois apps imediatamente.

Agora o foco deve ser:

1. manter um único código-base;
2. criar papéis/perfis de uso desde cedo;
3. separar dados internos do profissional dos dados visíveis ao cliente;
4. modelar orçamento, OS e relatório pensando em compartilhamento futuro;
5. evitar acoplar lógica de gestão profissional à tela do cliente;
6. manter o app publicável rapidamente para validação real.

## Implicações arquiteturais

A arquitetura deve prever:

- usuário profissional;
- cliente final;
- empresa/profissional autônomo;
- permissões por papel;
- orçamento com versão interna e versão cliente;
- relatório com versão técnica e versão simplificada;
- OS com status compartilhável;
- dados privados de custo/margem/impostos invisíveis ao cliente;
- dados públicos de proposta/descrição/valor visíveis ao cliente.

## Regra de privacidade de dados comerciais

O cliente nunca deve ver:

- custo real da peça;
- margem de lucro;
- preço de fornecedor;
- impostos gerenciais internos;
- markup;
- observações internas de negociação;
- condições internas de compra;
- estoque interno, salvo se o profissional quiser exibir disponibilidade.

O cliente pode ver:

- descrição do serviço;
- preço final;
- validade da proposta;
- formas de pagamento;
- prazo estimado;
- diagnóstico;
- fotos/observações liberadas;
- status da OS;
- recomendações técnicas simplificadas.

## Relevância para o roadmap atual

Mesmo que o app cliente fique para depois, o app atual deve já preparar:

- orçamento com campos públicos e internos;
- relatórios com modo técnico e modo cliente;
- OS com status;
- dados do cliente bem estruturados;
- proposta compartilhável;
- PDF/relatório visualmente profissional;
- cadastro de empresa/profissional.

## Decisão atual

Manter o foco no **OrçaOS Empresa/Profissional** como produto inicial, porque ele gera mais valor imediato e pode virar fonte de receita.

O **OrçaOS Cliente** fica como evolução estratégica futura, possivelmente começando como:

1. link público de proposta;
2. PDF com QR Code;
3. área simples de acompanhamento;
4. app separado somente depois da validação.
