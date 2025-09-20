// Mock product options API
import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const now = new Date()
  const current = now.getFullYear()
  const years = Array.from({ length: 10 }).map((_, i) => String(current - 5 + i))
  const seasons = ['전체', 'SS', 'FW', 'SPRING', 'SUMMER', 'AUTUMN', 'WINTER']
  const brands = ['(없음)', '브랜드A', '브랜드B', '브랜드C', '브랜드D']

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
  res.status(200).json({ years, seasons, brands })
}
