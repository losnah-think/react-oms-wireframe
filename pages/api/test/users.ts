// pages/api/test/users.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 사용자 목록 API 테스트
    const usersResponse = await fetch(`${req.headers.host?.includes('localhost') ? 'http' : 'https'}://${req.headers.host}/api/users`);
    const usersData = await usersResponse.json();

    // 사용자 통계 API 테스트
    const statsResponse = await fetch(`${req.headers.host?.includes('localhost') ? 'http' : 'https'}://${req.headers.host}/api/users/stats`);
    const statsData = await statsResponse.json();

    res.json({
      success: true,
      message: '사용자 관리 API 테스트 성공',
      data: {
        users: {
          count: usersData.users?.length || 0,
          total: usersData.total || 0,
          page: usersData.page || 1,
          totalPages: usersData.totalPages || 0
        },
        stats: statsData.stats || null,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('API 테스트 실패:', error);
    res.status(500).json({
      success: false,
      error: 'API 테스트 실패',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
