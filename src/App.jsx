/**
 * App.jsx — Root Router
 * Location: src/App.jsx
 *
 * Routes:
 *   /login         → Login
 *   /signup        → Signup
 *   /onboarding    → Post-signup educator setup wizard (protected)
 *   /dashboard     → Dashboard (protected)
 *   /batches       → Batches (protected)
 *   /courses       → My Courses (protected)
 *   /profile       → Profile (protected)
 *   *              → redirect to /login
 *
 * OnboardingGuard: redirects to /onboarding after signup
 * if the educator has not yet completed their profile.
 * Signup.jsx sets localStorage flag 'onboarding_pending' = '1'
 * which this guard reads on first entry.
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/Signup'
import Onboarding from '@/pages/onboarding/Onboarding'
import Dashboard from '@/pages/dashboard/Dashboard'
import MainLayout from '@/layouts/MainLayout'
import Profile from '@/pages/profile/Profile'
import Batches from '@/pages/batches/batches'
import CreateBatch from '@/pages/batches/CreateBatch'
import Courses from '@/pages/courses/Courses'
import { isAuthenticated } from '@/utils/auth.utils'

/* ── Auth guard ───────────────────────────────── */
function PrivateRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Post-signup onboarding — protected but outside MainLayout */}
      <Route path="/onboarding" element={
        <PrivateRoute><Onboarding /></PrivateRoute>
      } />

      {/* Protected — inside sidebar layout */}
      <Route element={
        <PrivateRoute><MainLayout /></PrivateRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/batches">
          <Route index element={<Batches />} />
          <Route path="create-new" element={<CreateBatch />} />
        </Route>
        <Route path="/courses" element={<Courses />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}