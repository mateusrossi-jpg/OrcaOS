import './LegalCompliancePanel.css';

const technicalNotice = [
  'Os calculos do OrcaOS sao ferramentas de apoio para decisao tecnica, levantamento, orcamento e relatorio.',
  'O profissional responsavel deve validar resultados, normas aplicaveis e condicoes reais de campo antes da execucao.',
  'Normas tecnicas, fabricantes, concessionarias, projeto real e responsabilidade tecnica prevalecem sobre estimativas do app.',
];

const privacyNotice = [
  'O OrcaOS funciona local-first: clientes, OS, orcamentos, catalogo e perfil ficam no armazenamento local do navegador/dispositivo.',
  'Backup e responsabilidade do usuario. O navegador pode limpar cache/armazenamento local; exporte backup regularmente.',
  'Quando Google, Drive ou endpoint Pro estiverem configurados, dados de conta/assinatura podem ser processados para login, backup ou liberacao de acesso.',
  'Base colaborativa de precos e catalogos reais sera futura e dependera de consentimento explicito.',
];

const termsNotice = [
  'Esta e uma versao beta e pode ter instabilidades, mudancas de fluxo e ajustes em recursos Pro.',
  'O uso profissional e de responsabilidade do usuario, que deve conferir calculos, documentos e propostas antes de enviar ao cliente.',
  'Recursos Pro podem mudar durante o beta fechado. Suporte e liberacao comercial podem ser manuais/assistidos.',
  'O usuario deve manter backup dos proprios dados.',
];

function NoticeList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

export function LegalCompliancePanel() {
  return (
    <section className="legal-compliance-panel">
      <div className="legal-compliance-header">
        <span className="orca-kicker">Responsabilidade e dados</span>
        <h2>Termos, privacidade e aviso tecnico</h2>
        <p>Informacoes essenciais para uso responsavel no beta fechado.</p>
      </div>

      <div className="legal-compliance-grid">
        <article>
          <strong>Aviso tecnico</strong>
          <NoticeList items={technicalNotice} />
        </article>
        <article>
          <strong>Privacidade</strong>
          <NoticeList items={privacyNotice} />
        </article>
        <article>
          <strong>Termos de uso beta</strong>
          <NoticeList items={termsNotice} />
        </article>
      </div>
    </section>
  );
}
