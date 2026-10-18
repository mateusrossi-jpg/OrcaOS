## 2025-05-10 - Command Palette Dialog & Focus Accessibility
**Learning:** Global command palette overlays in dark-themed apps require explicit modal ARIA semantics (`role="dialog"`, `aria-modal="true"`, `aria-label`) and `focus-visible` rings on result items so keyboard-only and screen reader users can navigate results seamlessly.
**Action:** When adding or updating global command drawers or search modals, always attach dialog roles, label inputs, and apply `focus-visible` ring indicators to search items.
