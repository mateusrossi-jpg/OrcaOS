## 2025-05-18 - Accessible Command Palette Dialogs
**Learning:** Command palettes/modals in dark theme custom UIs often miss `role="dialog"`, `aria-modal="true"`, screen-reader descriptive labels for search items, and focus visible outline states on list buttons.
**Action:** Always verify `role="dialog"`, explicit `aria-label`s on icon buttons / search inputs, `aria-hidden="true"` on decorative icons, and focus-visible focus rings on custom interactive list items.
