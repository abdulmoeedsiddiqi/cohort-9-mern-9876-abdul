import { Navigate, Route, Routes } from 'react-router-dom';

import { AuthPage } from '../pages/AuthPage';

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
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/notes" element={<ComingSoon title="All notes" />} />
      <Route path="*" element={<ComingSoon title="Not found" />} />
    </Routes>
  );
}
