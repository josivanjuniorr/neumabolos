import { useState, useEffect } from 'react'
import { useAuth } from '../hooks'
import { MainLayout, Card, Button, Table, Modal, Select, Alert } from '../components'
import { authService } from '../services/authService'

const ROLES = {
  user: 'Usuário',
  manager: 'Gerente',
  admin: 'Administrador',
}

export const Users = () => {
  const { user, refreshProfile } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState('user')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await authService.getAllUsers()
      setUsers(data || [])
    } catch (err) {
      console.error('Erro ao carregar usuários:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (userToEdit) => {
    setEditingUser(userToEdit)
    setSelectedRole(userToEdit.role || 'user')
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      await authService.updateUserProfile(editingUser.id, {
        role: selectedRole,
      })

      setSuccess('Cargo atualizado com sucesso!')
      await loadUsers()
      refreshProfile() // Atualiza perfil em todo sistema se for o próprio usuário
      setShowModal(false)
      setEditingUser(null)
    } catch (err) {
      setError(err.message || 'Erro ao atualizar cargo')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'full_name',
      label: 'Nome',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {value || 'Sem nome'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Cargo',
      render: (value) => (
        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
          value === 'admin' 
            ? 'bg-gray-800 dark:bg-gray-700 text-white'
            : value === 'manager'
            ? 'bg-gray-600 dark:bg-gray-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300'
        }`}>
          {ROLES[value] || 'Usuário'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Cadastro',
      render: (value) => new Date(value).toLocaleDateString('pt-BR'),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, row) => (
        <Button
          onClick={() => handleEdit(row)}
          variant="secondary"
          size="sm"
          disabled={row.id === user.id}
        >
          Alterar Cargo
        </Button>
      ),
    },
  ]

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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gerenciar Usuários
          </h1>
        </div>

        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess('')}
          />
        )}

        <Card title={`Total de Usuários: ${users.length}`}>
          <Table
            columns={columns}
            data={users}
            emptyMessage="Nenhum usuário encontrado"
          />
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setEditingUser(null)
            setError('')
          }}
          title="Alterar Cargo do Usuário"
        >
          <div className="space-y-4">
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError('')}
              />
            )}

            {editingUser && (
              <>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Usuário
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {editingUser.full_name || 'Sem nome'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {editingUser.email}
                  </p>
                </div>

                <Select
                  label="Novo Cargo"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  options={[
                    { value: 'user', label: 'Usuário' },
                    { value: 'manager', label: 'Gerente' },
                    { value: 'admin', label: 'Administrador' },
                  ]}
                />

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Permissões por cargo:
                  </p>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• <strong>Usuário:</strong> Acesso básico ao sistema</li>
                    <li>• <strong>Gerente:</strong> Visualizar relatórios e auditorias</li>
                    <li>• <strong>Administrador:</strong> Acesso total + gerenciar usuários</li>
                  </ul>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowModal(false)
                      setEditingUser(null)
                      setError('')
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    isLoading={saving}
                  >
                    Salvar
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      </div>
    </MainLayout>
  )
}
