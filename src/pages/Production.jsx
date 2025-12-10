import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth, useForm } from '../hooks'
import { MainLayout, Card, Button, Table, Modal, Input, Select, Alert } from '../components'
import { productionService } from '../services/productionService'
import { clientService } from '../services/clientService'

export const Production = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [production, setProduction] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduction, setEditingProduction] =
    useState(null)
  const [error, setError] = useState('')
  const [clientSearch, setClientSearch] = useState('')

  // Calcular data inicial (uma semana atrás) e final (hoje)
  const getWeekStart = () => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date.toISOString().split('T')[0]
  }
  const getToday = () => new Date().toISOString().split('T')[0]
  
  const [startDate, setStartDate] = useState(getWeekStart())
  const [endDate, setEndDate] = useState(getToday())

  const initialValues = {
    production_date: new Date().toISOString().split('T')[0],
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    product_name: '',
    quantity: '',
    client_id: '',
    valor: '',
    status: 'encomenda',
    delivery_time: '',
    observations: '',
  }

  const { values, handleChange, handleSubmit, isSubmitting, setFieldValue } =
    useForm(initialValues, onFormSubmit)

  useEffect(() => {
    if (!user) return
    // Se vier com orderId, carregar todas as produções
    const shouldLoadAll = location.state?.orderId
    loadProduction(shouldLoadAll)
    loadClients()
  }, [user, startDate, endDate])

  // Verificar se há um orderId no state da navegação para editar
  useEffect(() => {
    if (location.state?.orderId && production.length > 0) {
      const order = production.find(p => p.id === location.state.orderId)
      if (order) {
        handleEdit(order)
      }
    }
  }, [location.state?.orderId, production])

  // Verificar se deve abrir modal para nova encomenda
  useEffect(() => {
    if (location.state?.openModal) {
      setShowModal(true)
    }
  }, [location.state?.openModal])

  useEffect(() => {
    if (editingProduction) {
      setFieldValue('production_date', editingProduction.production_date)
      setFieldValue('order_date', editingProduction.order_date || new Date().toISOString().split('T')[0])
      setFieldValue('delivery_date', editingProduction.delivery_date || '')
      setFieldValue('product_name', editingProduction.product_name)
      setFieldValue('quantity', editingProduction.quantity)
      setFieldValue('client_id', editingProduction.client_id || '')
      setFieldValue('valor', editingProduction.valor || '')
      setFieldValue('status', editingProduction.status || 'encomenda')
      setFieldValue('delivery_time', editingProduction.delivery_time || '')
      setFieldValue('observations', editingProduction.observations || '')
    } else {
      setFieldValue('production_date', new Date().toISOString().split('T')[0])
      setFieldValue('order_date', new Date().toISOString().split('T')[0])
      setFieldValue('delivery_date', '')
      setFieldValue('product_name', '')
      setFieldValue('quantity', '')
      setFieldValue('client_id', '')
      setFieldValue('valor', '')
      setFieldValue('status', 'encomenda')
      setFieldValue('delivery_time', '')
      setFieldValue('observations', '')
    }
  }, [editingProduction, setFieldValue])

  const loadProduction = async (loadAll = false) => {
    try {
      setLoading(true)
      let data
      if (loadAll) {
        // Carregar todas as produções para encontrar uma encomenda específica
        data = await productionService.getProductionByDateRange(
          user.id,
          '2020-01-01', // Data inicial ampla
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +1 ano
        )
      } else {
        data = await productionService.getProductionByDateRange(
          user.id,
          startDate,
          endDate
        )
      }
      setProduction(data || [])
    } catch (error) {
      console.error('Erro ao carregar produção:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadClients = async () => {
    try {
      const data = await clientService.getClients(user.id)
      setClients(data || [])
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    }
  }

  async function onFormSubmit(formData) {
    try {
      setError('')
      
      // Converter campos numéricos
      const sanitizedData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        valor: formData.valor ? parseFloat(formData.valor) : null,
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

  // Função para formatar data sem conversão de fuso horário
  const formatLocalDate = (dateString) => {
    if (!dateString) return '-'
    const [year, month, day] = dateString.split('T')[0].split('-')
    return `${day}/${month}/${year}`
  }

  const columns = [
    {
      key: 'order_date',
      label: 'Data Encomenda',
      render: (value) => formatLocalDate(value),
    },
    {
      key: 'delivery_date',
      label: 'Data Entrega',
      render: (value) => formatLocalDate(value),
    },
    { key: 'product_name', label: 'Produto' },
    {
      key: 'quantity',
      label: 'Quantidade',
      render: (value) => value.toFixed(2),
    },
    { 
      key: 'clients', 
      label: 'Cliente',
      render: (value) => value?.name || '-'
    },
    {
      key: 'valor',
      label: 'Valor',
      render: (value) => value ? `R$ ${value.toFixed(2)}` : '-',
    },
    {
      key: 'delivery_time',
      label: 'Horário',
      render: (value) => value || '-',
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => value === 'encomenda' ? 'Encomenda' : 'Entregue'
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Controle de Produção
          </h1>
          <Button variant="primary" onClick={handleAdd}>
            + Nova Produção
          </Button>
        </div>

        {/* Filtro de Período */}
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Período:</label>
            <button
              onClick={() => {
                const today = getToday()
                setStartDate(today)
                setEndDate(today)
              }}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 hover:text-white text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={() => {
                setStartDate(getWeekStart())
                setEndDate(getToday())
              }}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 hover:text-white text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors"
            >
              Última Semana
            </button>
            <button
              onClick={() => {
                const date = new Date()
                date.setDate(date.getDate() - 30)
                setStartDate(date.toISOString().split('T')[0])
                setEndDate(getToday())
              }}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 hover:text-white text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors"
            >
              Último Mês
            </button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-gray-900 dark:focus:border-gray-100"
            />
            <span className="text-gray-500 dark:text-gray-400 text-sm">até</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-gray-900 dark:focus:border-gray-100"
            />
          </div>
        </Card>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Data da Encomenda"
                name="order_date"
                type="date"
                value={values.order_date}
                onChange={handleChange}
                required
              />

              <Input
                label="Data de Entrega"
                name="delivery_date"
                type="date"
                value={values.delivery_date}
                onChange={handleChange}
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cliente
              </label>
              <Input
                name="client_search"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Buscar cliente..."
                className="mb-2"
              />
              <Select
                name="client_id"
                value={values.client_id}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Selecione um cliente' },
                  ...clients
                    .filter(client => 
                      client.name.toLowerCase().includes(clientSearch.toLowerCase())
                    )
                    .map(client => ({
                      value: client.id,
                      label: client.name
                    }))
                ]}
              />
            </div>

            <Input
              label="Valor"
              name="valor"
              type="number"
              step="0.01"
              value={values.valor}
              onChange={handleChange}
              placeholder="Valor da encomenda"
            />

            <Select
              label="Status"
              name="status"
              value={values.status}
              onChange={handleChange}
              options={[
                { value: 'encomenda', label: 'Encomenda' },
                { value: 'entregue', label: 'Entregue' },
              ]}
              required
            />

            <Input
              label="Horário de Entrega"
              name="delivery_time"
              type="time"
              value={values.delivery_time}
              onChange={handleChange}
              placeholder="Ex: 14:00"
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
