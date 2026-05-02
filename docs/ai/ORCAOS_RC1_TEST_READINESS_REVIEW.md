# OrcaOS RC1 Test Readiness Review

Data: 2026-05-02
Versao: 0.1.0-rc.1

## Status

RC1 pronto para teste controlado.

Validacao automatica executada:

```bash
npm run rc:check
```

Resultado:

- TypeScript limpo.
- Testes limpos.
- Build limpo.

## Escopo Para Teste

Fluxo principal:

1. cadastrar conta por e-mail;
2. opcionalmente vincular Google;
3. criar cliente;
4. criar OS;
5. executar calculos livres;
6. confirmar bloqueio de calculos Pro no plano gratis;
7. verificar assinatura Pro; em desenvolvimento, tambem validar simulacao apenas com `VITE_ORCAOS_DEV_TOOLS=true`;
8. executar calculo Pro;
9. enviar calculo para levantamento/orcamento;
10. montar levantamento;
11. montar proposta;
12. gerar relatorio;
13. exportar backup local;
14. fechar e reabrir o app para validar persistencia.

## Pontos Revisados

- Entrada principal do app usa apenas `AppOrcaNextOrganized`.
- Apps legados antigos foram removidos para evitar confusao de manutencao.
- Workspaces antigos excluidos do TypeScript foram removidos.
- `tsconfig.json` nao tem mais exclusoes especiais para arquivos legados.
- CSS principal continua consolidado em `global.css` e `orcaosMvpTheme.css`.
- Gate Free/Pro esta centralizado.
- Endpoint `/api/entitlements` existe para liberar Pro por assinatura server-side, com allowlist apenas como fallback de beta.
- Conta aceita e-mail cadastrado e vinculo Google.

## Dependencias Externas

Para testar Google/Pro real em ambiente publicado:

- `VITE_GOOGLE_CLIENT_ID`
- `VITE_ORCAOS_ENTITLEMENTS_ENDPOINT`
- `ORCAOS_PRO_USERS`
- opcional: `ORCAOS_ALLOWED_ORIGIN`
- opcional: `ORCAOS_ENTITLEMENTS_API_KEY`

Sem essas variaveis, ainda e possivel testar:

- cadastro por e-mail;
- conta local;
- Pro de teste apenas em desenvolvimento com `VITE_ORCAOS_DEV_TOOLS=true`;
- fluxo tecnico completo;
- backup local.

## Riscos Conhecidos

- Pagamento real por provedor externo ainda nao esta integrado por webhook.
- Backup Google Drive e login Google dependem de configuracao OAuth externa.
- Calculos tecnicos devem ser revisados em campo antes de comunicacao comercial ampla.
- Teste visual mobile ainda precisa ser feito em aparelho real.

## Criterio Para Aprovar O Beta

Considerar o beta fechado aprovado se:

- `npm run rc:check` continuar limpo;
- fluxo completo nao travar em celular;
- calculos livres e Pro abrirem/bloquearem corretamente;
- proposta e relatorio gerarem conteudo util;
- dados persistirem depois de fechar e reabrir;
- backup local exportar e restaurar;
- nenhuma tela principal mostrar blocos brancos/azuis fora de documento/PDF.
