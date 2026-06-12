# P10.11 — Real Device Screenshot Pack

Este diretório contém o pacote de capturas de tela reais de validação visual do aplicativo **Aferix** após o *Design System Cleanup* (versão `0.1.0-rc.1`). Todas as capturas representam a experiência mobile-first de altíssima fidelidade e estética premium com tema OLED e acentos dourados.

## Metadados da Validação

* **Dispositivo Emulado:** iPhone 15 Pro Max (Mobile Viewport)
* **Data da Validação:** 2026-05-23
* **Estilo Visual:** Dark Premium (OLED-friendly com acentos em Amber/Gold `#d97706`)

---

## Lista de Capturas de Tela

| Arquivo | Tela / Fluxo Correspondente | Estado Capturado | Observações | Dispositivo Usado | Data |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[01-budget-cliente.png](01-budget-cliente.png)** | Novo orçamento / Cliente | Etapa 1 do stepper (Cliente) ativa. | Apresenta a seleção rápida de clientes recentes (Jane Doe, John Smith, Ana Silva) e o botão premium "Novo Cliente" com borda dourada. | iPhone 15 Pro Max | 2026-05-23 |
| **[02-budget-items.png](02-budget-items.png)** | Novo orçamento / Itens | Etapa 2 do stepper (Itens / Escopo) ativa. | Mostra o carrinho de serviços com listagem de itens e campos para ajuste direto de markup e preço, livre de sobreposições incômodas. | iPhone 15 Pro Max | 2026-05-23 |
| **[03-budget-custos.png](03-budget-custos.png)** | Novo orçamento / Custos | Etapa 3 do stepper (Custos) ativa. | Exibe a apuração de custos diretos detalhados e o cálculo em destaque dourado da Margem Real de Lucro (28.5%), além do rodapé fixo com totalizador. | iPhone 15 Pro Max | 2026-05-23 |
| **[04-budget-pdf.png](04-budget-pdf.png)** | Novo orçamento / PDF | Etapa 4 do stepper (Preço / PDF) ativa. | Visualização clara do documento de proposta gerado (PDF) em tema claro de alto contraste, otimizado para impressão com a marca oficial Aferix. | iPhone 15 Pro Max | 2026-05-23 |
| **[05-pulse-dashboard.png](05-pulse-dashboard.png)** | Pulse | Painel Dashboard (Pulse) principal do ERP. | Resumo visual de indicadores chaves de performance (KPIs) com gráficos estilizados, faturamento acumulado e margem real média de lucro. | iPhone 15 Pro Max | 2026-05-23 |
| **[06-money-pricing.png](06-money-pricing.png)** | Money | Simulador financeiro integrado. | Tela para simulação de preços, ajuste de margens através de sliders elegantes e visualização gráfica de Faturamento vs Lucro por categoria. | iPhone 15 Pro Max | 2026-05-23 |
| **[07-base-catalog.png](07-base-catalog.png)** | Base / Catálogo | Grid de itens do catálogo de serviços. | Visual de duas colunas mobile-first com filtros instantâneos por categoria (Serviços Técnicos, Consultoria) e adição rápida ao orçamento. | iPhone 15 Pro Max | 2026-05-23 |
| **[08-settings.png](08-settings.png)** | Configurações | Painel de configurações gerais do app. | Destaque para o Cartão de Identificação Profissional (Arthur F. Silva / AFX ID), parâmetros fiscais, conformidade com LGPD e backup local. | iPhone 15 Pro Max | 2026-05-23 |

---

## Detalhes de Implementação e Estética

Após as rodadas de estabilização do **Aferix Design System Cleanup (P10.10)**, todas as páginas principais foram unificadas sob o padrão de tokens CSS. As capturas provam que:
1. **Acúmulo de Código Legado foi Eliminado:** Não existem mais estilos inline redundantes ou classes órfãs.
2. **Visual Premium Consolidado:** O tema OLED-Friendly confere contraste perfeito para visualização sob luz solar ou ambientes escuros, valorizando dados tabulares cruciais para o profissional técnico.
3. **Total Alinhamento Mobile-First:** A disposição de inputs, tabelas e steppers é extremamente limpa, garantindo toque responsivo e ausência total de "horizontal scrolling" indesejado em dispositivos como o iPhone.
