# AFERIX COGNITIVE LOAD AUDIT E HIERARQUIA

## AUDITORIA DE CARGA COGNITIVA

### 1. OperationsHubWorkspace (Execução)
* **Objetivo Real do Usuário:** Iniciar e Finalizar Ordens de Serviço rapidamente.
* **Sobras de Informação:** O bloco "PAINEL DE OPERAÇÕES" (Hero verde/dourado) com contadores "Ao Vivo, Agenda, Pausadas, Livres" e as `OpsChips` no header acabam mostrando a mesma métrica redundante.
* **Ação:** Remover redundância de painéis de métrica. O técnico só precisa ver a Fila de Atendimento dele.

### 2. ProposalGeneratorPage (Propostas)
* **Objetivo Real do Usuário:** Gerar e enviar o preço total.
* **Sobras de Informação:** A quebra estrita entre "Peças", "Serviços" e "Extras" com ícones, somado aos cards de desconto e imposto de 15% na mesma tela vertical contínua, aumenta o scroll enormemente. A carga é alta, mas necessária devido à complexidade orçamentária.
* **Ação:** Implementar funcionalidade de recolher (collapse) seções vazias ou já preenchidas (ex: se "Custos Extras" está vazio, minimizar).

### 3. Home / Pulse (HomeScreen)
* **Objetivo Real do Usuário:** Ver a saúde do negócio e começar o dia.
* **Sobras de Informação:** No momento a Home tem um botão gigante "TESTAR AGORA (DEMO)", "NOVA OS EXPRESSA" e "ENTRAR NA EMPRESA" pequeno no final. Isso é tela de Onboarding, não de Operação.
* **Ação:** O "Pulse" precisa se tornar o verdadeiro Dashboard Administrativo de Saúde Operacional.

## AUDITORIA DE HIERARQUIA

Regra de Ouro: "EXECUÇÃO nunca pode ficar escondida atrás de CONFIGURAÇÃO."
* **Aprovado:** Execução ("Base") é a primeira coisa que salta aos olhos junto de Pulse. As Ordens de Serviço estão a um clique de distância.
* **Reprovado:** A GESTÃO (Contratos, Base de Clientes e Estoque) sumiram do App. Foram tão rebaixados na hierarquia que estão inacessíveis na UI, impossibilitando o ciclo completo do negócio.
