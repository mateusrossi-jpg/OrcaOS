import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Users, History, Settings, Bell, FileText, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { AppShell, Card, PageTitle, SectionLabel } from "@/components/app/AppShell";

export const Route = createFileRoute("/mais")({
  head: () => ({ meta: [{ title: "Mais — Aferix" }] }),
  component: Mais,
});

const sections = [
  {
    title: "Operação",
    items: [
      { to: "/clientes", label: "Clientes", desc: "Carteira e histórico", Icon: Users },
      { to: "/mais",     label: "Catálogo", desc: "Serviços e materiais reutilizáveis", Icon: Package },
      { to: "/mais",     label: "Histórico", desc: "Trabalhos finalizados", Icon: History },
    ],
  },
  {
    title: "Conta",
    items: [
      { to: "/mais", label: "Notificações", desc: "Alertas operacionais", Icon: Bell },
      { to: "/mais", label: "Modelos de PDF", desc: "Personalização da marca", Icon: FileText },
      { to: "/mais", label: "Preferências", desc: "Idioma, fuso, moeda", Icon: Settings },
      { to: "/mais", label: "Ajuda e suporte", desc: "Central Aferix", Icon: HelpCircle },
    ],
  },
];

function Mais() {
  return (
    <AppShell>
      <PageTitle eyebrow="Configurações" title="Mais" subtitle="Catálogo, equipe, integrações e preferências." />

      <Card className="flex items-center gap-3 p-4">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-gold-soft text-[14px] font-semibold text-primary">MA</div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold">Mateus Andrade</p>
          <p className="text-[12px] text-muted-foreground">Plano Pro · Eletricista autônomo</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Card>

      {sections.map((s) => (
        <div key={s.title}>
          <SectionLabel>{s.title}</SectionLabel>
          <Card className="divide-y hairline">
            {s.items.map((it) => (
              <Link to={it.to} key={it.label} className="flex items-center gap-3 p-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-muted-foreground">
                  <it.Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-[13.5px] font-semibold">{it.label}</p>
                  <p className="text-[11.5px] text-muted-foreground">{it.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </Card>
        </div>
      ))}

      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border hairline bg-surface py-3.5 text-[13px] font-semibold text-muted-foreground">
        <LogOut className="h-4 w-4" /> Sair da conta
      </button>
      <p className="mt-4 text-center text-[11px] text-muted-foreground">Aferix · v1.0 · feito para profissionais de campo</p>
    </AppShell>
  );
}
