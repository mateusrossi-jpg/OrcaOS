# Auditoria de Modos Operacionais (Mental Flows)

## 1. O Problema: O Paradoxo dos Três Modos
No momento atual do design de produto, a inserção do conceito de "Atendimento Rápido" introduz um choque direto com a funcionalidade de "Orçamento Express", gerando uma arquitetura mental tripla para a principal tarefa do usuário (vender e executar):

1. **Projeto (Orçamento Completo):** Fluxo tradicional, com catálogo e fases.
2. **Orçamento Express:** Forma rápida de orçar e fechar, focada em serviços simples.
3. **Atendimento Rápido:** Fluxo de caderneta para um serviço que já aconteceu.

### Consequência (Carga Cognitiva)
Ter três vias fere diretamente o princípio da "Atenção Parcial" no campo. O técnico autônomo passaria pela fadiga da escolha: *"Uso o Express porque o conserto foi rápido ou uso o Atendimento Rápido porque já consertei?"*. 
O Aferix está criando múltiplos caminhos para resolver essencialmente o mesmo cenário de negócios (um serviço simples, de item único, com faturamento direto).

---

## 2. Mapeamento e Sobreposição

| Critério | **Projeto (Completo)** | **Orçamento Express** | **Atendimento Rápido** |
| :--- | :--- | :--- | :--- |
| **Linha do Tempo** | **FUTURO:** Será executado. | **MISTO:** Pode ser executado ou já foi. | **PASSADO:** Já foi executado. |
| **Complexidade** | Múltiplos materiais, taxas, mão de obra. | Apenas um título e um valor. | Apenas um título e um valor. |
| **Liquidação** | Transições financeiras complexas. | Quitação rápida via toggle. | Quitação rápida via toggle. |
| **Código** | Fluxo profundo via DOM e Facade. | Rota e Formulário dedicado. | *Conceito idêntico ao Express*. |

**Análise:** "Orçamento Express" e "Atendimento Rápido" são clones semânticos. A única diferença é a forma como o usuário enxerga a ação no relógio. Manter os dois causará pesadelos de manutenção futura (DRY – Don't Repeat Yourself) e sobreposição confusa no aprendizado de novos usuários.

---

## 3. O Veredito (Resultado Esperado)
Para garantir a menor carga cognitiva possível (zero atrito de decisão), **a terceira via deve ser destruída.** O sistema deve convergir para uma decisão binária baseada apenas na natureza da venda.

### O Modelo Mental Binário Consolidado:

A UI não perguntará "qual tipo de orçamento", ela oferecerá dois caminhos claros baseados na intenção temporal do profissional:

1. **[ NOVO PROJETO ] (Orçamento)**
   * *O que é:* "Vou orçar. O cliente vai aprovar. Vou agendar. Vou executar."
   * *Uso:* Obras, reformas longas ou qualquer serviço onde o preço precise ser calculado e não "chutado".

2. **[ ATENDIMENTO RÁPIDO ] (Absorve o Express)**
   * *O que é:* "Estou no carro indo embora. Arrumei a tomada, cobrei 150 reais no PIX e quero salvar."
   * *Uso:* Serviços emergenciais e corriqueiros em que a prospecção, aprovação e execução ocorrem no mesmo minuto.

**Ação Pós-Auditoria:** 
Tudo o que foi desenhado e codificado como "Budget Express" no Aferix deve ser renomeado e adaptado visualmente para se chamar **"Atendimento Rápido"**. Isso encerra qualquer dubiedade, unifica a base de código e zera a fricção cognitiva do autônomo na caminhonete.
