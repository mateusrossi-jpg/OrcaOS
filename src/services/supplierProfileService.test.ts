import { describe, expect, it, vi } from 'vitest';
import { SupplierProfileService } from './supplierProfileService';
import { SupplierProfileRepository } from '../repositories/supplierProfileRepository';
import { SupplierProfile } from '../features/catalog/storage/supplierProfileStorage';

class MockSupplierProfileRepository implements SupplierProfileRepository {
  private profiles: SupplierProfile[] = [];

  async getAll(): Promise<SupplierProfile[]> {
    return [...this.profiles];
  }

  async save(profile: SupplierProfile): Promise<void> {
    const index = this.profiles.findIndex((p) => p.id === profile.id);
    if (index >= 0) {
      this.profiles[index] = profile;
    } else {
      this.profiles.push(profile);
    }
  }

  async delete(id: string): Promise<void> {
    this.profiles = this.profiles.filter((p) => p.id !== id);
  }

  async bulkAdd(profiles: SupplierProfile[]): Promise<void> {
    this.profiles.push(...profiles);
  }

  setProfiles(profiles: SupplierProfile[]): void {
    this.profiles = [...profiles];
  }
}

describe('SupplierProfileService', () => {
  it('uses default dexieSupplierProfileRepository when no constructor argument is provided', () => {
    const service = new SupplierProfileService();
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('returns profiles sorted by updatedAt descending', async () => {
      const mockRepo = new MockSupplierProfileRepository();
      const p1: SupplierProfile = {
        id: '1',
        name: 'Supplier A',
        document: '111',
        segment: 'Tools',
        createdAt: '2025-01-01T10:00:00.000Z',
        updatedAt: '2025-01-01T10:00:00.000Z',
      };
      const p2: SupplierProfile = {
        id: '2',
        name: 'Supplier B',
        document: '222',
        segment: 'Electric',
        createdAt: '2025-01-01T09:00:00.000Z',
        updatedAt: '2025-01-02T12:00:00.000Z',
      };
      const p3: SupplierProfile = {
        id: '3',
        name: 'Supplier C',
        document: '333',
        segment: 'Plumbing',
        createdAt: '2025-01-01T08:00:00.000Z',
        updatedAt: '2025-01-01T11:00:00.000Z',
      };

      mockRepo.setProfiles([p1, p2, p3]);

      const service = new SupplierProfileService(mockRepo);
      const result = await service.getAll();

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('2'); // 2025-01-02T12:00:00.000Z
      expect(result[1].id).toBe('3'); // 2025-01-01T11:00:00.000Z
      expect(result[2].id).toBe('1'); // 2025-01-01T10:00:00.000Z
    });

    it('returns an empty array when no profiles exist', async () => {
      const mockRepo = new MockSupplierProfileRepository();
      const service = new SupplierProfileService(mockRepo);

      const result = await service.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('save', () => {
    it('updates updatedAt and preserves existing createdAt when present', async () => {
      const mockRepo = new MockSupplierProfileRepository();
      const service = new SupplierProfileService(mockRepo);

      const existingCreatedAt = '2024-06-01T00:00:00.000Z';
      const profileToSave: SupplierProfile = {
        id: 'sup-1',
        name: 'Tech Supplies',
        document: '12345678000199',
        segment: 'Electronics',
        createdAt: existingCreatedAt,
        updatedAt: '2024-06-01T00:00:00.000Z',
      };

      const mockNow = '2025-03-01T15:30:00.000Z';
      vi.useFakeTimers();
      vi.setSystemTime(new Date(mockNow));

      await service.save(profileToSave);

      vi.useRealTimers();

      const profiles = await mockRepo.getAll();
      expect(profiles).toHaveLength(1);
      expect(profiles[0]).toEqual({
        ...profileToSave,
        createdAt: existingCreatedAt,
        updatedAt: mockNow,
      });
    });

    it('sets both createdAt and updatedAt to current timestamp when createdAt is empty', async () => {
      const mockRepo = new MockSupplierProfileRepository();
      const service = new SupplierProfileService(mockRepo);

      const profileToSave: SupplierProfile = {
        id: 'sup-2',
        name: 'New Supplier',
        document: '98765432000100',
        segment: 'Hardware',
        createdAt: '',
        updatedAt: '',
      };

      const mockNow = '2025-03-01T16:00:00.000Z';
      vi.useFakeTimers();
      vi.setSystemTime(new Date(mockNow));

      await service.save(profileToSave);

      vi.useRealTimers();

      const profiles = await mockRepo.getAll();
      expect(profiles).toHaveLength(1);
      expect(profiles[0].createdAt).toBe(mockNow);
      expect(profiles[0].updatedAt).toBe(mockNow);
    });
  });

  describe('delete', () => {
    it('deletes the profile with the specified id from repository', async () => {
      const mockRepo = new MockSupplierProfileRepository();
      const p1: SupplierProfile = {
        id: 'sup-10',
        name: 'Supplier 10',
        document: '1010',
        segment: 'Services',
        createdAt: '2025-01-01T10:00:00.000Z',
        updatedAt: '2025-01-01T10:00:00.000Z',
      };
      mockRepo.setProfiles([p1]);

      const service = new SupplierProfileService(mockRepo);

      await service.delete('sup-10');

      const profiles = await mockRepo.getAll();
      expect(profiles).toHaveLength(0);
    });
  });
});
