# AFERIX DESIGN SYSTEM: PATTERNS

Padrões recorrentes que devem ser reaproveitados antes de se pensar em criar algo novo.

## 1. Insight Row (Métricas)
Linha usada para reportar estado financeiro ou de trabalho.
- **Wrapper:** `flex justify-between items-center p-4`
- **Label (Esquerda):** `text-[15px] text-white/80` (O quê?)
- **Value (Direita):** `text-[15px] font-semibold text-[COR SEMÂNTICA]` (Quanto?)
- **Ação Opcional:** Envolver tudo em um ListAction para drill-down.

## 2. Timeline Row (O Agenda Block)
Linha de evento baseada em tempo (Ex: O 1º bloco da Home).
- **Time/Value:** `text-[26px] font-semibold text-white tracking-tight`
- **Subject:** `text-[15px] text-white/90 font-medium` (Ex: Condomínio Vale Verde)
- **Description:** `text-[13px] text-white/50` (Ex: Instalação de Câmeras IP)
- **Ação Lateral:** Um Primary Action Button (`[ INICIAR ]`) posicionado à direita.

## 3. Dashboard KPI (Resultado)
Exibe número massivo e percentual.
- **Wrapper:** `flex items-end justify-between p-5`
- **Main Block:**
  - Label: `text-[13px] text-white/50 mb-1`
  - Value: `text-[28px] font-semibold text-white tracking-tight leading-none`
- **Secondary Block:** (Ex: 82% alcançado)
  - Value: `text-[13px] font-semibold text-emerald-400 mb-1`

## A Regra de Ferro
Qualquer nova UI (Clientes, Configurações, Relatórios) deve tentar se encaixar nestes 3 padrões antes de criar um novo `div` customizado. O alinhamento `flex justify-between` de `15px` e `13px` é a linguagem universal de leitura da aplicação.
