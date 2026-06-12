export interface ChecklistTemplateItem {
  key: string;
  description: string;
}

export interface MeasurementTemplate {
  key: string;
  label: string;
  unit: string;
}

export interface AssetTemplate {
  checklist: ChecklistTemplateItem[];
  measurements: MeasurementTemplate[];
}

export const CHECKLIST_TEMPLATES: Record<string, AssetTemplate> = {
  'HVAC': {
    checklist: [
      { key: 'hvac-1', description: 'Limpeza de filtros e serpentinas' },
      { key: 'hvac-2', description: 'Verificação de ruídos e vibrações anormais' },
      { key: 'hvac-3', description: 'Teste de estanqueidade do circuito frigorífico' },
      { key: 'hvac-4', description: 'Verificação do estado das correias e polias' },
      { key: 'hvac-5', description: 'Limpeza do dreno e bandeja de condensado' }
    ],
    measurements: [
      { key: 'm-press-alta', label: 'Pressão de Alta', unit: 'PSI' },
      { key: 'm-press-baixa', label: 'Pressão de Baixa', unit: 'PSI' },
      { key: 'm-temp-insufla', label: 'Temp. Insuflamento', unit: '°C' },
      { key: 'm-corrente-comp', label: 'Corrente Compressor', unit: 'A' }
    ]
  },
  'Elétrica': {
    checklist: [
      { key: 'ele-1', description: 'Reaperto de conexões e barramentos' },
      { key: 'ele-2', description: 'Inspeção visual de componentes (disjuntores/contatores)' },
      { key: 'ele-3', description: 'Limpeza interna do quadro/painel' },
      { key: 'ele-4', description: 'Verificação de sinalização e iluminação de emergência' }
    ],
    measurements: [
      { key: 'm-tensao-r', label: 'Tensão R-S', unit: 'V' },
      { key: 'm-tensao-s', label: 'Tensão S-T', unit: 'V' },
      { key: 'm-tensao-t', label: 'Tensão T-R', unit: 'V' },
      { key: 'm-corrente-r', label: 'Corrente R', unit: 'A' }
    ]
  },
  'Hidráulica': {
    checklist: [
      { key: 'hid-1', description: 'Verificação de vazamentos em válvulas e conexões' },
      { key: 'hid-2', description: 'Teste de funcionamento das bombas (recalque/incêndio)' },
      { key: 'hid-3', description: 'Limpeza de filtros de linha e cestos' },
      { key: 'hid-4', description: 'Verificação de pressão nos manômetros' }
    ],
    measurements: [
      { key: 'm-press-suc', label: 'Pressão de Sucção', unit: 'mca' },
      { key: 'm-press-rec', label: 'Pressão de Recalque', unit: 'mca' }
    ]
  },
  'Default': {
    checklist: [
      { key: 'def-1', description: 'Inspeção visual geral' },
      { key: 'def-2', description: 'Limpeza e conservação' },
      { key: 'def-3', description: 'Teste de funcionamento básico' }
    ],
    measurements: []
  }
};

export const getTemplateForAsset = (category?: string): AssetTemplate => {
  if (!category) return CHECKLIST_TEMPLATES['Default'];
  return CHECKLIST_TEMPLATES[category] || CHECKLIST_TEMPLATES['Default'];
};
