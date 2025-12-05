import { supabase } from '../config/supabase'

export const categoryService = {
  async getCategories(userId) {
    const { data, error } = await supabase
      .from('ingredient_categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data
  },

  async getCategoryById(id) {
    const { data, error } = await supabase
      .from('ingredient_categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return data
  },

  async createCategory(userId, category) {
    const { data, error } = await supabase
      .from('ingredient_categories')
      .insert([
        {
          user_id: userId,
          ...category,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return data
  },

  async updateCategory(id, updates) {
    const { data, error } = await supabase
      .from('ingredient_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return data
  },

  async deleteCategory(id) {
    const { error } = await supabase
      .from('ingredient_categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
