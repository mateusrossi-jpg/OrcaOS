import { dexieSiteRepository } from '../repositories/dexieSiteRepository';
import { Site } from '../domain/site';
import { operationalEventService } from './operationalEventService';
import { clientService } from './clientService';

export class SiteService {
  constructor(private readonly repository = dexieSiteRepository) {}

  async getAll(): Promise<Site[]> {
    return await this.repository.getAll();
  }

  async getById(id: string): Promise<Site | undefined> {
    return await this.repository.getById(id);
  }

  async getByClientId(clientId: string): Promise<Site[]> {
    let sites = await this.repository.getByClientId(clientId);
    
    // FASE 4: MIGRAÇÃO - Auto Site Principal
    if (sites.length === 0) {
      const client = await clientService.getById(clientId);
      if (client && (client.address || client.street)) {
        const fullAddress = client.address || 
          `${client.street || ''}, ${client.addressNumber || ''} ${client.complement || ''} - ${client.district || ''}, ${client.city || ''}/${client.state || ''}`;
        
        const mainSite = await this.add({
          clientId,
          name: 'Site Principal',
          fullAddress: fullAddress.trim(),
          isMain: true,
          notes: 'Gerado automaticamente a partir do cadastro do cliente.'
        });
        sites = [mainSite];
      }
    }
    
    return sites;
  }

  async add(site: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>): Promise<Site> {
    const createdSite = await this.repository.add(site);
    
    await operationalEventService.emitEvent({
      aggregateId: createdSite.id,
      aggregateType: 'site',
      eventType: 'SITE_CREATED',
      metadata: { clientId: createdSite.clientId, correlationId: undefined },
      snapshot: { ...createdSite }
    });

    return createdSite;
  }

  async update(site: Site): Promise<void> {
    await this.repository.update(site);

    await operationalEventService.emitEvent({
      aggregateId: site.id,
      aggregateType: 'site',
      eventType: 'SITE_UPDATED',
      metadata: { clientId: site.clientId, correlationId: undefined },
      snapshot: { ...site }
    });
  }

  async delete(id: string): Promise<void> {
    const site = await this.getById(id);
    await this.repository.delete(id);
    
    if (site) {
      await operationalEventService.emitEvent({
        aggregateId: id,
        aggregateType: 'site',
        eventType: 'SITE_ARCHIVED',
        metadata: { clientId: site.clientId, correlationId: undefined },
        snapshot: { ...site, syncStatus: 'deleted' }
      });
    }
  }
}

export const siteService = new SiteService();
