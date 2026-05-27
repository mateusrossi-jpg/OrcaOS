import React from 'react';
import { SecondaryButton } from './index';
import type { CompactActionItem } from '../CompactActionMenu';
import styles from './MobileActionMenu.module.css';
import { ActionSheet } from './ActionSheet';

/**
 * Mobile‑only action menu displayed as a small bottom sheet.
 * It receives the same `items` shape as `CompactActionMenu`.
 */
export function MobileActionMenu({
  items,
  label = '',
}: {
  items: CompactActionItem[];
  label?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const close = () => setOpen(false);

  return (
    <>
      {/* Trigger button */}
      <button className={styles.trigger} onClick={(e) => { e.stopPropagation(); setOpen(true); }} aria-label="Open action menu">⋮</button>
      <ActionSheet isOpen={open} onClose={close} label={label}>
        {items.map(it => (
          <SecondaryButton
            key={it.id}
            onClick={() => { it.onSelect?.(); close(); }}
            className={styles.itemButton}
          >
            {it.label}
          </SecondaryButton>
        ))}
      </ActionSheet>
    </>
  );
}
