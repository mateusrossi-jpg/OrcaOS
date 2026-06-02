import React, { useState } from 'react';
import { ScreenContainer, SurfaceCard, SectionLabel, InteractiveRow, Title, Body, AppHeader } from '../../../ui/system';
import { Input, PrimaryButton, Select } from '../../../app/components/ui';

interface AssetCaptureModalProps {
  clientId: string;
  siteId: string;
  onClose: () => void;
  onSave: (assetData: any) => void;
}

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
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <AppHeader title="Mapear Equipamento." subtitle="Registrar novo ativo no local." onBack={onClose} />
      <div className="flex-1 overflow-y-auto p-4 pb-32 mt-4 space-y-6">
        <SurfaceCard padding="lg">
          <SectionLabel className="mb-4">Dados do Equipamento</SectionLabel>
          <div className="space-y-4">
            <Input 
              label="Nome / Identificação" 
              placeholder="Ex: Ar Condicionado Sala 1" 
              value={formData.name} 
              onChange={e => updateField('name', e.target.value)} 
              required 
            />
            <Select 
              label="Categoria" 
              value={formData.category} 
              onChange={val => updateField('category', val)} 
            >
              <option value="">Selecione...</option>
              <option value="HVAC">Climatização (HVAC)</option>
              <option value="ELÉTRICA">Elétrica</option>
              <option value="SEGURANÇA">Segurança Eletrônica</option>
              <option value="HIDRÁULICA">Hidráulica</option>
              <option value="OUTROS">Outros</option>
            </Select>
            <Input 
              label="Fabricante" 
              placeholder="Ex: Carrier, Intelbras..." 
              value={formData.manufacturer} 
              onChange={e => updateField('manufacturer', e.target.value)} 
            />
            <Input 
              label="Modelo / Capacidade" 
              placeholder="Ex: 12.000 BTUs Inverter" 
              value={formData.model} 
              onChange={e => updateField('model', e.target.value)} 
            />
            <Input 
              label="Localização Específica" 
              placeholder="Ex: Parede leste, rack principal..." 
              value={formData.location} 
              onChange={e => updateField('location', e.target.value)} 
            />
          </div>
        </SurfaceCard>
        
        <div className="px-2">
          <PrimaryButton onClick={handleSave} disabled={!formData.name || !formData.category}>
            Salvar Equipamento
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
