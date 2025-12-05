import { useState, useEffect } from 'react'
import { useAuth, useForm } from '../hooks'
import { MainLayout, Card, Button, Table, Modal, Input, Select, Alert } from '../components'
import { wasteService } from '../services/wasteService'

export const Waste = () => {
  const { user } = useAuth()
  const [waste, setWaste] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingWaste, setEditingWaste] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    loadWaste()
  }, [user])

  const loadWaste = async () => {
    try {
      setLoading(true)
      const data = await wasteService.getWaste(user.id)
      setWaste(data || [])
    } catch (error) {
      console.error('Erro ao carregar desperdício:', error)
    } finally {
      setLoading(false)
    }
  }

  const initialValues = {
    waste_date: editingWaste?.waste_date || new Date().toISOString().split('T')[0],
    product_name: editingWaste?.product_name || '',
    quantity: editingWaste?.quantity || '',
    waste_type: editingWaste?.waste_type || '',
    estimated_cost: editingWaste?.estimated_cost || '',
    responsible: editingWaste?.responsible || '',
    observations: editingWaste?.observations || '',
  }

  const { values, handleChange, handleSubmit, isSubmitting } =
    useForm(initialValues, onFormSubmit)

  async function onFormSubmit(formData) {
    try {
      setError('')
      if (editingWaste) {
        await wasteService.updateWaste(editingWaste.id, formData)
      } else {
        await wasteService.createWaste(user.id, formData)
      }
      await loadWaste()
      setShowModal(false)
    } catch (err) {
      setError(err.message || 'Erro ao salvar desperdício')
    }
  }

  const handleAdd = () => {
    setEditingWaste(null)
    setShowModal(true)
  }

  const handleEdit = (w) => {
    setEditingWaste(w)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    try {
      await wasteService.deleteWaste(id)
      await loadWaste()
    } catch (error) {
      console.error('Erro ao deletar desperdício:', error)
    }
  }

  const columns = [
    {
      key: 'waste_date',
      label: 'Data',
      render: (value) =>
        new Date(value).toLocaleDateString('pt-BR'),
    },
    { key: 'product_name', label: 'Produto' },
    {
      key: 'quantity',
      label: 'Quantidade',
      render: (value) => value.toFixed(3),
    },
    { key: 'waste_type', label: 'Tipo' },
    {
      key: 'estimated_cost',
      label: 'Custo',
      render: (value) => `R$ ${value.toFixed(2)}`,
    },
    { key: 'responsible', label: 'Responsável' },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Análise de Desperdício
          </h1>
          <Button variant="primary" onClick={handleAdd}>
            + Registrar Desperdício
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            data={waste}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            editingWaste
              ? 'Editar Desperdício'
              : 'Registrar Desperdício'
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
              label="Data"
              name="waste_date"
              type="date"
              value={values.waste_date}
              onChange={handleChange}
              required
            />

            <Input
              label="Produto"
              name="product_name"
              value={values.product_name}
              onChange={handleChange}
              required
            />

            <Input
              label="Quantidade"
              name="quantity"
              type="number"
              step="0.001"
              value={values.quantity}
              onChange={handleChange}
              required
            />

            <Select
              label="Tipo de Desperdício"
              name="waste_type"
              value={values.waste_type}
              onChange={handleChange}
              options={[
                { value: 'vencimento', label: 'Vencimento' },
                { value: 'quebra', label: 'Quebra/Dano' },
                { value: 'descarte', label: 'Descarte' },
                { value: 'erro', label: 'Erro de Produção' },
              ]}
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

            <Input
              label="Responsável"
              name="responsible"
              value={values.responsible}
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
