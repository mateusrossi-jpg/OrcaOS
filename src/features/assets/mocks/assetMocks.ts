import { Search, Wrench, Shield, Zap, AlertTriangle, Clock, MapPin, Clipboard } from 'lucide-react';

export interface AssetHistory {
  id: string;
  type: 'preventive' | 'corrective' | 'install';
  date: string;
  description: string;
  technician: string;
}

export interface Asset {
  id: string;
  name: string;
  category: 'HVAC' | 'Elétrica' | 'Hidráulica' | 'Incêndio';
  status: 'operacional' | 'manutenção' | 'crítico';
  tag: string;
  serial: string;
  brand: string;
  model: string;
  location: string;
  lastService: string;
  nextService: string;
  history: AssetHistory[];
}

export const ASSET_CATEGORIES = ['Todos', 'HVAC', 'Elétrica', 'Hidráulica', 'Incêndio'];

export const MOCK_ASSETS: Asset[] = [
  {
    id: 'as-001',
    name: 'Ar Condicionado Central 01',
    category: 'HVAC',
    status: 'operacional',
    tag: 'HVAC-01-ADM',
    serial: 'SN-99283-TR',
    brand: 'Trane',
    model: 'Voyager II',
    location: 'Telhado - Bloco A',
    lastService: '2026-05-15',
    nextService: '2026-06-15',
    history: [
      { id: 'h1', type: 'preventive', date: '2026-05-15', description: 'Limpeza de filtros e check de gás', technician: 'Mateus' },
      { id: 'h2', type: 'corrective', date: '2026-04-10', description: 'Troca de capacitor de partida', technician: 'Joaquim' }
    ]
  },
  {
    id: 'as-002',
    name: 'Quadro Geral Baixa Tensão',
    category: 'Elétrica',
    status: 'manutenção',
    tag: 'EL-QGBT-01',
    serial: 'SN-EL-882',
    brand: 'Schneider',
    model: 'Prisma P',
    location: 'Subsolo - Sala Elétrica',
    lastService: '2026-05-01',
    nextService: '2026-05-20',
    history: [
      { id: 'h3', type: 'preventive', date: '2026-05-01', description: 'Reaperto de barramento e termografia', technician: 'Mateus' }
    ]
  },
  {
    id: 'as-003',
    name: 'Bomba de Recalque 02',
    category: 'Hidráulica',
    status: 'crítico',
    tag: 'HID-BOM-02',
    serial: 'SN-BOM-11',
    brand: 'Schneider',
    model: 'BC-92',
    location: 'Casa de Bombas - Nível 1',
    lastService: '2026-03-10',
    nextService: '2026-04-10',
    history: [
      { id: 'h4', type: 'corrective', date: '2026-03-10', description: 'Vazamento no selo mecânico', technician: 'Mateus' }
    ]
  }
];
