import type { ClientProposal } from './clientProposalStorage';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function money(value: number | undefined): string {
  return currencyFormatter.format(Number.isFinite(value ?? 0) ? value ?? 0 : 0);
}

function lineOrFallback(value: string | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

export function buildClientProposalShareText(proposal: ClientProposal): string {
  const lines: string[] = [];

  lines.push(`*${proposal.title}*`);
  lines.push('');
  lines.push(`Olá, ${proposal.clientName}. Segue a proposta preparada por ${proposal.professionalDisplayName}.`);

  if (proposal.professionalContact) {
    lines.push(`Contato: ${proposal.professionalContact}`);
  }

  lines.push('');
  lines.push(`Resumo: ${lineOrFallback(proposal.summary, 'Proposta de serviço técnico.')}`);
  lines.push('');

  lines.push('*Itens incluídos no valor:*');
  if (proposal.items.length === 0) {
    lines.push('- Nenhum item cobrado informado.');
  } else {
    proposal.items.forEach((item) => {
      const quantity = Number.isFinite(item.quantity) ? item.quantity : 1;
      lines.push(`- ${quantity}x ${item.description} — ${money(item.totalPrice)}`);
      if (item.notes) lines.push(`  Obs.: ${item.notes}`);
    });
  }

  if (proposal.clientPurchaseMaterials.length > 0) {
    lines.push('');
    lines.push('*Materiais para o cliente comprar:*');
    proposal.clientPurchaseMaterials.forEach((item) => {
      const quantity = Number.isFinite(item.quantity) ? item.quantity : 1;
      const reference = item.referenceTotalValue ? ` — referência ${money(item.referenceTotalValue)}` : '';
      lines.push(`- ${quantity}x ${item.description}${reference}`);
      if (item.specificationNotes) lines.push(`  Obs.: ${item.specificationNotes}`);
    });
    lines.push('');
    lines.push('Esses materiais são lista orientativa e não fazem parte do total cobrado pelo profissional, salvo combinação posterior.');
  }

  lines.push('');
  lines.push(`*Total da proposta:* ${money(proposal.total)}`);
  if (proposal.discount > 0) lines.push(`Desconto aplicado: ${money(proposal.discount)}`);
  lines.push(`Validade: ${lineOrFallback(proposal.validityText, 'A combinar')}`);
  lines.push(`Pagamento: ${lineOrFallback(proposal.paymentTerms, 'A combinar')}`);

  if (proposal.publicNotes) {
    lines.push('');
    lines.push(`Observações: ${proposal.publicNotes}`);
  }

  lines.push('');
  lines.push('Para aprovar, responda esta mensagem confirmando a aprovação da proposta.');

  return lines.join('\n');
}

export function buildClientProposalWhatsAppUrl(proposal: ClientProposal): string {
  return `https://wa.me/?text=${encodeURIComponent(buildClientProposalShareText(proposal))}`;
}
