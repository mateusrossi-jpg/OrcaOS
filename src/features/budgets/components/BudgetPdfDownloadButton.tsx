import { PDFDownloadLink } from '@react-pdf/renderer';
import type { Budget, BusinessProfile } from '../../../core/types/business';
import { AferixBudgetPdf } from './AferixBudgetPdf';

interface BudgetPdfDownloadButtonProps {
  budget: Pick<Budget, 'title' | 'items' | 'discount' | 'travelCost' | 'additionalFees' | 'paymentTerms' | 'validity' | 'commercialNotes'>;
  businessProfile: BusinessProfile;
  total: number;
  subtotal: number;
  clientName: string;
  fileName: string;
  label: string;
}

export function BudgetPdfDownloadButton({
  budget,
  businessProfile,
  total,
  subtotal,
  clientName,
  fileName,
  label,
}: BudgetPdfDownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={<AferixBudgetPdf budget={budget} businessProfile={businessProfile} total={total} subtotal={subtotal} clientName={clientName} />}
      fileName={fileName}
      className="primary-action inline-action pdf-download-btn"
    >
      {({ loading }) => (loading ? 'Gerando...' : label)}
    </PDFDownloadLink>
  );
}
