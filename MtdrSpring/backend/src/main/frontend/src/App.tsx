import { type JSX } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/AuthContext'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import TimelinePage from './pages/TimelinePage'
import ApiDocsPage from './pages/ApiDocsPage'
import AppShell from './components/layout/AppShell'


// function ProtectedRoute 
function ProtectedRoute({ children }: { children: JSX.Element }): JSX.Element {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

// app routes
function AppRoutes(): JSX.Element {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
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
  )
}

export default function App(): JSX.Element {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
