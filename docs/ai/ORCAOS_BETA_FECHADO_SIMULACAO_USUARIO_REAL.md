# Aferix Beta Fechado - Simulacao De Usuario Real

Data: 2026-05-02

## Objetivo

Validar o Aferix como se fosse usado por um tecnico real em celular e desktop, antes de chamar usuarios externos. O teste deve confirmar fluxo completo, persistencia local, proposta/PDF, relatorio, backup e mensagens de erro.

## 1. Primeiro Acesso

- Abrir o app com dados locais limpos.
- Cadastrar um e-mail em Configuracoes.
- Se disponivel, vincular a conta Google com o mesmo e-mail.
- Configurar perfil profissional: nome/empresa, responsavel, telefone, e-mail, endereco, validade, garantia e pagamento padrao.
- Ativar PIN opcional e desbloquear novamente.
- Exportar backup vazio.

## 2. Fluxo De Atendimento

- Criar um cliente com nome, telefone e endereco.
- Criar uma OS para esse cliente.
- Selecionar a OS como ativa.
- Abrir Levantamento.
- Criar ou escolher um ambiente.
- Adicionar servico de mao de obra.
- Adicionar material/peca.
- Adicionar observacao tecnica.
- Conferir se os itens ficam visiveis na revisao do levantamento.

## 3. Fluxo De Calculo

- Executar um calculo livre de fundamentos eletricos.
- Conferir Lei de Ohm:
  - 220 V / 22 ohm = 10 A.
  - 220 V / 10 A = 22 ohm.
  - 10 A * 22 ohm = 220 V.
- Tentar abrir um calculo Pro no plano gratis.
- Verificar se a tela bloqueia sem liberar indevidamente.
- Verificar assinatura na Loja / Pro com endpoint configurado ou simular somente em ambiente de desenvolvimento.
- Executar um calculo Pro quando liberado.
- Enviar um resultado para levantamento/orcamento.

## 4. Fluxo De Orcamento

- Criar orcamento novo.
- Conferir que nao aparece cliente exemplo nem servico ficticio.
- Selecionar/preencher cliente.
- Adicionar mao de obra.
- Adicionar material.
- Adicionar deslocamento.
- Adicionar taxas adicionais quando fizer sentido.
- Aplicar desconto valido.
- Tentar desconto maior que subtotal e conferir bloqueio.
- Configurar validade.
- Configurar condicao de pagamento.
- Configurar garantia.
- Salvar orcamento.
- Duplicar item.
- Remover item.
- Abrir revisao.
- Abrir preview.
- Salvar PDF pelo navegador.
- Copiar texto da proposta.
- Abrir compartilhamento via WhatsApp.

## 5. Fluxo De Relatorio

- Gerar relatorio com itens tecnicos.
- Conferir cliente/OS no documento.
- Conferir identidade profissional no cabecalho.
- Conferir observacoes e detalhes tecnicos.
- Salvar PDF pelo navegador.

## 6. Persistencia

- Fechar navegador/app.
- Abrir novamente.
- Conferir clientes.
- Conferir OS ativa.
- Conferir orcamento salvo.
- Conferir perfil profissional.
- Conferir capturas/levantamentos.

## 7. Backup

- Exportar JSON.
- Conferir resumo do backup.
- Limpar dados locais manualmente.
- Restaurar backup em modo mesclar.
- Conferir dados restaurados.
- Restaurar backup em modo substituir.
- Confirmar que o app exige digitar `SUBSTITUIR`.
- Recarregar app pelo botao exibido apos restauracao.

## 8. Casos De Erro

- Gerar proposta sem item.
- Criar item sem descricao.
- Criar item com quantidade zero.
- Criar item com valor negativo.
- Criar item com valor zero e tentar gerar proposta.
- Aplicar desconto maior que subtotal.
- Restaurar backup invalido.
- Restaurar JSON que nao e do Aferix.
- Verificar Pro sem conta.
- Verificar Pro com endpoint indisponivel.
- Tentar acessar Pro no plano gratis.

## 9. Aprovacao

O beta fechado pode seguir se:

- Nenhum travamento ocorre no fluxo principal.
- Nenhuma tela comum aparece quebrada no celular.
- Nenhum dado essencial se perde apos fechar/reabrir.
- Proposta PDF fica apresentavel.
- Relatorio PDF fica apresentavel.
- Erros aparecem em linguagem compreensivel.
- Backup exporta e restaura.
- Free nao acessa Pro indevidamente.
- Pro manual/assistido funciona quando configurado.
- Fluxo cliente -> OS -> levantamento -> orcamento -> PDF funciona inteiro.

## Registro Do Teste

Para cada rodada manual, anotar:

- dispositivo/navegador;
- data e hora;
- conta/e-mail usado;
- plano esperado;
- problemas encontrados;
- prints ou descricao curta;
- aprovado/reprovado.
