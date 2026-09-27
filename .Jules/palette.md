# Palette's Journal - Critical Learnings

## 2026-09-27 - Accessible Proposal Cart Tabs & Controls
**Learning:** Custom tablists and icon-only buttons in complex modal workspaces (such as commercial proposal builders) require explicit `role="tab"`, `aria-selected`, descriptive `aria-label`, and `focus-visible` ring indicators to maintain usability for screen readers and keyboard navigation.
**Action:** Always verify custom tab switchers and icon-only delete buttons in workspace modules have proper ARIA attributes and focus ring indicators.
