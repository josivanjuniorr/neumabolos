import { useState, useEffect } from 'react'
import { useAuth, useForm } from '../hooks'
import { MainLayout, Card, Button, Table, Modal, Input, Select, Alert } from '../components'
import { productionService } from '../services/productionService'

export const Production = () => {
  const { user } = useAuth()
  const [production, setProduction] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduction, setEditingProduction] =
    useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    loadProduction()
  }, [user])

  const loadProduction = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const data =
        await productionService.getDailyProduction(user.id, today)
      setProduction(data || [])
    } catch (error) {
      console.error('Erro ao carregar produção:', error)
    } finally {
      setLoading(false)
    }
  }

  const initialValues = {
    production_date: editingProduction?.production_date || new Date().toISOString().split('T')[0],
    product_name: editingProduction?.product_name || '',
    quantity: editingProduction?.quantity || '',
    estimated_cost: editingProduction?.estimated_cost || '',
    destination: editingProduction?.destination || '',
    observations: editingProduction?.observations || '',
  }

  const { values, handleChange, handleSubmit, isSubmitting } =
    useForm(initialValues, onFormSubmit)

  async function onFormSubmit(formData) {
    try {
      setError('')
      
      // Converter campos numéricos
      const sanitizedData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        estimated_cost: parseFloat(formData.estimated_cost),
      }
      
      if (editingProduction) {
        await productionService.updateProduction(
          editingProduction.id,
          sanitizedData
        )
      } else {
        await productionService.createProduction(user.id, sanitizedData)
      }
      await loadProduction()
      setShowModal(false)
    } catch (err) {
      setError(err.message || 'Erro ao salvar produção')
    }
  }

  const handleAdd = () => {
    setEditingProduction(null)
    setShowModal(true)
  }

  const handleEdit = (prod) => {
    setEditingProduction(prod)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    try {
      await productionService.deleteProduction(id)
      await loadProduction()
    } catch (error) {
      console.error('Erro ao deletar produção:', error)
    }
  }

  const columns = [
    {
      key: 'production_date',
      label: 'Data',
      render: (value) =>
        new Date(value).toLocaleDateString('pt-BR'),
    },
    { key: 'product_name', label: 'Produto' },
    {
      key: 'quantity',
      label: 'Quantidade',
      render: (value) => value.toFixed(2),
    },
    {
      key: 'estimated_cost',
      label: 'Custo Estimado',
      render: (value) => `R$ ${value.toFixed(2)}`,
    },
    { key: 'destination', label: 'Destino' },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Controle de Produção
          </h1>
          <Button variant="primary" onClick={handleAdd}>
            + Nova Produção
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            data={production}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            editingProduction
              ? 'Editar Produção'
              : 'Nova Produção'
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
              label="Data da Produção"
              name="production_date"
              type="date"
              value={values.production_date}
              onChange={handleChange}
              required
            />

            <Input
              label="Nome do Produto"
              name="product_name"
              value={values.product_name}
              onChange={handleChange}
              required
            />

            <Input
              label="Quantidade"
              name="quantity"
              type="number"
              step="0.01"
              value={values.quantity}
              onChange={handleChange}
              required
            />

            <Input
              label="Custo Estimado"
              name="estimated_cost"
              type="number"
              step="0.01"
              value={values.estimated_cost}
              onChange={handleChange}
              required
            />

            <Select
              label="Destino"
              name="destination"
              value={values.destination}
              onChange={handleChange}
              options={[
                { value: 'venda', label: 'Venda' },
                { value: 'encomenda', label: 'Encomenda' },
                { value: 'pronta_entrega', label: 'Pronta Entrega' },
              ]}
              required
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
