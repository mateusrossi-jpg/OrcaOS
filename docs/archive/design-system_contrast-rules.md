# Aferix Visual Rules: Contrast & Legibility Constitution
*Vigência: 2026-05-31*

## ☀️ O Paradigma "Field-Ready" (Aprovado pro Sol)
O Aferix é um sistema operacional tático. Ele é utilizado no campo de batalha operacional: sob luz solar implacável, com poeira, dentro de cabines de veículos utilitários e sob atenção parcial. 

**Neste cenário, a legibilidade é inegociável.**
O nosso design *Premium Executive* não significa escuridão ilegível ou tons cinza fantasmagóricos; significa **hierarquia impecável e robusta**. Um sistema caro é aquele que não te deixa na mão na rua.

Abaixo estão as 4 categorias estritas de contraste que guiam todo desenvolvimento de UI no Aferix OS V5.

---

### 🔴 NÍVEL 1: INFORMAÇÃO CRÍTICA
A essência do que o operador precisa saber ou tocar em fração de segundo.
* **O que abrange:** Valores financeiros líquidos/totais, Nomes de Clientes nos cards principais, Títulos de Orçamentos/OS, Status Vital Ativo (Ex: "EM EXECUÇÃO"), Botões Primários, Inputs com foco de digitação.
* **Regra de Cor Base:** `var(--text-primary)` (Branco puro `#FFFFFF`) ou Cores de Acento brilhantes em formato sólido (`var(--accent-gold)`, `var(--accent-green)`, `var(--accent-red)`).
* **Opacidade:** `100%` ou `opacity-100`. **É ESTRITAMENTE PROIBIDO O USO DE OPACIDADE (ALPHA) EM NÍVEL 1.**
* **Tipografia Exigida:** `font-bold` ou `font-black`. Tamanhos de `14px` para cima.
* **Métrica Tática:** Contraste mínimo WCAG AAA (7:1) sobre a base primária.

---

### 🟡 NÍVEL 2: INFORMAÇÃO OPERACIONAL
Os dados adjacentes que detalham a ação.
* **O que abrange:** Textos digitados em Inputs, Descrições de Fatos nas Timelines, Endereços, Metadados em uso direto, Itens detalhados de listas.
* **Regra de Cor Base:** `var(--text-primary)` ou um `var(--text-secondary)` fortalecido (Mínimo recomendado `#B3B3B3` ou luminância calibrada contra sol).
* **Opacidade:** Mínima aceitável de `80%`.
* **Tipografia Exigida:** `font-normal` até `font-medium`. Tamanhos entre `12px` e `14px`.
* **Métrica Tática:** Contraste mínimo WCAG AA (4.5:1).

---

### 🔵 NÍVEL 3: CONTEXTO
Auxiliam na leitura da tela sem gritar pela atenção central.
* **O que abrange:** Labels de Seção (`SectionLabel`), Placeholders de Formulários, Rótulos menores sobre campos, Timestamps de cards secundários.
* **Regra de Cor Base:** `var(--text-secondary)` exaustivamente testado. NUNCA utilizar a variável cinza escuro `var(--text-tertiary)` (#3C3C3C).
* **Opacidade:** Mínimo vital de `60%`.
* **Tipografia Exigida:** O uso de cores fracas exige compensação de peso. Todo nível 3 deve usar `font-bold`, muitas vezes uppercase e *tracking-wider*.
* **Métrica Tática:** Contraste mínimo WCAG de 3:1 em textos espessos/caixa-alta.

---

### ⚪ NÍVEL 4: DECORATIVO E ESTRUTURAL
Linhas e divisões que servem apenas para organizar o espaço.
* **O que abrange:** Bordas divisórias de `Section`, traços de linhas em grids vazios, fundos de estado "empty" não interativos, micro-ícones de suporte não engajáveis, sombras de profundidade.
* **Regra de Cor Base:** `white/[0.05]`, `white/[0.1]`, `var(--text-tertiary)` (`#3C3C3C`).
* **Métrica Tática:** Sem exigência de contraste, desde que o elemento em si não passe informação.

> 🚨 **RESTRIÇÃO CRÍTICA SUPREMA:** NENHUMA INFORMAÇÃO OPERACIONAL (Nível 1 ou 2) PODE UTILIZAR CONTRASTE DECORATIVO (Nível 4).
> Se o operador precisar daquela letra, daquele número ou daquela borda do botão para realizar a tarefa na rua, esse elemento NÃO É DECORATIVO.

---

## 🔎 CHECKLIST DE VALIDAÇÃO (O TESTE "TIRO NO SOL")
Todo desenvolvedor e designer deve validar novas UIs com as 3 perguntas cruciais:

1. **Teste de Baixa Energia:** "Eu consigo ler o nome do cliente, o saldo dele e clicar no botão correto se eu colocar o celular em 30% de brilho no meio da tarde?"
2. **Teste de Fricção Tátil:** "Os campos de formulário (Inputs) tem affordance (borda, preenchimento distinto) suficiente para eu saber onde tocar sem precisar olhar atentamente pra tela?"
3. **Teste do Histórico Rápido:** "O histórico na timeline obriga o profissional a apertar o olho pra ler textos cinza escuro?" Se a resposta for sim, reprove o design.
