import { Navigate, Route, Routes } from 'react-router-dom';

import { AuthPage } from '../pages/AuthPage';
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
        <Route path="/notes" element={<ComingSoon title="All notes" />} />
      </Route>

      <Route path="*" element={<ComingSoon title="Not found" />} />
    </Routes>
  );
}
