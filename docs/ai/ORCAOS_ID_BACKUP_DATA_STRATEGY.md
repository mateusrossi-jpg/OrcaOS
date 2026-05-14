# Aferix — identidade, dados confiáveis e backup

Este documento registra a diretriz estratégica das anotações manuais sobre identificação de usuários, dados gerados pela plataforma e modelos de backup.

## Ideia central

O Aferix deve evoluir como uma plataforma completa com módulos, onde profissionais e clientes possam gerar, consultar e validar dados de forma organizada.

A plataforma deve permitir que:

- o profissional registre levantamentos, cálculos, orçamentos, relatórios, compras e OS;
- o cliente visualize informações liberadas pelo profissional;
- os dados sejam vinculados a IDs individuais;
- backups possam ser feitos localmente, na plataforma e em nuvem;
- planos pagos possam liberar recursos avançados de sincronização e backup.

## Identidade individual

Cada usuário deve ter um ID próprio dentro da plataforma.

Tipos principais:

- profissional;
- cliente;
- empresa;
- colaborador/futuro funcionário;
- fornecedor/futuro parceiro.

Cada registro importante deve poder ser vinculado a IDs:

- clienteId;
- professionalId;
- companyId;
- workOrderId;
- budgetId;
- reportId;
- supplierId;
- purchaseId.

## Profissional

O profissional deve ter um perfil individual mesmo quando trabalhar como empresa.

Campos futuros:

- ID do profissional;
- nome;
- documento;
- contato;
- empresa vinculada;
- área principal;
- módulos ativos;
- plano/licença;
- reputação/validações futuras;
- histórico de trabalhos;
- configurações de proposta e relatório.

## Cliente

O cliente também pode ter um ID individual.

Objetivo:

- acompanhar orçamentos;
- aprovar propostas;
- consultar OS;
- visualizar diagnósticos;
- enviar observações;
- anexar fotos no futuro;
- manter histórico de atendimentos;
- permitir comunicação com profissionais.

O cliente deve ver apenas dados liberados pelo profissional.

## Dados confiáveis gerados pela plataforma

A plataforma deve registrar dados com origem clara:

- cálculo técnico;
- levantamento guiado;
- orçamento;
- relatório;
- OS;
- fornecedor;
- compra;
- estoque;
- margem;
- material comprado pelo cliente;
- material fornecido pelo profissional.

Cada dado deve idealmente ter:

- ID;
- data de criação;
- data de atualização;
- origem;
- autor;
- vínculo com cliente/OS/proposta;
- status;
- observações internas e públicas separadas.

## Validação pelo cliente

O Aferix Cliente pode futuramente permitir que o cliente confira:

- levantamento feito pelo profissional;
- lista de materiais;
- diagnóstico simplificado;
- fotos anexadas;
- status da OS;
- orçamento/proposta;
- prazos;
- recomendações;
- pontos que exigem validação técnica.

O cliente não deve ver dados internos como:

- custo real;
- margem;
- markup;
- imposto gerencial;
- fornecedor interno;
- preço de compra;
- observações comerciais internas.

## Normas e boas práticas

O Aferix Cliente pode futuramente ajudar o cliente a entender se o serviço parece seguir boas práticas, sem substituir responsabilidade técnica.

A linguagem deve ser cuidadosa:

- “verifique com o profissional”;
- “ponto a confirmar”;
- “exige validação em campo”;
- “referência técnica orientativa”.

Evitar prometer conformidade automática total com norma sem validação profissional.

## Backup local

Backup local deve ser o primeiro nível.

Pode incluir:

- exportação JSON;
- exportação ZIP;
- exportação CSV de clientes/itens/compras;
- exportação PDF de proposta e relatório;
- restauração local.

Vantagens:

- funciona sem backend;
- útil para versão inicial;
- baixo custo;
- ajuda na confiança do usuário.

## Backup na plataforma

Backup dentro da própria plataforma deve vir em fase posterior.

Pode incluir:

- conta do usuário;
- sincronização por login;
- dados protegidos por usuário/empresa;
- histórico de versões;
- múltiplos dispositivos;
- restauração automática.

## Backup em nuvem no plano pago

O modo pago pode oferecer:

- backup automático;
- sincronização entre celular e computador;
- histórico de alterações;
- recuperação de dados;
- armazenamento de fotos e relatórios;
- propostas compartilháveis;
- área do cliente;
- QR Code/link público;
- múltiplos usuários no futuro.

## Estratégia recomendada

### Fase inicial

- localStorage/local-first;
- IDs locais estáveis;
- exportação manual no futuro;
- PDF/relatório local;
- sem backend pesado.

### Fase profissional

- backup/exportação local;
- perfis internos;
- separação entre dados internos e dados públicos;
- proposta compartilhável.

### Fase plataforma

- login;
- backend/API;
- sincronização;
- área cliente;
- backup pago;
- multiempresa/multiusuário.

## Regra de arquitetura

Mesmo que o app comece local, os dados devem ser modelados como se futuramente fossem sincronizados.

Evitar estruturas sem ID, sem data, sem origem ou sem vínculo.

## Decisão atual

Continuar desenvolvendo local-first para velocidade e validação, mas preparar a modelagem para:

- IDs individuais;
- plataforma modular;
- backup;
- Aferix Cliente;
- sincronização futura;
- plano pago com recursos de nuvem.
