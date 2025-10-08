// src/data/mockCompanies.ts
import { Company } from '../features/users/types';

export const mockCompanies: Company[] = [
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

// 회사별 부서 목록
export const departmentsByCompany: Record<string, string[]> = {
  'company-1': ['IT팀', '운영팀', '마케팅팀', '고객지원팀'],
  'company-2': ['영업팀', 'IT팀', '재무팀', '물류팀'],
  'company-3': ['디자인팀', '영업팀', '마케팅팀', '재무팀'],
  'company-4': ['영업팀', '재무팀', '물류팀', '품질관리팀']
};

