# AFERIX — Prompt de Refatoração do PDF Premium

Use este prompt no Gemini CLI para refatorar completamente o PDF de orçamento do Aferix, corrigir input monetário, lista de itens e modal de remoção.

```text
Refatore completamente o sistema de PDF do Aferix.

O PDF atual está estruturalmente fraco e visualmente feio.

Problemas observados:
- aparência de print/export HTML;
- contraste ruim;
- textos apagados;
- hierarquia visual inexistente;
- excesso de cinza claro;
- tabela sem força;
- composição desequilibrada;
- espaçamento ruim;
- visual sem identidade premium;
- aparência de sistema antigo;
- documento não transmite profissionalismo comercial.

Objetivo:
Transformar o PDF do Aferix em um documento comercial premium minimalista.

────────────────────────
1. DIREÇÃO VISUAL OFICIAL
────────────────────────

Referências aprovadas:
- Minimalista Premium #4
- Minimalista Premium #1
- Minimalista Premium #3

Direção:
- clean;
- premium;
- elegante;
- moderno;
- minimalista;
- comercial;
- muito legível.

O PDF NÃO deve:
- parecer print do app;
- parecer HTML exportado;
- parecer ERP antigo;
- usar dark theme;
- usar excesso de bordas;
- usar caixas pesadas;
- usar gradientes exagerados.

────────────────────────
2. ESTRUTURA IDEAL
────────────────────────

Estrutura correta do PDF:

1. Logo / empresa
2. Título do orçamento
3. Dados do cliente
4. Resumo do serviço
5. Tabela de itens
6. Resumo financeiro
7. Observações
8. Contato/finalização

Tudo com:
- espaçamento amplo;
- respiro visual;
- alinhamento forte;
- hierarquia clara.

────────────────────────
3. IDENTIDADE VISUAL
────────────────────────

Visual:
- fundo branco;
- preto/cinza escuro para textos;
- amarelo apenas como detalhe;
- sem dark mode no PDF;
- tipografia elegante;
- aparência sofisticada.

Usar amarelo:
- pequenos títulos;
- detalhes;
- status;
- linhas discretas;
- destaques leves.

Não exagerar no amarelo.

────────────────────────
4. TIPOGRAFIA
────────────────────────

Melhorar drasticamente:
- contraste;
- peso dos títulos;
- tamanhos;
- espaçamento;
- leitura.

Problema atual:
textos estão apagados demais.

Corrigir:
- preto/cinza escuro real;
- títulos fortes;
- subtítulos suaves;
- números financeiros legíveis.

O total final deve ter destaque forte.

────────────────────────
5. TABELA DE ITENS
────────────────────────

A tabela atual está fraca.

Criar tabela premium:

Colunas:
- descrição;
- categoria;
- quantidade;
- unitário;
- total.

Melhorar:
- alinhamento;
- padding;
- linhas;
- contraste;
- largura.

Evitar:
- excesso de bordas;
- aparência burocrática;
- aparência técnica antiga.

────────────────────────
6. RESUMO FINANCEIRO
────────────────────────

O resumo financeiro deve ser elegante.

Mostrar:
- subtotal;
- desconto;
- total final.

Opcional:
- impostos;
- operacional;
- margem.

Mas de forma discreta.

O TOTAL FINAL deve ser protagonista visual.

────────────────────────
7. OBSERVAÇÕES
────────────────────────

Adicionar área limpa para:
- observações;
- validade;
- condições;
- detalhes finais.

Sem poluição visual.

────────────────────────
8. RESPONSIVIDADE E EXPORTAÇÃO
────────────────────────

O PDF deve:
- exportar limpo;
- imprimir corretamente;
- funcionar no iPhone;
- funcionar no Android;
- funcionar ao compartilhar no WhatsApp;
- abrir corretamente no preview mobile.

Evitar:
- cortes;
- overflow;
- escalas quebradas;
- fontes pequenas demais.

────────────────────────
9. REMOVER APARÊNCIA DE APP
────────────────────────

O PDF NÃO deve carregar:
- cards escuros do app;
- visual do dashboard;
- componentes do tema dark;
- aparência de tela renderizada.

PDF é documento comercial independente.

────────────────────────
10. INPUT MONETÁRIO
────────────────────────

Corrigir também o input “R$ Unit.”:

Problemas:
- aceita texto cru;
- placeholder/valor inicial não desaparece corretamente;
- quando existe “1” inicial, ele não some ao digitar o valor;
- não formata moeda;
- permite aparência quebrada.

Corrigir:
- máscara monetária BRL;
- teclado numérico correto;
- placeholder some ao digitar;
- valor inicial não deve ficar preso no campo;
- valor formatado em tempo real.

Exemplo:
12 → R$ 12,00
1250 → R$ 1.250,00

Nunca deixar:
012
0012
texto cru
valor anterior grudado com valor novo.

────────────────────────
11. MODAL DE REMOÇÃO
────────────────────────

Substituir alert/confirm nativo do navegador.

Criar modal próprio Aferix:
- dark premium;
- discreto;
- elegante;
- botões claros;
- animação suave.

Texto sugerido:
Remover item?
Esta ação remove o item deste orçamento.

Botões:
- Cancelar
- Remover

Nunca usar confirm() nativo.

────────────────────────
12. LISTA DE ITENS
────────────────────────

Corrigir:
- sobreposição;
- textos cortados;
- botões vermelhos exagerados;
- cards quebrados;
- largura;
- scroll ruim;
- remoção visual agressiva demais.

Itens devem parecer:
- organizados;
- premium;
- comerciais;
- fáceis de revisar no mobile.

O botão de remover deve ser discreto, pequeno e claro.

────────────────────────
13. FINALIZAÇÃO E BOTÕES
────────────────────────

Corrigir tela “Finalizar e Enviar”.

Problemas observados:
- botões amarelos colados;
- espaçamento ruim;
- hierarquia confusa;
- ações parecem blocos grudados.

Corrigir:
- botões em coluna com espaçamento adequado;
- largura 100% no mobile;
- ação principal clara;
- ação secundária visualmente diferente;
- status organizado abaixo das ações principais.

────────────────────────
14. CRITÉRIOS DE ACEITE
────────────────────────

A rodada só estará correta se:

- PDF parecer documento premium real;
- PDF ficar legível;
- PDF não parecer print do app;
- PDF não parecer HTML exportado;
- tipografia estiver forte;
- tabela estiver organizada;
- total final tiver destaque;
- amarelo estiver elegante;
- input monetário estiver correto;
- placeholder/valor inicial sumir corretamente;
- modal próprio substituir alert/confirm nativo;
- lista de itens não quebrar;
- botões finais tiverem espaçamento correto;
- exportação mobile funcionar;
- build funcionar.

Prioridade absoluta:
qualidade comercial e profissional do PDF, sem quebrar o fluxo mobile.
```
