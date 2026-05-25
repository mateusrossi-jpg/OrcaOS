import Dexie, { Table } from 'dexie';
import { Budget } from '../domain/budget';

export class AferixDatabase extends Dexie {
  budgets!: Table<Budget>;

  constructor() {
    super('AferixDatabase');
    this.version(1).stores({
      budgets: 'id, title, clientId, status, createdAt, updatedAt'
    });
  }
}

export const db = new AferixDatabase();
