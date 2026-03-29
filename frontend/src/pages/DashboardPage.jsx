// Dashboard Page - Routes to appropriate dashboard based on role
import { useAuthStore } from '../store/authStore'
import { Navigate } from 'react-router-dom'
import ClientDashboard from '../components/dashboard/ClientDashboard'
import TrainerDashboard from '../components/dashboard/TrainerDashboard'
import AdminDashboard from './admin/AdminDashboard'
import { usePageTitle } from '../hooks/usePageTitle'

export default function DashboardPage() {
  usePageTitle('Dashboard')
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Route to appropriate dashboard
  if (user.is_admin || user.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  if (user.role === 'trainer') {
    return <TrainerDashboard />
  }

  if (user.role === 'client') {
    return <ClientDashboard />
  }

  return <Navigate to="/" replace />
}
