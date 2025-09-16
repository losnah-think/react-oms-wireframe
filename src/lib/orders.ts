import supabaseAdmin from './supabaseClient'

export type OrderSummary = {
  id: string
  order_no?: string
  total_amount?: number
  status?: string
  shop_id?: string
  created_at?: string
}

export async function listOrders(limit = 100, offset = 0): Promise<OrderSummary[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, order_no, total_amount, status, shop_id, created_at')
    .order('created_at', { ascending: false })
    .range(offset, Math.max(0, offset + limit - 1))

  if (error) throw error
  return (data || []) as OrderSummary[]
}

export async function getOrder(id: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', id)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}
