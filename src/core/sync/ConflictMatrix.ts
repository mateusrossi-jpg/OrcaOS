export type ConflictClassification = 'SAFE_MERGE' | 'LWW_ALLOWED' | 'CONFLICT_REQUIRED' | 'IMMUTABLE';

export const FIELD_CONFLICT_MATRIX: Record<string, Record<string, ConflictClassification>> = {
  budget: {
    id: 'IMMUTABLE',
    companyId: 'IMMUTABLE',
    workspaceId: 'IMMUTABLE',
    createdAt: 'IMMUTABLE',
    clientId: 'IMMUTABLE',
    attendanceId: 'IMMUTABLE',
    siteId: 'IMMUTABLE',
    
    title: 'LWW_ALLOWED',
    clientName: 'LWW_ALLOWED',
    notes: 'SAFE_MERGE',
    commercialNotes: 'SAFE_MERGE',
    technicalNotes: 'SAFE_MERGE',
    evidences: 'SAFE_MERGE',
    paymentTerms: 'LWW_ALLOWED',
    validity: 'LWW_ALLOWED',
    guarantee: 'LWW_ALLOWED',
    executionDeadline: 'LWW_ALLOWED',

    status: 'CONFLICT_REQUIRED',
    chargedValue: 'CONFLICT_REQUIRED',
    materialCost: 'CONFLICT_REQUIRED',
    travelCost: 'CONFLICT_REQUIRED',
    helperCost: 'CONFLICT_REQUIRED',
    fees: 'CONFLICT_REQUIRED',
    discounts: 'CONFLICT_REQUIRED',
    otherCosts: 'CONFLICT_REQUIRED',
    items: 'CONFLICT_REQUIRED',
    financialSnapshot: 'CONFLICT_REQUIRED',
    
    syncStatus: 'IMMUTABLE',
    updatedAt: 'LWW_ALLOWED',
    deletedAt: 'LWW_ALLOWED',
    deletedBy: 'LWW_ALLOWED',
    isDeleted: 'LWW_ALLOWED',
  },
  workorder: {
    id: 'IMMUTABLE',
    companyId: 'IMMUTABLE',
    workspaceId: 'IMMUTABLE',
    createdAt: 'IMMUTABLE',
    clientId: 'IMMUTABLE',
    siteId: 'IMMUTABLE',
    budgetId: 'IMMUTABLE',
    attendanceId: 'IMMUTABLE',

    title: 'LWW_ALLOWED',
    description: 'SAFE_MERGE',
    priority: 'LWW_ALLOWED',
    scheduledDate: 'LWW_ALLOWED',
    
    status: 'CONFLICT_REQUIRED',
    paymentStatus: 'CONFLICT_REQUIRED',
    executedValue: 'CONFLICT_REQUIRED',
    items: 'CONFLICT_REQUIRED',

    hasTechnicalReturn: 'LWW_ALLOWED',
    technicalReturnIds: 'SAFE_MERGE',

    syncStatus: 'IMMUTABLE',
    updatedAt: 'LWW_ALLOWED',
    deletedAt: 'LWW_ALLOWED',
    deletedBy: 'LWW_ALLOWED',
    isDeleted: 'LWW_ALLOWED',
  },
  client: {
    id: 'IMMUTABLE',
    companyId: 'IMMUTABLE',
    workspaceId: 'IMMUTABLE',
    createdAt: 'IMMUTABLE',

    name: 'LWW_ALLOWED',
    documentNumber: 'LWW_ALLOWED',
    phone: 'LWW_ALLOWED',
    email: 'LWW_ALLOWED',
    address: 'LWW_ALLOWED',

    notes: 'SAFE_MERGE',
    tags: 'SAFE_MERGE',

    status: 'CONFLICT_REQUIRED',

    syncStatus: 'IMMUTABLE',
    updatedAt: 'LWW_ALLOWED',
    deletedAt: 'LWW_ALLOWED',
    deletedBy: 'LWW_ALLOWED',
    isDeleted: 'LWW_ALLOWED',
  },
  attendance: {
    id: 'IMMUTABLE',
    companyId: 'IMMUTABLE',
    workspaceId: 'IMMUTABLE',
    createdAt: 'IMMUTABLE',
    clientId: 'IMMUTABLE',
    siteId: 'IMMUTABLE',
    budgetId: 'IMMUTABLE',
    workOrderId: 'IMMUTABLE',

    title: 'LWW_ALLOWED',
    description: 'SAFE_MERGE',
    priority: 'LWW_ALLOWED',
    scheduledDate: 'LWW_ALLOWED',

    status: 'CONFLICT_REQUIRED',

    syncStatus: 'IMMUTABLE',
    updatedAt: 'LWW_ALLOWED',
    deletedAt: 'LWW_ALLOWED',
    deletedBy: 'LWW_ALLOWED',
    isDeleted: 'LWW_ALLOWED',
  }
};

export function getFieldConflictStrategy(aggregateType: string, fieldName: string): ConflictClassification {
  const norm = aggregateType.toLowerCase();
  if (!FIELD_CONFLICT_MATRIX[norm]) {
    // Fallback if aggregate not mapped
    return 'LWW_ALLOWED';
  }
  return FIELD_CONFLICT_MATRIX[norm][fieldName] || 'LWW_ALLOWED';
}

export function mergeSnapshots(aggregateType: string, localSnapshot: any, remoteSnapshot: any, localUpdatedAt: number, remoteUpdatedAt: number): any {
  if (!localSnapshot) return remoteSnapshot;
  if (!remoteSnapshot) return localSnapshot;

  const merged = { ...localSnapshot };
  const remoteKeys = Object.keys(remoteSnapshot);

  for (const key of remoteKeys) {
    const strategy = getFieldConflictStrategy(aggregateType, key);

    switch (strategy) {
      case 'IMMUTABLE':
        // Preserve local ID and IDs. Don't overwrite.
        break;
      case 'LWW_ALLOWED':
        // LWW uses the most recently updated entity to decide which field wins
        if (remoteUpdatedAt > localUpdatedAt) {
          merged[key] = remoteSnapshot[key];
        }
        break;
      case 'SAFE_MERGE':
        // If it's an array, union it
        if (Array.isArray(localSnapshot[key]) && Array.isArray(remoteSnapshot[key])) {
           merged[key] = Array.from(new Set([...localSnapshot[key], ...remoteSnapshot[key]]));
        } else if (typeof localSnapshot[key] === 'string' && typeof remoteSnapshot[key] === 'string') {
           // Concatenate text safely if different
           if (localSnapshot[key] !== remoteSnapshot[key]) {
               merged[key] = `${localSnapshot[key]}\n\n--- Sync Merge ---\n\n${remoteSnapshot[key]}`;
           }
        } else {
           // Fallback to LWW
           if (remoteUpdatedAt > localUpdatedAt) {
              merged[key] = remoteSnapshot[key];
           }
        }
        break;
      case 'CONFLICT_REQUIRED':
        // For MVP/Hardening, we log the conflict but allow LWW so we don't drop operations completely.
        // In the future, this would generate a Conflict Task for the UI to resolve.
        console.warn(`[Sync] Conflict required for ${aggregateType}.${key}. Auto-resolving via LWW.`);
        if (remoteUpdatedAt > localUpdatedAt) {
          merged[key] = remoteSnapshot[key];
        }
        break;
    }
  }

  // Ensure timestamps are updated
  merged.updatedAt = remoteUpdatedAt > localUpdatedAt ? remoteSnapshot.updatedAt : localSnapshot.updatedAt;

  return merged;
}
