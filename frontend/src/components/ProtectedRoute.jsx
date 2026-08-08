import { Navigate, Outlet, useLocation } from 'react-router-dom';

// Guards every /dashboard, /resume/*, /opportunities, etc. route. Without
// this, visiting a protected URL with no token used to fire the dashboard's
// API call anyway, which came back 401 and either spun forever or showed
// "Couldn't load your dashboard" - confusing either way. Now it redirects
// straight to /login before any API call happens, and remembers where you
// were trying to go so you land back there after signing in.
export default function ProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
