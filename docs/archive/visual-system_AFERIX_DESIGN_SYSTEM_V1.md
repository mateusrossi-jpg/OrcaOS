# AFERIX DESIGN SYSTEM V1
**STATUS:** CONGELADO

## TIPOGRAFIA
Apenas as seguintes escalas são permitidas no Tailwind/CSS:
- **H1:** `text-2xl font-black tracking-tighter` (Cockpits e Headers principais)
- **H2:** `text-xl font-black tracking-widest uppercase` (Títulos de Seção)
- **H3:** `text-sm font-bold tracking-widest uppercase` (Cards e Títulos menores)
- **Body:** `text-sm font-medium leading-relaxed` (Descrições)
- **Caption:** `text-xs text-text-secondary` (Textos de apoio)
- **Micro Label:** `text-[10px] font-bold tracking-widest uppercase` (Tags e status)

## ESPAÇAMENTOS
Permitidos apenas: `8px, 12px, 16px, 24px, 32px, 48px, 64px`.

## CARDS (Os 5 Elementos)
Nenhum outro tipo de borda ou sombra é permitido:
1. `SurfaceCard`: Fundo base (`bg-surface-900 border border-surface-800`).
2. `MetricCard`: Exibe um KPI (Fundo com 10% opacity da cor de sotaque).
3. `ActionCard`: Card clicável (Hover e Active animations, sombra pronunciada).
4. `TimelineCard`: Usado no Feed 360 (Linha vertical à esquerda).
5. `StatCard`: Pequeno indicador numérico ao lado de textos.

## BOTÕES
- `Primary`: `bg-[var(--accent-blue)] text-[#050505] font-black tracking-widest uppercase`.
- `Secondary`: `bg-surface-800 text-white`.
- `Ghost`: Sem fundo, apenas texto destacado no hover.
- `Danger`: `bg-status-error text-white`.
- `FAB`: Ocupa toda a parte inferior da tela Mobile (`fixed bottom-0`).

## CORES (Accent)
- **Blue:** Ação Principal, Fluxo Normal, Receita a ganhar.
- **Green:** Concluído, Lucro Seguro, Health > 80.
- **Yellow:** Atenção, Garantia Vigente, Health 50-79.
- **Orange/Error:** SLA estourado, Churn em risco, Health < 50.

## ESTADOS (Vazios/Carregando)
Regra: Zero spinners genéricos. Zero textos como "Sem dados". Usar esqueleto (Skeleton) com a forma exata do componente que vai carregar.
