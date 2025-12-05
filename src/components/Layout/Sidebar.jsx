import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Insumos', href: '/ingredientes', icon: '🛒' },
  { name: 'Compras', href: '/compras', icon: '💳' },
  { name: 'Fornecedores', href: '/fornecedores', icon: '🏢' },
  { name: 'Produção', href: '/producao', icon: '⚙️' },
  { name: 'Desperdício', href: '/desperdicio', icon: '⚠️' },
  { name: 'Despesas Operacionais', href: '/despesas-operacionais', icon: '📄' },
  { name: 'Caixa', href: '/caixa', icon: '💰' },
  { name: 'Relatórios', href: '/relatorios', icon: '📄' },
]

export const Sidebar = () => {
  const location = useLocation()
  const { signOut } = useAuth()

  const isActive = (href) => location.pathname === href

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white shadow-lg overflow-y-auto">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🍰 ConfeitApp
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Controle de Gastos
        </p>
      </div>

      <nav className="py-6 space-y-1 px-4">
        {navigation.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg
              transition-colors duration-200
              ${
                isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }
            `}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
        <button
          onClick={signOut}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg
            font-medium transition-colors duration-200"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
