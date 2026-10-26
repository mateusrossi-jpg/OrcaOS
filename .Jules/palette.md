## 2025-05-18 - Accessibility and Feedback in Command Palette Modals
**Learning:** Modal command search interfaces require proper dialog semantics (`role="dialog"`, `aria-modal="true"`, `aria-label`) and visual indicator feedback when searching asynchronously so screen readers and keyboard users understand modal context and active background search states.
**Action:** When implementing modal search dialogs, always include dialog ARIA roles, label icon buttons (like search clear), and render active loading feedback icons (`animate-spin`).
