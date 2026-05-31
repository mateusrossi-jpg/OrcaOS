# AFERIX DESIGN SYSTEM: WORKSPACE PRINCIPLES
`workspace-principles.md`

Este documento define os princípios fundamentais de produto e comportamento do Aferix. Ele serve como escudo de proteção contra a complexidade desnecessária e garante que o aplicativo nunca se desvie de sua missão: ser o **Sistema Operacional de Bolso** do prestador de serviços em campo.

---

## 1. Regra Arquitetural de Herança

Nenhum módulo operacional do Aferix (seja Clientes, Agenda, OS, Financeiro ou Orçamentos) pode ser construído diretamente a partir dos tokens de estilo do Design System. Cada fluxo de tela deve ser obrigatoriamente filtrado e validado por estes Princípios do Workspace.

```text
       Design System (Visual Tokens & Tokens de Estilo)
              ↓
     Workspace Principles (Regras Comportamentais & Filosofia)
              ↓
       Screen Templates (Cockpit UX Architecture)
              ↓
  Feature Modules (Clientes, Agenda, OS, Financeiro, Orçamentos)
```

Essa hierarquia impede que o Aferix regrida a um ERP de prateleira tradicional, mantendo o DNA focado na realidade de quem trabalha na rua e com pressa.

---

## 2. Os 5 Princípios Fundamentais

### I. O sistema prioriza ação
* **A Regra:** Toda informação exposta deve carregar consigo uma ação direta ou um caminho imediato para resolver a pendência que ela denuncia.
* **Na Prática:** Não mostramos apenas "R$ 3.750 pendentes" de forma estática. O valor deve ser clicável e levar o usuário diretamente à lista de propostas aprovadas aguardando faturamento ou faturas em atraso, com o botão de cobrar visível.

### II. O sistema prioriza contexto
* **A Regra:** Mostrar o trabalho real antes dos números gerais. A operação vem antes da burocracia.
* **Na Prática:** A agenda do dia e a próxima ação de campo têm prioridade de espaço e foco visual sobre os resumos financeiros agregados. O técnico precisa saber onde colocar as mãos primeiro.

### III. O sistema prioriza operação
* **A Regra:** O técnico abre o aplicativo para executar trabalho, não para analisar dashboards ou relatórios de gestão.
* **Na Prática:** Gráficos circulares, barras de progresso tridimensionais complexas e widgets puramente decorativos são proibidos. A Home e as telas internas funcionam como o painel do Uber Driver — focados no "próximo passo".

### IV. O sistema prioriza velocidade
* **A Regra:** Toda tela do sistema deve ser capaz de responder a três perguntas básicas em menos de 3 segundos:
  1. *O que aconteceu?* (Contexto atual)
  2. *O que devo fazer?* (Ação primária)
  3. *Qual o próximo passo?* (Sequência)
* **Na Prática:** A tipografia é otimizada para leitura dinâmica em condições difíceis (debaixo de sol, dentro da caminhonete, com pressa).

### V. O sistema evita vaidade
* **A Regra:** Eliminamos todo o ruído visual e métricas de ego. 
* **Na Prática:** É proibido incluir:
  * KPIs puramente estéticos ou decorativos.
  * Gráficos complexos que não oferecem atalhos operacionais rápidos.
  * Cards puramente informativos que não resolvem problemas reais de caixa ou tempo do técnico.

---

## 3. O Teste do Campo (Field Validation)

Antes de aprovar qualquer alteração de layout ou nova funcionalidade, pergunte-se:
1. *Isso pode ser operado com apenas uma mão na tela do celular enquanto o técnico segura uma ferramenta com a outra?*
2. *Essa tela faz o usuário economizar tempo ou ganhar dinheiro em menos de 10 segundos?*
3. *Se retirarmos este card, a operação dele para?*

Se a resposta para a pergunta 3 for "Não", o card não deve existir. Aferix é eficiência pura.
