import React from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { TechnicalReportDocument } from '../reports/TechnicalReportDocument';
import { Asset } from '../../../domain/asset';
import { AssetExecution } from '../../../domain/assetExecution';
import { X, Download, Share2, ArrowLeft } from 'lucide-react';
import { AferixButton } from '../../../components/AferixButton';

interface TechnicalReportPreviewProps {
  clientName: string;
  workOrderTitle: string;
  businessProfile: any;
  assets: Asset[];
  executions: Record<string, AssetExecution>;
  signature?: string | null;
  onClose: () => void;
}

export const TechnicalReportPreview: React.FC<TechnicalReportPreviewProps> = ({
  clientName,
  workOrderTitle,
  businessProfile,
  assets,
  executions,
  signature,
  onClose
}) => {
  const date = new Date().toLocaleDateString('pt-BR');
  const reportProps = { clientName, workOrderTitle, date, businessProfile, assets, executions, signature };

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--bg-primary)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 border-b border-white/5 flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-2 text-white/40 hover:text-white group">
          <ArrowLeft size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Voltar</span>
        </button>
        <h2 className="text-sm font-black text-white uppercase tracking-widest">Laudo Técnico</h2>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* PDF Viewer (Web only, mobile usually downloads) */}
      <div className="flex-1 bg-[#1a1a1a] flex flex-col items-center justify-center p-4">
        <div className="w-full h-full max-w-2xl rounded-xl overflow-hidden shadow-2xl bg-white hidden md:block">
          <PDFViewer width="100%" height="100%" showToolbar={false} className="border-none">
            <TechnicalReportDocument {...reportProps} />
          </PDFViewer>
        </div>

        {/* Mobile View / Fallback */}
        <div className="md:hidden flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center border border-[var(--accent-gold)]/20">
             <Share2 size={32} className="text-[var(--accent-gold)]" />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-black text-white uppercase">Laudo Gerado</h3>
            <p className="text-white/40 text-sm max-w-[240px]">O documento técnico de {assets.length} ativos está pronto para ser compartilhado.</p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-surface-900/90 backdrop-blur-md border-t border-surface-800 pb-10 flex flex-col gap-3">
        <PDFDownloadLink 
          document={<TechnicalReportDocument {...reportProps} />} 
          fileName={`Laudo_Tecnico_${clientName.replace(/\s+/g, '_')}.pdf`}
          className="w-full"
        >
          {({ loading }) => (
            <AferixButton variant="p0" fullWidth className="gap-3 h-16 shadow-[var(--glow-gold)]" disabled={loading}>
              <Download size={20} />
              <span className="text-[13px] font-black tracking-widest uppercase">{loading ? 'Gerando PDF...' : 'Baixar Laudo PDF'}</span>
            </AferixButton>
          )}
        </PDFDownloadLink>

        <AferixButton variant="p1" fullWidth className="gap-3 h-16" onClick={onClose}>
           CONCLUIR
        </AferixButton>
      </div>
    </div>
  );
};
