import { NavLink } from 'react-router-dom';

import { useNotes } from '../../hooks/useNotes';

function NavIcon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  all: 'M4 4h16v16H4z M8 8h8 M8 12h8 M8 16h5',
  pinned: 'M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.7L12 16.9 5.8 20.2l1.6-6.7L2.2 8.9l6.9-.6z',
  video: 'M15 8l6-3v14l-6-3M3 6h12v12H3z',
  trash: 'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13',
};

export function Sidebar() {
  const { data } = useNotes();
  const counts = data?.counts;

  const items = [
    { to: '/notes', label: 'All notes', count: counts?.all, icon: ICONS.all, end: true },
    { to: '/notes/pinned', label: 'Pinned', count: counts?.pinned, icon: ICONS.pinned, end: false },
    { to: '/notes/video', label: 'Video notes', count: counts?.video, icon: ICONS.video, end: false },
    { to: '/notes/trash', label: 'Trash', count: counts?.trash, icon: ICONS.trash, end: false },
  ];

  return (
    <nav className="sidebar" aria-label="Notes navigation">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        >
          <span className="sidebar-link-label">
            <NavIcon path={item.icon} />
            {item.label}
          </span>
          <span className="sidebar-count">{item.count ?? '–'}</span>
        </NavLink>
      ))}
    </nav>
  );
}
