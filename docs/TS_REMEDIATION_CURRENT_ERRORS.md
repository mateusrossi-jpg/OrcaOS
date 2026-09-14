# TypeScript Diagnostics – Current Run

- **Timestamp**: 2026-09-04T11:44:41-03:00
- **Git HEAD**: b021a16dac3659dd1dce236017d4645bcce51ce9
- **Total errors**: 212

---

```
1: oFinanceLink.test.ts(38,7): error TS2741: Property 'category' is missing in type '{ id: string; companyId: string; workspaceId: string; name: string; sku: string; quantityOnHand: number; minimumStock: number; unitCost: number; status: "IN_STOCK"; lastUpdated: string; }' but required in type 'InventoryItem'.
2: src/test/ExecutionToFinanceLink.test.ts(50,7): error TS2741: Property 'category' is missing in type '{ id: string; companyId: string; workspaceId: string; name: string; sku: string; quantityOnHand: number; minimumStock: number; unitCost: number; status: "IN_STOCK"; lastUpdated: string; }' but required in type 'InventoryItem'.
3: src/test/ExecutionToFinanceLink.test.ts(114,12): error TS18048: 'savedBudget.items' is possibly 'undefined'.
4: src/test/ExecutionToFinanceLink.test.ts(115,12): error TS18048: 'savedBudget.items' is possibly 'undefined'.
5: src/test/ExecutionToFinanceLink.test.ts(326,12): error TS18048: 'completionEvent.metadata' is possibly 'undefined'.
6: src/test/ExecutionToFinanceLink.test.ts(327,12): error TS18048: 'completionEvent.metadata' is possibly 'undefined'.
7: src/test/ExecutionToFinanceLink.test.ts(328,12): error TS18048: 'completionEvent.snapshot' is possibly 'undefined'.
8: src/test/ExecutionToFinanceLink.test.ts(329,12): error TS18048: 'completionEvent.snapshot' is possibly 'undefined'.
9: src/test/ExecutionToFinanceLink.test.ts(329,12): error TS18046: 'completionEvent.snapshot.consumedParts' is of type 'unknown'.
10:
```
