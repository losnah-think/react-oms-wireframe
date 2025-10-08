// src/lib/database.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// 데이터베이스 연결 테스트
export async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ 데이터베이스 연결 성공');
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error);
    return false;
  }
}

// 데이터베이스 연결 종료
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

// 트랜잭션 헬퍼
export async function withTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(callback);
}

// 데이터베이스 상태 확인
export async function getDatabaseStatus() {
  try {
    const userCount = await prisma.user.count();
    const roleCount = await prisma.role.count();
    const groupCount = await prisma.userGroup.count();
    const logCount = await prisma.activityLog.count();
    
    return {
      connected: true,
      users: userCount,
      roles: roleCount,
      groups: groupCount,
      logs: logCount,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}
