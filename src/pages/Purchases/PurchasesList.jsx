import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks'
import { MainLayout, Card, Button, Table, Modal } from '../../components'
import { purchaseService } from '../../services/purchaseService'
import { PurchaseForm } from './PurchaseForm'

export const PurchasesList = () => {
  const { user } = useAuth()
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState(null)

  useEffect(() => {
    if (!user) return
    loadPurchases()
  }, [user])

  const loadPurchases = async () => {
    try {
      setLoading(true)
      const data = await purchaseService.getPurchases(user.id)
      setPurchases(data || [])
    } catch (error) {
      console.error('Erro ao carregar compras:', error)
      // Se o erro for de foreign key, mostrar mensagem mais clara
      if (error.message?.includes('foreign key') || error.message?.includes('violates')) {
        alert('⚠️ Existem compras com categorias inválidas. Recomenda-se limpar os dados antigos.\n\nExecute no Supabase SQL Editor:\n\nUPDATE purchases SET category_id = NULL WHERE category_id IS NOT NULL AND category_id NOT IN (SELECT id FROM purchase_categories);')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingPurchase(null)
    setShowModal(true)
  }

  const handleEdit = async (purchase) => {
    try {
      // Buscar a compra completa com todos os itens
      const fullPurchase = await purchaseService.getPurchaseById(purchase.id)
      setEditingPurchase(fullPurchase)
      setShowModal(true)
    } catch (error) {
      console.error('Erro ao carregar compra para edição:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await purchaseService.deletePurchase(id)
      await loadPurchases()
    } catch (error) {
      console.error('Erro ao deletar compra:', error)
    }
  }

  const handleSubmit = async () => {
    await loadPurchases()
    setShowModal(false)
  }

  const columns = [
    {
      key: 'purchase_date',
      label: 'Data',
      render: (value) =>
        new Date(value).toLocaleDateString('pt-BR'),
    },
    {
      key: 'supplier',
      label: 'Fornecedor',
      render: (value) => value?.name || 'Sem fornecedor',
    },
    {
      key: 'category',
      label: 'Categoria',
      render: (value) => value?.name || '-',
    },
    { key: 'payment_form', label: 'Forma de Pagamento' },
    {
      key: 'total',
      label: 'Total',
      render: (value) => `R$ ${value.toFixed(2)}`,
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Compras
          </h1>
          <Button variant="primary" onClick={handleAdd}>
            + Nova Compra
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            data={purchases}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            editingPurchase
              ? 'Editar Compra'
              : 'Nova Compra'
          }
          size="2xl"
        >
          <PurchaseForm
            purchase={editingPurchase}
            onSuccess={handleSubmit}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      </div>
    </MainLayout>
  )
}
