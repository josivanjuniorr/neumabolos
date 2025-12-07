import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks'
import {
  Login,
  Signup,
  Dashboard,
  IngredientsList,
  PurchasesList,
  Suppliers,
  Clients,
  Production,
  Waste,
  CashFlow,
  Reports,
  Audit,
} from './pages'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Rotas protegidas */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ingredientes"
        element={
          <ProtectedRoute>
            <IngredientsList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/compras"
        element={
          <ProtectedRoute>
            <PurchasesList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/fornecedores"
        element={
          <ProtectedRoute>
            <Suppliers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        }
      />

      <Route
        path="/producao"
        element={
          <ProtectedRoute>
            <Production />
          </ProtectedRoute>
        }
      />

      <Route
        path="/desperdicio"
        element={
          <ProtectedRoute>
            <Waste />
          </ProtectedRoute>
        }
      />

      <Route
        path="/caixa"
        element={
          <ProtectedRoute>
            <CashFlow />
          </ProtectedRoute>
        }
      />

      <Route
        path="/relatorios"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/auditoria"
        element={
          <ProtectedRoute>
            <Audit />
          </ProtectedRoute>
        }
      />

      {/* Redirect padrão */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Router basename="/neumabolos">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}
