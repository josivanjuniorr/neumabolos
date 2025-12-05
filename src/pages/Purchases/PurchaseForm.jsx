import { useState, useEffect } from 'react'
import { useAuth, useForm } from '../../hooks'
import { Button, Input, Select, Alert } from '../../components/common'
import { purchaseService } from '../../services/purchaseService'
import { supplierService } from '../../services/supplierService'
import { ingredientService } from '../../services/ingredientService'

export const PurchaseForm = ({
  purchase,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [items, setItems] = useState(
    purchase?.purchase_items || []
  )
  const [error, setError] = useState('')

  const initialValues = {
    purchase_date: purchase?.purchase_date || '',
    supplier_id: purchase?.supplier_id || '',
    category_id: purchase?.category_id || '',
    payment_form: purchase?.payment_form || '',
    total: purchase?.total || '',
  }

  const { values, handleChange, handleSubmit, isSubmitting } =
    useForm(initialValues, onFormSubmit)

  useEffect(() => {
    if (!user) return
    loadSuppliers()
    loadIngredients()
  }, [user])

  const loadSuppliers = async () => {
    try {
      const data = await supplierService.getSuppliers(user.id)
      setSuppliers(data || [])
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error)
    }
  }

  const loadIngredients = async () => {
    try {
      const data =
        await ingredientService.getIngredients(user.id)
      setIngredients(data || [])
    } catch (error) {
      console.error('Erro ao carregar insumos:', error)
    }
  }

  async function onFormSubmit(formData) {
    try {
      setError('')
      
      // Converter campos numéricos
      const sanitizedData = {
        ...formData,
        total: formData.total === '' ? null : parseFloat(formData.total),
      }
      
      if (purchase) {
        await purchaseService.updatePurchase(
          purchase.id,
          sanitizedData
        )
      } else {
        await purchaseService.createPurchase(
          user.id,
          sanitizedData,
          items
        )
      }
      onSuccess()
    } catch (err) {
      setError(err.message || 'Erro ao salvar compra')
    }
  }

  const handleAddItem = () => {
    setItems([
      ...items,
      { ingredient_id: '', quantity: '', unit_price: '' },
    ])
  }

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
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
        label="Data da Compra"
        name="purchase_date"
        type="date"
        value={values.purchase_date}
        onChange={handleChange}
        required
      />

      <Select
        label="Fornecedor"
        name="supplier_id"
        value={values.supplier_id}
        onChange={handleChange}
        options={suppliers.map((supplier) => ({
          value: supplier.id,
          label: supplier.name,
        }))}
        required
      />

      <Select
        label="Forma de Pagamento"
        name="payment_form"
        value={values.payment_form}
        onChange={handleChange}
        options={[
          { value: 'dinheiro', label: 'Dinheiro' },
          { value: 'cartao_credito', label: 'Cartão Crédito' },
          { value: 'cartao_debito', label: 'Cartão Débito' },
          { value: 'pix', label: 'PIX' },
          { value: 'cheque', label: 'Cheque' },
        ]}
        required
      />

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            Itens da Compra
          </h3>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleAddItem}
          >
            + Item
          </Button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-white p-3 rounded-lg space-y-2"
            >
              <Select
                label="Insumo"
                value={item.ingredient_id}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    'ingredient_id',
                    e.target.value
                  )
                }
                options={ingredients.map((ing) => ({
                  value: ing.id,
                  label: `${ing.name} (${ing.unit_measure})`,
                }))}
                required
              />

              <Input
                label="Quantidade"
                type="number"
                step="0.01"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    'quantity',
                    e.target.value
                  )
                }
                required
              />

              <Input
                label="Preço Unitário"
                type="number"
                step="0.01"
                value={item.unit_price}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    'unit_price',
                    e.target.value
                  )
                }
                required
              />

              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleRemoveItem(index)}
              >
                Remover
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Input
        label="Total"
        name="total"
        type="number"
        step="0.01"
        value={values.total}
        onChange={handleChange}
        required
      />

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
