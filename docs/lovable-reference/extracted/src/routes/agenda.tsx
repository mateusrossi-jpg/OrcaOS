import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { AppShell, Card, PageTitle, StatusPill } from "@/components/app/AppShell";
import { agendaItems, calendarDays } from "@/components/app/data";

export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda — Aferix" },
      { name: "description", content: "Calendário operacional integrado: orçamentos aprovados, visitas e execuções." },
    ],
  }),
  component: Agenda,
});

const week = ["D", "S", "T", "Q", "Q", "S", "S"];

function Agenda() {
  const [selected, setSelected] = useState(21);
  return (
    <AppShell>
      <PageTitle
        eyebrow="Maio / 2025"
        title="Agenda"
        subtitle="Trabalhos aprovados são agendados automaticamente."
        action={
          <button className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
            <Plus className="h-4 w-4" />
          </button>
        }
      />

      <Card className="p-3">
        <div className="grid grid-cols-7 gap-1 px-1 pb-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {week.map((d, i) => <span key={i}>{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((d) => {
            const active = d === selected;
            return (
              <button
                key={d}
                onClick={() => setSelected(d)}
                className={
                  "num flex h-12 flex-col items-center justify-center rounded-xl text-[14px] font-semibold transition-colors " +
                  (active ? "bg-primary text-primary-foreground" : "bg-surface-2 text-foreground hover:bg-white/5")
                }
              >
                {d}
                {[21, 22, 24].includes(d) && (
                  <span className={"mt-1 h-1 w-1 rounded-full " + (active ? "bg-primary-foreground" : "bg-primary")} />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <h2 className="mt-6 text-[14px] font-semibold">Quarta-feira, 21 de maio</h2>
      <p className="text-[12px] text-muted-foreground">{agendaItems.length} compromissos agendados</p>

      <div className="relative mt-4 space-y-3">
        <div className="absolute left-[42px] top-2 bottom-2 w-px bg-white/5" />
        {agendaItems.map((a) => (
          <div key={a.time} className="relative flex gap-3">
            <div className="w-[42px] pt-3 text-right text-[11.5px] font-semibold num text-muted-foreground">{a.time}</div>
            <span className="relative z-10 mt-4 h-2 w-2 shrink-0 rounded-full bg-primary ring-4 ring-background" />
            <Card className="flex-1 p-3.5">
              <p className="text-[13.5px] font-semibold">{a.title}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">{a.client}</p>
              <div className="mt-2"><StatusPill status={a.status} /></div>
            </Card>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full rounded-2xl border hairline bg-surface py-3.5 text-[13px] font-semibold">
        Ver mês completo
      </button>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border hairline bg-surface px-3.5 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input placeholder="Buscar agendamento…" className="w-full bg-transparent text-[13px] placeholder:text-muted-foreground/70 focus:outline-none" />
      </div>
    </AppShell>
  );
}
