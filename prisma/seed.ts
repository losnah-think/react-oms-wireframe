// prisma/seed.ts
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 데이터베이스 시드 시작...');

  // 기본 역할 생성
  const roles = [
    {
      name: 'ADMIN',
      description: '시스템 관리자 - 모든 권한',
      permissions: ['*'],
      isSystem: true
    },
    {
      name: 'MANAGER',
      description: '관리자 - 사용자 관리 권한',
      permissions: ['users:read', 'users:create', 'users:update', 'users:delete'],
      isSystem: true
    },
    {
      name: 'OPERATOR',
      description: '운영자 - 제한된 수정 권한',
      permissions: ['users:read', 'users:update'],
      isSystem: true
    },
    {
      name: 'USER',
      description: '사용자 - 자신의 정보만 수정 가능',
      permissions: ['users:read:self', 'users:update:self'],
      isSystem: true
    }
  ];

  for (const roleData of roles) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: roleData,
      create: roleData
    });
  }

  console.log('✅ 기본 역할 생성 완료');

  // 기본 사용자 그룹 생성
  const groups = [
    {
      name: 'IT팀',
      description: '정보기술팀'
    },
    {
      name: '마케팅팀',
      description: '마케팅 및 홍보팀'
    },
    {
      name: '영업팀',
      description: '영업 및 고객관리팀'
    },
    {
      name: '운영팀',
      description: '운영 및 관리팀'
    },
    {
      name: '경영진',
      description: '경영진 및 임원진'
    }
  ];

  for (const groupData of groups) {
    await prisma.userGroup.upsert({
      where: { name: groupData.name },
      update: groupData,
      create: groupData
    });
  }

  console.log('✅ 기본 사용자 그룹 생성 완료');

  // 기본 사용자 생성
  const defaultPassword = await bcrypt.hash('password123', 10);
  
  const users = [
    {
      name: '김철수',
      email: 'admin@fulgo.com',
      password: defaultPassword,
      role: UserRole.ADMIN,
      department: 'IT팀',
      status: UserStatus.ACTIVE,
      phone: '010-1234-5678'
    },
    {
      name: '이영희',
      email: 'manager@fulgo.com',
      password: defaultPassword,
      role: UserRole.MANAGER,
      department: '마케팅팀',
      status: UserStatus.ACTIVE,
      phone: '010-2345-6789'
    },
    {
      name: '박민수',
      email: 'operator@fulgo.com',
      password: defaultPassword,
      role: UserRole.OPERATOR,
      department: '운영팀',
      status: UserStatus.ACTIVE,
      phone: '010-3456-7890'
    },
    {
      name: '정수진',
      email: 'user@fulgo.com',
      password: defaultPassword,
      role: UserRole.USER,
      department: '영업팀',
      status: UserStatus.ACTIVE,
      phone: '010-4567-8901'
    },
    {
      name: '최관리',
      email: 'admin2@fulgo.com',
      password: defaultPassword,
      role: UserRole.ADMIN,
      department: 'IT팀',
      status: UserStatus.ACTIVE,
      phone: '010-5678-9012'
    }
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: userData,
      create: userData
    });
  }

  console.log('✅ 기본 사용자 생성 완료');

  // 샘플 활동 로그 생성
  const sampleLogs = [
    {
      userId: (await prisma.user.findFirst({ where: { email: 'admin@fulgo.com' } }))?.id || '',
      userName: '김철수',
      action: 'LOGIN',
      resource: 'auth',
      details: { ip: '192.168.1.100', userAgent: 'Mozilla/5.0...' },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'session_001'
    },
    {
      userId: (await prisma.user.findFirst({ where: { email: 'manager@fulgo.com' } }))?.id || '',
      userName: '이영희',
      action: 'CREATE_USER',
      resource: 'users',
      details: { targetUser: '새로운 사용자', email: 'new@fulgo.com' },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'session_002'
    },
    {
      userId: (await prisma.user.findFirst({ where: { email: 'operator@fulgo.com' } }))?.id || '',
      userName: '박민수',
      action: 'UPDATE_USER',
      resource: 'users',
      details: { targetUser: '정수진', changes: ['department'] },
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      sessionId: 'session_003'
    }
  ];

  for (const logData of sampleLogs) {
    if (logData.userId) {
      await prisma.activityLog.create({
        data: logData
      });
    }
  }

  console.log('✅ 샘플 활동 로그 생성 완료');

  console.log('🎉 데이터베이스 시드 완료!');
}

main()
  .catch((e) => {
    console.error('❌ 시드 실행 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
