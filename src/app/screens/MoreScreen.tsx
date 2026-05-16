import type { AppTab } from '../appTypes';

interface MoreScreenProps {
  goTo: (tab: AppTab) => void;
}

export function MoreScreen({ goTo }: MoreScreenProps) {
  return (
    <section className="app-screen more-screen">
      <header className="screen-header"><h1>Mais recursos</h1></header>
      <div className="more-resource-grid">
        <article className="resource-action-card"><strong>Backup e segurança</strong><small>Proteja seus dados e acesso local.</small><button type="button" onClick={() => goTo('settings')}>Abrir</button></article>
        <article className="resource-action-card"><strong>Perfil profissional</strong><small>Atualize dados usados em proposta e relatório.</small><button type="button" onClick={() => goTo('settings')}>Abrir</button></article>
        <article className="resource-action-card"><strong>Beta e publicação</strong><small>Checklist final antes de liberar build.</small><button type="button" onClick={() => goTo('beta')}>Abrir</button></article>
        <article className="resource-action-card"><strong>Licença e planos</strong><small>Compare Free, Pro e recursos planejados.</small><button type="button" onClick={() => goTo('store')}>Abrir</button></article>
      </div>
      <details className="aferix-panel-card roadmap-panel">
        <summary><span><strong>Evolução planejada</strong></span><em>Abrir</em></summary>
        <div className="roadmap-list">
          <article><strong>Fase 1</strong><small>Atendimento, cálculo, orçamento e relatório simples.</small></article>
          <article><strong>Fase 2</strong><small>Financeiro gerencial com receitas, custos e lucro real.</small></article>
          <article><strong>Fase 3</strong><small>Catálogo, serviços, materiais, estoque leve e lista de compra.</small></article>
          <article><strong>Fase 4</strong><small>Relatórios técnicos e empresariais.</small></article>
          <article><strong>Fase 5</strong><small>Web, nuvem, multiusuário, fiscal e integrações.</small></article>
        </div>
      </details>
    </section>
  );
}
