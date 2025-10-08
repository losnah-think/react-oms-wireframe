// pages/api/users/export.ts
import { NextApiRequest, NextApiResponse } from 'next';

// Mock 데이터 (실제로는 데이터베이스에서 가져옴)
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
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userIds, format = 'csv' } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        error: '사용자 ID 목록이 필요합니다',
        message: '내보낼 사용자 ID 배열을 제공해주세요'
      });
    }

    // 선택된 사용자 필터링
    const selectedUsers = mockUsers.filter(user => userIds.includes(user.id));
    
    if (selectedUsers.length === 0) {
      return res.status(404).json({ 
        error: '선택된 사용자를 찾을 수 없습니다',
        message: '유효한 사용자 ID를 제공해주세요'
      });
    }

    if (format === 'csv') {
      // CSV 형식으로 변환
      const csvHeaders = [
        'ID',
        '이름',
        '이메일',
        '역할',
        '부서',
        '상태',
        '전화번호',
        '마지막 로그인',
        '생성일',
        '수정일',
        '그룹',
        '권한'
      ];

      const csvRows = selectedUsers.map(user => [
        user.id,
        user.name,
        user.email,
        user.role,
        user.department || '',
        user.status,
        user.phone || '',
        user.lastLogin ? new Date(user.lastLogin).toLocaleString('ko-KR') : '',
        new Date(user.createdAt).toLocaleString('ko-KR'),
        new Date(user.updatedAt).toLocaleString('ko-KR'),
        user.groups.join('; '),
        user.permissions.join('; ')
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      // CSV 파일 다운로드
      const filename = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-cache');
      
      // BOM 추가 (Excel에서 한글 깨짐 방지)
      res.write('\uFEFF');
      res.end(csvContent);

    } else if (format === 'json') {
      // JSON 형식으로 반환
      res.json({
        success: true,
        message: `${selectedUsers.length}명의 사용자 데이터를 내보냈습니다`,
        data: {
          users: selectedUsers,
          exportedAt: new Date().toISOString(),
          totalCount: selectedUsers.length
        }
      });

    } else {
      return res.status(400).json({ 
        error: '지원하지 않는 형식입니다',
        message: 'csv 또는 json 형식을 선택해주세요'
      });
    }

  } catch (error) {
    console.error('사용자 내보내기 오류:', error);
    return res.status(500).json({ 
      error: '사용자 데이터 내보내기에 실패했습니다',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
