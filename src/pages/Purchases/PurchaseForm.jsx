import { useState, useEffect } from 'react'
import { useAuth, useForm } from '../../hooks'
import { Button, Input, Select, Alert } from '../../components/common'
import { purchaseService } from '../../services/purchaseService'
import { supplierService } from '../../services/supplierService'
import { ingredientService } from '../../services/ingredientService'
import { purchaseCategoryService } from '../../services/categoryService'

export const PurchaseForm = ({
  purchase,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [items, setItems] = useState(
    purchase?.purchase_items || []
  )
  const [error, setError] = useState('')

  const initialValues = {
    purchase_date: purchase?.purchase_date || '',
    supplier_id: purchase?.supplier_id || '',
    category_id: purchase?.category_id || '',
    payment_form: purchase?.payment_form || '',
  }

  const { values, handleChange, handleSubmit, isSubmitting } =
    useForm(initialValues, onFormSubmit)

  useEffect(() => {
    if (!user) return
    loadSuppliers()
    loadIngredients()
    loadCategories()
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

  const loadCategories = async () => {
    try {
      setLoadingCategories(true)
      const data = await purchaseCategoryService.getCategories(user.id)
      console.log('Categorias carregadas:', data)
      if (!data || data.length === 0) {
        // Inicializar categorias padrão
        try {
          await purchaseCategoryService.initializeDefaultCategories(user.id)
          const newData = await purchaseCategoryService.getCategories(user.id)
          console.log('Categorias criadas:', newData)
          setCategories(newData || [])
        } catch (initError) {
          console.error('Erro ao inicializar categorias:', initError)
          if (initError.message?.includes('relation') || initError.message?.includes('does not exist')) {
            setError('⚠️ Tabela de categorias não encontrada. Execute o script database-update.sql no Supabase SQL Editor.')
          }
          throw initError
        }
      } else {
        setCategories(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        setError('⚠️ Configure o banco de dados: Execute database-update.sql no Supabase SQL Editor')
      }
    } finally {
      setLoadingCategories(false)
    }
  }

  async function onFormSubmit(formData) {
    try {
      setError('')
      
      // Validar itens
      if (!items || items.length === 0) {
        setError('Adicione pelo menos um item à compra')
        return
      }

      const invalidItems = items.filter(
        item => !item.ingredient_id || !item.quantity || !item.unit_price
      )
      
      if (invalidItems.length > 0) {
        setError('Preencha todos os campos dos itens')
        return
      }

      // Validar category_id se fornecido
      if (formData.category_id && formData.category_id !== '') {
        const categoryExists = categories.find(c => c.id === formData.category_id)
        if (!categoryExists) {
          console.error('Categoria não encontrada!', {
            categoryId: formData.category_id,
            availableCategories: categories.map(c => ({ id: c.id, name: c.name }))
          })
          setError('Categoria selecionada não existe. Recarregue a página.')
          return
        }
        console.log('Categoria válida:', categoryExists)
      }
      
      // Converter campos numéricos e UUIDs
      const sanitizedData = {
        purchase_date: formData.purchase_date,
        supplier_id: formData.supplier_id === '' ? null : formData.supplier_id,
        category_id: formData.category_id === '' || !formData.category_id ? null : formData.category_id,
        payment_form: formData.payment_form || null,
        total: totalCalculado, // Usar total calculado automaticamente
      }

      console.log('Dados a serem enviados:', sanitizedData)
      
      // Sanitizar itens
      const sanitizedItems = items.map(item => ({
        ingredient_id: item.ingredient_id,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
      }))
      
      if (purchase) {
        await purchaseService.updatePurchase(
          purchase.id,
          sanitizedData
        )
      } else {
        await purchaseService.createPurchase(
          user.id,
          sanitizedData,
          sanitizedItems
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

  // Calcular total automaticamente
  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0
      const unitPrice = parseFloat(item.unit_price) || 0
      return sum + (quantity * unitPrice)
    }, 0)
  }

  const totalCalculado = calculateTotal()

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
        label={`Categoria de Compra ${categories.length > 0 ? `(${categories.length} disponíveis)` : ''}`}
        name="category_id"
        value={values.category_id}
        onChange={handleChange}
      >
        <option value="">
          {loadingCategories ? 'Carregando...' : categories.length === 0 ? 'Nenhuma categoria encontrada' : 'Selecione uma categoria'}
        </option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name} ({cat.type})
          </option>
        ))}
      </Select>

      {!loadingCategories && categories.length === 0 && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded space-y-2">
          <p>⚠️ Nenhuma categoria de compra encontrada. Verifique o console (F12) para mais detalhes.</p>
          <Button 
            type="button"
            size="sm"
            onClick={async () => {
              try {
                console.log('Forçando criação de categorias...')
                await purchaseCategoryService.initializeDefaultCategories(user.id)
                await loadCategories()
              } catch (err) {
                console.error('Erro ao criar categorias:', err)
                setError('Erro ao criar categorias: ' + err.message)
              }
            }}
          >
            Criar Categorias Padrão
          </Button>
        </div>
      )}

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
            + Adicionar Item
          </Button>
        </div>

        <div className="space-y-3">
          {items.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              Nenhum item adicionado. Clique em "Adicionar Item" para começar.
            </p>
          )}
          
          {items.map((item, index) => {
            const itemQuantity = parseFloat(item.quantity) || 0
            const itemUnitPrice = parseFloat(item.unit_price) || 0
            const itemTotal = itemQuantity * itemUnitPrice

            return (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  {/* Insumo - 5 colunas */}
                  <div className="md:col-span-5">
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
                  </div>

                  {/* Quantidade - 2 colunas */}
                  <div className="md:col-span-2">
                    <Input
                      label="Qtd."
                      type="number"
                      step="0.01"
                      min="0"
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
                  </div>

                  {/* Preço Unitário - 2 colunas */}
                  <div className="md:col-span-2">
                    <Input
                      label="Preço Unit."
                      type="number"
                      step="0.01"
                      min="0"
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
                  </div>

                  {/* Subtotal - 2 colunas */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtotal
                    </label>
                    <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 font-semibold">
                      R$ {itemTotal.toFixed(2)}
                    </div>
                  </div>

                  {/* Botão Remover - 1 coluna */}
                  <div className="md:col-span-1">
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      className="w-full"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Total calculado automaticamente */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-700">Total da Compra:</span>
          <span className="text-2xl font-bold text-blue-600">
            R$ {totalCalculado.toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Calculado automaticamente com base nos itens
        </p>
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
