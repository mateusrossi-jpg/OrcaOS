import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, FileDown, Send, CheckCircle2, Circle, MapPin, Phone, ClipboardCheck } from "lucide-react";
import { AppShell, Card, StatusPill, brl } from "@/components/app/AppShell";
import { budgetDetail } from "@/components/app/data";

export const Route = createFileRoute("/operacao/$id")({
  head: () => ({ meta: [{ title: `Orçamento #${"1025"} — Aferix` }] }),
  component: BudgetDetail,
});

const tabs = ["Visão geral", "Itens", "Custos & margem", "Cliente", "Execução"] as const;

function BudgetDetail() {
  const [tab, setTab] = useState<typeof tabs[number]>("Visão geral");
  const b = budgetDetail;

  return (
    <AppShell>
      <div className="mb-4 flex items-center gap-2">
        <Link to="/operacao" className="grid h-9 w-9 place-items-center rounded-full border hairline bg-surface text-muted-foreground">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Orçamento #{b.id}</p>
          <h1 className="text-[20px] font-semibold leading-tight">Instalação elétrica residencial</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 border-b hairline pb-0">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "whitespace-nowrap border-b-2 px-1 pb-3 pt-1 text-[12.5px] font-medium transition-colors " +
                (tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground")
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "Visão geral" && <Overview />}
      {tab === "Itens" && <Itens />}
      {tab === "Custos & margem" && <Custos />}
      {tab === "Cliente" && <Cliente />}
      {tab === "Execução" && <Execucao />}

      {/* Footer actions */}
      <div className="fixed inset-x-0 bottom-[68px] z-20 mx-auto w-full max-w-[440px] border-t hairline bg-background/90 px-5 py-3 backdrop-blur-xl">
        <div className="flex gap-2">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border hairline bg-surface py-3 text-[13px] font-semibold text-foreground">
            <FileDown className="h-4 w-4" /> Ver PDF
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[13px] font-semibold text-primary-foreground">
            <Send className="h-4 w-4" /> Enviar ao cliente
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Overview() {
  const b = budgetDetail;
  return (
    <div className="mt-5 space-y-3 pb-24">
      {/* Client + status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Cliente</p>
            <p className="mt-1 text-[15px] font-semibold">{b.client.name}</p>
            <p className="text-[12px] text-muted-foreground">{b.client.phone}</p>
          </div>
          <StatusPill status={b.status} />
        </div>
      </Card>

      {/* Totals */}
      <Card className="p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Valor total</p>
            <p className="num mt-1 text-[28px] font-semibold leading-none">{brl(b.total)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Margem</p>
            <p className="num mt-1 text-[20px] font-semibold text-primary">{b.margin.toFixed(1).replace(".", ",")}%</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t hairline pt-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Custos</p>
            <p className="num mt-1 text-[15px] font-semibold text-[oklch(0.68_0.2_25)]">{brl(b.costs)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Lucro</p>
            <p className="num mt-1 text-[15px] font-semibold text-[oklch(0.82_0.14_155)]">{brl(b.profit)}</p>
          </div>
        </div>
      </Card>

      {/* Stepper */}
      <Card className="p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Progresso do orçamento</p>
        <ol className="space-y-3">
          {b.steps.map((s, i) => {
            const done = i < 4;
            const current = i === 4;
            return (
              <li key={s.key} className="flex items-start gap-3">
                {done ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-[oklch(0.82_0.14_155)]" />
                ) : (
                  <Circle className={"mt-0.5 h-5 w-5 " + (current ? "text-primary" : "text-muted-foreground/60")} />
                )}
                <div className="flex-1">
                  <p className={"text-[13.5px] font-semibold " + (current ? "text-primary" : "")}>{i + 1}. {s.label}</p>
                  <p className="text-[12px] text-muted-foreground">{s.hint}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}

function Itens() {
  const b = budgetDetail;
  return (
    <div className="mt-5 space-y-2.5 pb-24">
      <Card className="divide-y hairline">
        {b.items.map((it, i) => (
          <div key={i} className="flex items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold">{it.name}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground num">{it.qty} {it.unit} × {brl(it.price)}</p>
            </div>
            <p className="num shrink-0 text-[14px] font-semibold">{brl(it.total)}</p>
          </div>
        ))}
      </Card>
      <Card className="flex items-center justify-between p-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Subtotal</p>
        <p className="num text-[16px] font-semibold">{brl(b.total)}</p>
      </Card>
      <button className="mt-2 w-full rounded-2xl bg-primary py-3.5 text-[13.5px] font-semibold text-primary-foreground">
        + Adicionar item do catálogo
      </button>
    </div>
  );
}

function Custos() {
  const b = budgetDetail;
  return (
    <div className="mt-5 space-y-3 pb-24">
      <Card className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Resumo financeiro</p>
        <Row label="Materiais" value={brl(1080)} />
        <Row label="Mão de obra" value={brl(500)} />
        <div className="my-3 h-px bg-white/5" />
        <Row label="Custo total" value={brl(b.costs)} muted />
        <Row label="Receita" value={brl(b.total)} muted />
        <div className="my-3 h-px bg-white/5" />
        <Row label="Lucro líquido" value={brl(b.profit)} strong color="oklch(0.82 0.14 155)" />
        <Row label="Margem" value={`${b.margin.toFixed(1).replace(".", ",")}%`} strong color="oklch(0.82 0.14 85)" />
      </Card>

      <Card className="p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Margem alvo</p>
        <div className="h-2 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-primary" style={{ width: "85%" }} />
        </div>
        <p className="mt-2 text-[12px] text-muted-foreground">42,5% de 50% (meta)</p>
      </Card>
    </div>
  );
}

function Row({ label, value, muted, strong, color }: { label: string; value: string; muted?: boolean; strong?: boolean; color?: string }) {
  return (
    <div className="mt-2 flex items-center justify-between">
      <span className={"text-[13px] " + (muted ? "text-muted-foreground" : "text-foreground")}>{label}</span>
      <span className={"num " + (strong ? "text-[15px] font-semibold" : "text-[13.5px] font-medium")} style={color ? { color } : undefined}>{value}</span>
    </div>
  );
}

function Cliente() {
  const c = budgetDetail.client;
  return (
    <div className="mt-5 space-y-3 pb-24">
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-gold-soft text-[15px] font-semibold text-primary">JS</div>
          <div>
            <p className="text-[15px] font-semibold">{c.name}</p>
            <p className="text-[12px] text-muted-foreground">Cliente desde fev/2024</p>
          </div>
        </div>
        <div className="mt-4 space-y-3 border-t hairline pt-4">
          <Line icon={<Phone className="h-4 w-4" />} text={c.phone} />
          <Line icon={<MapPin className="h-4 w-4" />} text={c.address} />
        </div>
      </Card>
      <Card className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Aprovação</p>
        <p className="mt-2 text-[13.5px]">Aprovado por <span className="font-semibold">{c.name}</span> em 19/05/2025 às 14:32.</p>
        <p className="mt-1 text-[12px] text-muted-foreground">Confirmação registrada via link público.</p>
      </Card>
    </div>
  );
}

function Line({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-[13px]">
      <span className="text-muted-foreground">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function Execucao() {
  return (
    <div className="mt-5 space-y-3 pb-24">
      <Card className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Agendamento</p>
        <p className="mt-1 text-[15px] font-semibold">Quarta-feira, 21 de maio · 08:00</p>
        <p className="text-[12px] text-muted-foreground">Duração estimada: 6h · Equipe: Mateus + 1 ajudante</p>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Checklist de execução</p>
        </div>
        <ul className="mt-3 space-y-2.5 text-[13px]">
          {["Materiais separados", "Confirmação com o cliente", "Ferramentas conferidas", "Fotos antes/depois", "Recebimento registrado"].map((t, i) => (
            <li key={t} className="flex items-center gap-3">
              {i < 2 ? <CheckCircle2 className="h-4 w-4 text-[oklch(0.82_0.14_155)]" /> : <Circle className="h-4 w-4 text-muted-foreground/60" />}
              <span className={i < 2 ? "text-muted-foreground line-through" : ""}>{t}</span>
            </li>
          ))}
        </ul>
      </Card>
      <button className="w-full rounded-2xl bg-primary py-3.5 text-[13.5px] font-semibold text-primary-foreground">
        Marcar execução como concluída
      </button>
    </div>
  );
}
