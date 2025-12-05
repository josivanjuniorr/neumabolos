import { supabase } from '../config/supabase'

export const seedDatabase = async (userId) => {
  try {
    console.log('Iniciando seed do banco de dados...')

    // 1. Criar categorias de insumos
    const { data: categories, error: categoriesError } =
      await supabase
        .from('ingredient_categories')
        .insert([
          {
            user_id: userId,
            name: 'Farinha e Açúcar',
            description: 'Farinhas, açúcares e adoçantes',
          },
          {
            user_id: userId,
            name: 'Ovos e Laticínios',
            description: 'Ovos, leite, manteiga, queijo',
          },
          {
            user_id: userId,
            name: 'Chocolate e Doces',
            description: 'Chocolates, cobertura, calda',
          },
          {
            user_id: userId,
            name: 'Frutas e Aromatizantes',
            description: 'Frutas, essências, extratos',
          },
          {
            user_id: userId,
            name: 'Cobertura e Decoração',
            description: 'Fondant, confeitos, corantes',
          },
        ])
        .select()

    if (categoriesError) throw categoriesError
    console.log('✓ Categorias criadas:', categories?.length)

    // 2. Criar fornecedores
    const { data: suppliers, error: suppliersError } =
      await supabase
        .from('suppliers')
        .insert([
          {
            user_id: userId,
            name: 'Distribuidora ABC',
            phone: '(11) 3000-1000',
            cnpj_cpf: '12.345.678/0001-90',
            products_supplied: 'Farinha, Açúcar, Ovos',
            rating: 4.8,
            observations:
              'Fornecedor principal, entrega rápida',
          },
          {
            user_id: userId,
            name: 'Produtos Gourmet XYZ',
            phone: '(11) 3001-2000',
            cnpj_cpf: '98.765.432/0001-10',
            products_supplied: 'Chocolate, Cobertura Especial',
            rating: 4.5,
            observations:
              'Fornecedor de produtos premium',
          },
          {
            user_id: userId,
            name: 'Frutas e Verduras Ltda',
            phone: '(11) 3002-3000',
            cnpj_cpf: '55.555.555/0001-55',
            products_supplied: 'Frutas frescas, Essências',
            rating: 4.2,
            observations:
              'Apenas frutas de qualidade superior',
          },
          {
            user_id: userId,
            name: 'Laticínios Premium',
            phone: '(11) 3003-4000',
            cnpj_cpf: '77.777.777/0001-77',
            products_supplied: 'Leite, Manteiga, Queijo',
            rating: 4.9,
            observations:
              'Melhor fornecedor de laticínios',
          },
        ])
        .select()

    if (suppliersError) throw suppliersError
    console.log('✓ Fornecedores criados:', suppliers?.length)

    // 3. Criar insumos
    const { data: ingredients, error: ingredientsError } =
      await supabase
        .from('ingredients')
        .insert([
          {
            user_id: userId,
            name: 'Farinha de Trigo',
            category_id: categories[0].id,
            unit_measure: 'kg',
            unit_cost: 3.5,
            supplier_id: suppliers[0].id,
            observations: 'Farinha integral de qualidade',
          },
          {
            user_id: userId,
            name: 'Açúcar Cristal',
            category_id: categories[0].id,
            unit_measure: 'kg',
            unit_cost: 2.8,
            supplier_id: suppliers[0].id,
            observations: 'Açúcar cristal fino',
          },
          {
            user_id: userId,
            name: 'Ovos Grandes',
            category_id: categories[1].id,
            unit_measure: 'dz',
            unit_cost: 15.0,
            supplier_id: suppliers[3].id,
            observations: 'Ovos brancos grandes',
          },
          {
            user_id: userId,
            name: 'Manteiga sem Sal',
            category_id: categories[1].id,
            unit_measure: 'kg',
            unit_cost: 28.5,
            supplier_id: suppliers[3].id,
            observations: 'Manteiga importada',
          },
          {
            user_id: userId,
            name: 'Chocolate Belga 70%',
            category_id: categories[2].id,
            unit_measure: 'kg',
            unit_cost: 45.0,
            supplier_id: suppliers[1].id,
            observations: 'Chocolate belga premium',
          },
          {
            user_id: userId,
            name: 'Morango Fresco',
            category_id: categories[3].id,
            unit_measure: 'kg',
            unit_cost: 18.0,
            supplier_id: suppliers[2].id,
            observations: 'Morangos frescos e doces',
          },
          {
            user_id: userId,
            name: 'Essência de Baunilha',
            category_id: categories[3].id,
            unit_measure: 'ml',
            unit_cost: 0.5,
            supplier_id: suppliers[2].id,
            observations: 'Essência natural de baunilha',
          },
          {
            user_id: userId,
            name: 'Fondant Branco',
            category_id: categories[4].id,
            unit_measure: 'kg',
            unit_cost: 25.0,
            supplier_id: suppliers[1].id,
            observations: 'Fondant para cobertura',
          },
        ])
        .select()

    if (ingredientsError) throw ingredientsError
    console.log('✓ Insumos criados:', ingredients?.length)

    // 4. Criar compras
    const today = new Date()
    const { data: purchases, error: purchasesError } =
      await supabase
        .from('purchases')
        .insert([
          {
            user_id: userId,
            purchase_date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            supplier_id: suppliers[0].id,
            category_id: categories[0].id,
            payment_form: 'pix',
            total: 385.0,
            observations: 'Compra de farinha e açúcar para produção',
          },
          {
            user_id: userId,
            purchase_date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            supplier_id: suppliers[1].id,
            category_id: categories[2].id,
            payment_form: 'cartao_credito',
            total: 675.0,
            observations: 'Chocolate premium para bolos especiais',
          },
          {
            user_id: userId,
            purchase_date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            supplier_id: suppliers[3].id,
            category_id: categories[1].id,
            payment_form: 'dinheiro',
            total: 450.0,
            observations: 'Ovos e manteiga para produção semanal',
          },
        ])
        .select()

    if (purchasesError) throw purchasesError
    console.log('✓ Compras criadas:', purchases?.length)

    // 5. Criar itens de compra
    const { error: itemsError } = await supabase
      .from('purchase_items')
      .insert([
        {
          purchase_id: purchases[0].id,
          ingredient_id: ingredients[0].id,
          quantity: 50,
          unit_price: 3.5,
          total_price: 175.0,
        },
        {
          purchase_id: purchases[0].id,
          ingredient_id: ingredients[1].id,
          quantity: 60,
          unit_price: 2.8,
          total_price: 210.0,
        },
        {
          purchase_id: purchases[1].id,
          ingredient_id: ingredients[4].id,
          quantity: 15,
          unit_price: 45.0,
          total_price: 675.0,
        },
        {
          purchase_id: purchases[2].id,
          ingredient_id: ingredients[2].id,
          quantity: 30,
          unit_price: 15.0,
          total_price: 450.0,
        },
      ])

    if (itemsError) throw itemsError
    console.log('✓ Itens de compra criados')

    // 6. Criar produção diária
    const { error: productionError } = await supabase
      .from('daily_production')
      .insert([
        {
          user_id: userId,
          production_date: today.toISOString().split('T')[0],
          product_name: 'Bolo de Chocolate',
          quantity: 5,
          estimated_cost: 125.0,
          destination: 'venda',
          observations: 'Bolos inteiros para venda no balcão',
        },
        {
          user_id: userId,
          production_date: today.toISOString().split('T')[0],
          product_name: 'Cupcake de Morango',
          quantity: 24,
          estimated_cost: 48.0,
          destination: 'encomenda',
          observations: 'Encomenda do cliente João',
        },
        {
          user_id: userId,
          production_date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          product_name: 'Pudim de Leite Condensado',
          quantity: 12,
          estimated_cost: 36.0,
          destination: 'pronta_entrega',
          observations: 'Produção para pronta entrega',
        },
      ])

    if (productionError) throw productionError
    console.log('✓ Produção diária criada')

    // 7. Criar desperdício
    const { error: wasteError } = await supabase
      .from('waste_analysis')
      .insert([
        {
          user_id: userId,
          waste_date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          product_name: 'Bolo de Chocolate',
          quantity: 0.5,
          waste_type: 'erro',
          estimated_cost: 25.0,
          responsible: 'Maria',
          observations: 'Erro na cobertura, não pôde ser vendido',
        },
        {
          user_id: userId,
          waste_date: today.toISOString().split('T')[0],
          product_name: 'Morango',
          quantity: 0.2,
          waste_type: 'vencimento',
          estimated_cost: 3.6,
          responsible: 'Carlos',
          observations: 'Morangos com manchas',
        },
      ])

    if (wasteError) throw wasteError
    console.log('✓ Desperdício criado')

    // 8. Criar fluxo de caixa
    const { error: cashFlowError } = await supabase
      .from('cash_flow')
      .insert([
        {
          user_id: userId,
          transaction_date: today.toISOString().split('T')[0],
          transaction_type: 'entrada',
          description: 'Vendas do dia',
          amount: 1500.0,
          payment_form: 'dinheiro',
          responsible: 'João',
          observations: 'Vendas em dinheiro e PIX do dia',
        },
        {
          user_id: userId,
          transaction_date: today.toISOString().split('T')[0],
          transaction_type: 'saída',
          description: 'Compra de insumos',
          amount: 450.0,
          payment_form: 'pix',
          responsible: 'Maria',
          observations: 'Compra semanal de laticínios',
        },
        {
          user_id: userId,
          transaction_date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          transaction_type: 'entrada',
          description: 'Vendas do dia',
          amount: 1200.0,
          payment_form: 'cartao_credito',
          responsible: 'João',
          observations: 'Vendas em cartão',
        },
        {
          user_id: userId,
          transaction_date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          transaction_type: 'saída',
          description: 'Aluguel da loja',
          amount: 2000.0,
          payment_form: 'transferencia',
          responsible: 'Proprietário',
          observations: 'Aluguel mensal',
        },
      ])

    if (cashFlowError) throw cashFlowError
    console.log('✓ Fluxo de caixa criado')

    console.log(
      '✓ Seed concluído com sucesso!'
    )
    return true
  } catch (error) {
    console.error('Erro ao fazer seed:', error.message)
    return false
  }
}
