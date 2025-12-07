import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, ThemeProvider, useAuth } from './hooks'
import { RoleProtectedRoute } from './components'
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
  Profile,
  Users,
} from './pages'

const ProtectedRoute = ({ children, requiredPath }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return requiredPath ? (
    <RoleProtectedRoute requiredPath={requiredPath}>
      {children}
    </RoleProtectedRoute>
  ) : children
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
          <ProtectedRoute requiredPath="/dashboard">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ingredientes"
        element={
          <ProtectedRoute requiredPath="/ingredientes">
            <IngredientsList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/compras"
        element={
          <ProtectedRoute requiredPath="/compras">
            <PurchasesList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/fornecedores"
        element={
          <ProtectedRoute requiredPath="/fornecedores">
            <Suppliers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clientes"
        element={
          <ProtectedRoute requiredPath="/clientes">
            <Clients />
          </ProtectedRoute>
        }
      />

      <Route
        path="/producao"
        element={
          <ProtectedRoute requiredPath="/producao">
            <Production />
          </ProtectedRoute>
        }
      />

      <Route
        path="/desperdicio"
        element={
          <ProtectedRoute requiredPath="/desperdicio">
            <Waste />
          </ProtectedRoute>
        }
      />

      <Route
        path="/caixa"
        element={
          <ProtectedRoute requiredPath="/caixa">
            <CashFlow />
          </ProtectedRoute>
        }
      />

      <Route
        path="/relatorios"
        element={
          <ProtectedRoute requiredPath="/relatorios">
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/auditoria"
        element={
          <ProtectedRoute requiredPath="/auditoria">
            <Audit />
          </ProtectedRoute>
        }
      />

      <Route
        path="/perfil"
        element={
          <ProtectedRoute requiredPath="/perfil">
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/usuarios"
        element={
          <ProtectedRoute requiredPath="/usuarios">
            <Users />
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
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}
