import React, { useState, useEffect } from 'react';
import { logger, LogEntry, LogCategory, LogLevel, LOG_ACTION_LABELS, LOG_CATEGORY_LABELS } from '../../lib/logger';

const LogsPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<LogCategory | ''>('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const limit = 50;

  // 로그 조회
  const loadLogs = async () => {
    setLoading(true);
    try {
      const result = await logger.getLogs({
        category: categoryFilter || undefined,
        level: levelFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: search || undefined,
        page,
        limit,
      });
      setLogs(result.logs);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load logs:', error);
      alert('로그 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, categoryFilter, levelFilter, startDate, endDate]);

  // 검색
  const handleSearch = () => {
    setPage(1);
    loadLogs();
  };

  // 내보내기
  const handleExport = async () => {
    try {
      const blob = await logger.exportLogs({
        category: categoryFilter || undefined,
        level: levelFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }, 'csv');

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `logs_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('내보내기 실패');
    }
  };

  // 레벨 색상
  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'info': return 'bg-blue-100 text-blue-700';
      case 'warning': return 'bg-yellow-100 text-yellow-700';
      case 'error': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">활동 로그</h1>
          <p className="text-sm text-gray-600 mt-1">모든 사용자 활동이 서버 시간 기준으로 기록됩니다</p>
        </div>
      </div>

      {/* 메인 */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-5 gap-4 mb-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as LogCategory | '')}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">전체 카테고리</option>
              {(Object.entries(LOG_CATEGORY_LABELS) as Array<[LogCategory, string]>).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as LogLevel | '')}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">전체 레벨</option>
              <option value="info">정보</option>
              <option value="warning">경고</option>
              <option value="error">오류</option>
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border rounded-lg"
              placeholder="시작일"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border rounded-lg"
              placeholder="종료일"
            />

            <button
              onClick={handleExport}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              CSV 내보내기
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="사용자, 액션, 설명으로 검색"
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              검색
            </button>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">전체 로그</div>
            <div className="text-2xl font-bold mt-1">{total.toLocaleString()}건</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">정보</div>
            <div className="text-2xl font-bold mt-1 text-blue-600">
              {logs.filter(l => l.level === 'info').length}건
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">경고</div>
            <div className="text-2xl font-bold mt-1 text-yellow-600">
              {logs.filter(l => l.level === 'warning').length}건
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">오류</div>
            <div className="text-2xl font-bold mt-1 text-red-600">
              {logs.filter(l => l.level === 'error').length}건
            </div>
          </div>
        </div>

        {/* 로그 목록 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-500">로딩 중...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">로그가 없습니다</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">시간</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">사용자</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">카테고리</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">액션</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">대상</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">설명</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">레벨</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">상세</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString('ko-KR') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-sm text-gray-900">{log.userName}</div>
                        <div className="text-xs text-gray-500">{log.userId}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {LOG_CATEGORY_LABELS[log.category as LogCategory] || log.category}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {LOG_ACTION_LABELS[log.action as keyof typeof LOG_ACTION_LABELS] || log.action}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{log.target}</div>
                        {log.targetId && (
                          <div className="text-xs text-gray-500 font-mono">{log.targetId}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                        {log.description}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getLevelColor(log.level)}`}>
                          {log.level === 'info' ? '정보' : log.level === 'warning' ? '경고' : '오류'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 상세 모달 */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-semibold">로그 상세</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">시간</div>
                  <div className="mt-1 text-gray-900">
                    {selectedLog.timestamp ? new Date(selectedLog.timestamp).toLocaleString('ko-KR') : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">사용자</div>
                  <div className="mt-1 text-gray-900">{selectedLog.userName}</div>
                  <div className="text-sm text-gray-500">{selectedLog.userId}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">카테고리</div>
                  <div className="mt-1 text-gray-900">
                    {LOG_CATEGORY_LABELS[selectedLog.category as LogCategory] || selectedLog.category}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">액션</div>
                  <div className="mt-1 text-gray-900">
                    {LOG_ACTION_LABELS[selectedLog.action as keyof typeof LOG_ACTION_LABELS] || selectedLog.action}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">대상</div>
                  <div className="mt-1 text-gray-900">{selectedLog.target}</div>
                  {selectedLog.targetId && (
                    <div className="text-sm text-gray-500 font-mono">{selectedLog.targetId}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">레벨</div>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getLevelColor(selectedLog.level)}`}>
                      {selectedLog.level === 'info' ? '정보' : selectedLog.level === 'warning' ? '경고' : '오류'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">설명</div>
                <div className="mt-1 text-gray-900">{selectedLog.description}</div>
              </div>

              {selectedLog.ipAddress && (
                <div>
                  <div className="text-sm font-medium text-gray-500">IP 주소</div>
                  <div className="mt-1 text-gray-900 font-mono">{selectedLog.ipAddress}</div>
                </div>
              )}

              {selectedLog.userAgent && (
                <div>
                  <div className="text-sm font-medium text-gray-500">User Agent</div>
                  <div className="mt-1 text-gray-900 text-sm break-all">{selectedLog.userAgent}</div>
                </div>
              )}

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">상세 정보</div>
                  <div className="bg-gray-50 rounded p-4">
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsPage;
