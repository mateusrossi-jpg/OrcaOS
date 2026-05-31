import { createFileRoute } from "@tanstack/react-router";
import { Search, Plus, Phone, MapPin, ChevronRight } from "lucide-react";
import { AppShell, Card, PageTitle, SectionLabel } from "@/components/app/AppShell";
import { clients } from "@/components/app/data";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Aferix" },
      { name: "description", content: "Gestão de clientes e histórico de relacionamento." },
    ],
  }),
  component: Clientes,
});

function Clientes() {
  return (
    <AppShell>
      <PageTitle
        eyebrow="CRM"
        title="Clientes"
        subtitle="Cadastro, histórico e relacionamento."
        action={<button className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground"><Plus className="h-4 w-4" /></button>}
      />

      <div className="flex items-center gap-2 rounded-2xl border hairline bg-surface px-3.5 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input placeholder="Buscar por nome, e-mail ou telefone…" className="w-full bg-transparent text-[13px] placeholder:text-muted-foreground/70 focus:outline-none" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Clientes ativos</p>
          <p className="num mt-1 text-[24px] font-semibold leading-none">{clients.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Novos no mês</p>
          <p className="num mt-1 text-[24px] font-semibold leading-none text-primary">3</p>
        </Card>
      </div>

      <SectionLabel>Carteira</SectionLabel>
      <Card className="divide-y hairline">
        {clients.map((c) => (
          <button key={c.id} className="flex w-full items-center gap-3 p-4 text-left">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-soft text-[13px] font-semibold text-primary">
              {c.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold">{c.name}</p>
              <div className="mt-1 flex items-center gap-3 text-[11.5px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {c.phone}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-[11.5px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.city}</span>
                <span>·</span>
                <span>{c.jobs} trabalhos</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </Card>
    </AppShell>
  );
}
