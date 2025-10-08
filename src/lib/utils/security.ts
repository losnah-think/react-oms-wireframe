// src/lib/utils/security.ts
import bcrypt from 'bcryptjs';
import validator from 'validator';

// 비밀번호 정책
export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbiddenPatterns: string[];
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbiddenPatterns: ['password', '123456', 'qwerty', 'admin']
};

// 비밀번호 검증
export const validatePassword = (password: string, policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < policy.minLength) {
    errors.push(`비밀번호는 최소 ${policy.minLength}자 이상이어야 합니다`);
  }

  if (password.length > policy.maxLength) {
    errors.push(`비밀번호는 최대 ${policy.maxLength}자 이하여야 합니다`);
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('비밀번호에 대문자가 포함되어야 합니다');
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('비밀번호에 소문자가 포함되어야 합니다');
  }

  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('비밀번호에 숫자가 포함되어야 합니다');
  }

  if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('비밀번호에 특수문자가 포함되어야 합니다');
  }

  // 금지된 패턴 검사
  const lowerPassword = password.toLowerCase();
  policy.forbiddenPatterns.forEach(pattern => {
    if (lowerPassword.includes(pattern.toLowerCase())) {
      errors.push(`비밀번호에 "${pattern}" 패턴을 사용할 수 없습니다`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 비밀번호 해시화
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// 비밀번호 검증
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// 이메일 검증
export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email) && email.length <= 254;
};

// 전화번호 검증
export const validatePhoneNumber = (phone: string): boolean => {
  // 한국 전화번호 형식 검증
  const koreanPhoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return koreanPhoneRegex.test(phone.replace(/\s/g, ''));
};

// 입력값 정제 (XSS 방지)
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // HTML 태그 제거
    .replace(/javascript:/gi, '') // JavaScript 프로토콜 제거
    .replace(/on\w+=/gi, '') // 이벤트 핸들러 제거
    .substring(0, 1000); // 길이 제한
};

// SQL 인젝션 방지
export const sanitizeForSQL = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/['"`;\\]/g, '') // SQL 특수문자 제거
    .replace(/--/g, '') // SQL 주석 제거
    .replace(/\/\*/g, '') // 블록 주석 시작 제거
    .replace(/\*\//g, ''); // 블록 주석 끝 제거
};

// 파일 업로드 검증
export const validateFileUpload = (file: File, options: {
  maxSize?: number; // bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
} = {}): { isValid: boolean; error?: string } => {
  const {
    maxSize = 10 * 1024 * 1024, // 기본 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
  } = options;

  // 파일 크기 검증
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `파일 크기가 ${Math.round(maxSize / 1024 / 1024)}MB를 초과합니다`
    };
  }

  // 파일 타입 검증
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `허용되지 않는 파일 타입입니다. 허용된 타입: ${allowedTypes.join(', ')}`
    };
  }

  // 파일 확장자 검증
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `허용되지 않는 파일 확장자입니다. 허용된 확장자: ${allowedExtensions.join(', ')}`
    };
  }

  return { isValid: true };
};

// IP 주소 검증
export const validateIPAddress = (ip: string): boolean => {
  return validator.isIP(ip);
};

// URL 검증
export const validateURL = (url: string): boolean => {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
};

// CSRF 토큰 생성
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// 세션 ID 생성
export const generateSessionId = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// 보안 헤더 설정
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
};

// 입력값 길이 검증
export const validateLength = (input: string, min: number, max: number): boolean => {
  return input.length >= min && input.length <= max;
};

// 사용자명 검증
export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  if (!validateLength(username, 3, 20)) {
    return { isValid: false, error: '사용자명은 3-20자 사이여야 합니다' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, error: '사용자명은 영문, 숫자, _, - 만 사용할 수 있습니다' };
  }

  return { isValid: true };
};

// 부서명 검증
export const validateDepartment = (department: string): boolean => {
  return validateLength(department, 1, 50) && /^[가-힣a-zA-Z0-9\s-]+$/.test(department);
};

// 로그인 시도 제한
export class LoginAttemptLimiter {
  private attempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  private readonly maxAttempts: number;
  private readonly lockoutDuration: number; // milliseconds

  constructor(maxAttempts: number = 5, lockoutDuration: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.lockoutDuration = lockoutDuration;
  }

  recordAttempt(identifier: string): { isBlocked: boolean; remainingAttempts: number } {
    const now = new Date();
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return { isBlocked: false, remainingAttempts: this.maxAttempts - 1 };
    }

    // 잠금 시간이 지났으면 리셋
    if (now.getTime() - attempt.lastAttempt.getTime() > this.lockoutDuration) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return { isBlocked: false, remainingAttempts: this.maxAttempts - 1 };
    }

    // 시도 횟수 증가
    attempt.count++;
    attempt.lastAttempt = now;

    const isBlocked = attempt.count >= this.maxAttempts;
    const remainingAttempts = Math.max(0, this.maxAttempts - attempt.count);

    return { isBlocked, remainingAttempts };
  }

  resetAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }

  isBlocked(identifier: string): boolean {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return false;

    const now = new Date();
    const timeSinceLastAttempt = now.getTime() - attempt.lastAttempt.getTime();
    
    return attempt.count >= this.maxAttempts && timeSinceLastAttempt < this.lockoutDuration;
  }
}

// 전역 로그인 시도 제한기 인스턴스
export const loginLimiter = new LoginAttemptLimiter();
