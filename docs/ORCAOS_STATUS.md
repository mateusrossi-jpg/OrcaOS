# OrçaOS — Status do Projeto

## Visão do produto

O OrçaOS é uma ferramenta mobile-first para profissionais de campo, iniciando por eletricistas e profissionais de baixa tensão, com evolução planejada para um ecossistema maior de cálculo, levantamento técnico, orçamento, OS, relatórios, manutenção preventiva e módulos por profissão.

A estratégia definida é manter o núcleo de cálculos fundamentais livre e monetizar módulos profissionais mais avançados, sem transformar a versão gratuita em algo inutilizável.

## Estrutura atual do app

A navegação principal está separada em seis áreas:

1. **Início**
   - visão geral do app;
   - chamada para Fundamentos livres;
   - acesso rápido aos cálculos técnicos;
   - resumo rápido.

2. **Cálculos**
   - área exclusiva para calculadoras e categorias técnicas;
   - não deve misturar orçamento, loja ou configurações;
   - abre uma categoria técnica e depois uma calculadora específica em tela sobreposta;
   - permite enviar resultado para levantamento, orçamento ou ambos.

3. **Levantamento**
   - recebe resultados técnicos enviados pelos cálculos;
   - possui levantamento guiado estilo carrinho;
   - permite somar serviços/produtos por clique ou quantidade digitada;
   - permite criar bloco manual com descrição, quantidade, valor, tipo, destino, observação e imagem;
   - serve como base de projeto, vistoria, visita técnica, relatório e orçamento.

4. **Orçamentos**
   - área exclusiva para proposta comercial;
   - recebe resultados técnicos enviados pelos cálculos e pelo levantamento guiado como base comercial;
   - possui perfil profissional/empresa fixo com logo, documento, telefone, e-mail, endereço, responsável, validade, pagamento e observações;
   - possui catálogo local de produtos e serviços;
   - possui modelos de orçamento inclusos e modelos futuros Pro;
   - gera prévia para impressão/PDF.

5. **Relatórios**
   - área separada para relatório técnico de visita;
   - usa itens de levantamento, diagnósticos, observações, especificações e fotos;
   - gera prévia técnica imprimível/PDF;
   - prepara a futura entrega de diagnóstico técnico ao cliente.

6. **Mais**
   - inclui Clientes e OS;
   - permite cadastro local de clientes;
   - permite criação e ativação de ordens de serviço;
   - mantém configurações, plano, histórico, loja e roadmap.

## Clientes e OS

A primeira base de Cliente/OS já existe na aba **Mais**.

Recursos atuais:

- cadastro local de cliente;
- nome, telefone, e-mail, endereço e observações;
- criação de OS vinculada ou não a um cliente;
- título, descrição, endereço, prioridade, status e data agendada;
- lista de clientes cadastrados;
- lista de ordens de serviço;
- seleção de uma OS ativa para representar o atendimento atual;
- persistência local em `localStorage`.

Objetivo da próxima evolução:

- vincular a OS ativa automaticamente a levantamentos, orçamentos e relatórios;
- salvar orçamento completo com cliente/OS;
- gerar relatório e orçamento com cabeçalho baseado no cliente e na OS;
- criar histórico por cliente.

## Módulos de cálculo atuais

### Livres

- Fundamentos
  - Corrente;
  - Potência;
  - Lei de Ohm;
  - Potência por resistência;
  - Resistores série/paralelo;
  - W / VA / A;
  - Consumo.

### Pro / profissionais

- Instalações elétricas
  - Queda de tensão;
  - Seção por queda;
  - Distância máxima;
  - Transformador em kVA;
  - AWG ↔ mm²;
  - Cabo/disjuntor;
  - Eletroduto.

- Iluminação
  - Lúmens, lux e quantidade de luminárias.

- Refrigeração
  - BTU/h e estimativa inicial de carga térmica.

- Motores
  - Corrente estimada;
  - Rotação síncrona e escorregamento;
  - Relação de polias.

- Automação industrial
  - Escala 4–20 mA;
  - Escala 0–10 V.

### Previsto

- Rebobinagem
  - mapa de bobinagem;
  - tensão de trabalho;
  - fechamento;
  - rotação;
  - sentido de ligação;
  - capacitor/chave centrífuga;
  - bloqueios contra inversão indevida.

- Manutenção preventiva
  - retornos programados;
  - limpeza, revisão, inspeção e acompanhamento por profissão;
  - lembretes futuros por cliente/OS.

## Fluxo técnico atual

O fluxo principal do app está organizado assim:

1. **Cálculo técnico** gera uma captura técnica.
2. A captura pode ir para **Levantamento**, **Orçamento** ou **ambos**.
3. O **Levantamento Guiado** também gera capturas técnicas a partir de:
   - itens do catálogo;
   - quantidades clicadas;
   - quantidades digitadas;
   - blocos manuais;
   - imagens/fotos;
   - observações e diagnósticos.
4. O **Orçamento** importa itens técnicos pendentes e converte em itens comerciais.
5. O **Relatório** usa itens técnicos, fotos e diagnósticos para gerar documento técnico.
6. A **OS ativa** representa o atendimento atual e será usada como elo entre cliente, levantamento, orçamento e relatório nas próximas evoluções.

## Decisões importantes já tomadas

- O app deve ter experiência de smartphone, não de desktop.
- Cálculos não devem ficar em menu horizontal como ferramenta de desktop.
- O fluxo correto é: categoria → cálculo → tela sobreposta → resultado → destino.
- O usuário deve escolher se o resultado vai para:
  - levantamento técnico;
  - orçamento;
  - ambos.
- Orçamento não deve aparecer misturado com categorias de cálculo.
- Levantamento deve funcionar como ferramenta de campo, incluindo carrinho guiado, blocos manuais e fotos.
- Relatório técnico deve ser separado do orçamento comercial.
- Cliente/OS deve ser o elo central para histórico, execução e manutenção preventiva.
- BTU deve ficar em Refrigeração, não em um módulo genérico de Ambientes.
- Automação industrial deve ser módulo próprio.
- Rebobinagem deve ser módulo próprio, mesmo que entre como futuro.
- Modelos de orçamento podem virar produto/pacote Pro no futuro.

## Estado técnico atual

- App React + Vite + TypeScript.
- Interface mobile-first com navegação inferior.
- Capturas de resultados de cálculo salvas em `localStorage`.
- Clientes e OS salvos localmente em `localStorage`.
- Separação lógica entre cálculo, levantamento, orçamento, relatório e Cliente/OS.
- Orçamento com perfil profissional fixo, logo local/URL, catálogo e modelos.
- Levantamento guiado com carrinho, quantidade digitável, blocos manuais e imagens.
- Relatório técnico inicial com fotos, diagnósticos, observações e impressão/PDF.
- Dados ainda são locais no navegador; ainda não há backend nem sincronização em nuvem.

## Próximas prioridades

1. Validar `npm run typecheck`, `npm test` e `npm run build` após cada rodada.
2. Vincular OS ativa aos documentos:
   - levantamento;
   - orçamento;
   - relatório técnico.
3. Permitir edição direta dos itens já adicionados ao orçamento:
   - descrição;
   - quantidade;
   - valor unitário;
   - categoria;
   - origem técnica.
4. Salvar orçamento completo com:
   - modelo escolhido;
   - perfil usado;
   - cliente;
   - OS;
   - condições;
   - itens importados;
   - status.
5. Melhorar visual dos PDFs de orçamento e relatório.
6. Expandir cálculos por módulo.
7. Iniciar módulo de rebobinagem seguindo a regra de tensão, fechamento, sentido e bloqueio contra inversão indevida.
8. Criar favoritos/recorrentes e pacotes de modelos posteriormente.
9. Avaliar IndexedDB para imagens, pois `localStorage` pode ser limitado quando houver muitas fotos.

## Regra de evolução

Toda nova função deve respeitar a separação:

- **Cálculos**: ferramenta técnica e fórmulas.
- **Levantamento**: especificações, diagnóstico, fotos, blocos manuais e projeto.
- **Orçamento**: proposta comercial, serviços, materiais, valores e modelos.
- **Relatório**: documento técnico para cliente, com diagnóstico, observações e fotos.
- **OS/Cliente**: histórico, execução, manutenção preventiva e vínculo entre documentos.
