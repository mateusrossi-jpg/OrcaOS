# OrçaOS — Plano mestre até publicação do MVP

Este é o documento vigente para orientar o desenvolvimento do OrçaOS até a primeira versão publicável na Play Store.

Ele consolida as decisões atuais e deve ser usado antes de qualquer expansão de módulo.

---

## 1. Visão atual do produto

O OrçaOS é uma plataforma modular local-first para profissionais de campo.

A versão inicial deve funcionar como um app profissional com:

- cálculos técnicos;
- levantamento de campo;
- orçamento;
- clientes e ordens de serviço;
- relatório técnico;
- proposta/PDF/WhatsApp;
- perfil profissional;
- backup local.

A prioridade do MVP é ser estável, simples e útil em serviço real, antes de crescer como ERP completo.

---

## 2. Regra principal da fase atual

Não expandir módulos novos antes do MVP estar estável.

Prioridades:

1. build limpo;
2. UX simples;
3. cálculos confiáveis;
4. fórmulas explicadas;
5. fluxo Levantamento → Orçamento → Relatório funcionando;
6. backup local validado;
7. app pronto para teste real em celular.

---

## 3. Taxonomia V1 aprovada

A taxonomia final V1 dos cálculos deve ser mantida:

```txt
Cálculos
├── Essenciais
├── Profissões
├── Especialidades
├── Orçamento e gestão
└── Conversores técnicos
```

### Profissões

```txt
├── Elétrica e instalações
├── Redes, segurança e automação residencial
├── Hidráulica
├── Construção civil
├── Pintura e acabamento
└── Refrigeração e climatização
```

### Especialidades

```txt
├── Automação industrial e instrumentação
├── Eletrônica aplicada
├── Motores, comandos e rebobinagem
├── Transformadores
└── Solar fotovoltaico
```

---

## 4. Critério obrigatório de UX dos cálculos

Todo cálculo deve seguir:

- poucos campos obrigatórios;
- campos avançados escondidos;
- resultado direto;
- unidade clara;
- orientação prática;
- fórmula visível em `Como este cálculo é feito`;
- fórmula salva no levantamento/orçamento;
- nada de pedir campos equivalentes desnecessários;
- quando houver muitos campos, dividir em etapas.

---

## 5. Módulos consolidados para o MVP

Os módulos abaixo já foram reorganizados em fluxo humano ou revisados:

```txt
Fundamentos elétricos
Hidráulica
Conversores técnicos
Pintura e acabamento
Construção civil
Orçamento técnico
```

Cada um deve ser validado manualmente antes de avançar.

---

## 6. Validação técnica obrigatória

Rodar:

```bash
npm install
npm run typecheck
npm run build
```

Regras:

- corrigir apenas erros reais;
- não reescrever o app inteiro;
- não criar módulos novos;
- não mexer em `AppOrcaNextOrganized.tsx` sem necessidade;
- não alterar taxonomia V1;
- manter arquitetura local-first.

---

## 7. Fase 1 — Estabilização dos cálculos

Objetivo: garantir que os cálculos principais estão confiáveis e claros.

Checklist:

- abrir todos os módulos consolidados;
- testar pelo menos um cálculo de cada tela;
- confirmar resultado;
- confirmar caixa de fórmula;
- confirmar orientação prática;
- confirmar unidade;
- confirmar campos avançados;
- confirmar envio para levantamento/orçamento.

Saída esperada:

```txt
typecheck passou
build passou
cálculos humanos principais funcionando
```

---

## 8. Fase 2 — Fluxo Levantamento → Orçamento → Relatório

Objetivo: validar que o app já resolve um atendimento real.

Checklist:

1. criar ou ativar uma OS;
2. fazer cálculos técnicos;
3. enviar itens para levantamento;
4. enviar itens para orçamento;
5. converter itens técnicos em proposta;
6. gerar relatório técnico;
7. revisar se fórmulas aparecem nos detalhes;
8. revisar se cliente/OS aparecem onde necessário.

Saída esperada:

```txt
atendimento técnico completo simulável dentro do app
```

---

## 9. Fase 3 — Proposta, PDF e WhatsApp

Objetivo: preparar o uso comercial real.

Checklist:

- revisar proposta comercial;
- revisar dados do cliente;
- revisar itens de orçamento;
- revisar campos de observação;
- revisar identidade profissional;
- revisar texto para WhatsApp;
- revisar exportação/geração de PDF quando disponível.

Saída esperada:

```txt
profissional consegue enviar uma proposta compreensível para cliente
```

---

## 10. Fase 4 — Backup local e dados

Objetivo: garantir que o usuário não perde dados.

Checklist:

- testar clientes;
- testar OS;
- testar cálculos salvos;
- testar levantamento;
- testar orçamento;
- testar backup local;
- testar restauração quando disponível;
- revisar chaves de localStorage e estrutura de dados.

Saída esperada:

```txt
dados principais preservados e exportáveis
```

---

## 11. Fase 5 — Polimento visual e linguagem

Objetivo: deixar a versão inicial mais profissional.

Checklist:

- revisar nomes dos cards;
- revisar contadores;
- revisar descrições;
- revisar mensagens de orientação;
- revisar botões;
- revisar layout mobile;
- revisar telas vazias;
- revisar textos de `Em breve`;
- manter simples e direto.

Saída esperada:

```txt
app compreensível para usuário comum e técnico
```

---

## 12. Fase 6 — Preparação Android/Play Store

Objetivo: preparar a publicação inicial.

Checklist técnico:

- confirmar stack de empacotamento Android;
- definir nome do app;
- definir ícone;
- definir splash screen;
- revisar permissões;
- revisar política de privacidade;
- revisar dados coletados;
- revisar versão do app;
- gerar build de teste;
- testar em celular Android real.

Checklist Play Store:

- nome curto;
- descrição curta;
- descrição completa;
- screenshots;
- categoria;
- política de privacidade;
- contato de suporte;
- classificação de conteúdo;
- formulário de segurança de dados.

Saída esperada:

```txt
build Android testável e material de Play Store preparado
```

---

## 13. Fase 7 — Teste real em campo

Objetivo: validar se o app resolve serviços reais.

Cenários mínimos:

- orçamento elétrico simples;
- pintura simples;
- hidráulica/reservatório;
- construção civil/piso ou parede;
- orçamento técnico com markup e margem;
- relatório com cálculo salvo.

Registrar:

- erro encontrado;
- campo confuso;
- cálculo faltante;
- tela lenta;
- texto ruim;
- melhoria necessária.

---

## 14. Critério para publicar MVP

Só publicar quando:

```txt
npm run typecheck passa
npm run build passa
fluxo principal funciona
backup local validado
nenhum erro crítico em celular
cálculos principais explicam fórmulas
política de privacidade pronta
material da Play Store pronto
```

---

## 15. O que fica para depois do MVP

Não bloquear a primeira publicação por causa de:

- ERP completo;
- múltiplos usuários;
- nuvem;
- login avançado;
- integrações externas;
- marketplace;
- todos os módulos técnicos;
- assinatura completa;
- emissão fiscal;
- automações complexas.

Esses itens entram depois que o app base estiver testado e publicável.

---

## 16. Próximo comando recomendado para Copilot

Use:

```txt
Leia docs/ai/README.md e docs/ai/ORCAOS_MVP_PUBLICATION_MASTER_PLAN.md.
Depois rode npm run typecheck e npm run build.
Corrija apenas erros reais de build/typecheck/import/CSS.
Não crie módulos novos e não altere a taxonomia V1.
Ao final, informe arquivos alterados, erros encontrados e se o build passou.
```
