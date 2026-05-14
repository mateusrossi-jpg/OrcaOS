# Aferix Release Candidate RC2

Data: 2026-05-02
Versao base: 0.1.0-rc.1

## Objetivo Do RC2

Consolidar o Aferix para teste interno final antes do beta fechado comercial controlado. O RC2 endurece producao, orcamento, perfil profissional, backup, Free/Pro, responsividade, testes, roteiro manual e comunicacao legal.

## Mudancas Desde RC1

- Ferramentas de teste Pro escondidas por `VITE_ORCAOS_DEV_TOOLS=false`.
- Orcamento profissional com validade, pagamento, garantia, prazo, deslocamento, taxas, observacoes e status vencido/cancelado.
- Validacoes de proposta para impedir item vazio, quantidade invalida, valor negativo, desconto incoerente e proposta vazia.
- Identidade profissional sincronizada com orcamento e relatorio.
- Backup local/Drive com resumo por tipo de dado, validacao, confirmacao para substituir e botao de recarregar.
- Estados Pro: `active` e `trial` liberam; `expired`, `inactive` e `past_due` ficam Free.
- Polimento mobile-first em cards, botoes, documentos e modais.
- Testes automatizados ampliados para orcamento, backup, Pro e calculos criticos.
- Roteiro manual de simulacao de usuario real criado.
- Termos, privacidade e aviso tecnico visiveis em Configuracoes.

## Riscos Conhecidos Restantes

- Google OAuth e Drive dependem de configuracao externa correta.
- Pagamento automatico e webhook ainda nao fazem parte do beta.
- App permanece local-first; perda de dados e possivel se o usuario nao exportar backup e o navegador limpar armazenamento.
- PDF e relatorio usam impressao do navegador; deve ser validado em celulares reais.
- Catalogo online real por fornecedor ainda e etapa futura.
- ERP completo, estoque avancado e compras ainda nao sao escopo do beta fechado inicial.

## Checklist De Aprovacao

- `npm run rc:check` passa limpo.
- App abre em celular real sem quebra visual.
- Fluxo cliente -> OS -> levantamento -> orcamento -> PDF funciona.
- Orcamento possui validade, pagamento, garantia e deslocamento.
- Pro de teste nao aparece em producao.
- Usuario Free nao acessa Pro indevidamente.
- Assinatura Pro manual/assistida funciona.
- Backup exporta e restaura corretamente.
- Dados persistem apos fechar/reabrir.
- PDF do orcamento esta apresentavel.
- Relatorio esta apresentavel.
- Termos, privacidade e aviso tecnico existem.
- Roteiro manual existe.

## Checklist Mobile

- Inicio sem overflow horizontal.
- Atendimentos com busca/selecionador utilizavel.
- Calculos com cards legiveis e modais ajustados.
- Levantamento com botoes de toque confortaveis.
- Orcamentos com formularios editaveis no celular.
- Preview/Envio sem documento cortado fora da tela.
- Relatorios com botao de PDF acessivel.
- Catalogo sem blocos brancos fora de documento.
- Configuracoes com perfil, conta, legal e backup em coluna.
- Loja / Pro com mensagens claras.

## Checklist Orcamento

- Criar rascunho sem cliente.
- Alertar antes de envio/PDF sem cliente.
- Bloquear proposta sem item.
- Bloquear item invalido.
- Bloquear desconto maior que subtotal.
- Exibir mao de obra, materiais, deslocamento, taxas, desconto e total.
- Exibir validade, pagamento, garantia, prazo e observacoes no preview quando preenchidos.

## Checklist Relatorio

- Identidade profissional aparece.
- Cliente/OS aparecem quando ativos.
- Itens tecnicos aparecem.
- Imagens nao quebram layout.
- Aviso tecnico final permanece visivel.
- PDF fica apresentavel.

## Checklist Backup

- Exporta somente chaves `orcaos:`.
- Mostra resumo por grupo de dados.
- Rejeita JSON invalido.
- Rejeita backup de outro app.
- Rejeita versao futura/incompativel.
- Mesclar preserva dados locais.
- Substituir exige `SUBSTITUIR`.
- Recarregar app aparece apos restauracao.

## Checklist Free/Pro

- `VITE_ORCAOS_DEV_TOOLS=false` no beta.
- Loja nao mostra simulacao de plano em producao.
- Free bloqueia calculos Pro.
- `active` libera Pro.
- `trial` libera Pro.
- `expired` volta para Free.
- `past_due` volta para Free.
- Endpoint indisponivel nao libera Pro.
- Service role e admin key ficam somente no backend.

## Criterios Para Liberar Beta Fechado

Liberar beta fechado apenas quando:

- RC2 passar no roteiro `docs/ai/ORCAOS_BETA_FECHADO_SIMULACAO_USUARIO_REAL.md`.
- Pelo menos um teste em celular Android e um teste em iPhone ou simulador responsivo forem aprovados.
- Pelo menos um PDF de orcamento e um PDF de relatorio forem conferidos.
- Backup exportado e restaurado for validado.
- Primeiro fluxo Pro manual for validado com o e-mail real de teste.

## Comando Obrigatorio

```bash
npm run rc:check
```
