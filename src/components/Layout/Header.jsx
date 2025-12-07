import { useAuth, useTheme } from '../../hooks'
import { useEffect, useState } from 'react'
import { authService } from '../../services/authService'

const ROLES = {
  user: 'Usuário',
  manager: 'Gerente',
  admin: 'Administrador',
}

export const Header = () => {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (user) {
      authService.getUserProfile(user.id).then(setProfile)
    }
  }, [user])

  return (
    <header className="fixed top-0 right-0 left-64 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-6 z-40">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </h1>

        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Alternar tema"
          >
            {theme === 'light' ? (
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          <div className="text-right">
            <p className="font-medium text-gray-900 dark:text-white">
              {profile?.full_name || user?.email}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {ROLES[profile?.role] || 'Usuário'}
            </p>
          </div>
          <div className="w-10 h-10 bg-gray-900 dark:bg-gray-700 rounded-full flex items-center justify-center text-white font-bold">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          
          {/* Logout Button */}
          <button
            onClick={signOut}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            aria-label="Sair"
            title="Sair"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
