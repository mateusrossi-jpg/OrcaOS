# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Command Palette Accessibility & Keyboard Navigation
**Learning:** Overlay search panels like Command Palette require ARIA dialog roles (`role="dialog"`, `aria-modal="true"`) and full keyboard list selection support (`ArrowUp`, `ArrowDown`, `Enter`), otherwise keyboard and screen reader users cannot cycle through search results without manually tabbing through buttons.
**Action:** Always provide explicit keyboard item indexing, `aria-selected` status, and accessible button labels for overlay search tools.
