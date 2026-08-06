import { db } from '../database/db';
import type { StockReservation } from '../database/schema';

export class StockRepository {
  async getActiveReservations(): Promise<StockReservation[]> {
    return db.stock_reservations.where('status').equals('active').toArray();
  }
}

export const stockRepository = new StockRepository();
