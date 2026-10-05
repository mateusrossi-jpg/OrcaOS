# Palette's Journal - UX & Accessibility Learnings

## 2026-10-05 - Command Palette Accessible Dialog Pattern
**Learning:** Command palette and modal overlays require explicit dialog ARIA roles (`role="dialog"`, `aria-modal="true"`, `aria-label`), explicit `aria-label` on inputs/icon buttons, `aria-live="polite"` on dynamic search results, and `focus-visible:ring-2` focus rings for keyboard navigation.
**Action:** Apply dialog roles, focus-visible states, and aria-live region to modal overlay components across the design system.
