import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 로그 검색 API
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q, category, level, limit = '100' } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const limitNum = parseInt(limit as string);

    // 검색 조건
    const where: any = {
      OR: [
        { userName: { contains: q as string, mode: 'insensitive' } },
        { target: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
        { action: { contains: q as string, mode: 'insensitive' } },
      ],
    };

    // 추가 필터
    if (category) where.category = category;
    if (level) where.level = level;

    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limitNum,
    });

    // details를 JSON으로 파싱
    const logsWithParsedDetails = logs.map((log: any) => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    }));

    return res.status(200).json(logsWithParsedDetails);
  } catch (error) {
    console.error('Log search error:', error);
    return res.status(500).json({ error: 'Failed to search logs' });
  }
}
