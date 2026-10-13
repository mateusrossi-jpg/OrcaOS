## 2026-10-13 - Modal Dialog Keyboard Dismissal and ARIA Roles
**Learning:** Confirmation modals created via React portals in local-first design systems must bind keyboard `Escape` event listeners and define explicit `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` attributes to ensure keyboard navigability and screen-reader accessibility.
**Action:** Always include an `Escape` keydown listener in modal overlays and connect dialog title IDs with `aria-labelledby`.
