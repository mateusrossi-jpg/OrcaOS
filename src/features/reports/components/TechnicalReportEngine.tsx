import React from 'react';
import { Client } from '../../../domain/client';
import { Site } from '../../../domain/site';
import { WorkOrder } from '../../../core/types/business';
import { Asset } from '../../../domain/asset';
import { AssetExecution } from '../../../domain/assetExecution';

interface TechnicalReportEngineProps {
  client: Client;
  site: Site;
  workOrder: WorkOrder;
  executions: Array<{ asset: Asset; execution: AssetExecution }>;
  signatures: {
    technicianUrl?: string;
    clientUrl?: string;
    clientName?: string;
    clientDocument?: string;
  };
  onClose?: () => void;
  onPrint?: () => void;
  onShareWhatsApp?: () => void;
}

export const TechnicalReportEngine: React.FC<TechnicalReportEngineProps> = ({
  client,
  site,
  workOrder,
  executions,
  signatures,
  onClose,
  onPrint,
  onShareWhatsApp
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-surface-900 flex flex-col sm:bg-surface-200">
      
      {/* Action Bar (Not visible when printing) */}
      <div className="flex-none bg-surface-900 border-b border-surface-700 p-4 flex justify-between items-center print:hidden shadow-md">
        <button onClick={onClose} className="text-text-secondary font-medium">Voltar</button>
        <div className="flex space-x-3">
          {onShareWhatsApp && (
            <button 
              onClick={onShareWhatsApp}
              className="px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 transition"
            >
              WhatsApp
            </button>
          )}
          <button 
            onClick={() => {
              if (onPrint) onPrint();
              else window.print();
            }}
            className="px-4 py-2 bg-brand-500 text-surface-900 font-bold rounded hover:bg-brand-400 transition"
          >
            Gerar PDF
          </button>
        </div>
      </div>

      {/* A4 Report Wrapper */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 print:p-0 print:overflow-visible flex justify-center">
        
        {/* The Printable Page */}
        <div className="bg-white w-full max-w-[210mm] text-black p-8 sm:p-12 shadow-2xl print:shadow-none print:w-full print:max-w-none text-sm">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-gray-300 pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">LAUDO TÉCNICO DE MANUTENÇÃO</h1>
              <p className="text-gray-600 mt-1">OS: #{workOrder.id.split('-')[0].toUpperCase()}</p>
              <p className="text-gray-600">Data: {new Date(workOrder.updatedAt || new Date()).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="text-right">
              {/* Fallback to text if no logo */}
              <div className="font-black text-xl text-brand-500">AFERIX</div>
              <p className="text-gray-500 text-xs">Aferix Premium Services</p>
            </div>
          </div>

          {/* Client & Site Info */}
          <div className="grid grid-cols-2 gap-8 mb-8 border border-gray-200 rounded p-4">
            <div>
              <h2 className="font-bold text-gray-800 border-b border-gray-200 pb-1 mb-2 text-xs uppercase">Dados do Cliente</h2>
              <p className="font-medium">{client.name}</p>
              <p className="text-gray-600">{client.documentNumber}</p>
              <p className="text-gray-600">{client.email}</p>
              <p className="text-gray-600">{client.phone}</p>
            </div>
            <div>
              <h2 className="font-bold text-gray-800 border-b border-gray-200 pb-1 mb-2 text-xs uppercase">Local do Atendimento</h2>
              <p className="font-medium">{site.name}</p>
              <p className="text-gray-600">{site.fullAddress}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-bold text-gray-800 border-b-2 border-gray-800 pb-1 mb-4 uppercase">Descrição do Serviço</h2>
            <p className="font-medium text-gray-900">{workOrder.title}</p>
            <p className="text-gray-700 whitespace-pre-wrap">{workOrder.description}</p>
          </div>

          {/* Executions (Checklists & Telemetry) */}
          <div className="space-y-8">
            {executions.map(({ asset, execution }) => (
              <div key={asset.id} className="break-inside-avoid border border-gray-200 rounded p-4">
                <div className="flex justify-between items-center bg-gray-50 -mx-4 -mt-4 p-4 rounded-t border-b border-gray-200 mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{asset.name}</h3>
                    <p className="text-gray-500 text-xs">{asset.category} • TAG: {asset.tag || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded">
                      {asset.assetStatus}
                    </span>
                  </div>
                </div>

                {/* Checklist Results */}
                {execution.checklistResults && execution.checklistResults.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-bold text-gray-800 mb-2 text-xs uppercase">Itens Inspecionados</h4>
                    <table className="w-full text-left text-sm border-collapse">
                      <tbody>
                        {execution.checklistResults.map((item, idx) => (
                          <tr key={idx} className="border-b border-gray-100 last:border-0">
                            <td className="py-2 text-gray-700">{item.description}</td>
                            <td className="py-2 text-right">
                              {item.status === 'compliant' && <span className="text-green-600 font-bold">OK</span>}
                              {item.status === 'non-compliant' && <span className="text-red-600 font-bold">FALHA</span>}
                              {item.status === 'na' && <span className="text-gray-400 font-medium">N/A</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Telemetry / Measurements */}
                {execution.measurements && Object.keys(execution.measurements).length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-bold text-gray-800 mb-2 text-xs uppercase">Medições & Parâmetros</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {Object.entries(execution.measurements).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 border border-gray-100 p-2 rounded">
                          <span className="block text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="block font-bold text-gray-900">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                {execution.recommendation && (
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded mt-4">
                    <h4 className="font-bold text-blue-900 mb-1 text-xs uppercase">Parecer / Recomendação</h4>
                    <p className="text-blue-800 italic">{execution.recommendation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Signatures */}
          <div className="mt-16 break-inside-avoid flex justify-around">
            <div className="text-center w-64">
              {signatures.technicianUrl ? (
                <img src={signatures.technicianUrl} alt="Assinatura Técnico" className="h-24 mx-auto mb-2 object-contain" />
              ) : (
                <div className="h-24 border-b border-gray-400 mb-2"></div>
              )}
              <p className="font-bold text-gray-800">Assinatura do Responsável Técnico</p>
              <p className="text-gray-500 text-xs">Aferix Premium Services</p>
            </div>
            
            <div className="text-center w-64">
              {signatures.clientUrl ? (
                <img src={signatures.clientUrl} alt="Assinatura Cliente" className="h-24 mx-auto mb-2 object-contain" />
              ) : (
                <div className="h-24 border-b border-gray-400 mb-2"></div>
              )}
              <p className="font-bold text-gray-800">{signatures.clientName || 'Assinatura do Cliente'}</p>
              <p className="text-gray-500 text-xs">{signatures.clientDocument || 'Documento Cliente'}</p>
            </div>
          </div>

          <div className="mt-12 text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
            Gerado por Aferix Premium Operational System • Documento com validade técnica • {new Date().toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
    </div>
  );
};
