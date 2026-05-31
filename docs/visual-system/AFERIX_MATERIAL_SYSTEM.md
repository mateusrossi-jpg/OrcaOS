# AFERIX DESIGN SYSTEM
**Status:** FROZEN (Active Core Standard)
**Theme:** Premium Software / Minimalist Dark (Linear, Arc, Apple Wallet)

O Aferix é um sistema operacional profissional de bolso. A sensação principal deve ser: "Eu tenho controle".
Ele deixou para trás a analogia literal de "equipamento/hardware" para abraçar uma identidade de software de altíssimo padrão, refinada e extremamente elegante.

## 1. Surfaces e Geometria

- **Translucidez Elegante:** Fundo base preto/grafite profundo. Superfícies são formadas por camadas ultra-sutis, ex: `bg-white/[0.02]` com bordas `border-white/5`.
- **Raio de Borda (Border Radius):** Extremamente amigável e espaçoso. Usamos `rounded-[28px]` ou `rounded-3xl` para transmitir fluidez.
- **Espaçamento (Breathing Room):** Paddings generosos (`p-7`) são inegociáveis. O conteúdo precisa respirar amplamente para garantir clareza instantânea.

## 2. Tipografia Impecável

A hierarquia é construída pelo contraste de peso e opacidade, não apenas pelo tamanho.

- **Overlines (Subtítulos de bloco):** `text-[12px] font-medium text-white/50 tracking-wide`.
- **Dados Principais:** Altamente proeminentes e compactos (`font-semibold tracking-tighter`). Ex: Valores financeiros em `text-[40px]`.
- **Estados Vazios:** Elegantes, nunca ruidosos. Uma opacidade de `40%` é suficiente para indicar silêncio sem parecer um "erro" ou um maquinário "desligado".

## 3. A Regra do Ouro (Accent Gold)

O dourado (`#FFD60A`) é a nossa assinatura, mas é **raro**.
Quando tudo é dourado, nada é importante. Ele só deve ser usado em:
- Indicadores ativos críticos.
- Horários de compromissos imediatos.

O foco não é adicionar peso à tela, mas sim leveza à operação. Tudo que não for essencial para o entendimento em menos de 1 segundo deve ser removido ou transformado em metadado (opacidade 40-50%).
