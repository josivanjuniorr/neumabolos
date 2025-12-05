import { supabase } from '../config/supabase'

// Categorias de Compras
export const purchaseCategoryService = {
  async getCategories(userId) {
    const { data, error } = await supabase
      .from('purchase_categories')
      .select('*')
      .eq('user_id', userId)
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

  async createCategory(userId, categoryData) {
    const { data, error } = await supabase
      .from('purchase_categories')
      .insert([{ ...categoryData, user_id: userId }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateCategory(id, categoryData) {
    const { data, error } = await supabase
      .from('purchase_categories')
      .update(categoryData)
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
    return true
  },

  async initializeDefaultCategories(userId) {
    const defaultCategories = [
      { name: 'CMV - Matéria Prima', type: 'CMV', description: 'Custo de Mercadoria Vendida - Ingredientes' },
      { name: 'Operacional - Energia', type: 'Operacional', description: 'Contas de energia elétrica' },
      { name: 'Operacional - Água', type: 'Operacional', description: 'Contas de água' },
      { name: 'Operacional - Aluguel', type: 'Operacional', description: 'Aluguel do espaço' },
      { name: 'Operacional - Salários', type: 'Operacional', description: 'Folha de pagamento' },
      { name: 'Operacional - Marketing', type: 'Operacional', description: 'Publicidade e marketing' },
      { name: 'Operacional - Embalagens', type: 'Operacional', description: 'Caixas, sacos, etiquetas' },
      { name: 'Imposto - Federal', type: 'Imposto', description: 'Impostos federais' },
      { name: 'Imposto - Estadual', type: 'Imposto', description: 'Impostos estaduais' },
      { name: 'Imposto - Municipal', type: 'Imposto', description: 'Impostos municipais' },
      { name: 'Outros', type: 'Outros', description: 'Despesas diversas' },
    ]

    const categoriesWithUserId = defaultCategories.map(cat => ({
      ...cat,
      user_id: userId
    }))

    const { data, error } = await supabase
      .from('purchase_categories')
      .insert(categoriesWithUserId)
      .select()

    if (error) throw error
    return data
  }
}

// Despesas Operacionais
export const operationalExpenseService = {
  async getExpenses(userId, filters = {}) {
    let query = supabase
      .from('operational_expenses')
      .select(`
        *,
        category:purchase_categories(id, name, type),
        supplier:suppliers(id, name)
      `)
      .eq('user_id', userId)
      .order('expense_date', { ascending: false })

    if (filters.startDate) {
      query = query.gte('expense_date', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('expense_date', filters.endDate)
    }
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  async getExpenseById(id) {
    const { data, error } = await supabase
      .from('operational_expenses')
      .select(`
        *,
        category:purchase_categories(id, name, type),
        supplier:suppliers(id, name)
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async createExpense(userId, expenseData) {
    const { data, error } = await supabase
      .from('operational_expenses')
      .insert([{ ...expenseData, user_id: userId }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateExpense(id, expenseData) {
    const { data, error } = await supabase
      .from('operational_expenses')
      .update({ ...expenseData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteExpense(id) {
    const { error } = await supabase
      .from('operational_expenses')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  async getExpensesByPeriod(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('operational_expenses')
      .select(`
        *,
        category:purchase_categories(id, name, type)
      `)
      .eq('user_id', userId)
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .order('expense_date', { ascending: false })

    if (error) throw error
    return data
  },

  async getExpensesByCategory(userId) {
    const { data, error } = await supabase
      .from('operational_expenses')
      .select(`
        amount,
        category:purchase_categories(id, name, type)
      `)
      .eq('user_id', userId)

    if (error) throw error

    // Agrupar por categoria
    const grouped = data.reduce((acc, expense) => {
      const categoryName = expense.category?.name || 'Sem Categoria'
      const categoryType = expense.category?.type || 'Outros'
      
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          type: categoryType,
          total: 0
        }
      }
      
      acc[categoryName].total += parseFloat(expense.amount)
      return acc
    }, {})

    return Object.values(grouped)
  }
}
