// 카테고리 목업 데이터
function generateCategoryCode(i: number) {
  const prefix = 'CAT';
  const date = new Date(2025, 8, 13); // 2025-09-13
  const dateStr = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
  const rand = String(Math.floor(Math.random()*9000)+1000); // 4자리 랜덤
  return `${prefix}-${dateStr}-${rand}-${i+1}`;
}

export const mockCategories = Array.from({length: 100}, (_, i) => ({
  id: `cat-${i+1}`,
  code: generateCategoryCode(i),
  name: `카테고리${i+1}`
}));
