import { futureProBacklog } from '../../core/access/planStrategy';

const betaFlowChecks = [
  { title: 'Primeira abertura', text: 'Intro curta aparece uma vez, sem som, e depois o app entra direto na Home.' },
  { title: 'Atendimento simples', text: 'Novo usuário consegue criar cliente, atendimento e orçamento sem assistente longo.' },
  { title: 'Orçamento manual', text: 'Técnico consegue montar proposta rápida em fluxo direto.' },
  { title: 'Cálculos essenciais', text: 'Resultados mostram unidade, fórmula, exemplo, aviso técnico e opção de vincular ao atendimento.' },
  { title: 'Materiais', text: 'Cadastro manual e catálogo local funcionam offline; busca online entra apenas como referência revisável.' },
  { title: 'Aprovação', text: 'A interface só oferece converter em OS depois que o orçamento está aprovado.' },
  { title: 'Relatório', text: 'Resumo técnico usa cliente, atendimento, materiais, serviços, cálculos e recomendações.' },
  { title: 'Backup', text: 'Testador encontra backup local ou Drive antes de trocar navegador, aparelho ou build.' },
];

const betaStoreChecks = [
  'Ícone adaptativo Android centralizado e sem fundo branco.',
  'Splash nativa curta e intro exibida somente na primeira abertura.',
  'Home mobile-first respondendo “o que fazer agora?”.',
  'Login não bloqueia uso básico local.',
  'Pro apresentado como validação assistida, sem cobrança falsa.',
  'Nenhuma chave sensível exposta no front-end.',
  'Fluxos principais testados em navegador antes de gerar build Android.',
  'Comandos npm run dev, npm run build e npm run rc:check passando antes da entrega.',
];

export function BetaReadinessScreen() {
  return (
    <section className="app-screen wide-screen beta-readiness-screen">
      <header className="screen-header"><h1>Beta</h1><p>Validação fechada antes da publicação.</p></header>
      <section className="beta-status-hero">
        <article><span>Status</span><strong>Beta fechado</strong><small>Fluxos principais em validação.</small></article>
        <article><span>Escopo</span><strong>Produto financeiro</strong><small>Atendimento, proposta, relatório e lucro.</small></article>
        <article><span>Próximo</span><strong>Publicação</strong><small>Build Android após checklist.</small></article>
      </section>
      <section className="aferix-panel-card beta-check-panel">
        <header><div><h2>Fluxos de teste</h2></div></header>
        <div className="beta-check-grid">
          {betaFlowChecks.map((item) => <article key={item.title}><strong>{item.title}</strong><small>{item.text}</small></article>)}
        </div>
      </section>
      <section className="aferix-panel-card beta-release-panel">
        <header><div><h2>Publicação</h2></div></header>
        <div className="beta-release-list">
          {betaStoreChecks.map((item) => <article key={item}><span /> <small>{item}</small></article>)}
        </div>
      </section>
      <section className="aferix-panel-card beta-future-panel">
        <header><div><h2>Pendências futuras</h2></div></header>
        <div className="beta-future-list">
          {futureProBacklog.slice(0, 4).map((benefit) => <article key={benefit.title}><strong>{benefit.title}</strong><small>{benefit.description}</small></article>)}
        </div>
      </section>
    </section>
  );
}
