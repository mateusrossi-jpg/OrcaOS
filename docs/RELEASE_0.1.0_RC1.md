# Aferix 0.1.0-rc.1

## Tipo
Teste interno / teste fechado.

## Objetivo
Validar fluxo real antes da publicação pública.

## Fluxo principal validado
- Cliente (Criação e persistência)
- Atendimento (Vínculo e contexto)
- Simulador (Cálculos e adição ao orçamento)
- Orçamento (Manual e importado, totais e salvamento)
- Prévia/PDF (Branding Aferix e layout claro)
- Relatório (Visualização e controles)
- Catálogo (Gestão de itens e margens)
- Financeiro (Dashboard e lançamentos básicos)

## Comandos executados
- npm run typecheck: Passou
- npm test: Passou (222 testes)
- npm run build: Passou
- npm run visual:qa: Passou (com avisos menores de fallback CSS)
- npm run rc:check: Passou
- npx cap sync android: Passou
- ./gradlew assembleDebug: Passou (APK Debug gerado)

## Resultado
**PASSOU**. Release Candidate está estável e pronto para instalação.

## Bloqueadores encontrados
Nenhum bloqueador crítico identificado nesta fase.

## Correções feitas
- Versionamento ajustado para 0.1.0-rc.1 em package.json e Android.
- Incremento de versionCode para 2.
- Validação de branding Aferix em todos os pontos críticos da UI.

## Pendências não bloqueantes
- Presença de fallbacks de CSS legados (hexadecimais e border-radius fixo) em BudgetWorkspace.css.
- Chaves de localStorage ainda utilizam o prefixo orcaos: para manter compatibilidade com dados existentes (desejado).
- Variáveis de ambiente e tipos internos mantêm referências a OrcaOS para estabilidade técnica.

## Checklist para Mateus testar no celular
- [ ] Instalar o APK gerado no celular real.
- [ ] Abrir o app e validar a tela de Splash/Intro "Aferix".
- [ ] Criar um novo Cliente.
- [ ] Criar um Atendimento vinculado a este cliente.
- [ ] Realizar um cálculo no Simulador e adicionar ao orçamento.
- [ ] Abrir o Orçamento, validar totais e salvar.
- [ ] Gerar a Prévia/PDF e conferir se o documento é claro e possui logo Aferix.
- [ ] Abrir Relatórios e validar os dados gerenciais.
- [ ] Fechar o app (kill process) e reabrir para validar se o cliente/atendimento ativo persiste.
- [ ] Validar funcionamento básico offline.
