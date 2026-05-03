# OrçaOS

**OrçaOS** é um ERP técnico leve para prestadores de serviço, começando por cálculos, campo, orçamento e relatórios. O produto organiza clientes, OS, levantamento de campo, proposta comercial, documentos técnicos, catálogo e histórico local sem transformar a rotina do técnico em um sistema pesado.

> Nome técnico do repositório: `OrcaOS`  
> Nome comercial do produto: **OrçaOS**

## Visão do produto

O OrçaOS deve ser mais do que um aplicativo de cálculos. Ele deve unir:

- calculadoras técnicas;
- campo com ambientes, serviços, materiais e observações;
- orçamento de mão de obra, materiais, deslocamento e condições comerciais;
- relatórios de visita técnica;
- diagnóstico com fotos e observações;
- cadastro de clientes;
- ordens de serviço;
- catálogo de serviços, materiais, composições e fornecedores;
- histórico de atendimento;
- lembretes de manutenção preventiva;
- gestão simples local-first;
- evolução futura para módulos por profissão e recursos Pro.

## Público inicial

A primeira versão será focada em **eletricistas e profissionais de baixa tensão**, com abertura futura para:

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
4. **Ordens de serviço**: status, histórico, retorno e manutenção preventiva.
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

- `docs/ai/ORCAOS_RELEASE_CANDIDATE_RC2.md`
- `docs/ai/ORCAOS_BETA_FECHADO_SIMULACAO_USUARIO_REAL.md`
- `docs/ai/ORCAOS_COMMERCIAL_GATE_DEPLOYMENT_V1.md`

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
