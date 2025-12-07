import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks'
import { authService } from '../services/authService'

// Permissões por cargo
const PERMISSIONS = {
  user: ['/ingredientes', '/compras', '/fornecedores', '/clientes', '/producao', '/perfil'],
  manager: ['/dashboard', '/ingredientes', '/compras', '/fornecedores', '/clientes', '/producao', '/caixa', '/perfil'],
  admin: [
    '/dashboard',
    '/ingredientes',
    '/compras',
    '/fornecedores',
    '/clientes',
    '/producao',
    '/desperdicio',
    '/caixa',
    '/relatorios',
    '/auditoria',
    '/usuarios',
    '/perfil',
  ],
}

export const RoleProtectedRoute = ({ children, requiredPath }) => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      authService.getUserProfile(user.id).then((data) => {
        setProfile(data)
        setLoading(false)
      }).catch(() => {
        setLoading(false)
      })
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  const userRole = profile?.role || 'user'
  const allowedPaths = PERMISSIONS[userRole] || PERMISSIONS.user
  const hasPermission = allowedPaths.includes(requiredPath)

  console.log('RoleProtectedRoute - Role:', userRole, 'Path:', requiredPath, 'Has permission:', hasPermission)

  if (!hasPermission) {
    // Redirecionar para a primeira página permitida
    const defaultPath = allowedPaths[0] || '/perfil'
    return <Navigate to={defaultPath} replace />
  }

  return children
}
