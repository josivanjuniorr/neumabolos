import { supabase } from '../config/supabase'

export const wasteService = {
  async getWaste(userId) {
    const { data, error } = await supabase
      .from('waste_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('waste_date', { ascending: false })

    if (error) throw error
    return data
  },

  async getWasteByDateRange(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('waste_analysis')
      .select('*')
      .eq('user_id', userId)
      .gte('waste_date', startDate)
      .lte('waste_date', endDate)
      .order('waste_date', { ascending: false })

    if (error) throw error
    return data
  },

  async createWaste(userId, waste) {
    const { data, error } = await supabase
      .from('waste_analysis')
      .insert([{ user_id: userId, ...waste }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateWaste(id, updates) {
    const { data, error } = await supabase
      .from('waste_analysis')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteWaste(id) {
    const { error } = await supabase
      .from('waste_analysis')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getTotalWasteCost(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('waste_analysis')
      .select('estimated_cost')
      .eq('user_id', userId)
      .gte('waste_date', startDate)
      .lte('waste_date', endDate)

    if (error) throw error

    const total = data.reduce((sum, item) => sum + item.estimated_cost, 0)
    return total
  },
}
