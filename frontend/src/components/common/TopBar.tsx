import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { AvatarMenu } from './AvatarMenu';
import { ThemeToggle } from './ThemeToggle';

export function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="topbar-logo">N</span>
        <span className="topbar-title">Notebook</span>
      </div>

      {user && (
        <div className="topbar-search">
          <input
            type="search"
            placeholder="Search notes…"
            disabled
            aria-label="Search notes (coming soon)"
          />
        </div>
      )}

      <div className="topbar-actions">
        {user && (
          <button type="button" className="topbar-new-note" onClick={() => navigate('/notes/new')}>
            + New note
          </button>
        )}
        <ThemeToggle />
        <AvatarMenu />
      </div>
    </header>
  );
}
