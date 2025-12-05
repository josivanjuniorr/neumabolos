import { supabase } from '../config/supabase'

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
    return data
  },

  async updateProduction(id, updates) {
    const { data, error } = await supabase
      .from('daily_production')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
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
