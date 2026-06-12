# Guia do Desenvolvedor & QA — Piloto Comercial Aferix

Este documento descreve os procedimentos operacionais para preparar, rodar, testar e reportar comportamentos no ambiente do Release Candidate (`0.1.0-rc.1`) do Aferix.

---

## 1. Preparação do Ambiente & Instalação

### Requisitos:
* **Node.js:** Versão `>=22.12.0` (Recomendado v22 LTS).
* **NPM:** Versão `>=10.0.0`.

### Passos para instalação:
```bash
# Navegar até o repositório
cd /home/remoto/OrcaOS

# Carregar versão do Node usando NVM (se aplicável)
source ~/.nvm/nvm.sh && nvm use 22

# Instalar dependências de forma limpa
npm install
```

---

## 2. Scripts de Execução e Build

* **Rodar em Modo de Desenvolvimento (Local):**
  ```bash
  npm run dev
  ```
  O servidor local será aberto por padrão em [http://localhost:5173/](http://localhost:5173/).

* **Gerar Build de Produção:**
  ```bash
  npm run build
  ```
  Os arquivos estáticos otimizados serão gerados na pasta `/dist/`.

* **Visualizar Build de Produção Localmente (Preview):**
  ```bash
  npm run preview
  ```

---

## 3. Execução de Testes Automatizados

* **Rodar Testes Unitários e de Integração (Vitest):**
  ```bash
  npm run test
  ```
  Isso executa a suíte rápida cobrindo regras financeiras, testes de concorrência, consistência causal offline e travas de licenciamento.

* **Rodar Testes End-to-End (Playwright):**
  ```bash
  npx playwright test
  ```
  Os testes de E2E simulam a viewport de um dispositivo móvel médio e interagem com o banco Dexie local e fluxos completos de cadastros e orçamentos.

---

## 4. Procedimentos de Teste Específicos

### Como Resetar o Ambiente Local (Limpar Cache):
Para garantir um teste limpo sem resíduos de dados antigos de outras versões:
1. No navegador (Chrome/Safari), abra o DevTools (F12).
2. Vá até a aba *Aplicativo (Application)* > *Armazenamento (Storage)*.
3. Clique em **Limpar dados do site (Clear site data)**.
4. Isso apagará o banco Dexie local e os registros residuais de `localStorage`.

### Como Testar o Fluxo Offline no Simulador:
1. Abra o DevTools (F12) no navegador.
2. Vá até a aba *Rede (Network)*.
3. No seletor de throttling de rede, mude de "Sem Throttling" para **Offline**.
4. Realize modificações de status de OS no *Workspace de Execução* ou capture evidências.
5. Note que o app continuará funcionando normalmente através da fila local.
6. Altere novamente o status da rede para **Online** e observe o esvaziamento silencioso da fila.

---

## 5. Telemetria e Reporte de Bugs

### Como Coletar Logs de Diagnóstico:
O app conta com o módulo `PilotUsageMetrics` para telemetria local e privacy-safe.
* Para verificar os logs acumulados em tempo de execução, abra o console do DevTools e filtre por `[PilotMetrics]`.
* As sessões gravadas guardam dados de tempo médio em campo, drops de sinal e contagem de imagens enviadas.

### Como Reportar Bugs Encontrados:
1. Registre os passos exatos executados até o erro.
2. Anexe uma captura de tela mostrando a falha visual ou log do console associado.
3. Envie os detalhes para o canal oficial de WhatsApp do Piloto.

---

## 6. Limitações Conhecidas do RC
* **Local-First sem Nuvem Ativa:** Não há backend de banco de dados ativo sincronizando em tempo real entre celulares de usuários distintos no piloto aberto (Supabase configurado apenas como base foundation).
* **Exportação Manual:** Os backups dependem do download manual do arquivo JSON pelo usuário.
