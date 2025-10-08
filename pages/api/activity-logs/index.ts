// pages/api/activity-logs/index.ts
import { NextApiRequest, NextApiResponse } from 'next';

// Mock 활동 로그 데이터
const mockActivityLogs = [
  {
    id: 'log1',
    userId: '1',
    userName: '김철수',
    action: 'USER_LOGIN',
    resource: 'Auth',
    details: { ip: '192.168.1.1' },
    timestamp: new Date().toISOString(),
    status: 'SUCCESS',
    severity: 'LOW'
  },
  {
    id: 'log2',
    userId: '1',
    userName: '김철수',
    action: 'PRODUCT_CREATE',
    resource: 'Product:P123',
    details: { productName: 'New Product' },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: 'SUCCESS',
    severity: 'MEDIUM'
  },
  {
    id: 'log3',
    userId: '2',
    userName: '이영희',
    action: 'ORDER_UPDATE',
    resource: 'Order:O456',
    details: { status: 'SHIPPED' },
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: 'SUCCESS',
    severity: 'LOW'
  },
  {
    id: 'log4',
    userId: '3',
    userName: '박민수',
    action: 'LOGIN_FAILED',
    resource: 'Auth',
    details: { reason: 'Wrong password' },
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    status: 'FAILED',
    severity: 'HIGH'
  },
  {
    id: 'log5',
    userId: '1',
    userName: '김철수',
    action: 'SYSTEM_CONFIG_UPDATE',
    resource: 'Settings',
    details: { setting: 'email_notifications', value: 'disabled' },
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    status: 'WARNING',
    severity: 'CRITICAL'
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getLogs(req, res);
  } else if (req.method === 'POST') {
    return createLog(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getLogs(req: NextApiRequest, res: NextApiResponse) {
  const {
    search,
    userId,
    actionType,
    resourceType,
    status,
    severity,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    sortBy = 'timestamp',
    sortOrder = 'desc'
  } = req.query;

  try {
    let filteredLogs = [...mockActivityLogs];

    // 필터링
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredLogs = filteredLogs.filter(log =>
        log.userName.toLowerCase().includes(searchTerm) ||
        log.action.toLowerCase().includes(searchTerm) ||
        log.resource.toLowerCase().includes(searchTerm)
      );
    }

    if (userId) filteredLogs = filteredLogs.filter(log => log.userId === userId);
    if (actionType) filteredLogs = filteredLogs.filter(log => log.action === actionType);
    if (resourceType) filteredLogs = filteredLogs.filter(log => log.resource === resourceType);
    if (status) filteredLogs = filteredLogs.filter(log => log.status === status);
    if (severity) filteredLogs = filteredLogs.filter(log => log.severity === severity);
    if (startDate) filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(startDate as string));
    if (endDate) filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(endDate as string));

    // 정렬
    filteredLogs.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];

      if (sortBy === 'timestamp') {
        return sortOrder === 'asc'
          ? new Date(aValue as string).getTime() - new Date(bValue as string).getTime()
          : new Date(bValue as string).getTime() - new Date(aValue as string).getTime();
      }

      if (sortOrder === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });

    // 페이지네이션
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    res.json({
      logs: paginatedLogs,
      total: filteredLogs.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filteredLogs.length / limitNum)
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({ error: 'Failed to fetch logs' });
  }
}

async function createLog(req: NextApiRequest, res: NextApiResponse) {
  const { userId, userName, action, resource, details, status, severity } = req.body;

  if (!userId || !userName || !action || !resource) {
    return res.status(400).json({ error: 'Missing required fields for activity log' });
  }

  try {
    const newLog = {
      id: `log${mockActivityLogs.length + 1}`,
      userId,
      userName,
      action,
      resource,
      details: details || {},
      timestamp: new Date().toISOString(),
      status: status || 'SUCCESS',
      severity: severity || 'LOW'
    };

    mockActivityLogs.push(newLog);

    res.json({ log: newLog });
  } catch (error) {
    console.error('Error creating log:', error);
    return res.status(500).json({ error: 'Failed to create log' });
  }
}
