# AFERIX MOTION LAWS — THE SOUL
**Status: MANDATORY | Focus: CINEMATIC EXPERIENCE**

## 1. O ESTILO AFERIX
Animações no Aferix devem ser **Subconscientes**. O usuário deve sentir que o sistema é fluido, mas não deve conseguir descrever o movimento exato.

## 2. REGRAS TÉCNICAS
- **Duração Base:** `300ms` a `500ms` (`var(--transition-soft)` ou `var(--transition-premium)`).
- **Duração Rápida:** `150ms` (`var(--transition-fast)`).
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (The Aferix Curve).

## 3. COMPORTAMENTOS PADRÃO
- **Entrada de Card:** Opacidade de 0 para 1 + Y-axis de 4px para 0.
- **Feedback de Toque:** `scale(0.97)` ou `scale(0.98)` instatâneo com retorno suave.
- **Troca de Tela:** Cross-fade suave. Sem slides agressivos ou transições 3D.

## 4. PROIBIÇÕES
- ❌ **Efeitos Bouncing:** Tirar o aspecto profissional/executivo do sistema.
- ❌ **Animações Flashy:** Muita cor ou muito brilho em movimento.
- ❌ **Delays Acumulados:** Sequenciamento de animações que atrasam a produtividade operacional.
