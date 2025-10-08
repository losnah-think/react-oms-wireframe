// pages/api/users/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';

// Mock 데이터 (index.ts와 동기화 필요)
let mockUsers = [
  {
    id: '1',
    name: '김철수',
    email: 'kim@company.com',
    role: 'admin',
    department: 'IT팀',
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: new Date().toISOString(),
    avatar: '',
    phone: '010-1234-5678',
    groups: ['IT팀', '관리자'],
    permissions: ['*']
  },
  {
    id: '2',
    name: '이영희',
    email: 'lee@company.com',
    role: 'manager',
    department: '마케팅팀',
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: new Date().toISOString(),
    avatar: '',
    phone: '010-2345-6789',
    groups: ['마케팅팀'],
    permissions: ['users:read', 'users:create', 'users:update']
  },
  {
    id: '3',
    name: '박민수',
    email: 'park@company.com',
    role: 'user',
    department: '영업팀',
    status: 'inactive',
    lastLogin: '2025-01-10T14:20:00Z',
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2025-01-10T14:20:00Z',
    avatar: '',
    phone: '010-3456-7890',
    groups: ['영업팀'],
    permissions: ['users:read:self']
  },
  {
    id: '4',
    name: '정수진',
    email: 'jung@company.com',
    role: 'operator',
    department: '운영팀',
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: '2024-04-05T00:00:00Z',
    updatedAt: new Date().toISOString(),
    avatar: '',
    phone: '010-4567-8901',
    groups: ['운영팀'],
    permissions: ['users:read', 'users:update']
  },
  {
    id: '5',
    name: '최동욱',
    email: 'choi@company.com',
    role: 'user',
    department: 'IT팀',
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    avatar: '',
    phone: '010-5678-9012',
    groups: ['IT팀'],
    permissions: ['users:read:self']
  },
  {
    id: '6',
    name: '강미래',
    email: 'kang@company.com',
    role: 'manager',
    department: '인사팀',
    status: 'active',
    lastLogin: '2025-01-14T15:30:00Z',
    createdAt: '2024-06-15T00:00:00Z',
    updatedAt: '2025-01-14T15:30:00Z',
    avatar: '',
    phone: '010-6789-0123',
    groups: ['인사팀'],
    permissions: ['users:read', 'users:create', 'users:update']
  },
  {
    id: '7',
    name: '윤서연',
    email: 'yoon@company.com',
    role: 'user',
    department: '재무팀',
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: '2024-07-10T00:00:00Z',
    updatedAt: new Date().toISOString(),
    avatar: '',
    phone: '010-7890-1234',
    groups: ['재무팀'],
    permissions: ['users:read:self']
  },
  {
    id: '8',
    name: '한지민',
    email: 'han@company.com',
    role: 'operator',
    department: '고객지원팀',
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    avatar: '',
    phone: '010-8901-2345',
    groups: ['고객지원팀'],
    permissions: ['users:read', 'users:update']
  },
  {
    id: '9',
    name: '송지훈',
    email: 'song@company.com',
    role: 'user',
    department: '영업팀',
    status: 'pending',
    lastLogin: '-',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
    avatar: '',
    phone: '010-9012-3456',
    groups: [],
    permissions: []
  },
  {
    id: '10',
    name: '오민지',
    email: 'oh@company.com',
    role: 'manager',
    department: '마케팅팀',
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    avatar: '',
    phone: '010-0123-4567',
    groups: ['마케팅팀'],
    permissions: ['users:read', 'users:create', 'users:update']
  },
  {
    id: '11',
    name: '배성호',
    email: 'bae@company.com',
    role: 'user',
    department: 'IT팀',
    status: 'suspended',
    lastLogin: '2025-01-05T10:00:00Z',
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z',
    avatar: '',
    phone: '010-1234-0987',
    groups: ['IT팀'],
    permissions: []
  },
  {
    id: '12',
    name: '서지우',
    email: 'seo@company.com',
    role: 'operator',
    department: '운영팀',
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    avatar: '',
    phone: '010-2345-0987',
    groups: ['운영팀'],
    permissions: ['users:read', 'users:update']
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getUser(id, res);
      case 'PUT':
        return await updateUser(id, req.body, res);
      case 'DELETE':
        return await deleteUser(id, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUser(id: string, res: NextApiResponse) {
  const user = mockUsers.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
}

async function updateUser(id: string, data: any, res: NextApiResponse) {
  const userIndex = mockUsers.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // 업데이트
  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    ...data,
    updatedAt: new Date().toISOString()
  };

  res.json({ user: mockUsers[userIndex] });
}

async function deleteUser(id: string, res: NextApiResponse) {
  const userIndex = mockUsers.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // 삭제
  mockUsers = mockUsers.filter(u => u.id !== id);

  res.json({ success: true, message: 'User deleted successfully' });
}
