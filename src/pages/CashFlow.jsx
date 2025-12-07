import { useState, useEffect } from 'react'
import { useAuth, useForm } from '../hooks'
import { MainLayout, Card, Button, Table, Modal, Input, Select, Alert } from '../components'
import { cashFlowService } from '../services/cashFlowService'

export const CashFlow = () => {
  const { user } = useAuth()
  const [cashFlow, setCashFlow] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState(null)
  const [error, setError] = useState('')

  const initialValues = {
    transaction_date: new Date().toISOString().split('T')[0],
    transaction_type: '',
    description: '',
    amount: '',
    payment_form: '',
    responsible: '',
    observations: '',
  }

  const { values, handleChange, handleSubmit, isSubmitting, setFieldValue } =
    useForm(initialValues, onFormSubmit)

  useEffect(() => {
    if (!user) return
    loadCashFlow()
  }, [user])

  useEffect(() => {
    if (editingTransaction) {
      setFieldValue('transaction_date', editingTransaction.transaction_date || new Date().toISOString().split('T')[0])
      setFieldValue('transaction_type', editingTransaction.transaction_type || '')
      setFieldValue('description', editingTransaction.description || '')
      setFieldValue('amount', editingTransaction.amount || '')
      setFieldValue('payment_form', editingTransaction.payment_form || '')
      setFieldValue('responsible', editingTransaction.responsible || '')
      setFieldValue('observations', editingTransaction.observations || '')
    } else {
      setFieldValue('transaction_date', new Date().toISOString().split('T')[0])
      setFieldValue('transaction_type', '')
      setFieldValue('description', '')
      setFieldValue('amount', '')
      setFieldValue('payment_form', '')
      setFieldValue('responsible', '')
      setFieldValue('observations', '')
    }
  }, [editingTransaction, setFieldValue])

  const loadCashFlow = async () => {
    try {
      setLoading(true)
      const data = await cashFlowService.getCashFlow(user.id)
      setCashFlow(data || [])
    } catch (error) {
      console.error('Erro ao carregar caixa:', error)
    } finally {
      setLoading(false)
    }
  }

  async function onFormSubmit(formData) {
    try {
      setError('')
      
      // Converter campos numéricos
      const sanitizedData = {
        ...formData,
        amount: parseFloat(formData.amount),
      }
      
      if (editingTransaction) {
        await cashFlowService.updateTransaction(
          editingTransaction.id,
          sanitizedData
        )
      } else {
        await cashFlowService.createTransaction(
          user.id,
          sanitizedData
        )
      }
      await loadCashFlow()
      setShowModal(false)
    } catch (err) {
      setError(err.message || 'Erro ao salvar transação')
    }
  }

  const handleAdd = () => {
    setEditingTransaction(null)
    setShowModal(true)
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    try {
      await cashFlowService.deleteTransaction(id)
      await loadCashFlow()
    } catch (error) {
      console.error('Erro ao deletar transação:', error)
    }
  }

  const columns = [
    {
      key: 'transaction_date',
      label: 'Data',
      render: (value) =>
        new Date(value).toLocaleDateString('pt-BR'),
    },
    {
      key: 'transaction_type',
      label: 'Tipo',
      render: (value) =>
        value === 'entrada' ? '↓ Entrada' : '↑ Saída',
    },
    { key: 'description', label: 'Descrição' },
    {
      key: 'amount',
      label: 'Valor',
      render: (value) => `R$ ${value.toFixed(2)}`,
    },
    { key: 'payment_form', label: 'Forma de Pagamento' },
    { key: 'responsible', label: 'Responsável' },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Controle de Caixa
          </h1>
          <Button variant="primary" onClick={handleAdd}>
            + Nova Transação
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            data={cashFlow}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            editingTransaction
              ? 'Editar Transação'
              : 'Nova Transação'
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
              name="transaction_date"
              type="date"
              value={values.transaction_date}
              onChange={handleChange}
              required
            />

            <Select
              label="Tipo de Transação"
              name="transaction_type"
              value={values.transaction_type}
              onChange={handleChange}
              options={[
                { value: 'entrada', label: 'Entrada' },
                { value: 'saída', label: 'Saída' },
              ]}
              required
            />

            <Input
              label="Descrição"
              name="description"
              value={values.description}
              onChange={handleChange}
              required
            />

            <Input
              label="Valor"
              name="amount"
              type="number"
              step="0.01"
              value={values.amount}
              onChange={handleChange}
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
                { value: 'transferencia', label: 'Transferência' },
              ]}
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
