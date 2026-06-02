import React, { useState } from 'react';
import { Modal, Input, PrimaryButton, ContextBanner } from '../../../app/components/ui';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { siteService } from '../../../services/siteService';
import { trustLayer } from '../../../core/trust/TrustLayer';

interface FastSiteCreationModalProps {
  clientId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (siteId: string) => void;
}

export function FastSiteCreationModal({ clientId, isOpen, onClose, onSuccess }: FastSiteCreationModalProps) {
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCep = async (currentCep: string) => {
    const cleanCep = currentCep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    
    setLoadingCEP(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setAddress(`${data.logradouro}, Bairro ${data.bairro}, ${data.localidade} - ${data.uf}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCEP(false);
    }
  };

  const handleCepChange = (val: string) => {
    setCep(val);
    fetchCep(val);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocoding via Nominatim (OpenStreetMap) for fast, free prototype
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingGPS(false);
        }
      },
      (error) => {
        console.error(error);
        setLoadingGPS(false);
      }
    );
  };

  const handleSave = async () => {
    if (!address.trim() || !clientId) return;
    setSaving(true);
    try {
      const fullAddressStr = number.trim() ? `${address.trim()}, ${number}` : address.trim();
      
      const newSite = await siteService.add({
        clientId,
        name: name.trim() || 'Nova Unidade',
        fullAddress: fullAddressStr,
        isMain: false
      });
      trustLayer.emit({
        type: 'success',
        title: 'Local Criado',
        description: `O site ${name.trim() || 'Nova Unidade'} foi registrado.`,
        status: 'synced',
        onUndo: async () => {
          // Soft delete or just remove from list if requested
          await siteService.delete(newSite.id);
        }
      });
      onSuccess(newSite.id);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Local (Fast Flow)">
      <div className="flex flex-col gap-4">
        <ContextBanner icon={<MapPin size={16} />} title="Cadastro Express" meta="Busque pelo CEP ou use seu GPS." />
        
        <div className="flex gap-2">
          <Input 
            label="CEP" 
            value={cep} 
            onChange={(e) => handleCepChange(e.target.value)} 
            placeholder="00000-000"
            className="flex-1"
          />
          <button 
            onClick={useCurrentLocation}
            className="mt-[22px] flex items-center justify-center h-11 w-11 bg-white/[0.05] border border-white/[0.1] rounded-xl text-[var(--accent-gold)] active:bg-white/10"
            title="Usar GPS"
          >
            {loadingGPS ? <Loader2 className="animate-spin" size={16} /> : <Navigation size={16} />}
          </button>
        </div>

        <Input 
          label="Endereço Encontrado" 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          placeholder="Rua, Bairro, Cidade..." 
        />
        
        <div className="flex gap-4">
          <Input 
            label="Número / Compl." 
            value={number} 
            onChange={(e) => setNumber(e.target.value)} 
            className="w-1/3"
          />
          <Input 
            label="Nome do Local (Apelido)" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Ex: Matriz, Filial..." 
            className="flex-1"
          />
        </div>

        <PrimaryButton 
          onClick={handleSave} 
          disabled={!address.trim() || saving} 
          className="mt-4"
        >
          {saving ? 'Salvando...' : 'Cadastrar e Selecionar'}
        </PrimaryButton>
      </div>
    </Modal>
  );
}
