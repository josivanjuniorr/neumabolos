import { useState, useEffect } from 'react'
import { useAuth, useForm } from '../../hooks'
import { Button, Input, Select, Alert } from '../../components/common'
import { ingredientService } from '../../services/ingredientService'
import { supplierService } from '../../services/supplierService'

export const IngredientForm = ({
  ingredient,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')

  const initialValues = {
    name: ingredient?.name || '',
    category_id: ingredient?.category_id || '',
    unit_measure: ingredient?.unit_measure || '',
    unit_cost: ingredient?.unit_cost || '',
    supplier_id: ingredient?.supplier_id || '',
    observations: ingredient?.observations || '',
  }

  const { values, handleChange, handleSubmit, isSubmitting } =
    useForm(initialValues, onFormSubmit)

  useEffect(() => {
    if (!user) return
    loadSuppliers()
    loadCategories()
  }, [user])

  const loadSuppliers = async () => {
    try {
      const data = await supplierService.getSuppliers(
        user.id
      )
      setSuppliers(data || [])
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error)
    }
  }

  const loadCategories = async () => {
    // Você precisará criar um serviço de categorias
    // Por enquanto, vou usar uma lista padrão
    setCategories([
      { id: '1', name: 'Farinha e Açúcar' },
      { id: '2', name: 'Ovos e Laticínios' },
      { id: '3', name: 'Chocolate e Doces' },
      { id: '4', name: 'Frutas e Aromatizantes' },
      { id: '5', name: 'Outros' },
    ])
  }

  async function onFormSubmit(formData) {
    try {
      setError('')
      if (ingredient) {
        await ingredientService.updateIngredient(
          ingredient.id,
          formData
        )
      } else {
        await ingredientService.createIngredient(
          user.id,
          formData
        )
      }
      onSuccess()
    } catch (err) {
      setError(err.message || 'Erro ao salvar insumo')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      <Input
        label="Nome do Insumo"
        name="name"
        value={values.name}
        onChange={handleChange}
        required
      />

      <Select
        label="Categoria"
        name="category_id"
        value={values.category_id}
        onChange={handleChange}
        options={categories.map((cat) => ({
          value: cat.id,
          label: cat.name,
        }))}
        required
      />

      <Input
        label="Unidade de Medida"
        name="unit_measure"
        value={values.unit_measure}
        onChange={handleChange}
        placeholder="kg, l, un, etc"
        required
      />

      <Input
        label="Custo Unitário"
        name="unit_cost"
        type="number"
        step="0.01"
        value={values.unit_cost}
        onChange={handleChange}
        required
      />

      <Select
        label="Fornecedor (Opcional)"
        name="supplier_id"
        value={values.supplier_id}
        onChange={handleChange}
        options={suppliers.map((supplier) => ({
          value: supplier.id,
          label: supplier.name,
        }))}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observações
        </label>
        <textarea
          name="observations"
          value={values.observations}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="3"
        />
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
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
  )
}
