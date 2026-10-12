## 2026-10-12 - Modal Overlay Accessibility & Focus Management Pattern
**Learning:** In local-first React apps with custom design overlays like `ConfirmModal`, dialog overlays created with `createPortal` need `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, body scroll locks, and `Escape` key event listeners for keyboard navigation and screen reader support.
**Action:** Always include keyboard listeners (`Escape`), `document.body.style.overflow = 'hidden'` with cleanup, and explicit `role="dialog"` attributes whenever building or touching portal-based modal overlays.
