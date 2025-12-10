import { useState, useEffect } from 'react'
import { useAuth } from '../hooks'
import { MainLayout, Card, Button, Table, Select, Input, StatCard } from '../components'
import { auditService } from '../services/auditService'

export const Audit = () => {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  
  // Filtros
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  const [filters, setFilters] = useState({
    action: '',
    tableName: '',
    startDate: firstDayOfMonth.toISOString().split('T')[0],
    endDate: lastDayOfMonth.toISOString().split('T')[0],
  })

  useEffect(() => {
    if (!user) return
    loadLogs()
    loadStats()
  }, [user, filters])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const data = await auditService.getLogs(user.id, filters)
      setLogs(data)
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await auditService.getStats(user.id, filters.startDate, filters.endDate)
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const clearFilters = () => {
    setFilters({
      action: '',
      tableName: '',
      startDate: firstDayOfMonth.toISOString().split('T')[0],
      endDate: lastDayOfMonth.toISOString().split('T')[0],
    })
  }

  const getActionLabel = (action) => {
    const labels = {
      create: '✅ Criação',
      update: '✏️ Edição',
      delete: '🗑️ Exclusão',
    }
    return labels[action] || action
  }

  const getTableLabel = (tableName) => {
    const labels = {
      clients: 'Clientes',
      suppliers: 'Fornecedores',
      ingredients: 'Ingredientes',
      purchases: 'Compras',
      daily_production: 'Produção',
      cash_flow: 'Fluxo de Caixa',
      waste_analysis: 'Desperdício',
    }
    return labels[tableName] || tableName
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDataChanges = (log) => {
    if (log.action === 'create' && log.new_data) {
      return JSON.stringify(log.new_data, null, 2)
    }
    if (log.action === 'delete' && log.old_data) {
      return JSON.stringify(log.old_data, null, 2)
    }
    if (log.action === 'update') {
      const changes = {}
      if (log.old_data && log.new_data) {
        Object.keys(log.new_data).forEach(key => {
          if (JSON.stringify(log.old_data[key]) !== JSON.stringify(log.new_data[key])) {
            changes[key] = {
              de: log.old_data[key],
              para: log.new_data[key]
            }
          }
        })
      }
      return JSON.stringify(changes, null, 2)
    }
    return '-'
  }

  const columns = [
    {
      key: 'created_at',
      label: 'Data/Hora',
      render: (value) => formatDate(value),
    },
    {
      key: 'action',
      label: 'Ação',
      render: (value) => getActionLabel(value),
    },
    {
      key: 'table_name',
      label: 'Módulo',
      render: (value) => getTableLabel(value),
    },
    {
      key: 'record_id',
      label: 'ID do Registro',
      render: (value) => value?.substring(0, 8) || '-',
    },
    {
      key: 'changes',
      label: 'Dados',
      render: (value, row) => (
        <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded max-w-md overflow-x-auto">
          {formatDataChanges(row)}
        </pre>
      ),
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Auditoria</h1>
            <p className="text-gray-600">Histórico de todas as ações realizadas no sistema</p>
          </div>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total de Ações"
              value={stats.total}
              icon="📊"
            />
            <StatCard
              title="Criações"
              value={stats.byAction.create || 0}
              icon="✅"
              color="green"
            />
            <StatCard
              title="Edições"
              value={stats.byAction.update || 0}
              icon="✏️"
              color="blue"
            />
            <StatCard
              title="Exclusões"
              value={stats.byAction.delete || 0}
              icon="🗑️"
              color="red"
            />
          </div>
        )}

        {/* Filtros */}
        <Card>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Input
                label="Data Inicial"
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
              <Input
                label="Data Final"
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
              <Select
                label="Ação"
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
              >
                <option value="">Todas</option>
                <option value="create">Criação</option>
                <option value="update">Edição</option>
                <option value="delete">Exclusão</option>
              </Select>
              <Select
                label="Módulo"
                name="tableName"
                value={filters.tableName}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                <option value="clients">Clientes</option>
                <option value="suppliers">Fornecedores</option>
                <option value="ingredients">Ingredientes</option>
                <option value="purchases">Compras</option>
                <option value="daily_production">Produção</option>
                <option value="cash_flow">Fluxo de Caixa</option>
                <option value="waste_analysis">Desperdício</option>
              </Select>
              <div className="flex items-end">
                <Button onClick={clearFilters} variant="secondary" fullWidth>
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabela de Logs */}
        <Card>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              Histórico de Ações ({logs.length})
            </h2>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum registro encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table
                  data={logs}
                  columns={columns}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Estatísticas por Módulo */}
        {stats && stats.byTable && Object.keys(stats.byTable).length > 0 && (
          <Card>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Ações por Módulo</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(stats.byTable)
                  .sort((a, b) => b[1] - a[1])
                  .map(([tableName, count]) => (
                    <div
                      key={tableName}
                      className="bg-gray-50 p-4 rounded-lg text-center"
                    >
                      <p className="text-sm text-gray-600 mb-1">
                        {getTableLabel(tableName)}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
