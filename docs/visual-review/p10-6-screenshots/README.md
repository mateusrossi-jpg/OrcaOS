# Aferix — Screenshot Capture Pack (P10.6)

Este diretório contém o pacote de capturas de tela reais do aplicativo **Aferix** (versão `0.1.0-rc.1`) obtido em ambiente local para fins de revisão visual humana e validação de consistência estética.

## Metadados da Captura

* **Data:** 2026-05-23
* **Método de Captura:** Captura nativa via emulação de dispositivo (largura aproximada de iPhone / Mobile Viewport e Desktop Viewport).
* **Diretório Original dos Recursos:** `/screenshots/aferix/`

---

## Lista de Capturas de Tela

| Arquivo | Tela/Fluxo Correspondente | Estado Capturado & Observações |
| :--- | :--- | :--- |
| **[01-pulse-top.png](01-pulse-top.png)** | Dashboard / Pulse (Mobile) | Indicadores de faturamento, margem real média de lucro, taxa de conversão comercial e KPIs unificados com tema OLED e tipografia tabular monospaced. |
| **[02-work-new-budget-top.png](02-work-new-budget-top.png)** | Novo Orçamento / Work (Mobile) | Stepper linear mostrando a primeira etapa de seleção de Cliente e dados do cabeçalho da proposta. |
| **[03-work-new-budget-items.png](03-work-new-budget-items.png)** | Escopo de Itens / Work (Mobile) | Simulador integrado de precificação, markup e listagem de serviços técnicos detalhados sem overlay/modal fixo. |
| **[04-work-history.png](04-work-history.png)** | Histórico / Work (Desktop) | Painel completo do histórico de orçamentos e propostas comerciais salvas localmente no localStorage. |
| **[05-money.png](05-money.png)** | Financeiro / Money (Mobile) | Apuração automática de resultados financeiros consolidados a partir de orçamentos finalizados. |
| **[06-base-clients.png](06-base-clients.png)** | Clientes / Base (Mobile) | CRM simplificado para gestão de contatos de clientes autônomos e novo atendimento. |
| **[07-base-catalog.png](07-base-catalog.png)** | Catálogo / Base (Mobile) | Catálogo de itens e serviços recorrentes em visual de duas colunas mobile-first. |
| **[08-base-reports.png](08-base-reports.png)** | Relatórios / Base (Mobile) | Layout de relatório executivo com proteção de alto contraste para impressão/PDF. |
| **[09-settings.png](09-settings.png)** | Configurações (Mobile) | Perfil do profissional, conformidade legal, chaves API Supabase e ferramentas locais de Backup (Download JSON / Restore). |
| **[10-license-pro.png](10-license-pro.png)** | Licença Pro (Mobile) | Tela da assinatura digital mostrando os cards de planos (Free, Pro e Vitalício Planejado) livre de redundâncias. |

---

## Como as Capturas Foram Obtidas

O servidor local de desenvolvimento foi iniciado via:
```bash
npm run dev
```

Em seguida, a ferramenta de emulação de dispositivos do navegador (Chrome DevTools / Safari Responsive Design Mode) foi configurada para as dimensões:
* **Mobile Viewport (iPhone):** 390px x 844px
* **Desktop Viewport:** 1280px x 800px

Utilizou-se a função nativa do navegador *"Capture screenshot"* para gravar as imagens com fidelidade de pixels de 100%.
