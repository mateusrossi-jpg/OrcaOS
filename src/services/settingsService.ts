import { settingsRepository } from '../repositories/settingsRepository';

export const settingsService = {
  async get<T>(key: string): Promise<T | undefined> {
    return (await settingsRepository.get(key)) as T | undefined;
  },
  async set<T>(key: string, value: T): Promise<void> {
    await settingsRepository.set(key, value);
  },
  async delete(key: string): Promise<void> {
    await settingsRepository.delete(key);
  }
};
