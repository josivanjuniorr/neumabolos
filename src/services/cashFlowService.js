import { supabase } from '../config/supabase'
import { auditService } from './auditService'

export const cashFlowService = {
  async getCashFlow(userId) {
    const { data, error } = await supabase
      .from('cash_flow')
      .select('*')
      .order('transaction_date', { ascending: false })

    if (error) throw error
    return data
  },

  async getCashFlowByDateRange(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('cash_flow')
      .select('*')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false })

    if (error) throw error
    return data
  },

  async createTransaction(userId, transaction) {
    const { data, error } = await supabase
      .from('cash_flow')
      .insert([{ user_id: userId, ...transaction }])
      .select()
      .single()

    if (error) throw error
    
    // Registrar auditoria
    await auditService.logAction(userId, 'create', 'cash_flow', data.id, null, data)
    
    return data
  },

  async updateTransaction(id, updates) {
    // Buscar dados antigos
    const { data: oldData } = await supabase
      .from('cash_flow')
      .select('*')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('cash_flow')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    
    // Registrar auditoria
    if (oldData) {
      await auditService.logAction(oldData.user_id, 'update', 'cash_flow', id, oldData, data)
    }
    
    return data
  },

  async deleteTransaction(id) {
    // Buscar dados antes de deletar
    const { data: oldData } = await supabase
      .from('cash_flow')
      .select('*')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('cash_flow')
      .delete()
      .eq('id', id)

    if (error) throw error
    
    // Registrar auditoria
    if (oldData) {
      await auditService.logAction(oldData.user_id, 'delete', 'cash_flow', id, oldData, null)
    }
  },

  async getDailyFlow(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('cash_flow')
      .select('transaction_date, transaction_type, amount')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: true })

    if (error) throw error

    const grouped = {}
    data.forEach((item) => {
      if (!grouped[item.transaction_date]) {
        grouped[item.transaction_date] = { entrada: 0, saída: 0 }
      }
      if (item.transaction_type === 'entrada') {
        grouped[item.transaction_date].entrada += item.amount
      } else {
        grouped[item.transaction_date].saída += item.amount
      }
    })

    return grouped
  },
}
