import { supabase } from '../config/supabase'
import { auditService } from './auditService'

export const clientService = {
  async getClients(userId) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data
  },

  async getClientById(id) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createClient(userId, client) {
    const { data, error } = await supabase
      .from('clients')
      .insert([{ user_id: userId, ...client }])
      .select()
      .single()

    if (error) throw error
    
    // Registrar auditoria
    await auditService.logAction(userId, 'create', 'clients', data.id, null, data)
    
    return data
  },

  async updateClient(id, updates) {
    // Buscar dados antigos
    const { data: oldData } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    
    // Registrar auditoria
    if (oldData) {
      await auditService.logAction(oldData.user_id, 'update', 'clients', id, oldData, data)
    }
    
    return data
  },

  async deleteClient(id) {
    // Buscar dados antes de deletar
    const { data: oldData } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) throw error
    
    // Registrar auditoria
    if (oldData) {
      await auditService.logAction(oldData.user_id, 'delete', 'clients', id, oldData, null)
    }
  },

  // Estatísticas de clientes
  async getTopClientsByOrders(userId, limit = 5, startDate = null, endDate = null) {
    let query = supabase
      .from('daily_production')
      .select('client_id, clients(name)')
      .not('client_id', 'is', null)
    
    if (startDate) {
      query = query.gte('production_date', startDate)
    }
    if (endDate) {
      query = query.lte('production_date', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    // Contar pedidos por cliente
    const clientCounts = {}
    data.forEach((item) => {
      if (item.client_id && item.clients) {
        const clientId = item.client_id
        if (!clientCounts[clientId]) {
          clientCounts[clientId] = {
            name: item.clients.name,
            count: 0,
          }
        }
        clientCounts[clientId].count++
      }
    })

    // Ordenar e limitar
    return Object.values(clientCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  },

  async getTopClientsByRevenue(userId, limit = 5, startDate = null, endDate = null) {
    let query = supabase
      .from('daily_production')
      .select('client_id, valor, clients(name)')
      .not('client_id', 'is', null)
      .not('valor', 'is', null)
    
    if (startDate) {
      query = query.gte('production_date', startDate)
    }
    if (endDate) {
      query = query.lte('production_date', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    // Somar valores por cliente
    const clientRevenue = {}
    data.forEach((item) => {
      if (item.client_id && item.clients && item.valor) {
        const clientId = item.client_id
        if (!clientRevenue[clientId]) {
          clientRevenue[clientId] = {
            name: item.clients.name,
            total: 0,
          }
        }
        clientRevenue[clientId].total += item.valor
      }
    })

    // Ordenar e limitar
    return Object.values(clientRevenue)
      .sort((a, b) => b.total - a.total)
      .slice(0, limit)
  },

  async getClientStats(userId, clientId) {
    const { data, error } = await supabase
      .from('daily_production')
      .select('*')
      .eq('client_id', clientId)

    if (error) throw error

    const totalOrders = data.length
    const totalRevenue = data.reduce((sum, item) => sum + (item.valor || 0), 0)
    const pendingOrders = data.filter(item => item.status === 'encomenda').length
    const deliveredOrders = data.filter(item => item.status === 'entregue').length

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
    }
  },
}
