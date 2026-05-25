# AFERIX — Índice de Contexto para Inteligência Artificial

Este diretório contém os guias e referências consolidadas para suporte a agentes IA e Copilots atuando no Aferix ERP.

---

## 1. Fonte Única de Verdade (SSOT Contextual)

Para qualquer tarefa de engenharia, arquitetura, design ou regras de negócio, consulte primeiro o arquivo de contexto oficial:

* [docs/AFERIX_CONTEXT.md](file:///home/remoto/OrcaOS/docs/AFERIX_CONTEXT.md)

Ele contém as diretrizes atualizadas do produto, fluxo de orçamentos Dexie SSOT, arquivos fundamentais e restrições de arquitetura local-first.

---

## 2. Diretrizes de Organização

1. **Evitar documentações redundantes**: Não crie arquivos de plano ou backlog concorrentes.
2. **Priorizar Simplicidade**: Evite propor novas soluções arquiteturais (como DI, event bus ou containers).
3. **Respeitar o fluxo SSOT**: Nenhuma escrita deve atingir o localStorage de forma direta; utilize o IndexedDB (via serviços baseados no Dexie).
