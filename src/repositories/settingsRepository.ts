import { db } from '../storage/dexieDatabase';

export const settingsRepository = {
  async get(key: string): Promise<unknown> {
    const record = await db.settings.get(key);
    return record?.value;
  },
  async set(key: string, value: unknown): Promise<void> {
    await db.settings.put({ key, value });
  },
  async delete(key: string): Promise<void> {
    await db.settings.delete(key);
  }
};
