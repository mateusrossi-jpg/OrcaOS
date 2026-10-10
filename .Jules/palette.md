# Palette Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Accessible Overlay Semantics in Command Palettes
**Learning:** Command palettes styled with dark/glassmorphic backgrounds often lack dialog roles (`role="dialog"`, `aria-modal="true"`) and explicit `aria-label`s for icon-only clear buttons or inputs. Additionally, search result buttons need visible focus rings (`focus-visible:ring-2`) to support smooth keyboard navigation.
**Action:** Always ensure modal command palettes include proper dialog accessibility attributes, explicit input and button labels, and `focus-visible` ring indicators on all interactive result items.
