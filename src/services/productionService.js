import { supabase } from '../config/supabase'
import { cashFlowService } from './cashFlowService'

export const productionService = {
  async getDailyProduction(userId, date) {
    const { data, error } = await supabase
      .from('daily_production')
      .select('*')
      .eq('user_id', userId)
      .eq('production_date', date)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getProductionByDateRange(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('daily_production')
      .select('*')
      .eq('user_id', userId)
      .gte('production_date', startDate)
      .lte('production_date', endDate)
      .order('production_date', { ascending: false })

    if (error) throw error
    return data
  },

  async createProduction(userId, production) {
    const { data, error } = await supabase
      .from('daily_production')
      .insert([{ user_id: userId, ...production }])
      .select()
      .single()

    if (error) throw error

    // Se já foi criado com status 'entregue' e tem valor, criar entrada no caixa
    if (production.status === 'entregue' && production.valor > 0) {
      await cashFlowService.createTransaction(userId, {
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_type: 'entrada',
        category: 'Venda',
        description: `Venda - ${production.product_name}${production.client_name ? ` - ${production.client_name}` : ''}`,
        amount: production.valor,
        payment_form: 'Dinheiro',
      })
    }

    return data
  },

  async updateProduction(id, updates) {
    // Buscar produção atual para comparar status
    const { data: currentProduction, error: fetchError } = await supabase
      .from('daily_production')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // Atualizar produção
    const { data, error } = await supabase
      .from('daily_production')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Se status mudou de 'encomenda' para 'entregue' e tem valor, criar entrada no caixa
    if (
      currentProduction.status !== 'entregue' &&
      updates.status === 'entregue' &&
      data.valor > 0
    ) {
      await cashFlowService.createTransaction(data.user_id, {
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_type: 'entrada',
        category: 'Venda',
        description: `Venda - ${data.product_name}${data.client_name ? ` - ${data.client_name}` : ''}`,
        amount: data.valor,
        payment_form: 'Dinheiro',
      })
    }

    return data
  },

  async deleteProduction(id) {
    const { error } = await supabase
      .from('daily_production')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getProductionCostByPeriod(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('daily_production')
      .select('estimated_cost')
      .eq('user_id', userId)
      .gte('production_date', startDate)
      .lte('production_date', endDate)

    if (error) throw error

    const totalCost = data.reduce((sum, item) => sum + item.estimated_cost, 0)
    return totalCost
  },
}
