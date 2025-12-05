import { useState, useEffect } from 'react'
import { useAuth } from '../hooks'
import { MainLayout, Card, StatCard, Button } from '../components'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { reportService } from '../services/reportService'

export const Reports = () => {
  const { user } = useAuth()
  const [reportData, setReportData] = useState(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    loadReport()
  }, [user, month, year])

  const loadReport = async () => {
    try {
      setLoading(true)
      const data =
        await reportService.getDetailedMonthlyReport(
          user.id,
          year,
          month
        )
      setReportData(data)
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !reportData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  const categoryData = Object.entries(
    reportData.expensesByCategory
  ).map(([name, value]) => ({
    name,
    value,
  }))

  const supplierData = Object.entries(
    reportData.expensesBySupplier
  ).map(([name, value]) => ({
    name,
    value,
  }))

  const COLORS = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
  ]

  const handleExportPDF = () => {
    alert('Exportação em PDF será implementada com jsPDF')
  }

  const handleExportCSV = () => {
    alert('Exportação em CSV será implementada com PapaParse')
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Relatórios Financeiros
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportPDF}
            >
              📄 Exportar PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCSV}
            >
              📊 Exportar CSV
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mês
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(
                  (m) => (
                    <option key={m} value={m}>
                      {new Date(
                        year,
                        m - 1
                      ).toLocaleDateString('pt-BR', {
                        month: 'long',
                      })}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {Array.from(
                  { length: 5 },
                  (_, i) => new Date().getFullYear() - i
                ).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Despesas"
            value={`R$ ${reportData.totalExpenses.toFixed(2)}`}
            icon="💳"
            color="blue"
          />
          <StatCard
            title="Custo de Produção"
            value={`R$ ${reportData.productionCost.toFixed(2)}`}
            icon="⚙️"
            color="green"
          />
          <StatCard
            title="Desperdício"
            value={`R$ ${reportData.wasteCost.toFixed(2)}`}
            icon="⚠️"
            color="red"
          />
          <StatCard
            title="Custo Total"
            value={`R$ ${reportData.netExpenses.toFixed(2)}`}
            icon="💰"
            color="purple"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gastos por Categoria */}
          <Card title="Despesas por Categoria">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Gastos por Fornecedor */}
          <Card title="Despesas por Fornecedor">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplierData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Distribuição de Despesas */}
          <Card title="Distribuição de Despesas">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    {
                      name: 'Compras',
                      value: reportData.totalExpenses,
                    },
                    {
                      name: 'Produção',
                      value: reportData.productionCost,
                    },
                    {
                      name: 'Desperdício',
                      value: reportData.wasteCost,
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) =>
                    `${name}: R$ ${value.toFixed(0)}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1, 2].map((index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Resumo */}
          <Card title="Resumo do Período">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-gray-700">
                  Total Despesas:
                </span>
                <span className="text-lg font-bold text-blue-600">
                  R$ {reportData.totalExpenses.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-gray-700">
                  Custo Produção:
                </span>
                <span className="text-lg font-bold text-green-600">
                  R$ {reportData.productionCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-gray-700">
                  Desperdício:
                </span>
                <span className="text-lg font-bold text-red-600">
                  R$ {reportData.wasteCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border-t border-purple-200">
                <span className="font-medium text-gray-700">
                  TOTAL:
                </span>
                <span className="text-lg font-bold text-purple-600">
                  R$ {reportData.netExpenses.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
