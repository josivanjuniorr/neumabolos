import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks'
import { MainLayout, Card, Button, Table, Input, Modal } from '../../components'
import { ingredientService } from '../../services/ingredientService'
import { IngredientForm } from './IngredientForm'

export const IngredientsList = () => {
  const { user } = useAuth()
  const [ingredients, setIngredients] = useState([])
  const [filteredIngredients, setFilteredIngredients] =
    useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingIngredient, setEditingIngredient] =
    useState(null)

  useEffect(() => {
    if (!user) return
    loadIngredients()
  }, [user])

  useEffect(() => {
    const filtered = ingredients.filter(
      (ingredient) =>
        ingredient.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        ingredient.category?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
    setFilteredIngredients(filtered)
  }, [searchTerm, ingredients])

  const loadIngredients = async () => {
    try {
      setLoading(true)
      const data = await ingredientService.getIngredients(
        user.id
      )
      setIngredients(data || [])
    } catch (error) {
      console.error('Erro ao carregar insumos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingIngredient(null)
    setShowModal(true)
  }

  const handleEdit = (ingredient) => {
    setEditingIngredient(ingredient)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    try {
      await ingredientService.deleteIngredient(id)
      await loadIngredients()
    } catch (error) {
      console.error('Erro ao deletar insumo:', error)
    }
  }

  const handleSubmit = async () => {
    await loadIngredients()
    setShowModal(false)
  }

  const columns = [
    { key: 'name', label: 'Nome' },
    {
      key: 'category',
      label: 'Categoria',
      render: (value) => value?.name || '-',
    },
    { key: 'unit_measure', label: 'Unidade' },
    {
      key: 'unit_cost',
      label: 'Custo Unitário',
      render: (value) => `R$ ${value.toFixed(2)}`,
    },
    {
      key: 'supplier',
      label: 'Fornecedor',
      render: (value) => value?.name || 'Sem fornecedor',
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Insumos
          </h1>
          <Button
            variant="primary"
            onClick={handleAdd}
          >
            + Novo Insumo
          </Button>
        </div>

        <Card>
          <Input
            placeholder="Pesquisar insumos..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="mb-4"
          />
          <Table
            columns={columns}
            data={filteredIngredients}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            editingIngredient
              ? 'Editar Insumo'
              : 'Novo Insumo'
          }
          size="lg"
        >
          <IngredientForm
            ingredient={editingIngredient}
            onSuccess={handleSubmit}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      </div>
    </MainLayout>
  )
}
