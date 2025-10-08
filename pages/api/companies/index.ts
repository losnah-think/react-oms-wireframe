// pages/api/companies/index.ts
import { NextApiRequest, NextApiResponse } from 'next';

// Mock 회사 데이터
const mockCompanies = [
  {
    id: 'company-1',
    name: '플고물류',
    code: 'FULGO',
    description: '본사',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'company-2',
    name: '에이스전자',
    code: 'ACE',
    description: '전자제품 유통',
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: 'company-3',
    name: '베스트패션',
    code: 'BEST',
    description: '의류 유통',
    createdAt: '2024-03-01T00:00:00Z'
  },
  {
    id: 'company-4',
    name: '스마트식품',
    code: 'SMART',
    description: '식품 유통',
    createdAt: '2024-04-01T00:00:00Z'
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { search } = req.query;
    
    let filteredCompanies = [...mockCompanies];
    
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredCompanies = filteredCompanies.filter(company => 
        company.name.toLowerCase().includes(searchTerm) ||
        company.code.toLowerCase().includes(searchTerm)
      );
    }
    
    res.json({
      companies: filteredCompanies,
      total: filteredCompanies.length
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

