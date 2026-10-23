# Palette UX & Accessibility Journal

## 2026-10-23 - Command Palette Accessibility Essentials
**Learning:** Global search modal overlays (`CommandPalette`) activated via keyboard shortcuts (`Cmd+K`/`Ctrl+K`) require explicit ARIA dialog roles (`role="dialog"`, `aria-modal="true"`, `aria-label`), input field ARIA descriptions (`aria-label`), and `aria-live="polite"` regions for search results count so screen readers properly announce state changes without interrupting user typing.
**Action:** Always verify overlay search components have semantic dialog wrappers, icon button type & aria-labels, and live regions for dynamic result lists.
