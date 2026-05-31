import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus, ChevronRight, Filter } from "lucide-react";
import { AppShell, Card, PageTitle, StatusPill, brl } from "@/components/app/AppShell";
import { jobs, statusLabel, type JobStatus } from "@/components/app/data";

export const Route = createFileRoute("/operacao/")({
  head: () => ({
    meta: [
      { title: "Operação — Aferix" },
      { name: "description", content: "Fluxo operacional: orçamentos, aprovação, execução e arquivamento." },
    ],
  }),
  component: Operacao,
});

const tabs: { key: "todos" | JobStatus; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "enviado", label: "Enviados" },
  { key: "aprovado", label: "Aprovados" },
  { key: "execucao", label: "Execução" },
  { key: "finalizado", label: "Finalizados" },
];

function Operacao() {
  const [tab, setTab] = useState<typeof tabs[number]["key"]>("todos");
  const list = tab === "todos" ? jobs : jobs.filter((j) => j.status === tab);

  return (
    <AppShell>
      <PageTitle
        eyebrow="Operação"
        title="Orçamentos"
        subtitle="Acompanhe o ciclo completo: do envio à conclusão."
        action={
          <Link to="/operacao" className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_30px_-10px_oklch(0.82_0.14_85/0.7)]">
            <Plus className="h-4 w-4" />
          </Link>
        }
      />

      {/* Search + filter */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border hairline bg-surface px-3.5 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Buscar por cliente, número ou título…" className="w-full bg-transparent text-[13px] placeholder:text-muted-foreground/70 focus:outline-none" />
        </div>
        <button className="grid h-12 w-12 place-items-center rounded-2xl border hairline bg-surface text-muted-foreground">
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="-mx-5 mt-4 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={
                  "whitespace-nowrap rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors " +
                  (active ? "border-primary bg-primary text-primary-foreground" : "hairline bg-surface text-muted-foreground")
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pipeline summary */}
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <PipeStat label="Enviados" value={5} />
        <PipeStat label="Aprovados" value={3} accent />
        <PipeStat label="Execução" value={2} />
      </div>

      {/* List */}
      <div className="mt-5 space-y-2.5">
        {list.map((j) => (
          <Link to="/operacao/$id" params={{ id: j.id }} key={j.id}>
            <Card className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{j.code}</span>
                  <span className="text-[11px] text-muted-foreground">·</span>
                  <span className="text-[11px] text-muted-foreground">{j.date}</span>
                </div>
                <p className="mt-1 truncate text-[14px] font-semibold">{j.title}</p>
                <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{j.client}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <StatusPill status={j.status} />
                  <span className="text-[11px] text-muted-foreground num">margem {j.margin.toFixed(1).replace(".", ",")}%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="num text-[15px] font-semibold">{brl(j.value)}</p>
                <ChevronRight className="ml-auto mt-2 h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          </Link>
        ))}
        {list.length === 0 && (
          <Card className="p-10 text-center text-[13px] text-muted-foreground">
            Nenhum orçamento em <span className="text-foreground">{statusLabel[tab as JobStatus]}</span>.
          </Card>
        )}
      </div>
    </AppShell>
  );
}

function PipeStat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <Card className={"p-3 " + (accent ? "ring-1 ring-primary/30" : "")}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className={"num mt-1 text-[22px] font-semibold leading-none " + (accent ? "text-primary" : "")}>{value}</p>
    </Card>
  );
}
