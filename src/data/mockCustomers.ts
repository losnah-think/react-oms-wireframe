// 고객 목업 데이터
export const mockCustomers = Array.from({length: 50}, (_, i) => ({
  id: i+1,
  name: `고객${i+1}`,
  phone: `010-0000-${String(i+1000).padStart(4,'0')}`,
  address: `서울시 강남구 ${i+1}번지`
}));
