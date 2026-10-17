## 2025-05-18 - Modal Overlay Keyboard Accessibility & ARIA Labels
**Learning:** Modal and bottom sheet overlays created with `createPortal` must manage keyboard `Escape` dismissal and dynamically linked `aria-labelledby` IDs using React `useId()` to ensure screen reader accessibility and prevent duplicate DOM IDs when multiple overlays exist.
**Action:** Whenever implementing modal or sheet overlays, include `Escape` key handlers and `useId()` for ARIA label bindings.
