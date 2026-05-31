import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardList, Wallet, CalendarDays, MoreHorizontal, Bell } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/",          label: "Resumo",     Icon: Home },
  { to: "/operacao",  label: "Operação",   Icon: ClipboardList },
  { to: "/financeiro",label: "Financeiro", Icon: Wallet },
  { to: "/agenda",    label: "Agenda",     Icon: CalendarDays },
  { to: "/mais",      label: "Mais",       Icon: MoreHorizontal },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col">
        <Header />
        <main className="flex-1 px-5 pb-28 pt-3">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[440px] border-t hairline bg-background/85 backdrop-blur-xl">
          <ul className="grid grid-cols-5 px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2">
            {navItems.map(({ to, label, Icon }) => {
              const active = to === "/" ? path === "/" : path.startsWith(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10.5px] font-medium uppercase tracking-[0.08em] transition-colors",
                      active ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className={cn("h-[20px] w-[20px]", active && "drop-shadow-[0_0_8px_oklch(0.82_0.14_85/0.45)]")} strokeWidth={active ? 2.2 : 1.7} />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b hairline bg-background/85 px-5 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-md border hairline bg-surface text-[11px] font-bold tracking-[0.15em]">
          <span>A</span>
        </div>
        <span className="text-[15px] font-semibold tracking-[0.22em]">
          AFERI<span className="text-primary">X</span>
        </span>
      </div>
      <button
        aria-label="Notificações"
        className="relative grid h-9 w-9 place-items-center rounded-full border hairline bg-surface text-muted-foreground"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
      </button>
    </header>
  );
}

/* Shared UI primitives */

export function PageTitle({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>}
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("surface-elev rounded-2xl", className)}>{children}</div>;
}

export function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{children}</h2>
      {action}
    </div>
  );
}

export function StatusPill({ status, className }: { status: import("./data").JobStatus; className?: string }) {
  const map: Record<string, string> = {
    iniciado:   "bg-white/5 text-muted-foreground",
    enviado:    "bg-[oklch(0.7_0.13_250/0.15)] text-[oklch(0.78_0.12_250)]",
    aprovado:   "bg-[oklch(0.78_0.16_155/0.15)] text-[oklch(0.82_0.14_155)]",
    execucao:   "bg-gold-soft text-primary",
    finalizado: "bg-white/5 text-foreground/70",
    arquivado:  "bg-white/5 text-muted-foreground",
  };
  const labels: Record<string, string> = {
    iniciado: "Iniciado", enviado: "Enviado", aprovado: "Aprovado",
    execucao: "Em execução", finalizado: "Finalizado", arquivado: "Arquivado",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em]", map[status], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {labels[status]}
    </span>
  );
}

export function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}
