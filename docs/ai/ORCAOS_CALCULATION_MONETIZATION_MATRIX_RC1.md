# OrcaOS Calculation Monetization Matrix RC1

Data: 2026-05-02
Versao: 0.1.0-rc.1

## Objetivo

Esta matriz organiza os calculos do OrcaOS para gerar valor comercial antes do ERP completo ficar pronto. A regra do RC1 e simples: o usuario precisa conseguir testar o produto de verdade no plano livre, mas os calculos que economizam tempo, reduzem erro comercial ou geram material direto para proposta/relatorio entram como Pro.

## Regra De Produto

- Livre: calculos de entrada, fundamentos, conversoes rapidas e medicoes simples.
- Pro: dimensionamento, decisao comercial, diagnostico, risco, produtividade, estimativa com perda, relatorio mais completo e apoio direto ao orcamento.
- Em breve: modulos que precisam de validacao tecnica maior antes de liberar uso real.

## Matriz Por Area

### Eletrica

Livre:
- Fundamentos eletricos.
- Corrente, potencia, tensao e Lei de Ohm.
- Carga instalada simples.
- Checklist DR/DPS orientativo.

Pro:
- Cabo por corrente.
- Disjuntor.
- Queda de tensao.
- Ocupacao de eletroduto.
- Divisao de circuitos.
- Balanceamento de fases.
- Aterramento simplificado.
- Instalacoes, iluminacao, automacao, motores, transformadores, solar e rebobinagem.

### Financeiro E Precos

Livre:
- Preco por margem real.
- Preco por markup.

Pro:
- Desconto maximo.
- Parcelamento com taxa.
- Entrada recomendada.
- Hora tecnica real.
- Diaria tecnica.
- Deslocamento.
- Faixas minimo, ideal e premium.

### Construcao Civil

Livre:
- Blocos por parede.
- Concreto simples.
- Piso/revestimento com perda.
- Rampa.

Pro:
- Argamassa de assentamento.
- Argamassa para reboco.
- Rodape.
- Telhado simples.
- Escada.

### Hidraulica

Livre:
- Caixa d'agua por pessoas.
- Autonomia de reservatorio.
- Tempo de enchimento.
- Vazao por coleta.
- Pressao por coluna d'agua.

Pro:
- Volume de piscina.
- Inclinacao de esgoto.
- Bomba simplificada.

### Conversores

Livre:
- CV / HP / kW.
- BTU/h / W / kcal/h.
- bar / psi / mca / kPa.
- m3/h / L/min / L/s.
- Polegada decimal para mm.
- Celsius para Fahrenheit.

Pro:
- mm2 para AWG.
- Fracao de polegada.
- kgf/cm2 para bar.
- kWh para reais.

### Diagnostico Tecnico

Livre:
- Manutencao preventiva basica.
- Checklist de diagnostico.

Pro:
- Classificacao de urgencia.
- Classificacao de risco.
- Preventiva versus corretiva.

## Observacoes De Implementacao

- No RC1, a separacao Free/Pro fica refletida na navegacao, nos badges dos calculos e no bloqueio de abertura dos recursos Pro.
- O gate central usa a camada `accountPlanStorage`; identidade Google pode alimentar a conta quando `VITE_GOOGLE_CLIENT_ID` estiver configurado, e assinatura pode ser verificada via `VITE_ORCAOS_ENTITLEMENTS_ENDPOINT`. Pagamento real ainda sera conectado depois.
- Nenhum calculo foi removido nesta etapa.
- A proposta evita esconder todo o valor do app atras do Pro: cada setor mantem uma porta de entrada livre.
- Para teste interno, o plano Pro pode ser simulado pela tela Loja / Pro ou no navegador com `localStorage.setItem('orcaos:user-plan', 'pro')` e recarregamento da pagina.

## Proxima Etapa

Quando login e assinatura estiverem prontos, substituir o plano local por plano vindo da conta do usuario e manter o mesmo gate central para bloquear execucao, exportacao avancada ou envio ao fluxo comercial conforme a assinatura.
