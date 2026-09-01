import { Navigate, Route, Routes } from 'react-router-dom';

import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AuthPage } from '../pages/AuthPage';
import { NotesPage } from '../pages/NotesPage';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="coming-soon">
      <h1>{title}</h1>
      <p>This screen is under construction.</p>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/notes/pinned" element={<ComingSoon title="Pinned" />} />
          <Route path="/notes/video" element={<ComingSoon title="Video notes" />} />
          <Route path="/notes/trash" element={<ComingSoon title="Trash" />} />
          <Route path="/notes/new" element={<ComingSoon title="New note" />} />
          <Route path="/notes/:id" element={<ComingSoon title="Note" />} />
        </Route>
      </Route>

      <Route path="*" element={<ComingSoon title="Not found" />} />
    </Routes>
  );
}
