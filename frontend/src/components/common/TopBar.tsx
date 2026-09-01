import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { AvatarMenu } from './AvatarMenu';
import { ThemeToggle } from './ThemeToggle';

const STATIC_NOTES_ROUTES = ['/notes/pinned', '/notes/video', '/notes/trash'];

function isEditorRoute(pathname: string): boolean {
  return pathname.startsWith('/notes/') && !STATIC_NOTES_ROUTES.includes(pathname);
}

export function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isEditorRoute(location.pathname)) {
    return null;
  }

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
