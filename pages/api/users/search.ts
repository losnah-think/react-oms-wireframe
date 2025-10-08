// pages/api/users/search.ts
import { NextApiRequest, NextApiResponse } from 'next';

// Mock 데이터
const mockUsers = [
  {
    id: '1',
    name: '김철수',
    email: 'kim@company.com',
    role: 'ADMIN',
    department: 'IT팀',
    status: 'ACTIVE',
    lastLogin: '2025-01-15T09:30:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-01-15T09:30:00Z',
    avatar: '',
    phone: '010-1234-5678',
    groups: ['IT팀'],
    permissions: ['*']
  },
  {
    id: '2',
    name: '이영희',
    email: 'lee@company.com',
    role: 'MANAGER',
    department: '마케팅팀',
    status: 'ACTIVE',
    lastLogin: '2025-01-15T08:45:00Z',
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: '2025-01-15T08:45:00Z',
    avatar: '',
    phone: '010-2345-6789',
    groups: ['마케팅팀'],
    permissions: ['users:read', 'users:create', 'users:update']
  },
  {
    id: '3',
    name: '박민수',
    email: 'park@company.com',
    role: 'USER',
    department: '영업팀',
    status: 'INACTIVE',
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
    role: 'OPERATOR',
    department: '운영팀',
    status: 'ACTIVE',
    lastLogin: '2025-01-14T16:30:00Z',
    createdAt: '2024-04-05T00:00:00Z',
    updatedAt: '2025-01-14T16:30:00Z',
    avatar: '',
    phone: '010-4567-8901',
    groups: ['운영팀'],
    permissions: ['users:read', 'users:update']
  },
  {
    id: '5',
    name: '최동욱',
    email: 'choi@company.com',
    role: 'USER',
    department: 'IT팀',
    status: 'ACTIVE',
    lastLogin: '2025-01-15T10:00:00Z',
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    avatar: '',
    phone: '010-5678-9012',
    groups: ['IT팀'],
    permissions: ['users:read:self']
  },
  {
    id: '6',
    name: '강미래',
    email: 'kang@company.com',
    role: 'MANAGER',
    department: '인사팀',
    status: 'ACTIVE',
    lastLogin: '2025-01-14T15:30:00Z',
    createdAt: '2024-06-15T00:00:00Z',
    updatedAt: '2025-01-14T15:30:00Z',
    avatar: '',
    phone: '010-6789-0123',
    groups: ['인사팀'],
    permissions: ['users:read', 'users:create', 'users:update']
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q, limit = 10, type = 'all' } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        error: '검색어가 필요합니다',
        message: '검색할 키워드를 제공해주세요'
      });
    }

    const searchTerm = q.toLowerCase();
    const limitNum = Number(limit);
    const searchType = type as string;

    let searchResults = [...mockUsers];

    // 검색 타입별 필터링
    if (searchType === 'name') {
      searchResults = searchResults.filter(user =>
        user.name.toLowerCase().includes(searchTerm)
      );
    } else if (searchType === 'email') {
      searchResults = searchResults.filter(user =>
        user.email.toLowerCase().includes(searchTerm)
      );
    } else if (searchType === 'department') {
      searchResults = searchResults.filter(user =>
        user.department.toLowerCase().includes(searchTerm)
      );
    } else {
      // 전체 검색
      searchResults = searchResults.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.department.toLowerCase().includes(searchTerm)
      );
    }

    // 정확도 기반 정렬
    const sortedResults = searchResults.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(searchTerm);
      const bNameMatch = b.name.toLowerCase().includes(searchTerm);
      const aEmailMatch = a.email.toLowerCase().includes(searchTerm);
      const bEmailMatch = b.email.toLowerCase().includes(searchTerm);

      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      if (aEmailMatch && !bEmailMatch) return -1;
      if (!aEmailMatch && bEmailMatch) return 1;

      return a.name.localeCompare(b.name);
    });

    // 제한된 결과
    const limitedResults = sortedResults.slice(0, limitNum);

    // 검색 제안 생성
    const suggestions = generateSearchSuggestions(searchTerm, searchResults);

    res.json({
      users: limitedResults,
      total: searchResults.length,
      query: q,
      limit: limitNum,
      type: searchType,
      suggestions
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
}

function generateSearchSuggestions(searchTerm: string, users: any[]): string[] {
  const suggestions = new Set<string>();

  users.forEach(user => {
    if (user.name.toLowerCase().includes(searchTerm)) {
      suggestions.add(user.name);
    }
    if (user.email.toLowerCase().includes(searchTerm)) {
      suggestions.add(user.email);
    }
    if (user.department && user.department.toLowerCase().includes(searchTerm)) {
      suggestions.add(user.department);
    }
  });

  return Array.from(suggestions).slice(0, 5);
}
