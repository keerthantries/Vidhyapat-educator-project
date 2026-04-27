import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/auth/Login'
import Dashboard from '@/pages/dashboard/Dashboard'
import MainLayout from '@/layouts/MainLayout'
import Profile from '@/pages/profile/Profile'
import Batches from './pages/batches/batches'
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Protected routes wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/batches" element={<Batches />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
