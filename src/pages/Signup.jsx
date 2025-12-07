import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks'
import { Button, Input, Alert } from '../components/common'

export const Signup = () => {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não correspondem')
      return
    }

    setLoading(true)

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.fullName
      )
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-900 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
            🍰 ConfeitApp
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Criar Nova Conta
          </p>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
            className="mb-4"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome Completo"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="João Silva"
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            required
          />

          <Input
            label="Senha"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <Input
            label="Confirmar Senha"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={loading}
          >
            Criar Conta
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Faça login
          </Link>
        </div>
      </div>
    </div>
  )
}
