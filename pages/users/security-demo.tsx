// pages/users/security-demo.tsx
import React, { useState } from 'react';
import { Container, Card, Button, Badge } from '../../src/design-system';
import SecurityValidator from '../../src/features/users/components/SecurityValidator';
import { 
  validatePassword, 
  validateEmail, 
  validatePhoneNumber, 
  validateUsername,
  validateDepartment,
  DEFAULT_PASSWORD_POLICY,
  loginLimiter
} from '../../src/lib/utils/security';

const SecurityDemoPage: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<{ count: number; isBlocked: boolean }>({ count: 0, isBlocked: false });

  const runSecurityTests = () => {
    const tests = [
      {
        name: '비밀번호 검증 - 유효한 비밀번호',
        input: 'SecurePass123!',
        test: () => validatePassword('SecurePass123!'),
        expected: true
      },
      {
        name: '비밀번호 검증 - 너무 짧은 비밀번호',
        input: '123',
        test: () => validatePassword('123'),
        expected: false
      },
      {
        name: '비밀번호 검증 - 금지된 패턴',
        input: 'password123',
        test: () => validatePassword('password123'),
        expected: false
      },
      {
        name: '이메일 검증 - 유효한 이메일',
        input: 'user@company.com',
        test: () => validateEmail('user@company.com'),
        expected: true
      },
      {
        name: '이메일 검증 - 잘못된 형식',
        input: 'invalid-email',
        test: () => validateEmail('invalid-email'),
        expected: false
      },
      {
        name: '전화번호 검증 - 유효한 번호',
        input: '010-1234-5678',
        test: () => validatePhoneNumber('010-1234-5678'),
        expected: true
      },
      {
        name: '전화번호 검증 - 잘못된 형식',
        input: '123-456-789',
        test: () => validatePhoneNumber('123-456-789'),
        expected: false
      },
      {
        name: '사용자명 검증 - 유효한 사용자명',
        input: 'user123',
        test: () => validateUsername('user123'),
        expected: true
      },
      {
        name: '사용자명 검증 - 특수문자 포함',
        input: 'user@123',
        test: () => validateUsername('user@123'),
        expected: false
      },
      {
        name: '부서명 검증 - 유효한 부서명',
        input: '개발팀',
        test: () => validateDepartment('개발팀'),
        expected: true
      }
    ];

    const results = tests.map(test => {
      const result = test.test();
      const passed = typeof result === 'boolean' ? result === test.expected : result.isValid === test.expected;
      
      return {
        name: test.name,
        input: test.input,
        expected: test.expected,
        actual: typeof result === 'boolean' ? result : result.isValid,
        passed,
        details: typeof result === 'object' ? result.errors || result.error : null
      };
    });

    setTestResults(results);
  };

  const testLoginLimiter = () => {
    const testIP = '192.168.1.100';
    const result = loginLimiter.recordAttempt(testIP);
    setLoginAttempts({ count: result.remainingAttempts, isBlocked: result.isBlocked });
  };

  const resetLoginLimiter = () => {
    loginLimiter.resetAttempts('192.168.1.100');
    setLoginAttempts({ count: 5, isBlocked: false });
  };

  const passedTests = testResults.filter(test => test.passed).length;
  const totalTests = testResults.length;

  return (
    <Container>
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            보안 검증 데모
          </h1>
          <p className="text-gray-600">
            사용자 관리 시스템의 보안 기능들을 테스트해보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 보안 검증 폼 */}
          <div>
            <SecurityValidator />
          </div>

          {/* 보안 테스트 결과 */}
          <div className="space-y-6">
            {/* 자동화된 테스트 */}
            <Card padding="lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">자동화된 보안 테스트</h2>
                <Button onClick={runSecurityTests}>
                  테스트 실행
                </Button>
              </div>

              {testResults.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge color={passedTests === totalTests ? 'green' : 'red'}>
                      {passedTests}/{totalTests} 통과
                    </Badge>
                    <span className="text-sm text-gray-600">
                      성공률: {Math.round((passedTests / totalTests) * 100)}%
                    </span>
                  </div>

                  {testResults.map((test, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{test.name}</h4>
                        <Badge color={test.passed ? 'green' : 'red'} size="small">
                          {test.passed ? '통과' : '실패'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>입력: <code className="bg-gray-100 px-1 rounded">{test.input}</code></p>
                        <p>예상: {test.expected ? '유효' : '무효'}</p>
                        <p>실제: {test.actual ? '유효' : '무효'}</p>
                        {test.details && (
                          <p className="text-red-600">오류: {Array.isArray(test.details) ? test.details.join(', ') : test.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* 로그인 시도 제한 테스트 */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold mb-4">로그인 시도 제한 테스트</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">현재 상태</h4>
                  <div className="space-y-2 text-sm">
                    <p>남은 시도 횟수: <span className="font-medium">{loginAttempts.count}</span></p>
                    <p>계정 잠금: <Badge color={loginAttempts.isBlocked ? 'red' : 'green'} size="small">
                      {loginAttempts.isBlocked ? '잠김' : '정상'}
                    </Badge></p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={testLoginLimiter} disabled={loginAttempts.isBlocked}>
                    로그인 시도
                  </Button>
                  <Button variant="ghost" onClick={resetLoginLimiter}>
                    리셋
                  </Button>
                </div>

                <div className="text-xs text-gray-600">
                  <p>• 최대 5회 시도 후 15분간 잠금</p>
                  <p>• 테스트 IP: 192.168.1.100</p>
                </div>
              </div>
            </Card>

            {/* 보안 정책 정보 */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold mb-4">보안 정책</h2>
              
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">비밀번호 정책</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 최소 {DEFAULT_PASSWORD_POLICY.minLength}자 이상</li>
                    <li>• 최대 {DEFAULT_PASSWORD_POLICY.maxLength}자 이하</li>
                    <li>• 대소문자, 숫자, 특수문자 포함</li>
                    <li>• 금지된 패턴 사용 불가</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">입력 검증</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• XSS 공격 방지</li>
                    <li>• SQL 인젝션 방지</li>
                    <li>• 파일 업로드 검증</li>
                    <li>• IP 주소 검증</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">접근 제어</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 요청 속도 제한</li>
                    <li>• 로그인 시도 제한</li>
                    <li>• CORS 정책</li>
                    <li>• 보안 헤더 설정</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default SecurityDemoPage;
