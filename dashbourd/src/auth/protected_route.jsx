import { Navigate } from 'react-router-dom'
import { useAuth } from './auth_context'

export function ProtectedRoute({ children }) {
  const { isAuthed } = useAuth()
  if (!isAuthed) return <Navigate to="/login" replace />
  return children
}

