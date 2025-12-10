import { supabase } from '../config/supabase'
import { auditService } from './auditService'

export const supplierService = {
  async getSuppliers(userId) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
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
    
    // Registrar auditoria
    await auditService.logAction(userId, 'create', 'suppliers', data.id, null, data)
    
    return data
  },

  async updateSupplier(id, updates) {
    // Buscar dados antigos
    const { data: oldData } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    
    // Registrar auditoria
    if (oldData) {
      await auditService.logAction(oldData.user_id, 'update', 'suppliers', id, oldData, data)
    }
    
    return data
  },

  async deleteSupplier(id) {
    // Buscar dados antes de inativar
    const { data: oldData } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('suppliers')
      .update({ status: 'inactive' })
      .eq('id', id)

    if (error) throw error
    
    // Registrar auditoria
    if (oldData) {
      await auditService.logAction(oldData.user_id, 'delete', 'suppliers', id, oldData, { ...oldData, status: 'inactive' })
    }
  },
}
