/* eslint-disable @typescript-eslint/no-explicit-any */
export const idempotency = {
  generateWriteFingerprint: (entity: any): string => {
    // Generate a quick hash or string representation of the core data to prevent duplicate identical writes
    const cleanEntity = { ...entity };
    delete cleanEntity.updatedAt;
    delete cleanEntity.syncUpdatedAt;
    delete cleanEntity.syncStatus;
    return JSON.stringify(cleanEntity);
  },

  isDuplicateWrite: (lastHash: string | undefined, currentHash: string): boolean => {
    return lastHash === currentHash;
  }
};
