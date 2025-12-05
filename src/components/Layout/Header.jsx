import { useAuth } from '../../hooks'
import { useEffect, useState } from 'react'
import { authService } from '../../services/authService'

export const Header = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (user) {
      authService.getUserProfile(user.id).then(setProfile)
    }
  }, [user])

  return (
    <header className="fixed top-0 right-0 left-64 bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-6 z-40">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-xl font-semibold text-gray-900">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </h1>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium text-gray-900">
              {profile?.full_name || user?.email}
            </p>
            <p className="text-sm text-gray-500">
              {profile?.role || 'Usuário'}
            </p>
          </div>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}
