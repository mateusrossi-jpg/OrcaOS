import { useState } from "react";
import {
  Navigation,
  MapPin,
  FileText,
  Wrench,
  UserPlus,
  ChevronRight,
  Home,
  LayoutGrid,
  DollarSign,
  CalendarDays,
  MoreHorizontal,
  Clock,
  Timer,
  AlertTriangle,
  Pause,
  Zap,
} from "lucide-react";

// ─── tokens ────────────────────────────────────────────────────────────────
const C = {
  bg: "#050505",
  surface: "#0F0F0F",
  surfaceElevated: "#141414",
  surfaceHover: "#161616",
  surfaceBorder: "rgba(255,255,255,0.07)",
  surfaceBorderStrong: "rgba(255,255,255,0.10)",
  gold: "#D4A94E",
  goldDim: "rgba(212,169,78,0.11)",
  goldBorder: "rgba(212,169,78,0.20)",
  white: "#F2F2F2",
  muted: "#505050",
  mutedLight: "#3A3A3A",
  red: "#C0392B",
  redDim: "rgba(192,57,43,0.12)",
  redBorder: "rgba(192,57,43,0.22)",
  amber: "#D4A94E",
  amberDim: "rgba(212,169,78,0.10)",
  orange: "#C0641A",
  orangeDim: "rgba(192,100,26,0.12)",
  orangeBorder: "rgba(192,100,26,0.22)",
  textPrimary: "#EFEFEF",
  textSecondary: "#808080",
  textTertiary: "#3C3C3C",
};

// ─── data ───────────────────────────────────────────────────────────────────
const today = new Date();
const DAY = today.toLocaleDateString("pt-BR", { weekday: "long" }).toUpperCase();
const DATE_STR = today.toLocaleDateString("pt-BR", { day: "numeric", month: "long" }).toUpperCase();

const OPS_CHIPS = [
  {
    id: 1,
    icon: <Clock size={11} />,
    label: "3 atendimentos hoje",
    accent: false,
  },
  {
    id: 2,
    icon: <Zap size={11} />,
    label: "R$ 1.200 bloqueados",
    accent: "red" as const,
  },
  {
    id: 3,
    icon: <Pause size={11} />,
    label: "1 serviço pausado",
    accent: "orange" as const,
  },
];

const FRICTIONS = [
  {
    id: 1,
    icon: "💸",
    label: "Cobrança vencida",
    sub: "Condomínio Vale Verde",
    tag: "R$ 1.200",
    tagColor: C.red,
    tagBg: C.redDim,
    urgent: true,
  },
  {
    id: 2,
    icon: "📄",
    label: "3 propostas sem resposta",
    sub: "Enviadas há 3 dias",
    tag: "Aguardando",
    tagColor: C.amber,
    tagBg: C.amberDim,
    urgent: false,
  },
  {
    id: 3,
    icon: "🔧",
    label: "1 serviço pausado",
    sub: "Aguardando material",
    tag: null,
    tagColor: null,
    tagBg: null,
    urgent: false,
  },
];

const UPCOMING = [
  {
    id: 1,
    time: "14:30",
    title: "Instalação de Câmeras IP",
    client: "Cond. Vale Verde",
    status: "next" as const,
  },
  {
    id: 2,
    time: "17:00",
    title: "Manutenção de Rede",
    client: "Escritório Central",
    status: "scheduled" as const,
  },
  {
    id: 3,
    time: "19:30",
    title: "Vistoria CFTV",
    client: "Residência Moura",
    status: "scheduled" as const,
  },
];

const QUICK = [
  {
    icon: FileText,
    label: "Novo Orçamento",
    hint: "Gerar proposta comercial",
    primary: true,
  },
  {
    icon: Wrench,
    label: "Nova OS",
    hint: "Abrir ordem de serviço",
    primary: false,
  },
  {
    icon: UserPlus,
    label: "Novo Cliente",
    hint: "Cadastrar novo cliente",
    primary: false,
  },
];

const NAV_TABS = [
  { icon: Home, label: "Home" },
  { icon: LayoutGrid, label: "Operações" },
  { icon: DollarSign, label: "Financeiro" },
  { icon: CalendarDays, label: "Agenda" },
  { icon: MoreHorizontal, label: "Mais" },
];

// ─── atoms ──────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: "9.5px",
        letterSpacing: "0.18em",
        fontWeight: 500,
        color: C.textTertiary,
        textTransform: "uppercase",
      }}
    >
      {children}
    </p>
  );
}

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        backgroundColor: C.surface,
        border: `1px solid ${C.surfaceBorder}`,
        borderRadius: "22px",
        boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 32px rgba(0,0,0,0.5)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type ChipAccent = false | "red" | "orange";
function OpsChip({
  icon,
  label,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  accent: ChipAccent;
}) {
  const bg =
    accent === "red"
      ? "rgba(192,57,43,0.10)"
      : accent === "orange"
      ? "rgba(192,100,26,0.10)"
      : "rgba(255,255,255,0.04)";
  const border =
    accent === "red"
      ? "rgba(192,57,43,0.22)"
      : accent === "orange"
      ? "rgba(192,100,26,0.22)"
      : "rgba(255,255,255,0.07)";
  const color =
    accent === "red"
      ? "#D05A4A"
      : accent === "orange"
      ? "#C07040"
      : "#555555";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: "8px",
        padding: "5px 11px",
      }}
    >
      <span style={{ color, lineHeight: 1, display: "flex" }}>{icon}</span>
      <span
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "10px",
          fontWeight: 500,
          color,
          letterSpacing: "0.03em",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── main ────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        backgroundColor: C.bg,
        minHeight: "100svh",
        display: "flex",
        justifyContent: "center",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          minHeight: "100svh",
          backgroundColor: C.bg,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
        }}
      >
        {/* ── Status Bar ── */}
        <div
          style={{
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: "26px",
            paddingRight: "26px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "12px",
              fontWeight: 500,
              color: C.textSecondary,
            }}
          >
            9:41
          </span>
          <div
            style={{
              width: "16px",
              height: "8px",
              borderRadius: "2px",
              border: `1px solid ${C.muted}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "70%",
                backgroundColor: C.textSecondary,
                borderRadius: "1px",
              }}
            />
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            paddingBottom: "124px",
            scrollbarWidth: "none",
          }}
        >
          {/* ━━━ HEADER ━━━ */}
          <div style={{ padding: "4px 26px 24px" }}>
            {/* date + count badge */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "9px",
                      letterSpacing: "0.22em",
                      color: C.textTertiary,
                      textTransform: "uppercase",
                    }}
                  >
                    {DAY}
                  </span>
                  <span
                    style={{
                      width: "2px",
                      height: "2px",
                      borderRadius: "50%",
                      backgroundColor: C.textTertiary,
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "9px",
                      letterSpacing: "0.14em",
                      color: C.textTertiary,
                      textTransform: "uppercase",
                    }}
                  >
                    {DATE_STR}
                  </span>
                </div>
                <h1
                  style={{
                    fontSize: "26px",
                    fontWeight: 700,
                    color: C.textPrimary,
                    letterSpacing: "-0.025em",
                    lineHeight: 1.1,
                    marginTop: "6px",
                  }}
                >
                  Bom dia, Mateus.
                </h1>
              </div>

              {/* count badge */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: C.goldDim,
                  border: `1px solid ${C.goldBorder}`,
                  borderRadius: "12px",
                  padding: "8px 12px",
                  gap: "1px",
                  marginTop: "16px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "22px",
                    fontWeight: 700,
                    color: C.gold,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  3
                </span>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "8px",
                    color: "rgba(212,169,78,0.55)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  aptos
                </span>
              </div>
            </div>

            {/* operational chips — horizontal scroll */}
            <div
              style={{
                display: "flex",
                gap: "7px",
                overflowX: "auto",
                scrollbarWidth: "none",
                paddingBottom: "2px",
              }}
            >
              {OPS_CHIPS.map((chip) => (
                <OpsChip
                  key={chip.id}
                  icon={chip.icon}
                  label={chip.label}
                  accent={chip.accent}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              padding: "0 16px",
              display: "flex",
              flexDirection: "column",
              gap: "11px",
            }}
          >
            {/* ━━━ MISSION BRIEFING CARD ━━━ */}
            <Card
              style={{
                position: "relative",
                overflow: "hidden",
                borderColor: C.surfaceBorderStrong,
              }}
            >
              {/* ambient glow */}
              <div
                style={{
                  position: "absolute",
                  top: "-100px",
                  right: "-100px",
                  width: "320px",
                  height: "320px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(212,169,78,0.055) 0%, transparent 62%)",
                  pointerEvents: "none",
                }}
              />
              {/* floor glow */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "100px",
                  background:
                    "linear-gradient(to top, rgba(212,169,78,0.03), transparent)",
                  pointerEvents: "none",
                  borderRadius: "0 0 22px 22px",
                }}
              />

              {/* ── card header: label + time badge ── */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "24px 24px 0",
                  marginBottom: "20px",
                }}
              >
                <Label>Próximo atendimento</Label>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: C.goldDim,
                    border: `1px solid ${C.goldBorder}`,
                    borderRadius: "8px",
                    padding: "5px 12px",
                  }}
                >
                  <Clock size={11} style={{ color: C.gold }} />
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: C.gold,
                      letterSpacing: "0.06em",
                    }}
                  >
                    14:30
                  </span>
                </div>
              </div>

              {/* ── mission body ── */}
              <div style={{ padding: "0 24px" }}>
                {/* service name */}
                <h2
                  style={{
                    fontSize: "32px",
                    fontWeight: 800,
                    color: C.textPrimary,
                    lineHeight: 1.05,
                    letterSpacing: "-0.035em",
                    marginBottom: "10px",
                  }}
                >
                  Instalação de<br />Câmeras IP
                </h2>

                {/* client */}
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: C.gold,
                    letterSpacing: "-0.01em",
                    marginBottom: "8px",
                  }}
                >
                  Condomínio Vale Verde
                </p>

                {/* address */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "20px",
                  }}
                >
                  <MapPin size={12} style={{ color: C.muted, flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", color: C.muted }}>
                    Barra da Tijuca — RJ
                  </span>
                </div>

                {/* ── operational context strip ── */}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "24px",
                  }}
                >
                  <ContextPill icon={<Navigation size={11} />} label="23 min de rota" />
                  <ContextPill icon={<Timer size={11} />} label="~3h de serviço" />
                  <ContextPill
                    icon={<AlertTriangle size={11} />}
                    label="Urgente"
                    urgent
                  />
                </div>

                {/* ── checklist-style details ── */}
                <div
                  style={{
                    backgroundColor: "rgba(255,255,255,0.025)",
                    border: `1px solid ${C.surfaceBorder}`,
                    borderRadius: "12px",
                    padding: "14px 16px",
                    marginBottom: "22px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <BriefingRow label="Contato" value="Ricardo Almeida" />
                  <BriefingRow label="Acesso" value="Portaria — solicitar cartão" />
                  <BriefingRow label="Equipamentos" value="4× câmeras, DVR, cabos" />
                </div>
              </div>

              {/* ── CTA ── */}
              <div style={{ padding: "0 24px 24px" }}>
                <button
                  style={{
                    width: "100%",
                    backgroundColor: C.gold,
                    color: "#040404",
                    borderRadius: "14px",
                    padding: "19px 20px",
                    fontSize: "13px",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    boxShadow:
                      "0 6px 28px rgba(212,169,78,0.28), 0 1px 0 rgba(255,255,255,0.14) inset",
                    transition: "transform 0.1s ease, box-shadow 0.1s ease",
                  }}
                  onMouseDown={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 2px 12px rgba(212,169,78,0.16)";
                  }}
                  onMouseUp={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 6px 28px rgba(212,169,78,0.28), 0 1px 0 rgba(255,255,255,0.14) inset";
                  }}
                >
                  <Navigation size={15} strokeWidth={2.5} />
                  Iniciar Rota
                </button>
              </div>
            </Card>

            {/* ━━━ FRICTIONS ━━━ */}
            <Card style={{ overflow: "hidden" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 20px 14px",
                }}
              >
                <Label>Requer atenção</Label>
                <AlertTriangle size={12} style={{ color: C.mutedLight }} />
              </div>

              {FRICTIONS.map((item) => (
                <button
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    padding: "13px 20px",
                    borderTop: `1px solid ${C.surfaceBorder}`,
                    background: "none",
                    border: "none",
                    borderTopWidth: 1,
                    borderTopStyle: "solid" as const,
                    borderTopColor: C.surfaceBorder,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.12s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      "rgba(255,255,255,0.02)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      "transparent";
                  }}
                >
                  <span style={{ fontSize: "17px", flexShrink: 0, lineHeight: 1 }}>
                    {item.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "2px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: C.textPrimary,
                          lineHeight: 1.3,
                        }}
                      >
                        {item.label}
                      </p>
                      {item.urgent && (
                        <div
                          style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            backgroundColor: C.red,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                    <p style={{ fontSize: "11.5px", color: C.muted }}>
                      {item.sub}
                    </p>
                  </div>
                  {item.tag && (
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: item.tagColor!,
                        backgroundColor: item.tagBg!,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        flexShrink: 0,
                      }}
                    >
                      {item.tag}
                    </span>
                  )}
                  <ChevronRight size={13} style={{ color: C.textTertiary, flexShrink: 0 }} />
                </button>
              ))}
              <div style={{ height: "4px" }} />
            </Card>

            {/* ━━━ UPCOMING TIMELINE ━━━ */}
            <Card style={{ padding: "18px 20px 20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "18px",
                }}
              >
                <Label>Fila do dia</Label>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "9.5px",
                    color: C.muted,
                    letterSpacing: "0.06em",
                  }}
                >
                  Hoje · 3 agendados
                </span>
              </div>

              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "34px",
                    top: "12px",
                    bottom: "12px",
                    width: "1px",
                    backgroundColor: C.surfaceBorder,
                  }}
                />

                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {UPCOMING.map((apt, idx) => {
                    const isNext = apt.status === "next";
                    return (
                      <div
                        key={apt.id}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          paddingBottom: idx < UPCOMING.length - 1 ? "18px" : "0",
                        }}
                      >
                        <div
                          style={{
                            width: "54px",
                            flexShrink: 0,
                            paddingTop: "2px",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'DM Mono', monospace",
                              fontSize: "11px",
                              fontWeight: isNext ? 600 : 400,
                              color: isNext ? C.gold : C.muted,
                              letterSpacing: "0.04em",
                            }}
                          >
                            {apt.time}
                          </span>
                        </div>

                        <div
                          style={{
                            width: "22px",
                            flexShrink: 0,
                            display: "flex",
                            justifyContent: "center",
                            paddingTop: "6px",
                            position: "relative",
                            zIndex: 1,
                          }}
                        >
                          <div
                            style={{
                              width: isNext ? "8px" : "6px",
                              height: isNext ? "8px" : "6px",
                              borderRadius: "50%",
                              backgroundColor: isNext ? C.gold : C.mutedLight,
                              boxShadow: isNext
                                ? "0 0 10px rgba(212,169,78,0.55)"
                                : "none",
                            }}
                          />
                        </div>

                        <div style={{ flex: 1, paddingLeft: "12px" }}>
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: isNext ? 600 : 400,
                              color: isNext ? C.textPrimary : C.textSecondary,
                              lineHeight: 1.3,
                              marginBottom: "2px",
                            }}
                          >
                            {apt.title}
                          </p>
                          <p style={{ fontSize: "11.5px", color: C.textTertiary }}>
                            {apt.client}
                          </p>
                        </div>

                        {isNext && (
                          <div
                            style={{
                              backgroundColor: C.goldDim,
                              border: `1px solid ${C.goldBorder}`,
                              borderRadius: "6px",
                              padding: "2px 8px",
                              marginTop: "2px",
                              flexShrink: 0,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "'DM Mono', monospace",
                                fontSize: "9px",
                                fontWeight: 600,
                                color: C.gold,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                              }}
                            >
                              Agora
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* ━━━ QUICK ACTIONS — Apple Wallet style ━━━ */}
            <div>
              <div style={{ paddingLeft: "4px", marginBottom: "10px" }}>
                <Label>Criar</Label>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {QUICK.map(({ icon: Icon, label, hint, primary }) => (
                  <button
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      backgroundColor: primary ? C.goldDim : C.surface,
                      border: `1px solid ${primary ? C.goldBorder : C.surfaceBorder}`,
                      borderRadius: "16px",
                      padding: "16px 20px",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                      transition: "background 0.12s ease, transform 0.1s ease",
                      boxShadow: primary
                        ? "0 2px 16px rgba(212,169,78,0.08)"
                        : "0 1px 0 rgba(255,255,255,0.02) inset",
                    }}
                    onMouseDown={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)";
                    }}
                    onMouseUp={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                    }}
                    onMouseEnter={(e) => {
                      if (!primary)
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          C.surfaceHover;
                    }}
                    onMouseLeave={(e) => {
                      if (!primary)
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          C.surface;
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "11px",
                        backgroundColor: primary
                          ? "rgba(212,169,78,0.18)"
                          : "rgba(255,255,255,0.04)",
                        border: primary
                          ? `1px solid rgba(212,169,78,0.22)`
                          : `1px solid ${C.surfaceBorder}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.75}
                        style={{ color: primary ? C.gold : C.textSecondary }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: "15px",
                          fontWeight: primary ? 600 : 500,
                          color: primary ? C.gold : C.textPrimary,
                          letterSpacing: "-0.01em",
                          lineHeight: 1.2,
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          fontSize: "11.5px",
                          color: primary ? "rgba(212,169,78,0.48)" : C.muted,
                          marginTop: "2px",
                        }}
                      >
                        {hint}
                      </p>
                    </div>
                    <ChevronRight
                      size={14}
                      style={{
                        color: primary ? "rgba(212,169,78,0.38)" : C.textTertiary,
                        flexShrink: 0,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ━━━ BOTTOM NAV ━━━ */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: "430px",
            padding: "0 16px 32px",
            background: `linear-gradient(to top, ${C.bg} 60%, transparent)`,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(12,12,12,0.95)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: "24px",
              padding: "10px 6px 10px",
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              pointerEvents: "all",
              boxShadow:
                "0 -1px 0 rgba(255,255,255,0.04) inset, 0 24px 60px rgba(0,0,0,0.7)",
            }}
          >
            {NAV_TABS.map(({ icon: Icon, label }, idx) => {
              const active = idx === activeTab;
              return (
                <button
                  key={label}
                  onClick={() => setActiveTab(idx)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    padding: "8px 4px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "14px",
                    position: "relative",
                  }}
                >
                  {active && (
                    <div
                      style={{
                        position: "absolute",
                        top: "4px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "28px",
                        height: "28px",
                        borderRadius: "9px",
                        backgroundColor: "rgba(212,169,78,0.10)",
                      }}
                    />
                  )}
                  <Icon
                    size={21}
                    strokeWidth={active ? 2.25 : 1.5}
                    style={{
                      color: active ? C.gold : C.muted,
                      position: "relative",
                      zIndex: 1,
                      transition: "color 0.15s ease",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "8.5px",
                      fontWeight: active ? 600 : 400,
                      color: active ? C.gold : C.textTertiary,
                      letterSpacing: "0.04em",
                      transition: "color 0.15s ease",
                    }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── micro components ────────────────────────────────────────────────────────

function ContextPill({
  icon,
  label,
  urgent,
}: {
  icon: React.ReactNode;
  label: string;
  urgent?: boolean;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        backgroundColor: urgent ? C.redDim : "rgba(255,255,255,0.04)",
        border: `1px solid ${urgent ? C.redBorder : "rgba(255,255,255,0.07)"}`,
        borderRadius: "7px",
        padding: "4px 9px",
      }}
    >
      <span
        style={{
          color: urgent ? C.red : C.muted,
          display: "flex",
          lineHeight: 1,
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "10px",
          fontWeight: 500,
          color: urgent ? "#D05A4A" : C.muted,
          letterSpacing: "0.03em",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function BriefingRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
      <span
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "9.5px",
          color: C.textTertiary,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          flexShrink: 0,
          width: "80px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "13px",
          fontWeight: 400,
          color: C.textSecondary,
          lineHeight: 1.3,
        }}
      >
        {value}
      </span>
    </div>
  );
}
