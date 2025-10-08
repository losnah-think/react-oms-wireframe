// src/lib/middleware/security.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSecurityHeaders, loginLimiter, validateIPAddress } from '../utils/security';

// 보안 헤더 미들웨어
export const securityHeaders = (req: NextApiRequest, res: NextApiResponse, next?: () => void) => {
  const headers = getSecurityHeaders();
  
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (next) next();
};

// IP 주소 검증 미들웨어
export const validateIP = (req: NextApiRequest, res: NextApiResponse, next?: () => void) => {
  const clientIP = req.headers['x-forwarded-for'] as string || 
                   req.headers['x-real-ip'] as string || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress;

  if (!clientIP || !validateIPAddress(clientIP)) {
    return res.status(400).json({ error: 'Invalid IP address' });
  }

  // IP를 요청 객체에 추가
  (req as any).clientIP = clientIP;

  if (next) next();
};

// 요청 크기 제한 미들웨어
export const limitRequestSize = (maxSize: number = 1024 * 1024) => {
  return (req: NextApiRequest, res: NextApiResponse, next?: () => void) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({ error: 'Request entity too large' });
    }

    if (next) next();
  };
};

// 요청 속도 제한 미들웨어
export const rateLimit = (windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) => {
  const requests: Map<string, { count: number; resetTime: number }> = new Map();

  return (req: NextApiRequest, res: NextApiResponse, next?: () => void) => {
    const clientIP = (req as any).clientIP || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // 오래된 요청 기록 정리
    for (const [ip, data] of requests.entries()) {
      if (data.resetTime < windowStart) {
        requests.delete(ip);
      }
    }

    const requestData = requests.get(clientIP);
    
    if (!requestData) {
      requests.set(clientIP, { count: 1, resetTime: now });
    } else if (requestData.resetTime < windowStart) {
      requests.set(clientIP, { count: 1, resetTime: now });
    } else if (requestData.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil((requestData.resetTime + windowMs - now) / 1000)} seconds`
      });
    } else {
      requestData.count++;
    }

    // Rate limit 헤더 추가
    const remaining = Math.max(0, maxRequests - (requestData?.count || 1));
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

    if (next) next();
  };
};

// 로그인 시도 제한 미들웨어
export const loginRateLimit = (req: NextApiRequest, res: NextApiResponse, next?: () => void) => {
  const clientIP = (req as any).clientIP || req.connection.remoteAddress;
  const { isBlocked, remainingAttempts } = loginLimiter.recordAttempt(clientIP);

  if (isBlocked) {
    return res.status(429).json({
      error: 'Too many login attempts',
      message: '계정이 일시적으로 잠겼습니다. 15분 후 다시 시도해주세요.'
    });
  }

  res.setHeader('X-Login-Attempts-Remaining', remainingAttempts.toString());

  if (next) next();
};

// CORS 설정 미들웨어
export const cors = (allowedOrigins: string[] = ['http://localhost:3000']) => {
  return (req: NextApiRequest, res: NextApiResponse, next?: () => void) => {
    const origin = req.headers.origin;
    
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (next) next();
  };
};

// 인증 토큰 검증 미들웨어
export const authenticateToken = (req: NextApiRequest, res: NextApiResponse, next?: () => void) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // 실제로는 JWT 토큰 검증 로직 구현
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // (req as any).user = decoded;
    
    // Mock 검증
    if (token === 'valid-token') {
      (req as any).user = { id: '1', email: 'admin@company.com', role: 'ADMIN' };
    } else {
      return res.status(403).json({ error: 'Invalid token' });
    }

    if (next) next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// 관리자 권한 검증 미들웨어
export const requireAdmin = (req: NextApiRequest, res: NextApiResponse, next?: () => void) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (next) next();
};

// 요청 로깅 미들웨어
export const requestLogger = (req: NextApiRequest, res: NextApiResponse, next?: () => void) => {
  const startTime = Date.now();
  const clientIP = (req as any).clientIP || req.connection.remoteAddress;
  
  // 응답 완료 시 로그 기록
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      clientIP,
      userAgent: req.headers['user-agent'],
      duration,
      timestamp: new Date().toISOString()
    };

    // 실제로는 로그 시스템에 기록
    console.log('API Request:', JSON.stringify(logData));
  });

  if (next) next();
};

// 미들웨어 체인 헬퍼
export const applyMiddleware = (
  req: NextApiRequest, 
  res: NextApiResponse, 
  middlewares: Array<(req: NextApiRequest, res: NextApiResponse, next?: () => void) => void>
) => {
  let index = 0;

  const next = () => {
    if (index < middlewares.length) {
      const middleware = middlewares[index++];
      middleware(req, res, next);
    }
  };

  next();
};
