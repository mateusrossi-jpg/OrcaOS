import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Plus, TrendingUp, AlertCircle, Calendar, FileText } from "lucide-react";
import { AppShell, Card, SectionLabel, StatusPill, brl } from "@/components/app/AppShell";
import { Sparkline } from "@/components/app/Sparkline";
import { monthSummary, upcomingJobs, receivables } from "@/components/app/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resumo — Aferix" },
      { name: "description", content: "Painel operacional: lucro real, faturamento, custos, agenda e saúde financeira do seu negócio." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <AppShell>
      {/* Greeting */}
      <section className="mb-5">
        <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">Boa noite</p>
        <h1 className="mt-1 text-[28px] font-semibold leading-tight">
          Mateus, <span className="text-primary">tudo sob controle</span>.
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">Resumo operacional do seu negócio em maio.</p>
      </section>

      {/* Hero profit */}
      <Card className="glow-gold relative overflow-hidden p-5">
        <div className="flex items-center justify-between text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <span>Lucro do mês</span>
          <span className="rounded-full border hairline px-2 py-0.5">Maio / 2025</span>
        </div>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="num text-[34px] font-semibold leading-none text-[oklch(0.82_0.14_155)]">{brl(monthSummary.profit)}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-[oklch(0.82_0.14_155)]" />
              <span className="num font-medium text-foreground">+18,4%</span> vs. abril
            </p>
          </div>
          <div className="h-12 w-28 opacity-95"><Sparkline data={monthSummary.trend} /></div>
        </div>
      </Card>

      {/* KPI grid */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Kpi label="Faturamento"  value={brl(monthSummary.revenue)}    color="oklch(0.7 0.13 250)" trend={[5,8,7,10,12,11,14,16,15,18,20,22]} />
        <Kpi label="Custos"       value={brl(monthSummary.costs)}      color="oklch(0.68 0.2 25)"  trend={[12,14,11,15,13,16,14,17,15,18,16,19]} />
        <Kpi label="A receber"    value={brl(monthSummary.receivable)} color="oklch(0.82 0.14 85)" trend={[3,4,6,5,8,7,9,8,10,9,12,11]} />
        <Kpi label="Margem"       value={`${monthSummary.margin.toFixed(1).replace(".",",")}%`} color="oklch(0.7 0.15 310)" trend={[30,32,31,34,36,35,38,37,40,42,41,43]} />
      </div>

      {/* Alert */}
      <Card className="mt-4 flex items-start gap-3 p-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold-soft text-primary">
          <AlertCircle className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-[13.5px] font-semibold">3 orçamentos aguardando aprovação há mais de 5 dias</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">Revise e reenvie para acelerar o caixa.</p>
        </div>
        <ChevronRight className="mt-2 h-4 w-4 text-muted-foreground" />
      </Card>

      {/* Upcoming jobs */}
      <SectionLabel action={<Link to="/agenda" className="text-[11px] font-medium text-primary">Ver agenda</Link>}>Próximos trabalhos</SectionLabel>
      <div className="space-y-2.5">
        {upcomingJobs.map((j) => (
          <Card key={j.id} className="flex items-center gap-3 p-3.5">
            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-surface-2 text-center">
              <span className="num text-[16px] font-semibold leading-none">{j.date.split("/")[0]}</span>
              <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Mai</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold">{j.title}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">{j.client} · {j.time}</p>
              <div className="mt-2"><StatusPill status={j.status} /></div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Card>
        ))}
      </div>

      {/* Pipeline mini */}
      <SectionLabel action={<Link to="/operacao" className="text-[11px] font-medium text-primary">Ver todos</Link>}>Orçamentos em andamento</SectionLabel>
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Enviados</p>
          <p className="num mt-1 text-[28px] font-semibold leading-none">5</p>
          <p className="mt-2 text-[11.5px] text-muted-foreground">Aguardando aprovação</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Aprovados</p>
          <p className="num mt-1 text-[28px] font-semibold leading-none">3</p>
          <p className="mt-2 text-[11.5px] text-muted-foreground">Prontos para execução</p>
        </Card>
      </div>

      {/* Receivables */}
      <SectionLabel>Vencimentos próximos</SectionLabel>
      <Card className="divide-y hairline">
        {receivables.map((r) => (
          <div key={r.id} className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-surface-2">
              <span className="num text-[13px] font-semibold leading-none">{r.date.split("/")[0]}</span>
              <span className="mt-0.5 text-[8.5px] uppercase tracking-wider text-muted-foreground">Mai</span>
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium">Recebimento — {r.client}</p>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">À vista · Pix</p>
            </div>
            <p className="num text-[14px] font-semibold text-[oklch(0.82_0.14_155)]">{brl(r.value)}</p>
          </div>
        ))}
      </Card>

      {/* Primary action */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link to="/operacao" className="surface-elev flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-[13px] font-semibold text-foreground">
          <FileText className="h-4 w-4 text-muted-foreground" /> Operação
        </Link>
        <Link to="/operacao" className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-[13.5px] font-semibold text-primary-foreground shadow-[0_8px_30px_-10px_oklch(0.82_0.14_85/0.7)]">
          <Plus className="h-4 w-4" /> Novo orçamento
        </Link>
      </div>
    </AppShell>
  );
}

function Kpi({ label, value, color, trend }: { label: string; value: string; color: string; trend: number[] }) {
  return (
    <Card className="p-4">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="num mt-1.5 text-[18px] font-semibold leading-tight" style={{ color }}>{value}</p>
      <div className="mt-2 h-8 opacity-90"><Sparkline data={trend} stroke={color} fill={`${color.replace(")", " / 0.16)")}`} /></div>
    </Card>
  );
}
