import { supabase } from '../config/supabase'

export const auditService = {
  /**
   * Registra uma ação de auditoria
   */
  async logAction(userId, action, tableName, recordId, oldData = null, newData = null) {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert([{
          user_id: userId,
          action,
          table_name: tableName,
          record_id: recordId,
          old_data: oldData,
          new_data: newData,
        }])

      if (error) throw error
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error)
      // Não lançar erro para não afetar a operação principal
    }
  },

  /**
   * Busca logs de auditoria com filtros
   */
  async getLogs(userId, filters = {}) {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Aplicar filtros opcionais
      if (filters.action) {
        query = query.eq('action', filters.action)
      }
      
      if (filters.tableName) {
        query = query.eq('table_name', filters.tableName)
      }
      
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate)
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error)
      throw error
    }
  },

  /**
   * Busca estatísticas de auditoria
   */
  async getStats(userId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('action, table_name')
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      if (error) throw error

      // Agregar estatísticas
      const stats = {
        total: data.length,
        byAction: {},
        byTable: {},
      }

      data.forEach(log => {
        // Contar por ação
        stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1
        
        // Contar por tabela
        stats.byTable[log.table_name] = (stats.byTable[log.table_name] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Erro ao buscar estatísticas de auditoria:', error)
      throw error
    }
  },
}
