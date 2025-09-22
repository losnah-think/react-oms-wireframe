import React from 'react';

export default function DevReseedPage() {
  const [status, setStatus] = React.useState<string>('대기 중');

  React.useEffect(() => {
    try {
      // @ts-ignore
      const store = (window as any).__clientBarcodeStore;
      if (store && typeof store.reseedNow === 'function') {
        setStatus('재시드 실행 중...');
        const res = store.reseedNow();
        setStatus(res && res.ok ? `완료: ${res.count} 항목` : `오류: ${JSON.stringify(res)}`);
      } else {
        setStatus('클라이언트 스토어를 찾을 수 없습니다. 앱을 로드한 후 다시 시도하세요.');
      }
    } catch (e) {
      setStatus('재시드 실패: ' + String(e));
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">개발용: 클라이언트 목업 재시드</h1>
      <p className="mb-2">상태: {status}</p>
      <p className="text-sm text-gray-500">이 페이지는 로컬 브라우저의 목업 데이터를 초기화합니다.</p>
    </div>
  );
}
