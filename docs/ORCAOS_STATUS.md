# OrçaOS — Status do Projeto

## Visão do produto

O OrçaOS é uma ferramenta mobile-first para profissionais de campo, iniciando por eletricistas e profissionais de baixa tensão, com evolução planejada para um ecossistema maior de cálculo, levantamento técnico, orçamento, OS, relatórios, manutenção preventiva e módulos por profissão.

A estratégia definida é manter o núcleo de cálculos fundamentais livre e monetizar módulos profissionais mais avançados, sem transformar a versão gratuita em algo inutilizável.

## Estrutura atual do app

A navegação principal está separada em cinco áreas:

1. **Início**
   - visão geral do app;
   - chamada para Fundamentos livres;
   - acesso rápido aos cálculos técnicos;
   - resumo rápido.

2. **Cálculos**
   - área exclusiva para calculadoras e categorias técnicas;
   - não deve misturar orçamento, loja ou configurações;
   - abre uma categoria técnica e depois uma calculadora específica em tela sobreposta.

3. **Levantamento**
   - recebe resultados técnicos enviados pelos cálculos;
   - serve como base de projeto, vistoria, visita técnica e relatório;
   - atualmente salva dados localmente no navegador.

4. **Orçamentos**
   - área exclusiva para proposta comercial;
   - recebe resultados técnicos enviados pelos cálculos como base comercial;
   - mantém o módulo de orçamento com itens, cliente, totais e prévia para impressão/PDF.

5. **Mais**
   - configurações, plano, histórico, loja e roadmap.

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

## Decisões importantes já tomadas

- O app deve ter experiência de smartphone, não de desktop.
- Cálculos não devem ficar em menu horizontal como ferramenta de desktop.
- O fluxo correto é: categoria → cálculo → tela sobreposta → resultado → destino.
- O usuário deve escolher se o resultado vai para:
  - levantamento técnico;
  - orçamento;
  - ambos.
- Orçamento não deve aparecer misturado com categorias de cálculo.
- BTU deve ficar em Refrigeração, não em um módulo genérico de Ambientes.
- Automação industrial deve ser módulo próprio.
- Rebobinagem deve ser módulo próprio, mesmo que entre como futuro.

## Estado técnico atual

- App React + Vite + TypeScript.
- Interface mobile-first com navegação inferior.
- Capturas de resultados de cálculo salvas em `localStorage`.
- Separação lógica inicial entre cálculo, levantamento e orçamento.
- Prévia de orçamento/PDF ainda precisa de refinamento visual para mobile.
- O orçamento ainda não converte automaticamente o resultado técnico em item comercial com preço; por enquanto ele recebe a base técnica.

## Próximas prioridades

1. Validar `npm run typecheck` e `npm test` após cada rodada.
2. Melhorar persistência do orçamento completo e dados do cliente/OS.
3. Transformar capturas técnicas em itens editáveis:
   - tipo: observação técnica, serviço, material ou diagnóstico;
   - quantidade;
   - preço;
   - origem do cálculo.
4. Melhorar a prévia de relatório/PDF em formato mobile e formato de impressão.
5. Criar a tela de dados da OS/Cliente.
6. Criar relatório técnico de visita separado do orçamento comercial.
7. Expandir cálculos por módulo.
8. Implementar favoritos/recorrentes posteriormente, sem prejudicar a navegação principal.

## Regra de evolução

Toda nova função deve respeitar a separação:

- **Cálculos**: ferramenta técnica e fórmulas.
- **Levantamento**: especificações, diagnóstico e projeto.
- **Orçamento**: proposta comercial, serviços, materiais e valores.
- **Relatório/OS**: documento final para cliente ou histórico técnico.
