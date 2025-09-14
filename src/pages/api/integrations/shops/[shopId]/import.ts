import { NextApiRequest, NextApiResponse } from 'next'

// POST: 선택 상품 또는 전체 상품을 시스템으로 '가져오기' 시뮬레이트
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { shopId } = req.query
  const { productIds, mode } = req.body || {}

  const { requireRole } = await import('src/lib/permissions')
  const check = await requireRole(req as any, res as any, ['admin', 'operator'])
  if (!check.ok) return res.status(check.status).json(check.body)

  // 간단히 성공 응답과 배치번호를 반환
  const batchNumber = `BATCH_${new Date().getFullYear()}_${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`

  // 실제 구현에서는 비동기 import 작업을 큐잉하거나 DB에 기록합니다.
  res.status(200).json({ batchNumber, total: Array.isArray(productIds) ? productIds.length : 0, mode: mode || 'partial' })
}
