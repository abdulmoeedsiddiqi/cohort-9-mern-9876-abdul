import { AvatarMenu } from './AvatarMenu';
import { ThemeToggle } from './ThemeToggle';

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="topbar-logo">N</span>
        <span className="topbar-title">Notebook</span>
      </div>
      <div className="topbar-actions">
        <ThemeToggle />
        <AvatarMenu />
      </div>
    </header>
  );
}
