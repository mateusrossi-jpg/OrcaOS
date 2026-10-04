## 2026-10-04 - Floating Action Buttons and Dialog Triggers
**Learning:** Icon-only navigation buttons (e.g. fixed trigger buttons for drawers/menus) and modal containers without `aria-label`, `role="dialog"`, or visible focus rings prevent screen reader and keyboard navigation users from interacting with global navigation.
**Action:** Always provide explicit `aria-label`, `title`, and `focus-visible:ring-2` focus states on icon-only control buttons, and set `role="dialog"` + `aria-modal="true"` on popover containers.
