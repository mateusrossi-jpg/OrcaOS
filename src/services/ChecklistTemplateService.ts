import { db } from '../storage/dexieDatabase';
import { ChecklistTemplate, ChecklistTemplateItem, MeasurementTemplateItem } from '../domain/checklist';
import { CHECKLIST_TEMPLATES, AssetTemplate } from '../features/assets/utils/checklistTemplates';
import { generateUUID } from '../core/utils/idGenerator';

export class ChecklistTemplateService {
  async getTemplateForAsset(category?: string): Promise<AssetTemplate> {
    if (!category) return CHECKLIST_TEMPLATES['Default'];

    try {
      // Try to find a user-defined template for this category
      const userTemplate = await db.checklistTemplates
        .where('category')
        .equals(category)
        .first();

      if (userTemplate) {
        return {
          checklist: userTemplate.checklist.map(item => ({ key: item.id, description: item.description })),
          measurements: userTemplate.measurements.map(m => ({ key: m.id, label: m.label, unit: m.unit }))
        };
      }
    } catch (err) {
      console.error('[ChecklistTemplateService] Error fetching user template:', err);
    }

    // Fallback to hardcoded templates
    return CHECKLIST_TEMPLATES[category] || CHECKLIST_TEMPLATES['Default'];
  }

  async getAllTemplates(): Promise<ChecklistTemplate[]> {
    return db.checklistTemplates.toArray();
  }

  async saveTemplate(template: Partial<ChecklistTemplate>): Promise<string> {
    const id = template.id || generateUUID();
    const now = new Date().toISOString();
    
    const finalTemplate: ChecklistTemplate = {
      id,
      companyId: template.companyId || 'default-company',
      workspaceId: template.workspaceId || 'default-workspace',
      name: template.name || 'Novo Checklist',
      category: template.category || 'Geral',
      checklist: template.checklist || [],
      measurements: template.measurements || [],
      createdAt: template.createdAt || now,
      updatedAt: now,
      syncStatus: 'pending',
      ...template
    } as ChecklistTemplate;

    await db.checklistTemplates.put(finalTemplate);
    return id;
  }

  async deleteTemplate(id: string): Promise<void> {
    await db.checklistTemplates.delete(id);
  }
}

export const checklistTemplateService = new ChecklistTemplateService();
