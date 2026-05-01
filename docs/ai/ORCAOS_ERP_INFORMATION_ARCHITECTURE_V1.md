# OrçaOS — Arquitetura de informação ERP V1

Este documento registra a reorganização planejada após o teste prático da área de Levantamento/Orçamento guiado.

---

## 1. Problema observado no teste prático

Durante o uso real no computador/celular, a área de Levantamento concentrou funções demais:

- ambientes da visita;
- serviços;
- peças;
- bloco manual;
- orçamento guiado;
- catálogo de serviços;
- catálogo de peças;
- consulta online;
- cadastro profissional;
- cadastro fiscal;
- possível estoque.

Isso funciona para protótipo, mas pode ficar confuso para um app publicável e ainda mais confuso quando o OrçaOS evoluir para ERP.

---

## 2. Diretriz principal

Separar claramente:

```txt
Uso em campo ≠ Administração/ERP ≠ Cadastros ≠ Estoque ≠ Consulta externa
```

A tela Levantamento deve ser rápida e prática para visita técnica.

Cadastros e bases de dados devem ficar fora do fluxo de campo, em áreas próprias.

---

## 3. Taxonomia futura recomendada

### 3.1 Levantamento

Função: uso em campo durante visita técnica.

Deve conter:

- OS ativa;
- ambientes da visita;
- serviços por ambiente;
- peças por ambiente;
- kits por ambiente;
- bloco manual técnico;
- fotos/observações;
- resumo por ambiente;
- envio para orçamento/relatório.

Não deve conter como foco principal:

- cadastro profissional;
- cadastro fiscal;
- manutenção completa de catálogo;
- estoque completo;
- consulta online ampla.

---

### 3.2 Orçamentos

Função: montar proposta comercial.

Deve conter:

- itens importados do levantamento;
- edição de descrição, quantidade e preço;
- mão de obra;
- materiais fornecidos pelo profissional;
- materiais que o cliente vai comprar;
- margem, markup, desconto e impostos;
- preview da proposta;
- PDF/WhatsApp.

---

### 3.3 Catálogo

Função: manter bases internas reutilizáveis.

Pode virar aba própria no futuro, ou subárea em Configurações/ERP.

Deve conter:

- catálogo de serviços;
- catálogo de peças;
- kits de materiais;
- preços base;
- marcas/modelos;
- categorias;
- favoritos.

---

### 3.4 Estoque

Função: controlar materiais próprios do profissional.

Deve conter:

- peças em estoque;
- quantidade atual;
- custo real;
- preço sugerido;
- margem;
- baixa automática quando item vendido/fechado;
- entrada manual;
- alerta de estoque baixo.

Regra futura:

```txt
Se material for marcado como fornecido pelo profissional e sair em uma OS fechada, deve poder baixar do estoque.
```

Essa baixa deve ser confirmável, não automática silenciosa no MVP.

---

### 3.5 Perfil profissional

Função: dados do técnico/empresa para proposta e relatório.

Deve conter:

- nome profissional/empresa;
- telefone;
- e-mail;
- logo;
- assinatura;
- cidade/região;
- dados comerciais.

---

### 3.6 Cadastro fiscal

Função: dados fiscais e comerciais avançados.

Não deve ficar misturado no levantamento.

Deve conter:

- CPF/CNPJ;
- inscrição municipal/estadual, se aplicável;
- regime tributário;
- dados de emissão futura;
- observações legais;
- impostos/configurações comerciais.

---

### 3.7 Consulta online

Função: buscar peças/produtos externos para agilizar cadastro.

Direção futura:

- abrir busca dentro do próprio app;
- apresentar resultados em uma janela interna;
- permitir selecionar um resultado;
- importar nome, marca, descrição, preço de referência e link;
- cadastrar como peça interna;
- manter fonte/link para conferência.

Importante:

```txt
A consulta online deve ajudar no cadastro, mas não substituir validação do profissional.
```

---

## 4. Organização recomendada no menu futuro

```txt
Início
Cálculos
Levantamento
Orçamentos
Relatórios
Clientes / OS
Catálogo
Estoque
Configurações
Loja / Pro
```

Para o MVP, Catálogo e Estoque podem ficar escondidos, simplificados ou dentro de Configurações, desde que a arquitetura já respeite essa separação.

---

## 5. Regra para o MVP publicável

Antes da primeira publicação:

- Levantamento deve ser simples e usável;
- Orçamento guiado deve funcionar sem duplicar itens indevidamente;
- quantidades devem aparecer no próprio item lançado;
- materiais devem distinguir profissional fornece vs cliente compra;
- cadastros administrativos não devem poluir a visita técnica;
- telas claras antigas devem ser removidas do fluxo principal.

---

## 6. Decisões já aplicadas

- Cômodos/ambientes agora têm edição;
- cômodos cadastrados foram compactados em seleção;
- ajuda do cadastro de ambiente foi separada;
- itens iguais no mesmo ambiente devem somar quantidade em vez de criar linhas duplicadas;
- cards de serviços/peças passam a mostrar quantidade já lançada no ambiente;
- orçamento guiado foi ajustado para tema escuro.

---

## 7. Pendências futuras

- separar Catálogo em área própria;
- separar Estoque em área própria;
- mover cadastro profissional/fiscal para Configurações/Perfil;
- criar fluxo de consulta online interna;
- definir baixa de estoque quando uma OS/orçamento for aprovado;
- revisar navegação final antes da Play Store.
