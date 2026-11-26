import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ReaderPage from "./pages/ReaderPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";

function RouteGuard({ requireAuth, redirectTo, children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-serif text-lg text-ink-muted">Loading Folio...</p>
      </div>
    );
  }

  const isAllowed = requireAuth ? isAuthenticated : !isAuthenticated;
  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RouteGuard requireAuth redirectTo="/login">
            <DashboardPage />
          </RouteGuard>
        }
      />
      <Route
        path="/read/:bookId"
        element={
          <RouteGuard requireAuth redirectTo="/login">
            <ReaderPage />
          </RouteGuard>
        }
      />
      <Route
        path="/login"
        element={
          <RouteGuard requireAuth={false} redirectTo="/">
            <LoginPage />
          </RouteGuard>
        }
      />
      <Route
        path="/register"
        element={
          <RouteGuard requireAuth={false} redirectTo="/">
            <RegisterPage />
          </RouteGuard>
        }
      />
      <Route
        path="/verify-email"
        element={
          <RouteGuard requireAuth={false} redirectTo="/">
            <VerifyEmailPage />
          </RouteGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}