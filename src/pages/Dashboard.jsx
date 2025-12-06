import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useForm } from '../hooks'
import { MainLayout, Card, StatCard, Button, Modal, Input, Select, Alert } from '../components'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { purchaseService } from '../services/purchaseService'
import { ingredientService } from '../services/ingredientService'
import { productionService } from '../services/productionService'
import { wasteService } from '../services/wasteService'
import { cashFlowService } from '../services/cashFlowService'
import { clientService } from '../services/clientService'

export const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [clients, setClients] = useState([])
  const [error, setError] = useState('')
  
  // Estado para filtros de data
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(lastDayOfMonth.toISOString().split('T')[0])
  
  // Filtro de encomendas - padrão hoje
  const today = new Date().toISOString().split('T')[0]
  const [ordersDate, setOrdersDate] = useState(today)
  const [orders, setOrders] = useState([])

  const initialValues = {
    production_date: new Date().toISOString().split('T')[0],
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
    loadDashboardData()
  }, [user, startDate, endDate])

  useEffect(() => {
    if (!user) return
    loadOrders()
    loadClients()
  }, [user, ordersDate])

  useEffect(() => {
    if (editingOrder) {
      setFieldValue('production_date', editingOrder.production_date)
      setFieldValue('product_name', editingOrder.product_name)
      setFieldValue('quantity', editingOrder.quantity)
      setFieldValue('client_id', editingOrder.client_id || '')
      setFieldValue('valor', editingOrder.valor || '')
      setFieldValue('status', editingOrder.status || 'encomenda')
      setFieldValue('delivery_time', editingOrder.delivery_time || '')
      setFieldValue('observations', editingOrder.observations || '')
    } else {
      setFieldValue('production_date', new Date().toISOString().split('T')[0])
      setFieldValue('product_name', '')
      setFieldValue('quantity', '')
      setFieldValue('client_id', '')
      setFieldValue('valor', '')
      setFieldValue('status', 'encomenda')
      setFieldValue('delivery_time', '')
      setFieldValue('observations', '')
    }
  }, [editingOrder, setFieldValue])

  const loadOrders = async () => {
    try {
      const data = await productionService.getDailyProduction(user.id, ordersDate)
      setOrders(data || [])
    } catch (error) {
      console.error('Erro ao carregar encomendas:', error)
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
      
      const sanitizedData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        valor: formData.valor ? parseFloat(formData.valor) : null,
      }
      
      if (editingOrder) {
        await productionService.updateProduction(
          editingOrder.id,
          sanitizedData
        )
      } else {
        await productionService.createProduction(user.id, sanitizedData)
      }
      await loadOrders()
      setShowModal(false)
      setEditingOrder(null)
    } catch (err) {
      setError(err.message || 'Erro ao salvar encomenda')
    }
  }

  const handleEdit = (order) => {
    setEditingOrder(order)
    setShowModal(true)
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const dateRange = {
        start: startDate,
        end: endDate,
      }

      const [
        purchases,
        expensesByCategory,
        expensesBySupplier,
        allIngredients,
        topClientsByOrders,
        topClientsByRevenue,
        production,
        waste,
        dailyFlow,
      ] = await Promise.all([
        purchaseService.getPurchases(user.id),
        purchaseService.getExpensesByCategory(
          user.id,
            dateRange.start,
            dateRange.end
          ),
          purchaseService.getExpensesBySupplier(
            user.id,
            dateRange.start,
            dateRange.end
          ),
          ingredientService.getIngredients(user.id),
          clientService.getTopClientsByOrders(user.id, 5),
          clientService.getTopClientsByRevenue(user.id, 5),
          productionService.getProductionByDateRange(
            user.id,
            dateRange.start,
            dateRange.end
          ),
          wasteService.getWasteByDateRange(
            user.id,
            dateRange.start,
            dateRange.end
          ),
          cashFlowService.getDailyFlow(
            user.id,
            dateRange.start,
            dateRange.end
          ),
        ])

        const totalExpenses = purchases
          .filter(
            (p) =>
              p.purchase_date >= dateRange.start &&
              p.purchase_date <= dateRange.end
          )
          .reduce((sum, p) => sum + p.total, 0)

        const totalProduction = production.reduce(
          (sum, p) => sum + p.estimated_cost,
          0
        )

        const totalWaste = waste.reduce(
          (sum, w) => sum + w.estimated_cost,
          0
        )

        // Calcular faturamento (entradas do fluxo de caixa)
        const totalRevenue = Object.values(dailyFlow).reduce(
          (sum, flow) => sum + flow.entrada,
          0
        )

        const chartData = Object.entries(dailyFlow).map(
          ([date, flow]) => ({
            date: new Date(date).toLocaleDateString('pt-BR'),
            entrada: flow.entrada,
            saída: flow.saída,
          })
        )

        const categoryData = Object.entries(
          expensesByCategory
        ).map(([name, value]) => ({
          name,
          value,
        }))

        const supplierData = Object.entries(
          expensesBySupplier
        ).map(([name, value]) => ({
          name,
          value,
        }))

        setData({
          totalRevenue,
          totalExpenses,
          totalProduction,
          totalWaste,
          ingredientCount: allIngredients.length,
          topClientsByOrders,
          topClientsByRevenue,
          categoryData,
          supplierData,
          chartData,
        })
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error)
      } finally {
        setLoading(false)
      }
  }

  if (loading || !data) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  const COLORS = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
  ]

  const setQuickPeriod = (period) => {
    const now = new Date()
    let start, end

    switch (period) {
      case 'today':
        start = end = now.toISOString().split('T')[0]
        break
      case 'yesterday':
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        start = end = yesterday.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(now)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        start = weekStart.toISOString().split('T')[0]
        end = now.toISOString().split('T')[0]
        break
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
        break
      default:
        return
    }

    setStartDate(start)
    setEndDate(end)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          
          {/* Filtro de Data com botões rápidos */}
          <div className="flex flex-wrap items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100">
            <label className="text-sm font-medium text-gray-700">Período:</label>
            <button
              onClick={() => setQuickPeriod('today')}
              className="px-3 py-1.5 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 text-xs font-medium rounded-lg transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={() => setQuickPeriod('week')}
              className="px-3 py-1.5 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 text-xs font-medium rounded-lg transition-colors"
            >
              Semana
            </button>
            <button
              onClick={() => setQuickPeriod('month')}
              className="px-3 py-1.5 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 text-xs font-medium rounded-lg transition-colors"
            >
              Mês
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500 text-sm">até</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Encomendas do Dia - TOPO */}
        <Card title="🎂 Encomendas do Dia">
          <div className="space-y-4">
            {/* Filtro de Data das Encomendas */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-200">
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Data:</label>
                <input
                  type="date"
                  value={ordersDate}
                  onChange={(e) => setOrdersDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => setOrdersDate(new Date().toISOString().split('T')[0])}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Hoje
                </button>
                <button
                  onClick={() => {
                    const yesterday = new Date()
                    yesterday.setDate(yesterday.getDate() - 1)
                    setOrdersDate(yesterday.toISOString().split('T')[0])
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Ontem
                </button>
              </div>
              <Button
                onClick={() => {
                  setEditingOrder(null)
                  setShowModal(true)
                }}
                variant="primary"
              >
                + Nova Encomenda
              </Button>
            </div>

            {/* Cards Resumo de Encomendas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-600 font-medium mb-1">Total de Encomendas</p>
                <p className="text-3xl font-bold text-blue-700">{orders.length}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                <p className="text-sm text-yellow-600 font-medium mb-1">Pendentes</p>
                <p className="text-3xl font-bold text-yellow-700">
                  {orders.filter(o => o.status === 'encomenda').length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <p className="text-sm text-green-600 font-medium mb-1">Entregues</p>
                <p className="text-3xl font-bold text-green-700">
                  {orders.filter(o => o.status === 'entregue').length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                <p className="text-sm text-purple-600 font-medium mb-1">Valor Total</p>
                <p className="text-2xl font-bold text-purple-700">
                  R$ {orders.reduce((sum, o) => sum + (o.valor || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Lista de Encomendas */}
            {orders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhuma encomenda para esta data
              </p>
            ) : (
              <>
                {/* Versão Desktop - Tabela */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produto</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cliente</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Qtd</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Valor</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Horário</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.product_name}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{order.clients?.name || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">{order.quantity?.toFixed(0) || '-'}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                            {order.valor ? `R$ ${order.valor.toFixed(2)}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {order.delivery_time || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                              order.status === 'entregue' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status === 'entregue' ? '✓ Entregue' : '⏱ Pendente'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <button
                              onClick={() => handleEdit(order)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                              Ver Detalhes
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Versão Mobile - Cards */}
                <div className="md:hidden space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-base mb-1">
                            {order.product_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {order.clients?.name || 'Sem cliente'}
                          </p>
                        </div>
                        <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap ml-2 ${
                          order.status === 'entregue' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status === 'entregue' ? '✓ Entregue' : '⏱ Pendente'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Quantidade</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {order.quantity?.toFixed(0) || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Valor</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {order.valor ? `R$ ${order.valor.toFixed(2)}` : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Horário</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {order.delivery_time || '-'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleEdit(order)}
                        className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Faturamento (Mês)"
            value={`R$ ${data.totalRevenue.toFixed(2)}`}
            icon="💰"
            color="green"
          />
          <StatCard
            title="Total de Gastos (Mês)"
            value={`R$ ${data.totalExpenses.toFixed(2)}`}
            icon="💳"
            color="red"
          />
          <StatCard
            title="Custo de Produção"
            value={`R$ ${data.totalProduction.toFixed(2)}`}
            icon="⚙️"
            color="blue"
          />
          <StatCard
            title="Desperdício"
            value={`R$ ${data.totalWaste.toFixed(2)}`}
            icon="⚠️"
            color="orange"
          />
          <StatCard
            title="Insumos Cadastrados"
            value={data.ingredientCount}
            icon="🛒"
            color="purple"
          />
        </div>

        {/* Card de Resumo Financeiro */}
        <div className="grid grid-cols-1 gap-4">
          <Card title="Resumo do Mês">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Faturamento</span>
                <span className="text-lg font-bold text-green-600">
                  R$ {data.totalRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Despesas</span>
                <span className="text-lg font-bold text-red-600">
                  R$ {data.totalExpenses.toFixed(2)}
                </span>
              </div>
              <div className="h-px bg-gray-300"></div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Lucro/Prejuízo</span>
                <span className={`text-lg font-bold ${
                  data.totalRevenue - data.totalExpenses >= 0 
                    ? 'text-blue-600' 
                    : 'text-red-600'
                }`}>
                  R$ {(data.totalRevenue - data.totalExpenses).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Margem</span>
                <span className={`text-lg font-bold ${
                  ((data.totalRevenue - data.totalExpenses) / data.totalRevenue * 100) >= 0 
                    ? 'text-blue-600' 
                    : 'text-red-600'
                }`}>
                  {data.totalRevenue > 0 
                    ? ((data.totalRevenue - data.totalExpenses) / data.totalRevenue * 100).toFixed(1) 
                    : '0.0'}%
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fluxo de Caixa */}
          <Card title="Fluxo de Caixa">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="entrada"
                  stroke="#10B981"
                  name="Entrada"
                />
                <Line
                  type="monotone"
                  dataKey="saída"
                  stroke="#EF4444"
                  name="Saída"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Gastos por Categoria */}
          <Card title="Gastos por Categoria">
            <div className="space-y-4">
              {data.categoryData.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma despesa categorizada no período
                </p>
              ) : (
                <>
                  <div className="space-y-3">
                    {data.categoryData
                      .sort((a, b) => b.value - a.value)
                      .map((category, index) => {
                        const percentage = data.totalRevenue > 0 
                          ? (category.value / data.totalRevenue * 100)
                          : 0
                        const percentageOfTotal = data.totalExpenses > 0
                          ? (category.value / data.totalExpenses * 100)
                          : 0
                        
                        return (
                          <div key={category.name} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  {category.name}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-gray-900">
                                  R$ {category.value.toFixed(2)}
                                </span>
                                <span className="text-xs text-gray-500 ml-2">
                                  ({percentage.toFixed(1)}% do faturamento)
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(percentageOfTotal, 100)}%`,
                                  backgroundColor: COLORS[index % COLORS.length]
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-gray-700">Total de Despesas</span>
                      <span className="font-bold text-gray-900">
                        R$ {data.totalExpenses.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Top 5 Clientes com Mais Pedidos */}
          <Card title="Top 5 Clientes - Mais Pedidos">
            <div className="space-y-3">
              {data.topClientsByOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhum cliente com pedidos
                </p>
              ) : (
                data.topClientsByOrders.map((client, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">{index + 1}</span>
                      </div>
                      <p className="font-medium text-gray-900">
                        {client.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        {client.count}
                      </p>
                      <p className="text-sm text-gray-600">
                        {client.count === 1 ? 'pedido' : 'pedidos'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Top 5 Clientes que Mais Gastaram */}
          <Card title="Top 5 Clientes - Maior Faturamento">
            <div className="space-y-3">
              {data.topClientsByRevenue.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhum cliente com faturamento
                </p>
              ) : (
                data.topClientsByRevenue.map((client, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">{index + 1}</span>
                      </div>
                      <p className="font-medium text-gray-900">
                        {client.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        R$ {client.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        total
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Modal de Edição de Encomenda */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setEditingOrder(null)
          }}
          title={editingOrder ? 'Editar Encomenda' : 'Nova Encomenda'}
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
              label="Data da Entrega"
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

            <Select
              label="Cliente"
              name="client_id"
              value={values.client_id}
              onChange={handleChange}
              options={[
                { value: '', label: 'Selecione um cliente' },
                ...clients.map(client => ({
                  value: client.id,
                  label: client.name
                }))
              ]}
            />

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
                onClick={() => {
                  setShowModal(false)
                  setEditingOrder(null)
                }}
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
