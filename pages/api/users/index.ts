// pages/api/users/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

// Mock 데이터 (데이터베이스 없이 사용)
const mockUsers = [
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
  try {
    switch (req.method) {
      case 'GET':
        return await getUsers(req, res);
      case 'POST':
        return await createUser(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUsers(req: NextApiRequest, res: NextApiResponse) {
  const { 
    search, 
    role, 
    status, 
    department, 
    page = 1, 
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  try {
    // Mock 데이터 사용
    let filteredUsers = [...mockUsers];

    // 필터링
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    if (department) {
      filteredUsers = filteredUsers.filter(user => 
        user.department.toLowerCase().includes((department as string).toLowerCase())
      );
    }

    // 정렬
    filteredUsers.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'lastLogin') {
        const aTime = new Date(aValue as string).getTime();
        const bTime = new Date(bValue as string).getTime();
        return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
      }
      
      if (sortOrder === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });

    // 페이지네이션
    const total = filteredUsers.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    res.json({
      users: paginatedUsers,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createUser(req: NextApiRequest, res: NextApiResponse) {
  const { name, email, password, role, department, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Mock 데이터에 추가
    const newUser = {
      id: String(mockUsers.length + 1),
      name,
      email,
      role: role?.toLowerCase() || 'user',
      department: department || '',
      status: 'active',
      lastLogin: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      avatar: '',
      phone: phone || '',
      groups: [],
      permissions: getDefaultPermissions(role || 'user')
    };

    mockUsers.push(newUser);

    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
}

function getDefaultPermissions(role: string): string[] {
  switch (role.toLowerCase()) {
    case 'admin':
      return ['*'];
    case 'manager':
      return ['users:read', 'users:create', 'users:update', 'products:read', 'products:create', 'products:update'];
    case 'operator':
      return ['users:read', 'users:update', 'products:read'];
    case 'user':
      return ['users:read:self', 'products:read'];
    default:
      return [];
  }
}
