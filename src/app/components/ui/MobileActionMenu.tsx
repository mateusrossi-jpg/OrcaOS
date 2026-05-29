import React from 'react';
import { Button } from './index';
import type { CompactActionItem } from '../CompactActionMenu';
import styles from './MobileActionMenu.module.css';
import { ActionSheet } from './ActionSheet';
import { MoreHorizontal } from 'lucide-react';

/**
 * Mobile‑only action menu: High-polish bottom sheet selector.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export function MobileActionMenu({
  items,
  label = 'Opções do Registro',
}: {
  items: CompactActionItem[];
  label?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <button 
        className={styles.trigger} 
        onClick={(e) => { e.stopPropagation(); setOpen(true); }} 
        aria-label="Abrir menu de ações"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      
      <ActionSheet isOpen={open} onClose={close} label={label}>
        <div className={styles.menu}>
          {items.map(it => (
            <Button
              key={it.id}
              variant={it.tone === 'danger' ? 'danger' : 'secondary'}
              onClick={(e) => { 
                e.stopPropagation();
                it.onSelect?.(); 
                close(); 
              }}
              className={styles.itemButton}
            >
              {it.label}
            </Button>
          ))}
        </div>
      </ActionSheet>
    </>
  );
}
