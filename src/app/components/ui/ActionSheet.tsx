import React, { ReactNode } from 'react';
import { Overlay } from './Overlay';
import sheetStyles from './OverlayTokens.module.css';
import styles from './MobileActionMenu.module.css'; // for title and menu styling

/** Mobile‑only action sheet (bottom sheet) using the shared Overlay system.
 * It renders its children inside a centered sheet with standardized styling.
 */
export function ActionSheet({
  isOpen,
  onClose,
  label,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  label?: string;
  children: ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <Overlay isOpen={isOpen} onClose={onClose}>
      <div
        className={sheetStyles.sheet + ' ' + sheetStyles.sheetScaleIn}
        onClick={(e) => e.stopPropagation()}
      >
        {label && <h3 className={styles.title}>{label}</h3>}
        <div className={styles.menu}>{children}</div>
      </div>
    </Overlay>
  );
}
