// pages/api/users/roles/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_ROLES } from '../../../../src/features/users/types/permissions';

// Mock 역할 데이터 (roles.ts와 동기화 필요)
let mockRoles = DEFAULT_ROLES.map((role, index) => ({
  ...role,
  id: String(index + 1),
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid role ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getRole(id, res);
      case 'PUT':
        return await updateRole(id, req.body, res);
      case 'DELETE':
        return await deleteRole(id, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getRole(id: string, res: NextApiResponse) {
  const role = mockRoles.find(r => r.id === id);

  if (!role) {
    return res.status(404).json({ error: 'Role not found' });
  }

  res.json({ role });
}

async function updateRole(id: string, data: any, res: NextApiResponse) {
  const roleIndex = mockRoles.findIndex(r => r.id === id);

  if (roleIndex === -1) {
    return res.status(404).json({ error: 'Role not found' });
  }

  const existingRole = mockRoles[roleIndex];

  // 시스템 역할은 권한만 수정 가능
  if (existingRole.isSystem && (data.name || data.description)) {
    return res.status(403).json({ 
      error: 'Cannot modify system role name or description. Only permissions can be updated.' 
    });
  }

  // 업데이트
  mockRoles[roleIndex] = {
    ...existingRole,
    ...data,
    id: existingRole.id, // ID는 변경 불가
    isSystem: existingRole.isSystem, // isSystem은 변경 불가
    updatedAt: new Date().toISOString()
  };

  res.json({ 
    role: mockRoles[roleIndex],
    message: 'Role updated successfully'
  });
}

async function deleteRole(id: string, res: NextApiResponse) {
  const roleIndex = mockRoles.findIndex(r => r.id === id);

  if (roleIndex === -1) {
    return res.status(404).json({ error: 'Role not found' });
  }

  const role = mockRoles[roleIndex];

  // 시스템 역할은 삭제 불가
  if (role.isSystem) {
    return res.status(403).json({ error: 'Cannot delete system role' });
  }

  // 삭제
  mockRoles = mockRoles.filter(r => r.id !== id);

  res.json({ 
    success: true,
    message: 'Role deleted successfully' 
  });
}

