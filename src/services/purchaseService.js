import { supabase } from '../config/supabase'

export const purchaseService = {
  async getPurchases(userId) {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        supplier:suppliers(name),
        category:ingredient_categories(name),
        purchase_items(*)
      `)
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false })

    if (error) throw error
    return data
  },

  async createPurchase(userId, purchase, items) {
    const { data: purchaseData, error: purchaseError } = await supabase
      .from('purchases')
      .insert([{ user_id: userId, ...purchase }])
      .select()
      .single()

    if (purchaseError) throw purchaseError

    // Calcular total_price para cada item
    const itemsWithPurchaseId = items.map((item) => ({
      purchase_id: purchaseData.id,
      ingredient_id: item.ingredient_id,
      quantity: parseFloat(item.quantity),
      unit_price: parseFloat(item.unit_price),
      total_price: parseFloat(item.quantity) * parseFloat(item.unit_price),
    }))

    const { error: itemsError } = await supabase
      .from('purchase_items')
      .insert(itemsWithPurchaseId)

    if (itemsError) throw itemsError
    return purchaseData
  },

  async updatePurchase(id, updates) {
    const { data, error } = await supabase
      .from('purchases')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deletePurchase(id) {
    await supabase.from('purchase_items').delete().eq('purchase_id', id)
    const { error } = await supabase.from('purchases').delete().eq('id', id)
    if (error) throw error
  },

  async getExpensesByCategory(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('purchases')
      .select('total, category:ingredient_categories(name)')
      .eq('user_id', userId)
      .gte('purchase_date', startDate)
      .lte('purchase_date', endDate)

    if (error) throw error

    const grouped = {}
    data.forEach((item) => {
      const categoryName = item.category?.name || 'Sem categoria'
      grouped[categoryName] = (grouped[categoryName] || 0) + item.total
    })

    return grouped
  },

  async getExpensesBySupplier(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('purchases')
      .select('total, supplier:suppliers(name)')
      .eq('user_id', userId)
      .gte('purchase_date', startDate)
      .lte('purchase_date', endDate)

    if (error) throw error

    const grouped = {}
    data.forEach((item) => {
      const supplierName = item.supplier?.name || 'Sem fornecedor'
      grouped[supplierName] = (grouped[supplierName] || 0) + item.total
    })

    return grouped
  },
}
