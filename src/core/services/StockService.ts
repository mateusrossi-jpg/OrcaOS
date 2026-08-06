import { stockRepository } from '../repositories/StockRepository';

export class StockService {
  async getActiveReservations() {
    return stockRepository.getActiveReservations();
  }
}

export const stockService = new StockService();
