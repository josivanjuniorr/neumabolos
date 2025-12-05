import { supabase } from '../config/supabase'

export const supplierService = {
  async getSuppliers(userId) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error) throw error
    return data
  },

  async getSupplierById(id) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createSupplier(userId, supplier) {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([{ user_id: userId, ...supplier }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateSupplier(id, updates) {
    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteSupplier(id) {
    const { error } = await supabase
      .from('suppliers')
      .update({ status: 'inactive' })
      .eq('id', id)

    if (error) throw error
  },
}
