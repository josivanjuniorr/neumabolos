import { supabase } from '../config/supabase'

export const categoryService = {
  async getCategories(userId) {
    const { data, error } = await supabase
      .from('ingredient_categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data
  },

  async getCategoryById(id) {
    const { data, error } = await supabase
      .from('ingredient_categories')
      .select('*')
      .eq('id', id)
      .maybeSingle()

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

  async initializeDefaultCategories(userId) {
    const defaultCategories = [
      { name: 'Farinha e Açúcar' },
      { name: 'Ovos e Laticínios' },
      { name: 'Chocolate e Doces' },
      { name: 'Frutas e Aromatizantes' },
      { name: 'Gorduras e Óleos' },
      { name: 'Essências e Corantes' },
      { name: 'Outros' },
    ]

    const categoriesWithUserId = defaultCategories.map(cat => ({
      ...cat,
      user_id: userId
    }))

    const { data, error } = await supabase
      .from('ingredient_categories')
      .insert(categoriesWithUserId)
      .select()

    if (error) throw error
    return data
  }
}

// Serviço para categorias de compras
export const purchaseCategoryService = {
  async getCategories(userId) {
    const { data, error } = await supabase
      .from('purchase_categories')
      .select('*')
      .order('type', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error
    return data
  },

  async getCategoryById(id) {
    const { data, error } = await supabase
      .from('purchase_categories')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async createCategory(userId, category) {
    const { data, error } = await supabase
      .from('purchase_categories')
      .insert([{ user_id: userId, ...category }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateCategory(id, updates) {
    const { data, error } = await supabase
      .from('purchase_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteCategory(id) {
    const { error } = await supabase
      .from('purchase_categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async initializeDefaultCategories(userId) {
    const defaultCategories = [
      { name: 'CMV - Matéria Prima', type: 'CMV', description: 'Custo de Mercadoria Vendida - Ingredientes' },
      { name: 'CMV - Embalagens', type: 'CMV', description: 'Custo de Mercadoria Vendida - Embalagens' },
      { name: 'Operacional - Energia', type: 'Operacional', description: 'Contas de energia elétrica' },
      { name: 'Operacional - Água', type: 'Operacional', description: 'Contas de água' },
      { name: 'Operacional - Aluguel', type: 'Operacional', description: 'Aluguel do espaço' },
      { name: 'Operacional - Salários', type: 'Operacional', description: 'Folha de pagamento' },
      { name: 'Operacional - Marketing', type: 'Operacional', description: 'Publicidade e marketing' },
      { name: 'Operacional - Manutenção', type: 'Operacional', description: 'Manutenção de equipamentos' },
      { name: 'Imposto - Federal', type: 'Imposto', description: 'Impostos federais' },
      { name: 'Imposto - Estadual', type: 'Imposto', description: 'Impostos estaduais' },
      { name: 'Outros', type: 'Outros', description: 'Outras despesas não categorizadas' },
    ]

    const categoriesToInsert = defaultCategories.map(cat => ({
      user_id: userId,
      ...cat
    }))

    const { data, error } = await supabase
      .from('purchase_categories')
      .insert(categoriesToInsert)
      .select()

    if (error) {
      // Ignorar erro de duplicata
      if (!error.message.includes('duplicate') && !error.message.includes('unique')) {
        throw error
      }
    }
    return data
  }
}
