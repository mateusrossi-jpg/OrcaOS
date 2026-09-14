/**
 * AFERIX DATA PORTABILITY UTILS
 * Export engines for CSV generation.
 */

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function generateClientsCSV(clients: any[]): string {
  const header = "Nome;Tipo;Contato;Telefone;E-mail;Endereço;Status;Data de Cadastro\n";
  const rows = clients.map(c => {
    return [
      c.name,
      c.type || 'N/D',
      c.contact || '',
      c.phone || '',
      c.email || '',
      `"${(c.address || '').replace(/"/g, '""')}"`,
      c.status === 'active' ? 'Ativo' : 'Inativo',
      new Date(c.createdAt).toLocaleDateString('pt-BR')
    ].join(';');
  }).join('\n');
  
  return "\ufeff" + header + rows; // Add BOM for Excel UTF-8 support
}

export function generateFinanceCSV(records: any[]): string {
  const header = "Data;Tipo;Descrição;Cliente;Valor Previsto (R$);Valor Realizado (R$);Custos/Despesas (R$);Saldo em Aberto (R$);Status\n";
  const rows = records.map(r => {
    const isExpense = r.clientId === 'EXPENSE' || r.expectedValue === 0 && (r.materialCost > 0 || r.travelCost > 0 || r.otherCosts > 0);
    const tipo = isExpense ? 'Saída / Despesa' : (r.title?.includes('[RECORRENTE]') ? 'Recorrente' : 'Serviço');
    const totalCosts = (r.materialCost || 0) + (r.travelCost || 0) + (r.cardFee || 0) + (r.estimatedTax || 0) + (r.otherCosts || 0);
    const statusLabel = r.status === 'paid' ? 'Pago' : 'Pendente';
    const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString('pt-BR') : '';

    return [
      dateStr,
      tipo,
      r.title || '',
      r.clientName || 'N/D',
      (r.expectedValue || 0).toFixed(2).replace('.', ','),
      (r.receivedValue || 0).toFixed(2).replace('.', ','),
      totalCosts.toFixed(2).replace('.', ','),
      (r.openBalance || 0).toFixed(2).replace('.', ','),
      statusLabel
    ].join(';');
  }).join('\n');

  return "\ufeff" + header + rows;
}
