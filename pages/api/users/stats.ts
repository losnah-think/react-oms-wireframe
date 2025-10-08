// pages/api/users/stats.ts
import { NextApiRequest, NextApiResponse } from 'next';

// Mock 데이터
const mockUsers = [
  { id: '1', role: 'admin', status: 'active', lastLogin: new Date().toISOString() },
  { id: '2', role: 'manager', status: 'active', lastLogin: new Date().toISOString() },
  { id: '3', role: 'user', status: 'inactive', lastLogin: '2025-01-10T14:20:00Z' },
  { id: '4', role: 'operator', status: 'active', lastLogin: new Date().toISOString() },
  { id: '5', role: 'user', status: 'active', lastLogin: new Date().toISOString() },
  { id: '6', role: 'manager', status: 'active', lastLogin: '2025-01-14T15:30:00Z' },
  { id: '7', role: 'user', status: 'active', lastLogin: new Date().toISOString() },
  { id: '8', role: 'operator', status: 'active', lastLogin: new Date().toISOString() },
  { id: '9', role: 'user', status: 'pending', lastLogin: '-' },
  { id: '10', role: 'manager', status: 'active', lastLogin: new Date().toISOString() },
  { id: '11', role: 'user', status: 'suspended', lastLogin: '2025-01-05T10:00:00Z' },
  { id: '12', role: 'operator', status: 'active', lastLogin: new Date().toISOString() }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 개발 모드에서는 인증 우회
  if (process.env.NODE_ENV !== 'production') {
    try {
      // Mock 데이터로 통계 계산
      const stats = calculateUserStats(mockUsers);
      
      res.json({ stats });
    } catch (error) {
      console.error('Error calculating stats:', error);
      return res.status(500).json({ error: 'Failed to calculate stats' });
    }
  } else {
    // 프로덕션에서는 인증 체크 (나중에 구현)
    return res.status(401).json({ error: 'Authentication required' });
  }
}

function calculateUserStats(userList: any[]) {
  try {
    const total = userList.length;
    const active = userList.filter(u => u.status === 'active').length;
    const inactive = userList.filter(u => u.status === 'inactive').length;
    const pending = userList.filter(u => u.status === 'pending').length;
    const suspended = userList.filter(u => u.status === 'suspended').length;
    const admins = userList.filter(u => u.role === 'admin').length;
    const managers = userList.filter(u => u.role === 'manager').length;
    const operators = userList.filter(u => u.role === 'operator').length;
    const users = userList.filter(u => u.role === 'user').length;

    // 오늘 로그인한 사용자 수
    const today = new Date().toISOString().split('T')[0];
    const todayLogins = userList.filter(u => {
      if (!u.lastLogin || u.lastLogin === '-') return false;
      try {
        const loginDate = new Date(u.lastLogin).toISOString().split('T')[0];
        return loginDate === today;
      } catch (e) {
        return false;
      }
    }).length;

    return {
      total,
      active,
      inactive,
      pending,
      suspended,
      admins,
      managers,
      operators,
      users,
      todayLogins,
      weeklyLogins: 0,
      monthlyLogins: 0
    };
  } catch (error) {
    console.error('Error in calculateUserStats:', error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      pending: 0,
      suspended: 0,
      admins: 0,
      managers: 0,
      operators: 0,
      users: 0,
      todayLogins: 0,
      weeklyLogins: 0,
      monthlyLogins: 0
    };
  }
}
