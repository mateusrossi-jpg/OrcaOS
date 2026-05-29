# AFERIX — CLÁUSULA FINAL DE GOVERNANÇA ARQUITETURAL

A Home não é uma tela.
A Home é um mecanismo de priorização.

Operações não é uma tela.
Operações é a autoridade sobre serviços.

CRM não é uma tela.
CRM é a autoridade sobre clientes.

Agenda não é uma tela.
Agenda é a autoridade sobre compromissos.

Financeiro não é uma tela.
Financeiro é a autoridade sobre transações.

Relatórios não são telas.
Relatórios são a autoridade sobre análise histórica.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PRINCÍPIO DE RESPONSABILIDADE

Cada domínio possui uma única fonte de verdade.
Nenhum domínio pode assumir a responsabilidade de outro domínio.

A Home pode observar todos.
A Home não pode administrar nenhum.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PRINCÍPIO DE PRIORIZAÇÃO

Os módulos respondem:
“O que existe?”

A Home responde:
“O que vem primeiro?”

Essa é a única responsabilidade da Home.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## TESTE DE GOVERNANÇA

Antes de criar qualquer funcionalidade nova, responder:

1. Qual domínio é dono disso?
2. Qual é a fonte de verdade disso?
3. A Home está observando ou administrando?
4. Isso cria sobreposição entre módulos?
5. Isso ajuda o usuário a agir agora?

Se existir dúvida sobre a resposta, a funcionalidade não está suficientemente definida para ser implementada.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## AS 7 LEIS IMUTÁVEIS DA HOME

1. **First Click Law:** O primeiro clique deve ser operacional.
2. **Ten Second Law:** Respostas operacionais em < 10 segundos.
3. **Anti-Cannibalization Law:** Home não replica, ela direciona.
4. **Ownership Law:** Módulos gerenciam, Home prioriza.
5. **Prioritization Law:** Home ordena o que vem primeiro.
6. **Semantic Blindness Law:** Home entende prioridade, não significado de negócio.
7. **Flat DTO Law:** Somente dados planos atravessam a fronteira da Home.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## REGRA DE LONGO PRAZO

O Aferix não será mantido pela interface.
O Aferix será mantido pela clareza dos seus domínios.

Quando a interface mudar, esta regra continua válida.
Quando novos módulos surgirem, esta regra continua válida.
Quando o produto crescer, esta regra continua válida.

Porque a arquitetura do sistema não é definida pelas telas.
Ela é definida pelas responsabilidades.
