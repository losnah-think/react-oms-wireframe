import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 통합 로그 API
 * - POST: 로그 생성 (서버 타임스탬프 자동 생성)
 * - GET: 로그 조회
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return handleCreate(req, res);
  } else if (req.method === 'GET') {
    return handleList(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * 로그 생성 - 서버 타임스탬프로 기록
 */
async function handleCreate(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      userId,
      userName,
      category,
      action,
      target,
      targetId,
      description,
      details,
      level,
      userAgent,
    } = req.body;

    // 필수 필드 검증
    if (!userId || !userName || !category || !action || !target || !description || !level) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // IP 주소 추출
    const ipAddress = 
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown';

    // DB에 로그 생성 (timestamp는 DB 기본값 CURRENT_TIMESTAMP로 자동 생성)
    const logEntry = await prisma.activityLog.create({
      data: {
        userId,
        userName,
        category,
        action,
        target,
        targetId: targetId || null,
        description,
        details: details ? JSON.stringify(details) : null,
        level,
        ipAddress,
        userAgent: userAgent || null,
        // timestamp는 DB 기본값으로 자동 생성됨
      },
    });

    return res.status(201).json(logEntry);
  } catch (error) {
    console.error('Log creation error:', error);
    return res.status(500).json({ error: 'Failed to create log' });
  }
}

/**
 * 로그 목록 조회
 */
async function handleList(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      userId,
      category,
      action,
      level,
      startDate,
      endDate,
      search,
      page = '1',
      limit = '50',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 필터 조건 구성
    const where: any = {};

    if (userId) where.userId = userId;
    if (category) where.category = category;
    if (action) where.action = action;
    if (level) where.level = level;

    // 날짜 범위 필터
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    // 검색 필터
    if (search) {
      where.OR = [
        { userName: { contains: search as string, mode: 'insensitive' } },
        { target: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { action: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // 로그 조회 (timestamp 내림차순 - 최신순)
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.activityLog.count({ where }),
    ]);

    // details를 JSON으로 파싱
    const logsWithParsedDetails = logs.map((log: any) => ({
      ...log,
      details: log.details ? JSON.parse(log.details as string) : null,
    }));

    return res.status(200).json({
      logs: logsWithParsedDetails,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Log list error:', error);
    return res.status(500).json({ error: 'Failed to fetch logs' });
  }
}
