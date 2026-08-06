import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatCurrencyFromCents } from './formatters';

interface PdfGeneratorOptions {
  companyName: string;
  companyLogo?: string | null;
  companyCity?: string | null;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  workOrderId: string;
  items: Array<{ name: string; quantity: number; unitPriceCents: number }>;
  displacementKm: number;
  displacementCostCents: number; // cost per km
  laborHours: number;
  laborRateCents: number; // rate per hour
  totalPriceCents: number;
  paymentTerms?: string;
  validityDays?: number;
  notes?: string;
}

export async function generateBudgetPdf(options: PdfGeneratorOptions): Promise<Blob> {
  // 1. Criar um container invisível no DOM
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px'; // Largura A4 proporcional
  container.style.backgroundColor = '#FFFFFF'; // Fundo Branco Profissional
  container.style.color = '#0F172A';
  container.style.fontFamily = "'Inter', 'Outfit', system-ui, -apple-system, sans-serif";
  container.style.padding = '40px';
  container.style.boxSizing = 'border-box';

  const validityDays = options.validityDays ?? 7;
  const validityDate = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');
  const budgetNumber = options.workOrderId.slice(0, 8).toUpperCase();
  const paymentTerms = options.paymentTerms?.trim() || 'Pix / Transferência Instantânea (À vista)';

  // 2. Tabela de Insumos e Serviços com melhor alinhamento e espaçamento
  const itemsHtml = options.items.map((item, idx) => `
    <tr style="border-bottom: 1px solid #E2E8F0; background: ${idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
      <td style="padding: 12px 16px; font-weight: 600; font-size: 13px; color: #1E293B; text-align: left; vertical-align: middle;">${item.name}</td>
      <td style="padding: 12px 16px; text-align: center; font-weight: 700; font-size: 13px; color: #334155; vertical-align: middle;">${item.quantity}</td>
      <td style="padding: 12px 16px; text-align: right; font-weight: 600; font-size: 13px; color: #334155; vertical-align: middle; white-space: nowrap;">${formatCurrencyFromCents(item.unitPriceCents)}</td>
      <td style="padding: 12px 16px; text-align: right; font-weight: 700; font-size: 13px; color: #0F172A; vertical-align: middle; white-space: nowrap;">${formatCurrencyFromCents(item.quantity * item.unitPriceCents)}</td>
    </tr>
  `).join('');

  const displacementCents = Math.round(options.displacementKm * options.displacementCostCents);
  const laborCents = Math.round(options.laborHours * options.laborRateCents);

  const htmlContent = `
    <div style="border: 1px solid #CBD5E1; border-radius: 12px; padding: 36px; background: #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
      <!-- HEADER PROFISSIONAL -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; border-bottom: 2px solid #0F172A; padding-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 16px;">
          ${options.companyLogo ? `
            <img src="${options.companyLogo}" alt="Logo" style="max-height: 60px; max-width: 150px; object-fit: contain;" />
          ` : ''}
          <div>
            <h1 style="color: #0F172A; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">${options.companyName.toUpperCase()}</h1>
            <p style="color: #0284C7; font-size: 12px; margin: 4px 0 0 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Proposta Comercial & Orçamento Técnico</p>
          </div>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; background: #F1F5F9; border: 1px solid #CBD5E1; padding: 4px 12px; border-radius: 6px; font-weight: 800; font-size: 13px; color: #0F172A;">
            ORÇAMENTO Nº ${budgetNumber}
          </span>
          <p style="color: #64748B; font-size: 12px; margin: 6px 0 0 0; font-weight: 500;">
            Data de Emissão: <strong>${new Date().toLocaleDateString('pt-BR')}</strong>
          </p>
          ${options.companyCity ? `<p style="color: #64748B; font-size: 12px; margin: 2px 0 0 0;">📍 ${options.companyCity}</p>` : ''}
        </div>
      </div>

      <!-- PAINEL CLIENTE & CONDIÇÕES -->
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 20px; margin-bottom: 28px; display: flex; justify-content: space-between; gap: 20px;">
        <div style="flex: 1;">
          <span style="color: #64748B; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.8px;">Cliente Destinatário</span>
          <h3 style="color: #0F172A; font-size: 16px; font-weight: 800; margin: 4px 0 2px 0;">${options.customerName}</h3>
          <p style="color: #475569; font-size: 12px; margin: 0;">📞 ${options.customerPhone}</p>
          ${options.customerAddress ? `<p style="color: #475569; font-size: 12px; margin: 2px 0 0 0;">📍 ${options.customerAddress}</p>` : ''}
        </div>
        <div style="text-align: right; flex: 1;">
          <span style="color: #64748B; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.8px;">Condições Comerciais</span>
          <p style="color: #0284C7; font-size: 13px; font-weight: 700; margin: 4px 0 2px 0;">Válido até ${validityDate} (${validityDays} dias)</p>
          <p style="color: #475569; font-size: 12px; margin: 0;">Forma de Pagamento: <strong>${paymentTerms}</strong></p>
        </div>
      </div>

      <!-- TABELA DE ITENS -->
      <div style="margin-bottom: 28px;">
        <h4 style="color: #0F172A; font-size: 12px; text-transform: uppercase; margin: 0 0 10px 0; font-weight: 800; letter-spacing: 0.8px;">
          Discriminação de Insumos e Serviços
        </h4>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #CBD5E1; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #0F172A; color: #FFFFFF;">
              <th style="padding: 10px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Item / Descrição</th>
              <th style="padding: 10px 16px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; width: 60px;">Qtd</th>
              <th style="padding: 10px 16px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; width: 130px;">Unitário</th>
              <th style="padding: 10px 16px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; width: 130px;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml || '<tr><td colspan="4" style="padding: 16px; text-align: center; color: #94A3B8;">Nenhum item adicionado.</td></tr>'}
            ${options.displacementKm > 0 ? `
              <tr style="border-bottom: 1px solid #E2E8F0; background: #F8FAFC;">
                <td style="padding: 12px 16px; font-weight: 600; font-size: 13px; color: #1E293B; vertical-align: middle;">Deslocamento Técnico (${options.displacementKm} km)</td>
                <td style="padding: 12px 16px; text-align: center; font-weight: 700; font-size: 13px; color: #334155; vertical-align: middle;">1</td>
                <td style="padding: 12px 16px; text-align: right; font-weight: 600; font-size: 13px; color: #334155; vertical-align: middle; white-space: nowrap;">${formatCurrencyFromCents(displacementCents)}</td>
                <td style="padding: 12px 16px; text-align: right; font-weight: 700; font-size: 13px; color: #0F172A; vertical-align: middle; white-space: nowrap;">${formatCurrencyFromCents(displacementCents)}</td>
              </tr>
            ` : ''}
            ${options.laborHours > 0 ? `
              <tr style="border-bottom: 1px solid #E2E8F0; background: #FFFFFF;">
                <td style="padding: 12px 16px; font-weight: 600; font-size: 13px; color: #1E293B; vertical-align: middle;">Mão de Obra Especializada (${options.laborHours}h)</td>
                <td style="padding: 12px 16px; text-align: center; font-weight: 700; font-size: 13px; color: #334155; vertical-align: middle;">1</td>
                <td style="padding: 12px 16px; text-align: right; font-weight: 600; font-size: 13px; color: #334155; vertical-align: middle; white-space: nowrap;">${formatCurrencyFromCents(laborCents)}</td>
                <td style="padding: 12px 16px; text-align: right; font-weight: 700; font-size: 13px; color: #0F172A; vertical-align: middle; white-space: nowrap;">${formatCurrencyFromCents(laborCents)}</td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      </div>

      <!-- PAINEL DE VALOR FINAL -->
      <div style="background: #F1F5F9; border: 2px solid #0F172A; border-radius: 10px; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <span style="color: #0F172A; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Investimento Total do Projeto</span>
          <p style="color: #64748B; font-size: 11px; margin: 2px 0 0 0;">Valor integral com taxas e materiais inclusos nesta proposta</p>
        </div>
        <span style="color: #0F172A; font-size: 28px; font-weight: 900; font-variant-numeric: tabular-nums;">${formatCurrencyFromCents(options.totalPriceCents)}</span>
      </div>

      <!-- OBSERVAÇÕES TÉCNICAS E NOTAS -->
      <div style="border-top: 1px solid #E2E8F0; padding-top: 16px; margin-top: 20px;">
        <span style="color: #64748B; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Observações Gerais & Garantia</span>
        <p style="color: #334155; font-size: 12px; margin: 6px 0 0 0; line-height: 1.5; white-space: pre-wrap;">${options.notes?.trim() || '• Garantia de 90 dias para serviços prestados.\n• Equipamentos e componentes com garantia segundo fabricante.\n• Proposta sujeita a reavaliação caso ocorram alterações de escopo.'}</p>
      </div>

      <!-- FOOTER DA EMPRESA -->
      <div style="text-align: center; margin-top: 28px; border-top: 1px solid #F1F5F9; padding-top: 14px;">
        <p style="color: #94A3B8; font-size: 11px; margin: 0; font-weight: 600;">
          Documento gerado por Aferix OS · Gestão Operacional de Campo
        </p>
      </div>
    </div>
  `;

  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  // 3. Renderizar Canvas via html2canvas (scale: 3 para nitidez HD de impressão)
  await new Promise(resolve => setTimeout(resolve, 300));

  const canvas = await html2canvas(container, {
    scale: 3,
    backgroundColor: '#FFFFFF',
    logging: false,
    useCORS: true
  });

  document.body.removeChild(container);

  // 4. Gerar PDF via jsPDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  return pdf.output('blob');
}

