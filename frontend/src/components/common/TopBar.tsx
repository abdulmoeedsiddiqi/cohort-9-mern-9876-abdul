import { ThemeToggle } from './ThemeToggle';

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="topbar-logo">N</span>
        <span className="topbar-title">Notebook</span>
      </div>
      <ThemeToggle />
    </header>
  );
}
