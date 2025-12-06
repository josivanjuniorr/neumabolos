import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks'
import { Icon } from '../common'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { name: 'Insumos', href: '/ingredientes', icon: 'ingredients' },
  { name: 'Compras', href: '/compras', icon: 'purchases' },
  { name: 'Fornecedores', href: '/fornecedores', icon: 'suppliers' },
  { name: 'Clientes', href: '/clientes', icon: 'suppliers' },
  { name: 'Produção', href: '/producao', icon: 'production' },
  { name: 'Desperdício', href: '/desperdicio', icon: 'waste' },
  { name: 'Caixa', href: '/caixa', icon: 'cashFlow' },
  { name: 'Relatórios', href: '/relatorios', icon: 'reports' },
]

export const Sidebar = () => {
  const location = useLocation()
  const { signOut } = useAuth()

  const isActive = (href) => location.pathname === href

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl overflow-y-auto">
      <div className="p-6 border-b border-gray-700 bg-gray-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">ConfeitApp</h1>
            <p className="text-xs text-gray-400">Controle de Gastos</p>
          </div>
        </div>
      </div>

      <nav className="py-6 space-y-1 px-4">
        {navigation.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg
              transition-all duration-200
              ${
                isActive(item.href)
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }
            `}
          >
            <Icon name={item.icon} className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
        <button
          onClick={signOut}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg
            font-medium transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Icon name="logout" className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
