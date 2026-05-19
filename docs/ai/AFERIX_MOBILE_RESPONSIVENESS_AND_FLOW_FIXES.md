# AFERIX — Prompt de Responsividade Mobile e Continuidade de Fluxo

Use este prompt no Gemini CLI para corrigir responsividade, preview de PDF mobile, continuidade de fluxo e padronização visual do Aferix.

```text
Corrija a responsividade e a continuidade mobile do Aferix.

Problemas observados no iPhone/Safari:
1. Blocos e cards estão muito pequenos ou mal proporcionados.
2. A tela web não está autoajustando corretamente ao dispositivo.
3. Falta responsividade real para mobile.
4. O PDF aparece grande demais na visualização mobile, cortando laterais.
5. “Orçamentos pendentes” não abre direto a edição do orçamento.
6. Ainda aparecem termos “Atendimentos” em pontos onde o fluxo deveria estar padronizado.
7. Cards da Home e listas internas estão com hierarquia ruim.
8. A tela parece desktop comprimido no celular.

Objetivo:
Fazer uma revisão completa de responsividade mobile-first e continuidade de fluxo.

────────────────────────
1. RESPONSIVIDADE GLOBAL
────────────────────────

- Revisar containers principais.
- Remover larguras fixas que quebram no mobile.
- Usar max-width, width: 100%, clamp(), grid responsivo e flex-wrap.
- Garantir que nenhuma tela tenha overflow horizontal.
- Garantir adaptação correta no Safari iPhone.
- Revisar vh/vw excessivos.
- Corrigir espaçamentos quebrados.
- Revisar componentes herdados de desktop.

O app deve parecer:
- mobile-first;
- confortável;
- natural;
- responsivo;
- premium.

────────────────────────
2. CARDS E BLOCOS
────────────────────────

- Cards devem ocupar largura confortável no mobile.
- Evitar blocos pequenos demais.
- Aumentar padding, altura mínima e legibilidade.
- Padronizar espaçamentos.
- Evitar aparência de desktop encolhido.
- Melhorar hierarquia visual.

Problemas atuais:
- cards muito estreitos;
- textos quebrando;
- blocos sem respiro;
- áreas clicáveis pequenas.

────────────────────────
3. PDF MOBILE
────────────────────────

Problema:
O preview do PDF está grande demais e cortando no mobile.

Corrigir:
- preview deve caber dentro da largura do iPhone;
- usar scale responsivo;
- permitir zoom confortável;
- evitar corte lateral;
- evitar overflow horizontal.

IMPORTANTE:
O PDF final continua em A4.
Apenas o preview precisa adaptação mobile.

O preview deve:
- ser legível;
- centralizado;
- elegante;
- confortável de visualizar.

────────────────────────
4. ORÇAMENTOS PENDENTES
────────────────────────

Ao tocar em um orçamento pendente na Home:
- abrir diretamente a edição/detalhe daquele orçamento;
- preservar contexto;
- manter etapa atual;
- evitar abrir lista genérica.

Exemplo correto:
Home → orçamento “Instalação perfis de led” → abrir diretamente o orçamento.

────────────────────────
5. PADRONIZAÇÃO DE NOMES
────────────────────────

Revisar todos os textos visíveis.

Problema:
Ainda existe mistura de:
- Atendimentos;
- Serviços;
- Execuções;
- Ordem de serviço.

Padronizar conforme direção atual do produto.

Usar terminologia consistente:
- menu;
- cards;
- botões;
- títulos;
- fluxo;
- home;
- histórico.

Evitar mistura sem contexto.

────────────────────────
6. HOME MOBILE
────────────────────────

Melhorar:
- cards “Atendimentos Recentes”;
- cards “Orçamentos Pendentes”;
- alinhamentos;
- espaçamento;
- largura;
- títulos;
- datas;
- botões.

Problemas observados:
- texto quebrando excessivamente;
- layout desalinhado;
- botão “Ver Todos” mal encaixado;
- cards sem hierarquia clara.

A Home deve parecer:
- painel premium;
- dashboard moderno;
- simples;
- legível;
- confortável.

────────────────────────
7. MODELOS DE SERVIÇO
────────────────────────

Corrigir seção “Modelos de Serviço”.

Problemas:
- blocos vazios;
- cards muito grandes sem conteúdo;
- excesso de espaço morto;
- alinhamento ruim;
- botão “Adicionar” desproporcional.

Melhorar:
- estrutura dos cards;
- proporção;
- densidade visual;
- hierarquia;
- responsividade.

────────────────────────
8. TESTE SEQUENCIAL
────────────────────────

Testar fluxo completo:
Home → Orçamentos pendentes → editar orçamento → voltar → clientes → orçamento → PDF.

Garantir:
- continuidade;
- contexto preservado;
- navegação lógica;
- retorno correto;
- ausência de telas quebradas.

────────────────────────
9. CRITÉRIOS DE ACEITE
────────────────────────

A rodada só estará correta se:

- não existir overflow horizontal;
- layout adaptar corretamente ao iPhone;
- PDF preview caber na tela;
- cards ficarem proporcionais;
- textos não quebrarem excessivamente;
- Home parecer organizada;
- orçamento pendente abrir diretamente;
- nomenclatura ficar consistente;
- app parecer mobile-first real;
- build funcionar.

Prioridade máxima:
responsividade mobile-first, continuidade de fluxo e experiência confortável no iPhone.
```
