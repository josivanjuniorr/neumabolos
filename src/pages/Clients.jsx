import { useState, useEffect } from 'react'
import { useAuth, useForm } from '../hooks'
import { MainLayout, Card, Button, Table, Modal, Input, Alert } from '../components'
import { clientService } from '../services/clientService'

export const Clients = () => {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [error, setError] = useState('')

  const initialValues = {
    name: '',
    phone: '',
    email: '',
    address: '',
    observations: '',
  }

  const { values, handleChange, handleSubmit, isSubmitting, setFieldValue } =
    useForm(initialValues, onFormSubmit)

  useEffect(() => {
    if (!user) return
    loadClients()
  }, [user])

  useEffect(() => {
    if (editingClient) {
      setFieldValue('name', editingClient.name)
      setFieldValue('phone', editingClient.phone || '')
      setFieldValue('email', editingClient.email || '')
      setFieldValue('address', editingClient.address || '')
      setFieldValue('observations', editingClient.observations || '')
    } else {
      setFieldValue('name', '')
      setFieldValue('phone', '')
      setFieldValue('email', '')
      setFieldValue('address', '')
      setFieldValue('observations', '')
    }
  }, [editingClient, setFieldValue])

  const loadClients = async () => {
    try {
      setLoading(true)
      const data = await clientService.getClients(user.id)
      setClients(data || [])
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function onFormSubmit(formData) {
    try {
      setError('')

      if (editingClient) {
        await clientService.updateClient(editingClient.id, formData)
      } else {
        await clientService.createClient(user.id, formData)
      }
      await loadClients()
      setShowModal(false)
    } catch (err) {
      setError(err.message || 'Erro ao salvar cliente')
    }
  }

  const handleAdd = () => {
    setEditingClient(null)
    setShowModal(true)
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return

    try {
      await clientService.deleteClient(id)
      await loadClients()
    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
      alert('Erro ao deletar cliente. Pode haver encomendas associadas.')
    }
  }

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'phone', label: 'Telefone', render: (value) => value || '-' },
    { key: 'email', label: 'E-mail', render: (value) => value || '-' },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <Button variant="primary" onClick={handleAdd}>
            + Novo Cliente
          </Button>
        </div>

        {error && (
          <Alert variant="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Card>
          <Table
            columns={columns}
            data={clients}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome"
              name="name"
              value={values.name}
              onChange={handleChange}
              required
              placeholder="Nome completo do cliente"
            />

            <Input
              label="Telefone"
              name="phone"
              type="tel"
              value={values.phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
            />

            <Input
              label="E-mail"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              placeholder="cliente@email.com"
            />

            <Input
              label="Endereço"
              name="address"
              value={values.address}
              onChange={handleChange}
              placeholder="Rua, número, bairro, cidade"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                name="observations"
                value={values.observations}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Informações adicionais sobre o cliente"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
              >
                Salvar
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  )
}
