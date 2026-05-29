import { ReactNode } from 'react';
import { Overlay } from './Overlay';
import sheetStyles from './OverlayTokens.module.css';
import styles from './MobileActionMenu.module.css';
import { cn } from '../../../utils/ui';

/**
 * ActionSheet: Mobile‑first bottom sheet primitive.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
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
        className={cn(sheetStyles.sheet, sheetStyles.sheetScaleIn)}
        onClick={(e) => e.stopPropagation()}
      >
        {label && <h3 className={styles.title}>{label}</h3>}
        {children}
      </div>
    </Overlay>
  );
}
