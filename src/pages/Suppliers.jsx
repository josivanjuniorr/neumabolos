import { useState, useEffect } from 'react'
import { useAuth, useForm } from '../hooks'
import { MainLayout, Card, Button, Table, Modal, Input, Alert } from '../components'
import { supplierService } from '../services/supplierService'

export const Suppliers = () => {
  const { user } = useAuth()
  const [suppliers, setSupplers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    loadSuppliers()
  }, [user])

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      const data = await supplierService.getSuppliers(user.id)
      setSupplers(data || [])
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error)
    } finally {
      setLoading(false)
    }
  }

  const initialValues = {
    name: editingSupplier?.name || '',
    phone: editingSupplier?.phone || '',
    cnpj_cpf: editingSupplier?.cnpj_cpf || '',
    products_supplied: editingSupplier?.products_supplied || '',
    nota_avaliacao: editingSupplier?.rating || '',
    observations: editingSupplier?.observations || '',
  }

  const { values, handleChange, handleSubmit, isSubmitting } =
    useForm(initialValues, onFormSubmit)

  async function onFormSubmit(formData) {
    try {
      setError('')
      if (editingSupplier) {
        await supplierService.updateSupplier(
          editingSupplier.id,
          formData
        )
      } else {
        await supplierService.createSupplier(user.id, formData)
      }
      await loadSuppliers()
      setShowModal(false)
    } catch (err) {
      setError(err.message || 'Erro ao salvar fornecedor')
    }
  }

  const handleAdd = () => {
    setEditingSupplier(null)
    setShowModal(true)
  }

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    try {
      await supplierService.deleteSupplier(id)
      await loadSuppliers()
    } catch (error) {
      console.error('Erro ao deletar fornecedor:', error)
    }
  }

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'phone', label: 'Telefone' },
    { key: 'cnpj_cpf', label: 'CNPJ/CPF' },
    { key: 'products_supplied', label: 'Produtos' },
    {
      key: 'rating',
      label: 'Avaliação',
      render: (value) => (value ? `⭐ ${value}` : '-'),
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Fornecedores
          </h1>
          <Button variant="primary" onClick={handleAdd}>
            + Novo Fornecedor
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            data={suppliers}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            editingSupplier
              ? 'Editar Fornecedor'
              : 'Novo Fornecedor'
          }
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError('')}
              />
            )}

            <Input
              label="Nome"
              name="name"
              value={values.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Telefone"
              name="phone"
              value={values.phone}
              onChange={handleChange}
            />

            <Input
              label="CNPJ/CPF"
              name="cnpj_cpf"
              value={values.cnpj_cpf}
              onChange={handleChange}
            />

            <Input
              label="Produtos Fornecidos"
              name="products_supplied"
              value={values.products_supplied}
              onChange={handleChange}
            />

            <Input
              label="Avaliação"
              name="nota_avaliacao"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={values.nota_avaliacao}
              onChange={handleChange}
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
