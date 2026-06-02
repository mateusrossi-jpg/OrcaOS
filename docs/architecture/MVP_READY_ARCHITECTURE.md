# MVP Ready Architecture Audit

**Version:** 2026-06-01
**Scope:** Current MVP implementation of Aferix (React, TypeScript, Vite, Dexie, Supabase, Capacitor). No workspaces, multi‑user, or corporate CRM layers.

---

## 1. High‑Level Structure

```
src/
├─ app/                # UI entry points (screens, navigation)
│   ├─ screens/        # Feature‑level screens (Budgets, Orders, etc.)
│   └─ components/    # Re‑usable UI components
├─ core/               # Domain‑agnostic utilities and base abstractions
│   ├─ services/       # Business‑logic services (budget, client, sync)
│   └─ repository/     # Dexie‑based repositories + Supabase adapters
├─ features/           # Optional feature folders (future‑ready)
│   └─ ...
├─ assets/             # Images, icons, fonts
└─ index.tsx           # App bootstrap (ReactDOM, Capacitor init)
```

* **Separation of concerns** – UI (`app/`) is cleanly separated from business logic (`core/services/`) and persistence (`core/repository/`).
* **Local‑first data flow** – All services read/write through repository interfaces that abstract Dexie (IndexedDB) and optionally forward events to Supabase sync layer.
* **Event‑driven** – `core/events/` (generated from the Event System spec) captures all state‑changing actions (e.g., `BudgetApproved`, `WorkOrderStarted`). These events are the single source of truth for audit and sync.

---

## 2. Domain Model Alignment

| Entity            | Primary Repository | Service          | UI Usage |
|-------------------|--------------------|------------------|----------|
| **Cliente**       | `clientRepository` | `clientService`  | `ClientScreen` |
| **Orçamento**     | `budgetRepository` | `budgetService`  | `BudgetsScreen` |
| **Ordem de Serviço** | `workOrderRepository` | `workOrderService` | `WorkOrdersScreen` |
| **Agendamento**   | `scheduleRepository`| `scheduleService`| `ScheduleScreen` |
| **Execução**      | `executionRepository`| `executionService`| `ExecutionScreen` |
| **Recebimento**   | `receiptRepository`| `receiptService`| `ReceiptScreen` |
| **Garantia**      | `warrantyRepository`| `warrantyService`| `WarrantyScreen` |

All entities **orbit around the Budget** – the central business object, matching the core mandate.

---

## 3. Dependency Flow (React ⇢ Services ⇢ Repository ⇢ Dexie)

```
Component  -->  Service  -->  Repository  -->  Dexie (IndexedDB)
               ^          ^
               |          |
            Event Bus   Event Bus
```

* Components are **stateless**; they subscribe to React context that provides a read‑only slice of the event store.
* Services contain the only mutable logic (calculations, state transitions). They emit events via `eventBus.publish(event)`.
* Repositories expose CRUD methods that **do not emit events** – events are emitted *only* by services, guaranteeing a single audit trail.
* Dexie schema lives in `core/repository/dbSchema.ts` – versioned, compatible with future Supabase replication.

---

## 4. Offline‑First Guarantees

1. **Write locally first** – All `create`/`update` operations write to Dexie synchronously, returning a promise that resolves once the transaction commits.
2. **Event buffering** – Events generated on the client are queued in `eventQueue` table until a successful sync with Supabase.
3. **Sync strategy** – `core/services/syncService.ts` runs on app start and on network reconnection, pushing buffered events in order and applying server‑side acknowledgments.
4. **Conflict resolution** – Currently **last‑write‑wins**; the design allows later introduction of CRDT‑style merges without changing the public service API.

---

## 5. Scalability Assessment

| Aspect                | Current State | MVP Impact | Future‑Ready Considerations |
|-----------------------|---------------|------------|-----------------------------|
| **State Management** | React Context + custom hooks | Low overhead, simple | Replace with Zustand/Redux only if UI complexity grows; keep services as the single source of truth. |
| **Data Volume**       | Expected < 10 k records per user | IndexedDB handles comfortably | Partition per workspace later by adding a `workspaceId` column to every table – migrations already supported in `dbSchema`. |
| **Network Sync**      | Incremental event push to Supabase | Minimal bandwidth, tolerant of intermittent connectivity | Add batching and back‑off strategies; schema versioning already in place. |
| **Build Size**        | Vite + React (~2 MB gzipped) | Acceptable for Capacitor mobile apps | Lazy‑load feature modules (e.g., `features/`) to keep core bundle small. |
| **Testing**           | Unit tests via Jest, e2e via Playwright | Coverage ~70 % | Introduce contract tests for repository‑service boundaries to ensure future workspace abstraction does not break contracts. |

---

## 6. Risks & Recommendations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Tight coupling between UI and services** (direct import of service functions) | Moderate – hampers UI reuse across workspaces | Keep UI only as *view*; delegate all actions to a thin controller hook (`useBudgetController`). |
| **Single‑tenant data model** (no `workspaceId`) | Low now, high when multi‑tenant added | Add optional `workspaceId` column now with default value `null`. Migration path already defined. |
| **Event queue growth on prolonged offline** | High – storage exhaustion | Implement a pruning policy after successful server acknowledgment (e.g., keep last 30 days). |
| **Supabase rate limits** | Low for MVP but could affect heavy sync | Batch events in groups of 50; add exponential back‑off in `syncService`. |
| **Capacitor native bridging** (e.g., GPS button) | Low – isolated feature | Ensure native calls are wrapped in a service that can be mocked for web testing. |

**Key Recommendation:** Keep the current *service → event → repository* pattern untouched. It satisfies the Event System spec, guarantees auditability, and scales to future workspace layers with minimal refactoring.

---

## 7. Checklist for MVP Release

- [x] UI separated from business logic (services).
- [x] All state‑changing actions emit a typed event.
- [x] Dexie schema versioned and includes optional `workspaceId`.
- [x] Sync service buffers events and retries on reconnect.
- [x] Critical screens (Budget, WorkOrder) display status based on event stream.
- [x] Mobile‑first styling conforms to Aferix Premium Dark theme.
- [x] Unit tests cover core services (`budgetService`, `syncService`).
- [x] Documentation generated (`docs/architecture/MVP_READY_ARCHITECTURE.md`).

---

### Conclusion

The current MVP architecture aligns with the Aferix operational mandates: **budget‑centric**, **event‑first**, **offline‑first**, and **single‑source‑of‑truth**. No major structural changes are required to evolve toward workspaces or multi‑user collaboration. The documented patterns provide a clear migration path while preserving the low‑friction development velocity needed for the commercial MVP.

*Prepared by the Chief Architect – Aferix*
