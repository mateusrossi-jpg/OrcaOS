import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { AppShell, Card, PageTitle, SectionLabel, brl } from "@/components/app/AppShell";
import { Sparkline } from "@/components/app/Sparkline";
import { monthSummary, jobs, receivables } from "@/components/app/data";

export const Route = createFileRoute("/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Aferix" },
      { name: "description", content: "Fluxo de caixa, lucro real, custos operacionais e análise de margem." },
    ],
  }),
  component: Financeiro,
});

function Financeiro() {
  const finalizados = jobs.filter((j) => j.status === "finalizado");

  return (
    <AppShell>
      <PageTitle
        eyebrow="Financeiro"
        title="Fluxo de caixa"
        subtitle="Resultados consolidados de orçamentos finalizados."
        action={
          <button className="inline-flex items-center gap-1.5 rounded-full border hairline bg-surface px-3 py-2 text-[12px] font-medium text-muted-foreground">
            Maio / 2025 <ChevronDown className="h-3.5 w-3.5" />
          </button>
        }
      />

      {/* Hero card */}
      <Card className="glow-gold p-5">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Lucro líquido</p>
        <p className="num mt-2 text-[34px] font-semibold leading-none text-[oklch(0.82_0.14_155)]">{brl(monthSummary.profit)}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.78_0.16_155/0.15)] px-2.5 py-1 text-[11.5px] font-semibold text-[oklch(0.82_0.14_155)]">
          <TrendingUp className="h-3 w-3" /> +18,4% vs. mês anterior
        </div>
        <div className="mt-4 h-16"><Sparkline data={monthSummary.trend} height={64} /></div>
      </Card>

      {/* Breakdown */}
      <div className="mt-3 space-y-2.5">
        <Card className="p-4">
          <Row label="Faturamento real" value={brl(monthSummary.revenue)} color="oklch(0.82 0.14 155)" />
        </Card>
        <Card className="p-4">
          <Row label="Custos operacionais" value={brl(monthSummary.costs)} color="oklch(0.68 0.2 25)" trendDown />
        </Card>
        <Card className="p-4">
          <Row label="A receber (próx. 7 dias)" value={brl(monthSummary.receivable)} color="oklch(0.82 0.14 85)" />
        </Card>
        <Card className="p-4">
          <Row label="Margem média" value={`${monthSummary.margin.toFixed(1).replace(".",",")}%`} color="oklch(0.7 0.15 310)" />
        </Card>
      </div>

      {/* Cashflow detail */}
      <SectionLabel>Resultados detalhados</SectionLabel>
      <Card className="divide-y hairline">
        {finalizados.concat(jobs.filter(j => j.status === "execucao")).slice(0, 5).map((j) => (
          <div key={j.id} className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold">{j.title}</p>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">{j.client} · {j.date}</p>
            </div>
            <div className="text-right">
              <p className="num text-[14px] font-semibold text-[oklch(0.82_0.14_155)]">{brl(j.value)}</p>
              <p className="num mt-0.5 text-[11px] text-muted-foreground">{j.margin.toFixed(1).replace(".",",")}% margem</p>
            </div>
          </div>
        ))}
      </Card>

      {/* Receivables */}
      <SectionLabel>Contas a receber</SectionLabel>
      <Card className="divide-y hairline">
        {receivables.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-[13px] font-medium">{r.client}</p>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">Vence em {r.date}</p>
            </div>
            <p className="num text-[14px] font-semibold">{brl(r.value)}</p>
          </div>
        ))}
      </Card>
    </AppShell>
  );
}

function Row({ label, value, color, trendDown }: { label: string; value: string; color?: string; trendDown?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <p className="num mt-1.5 text-[20px] font-semibold leading-none" style={color ? { color } : undefined}>{value}</p>
      </div>
      <div className={"inline-flex items-center gap-1 text-[11.5px] font-semibold " + (trendDown ? "text-[oklch(0.68_0.2_25)]" : "text-[oklch(0.82_0.14_155)]")}>
        {trendDown ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
        {trendDown ? "-4,2%" : "+12,1%"}
      </div>
    </div>
  );
}
