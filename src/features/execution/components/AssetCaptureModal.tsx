import React, { useState } from 'react';
import { 
  ScreenContainer, 
  SurfaceCard, 
  SectionLabel, 
  InteractiveRow, 
  Title, 
  Body, 
  AppHeader,
  GlassInput,
  GlassSelect,
  GlassFormCard
} from '../../../ui/system';
import { PrimaryButton } from '../../../app/components/ui';

interface AssetCaptureModalProps {
  clientId: string;
  siteId: string;
  onClose: () => void;
  onSave: (assetData: any) => void;
}

/**
 * AssetCaptureModal: Tactical field data entry.
 * Aligned with Executive OS (Phase 6 Hardening).
 */
export const AssetCaptureModal: React.FC<AssetCaptureModalProps> = ({ clientId, siteId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    manufacturer: '',
    model: '',
    location: ''
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.category) return;
    onSave({
      ...formData,
      clientId,
      siteId,
      assetType: 'EQUIPMENT',
      assetStatus: 'ACTIVE',
      installDate: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col bg-aferix-bg animate-in fade-in slide-in-from-bottom-6 duration-700">
      <AppHeader title="Mapear Ativo." subtitle="Registro técnico em tempo real." onBack={onClose} />
      
      <div className="flex-1 overflow-y-auto px-6 pt-10 pb-40">
        <GlassFormCard title="ESPECIFICAÇÕES TÉCNICAS">
            <GlassInput 
              label="Nome do Equipamento" 
              placeholder="Ex: Ar Condicionado Sala 1" 
              value={formData.name} 
              onChange={e => updateField('name', e.target.value)} 
            />
            <GlassSelect 
              label="Categoria de Ativo" 
              value={formData.category} 
              onChange={e => updateField('category', e.target.value)} 
            >
              <option value="">Selecione...</option>
              <option value="HVAC">Climatização (HVAC)</option>
              <option value="ELÉTRICA">Elétrica</option>
              <option value="SEGURANÇA">Segurança Eletrônica</option>
              <option value="HIDRÁULICA">Hidráulica</option>
              <option value="OUTROS">Outros</option>
            </GlassSelect>
            <div className="grid grid-cols-2 gap-4">
               <GlassInput 
                label="Fabricante" 
                placeholder="Ex: Carrier" 
                value={formData.manufacturer} 
                onChange={e => updateField('manufacturer', e.target.value)} 
               />
               <GlassInput 
                label="Modelo" 
                placeholder="Ex: 12k BTU" 
                value={formData.model} 
                onChange={e => updateField('model', e.target.value)} 
               />
            </div>
            <GlassInput 
              label="Localização Exata" 
              placeholder="Ex: Parede leste, 3º andar" 
              value={formData.location} 
              onChange={e => updateField('location', e.target.value)} 
            />
            
            <PrimaryButton onClick={handleSave} disabled={!formData.name || !formData.category} className="h-16 mt-4 font-black tracking-widest text-[12px] uppercase rounded-2xl shadow-[0_12px_24px_rgba(255,255,255,0.1)]">
              VINCULAR EQUIPAMENTO
            </PrimaryButton>
        </GlassFormCard>
      </div>
    </div>
  );
};
