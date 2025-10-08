// pages/api/activity-logs/stats.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock 통계 데이터
    const stats = {
      totalLogs: 125,
      successfulLogs: 98,
      failedLogs: 15,
      warningLogs: 12,
      logsByAction: {
        'USER_LOGIN': 45,
        'PRODUCT_CREATE': 23,
        'ORDER_UPDATE': 34,
        'LOGIN_FAILED': 15,
        'SYSTEM_CONFIG_UPDATE': 8
      },
      logsByResource: {
        'Auth': 60,
        'Product': 23,
        'Order': 34,
        'Settings': 8
      },
      logsBySeverity: {
        'LOW': 70,
        'MEDIUM': 35,
        'HIGH': 15,
        'CRITICAL': 5
      },
      recentLogins: 12,
      topUsers: [
        { userId: '1', userName: '김철수', count: 45 },
        { userId: '2', userName: '이영희', count: 32 },
        { userId: '4', userName: '정수진', count: 28 }
      ]
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
