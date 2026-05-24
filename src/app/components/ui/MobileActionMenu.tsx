import React from 'react';
import { SecondaryButton } from './index';
import type { CompactActionItem } from './index';
import styles from './MobileActionMenu.module.css';

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
  const [open, setOpen] = React.useState(true);

  const close = () => setOpen(false);

  return (
    open && (
      <div className={styles.overlay} onClick={close}>
        <div className={styles.sheet} onClick={e => e.stopPropagation()}>
          {label && <h3 className={styles.title}>{label}</h3>}
          <div className={styles.menu}>
            {items.map(it => (
              <SecondaryButton
                key={it.id}
                onClick={() => {
                  it.onSelect?.();
                  close();
                }}
                className={styles.itemButton}
                tone={it.tone}
              >
                {it.label}
              </SecondaryButton>
            ))}
          </div>
        </div>
      </div>
    )
  );
}
