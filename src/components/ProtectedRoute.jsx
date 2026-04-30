import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PageState from './PageState.jsx';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading, sessionExpired } = useAuth();

  if (isLoading) {
    return (
      <PageState
        title="Loading your account"
        message="We're opening your workspace now."
      />
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      replace
      state={
        sessionExpired
          ? {
              message: 'Your session expired. Please log in again.',
            }
          : undefined
      }
    />
  );
}
