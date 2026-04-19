// function ProtectedRoute
import { AuthProvider } from "./hooks/AuthContext.tsx";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell.tsx";
import HomePage from "./pages/HomePage.tsx";
import TimelinePage from "./pages/TimelinePage.tsx";
import ApiDocsPage from "./pages/ApiDocsPage.tsx";
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";

/*function ProtectedRoute({ children }: { children: JSX.Element }): JSX.Element {
  const { user, loading } = useAuth();

  // If still checking the token with the backend, show nothing or a spinner
  if (loading) {
    return <div>Loading session...</div>;
  }

  // Once loading is false, if no user was found, send to login
  return user ? children : <Navigate to="/login" replace />;
}*/

// app routes
function AppRoutes(): JSX.Element {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

      {/* protected routes */}
      <Route
        path="/"
        element={
          /*<ProtectedRoute>*/
          <AppShell />
          /*</ProtectedRoute>*/
        }
      >
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<HomePage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="api-docs" element={<ApiDocsPage />} />
      </Route>

      {/* catch-all */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default function App(): JSX.Element {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
