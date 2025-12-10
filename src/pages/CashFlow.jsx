import { useState, useEffect } from 'react'
import { useAuth, useForm } from '../hooks'
import { MainLayout, Card, Button, Table, Modal, Input, Select, Alert, StatCard } from '../components'
import { cashFlowService } from '../services/cashFlowService'
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
  Area,
  AreaChart,
} from 'recharts'

export const CashFlow = () => {
  const { user } = useAuth()
  const [cashFlow, setCashFlow] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState(null)
  const [error, setError] = useState('')
  
  // Filtros
  const getToday = () => new Date().toISOString().split('T')[0]
  const getMonthStart = () => {
    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
  }
  const getMonthEnd = () => {
    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]
  }
  
  const [startDate, setStartDate] = useState(getMonthStart())
  const [endDate, setEndDate] = useState(getMonthEnd())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPaymentForm, setFilterPaymentForm] = useState('')
  const [filterResponsible, setFilterResponsible] = useState('')

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
  }, [user, startDate, endDate])

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
      const data = await cashFlowService.getCashFlowByDateRange(user.id, startDate, endDate)
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
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return
    
    try {
      await cashFlowService.deleteTransaction(id)
      await loadCashFlow()
    } catch (error) {
      console.error('Erro ao deletar transação:', error)
    }
  }

  // Calcular estatísticas
  const stats = {
    totalEntradas: cashFlow
      .filter(t => t.transaction_type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0),
    totalSaidas: cashFlow
      .filter(t => t.transaction_type === 'saída')
      .reduce((sum, t) => sum + t.amount, 0),
  }
  stats.saldo = stats.totalEntradas - stats.totalSaidas
  
  // Saldo do dia (hoje)
  const today = getToday()
  const todayTransactions = cashFlow.filter(t => t.transaction_date === today)
  stats.saldoDia = todayTransactions
    .filter(t => t.transaction_type === 'entrada')
    .reduce((sum, t) => sum + t.amount, 0) - 
    todayTransactions
    .filter(t => t.transaction_type === 'saída')
    .reduce((sum, t) => sum + t.amount, 0)
  
  // Dados para o gráfico (agrupados por dia)
  const chartData = {}
  let saldoAcumulado = 0
  
  cashFlow.forEach(transaction => {
    const date = transaction.transaction_date
    if (!chartData[date]) {
      chartData[date] = { date, entrada: 0, saída: 0, saldo: 0 }
    }
    if (transaction.transaction_type === 'entrada') {
      chartData[date].entrada += transaction.amount
    } else {
      chartData[date].saída += transaction.amount
    }
  })
  
  const chartDataArray = Object.values(chartData)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(day => {
      saldoAcumulado += (day.entrada - day.saída)
      return {
        ...day,
        saldo: day.entrada - day.saída,
        saldoAcumulado: saldoAcumulado
      }
    })
  
  // Dados para gráfico de pizza por forma de pagamento
  const paymentData = {}
  cashFlow.forEach(transaction => {
    const payment = transaction.payment_form || 'outros'
    if (!paymentData[payment]) {
      paymentData[payment] = { name: payment, value: 0, count: 0 }
    }
    paymentData[payment].value += transaction.amount
    paymentData[payment].count += 1
  })
  
  const paymentChartData = Object.values(paymentData).map(item => ({
    name: item.name === 'cartao_credito' ? 'Cartão Crédito' :
          item.name === 'cartao_debito' ? 'Cartão Débito' :
          item.name === 'transferencia' ? 'Transferência' :
          item.name.charAt(0).toUpperCase() + item.name.slice(1),
    value: item.value,
    count: item.count
  }))
  
  // Cores para o gráfico de pizza
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']
  
  // Filtrar dados
  const filteredCashFlow = cashFlow.filter(transaction => {
    const matchSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchPayment = !filterPaymentForm || transaction.payment_form === filterPaymentForm
    const matchResponsible = !filterResponsible || 
      (transaction.responsible && transaction.responsible.toLowerCase().includes(filterResponsible.toLowerCase()))
    return matchSearch && matchPayment && matchResponsible
  })
  
  // Agrupar por data para exibição
  const groupedByDate = {}
  filteredCashFlow.forEach(transaction => {
    const date = transaction.transaction_date
    if (!groupedByDate[date]) {
      groupedByDate[date] = []
    }
    groupedByDate[date].push(transaction)
  })
  
  // Obter lista de responsáveis únicos
  const uniqueResponsibles = [...new Set(
    cashFlow.map(t => t.responsible).filter(Boolean)
  )]
  
  // Exportar para CSV
  const exportToCSV = () => {
    const headers = ['Data', 'Tipo', 'Descrição', 'Valor', 'Forma Pagamento', 'Responsável']
    const rows = filteredCashFlow.map(t => [
      t.transaction_date,
      t.transaction_type === 'entrada' ? 'Entrada' : 'Saída',
      t.description,
      t.amount.toFixed(2),
      t.payment_form,
      t.responsible || ''
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `fluxo-caixa-${startDate}-${endDate}.csv`
    link.click()
  }
  
  // Ícones para formas de pagamento
  const paymentIcons = {
    dinheiro: '💵',
    cartao_credito: '💳',
    cartao_debito: '💳',
    pix: '📱',
    cheque: '📝',
    transferencia: '🏦'
  }

  const columns = [
    {
      key: 'transaction_date',
      label: 'Data',
      render: (value) =>
        new Date(value + 'T00:00:00').toLocaleDateString('pt-BR'),
    },
    {
      key: 'transaction_type',
      label: 'Tipo',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'entrada' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {value === 'entrada' ? '↓ Entrada' : '↑ Saída'}
        </span>
      ),
    },
    { key: 'description', label: 'Descrição' },
    {
      key: 'amount',
      label: 'Valor',
      render: (value, row) => (
        <span className={`font-semibold ${
          row.transaction_type === 'entrada' ? 'text-green-600' : 'text-red-600'
        }`}>
          R$ {value.toFixed(2)}
        </span>
      ),
    },
    { 
      key: 'payment_form', 
      label: 'Pagamento',
      render: (value) => (
        <span className="flex items-center gap-1">
          <span>{paymentIcons[value] || '💰'}</span>
          <span className="text-xs">
            {value === 'cartao_credito' ? 'Crédito' :
             value === 'cartao_debito' ? 'Débito' :
             value === 'transferencia' ? 'Transfer.' :
             value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        </span>
      )
    },
    { 
      key: 'responsible', 
      label: 'Responsável',
      render: (value) => value || '-'
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Controle de Caixa
          </h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportToCSV}>
              📥 Exportar
            </Button>
            <Button variant="primary" onClick={handleAdd}>
              + Nova Transação
            </Button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Saldo Total"
            value={`R$ ${stats.saldo.toFixed(2)}`}
            icon="💰"
            trend={stats.saldo >= 0 ? 'up' : 'down'}
            trendValue={stats.saldo >= 0 ? 'Positivo' : 'Negativo'}
          />
          <StatCard
            title="Total Entradas"
            value={`R$ ${stats.totalEntradas.toFixed(2)}`}
            icon="📈"
            trend="up"
            trendValue={`${cashFlow.filter(t => t.transaction_type === 'entrada').length} transações`}
          />
          <StatCard
            title="Total Saídas"
            value={`R$ ${stats.totalSaidas.toFixed(2)}`}
            icon="📉"
            trend="down"
            trendValue={`${cashFlow.filter(t => t.transaction_type === 'saída').length} transações`}
          />
          <StatCard
            title="Saldo do Dia"
            value={`R$ ${stats.saldoDia.toFixed(2)}`}
            icon="📅"
            trend={stats.saldoDia >= 0 ? 'up' : 'down'}
            trendValue={new Date().toLocaleDateString('pt-BR')}
          />
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
                setStartDate(getMonthStart())
                setEndDate(getMonthEnd())
              }}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 hover:text-white text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors"
            >
              Este Mês
            </button>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm"
              />
              <span className="text-gray-500">até</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </Card>

        {/* Gráfico de Fluxo */}
        {chartDataArray.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {/* Gráfico Principal - Entradas vs Saídas com Saldo */}
            <Card title="Fluxo de Caixa">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartDataArray}>
                  <defs>
                    <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="colorSaida" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    stroke="#6b7280"
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value + 'T00:00:00').toLocaleDateString('pt-BR')}
                    formatter={(value) => `R$ ${value.toFixed(2)}`}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="rect"
                  />
                  <Bar 
                    dataKey="entrada" 
                    fill="url(#colorEntrada)"
                    name="Entradas"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    dataKey="saída" 
                    fill="url(#colorSaida)"
                    name="Saídas"
                    radius={[8, 8, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="saldoAcumulado"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="Saldo Acumulado"
                    dot={{ fill: '#3B82F6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Gráfico de Pizza - Formas de Pagamento */}
            {paymentChartData.length > 0 && (
              <Card title="Distribuição por Forma de Pagamento">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={paymentChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent, value }) => `${name}: R$ ${value.toFixed(0)} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {paymentChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `R$ ${value.toFixed(2)} (${props.payload.count} transações)`,
                        name
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>
        )}

        {/* Filtros de Busca */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Buscar por descrição"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite a descrição..."
            />
            <Select
              label="Forma de Pagamento"
              value={filterPaymentForm}
              onChange={(e) => setFilterPaymentForm(e.target.value)}
              options={[
                { value: '', label: 'Todas' },
                { value: 'dinheiro', label: 'Dinheiro' },
                { value: 'cartao_credito', label: 'Cartão Crédito' },
                { value: 'cartao_debito', label: 'Cartão Débito' },
                { value: 'pix', label: 'PIX' },
                { value: 'cheque', label: 'Cheque' },
                { value: 'transferencia', label: 'Transferência' },
              ]}
            />
            <Select
              label="Responsável"
              value={filterResponsible}
              onChange={(e) => setFilterResponsible(e.target.value)}
              options={[
                { value: '', label: 'Todos' },
                ...uniqueResponsibles.map(resp => ({
                  value: resp,
                  label: resp
                }))
              ]}
            />
          </div>
        </Card>

        {/* Tabela de Transações */}
        <Card title={`Transações (${filteredCashFlow.length})`}>
          <Table
            columns={columns}
            data={filteredCashFlow}
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
