import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 로그 내보내기 API
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      userId,
      category,
      action,
      level,
      startDate,
      endDate,
      format = 'csv',
    } = req.query;

    // 필터 조건
    const where: any = {};
    if (userId) where.userId = userId;
    if (category) where.category = category;
    if (action) where.action = action;
    if (level) where.level = level;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    // 로그 조회
    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });

    if (format === 'csv') {
      // CSV 생성
      const csvHeader = 'ID,시간,사용자,카테고리,액션,대상,대상ID,설명,레벨,IP주소\n';
      const csvRows = logs.map((log: any) => {
        return [
          log.id,
          log.timestamp.toISOString(),
          log.userName,
          log.category,
          log.action,
          log.target,
          log.targetId || '',
          `"${log.description.replace(/"/g, '""')}"`,
          log.level,
          log.ipAddress || '',
        ].join(',');
      }).join('\n');

      const csv = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=logs_${Date.now()}.csv`);
      return res.status(200).send('\uFEFF' + csv); // UTF-8 BOM for Excel
    } else {
      // JSON
      const logsWithParsedDetails = logs.map((log: any) => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
      }));

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=logs_${Date.now()}.json`);
      return res.status(200).json(logsWithParsedDetails);
    }
  } catch (error) {
    console.error('Log export error:', error);
    return res.status(500).json({ error: 'Failed to export logs' });
  }
}
