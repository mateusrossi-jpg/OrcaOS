import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  GripVertical, 
  Settings2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Activity,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../../utils/ui';
import { 
  ScreenContainer, 
  ERPLoader, 
  AppHeader, 
  Section, 
  SectionLabel, 
  SurfaceCard,
  ExecutiveHeader,
  GlassFormCard,
  GlassInput,
  Label
} from '../../../ui/system';
import { PrimaryButton, Input, TextArea } from '../../../app/components/ui';
import { checklistTemplateService } from '../../../services/ChecklistTemplateService';
import { ChecklistTemplate, ChecklistTemplateItem, MeasurementTemplateItem } from '../../../domain/checklist';
import { generateUUID } from '../../../core/utils/idGenerator';

interface ChecklistManagerScreenProps {
  onBack: () => void;
}

export const ChecklistManagerScreen: React.FC<ChecklistManagerScreenProps> = ({ onBack }) => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<Partial<ChecklistTemplate> | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      const data = await checklistTemplateService.getAllTemplates();
      setTemplates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateNew = () => {
    setEditingTemplate({
      id: generateUUID(),
      name: '',
      category: 'Geral',
      checklist: [{ id: generateUUID(), description: '' }],
      measurements: []
    });
  };

  const handleSave = async () => {
    if (!editingTemplate || !editingTemplate.name) {
      alert("Por favor, dê um nome ao seu checklist.");
      return;
    }
    
    // Filter out empty items
    const finalTemplate = {
      ...editingTemplate,
      checklist: editingTemplate.checklist?.filter(i => i.description.trim() !== '') || [],
      measurements: editingTemplate.measurements?.filter(m => m.label.trim() !== '') || []
    };

    await checklistTemplateService.saveTemplate(finalTemplate as ChecklistTemplate);
    setEditingTemplate(null);
    loadTemplates();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este checklist?")) {
      await checklistTemplateService.deleteTemplate(id);
      loadTemplates();
    }
  };

  if (loading) return <ScreenContainer className="items-center justify-center"><ERPLoader message="Carregando modelos..." /></ScreenContainer>;

  if (editingTemplate) {
    return (
      <ScreenContainer className="bg-aferix-bg pb-40">
        <div className="relative">
           <button 
             onClick={() => setEditingTemplate(null)}
             className="absolute top-16 left-6 z-[1100] w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
           >
             <ArrowLeft size={18} />
           </button>
           <ExecutiveHeader userName="Mateus" score={94} />
        </div>

        <div className="px-6 flex flex-col gap-10">
           <Section className="gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-gold)] shadow-[0_0_10px_var(--accent-gold)]" />
                <SectionLabel className="ml-1 uppercase tracking-[0.4em] text-white/40 leading-none mb-0">Editor de Checklist</SectionLabel>
              </div>
              <h1 className="text-[42px] font-black text-white uppercase leading-[0.95] tracking-tight">Novo Padrão</h1>
           </Section>

           <Section className="gap-6">
              <SectionLabel className="ml-1 uppercase tracking-widest text-[var(--accent-gold)] font-black">Informações de Base</SectionLabel>
              <GlassFormCard>
                 <GlassInput 
                   label="NOME DO MODELO" 
                   value={editingTemplate.name || ''} 
                   onChange={e => setEditingTemplate({ ...editingTemplate as ChecklistTemplate, name: e.target.value })} 
                   placeholder="Ex: Preventiva Ar Condicionado"
                 />
                 <div className="flex flex-col gap-3">
                    <Label className="!text-[10px] opacity-40 ml-1 uppercase tracking-widest">CATEGORIA DO ATIVO</Label>
                    <div className="relative">
                      <select 
                        value={editingTemplate.category}
                        onChange={e => setEditingTemplate({ ...editingTemplate as ChecklistTemplate, category: e.target.value })}
                        className="w-full h-16 bg-white/[0.02] border border-white/[0.08] rounded-[20px] px-5 text-white text-[15px] font-black uppercase tracking-tight focus:outline-none focus:border-[var(--accent-gold)]/40 transition-all appearance-none"
                      >
                         <option value="HVAC">HVAC / Ar Condicionado</option>
                         <option value="Elétrica">Elétrica</option>
                         <option value="Hidráulica">Hidráulica</option>
                         <option value="Incêndio">Incêndio</option>
                         <option value="Geral">Geral / Outros</option>
                      </select>
                      <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-white/20 pointer-events-none" />
                    </div>
                 </div>
              </GlassFormCard>
           </Section>

           <Section className="gap-6">
              <div className="flex items-center justify-between px-1">
                 <SectionLabel className="!mb-0 uppercase tracking-widest opacity-40">Itens de Inspeção</SectionLabel>
                 <button 
                   onClick={() => setEditingTemplate({
                     ...editingTemplate as ChecklistTemplate, 
                     checklist: [...(editingTemplate.checklist || []), { id: generateUUID(), description: '' }]
                   })}
                   className="w-10 h-10 bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] rounded-xl flex items-center justify-center border border-[var(--accent-gold)]/20 active:scale-90 transition-all"
                 >
                   <Plus size={18} strokeWidth={3} />
                 </button>
              </div>
              
              <div className="flex flex-col gap-4">
                 {editingTemplate.checklist?.map((item, idx) => (
                   <SurfaceCard key={item.id} className="bg-white/[0.01] border-white/[0.05] p-5 flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/30 shrink-0 mt-2">
                        {(idx + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="flex-1">
                         <textarea 
                           value={item.description} 
                           onChange={e => {
                             const newList = [...(editingTemplate.checklist || [])];
                             newList[idx].description = e.target.value;
                             setEditingTemplate({ ...editingTemplate as ChecklistTemplate, checklist: newList });
                           }}
                           placeholder="Descreva a verificação..."
                           className="w-full bg-transparent text-white text-[15px] font-bold placeholder:text-white/10 focus:outline-none resize-none min-h-[44px]"
                           rows={2}
                         />
                      </div>
                      <button 
                        onClick={() => {
                          const newList = editingTemplate.checklist?.filter((_, i) => i !== idx);
                          setEditingTemplate({ ...editingTemplate as ChecklistTemplate, checklist: newList });
                        }}
                        className="w-10 h-10 flex items-center justify-center text-white/10 hover:text-[#E85D5D] active:scale-90 transition-all mt-1"
                      >
                        <Trash2 size={18} />
                      </button>
                   </SurfaceCard>
                 ))}
              </div>
           </Section>

           <Section className="gap-6">
              <div className="flex items-center justify-between px-1">
                 <SectionLabel className="!mb-0 uppercase tracking-widest opacity-40">Medições de Campo</SectionLabel>
                 <button 
                   onClick={() => setEditingTemplate({
                     ...editingTemplate as ChecklistTemplate, 
                     measurements: [...(editingTemplate.measurements || []), { id: generateUUID(), label: '', unit: '' }]
                   })}
                   className="w-10 h-10 bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] rounded-xl flex items-center justify-center border border-[var(--accent-gold)]/20 active:scale-90 transition-all"
                 >
                   <Plus size={18} strokeWidth={3} />
                 </button>
              </div>
              
              <div className="flex flex-col gap-4">
                 {editingTemplate.measurements?.map((m, idx) => (
                   <SurfaceCard key={m.id} className="bg-white/[0.01] border-white/[0.05] p-6 flex flex-col gap-6">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Parâmetro #{idx + 1}</span>
                         <button 
                           onClick={() => {
                             const newList = editingTemplate.measurements?.filter((_, i) => i !== idx);
                             setEditingTemplate({ ...editingTemplate as ChecklistTemplate, measurements: newList });
                           }}
                           className="text-white/10 hover:text-[#E85D5D] transition-colors"
                         >
                           <Trash2 size={16} />
                         </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <GlassInput 
                           label="O QUE MEDIR?" 
                           value={m.label} 
                           onChange={e => {
                             const newList = [...(editingTemplate.measurements || [])];
                             newList[idx].label = e.target.value;
                             setEditingTemplate({ ...editingTemplate as ChecklistTemplate, measurements: newList });
                           }}
                           placeholder="ex: Pressão de Alta"
                         />
                         <GlassInput 
                           label="UNIDADE" 
                           value={m.unit} 
                           onChange={e => {
                             const newList = [...(editingTemplate.measurements || [])];
                             newList[idx].unit = e.target.value;
                             setEditingTemplate({ ...editingTemplate as ChecklistTemplate, measurements: newList });
                           }}
                           placeholder="ex: PSI"
                         />
                      </div>
                   </SurfaceCard>
                 ))}
              </div>
           </Section>
        </div>

        <div 
          className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-black via-black/90 to-transparent"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
        >
           <PrimaryButton fullWidth onClick={handleSave} className="h-18 !rounded-2xl gap-3 shadow-[0_20px_50px_rgba(212,169,74,0.3)] text-[13px] font-black tracking-[0.2em]">
              <Save size={20} /> SALVAR MODELO TÉCNICO
           </PrimaryButton>
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-aferix-bg pb-40">
      <div className="relative">
        <button 
          onClick={onBack} 
          className="absolute top-16 left-6 z-[1100] w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <ExecutiveHeader userName="Mateus" score={88} />
      </div>

      <div className="px-6 flex flex-col gap-10">
        <Section className="gap-4">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--accent-gold)] shadow-[0_0_8px_var(--accent-gold)]" />
              <SectionLabel className="ml-1 uppercase tracking-[0.3em] opacity-40 leading-none mb-0">Gestão de Vistorias</SectionLabel>
           </div>
           <h1 className="text-[42px] font-black text-white uppercase tracking-tight leading-[0.95]">Checklists</h1>
        </Section>

        <div className="flex flex-col gap-4">
          {templates.length > 0 ? (
            templates.map(t => (
              <SurfaceCard 
                key={t.id} 
                padding="lg" 
                className="bg-[#15181D]/40 border-white/[0.08] group active:scale-[0.98] transition-all cursor-pointer shadow-xl hover:bg-[#15181D]/60" 
                onClick={() => setEditingTemplate(t)}
              >
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-1.5">
                       <span className="text-[10px] font-black text-[var(--accent-gold)] uppercase tracking-[0.2em] opacity-80">{t.category}</span>
                       <h3 className="text-[19px] font-black text-white uppercase tracking-tight leading-tight">{t.name}</h3>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-[#E85D5D] hover:bg-[#E85D5D]/10 hover:border-[#E85D5D]/20 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                 </div>
                 
                 <div className="flex items-center gap-6 pt-5 border-t border-white/[0.05]">
                    <div className="flex items-center gap-2 text-white/40">
                       <FileText size={14} className="text-[var(--accent-gold)]" />
                       <span className="text-[11px] font-black uppercase tracking-widest">{t.checklist.length} ITENS</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/40">
                       <Activity size={14} className="text-[var(--accent-gold)]" />
                       <span className="text-[11px] font-black uppercase tracking-widest">{t.measurements.length} MEDIÇÕES</span>
                    </div>
                    <div className="ml-auto text-[10px] font-black text-[var(--accent-gold)] opacity-40 group-hover:opacity-100 transition-all tracking-widest">
                       EDITAR <ChevronRight size={14} className="inline ml-1" />
                    </div>
                 </div>
              </SurfaceCard>
            ))
          ) : (
            <div className="py-24 text-center flex flex-col items-center gap-6 opacity-20 border border-dashed border-white/[0.08] rounded-[40px]">
               <Settings2 size={48} />
               <span className="text-[12px] font-mono font-black uppercase tracking-[0.3em]">BIBLIOTECA_VAZIA</span>
            </div>
          )}
        </div>
      </div>

      <div 
        className="fixed bottom-10 left-6 right-6 z-50"
      >
        <button 
          onClick={handleCreateNew}
          className="w-full h-18 bg-white text-black font-black text-[13px] uppercase tracking-[0.3em] rounded-2xl active:scale-[0.96] transition-all shadow-[0_20px_50px_rgba(255,255,255,0.15)] flex items-center justify-center gap-4"
        >
          <Plus size={22} strokeWidth={4} /> CRIAR NOVO MODELO
        </button>
      </div>
    </ScreenContainer>
  );
};
