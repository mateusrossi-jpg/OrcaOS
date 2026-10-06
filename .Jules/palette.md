## 2026-10-06 - Modal Overlays & Keyboard Navigation

**Learning:** Portal-based overlay primitives (modals and bottom sheets) require global `Escape` key event listeners and explicit ARIA dialog roles (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`/`aria-label`) to ensure full accessibility for screen readers and keyboard-only navigation.
**Action:** When building or updating overlay primitives, always register an `Escape` key handler and pass proper accessibility attributes to the dialog container alongside `aria-label` and `focus-visible` ring styles on icon close buttons.
