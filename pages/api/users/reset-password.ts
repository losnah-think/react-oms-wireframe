// pages/api/users/reset-password.ts
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

// Mock 데이터 (실제로는 데이터베이스에서 가져옴)
let mockUsers = [
  {
    id: '1',
    name: '김철수',
    email: 'kim@company.com',
    password: '$2a$10$hashedpassword1',
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
    password: '$2a$10$hashedpassword2',
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
    password: '$2a$10$hashedpassword3',
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
    password: '$2a$10$hashedpassword4',
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

// 임시 비밀번호 생성 함수
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // 최소 8자, 최대 12자
  const length = Math.floor(Math.random() * 5) + 8;
  
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return password;
}

// 이메일 전송 시뮬레이션 (실제로는 이메일 서비스 사용)
async function sendPasswordResetEmail(email: string, name: string, tempPassword: string): Promise<boolean> {
  try {
    // 실제로는 이메일 서비스 (SendGrid, AWS SES 등) 사용
    console.log(`이메일 전송 시뮬레이션:`);
    console.log(`받는 사람: ${email}`);
    console.log(`제목: [FULGO OMS] 임시 비밀번호 발급`);
    console.log(`내용: 안녕하세요 ${name}님, 임시 비밀번호가 발급되었습니다: ${tempPassword}`);
    console.log(`보안을 위해 로그인 후 비밀번호를 변경해주세요.`);
    
    // 시뮬레이션을 위한 지연
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('이메일 전송 실패:', error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        error: '사용자 ID 목록이 필요합니다',
        message: '비밀번호를 초기화할 사용자 ID 배열을 제공해주세요'
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      resetPasswords: [] as Array<{userId: string, email: string, tempPassword: string}>
    };

    // 각 사용자 비밀번호 초기화
    for (const userId of userIds) {
      try {
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          results.failed++;
          results.errors.push(`사용자 ID ${userId}를 찾을 수 없습니다`);
          continue;
        }

        const user = mockUsers[userIndex];
        
        // 관리자는 비밀번호 초기화 제한 (보안상)
        if (user.role === 'ADMIN') {
          results.failed++;
          results.errors.push(`관리자(${user.name})의 비밀번호는 초기화할 수 없습니다`);
          continue;
        }

        // 임시 비밀번호 생성
        const tempPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // 사용자 비밀번호 업데이트
        mockUsers[userIndex] = {
          ...user,
          password: hashedPassword,
          updatedAt: new Date().toISOString()
        };

        // 이메일 전송 시뮬레이션
        const emailSent = await sendPasswordResetEmail(user.email, user.name, tempPassword);
        
        if (emailSent) {
          results.success++;
          results.resetPasswords.push({
            userId: user.id,
            email: user.email,
            tempPassword: tempPassword
          });
        } else {
          results.failed++;
          results.errors.push(`${user.name}에게 이메일 전송에 실패했습니다`);
        }

      } catch (error) {
        results.failed++;
        results.errors.push(`사용자 ID ${userId} 비밀번호 초기화 중 오류 발생: ${error}`);
      }
    }

    // 보안상 임시 비밀번호는 로그에만 기록하고 응답에서는 제외
    const responseData = {
      ...results,
      resetPasswords: results.resetPasswords.map(rp => ({
        userId: rp.userId,
        email: rp.email,
        tempPasswordSent: true
      }))
    };

    res.json({
      ...responseData,
      message: `${results.success}명의 비밀번호가 초기화되었습니다. ${results.failed}명의 초기화가 실패했습니다.`
    });

  } catch (error) {
    console.error('비밀번호 초기화 오류:', error);
    return res.status(500).json({ 
      error: '비밀번호 초기화에 실패했습니다',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
