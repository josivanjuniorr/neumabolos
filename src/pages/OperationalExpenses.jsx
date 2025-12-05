import { useState, useEffect } from 'react'
import { useAuth } from '../hooks'
import {
  Button,
  Input,
  Select,
  Modal,
  Table,
  Alert,
  Card,
} from '../components/common'
import {
  operationalExpenseService,
  purchaseCategoryService,
} from '../services/operationalExpenseService'
import { supplierService } from '../services/supplierService'
import { MainLayout } from '../components/Layout'

export const OperationalExpenses = () => {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    categoryId: '',
  })

  useEffect(() => {
    if (user) {
      loadExpenses()
      loadCategories()
      loadSuppliers()
    }
  }, [user])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const data = await operationalExpenseService.getExpenses(
        user.id,
        filters
      )
      setExpenses(data || [])
    } catch (err) {
      setError('Erro ao carregar despesas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await purchaseCategoryService.getCategories(user.id)
      if (!data || data.length === 0) {
        // Inicializar categorias padrão
        await purchaseCategoryService.initializeDefaultCategories(user.id)
        const newData = await purchaseCategoryService.getCategories(user.id)
        setCategories(newData || [])
      } else {
        setCategories(data || [])
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err)
    }
  }

  const loadSuppliers = async () => {
    try {
      const data = await supplierService.getSuppliers(user.id)
      setSuppliers(data || [])
    } catch (err) {
      console.error('Erro ao carregar fornecedores:', err)
    }
  }

  const handleAddExpense = () => {
    setEditingExpense(null)
    setShowModal(true)
  }

  const handleEditExpense = (expense) => {
    setEditingExpense(expense)
    setShowModal(true)
  }

  const handleDeleteExpense = async (id) => {
    if (!confirm('Deseja realmente excluir esta despesa?')) return

    try {
      await operationalExpenseService.deleteExpense(id)
      await loadExpenses()
    } catch (err) {
      setError('Erro ao excluir despesa')
      console.error(err)
    }
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setShowCategoryModal(true)
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setShowCategoryModal(true)
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Deseja realmente excluir esta categoria?')) return

    try {
      await purchaseCategoryService.deleteCategory(id)
      await loadCategories()
    } catch (err) {
      setError('Erro ao excluir categoria')
      console.error(err)
    }
  }

  const applyFilters = () => {
    loadExpenses()
  }

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '', categoryId: '' })
    setTimeout(() => loadExpenses(), 100)
  }

  const expenseColumns = [
    { key: 'expense_date', label: 'Data', render: (row) => new Date(row.expense_date).toLocaleDateString('pt-BR') },
    { key: 'description', label: 'Descrição' },
    { key: 'category', label: 'Categoria', render: (row) => row.category?.name || '-' },
    { key: 'supplier', label: 'Fornecedor', render: (row) => row.supplier?.name || '-' },
    { key: 'amount', label: 'Valor', render: (row) => `R$ ${parseFloat(row.amount).toFixed(2)}` },
    { key: 'payment_form', label: 'Pagamento' },
  ]

  const categoryColumns = [
    { key: 'name', label: 'Nome' },
    { key: 'type', label: 'Tipo' },
    { key: 'description', label: 'Descrição' },
  ]

  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount || 0),
    0
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Despesas Operacionais
          </h1>
          <div className="flex gap-2">
            <Button onClick={handleAddCategory} variant="secondary">
              Gerenciar Categorias
            </Button>
            <Button onClick={handleAddExpense}>Nova Despesa</Button>
          </div>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {/* Filtros */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Data Inicial"
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
            <Input
              label="Data Final"
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
            <Select
              label="Categoria"
              value={filters.categoryId}
              onChange={(e) =>
                setFilters({ ...filters, categoryId: e.target.value })
              }
            >
              <option value="">Todas</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
            <div className="flex items-end gap-2">
              <Button onClick={applyFilters} className="flex-1">
                Aplicar
              </Button>
              <Button onClick={clearFilters} variant="secondary">
                Limpar
              </Button>
            </div>
          </div>
        </Card>

        {/* Resumo */}
        <Card>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total de Despesas</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalExpenses.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quantidade</p>
              <p className="text-2xl font-bold text-gray-900">
                {expenses.length}
              </p>
            </div>
          </div>
        </Card>

        {/* Tabela de Despesas */}
        <Card>
          <Table
            columns={expenseColumns}
            data={expenses}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            loading={loading}
            emptyMessage="Nenhuma despesa cadastrada"
          />
        </Card>

        {/* Modal de Despesa */}
        {showModal && (
          <ExpenseModal
            expense={editingExpense}
            categories={categories}
            suppliers={suppliers}
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setShowModal(false)
              loadExpenses()
            }}
          />
        )}

        {/* Modal de Categorias */}
        {showCategoryModal && (
          <CategoryManagementModal
            categories={categories}
            onClose={() => setShowCategoryModal(false)}
            onSuccess={() => {
              setShowCategoryModal(false)
              loadCategories()
            }}
          />
        )}
      </div>
    </MainLayout>
  )
}

// Modal de Despesa
function ExpenseModal({ expense, categories, suppliers, onClose, onSuccess }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    expense_date: expense?.expense_date || '',
    description: expense?.description || '',
    category_id: expense?.category_id || '',
    amount: expense?.amount || '',
    payment_form: expense?.payment_form || '',
    supplier_id: expense?.supplier_id || '',
    observations: expense?.observations || '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const sanitizedData = {
        ...formData,
        amount: parseFloat(formData.amount),
        supplier_id: formData.supplier_id || null,
        category_id: formData.category_id || null,
      }

      if (expense) {
        await operationalExpenseService.updateExpense(expense.id, sanitizedData)
      } else {
        await operationalExpenseService.createExpense(user.id, sanitizedData)
      }
      onSuccess()
    } catch (err) {
      setError(err.message || 'Erro ao salvar despesa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={expense ? 'Editar Despesa' : 'Nova Despesa'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} />}

        <Input
          label="Data"
          type="date"
          value={formData.expense_date}
          onChange={(e) =>
            setFormData({ ...formData, expense_date: e.target.value })
          }
          required
        />

        <Input
          label="Descrição"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />

        <Select
          label="Categoria"
          value={formData.category_id}
          onChange={(e) =>
            setFormData({ ...formData, category_id: e.target.value })
          }
          required
        >
          <option value="">Selecione</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.type})
            </option>
          ))}
        </Select>

        <Input
          label="Valor"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) =>
            setFormData({ ...formData, amount: e.target.value })
          }
          required
        />

        <Select
          label="Forma de Pagamento"
          value={formData.payment_form}
          onChange={(e) =>
            setFormData({ ...formData, payment_form: e.target.value })
          }
        >
          <option value="">Selecione</option>
          <option value="Dinheiro">Dinheiro</option>
          <option value="Pix">Pix</option>
          <option value="Cartão Débito">Cartão Débito</option>
          <option value="Cartão Crédito">Cartão Crédito</option>
          <option value="Boleto">Boleto</option>
        </Select>

        <Select
          label="Fornecedor (Opcional)"
          value={formData.supplier_id}
          onChange={(e) =>
            setFormData({ ...formData, supplier_id: e.target.value })
          }
        >
          <option value="">Nenhum</option>
          {suppliers.map((sup) => (
            <option key={sup.id} value={sup.id}>
              {sup.name}
            </option>
          ))}
        </Select>

        <Input
          label="Observações"
          value={formData.observations}
          onChange={(e) =>
            setFormData({ ...formData, observations: e.target.value })
          }
          multiline
        />

        <div className="flex justify-end gap-2">
          <Button type="button" onClick={onClose} variant="secondary">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Modal de Gerenciamento de Categorias
function CategoryManagementModal({ categories, onClose, onSuccess }) {
  const { user } = useAuth()
  const [editingCategory, setEditingCategory] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
  })
  const [error, setError] = useState('')

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      description: category.description || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Deseja realmente excluir esta categoria?')) return

    try {
      await purchaseCategoryService.deleteCategory(id)
      onSuccess()
    } catch (err) {
      setError(err.message || 'Erro ao excluir categoria')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (editingCategory) {
        await purchaseCategoryService.updateCategory(editingCategory.id, formData)
      } else {
        await purchaseCategoryService.createCategory(user.id, formData)
      }
      setShowForm(false)
      setFormData({ name: '', type: '', description: '' })
      setEditingCategory(null)
      onSuccess()
    } catch (err) {
      setError(err.message || 'Erro ao salvar categoria')
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Gerenciar Categorias">
      <div className="space-y-4">
        {error && <Alert type="error" message={error} />}

        {!showForm ? (
          <>
            <Button onClick={() => setShowForm(true)} className="w-full">
              Nova Categoria
            </Button>

            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <p className="font-semibold">{cat.name}</p>
                    <p className="text-sm text-gray-600">
                      {cat.type} {cat.description && `- ${cat.description}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(cat)}
                      variant="secondary"
                      size="sm"
                    >
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDelete(cat.id)}
                      variant="danger"
                      size="sm"
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <Select
              label="Tipo"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              required
            >
              <option value="">Selecione</option>
              <option value="CMV">CMV</option>
              <option value="Operacional">Operacional</option>
              <option value="Imposto">Imposto</option>
              <option value="Outros">Outros</option>
            </Select>

            <Input
              label="Descrição"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingCategory(null)
                  setFormData({ name: '', type: '', description: '' })
                }}
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
