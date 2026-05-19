# AFERIX — Rodada Final de Estabilização e Testes

Use este prompt no Gemini CLI para executar a rodada final de revisão, estabilização, responsividade e testes completos do Aferix.

```text
Atue como Engenheiro Front-end Sênior, QA Engineer, Product Designer mobile-first e Arquiteto de Produto.

Estamos entrando na rodada final de revisão, estabilização e testes do Aferix.

Objetivo:
Revisar o app inteiro, abrir todas as abas, testar todos os fluxos principais, corrigir quebras visuais, navegação incorreta, responsividade mobile e problemas de continuidade antes do beta.

NÃO invente funcionalidades novas.
NÃO reescreva o app inteiro.
NÃO mude a proposta do produto.
NÃO adicione complexidade desnecessária.

Prioridade absoluta:
estabilidade, coerência, responsividade, fluxo correto e build funcionando.

────────────────────────
1. ESCOPO DO PRODUTO
────────────────────────

O Aferix é um app financeiro/orçamentário para autônomos e pequenos prestadores de serviço.

Escopo correto:
- clientes;
- atendimentos/serviços;
- orçamentos;
- itens;
- custos;
- margem/lucro;
- financeiro;
- relatórios;
- PDF;
- configurações;
- licença/plano futuro.

Fora do escopo do beta:
- calculadoras técnicas de elétrica;
- base técnica;
- ERP técnico avançado;
- estoque complexo;
- telas experimentais quebradas;
- recursos que não estejam prontos.

────────────────────────
2. TESTE OBRIGATÓRIO DE TODAS AS ABAS
────────────────────────

Abrir e testar TODAS as entradas visíveis do app:

Menu principal:
- Início
- Orçamentos
- Clientes
- Atendimentos/Serviços
- Financeiro
- Relatórios
- Configurações
- Licença Pro

Dentro de Orçamentos:
- Cliente
- Atendimento
- Itens
- Custos
- Revisão
- Finalizar/Enviar
- PDF

Dentro de Clientes:
- Painel
- Clientes
- Atendimentos/Serviços
- Novo cliente
- Novo atendimento/serviço
- Busca

Dentro de Financeiro:
- visão geral
- cards
- valores
- margem/lucro
- histórico se existir

Dentro de Relatórios:
- cards
- listas
- totais
- estados vazios

Dentro de Configurações:
- perfil
- backup
- preferências
- licença/sobre
- qualquer subaba existente

Critério:
Nenhuma aba pode ficar morta, vazia sem explicação, quebrada ou inacessível.

────────────────────────
3. TESTE DE FLUXO SEQUENCIAL REAL
────────────────────────

Simular uso real completo:

1. Abrir app
2. Ir para Início
3. Criar cliente
4. Criar atendimento/serviço
5. Criar orçamento
6. Selecionar cliente
7. Vincular atendimento
8. Adicionar itens
9. Inserir custos
10. Revisar orçamento
11. Gerar/visualizar PDF
12. Finalizar ou marcar status
13. Voltar para Home
14. Abrir orçamento pendente
15. Confirmar que ele abre direto na edição/detalhe correto
16. Abrir cliente relacionado
17. Abrir financeiro
18. Abrir relatórios
19. Voltar sem perder contexto

Corrigir qualquer ponto onde:
- o usuário se perde;
- a tela volta para lugar errado;
- o app não preserva contexto;
- botão não abre o destino esperado;
- orçamento pendente não abre diretamente;
- etapa do wizard abre fora de ordem;
- o fluxo pula etapas importantes.

────────────────────────
4. ORDEM CORRETA DO ORÇAMENTO
────────────────────────

O orçamento deve seguir ordem natural:

1. Cliente
2. Atendimento/serviço
3. Itens
4. Custos
5. Revisão
6. Finalizar/PDF

Corrigir se:
- abrir direto em escopo/revisão;
- abrir direto em custos;
- mostrar valores muito cedo;
- não permitir voltar corretamente;
- não permitir avançar corretamente;
- botões “Voltar” e “Próximo” não respeitarem sequência.

────────────────────────
5. RESPONSIVIDADE MOBILE-FIRST
────────────────────────

Testar como iPhone/Safari.

Corrigir:
- overflow horizontal;
- cards pequenos demais;
- blocos comprimidos;
- textos cortados;
- botões minúsculos;
- grids desktop forçados no mobile;
- espaçamento ruim;
- scroll estranho;
- teclado cobrindo campos;
- inputs que não crescem;
- textareas que não autoajustam;
- cards que não aumentam conforme conteúdo.

Regras:
- mobile deve ser coluna única na maior parte das telas;
- cards devem ter width: 100%;
- evitar height fixo;
- usar min-height apenas quando necessário;
- permitir height: auto;
- usar clamp(), max-width, flex-wrap e grid responsivo.

────────────────────────
6. AUTOAJUSTE DE CAMPOS E CARDS
────────────────────────

Corrigir todos os campos de texto longo.

Textareas devem crescer conforme digitação em:
- descrição;
- observações;
- escopo;
- atendimento;
- cliente;
- notas;
- condições;
- mensagens.

Cards devem crescer conforme conteúdo.

Nunca permitir:
- texto cortado;
- sobreposição;
- campo escondido;
- card pequeno demais;
- conteúdo vazando.

────────────────────────
7. INPUTS MONETÁRIOS
────────────────────────

Corrigir todos os campos de dinheiro.

Problemas já vistos:
- valor inicial não some;
- campo mantém “1” anterior;
- digitação vira texto cru;
- “012” aparece errado;
- teclado errado no iPhone.

Todos os campos monetários devem:
- usar teclado numérico/decimal adequado;
- formatar BRL corretamente;
- limpar valor anterior ao focar quando for placeholder/default;
- impedir texto cru;
- salvar número corretamente;
- exibir moeda corretamente.

Exemplos:
12 → R$ 12,00
1250 → R$ 1.250,00
0,12 → R$ 0,12

Nunca deixar:
012
0012
valor antigo grudado no novo.

────────────────────────
8. PDF
────────────────────────

Revisar PDF completamente.

Critérios:
- PDF final continua A4;
- preview mobile deve caber na tela;
- não cortar laterais;
- não quebrar colunas;
- não parecer print do app;
- não parecer HTML exportado;
- contraste forte;
- tipografia legível;
- total final destacado;
- amarelo discreto;
- aparência premium minimalista.

Corrigir:
- escala do preview;
- overflow horizontal;
- tabela grande demais;
- título cortado;
- texto apagado;
- colunas comprimidas;
- PDF ilegível no iPhone.

────────────────────────
9. LISTAS E CARDS
────────────────────────

Revisar:
- modelos de serviço;
- estoque/materiais;
- itens do orçamento;
- orçamentos pendentes;
- atendimentos recentes;
- clientes;
- relatórios;
- financeiro.

Corrigir:
- blocos vazios;
- ícones fantasmas;
- cards pequenos demais;
- botões grandes demais ou pequenos demais;
- textos quebrando sem necessidade;
- lista com sobreposição;
- botão remover exagerado;
- ações escondidas.

O card deve sempre responder:
- o que é?
- de quem é?
- qual status?
- qual valor?
- qual próxima ação?

────────────────────────
10. MODAIS E ALERTAS
────────────────────────

Remover uso de:
- window.alert;
- window.confirm;
- diálogos nativos do navegador.

Substituir por modais próprios do Aferix:
- dark premium;
- responsivos;
- com botões claros;
- sem travar visualmente o Safari.

Exemplo:
Remover item?
Cancelar / Remover

────────────────────────
11. PADRONIZAÇÃO DE NOMES
────────────────────────

Auditar todos os textos visíveis.

Evitar mistura confusa entre:
- Atendimento
- Serviço
- Execução
- Ordem de Serviço

Escolher padrão consistente.

Sugestão para beta:
- Menu: Atendimentos
- Dentro do fluxo: Atendimento/serviço quando necessário
- Itens do orçamento: Serviço ou Material
- Não usar “execuções” como termo principal.

Remover textos antigos:
- cálculo técnico;
- relatório técnico;
- base técnica;
- OrçaOS antigo;
- elétrica técnica quando não for necessário.

────────────────────────
12. HOME
────────────────────────

Revisar Home.

Corrigir:
- cards comprimidos;
- “Orçamentos Pendentes” quebrando texto demais;
- botão “Ver Todos” desalinhado;
- data ocupando lugar estranho;
- card não clicável;
- informações pouco úteis.

Obrigatório:
- card de orçamento pendente deve abrir direto o orçamento;
- card de atendimento recente deve abrir direto atendimento;
- botões devem funcionar;
- estados vazios devem ser bonitos e claros.

────────────────────────
13. BUILD E TESTES
────────────────────────

Executar:
- npm install se necessário;
- npm run build;
- npm run lint se existir;
- npm run test se existir.

Corrigir erros de:
- TypeScript;
- imports;
- CSS;
- build;
- rotas;
- componentes não usados;
- variáveis quebradas.

Não finalizar sem build funcionando.

────────────────────────
14. ENTREGA ESPERADA
────────────────────────

Ao final, entregar resumo técnico com:

1. Arquivos alterados.
2. Bugs corrigidos.
3. Fluxos testados.
4. Pendências reais que sobraram.
5. Resultado do build.
6. Próximos riscos antes do beta.

────────────────────────
15. CRITÉRIOS FINAIS DE ACEITE
────────────────────────

A rodada só estará concluída se:

- todas as abas abrirem;
- nenhum menu estiver morto;
- fluxo sequencial funcionar;
- orçamento abrir no ponto correto;
- orçamentos pendentes abrirem direto;
- PDF preview funcionar no mobile;
- PDF final parecer profissional;
- cards forem responsivos;
- campos crescerem conforme digitação;
- inputs monetários funcionarem;
- não houver alert nativo;
- nomenclatura estiver consistente;
- app estiver usável no iPhone;
- build estiver verde.

Prioridade:
fechar um beta estável, simples, coerente e apresentável.
```
