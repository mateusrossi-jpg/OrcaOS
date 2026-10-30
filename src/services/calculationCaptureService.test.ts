import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalculationCaptureService, calculationCaptureService } from './calculationCaptureService';
import { CalculationCaptureRepository } from '../repositories/calculationCaptureRepository';
import { CalculationCapture } from '../core/types/workflow';

describe('CalculationCaptureService', () => {
  let mockRepository: CalculationCaptureRepository;

  const sampleCapture: CalculationCapture = {
    id: 'cap-101',
    module: 'orcamentoTecnico',
    moduleLabel: 'Orçamento Técnico',
    calculatorLabel: 'Cálculo de Iluminação',
    destination: 'budget',
    createdAt: '2026-03-30T10:00:00.000Z',
    summary: 'Instalação de 5 pontos LED',
    details: ['Cabo 2.5mm', 'Disjuntor 10A'],
    itemType: 'service',
    editableDescription: 'Instalação de pontos de iluminação LED',
    quantity: '5',
    unitValue: '80.00',
    shouldGenerateBudgetItem: true,
    convertedToBudgetItem: false,
    reportReady: true,
    clientId: 'cli-001',
    workOrderId: 'wo-001',
  };

  beforeEach(() => {
    mockRepository = {
      createCapture: vi.fn().mockResolvedValue(undefined),
      createManyCaptures: vi.fn().mockResolvedValue(undefined),
      getCaptureById: vi.fn().mockResolvedValue(undefined),
      listCaptures: vi.fn().mockResolvedValue([]),
      listCapturesByWorkOrderId: vi.fn().mockResolvedValue([]),
      updateCapture: vi.fn().mockResolvedValue(undefined),
      deleteCapture: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe('Constructor and Defaults', () => {
    it('uses the injected repository', async () => {
      vi.mocked(mockRepository.listCaptures).mockResolvedValue([sampleCapture]);
      const service = new CalculationCaptureService(mockRepository);

      const result = await service.listCaptures();
      expect(result).toEqual([sampleCapture]);
      expect(mockRepository.listCaptures).toHaveBeenCalledTimes(1);
    });

    it('instantiates default singleton exported instance properly', () => {
      expect(calculationCaptureService).toBeInstanceOf(CalculationCaptureService);
    });
  });

  describe('listCaptures', () => {
    it('delegates to repository.listCaptures and returns the list of captures', async () => {
      const captures = [sampleCapture, { ...sampleCapture, id: 'cap-102' }];
      vi.mocked(mockRepository.listCaptures).mockResolvedValue(captures);

      const service = new CalculationCaptureService(mockRepository);
      const result = await service.listCaptures();

      expect(mockRepository.listCaptures).toHaveBeenCalledTimes(1);
      expect(result).toEqual(captures);
      expect(result).toHaveLength(2);
    });

    it('returns empty array when repository has no captures', async () => {
      vi.mocked(mockRepository.listCaptures).mockResolvedValue([]);

      const service = new CalculationCaptureService(mockRepository);
      const result = await service.listCaptures();

      expect(result).toEqual([]);
    });

    it('propagates errors when repository.listCaptures fails', async () => {
      vi.mocked(mockRepository.listCaptures).mockRejectedValue(new Error('Database read error'));

      const service = new CalculationCaptureService(mockRepository);
      await expect(service.listCaptures()).rejects.toThrow('Database read error');
    });
  });

  describe('addCaptures', () => {
    it('delegates to repository.createManyCaptures with given captures', async () => {
      const captures = [sampleCapture, { ...sampleCapture, id: 'cap-102' }];
      const service = new CalculationCaptureService(mockRepository);

      await service.addCaptures(captures);

      expect(mockRepository.createManyCaptures).toHaveBeenCalledTimes(1);
      expect(mockRepository.createManyCaptures).toHaveBeenCalledWith(captures);
    });

    it('handles empty captures array gracefully', async () => {
      const service = new CalculationCaptureService(mockRepository);

      await service.addCaptures([]);

      expect(mockRepository.createManyCaptures).toHaveBeenCalledWith([]);
    });

    it('propagates errors when repository.createManyCaptures fails', async () => {
      vi.mocked(mockRepository.createManyCaptures).mockRejectedValue(new Error('Database write error'));

      const service = new CalculationCaptureService(mockRepository);
      await expect(service.addCaptures([sampleCapture])).rejects.toThrow('Database write error');
    });
  });

  describe('deleteCapture', () => {
    it('delegates to repository.deleteCapture with capture ID', async () => {
      const service = new CalculationCaptureService(mockRepository);

      await service.deleteCapture('cap-101');

      expect(mockRepository.deleteCapture).toHaveBeenCalledTimes(1);
      expect(mockRepository.deleteCapture).toHaveBeenCalledWith('cap-101');
    });

    it('propagates errors when repository.deleteCapture fails', async () => {
      vi.mocked(mockRepository.deleteCapture).mockRejectedValue(new Error('Capture not found'));

      const service = new CalculationCaptureService(mockRepository);
      await expect(service.deleteCapture('cap-invalid')).rejects.toThrow('Capture not found');
    });
  });

  describe('updateCapture', () => {
    it('delegates to repository.updateCapture with updated capture object', async () => {
      const updatedCapture: CalculationCapture = {
        ...sampleCapture,
        quantity: '10',
        unitValue: '75.00',
      };
      const service = new CalculationCaptureService(mockRepository);

      await service.updateCapture(updatedCapture);

      expect(mockRepository.updateCapture).toHaveBeenCalledTimes(1);
      expect(mockRepository.updateCapture).toHaveBeenCalledWith(updatedCapture);
    });

    it('propagates errors when repository.updateCapture fails', async () => {
      vi.mocked(mockRepository.updateCapture).mockRejectedValue(new Error('Update failed'));

      const service = new CalculationCaptureService(mockRepository);
      await expect(service.updateCapture(sampleCapture)).rejects.toThrow('Update failed');
    });
  });
});
