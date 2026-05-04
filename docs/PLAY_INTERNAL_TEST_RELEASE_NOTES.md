# OrçaOS - Notas do teste interno

Versão: `0.1.0-rc.1`

## Resumo para testadores

Esta versão reorganiza o OrçaOS como um assistente de atendimento técnico, começando pelo fluxo real de campo:

```text
Cliente -> Atendimento -> Levantamento -> Cálculos -> Orçamento -> Aprovação -> OS -> Execução -> Histórico
```

O objetivo do teste é validar se um profissional novo consegue entender o app, criar um atendimento, levantar dados, calcular, montar orçamento e retomar o trabalho sem orientação externa.

## O que testar primeiro

1. Abrir o app pela primeira vez e conferir splash/intro curta.
2. Confirmar que, na segunda abertura, o app entra direto.
3. Usar a Home e responder: "o que quero fazer agora?".
4. Criar um atendimento guiado.
5. Continuar sem cliente e depois testar cliente vinculado.
6. Registrar levantamento com ambiente, serviço, material, medição e observação.
7. Usar um cálculo avulso.
8. Usar um cálculo vinculado ao atendimento.
9. Montar orçamento manual rápido.
10. Montar orçamento a partir do atendimento.
11. Marcar orçamento como enviado.
12. Marcar orçamento como aprovado.
13. Confirmar que `Converter em OS` só aparece depois da aprovação.
14. Abrir catálogo e cadastrar material/serviço.
15. Abrir lista de compra do cliente.
16. Abrir financeiro simples e conferir lucro estimado.
17. Abrir relatório.
18. Fazer backup local.
19. Fechar e reabrir o app para conferir persistência.

## Pontos de atenção

- O app é local-first: dados ficam no dispositivo/navegador.
- Login não é obrigatório para uso básico.
- Pro/Loja está preparado para validação assistida, sem cobrança automática nesta versão.
- Financeiro é gerencial, não fiscal.
- Cálculos são apoio técnico e não substituem norma, projeto, ART/RRT, laudo ou responsabilidade profissional.
- Busca online de materiais é estrutura auxiliar/futura; cadastro manual e catálogo local continuam sendo o caminho principal.

## Artefatos

```text
APK debug:
android/app/build/outputs/apk/debug/app-debug.apk

AAB release:
android/app/build/outputs/bundle/release/app-release.aab
```

## Critério de aprovação do beta interno

O beta interno pode avançar para testadores externos quando:

- o roteiro principal passar em pelo menos um Android real;
- não houver tela branca, travamento na abertura ou perda inesperada de dados;
- os textos de atendimento/OS estiverem claros;
- o orçamento puder ser copiado/compartilhado;
- o backup local for encontrado sem dificuldade;
- o AAB subir na Play Console sem erro bloqueante.

## Feedback esperado

Peça aos testadores que respondam:

1. Em que ponto você ficou perdido?
2. O que você esperava encontrar na Home?
3. O orçamento ficou fácil de montar e enviar?
4. Algum cálculo gerou dúvida ou pareceu sem explicação?
5. O app parece útil em campo ou ainda parece pesado?
6. O que impediria você de usar em um atendimento real?

