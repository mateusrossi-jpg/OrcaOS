# AFERIX ROLE RELEASE REPORT

## DIRETRIZES DE CHECK-OUT DE QUALIDADE

Antes de declararmos a mudança de arquitetura (Multi-Profile) concluída e enviar para produção, as seguintes validações são obrigatórias na bateria de QA.

### 1. TESTE DE REALIDADE (O "5 Second Rule")
Executar os 5 fluxos de login a seguir e cronometrar o tempo até a ação principal do dia estar acessível na tela (sem precisar abrir menus ou buscar).

| Perfil Logado | Ação Procurada | Tempo Máximo | Resultado / Pass |
| :--- | :--- | :--- | :---: |
| **OWNER** | Ver o faturamento esperado | < 5s | [ ] |
| **FIELD** | Ver a primeira OS e apertar "Navegar" | < 5s | [ ] |
| **SALES** | Apertar botão para "Novo Orçamento" | < 5s | [ ] |
| **MANAGER** | Ver lista de OS Atrasadas | < 5s | [ ] |
| **CUSTOMER**| Ver o Laudo da última visita | < 5s | [ ] |

### 2. POLIMENTO FINAL (The "Ruthless Cuts")
Aplicar a seguinte pergunta obrigatória para **toda** informação presente na tela do perfil:
> *"Esta informação ajuda este perfil a trabalhar AGORA?"*

Se a resposta for "Não" ou "É legal ter, mas não usa hoje": **Remover.** 

### 3. CRITÉRIO DE APROVAÇÃO E ACEITAÇÃO
A Release só estará pronta quando a sensação no uso for:
* **Técnico:** *"Isso foi feito para mim e pra rua."*
* **Comercial:** *"Isso vende."*
* **Gestor:** *"Isso controla a operação na rua."*
* **Dono:** *"Isso me mostra o dinheiro e a saúde do negócio."*
* **Cliente:** *"Essa empresa é extremamente profissional e transparente."*

### 4. PRÓXIMOS PASSOS PÓS-RELEASE (MVP COMMERCIAL)
* Reestruturação da árvore React de navegação.
* Criação de Componentes isolados `OwnerShell.tsx`, `FieldShell.tsx`, etc.
* Injeção da permissão baseada em JWT / Contexto.
