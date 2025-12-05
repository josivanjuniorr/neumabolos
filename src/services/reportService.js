import { supabase } from '../config/supabase'
import { purchaseService } from './purchaseService'
import { productionService } from './productionService'
import { wasteService } from './wasteService'

export const reportService = {
  async getMonthlyExpenses(userId, year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('purchases')
      .select('total')
      .eq('user_id', userId)
      .gte('purchase_date', startDate)
      .lte('purchase_date', endDate)

    if (error) throw error

    return data.reduce((sum, item) => sum + item.total, 0)
  },

  async getDetailedMonthlyReport(userId, year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const [
      expenses,
      expensesByCategory,
      expensesBySupplier,
      productionCost,
      wasteCost,
    ] = await Promise.all([
      this.getMonthlyExpenses(userId, year, month),
      purchaseService.getExpensesByCategory(userId, startDate, endDate),
      purchaseService.getExpensesBySupplier(userId, startDate, endDate),
      productionService.getProductionCostByPeriod(userId, startDate, endDate),
      wasteService.getTotalWasteCost(userId, startDate, endDate),
    ])

    return {
      totalExpenses: expenses,
      expensesByCategory,
      expensesBySupplier,
      productionCost,
      wasteCost,
      netExpenses: expenses + productionCost + wasteCost,
    }
  },
}
