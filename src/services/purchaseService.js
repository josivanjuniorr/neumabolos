import { supabase } from '../config/supabase'
import { cashFlowService } from './cashFlowService'

export const purchaseService = {
  async getPurchases(userId) {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        supplier:suppliers(name),
        category:purchase_categories(name, type),
        purchase_items(
          *,
          ingredient:ingredients(name, unit_measure)
        )
      `)
      .order('purchase_date', { ascending: false })

    if (error) {
      console.error('Erro ao buscar compras:', error)
      throw error
    }
    return data
  },

  async getPurchaseById(id) {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        supplier:suppliers(name),
        category:purchase_categories(name, type)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar compra:', error)
      throw error
    }

    // Buscar todos os itens desta compra
    const { data: items, error: itemsError } = await supabase
      .from('purchase_items')
      .select(`
        *,
        ingredient:ingredients(name, unit_measure)
      `)
      .eq('purchase_id', id)
      .order('created_at', { ascending: true })

    if (itemsError) {
      console.error('Erro ao buscar itens da compra:', itemsError)
      throw itemsError
    }

    return {
      ...data,
      purchase_items: items || [],
    }
  },

  async createPurchase(userId, purchase, items) {
    // Sanitizar dados antes de enviar
    const sanitizedPurchase = {
      user_id: userId,
      purchase_date: purchase.purchase_date,
      supplier_id: purchase.supplier_id || null,
      category_id: purchase.category_id || null,
      payment_form: purchase.payment_form || null,
      total: purchase.total,
    }

    const { data: purchaseData, error: purchaseError } = await supabase
      .from('purchases')
      .insert([sanitizedPurchase])
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

    // Criar saída automática no fluxo de caixa
    try {
      // Buscar nome do fornecedor para a descrição
      let supplierName = 'Fornecedor não informado'
      if (purchase.supplier_id) {
        const { data: supplierData } = await supabase
          .from('suppliers')
          .select('name')
          .eq('id', purchase.supplier_id)
          .single()
        
        if (supplierData) {
          supplierName = supplierData.name
        }
      }

      await cashFlowService.createTransaction(userId, {
        transaction_date: purchase.purchase_date,
        type: 'saída',
        category: 'Compras',
        description: `Compra - ${supplierName}`,
        amount: purchase.total,
        payment_form: purchase.payment_form || 'outros',
      })
    } catch (cashFlowError) {
      console.error('Erro ao criar saída no fluxo de caixa:', cashFlowError)
      // Não falhar a compra se houver erro no fluxo de caixa
    }

    return purchaseData
  },

  async updatePurchase(id, updates, items) {
    const { data, error } = await supabase
      .from('purchases')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Se houver itens a atualizar, primeiro deleta os antigos e insere os novos
    if (items && items.length > 0) {
      // Deletar itens antigos
      await supabase.from('purchase_items').delete().eq('purchase_id', id)

      // Inserir novos itens
      const itemsWithPurchaseId = items.map((item) => ({
        purchase_id: id,
        ingredient_id: item.ingredient_id,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.quantity) * parseFloat(item.unit_price),
      }))

      const { error: itemsError } = await supabase
        .from('purchase_items')
        .insert(itemsWithPurchaseId)

      if (itemsError) throw itemsError
    }

    return data
  },

  async deletePurchase(id) {
    // Buscar a compra para obter informações antes de deletar
    const { data: purchase } = await supabase
      .from('purchases')
      .select('purchase_date, total, supplier_id, user_id')
      .eq('id', id)
      .single()

    // Deletar itens da compra
    await supabase.from('purchase_items').delete().eq('purchase_id', id)
    
    // Deletar a compra
    const { error } = await supabase.from('purchases').delete().eq('id', id)
    if (error) throw error

    // Remover a transação correspondente no fluxo de caixa
    if (purchase) {
      try {
        // Buscar e deletar a transação de saída criada para esta compra
        const { data: transactions } = await supabase
          .from('cash_flow')
          .select('id')
          .eq('transaction_date', purchase.purchase_date)
          .eq('type', 'saída')
          .eq('category', 'Compras')
          .eq('amount', purchase.total)

        if (transactions && transactions.length > 0) {
          await supabase
            .from('cash_flow')
            .delete()
            .eq('id', transactions[0].id)
        }
      } catch (cashFlowError) {
        console.error('Erro ao deletar saída do fluxo de caixa:', cashFlowError)
      }
    }
  },

  async getExpensesByCategory(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('purchases')
      .select('total, category:purchase_categories(name, type)')
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
