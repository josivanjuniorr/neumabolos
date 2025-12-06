import { useState, useEffect } from 'react'
import { useAuth } from '../hooks'
import { MainLayout, Card, StatCard } from '../components'
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

export const Dashboard = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadDashboardData = async () => {
      try {
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        )

        const dateRange = {
          start: firstDay.toISOString().split('T')[0],
          end: lastDay.toISOString().split('T')[0],
        }

        const [
          purchases,
          expensesByCategory,
          expensesBySupplier,
          allIngredients,
          topIngredients,
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
          ingredientService.getMostExpensiveIngredients(user.id, 5),
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
          topIngredients: topIngredients,
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

    loadDashboardData()
  }, [user])

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

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

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

          {/* Gastos por Fornecedor */}
          <Card title="Top 5 Fornecedores">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.supplierData.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#3B82F6"
                  name="Gasto Total"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Insumos Mais Caros */}
          <Card title="Top 5 Insumos Mais Caros">
            <div className="space-y-3">
              {data.topIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {ingredient.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {ingredient.category?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      R$ {ingredient.unit_cost.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      por {ingredient.unit_measure}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
