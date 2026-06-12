# Guia de Instalação do Piloto Comercial — Aferix

Este guia tem como objetivo orientar técnicos, QAs e os primeiros usuários na preparação do ambiente e na instalação do pacote Aferix **v0.1.0-rc.1** para validação prática em celulares e dispositivos móveis pela rede local ou em simuladores.

---

## 1. Informações de Identificação da Release
* **Versão:** `v0.1.0-rc.1`
* **Release Channel:** `pilot` (Piloto Comercial Controlado)
* **Hash Base do Commit:** `dc8fea307f1c88082f904c206a050b562a7d20d7`

---

## 2. Requisitos Mínimos do Sistema

### Dispositivo Host (Servidor de Desenvolvimento Local/Preview):
* **Sistema Operacional:** Linux, macOS ou Windows com WSL2.
* **Node.js:** Versão `>=22.12.0` (Recomendado v22 LTS).
* **NPM:** Versão `>=10.0.0`.
* **Rede:** Dispositivo host e celulares devem estar conectados na **mesma rede Wi-Fi local**.

### Dispositivo de Teste Móvel (Celular do Usuário):
* **iOS:** Safari (iOS 15 ou superior).
* **Android:** Google Chrome (Android 9 ou superior).

---

## 3. Preparação do Servidor Local e Build

1. **Instalação das dependências:**
   ```bash
   # Carregar Node v22
   source ~/.nvm/nvm.sh && nvm use 22

   # Instalar de forma limpa
   npm install
   ```

2. **Compilação do pacote otimizado (Build):**
   ```bash
   npm run build
   ```
   Isso gerará os ativos compilados e otimizados na pasta `/dist/`.

3. **Iniciando o servidor de visualização de produção (Preview):**
   ```bash
   npm run preview
   ```
   O terminal exibirá o endereço local (geralmente `http://localhost:4173/` ou `http://localhost:5173/`) e o **Network URL** (ex: `http://192.168.1.15:4173/`).

---

## 4. Testando no Celular via Rede Local (iPhone & Android)

Para que o primeiro usuário acesse o aplicativo em tempo real de seu celular móvel:
1. Identifique o **Network URL** fornecido pelo script `npm run preview`. Exemplo: `http://192.168.1.15:4173/`.
2. No celular de teste (iPhone ou Android), abra o navegador de preferência (Safari ou Chrome).
3. Certifique-se de que o celular está conectado **exatamente na mesma rede Wi-Fi** do computador servidor.
4. Digite o Network URL completo na barra de endereços do celular.
5. O aplicativo carregará instantaneamente na viewport mobile com a paleta Dark Premium e acentos dourados.

---

## 5. Procedimentos de Teste de Campo

### Como Testar o Modo Offline:
1. Carregue o aplicativo normalmente no celular enquanto estiver conectado no Wi-Fi.
2. Nas configurações do celular, ative o **Modo Avião** (desligando Wi-Fi e dados celulares).
3. Continue navegando no app, criando orçamentos, inserindo itens no escopo e tirando fotos de evidências.
4. **Resultado Esperado:** O sistema gravará tudo de forma responsiva no banco local IndexedDB (Dexie) e reterá fotos pendentes de envio na fila.
5. Desative o Modo Avião para restabelecer a conexão local. O app sincronizará de forma transparente.

### Como Resetar os Dados Locais:
Caso queira reiniciar o teste para um usuário do zero:
* **Android (Chrome):** Clique no ícone de cadeado na barra de endereços > *Configurações do Site* > **Limpar dados e Redefinir**.
* **iPhone (Safari):** Vá em *Ajustes do iOS* > *Safari* > *Avançado* > *Dados de Sites* > Procure pelo IP local e clique em **Excluir**.

### Como Exportar Backups Manuais:
Para prevenir perda de dados em dispositivos de piloto:
1. Acesse o menu lateral do app e clique em **Configurações > Backup**.
2. Clique em **Exportar Backup Local**.
3. O app gerará um arquivo `.json` estruturado. Salve-o no armazenamento interno de arquivos do dispositivo técnico.

---

## 6. Coleta de Evidências & Reporte de Bugs

### Coleta de Logs de Diagnóstico:
O app conta com o módulo `PilotUsageMetrics` para telemetria local e privacy-safe.
* Para verificar os logs acumulados em tempo de execução, acesse *Configurações > Segurança > Telemetria de Uso* ou abra o console do navegador e filtre por `[PilotMetrics]`.

### Como Reportar um Problema:
Envie uma mensagem via WhatsApp ao suporte oficial do piloto contendo:
1. O modelo do celular usado (Ex: iPhone 13 ou Galaxy A54).
2. Os passos exatos executados que provocaram a falha.
3. Uma captura de tela ou gravação de tela demonstrando o comportamento indesejado.

---

## 7. Checklist Antes de Entregar ao Primeiro Usuário
* [ ] Compilação de produção (`npm run build`) concluída sem nenhum erro ou aviso de typecheck.
* [ ] Banco de dados local Dexie inicializado com dados limpos.
* [ ] Certificado que nenhuma caixa de diálogo nativa de bloqueio (`alert`, `confirm`) existe no fluxo operacional.
* [ ] Testado em pelo menos um dispositivo Android e um iOS para verificar se botões de campo atendem o tamanho mínimo de toque de 48px.
* [ ] Exportador de backup manual gerando JSON íntegro.

---

## 8. Limitações Conhecidas & Mitigações
* **Local-First sem Nuvem Ativa:** Não há backend de banco de dados ativo sincronizando em tempo real entre celulares de usuários distintos no piloto aberto (Supabase configurado apenas como base foundation).
* **Dependência do Relógio Local:** Timestamps e prazos críticos de SLA baseiam-se na hora local do dispositivo móvel do técnico.

---

## 9. Critérios de Rollback (Recuo)
* Ocorrência de perda sistemática de dados de orçamentos criados.
* Divergência matemática superior a R$ 0,01 nos lucros calculados pelo motor de finanças.
* Travamentos ou congelamentos totais de tela que impossibilitem o encerramento ou reinício de ordens de serviço.
