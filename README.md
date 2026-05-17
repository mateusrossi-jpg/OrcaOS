# Aferix

**Aferix** é um ERP financeiro local-first para autônomos e pequenos prestadores de serviço. O foco do produto é ajudar o profissional a controlar atendimentos, orçamentos, entradas, saídas, custos, lucro real e pendências financeiras de forma simples, rápida e utilizável no dia a dia.

> Nome técnico do repositório: `Aferix`  
> Nome comercial do produto: **Aferix**

## Direção oficial do produto

O Aferix não é mais um aplicativo de calculadoras técnicas e não deve evoluir como plataforma de módulos técnicos por profissão.

A direção atual é clara:

- gestão financeira do autônomo;
- organização de clientes e atendimentos;
- criação e acompanhamento de orçamentos;
- controle de entradas e saídas;
- cálculo de custos, margem, lucro real e preço mínimo;
- visão rápida de pendências financeiras;
- acompanhamento de orçamentos vencidos, aprovados ou aguardando resposta;
- relatórios financeiros simples e úteis;
- experiência mobile-first, dark premium e objetiva.

Qualquer cálculo futuro dentro do Aferix deve ser **financeiro ou ligado à gestão do negócio**. Cálculos técnicos de elétrica, hidráulica, climatização, engenharia ou outras profissões não fazem parte do escopo atual do produto.

## Problema que o Aferix resolve

Muitos autônomos sabem executar bem o serviço, mas têm dificuldade para responder perguntas essenciais:

- quanto entrou hoje, na semana ou no mês;
- quanto saiu em material, deslocamento, ferramentas e despesas;
- qual orçamento está vencido ou aguardando aprovação;
- qual atendimento está em andamento;
- qual serviço realmente deu lucro;
- qual preço mínimo evita prejuízo;
- quais clientes ainda precisam pagar;
- qual é a situação financeira real do negócio.

O Aferix deve transformar essas informações em uma rotina simples, sem parecer um ERP pesado.

## Público inicial

O foco inicial são profissionais autônomos e pequenos prestadores de serviço que precisam controlar melhor o dinheiro do próprio trabalho:

- eletricistas;
- instaladores;
- técnicos de manutenção;
- prestadores de serviço residencial e comercial;
- profissionais de pequenas reformas;
- autônomos que trabalham por orçamento, visita, execução e recebimento.

O app não deve depender de uma profissão específica. O diferencial está na gestão financeira aplicada à rotina de serviço.

## Fluxo principal esperado

A experiência principal deve ser simples:

1. O usuário abre o aplicativo.
2. A tela inicial mostra o que importa agora:
   - atendimento atual ou mais recente;
   - orçamento vencendo, vencido ou aprovado;
   - entradas e saídas até a data atual;
   - pendências importantes;
   - atalhos para nova ação.
3. O usuário cria ou seleciona um cliente.
4. Cria um atendimento ou orçamento.
5. Informa custos, materiais, mão de obra, deslocamento, margem e condições comerciais.
6. O app calcula preço, margem e lucro real.
7. O orçamento é acompanhado até aprovação, vencimento ou recusa.
8. Após aprovação, o serviço segue para controle financeiro e histórico.

## MVP de publicação

Para publicação inicial, o Aferix deve priorizar estabilidade, clareza e fluxo de uso. O objetivo não é ter muitas funções, mas entregar um núcleo confiável.

### Prioridade do MVP

- dashboard simples e calma;
- clientes;
- atendimentos;
- orçamentos;
- entradas e saídas;
- custos e lucro real;
- pendências financeiras;
- exportação ou relatório simples quando disponível;
- identidade visual dark premium com amarelo como cor principal;
- experiência Android/mobile-first.

### Fora do escopo do MVP

- calculadoras técnicas;
- módulos técnicos por profissão;
- marketplace;
- automações complexas;
- dashboards avançados;
- cloud/sincronização complexa;
- múltiplas áreas profissionais;
- relatórios técnicos avançados;
- expansão para ERP completo.

Esses temas só devem ser considerados depois que o núcleo financeiro estiver validado com usuários reais.

## Estratégia de evolução

A evolução deve ser progressiva:

1. **MVP financeiro estável**: fluxo principal, visual consistente e dados locais confiáveis.
2. **Beta fechado**: teste com usuários reais, coleta de feedback e correção de fricções.
3. **Publicação inicial**: Play Store com escopo controlado e comunicação clara.
4. **Melhorias financeiras**: relatórios melhores, métricas de lucro, histórico e recorrência de uso.
5. **Recursos futuros opcionais**: cloud, automações leves de agenda/orçamento/cobrança, dashboards avançados e marketplace de orçamentos, somente se fizerem sentido após validação.

## Princípios do produto

- Menos telas, mais fluxo.
- Uma função deve ter um caminho principal, sem duplicação espalhada.
- A dashboard deve ser calma, objetiva e útil.
- O app deve ajudar o usuário a decidir financeiramente, não apenas registrar dados.
- O visual deve ser premium, escuro, consistente e sem excesso de informação.
- O amarelo é a cor principal de seleção, destaque e ação.
- A arquitetura deve permitir crescimento, mas sem antecipar complexidade.
- Local-first e offline-first continuam sendo princípios importantes do MVP.

## Estrutura inicial

```text
Aferix/
├── docs/
├── src/
│   ├── app/
│   ├── core/
│   ├── data/
│   ├── features/
│   └── styles/
└── tests/
```

## Desenvolvimento

Base usando React + TypeScript + Vite.

```bash
npm install
npm run dev
```

Antes de publicar ou chamar testadores:

```bash
npm run rc:check
```

## Documentos de release e beta

- `docs/RELEASE_HANDOFF_0.1.0_RC1.md`
- `docs/BETA_FECHADO_FECHAMENTO.md`
- `docs/PLAY_INTERNAL_TEST_RELEASE_NOTES.md`
- `docs/BETA_TESTER_FEEDBACK_FORM.md`
- `docs/BETA_TESTER_INVITE_MESSAGE.md`
- `docs/PLAY_CONSOLE_SUBMISSION_CHECKLIST.md`
- `docs/ANDROID_REAL_DEVICE_TEST.md`
- `docs/play-console-release.md`

Documentos antigos que ainda mencionem OrçaOS, calculadoras técnicas, módulos por profissão ou plataforma técnica devem ser revisados, substituídos ou removidos antes da publicação final.

## Aviso de escopo

O Aferix deve ser tratado como um produto financeiro para gestão de serviços autônomos. Qualquer funcionalidade que aumente complexidade sem melhorar diretamente controle financeiro, orçamento, atendimento ou lucro real deve ser adiada.