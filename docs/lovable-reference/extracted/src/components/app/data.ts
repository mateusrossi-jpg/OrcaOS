// Realistic field-service ERP sample data (BRL)

export const monthSummary = {
  profit: 12450,
  revenue: 28750,
  costs: 16300,
  receivable: 8950,
  margin: 43.3,
  trend: [8, 12, 9, 14, 18, 15, 22, 19, 25, 21, 28, 24],
};

export type JobStatus =
  | "iniciado"
  | "enviado"
  | "aprovado"
  | "execucao"
  | "finalizado"
  | "arquivado";

export const statusLabel: Record<JobStatus, string> = {
  iniciado: "Iniciado",
  enviado: "Enviado",
  aprovado: "Aprovado",
  execucao: "Em execução",
  finalizado: "Finalizado",
  arquivado: "Arquivado",
};

export type Job = {
  id: string;
  code: string;
  title: string;
  client: string;
  value: number;
  margin: number;
  date: string;
  time?: string;
  status: JobStatus;
};

export const jobs: Job[] = [
  { id: "1025", code: "#1025", title: "Instalação elétrica residencial", client: "João Silva",     value: 2750, margin: 42.5, date: "21/05", time: "08:00", status: "aprovado" },
  { id: "1024", code: "#1024", title: "Manutenção predial completa",     client: "Maria Oliveira", value: 3850, margin: 38.0, date: "22/05", time: "14:00", status: "execucao" },
  { id: "1023", code: "#1023", title: "Reforma elétrica comércio",       client: "Carlos Pereira", value: 5600, margin: 35.4, date: "24/05", time: "09:30", status: "aprovado" },
  { id: "1022", code: "#1022", title: "Visita técnica diagnóstico",      client: "Ana Costa",      value: 1250, margin: 51.2, date: "21/05", time: "16:30", status: "enviado" },
  { id: "1021", code: "#1021", title: "Quadro de distribuição novo",     client: "Fernanda Lima",  value: 4880, margin: 44.1, date: "25/05",               status: "enviado" },
  { id: "1020", code: "#1020", title: "Padrão de entrada bifásico",      client: "Roberto Santos", value: 6300, margin: 40.0, date: "18/05",               status: "finalizado" },
];

export const upcomingJobs = jobs.filter(j => ["aprovado", "execucao"].includes(j.status)).slice(0, 4);

export const receivables = [
  { id: "r1", date: "23/05", client: "João Silva",     value: 2750 },
  { id: "r2", date: "25/05", client: "Maria Oliveira", value: 1850 },
  { id: "r3", date: "29/05", client: "Carlos Pereira", value: 4350 },
];

export const clients = [
  { id: "c1", name: "João Silva",      phone: "(11) 99850-9999", city: "São Paulo, SP", jobs: 4 },
  { id: "c2", name: "Maria Oliveira",  phone: "(11) 98896-8888", city: "São Paulo, SP", jobs: 3 },
  { id: "c3", name: "Carlos Pereira",  phone: "(11) 97777-7777", city: "Santo André, SP", jobs: 2 },
  { id: "c4", name: "Ana Costa",       phone: "(11) 96666-6666", city: "São Paulo, SP", jobs: 1 },
  { id: "c5", name: "Fernanda Lima",   phone: "(11) 95555-5555", city: "Guarulhos, SP", jobs: 2 },
  { id: "c6", name: "Roberto Santos",  phone: "(11) 94444-4444", city: "São Caetano, SP", jobs: 5 },
];

export const catalog = [
  { id: "k1", name: "Instalação elétrica residencial", kind: "Serviço",  price: 850 },
  { id: "k2", name: "Manutenção residencial",          kind: "Serviço",  price: 460 },
  { id: "k3", name: "Reforma completa",                kind: "Serviço",  price: 2850 },
  { id: "k4", name: "Quadro de distribuição 12 disj.", kind: "Material", price: 650 },
  { id: "k5", name: "Disjuntor bipolar 40A",           kind: "Material", price: 120 },
  { id: "k6", name: "Fio 6mm² flexível (rolo 100m)",   kind: "Material", price: 850 },
  { id: "k7", name: "Tomada 20A com módulo",           kind: "Material", price: 25 },
  { id: "k8", name: "Mão de obra — instalação tomada", kind: "Mão de obra", price: 55 },
];

// Budget #1025 — used in the Operação detail view
export const budgetDetail = {
  id: "1025",
  client: { name: "João Silva", phone: "(11) 99850-9999", address: "Rua das Acácias, 120 — São Paulo, SP" },
  status: "aprovado" as JobStatus,
  total: 2750,
  costs: 1580,
  profit: 1170,
  margin: 42.5,
  items: [
    { name: "Instalação elétrica residencial", qty: 1,  unit: "un", price: 850,  total: 850  },
    { name: "Quadro de distribuição 12 disj.", qty: 1,  unit: "un", price: 650,  total: 650  },
    { name: "Disjuntor bipolar 40A",           qty: 2,  unit: "un", price: 120,  total: 240  },
    { name: "Fio 6mm² flexível",               qty: 20, unit: "m",  price: 8.5,  total: 170  },
    { name: "Tomada 20A",                      qty: 4,  unit: "un", price: 25,   total: 100  },
    { name: "Mão de obra adicional",           qty: 8,  unit: "h",  price: 92.5, total: 740  },
  ],
  steps: [
    { key: "cliente",   label: "Cliente",          hint: "Dados do cliente" },
    { key: "itens",     label: "Itens e serviços", hint: "6 itens adicionados" },
    { key: "custos",    label: "Custos & margem",  hint: "Margem 42,5%" },
    { key: "aprovacao", label: "Aprovação",        hint: "Aprovado em 19/05" },
    { key: "execucao",  label: "Execução",         hint: "Agendado 21/05 às 08:00" },
    { key: "arquivo",   label: "Histórico",        hint: "—" },
  ],
};

// Calendar for May 2025
export const calendarDays = Array.from({ length: 7 }, (_, i) => 19 + i);
export const agendaItems = [
  { time: "08:00", title: "Instalação elétrica residencial", client: "João Silva",     status: "aprovado" as JobStatus },
  { time: "11:30", title: "Visita técnica diagnóstico",      client: "Ana Costa",      status: "enviado"  as JobStatus },
  { time: "14:00", title: "Manutenção predial completa",     client: "Maria Oliveira", status: "execucao" as JobStatus },
  { time: "16:30", title: "Revisão pós-instalação",          client: "Pedro Santos",   status: "execucao" as JobStatus },
];
