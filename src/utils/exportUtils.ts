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
  const header = "Descrição;Categoria;Valor;Vencimento;Status;Cliente;Data de Lançamento\n";
  const rows = records.map(r => {
    return [
      r.title,
      r.title.includes('[RECORRENTE]') ? 'Recorrente' : 'Serviço',
      (r.openBalance || r.expectedValue || 0).toFixed(2).replace('.', ','),
      r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('pt-BR') : '',
      r.status === 'paid' ? 'Pago' : 'Pendente',
      r.clientName || 'N/D',
      new Date(r.createdAt).toLocaleDateString('pt-BR')
    ].join(';');
  }).join('\n');

  return "\ufeff" + header + rows;
}
