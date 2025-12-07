import { supabase } from '../config/supabase'
import { auditService } from './auditService'

export const ingredientService = {
  async getIngredients(userId) {
    const { data, error } = await supabase
      .from('ingredients')
      .select(`
        *,
        category:ingredient_categories(name),
        supplier:suppliers(name)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error) throw error
    return data
  },

  async getIngredientById(id) {
    const { data, error } = await supabase
      .from('ingredients')
      .select(`
        *,
        category:ingredient_categories(name),
        supplier:suppliers(name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createIngredient(userId, ingredient) {
    const { data, error } = await supabase
      .from('ingredients')
      .insert([{ user_id: userId, ...ingredient }])
      .select()
      .single()

    if (error) throw error
    
    // Registrar auditoria
    await auditService.logAction(userId, 'create', 'ingredients', data.id, null, data)
    
    return data
  },

  async updateIngredient(id, updates) {
    // Buscar dados antigos
    const { data: oldData } = await supabase
      .from('ingredients')
      .select('*')
      .eq('id', id)
      .single()

    const { data, error} = await supabase
      .from('ingredients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    
    // Registrar auditoria
    if (oldData) {
      await auditService.logAction(oldData.user_id, 'update', 'ingredients', id, oldData, data)
    }
    
    return data
  },

  async deleteIngredient(id) {
    // Buscar dados antes de inativar
    const { data: oldData } = await supabase
      .from('ingredients')
      .select('*')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('ingredients')
      .update({ status: 'inactive' })
      .eq('id', id)

    if (error) throw error
    
    // Registrar auditoria
    if (oldData) {
      await auditService.logAction(oldData.user_id, 'delete', 'ingredients', id, oldData, { ...oldData, status: 'inactive' })
    }
  },

  async getMostExpensiveIngredients(userId, limit = 5) {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('unit_cost', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },
}
