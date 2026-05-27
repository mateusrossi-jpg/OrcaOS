import { useState } from 'react';
import './CompactActionMenu.css';

export interface CompactActionItem {
  id: string;
  label: string;
  tone?: 'default' | 'danger';
  onSelect: () => void | Promise<void>;
}

export function CompactActionMenu({
  label = 'Ações rápidas',
  items,
  align = 'right',
}: {
  label?: string;
  align?: 'left' | 'right';
  items: CompactActionItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="compact-action-menu">
      <button
        type="button"
        className="ghost-action compact-row-action compact-action-menu-trigger"
        aria-label={label}
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((current) => !current);
        }}
      >
        ⋮
      </button>

      {isOpen && (
        <div className={`compact-action-menu-popover align-${align}`}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`secondary-action inline-action compact-action-menu-item ${item.tone === 'danger' ? 'danger' : ''}`}
              onClick={async () => {
                await item.onSelect();
                setIsOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
