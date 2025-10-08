// pages/api/users/roles.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_ROLES } from '../../../src/features/users/types/permissions';

// Mock 역할 데이터
let mockRoles = DEFAULT_ROLES.map((role, index) => ({
  ...role,
  id: String(index + 1),
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 개발 모드에서는 인증 우회
  if (process.env.NODE_ENV !== 'production') {
    try {
      switch (req.method) {
        case 'GET':
          return await getRoles(req, res);
        case 'POST':
          return await createRole(req, res);
        default:
          return res.status(405).json({ error: 'Method not allowed' });
      }
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // 프로덕션에서는 인증 체크 (나중에 구현)
  return res.status(401).json({ error: 'Authentication required' });
}

async function getRoles(req: NextApiRequest, res: NextApiResponse) {
  const { 
    search,
    isSystem
  } = req.query;

  try {
    let filteredRoles = [...mockRoles];

    // 필터링
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredRoles = filteredRoles.filter(role => 
        role.name.toLowerCase().includes(searchTerm) ||
        role.description.toLowerCase().includes(searchTerm)
      );
    }

    if (isSystem !== undefined) {
      const systemFilter = isSystem === 'true';
      filteredRoles = filteredRoles.filter(role => role.isSystem === systemFilter);
    }

    res.json({
      roles: filteredRoles,
      total: filteredRoles.length
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createRole(req: NextApiRequest, res: NextApiResponse) {
  const { name, description, permissions } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newRole = {
      id: String(mockRoles.length + 1),
      name: name.toUpperCase(),
      description,
      permissions: permissions || [],
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockRoles.push(newRole);

    res.status(201).json({ role: newRole });
  } catch (error) {
    console.error('Error creating role:', error);
    return res.status(500).json({ error: 'Failed to create role' });
  }
}

