import { memo } from 'react';
import { Menu, Bell } from 'lucide-react';
import './AppHeader.css';

type AppHeaderProps = {
  onMenuToggle: () => void;
};

export const AppHeader = memo(function AppHeader({ onMenuToggle }: AppHeaderProps) {
  return (
    <header className="app-header">
      <button className="menu-btn" onClick={onMenuToggle} aria-label="Open navigation menu">
        <Menu size={24} className="icon" />
      </button>
      <div className="flex items-center gap-2">
        <img src="/icons/aferix-wordmark-premium.svg" alt="Aferix" className="h-6 w-auto" />
      </div>
      <button className="notif-btn" aria-label="Notifications (coming soon)">
        <Bell size={24} className="icon" />
      </button>
    </header>
  );
});
