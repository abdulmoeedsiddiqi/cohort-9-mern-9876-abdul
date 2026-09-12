import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function AvatarMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return null;
  }

  async function handleLogout() {
    setIsOpen(false);
    await logout();
    navigate('/login');
  }

  return (
    <div className="avatar-menu">
      <button
        type="button"
        className="avatar-button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {getInitials(user.name)}
      </button>

      {isOpen && (
        <div className="avatar-dropdown" role="menu">
          <p className="avatar-dropdown-name">{user.name}</p>
          <p className="avatar-dropdown-email">{user.email}</p>
          <button type="button" role="menuitem" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
