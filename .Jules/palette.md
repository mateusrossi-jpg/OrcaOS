## 2025-05-18 - ARIA Attributes on Command Palette & Universal Search

**Learning:** Overlay command palettes and custom search components using icon-only clear buttons often lack screen reader accessibility markers (`role="dialog"`, `aria-modal="true"`, and explicit `aria-label` descriptors).
**Action:** Always ensure modal overlays present proper dialog roles, inputs feature descriptive `aria-label` attributes, and icon-only reset buttons include `aria-label="Limpar busca"`.
