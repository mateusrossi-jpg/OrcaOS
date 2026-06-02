# AFERIX ROLE EXPERIENCE AUDIT V1
**CONSTITUIÇÃO DE EXPERIÊNCIA POR PERFIL (ROLE-BASED UX)**

## 1. Role Architecture (A Navalha dos Perfis)
Um erro fatal de ERPs legado é criar 30 perfis de acesso diferentes (Gerente, Subgerente, Auxiliar 1, Auxiliar 2). Isso gera manutenção impossível e bugs de permissão.
O Aferix adotará o minimalismo brutal. Existem apenas 4 grandes Personas e 1 ator externo.
*   **A Base:** O Técnico (Execução de Campo).
*   **O Dinheiro:** O Comercial / Financeiro (Escritório).
*   **O Controle:** O Dono / Supervisor (Onisciência).
*   **O Pagador:** O Cliente Final (Aprovação e Histórico).

---

## 2. Workspace Architecture
A interface do sistema sofre mutação (Shapeshift) dependendo de quem loga.
Não existe um "Menu principal com itens bloqueados". Se o usuário não tem acesso a um módulo, esse módulo **não existe** na sua realidade.

1.  **Field Workspace (Modo Peão):** Interface focada em mobile, letras grandes, alto contraste, offline-first. Foco: Velocidade e Ergonomia.
2.  **Office Workspace (Modo Escritório):** Interface híbrida (Desktop/Mobile), focada em CRM, Funil de Anomalias, Faturamento e Agendamentos. Foco: Dinheiro.
3.  **Client Portal (Modo Cliente):** Uma Landing Page viva. Sem senhas complexas, acesso via Magic Link. Foco: Credibilidade Premium e Assinatura Digital.

---

## 3. User Personas (O Que Eles Precisam nos 5 Primeiros Segundos)

*   **Técnico (João):** *Onde eu tenho que ir hoje e o que está quebrado lá?*
*   **Dono (Roberto):** *Onde está a minha equipe agora e quanto faturamos ontem?*
*   **Comercial (Maria):** *Quantas anomalias os técnicos acharam hoje que eu preciso mandar orçamento?*
*   **Financeiro (Carlos):** *Quem não pagou o PMOC desse mês?*

---

## 4. Experience Constitution (Regras Imutáveis)
*   **REGRA 01 (Cegueira Financeira):** Nenhum técnico visualizará valores (R$) de faturamento ou contratos da empresa. Ele enxerga apenas a execução técnica e, se necessário, valores avulsos de itens em ordens de serviço corretivas.
*   **REGRA 02 (Toque Único):** O modo de campo não pode ter menus expansíveis, *dropdowns* minúsculos ou barras de rolagem infinitas. Tudo opera em Botões Grandes.
*   **REGRA 03 (Eliminação do Ruído):** Se uma informação não altera a decisão que o perfil precisa tomar nos próximos 10 minutos, ela deve estar escondida.
*   **REGRA 04 (Onisciência do Dono):** A conta "Owner" não é apenas permissão total. É o acesso a "Modos". O dono pode simular a visão do técnico para entender o que ele está vendo no campo.

---

## 5. Permission Matrix (Matriz Crítica)

| Modulo / Ação | Técnico | Comercial | Financeiro | Dono | Cliente |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Executar OS (Checklist)** | ✅ Criar/Editar | ❌ | ❌ | ✅ | ❌ Visualizar |
| **Cadastrar Cliente** | ⚠️ Temporário | ✅ | ✅ | ✅ | ❌ |
| **Gerar Orçamento (Proposta)** | ❌ | ✅ | ❌ | ✅ | ✅ Aprovar |
| **Faturar e Cobrar** | ❌ | ❌ | ✅ | ✅ | ✅ Pagar |
| **Ver Faturamento Total** | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Ver Timeline do Ativo** | ✅ | ✅ | ❌ | ✅ | ✅ |

---

## 6. Navigation Constitution

### A. Navegação Bottom-bar (Técnico / Field)
1. **Hoje:** A tela inicial. O que fazer agora.
2. **Histórico:** OSs já fechadas pelo técnico.
3. **Buscar:** Para achar rapidamente o histórico de uma máquina.
4. **Eu:** Sincronização, Perfil, Ponto.

### B. Navegação Sidebar/Desktop (Gestor / Office)
1. **Ponte de Comando:** Dashboard, Escala.
2. **Máquina de Receita:** Anomalias pendentes, Orçamentos.
3. **CRM Operacional:** Clientes, Locais, Ativos (Client 360).
4. **Caixa Forte:** Faturamento PMOC, Inadimplência.
5. **Ajustes:** Configuração da empresa.

---

## 7. Technician Experience (O Modo Peão)
*Cenário: Sol de rachar, escada, 30 metros de altura.*
**A Tela:** Ao abrir o app, João vê um Card gigante ocupando 60% da tela: `[1] Shopping Central (14:00) - INICIAR PREVENTIVA`. 
Embaixo: `[ NOVA OS EXPRESSA ]`. 
O menu superior desaparece. Não há abas de "Clientes" ou "Relatórios".
A execução de anomalias abre um modal do tamanho exato do dedão (Thumb Zone) com botões grandes de Câmera e Microfone. Ele fecha a OS e volta para o Card, que agora é: `[2] Condomínio Flores (16:00)`.

## 8. Owner Experience (O Modo Onisciente)
*Cenário: No escritório tomando café, preocupado se vai bater a folha de pagamento.*
**A Tela:** Dashboards de 3 Vias. 
1. *Operação:* Progresso do dia (Barra de % de PMOCs concluídos no mês).
2. *Vendas:* Lista de "12 Anomalias aguardando orçamento" piscando em amarelo.
3. *Financeiro:* Custo total *versus* Receita faturada no mês.
O Dono não cria OS no dia a dia. Ele despacha e monitora.

## 9. Commercial Experience (O Caçador)
*Cenário: Fechar corretivas originadas do campo.*
**A Tela:** É essencialmente um funil de Kanban: `Anomalias Recebidas -> Orçamentos Enviados -> Aprovados -> Recusados`. A Maria do Comercial passa 90% do dia arrastando anomalias detectadas pelo João na rua para a coluna "Orçamento Enviado" (Com 1 clique Mágico) e disparando o link para os clientes.

## 10. Financial Experience (O Cobrador)
A visão do Carlos é baseada em competências mensais. Ele foca apenas no `Client 360` da perspectiva de "Contratos". A tela dele lista automaticamente quem está com fatura vencida e se o PMOC que a Maria vendeu precisa ser cobrado.

## 11. Customer Portal Experience (A Vitrine)
*Cenário: Síndico de um prédio precisa assinar um orçamento.*
O síndico não tem senha, ele não baixa aplicativo. O Aferix para ele é um link no WhatsApp.
Ele clica e vê a logo da empresa de manutenção. A tela tem fundo limpo.
`"Sua máquina de refrigeração apresentou vazamento."` (Fotos do defeito).
`"Valor do Conserto: R$ 850,00."`
Botão flutuante gigante verde: `[ APROVAR E INICIAR SERVIÇO ]`.
Se ele quiser ver os antigos, ele clica em "Ver histórico" e põe um código PIN enviado via SMS.

---

## 12. Complexity Audit & UX Risk Analysis
**O Risco Atual:** Deixar a Home do técnico idêntica à Home do dono. Isso cria sobrecarga cognitiva. O técnico vai tentar clicar em menus que não precisa.
**O Risco do Excesso:** Ter perfis customizáveis infinitos (onde o dono escolhe caixinha por caixinha o que o fulano pode ver). A customização infinita causa paralisia e aumenta custos de suporte da plataforma Aferix. A regra é rígida: 4 perfis pré-moldados absolutos.

---

## 13. Governance Rules (Governança de Produto)
Qualquer nova *feature* adicionada ao Aferix a partir de hoje deve responder à pergunta: *"Para qual Workspace isso vai?"*.
Exemplo: Um gráfico novo de margem de lucro? Vai para o *Office Workspace* apenas. Um novo scanner de placa de ar condicionado? Vai para o *Field Workspace* apenas. Misturar features é proibido.

---

## 14. P0 Roadmap (Execução Tática)
1.  **Refatoração do Sistema de Rotas (Router):** Implementar roteamento baseado em *Role*. Se `user.role === 'TECHNICIAN'`, renderizar *apenas* os componentes do Field Workspace.
2.  **Home do Técnico:** Recriar a home exclusiva, removendo toda a inteligência financeira. Focar puramente em `Minha Agenda Hoje`.
3.  **Remoção de Ruído:** Ocultar botões "Cadastrar Cliente" e "Cadastrar Local" da via principal do técnico, empurrando isso para a funcionalidade "OS Expressa" em background.

---

## 15. Executive Verdict
Um Sistema Operacional para Serviços só funciona se respeitar a Cadeia Alimentar e a Psicologia de cada funcionário.
**O Técnico** detesta burocracia, quer apertar um botão e ir pra casa.
**O Dono** detesta a cegueira, quer saber onde está todo mundo e onde está o dinheiro.
**O Cliente** detesta a dúvida, quer receber o problema e o valor de forma mastigada no celular.

O Aferix, em sua encarnação anterior, forçava o técnico a se comportar como um administrador de banco de dados. Ao aplicar esta constituição, quebramos as correntes. **O Aferix agora tem múltiplas personalidades que operam sobre um único cérebro de dados.** O caminho está livre de complexidade e pronto para adoção em massa pelos profissionais de campo.
