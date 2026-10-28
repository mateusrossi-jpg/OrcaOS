## 2025-05-18 - Command Palette Keyboard Navigation and Modal ARIA Semantics

**Learning:** Modal command overlays (like Cmd+K search dialogs) require both top-level ARIA dialog markup (`role="dialog"`, `aria-modal="true"`, `aria-label`) and keyboard list navigation (`ArrowUp`/`ArrowDown` item selection and `Enter` trigger) to be accessible to screen reader users and power keyboard users alike.

**Action:** Whenever introducing overlay search or command components, ensure the search input captures arrow key events to maintain active selection across dynamic result lists without shifting focus away from the input field.
