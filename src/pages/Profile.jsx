import { useState, useEffect } from 'react'
import { useAuth } from '../hooks'
import { MainLayout, Card, Input, Button, Alert, Select } from '../components'
import { authService } from '../services/authService'

const ROLES = {
  user: 'Usuário',
  manager: 'Gerente',
  admin: 'Administrador',
}

export const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'user',
  })

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await authService.getUserProfile(user.id)
      setProfile(data)
      setFormData({
        full_name: data.full_name || '',
        email: data.email || user.email,
        role: data.role || 'user',
      })
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const updates = { full_name: formData.full_name }
      
      // Apenas admin pode alterar cargo
      if (profile?.role === 'admin') {
        updates.role = formData.role
      }

      await authService.updateUserProfile(user.id, updates)

      setSuccess('Perfil atualizado com sucesso!')
      await loadProfile()
    } catch (err) {
      setError(err.message || 'Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Meu Perfil
        </h1>

        <div className="max-w-2xl">
          <Card title="Informações do Usuário">
            <form onSubmit={handleSubmit} className="space-y-4">
              {success && (
                <Alert
                  type="success"
                  message={success}
                  onClose={() => setSuccess('')}
                />
              )}

              {error && (
                <Alert
                  type="error"
                  message={error}
                  onClose={() => setError('')}
                />
              )}

              <Input
                label="Nome Completo"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Digite seu nome completo"
                required
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                helperText="O email não pode ser alterado"
              />

              {profile?.role === 'admin' && (
                <Select
                  label="Cargo"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  options={[
                    { value: 'user', label: 'Usuário' },
                    { value: 'manager', label: 'Gerente' },
                    { value: 'admin', label: 'Administrador' },
                  ]}
                  helperText="Apenas administradores podem alterar o cargo"
                />
              )}

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={saving}
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </Card>

          <Card title="Informações da Conta" className="mt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Função
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {ROLES[profile?.role] || 'Usuário'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Conta criada em
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(profile?.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Última atualização
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(profile?.updated_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
