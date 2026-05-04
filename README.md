# OrçaOS

**OrçaOS** é um ERP técnico leve para prestadores de serviço, começando pelo atendimento real do profissional em campo: cliente, levantamento, cálculos, orçamento e relatório. O produto organiza atendimentos, propostas comerciais, documentos técnicos, catálogo e histórico local sem transformar a rotina do técnico em um sistema pesado.

> Nome técnico do repositório: `OrcaOS`  
> Nome comercial do produto: **OrçaOS**

## Visão do produto

O OrçaOS deve ser mais do que um aplicativo de cálculos. Ele deve unir:

- calculadoras técnicas;
- atendimento guiado com cliente, ambientes, serviços, materiais, medições e observações;
- orçamento de mão de obra, materiais, deslocamento e condições comerciais;
- relatórios de visita técnica;
- diagnóstico com fotos e observações;
- cadastro de clientes;
- conversão em ordem de serviço somente depois da aprovação do orçamento;
- catálogo de serviços, materiais, composições e fornecedores;
- histórico de atendimento;
- lembretes de manutenção preventiva;
- gestão simples local-first;
- evolução futura para módulos por profissão e recursos Pro.

## Público inicial

O foco inicial será em **eletricistas e profissionais de baixa tensão**, com abertura futura para:

- automação residencial;
- ar-condicionado;
- manutenção predial;
- motores e bobinagem;
- hidráulica;
- pintura;
- pequenos prestadores de serviço;
- técnicos autônomos e integradores.

## Estratégia de evolução

O projeto será dividido em fases:

1. **MVP técnico**: calculadoras elétricas, layout profissional e base modular.
2. **Orçamentos**: clientes, serviços, materiais, mão de obra e PDF.
3. **Relatórios técnicos**: visita, diagnóstico, imagens e recomendações.
4. **Execução aprovada**: conversão do orçamento em OS, status, histórico, retorno e manutenção preventiva.
5. **Plataforma modular**: novas profissões, módulos Pro e expansão para ERP.

## Estrutura inicial

```text
OrcaOS/
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

Base inicial usando React + TypeScript + Vite.

```bash
npm install
npm run dev
```

Antes de publicar ou chamar testadores:

```bash
npm run rc:check
```

Documentos do beta fechado:

- `docs/RELEASE_HANDOFF_0.1.0_RC1.md`
- `docs/BETA_FECHADO_FECHAMENTO.md`
- `docs/PLAY_INTERNAL_TEST_RELEASE_NOTES.md`
- `docs/BETA_TESTER_FEEDBACK_FORM.md`
- `docs/BETA_TESTER_INVITE_MESSAGE.md`
- `docs/PLAY_CONSOLE_SUBMISSION_CHECKLIST.md`
- `docs/ANDROID_REAL_DEVICE_TEST.md`
- `docs/play-console-release.md`
- `docs/ai/ORCAOS_RELEASE_CANDIDATE_RC2.md`
- `docs/ai/ORCAOS_BETA_FECHADO_SIMULACAO_USUARIO_REAL.md`
- `docs/ai/ORCAOS_COMMERCIAL_GATE_DEPLOYMENT.md`

## Princípios do projeto

- Simples para o usuário comum.
- Técnico o suficiente para gerar confiança.
- Cálculos separados da interface.
- Documentação junto com o código.
- Estrutura preparada para crescer sem virar bagunça.
- Gratuito útil, Pro com recursos avançados.
- Design bonito, direto e prático para uso em campo.

## Aviso técnico

Os cálculos devem ser validados com normas, tabelas, testes práticos e revisão profissional antes de qualquer uso como recomendação definitiva em instalações reais. A primeira fase do projeto usa funções e tabelas base como ponto de partida para validação progressiva.
