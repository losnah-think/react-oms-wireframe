// 브랜드 목업 데이터
function generateBrandCode(i: number) {
  const prefix = 'BRAND';
  const date = new Date(2025, 8, 13); // 2025-09-13
  const dateStr = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
  const rand = String(Math.floor(Math.random()*9000)+1000); // 4자리 랜덤
  return `${prefix}-${dateStr}-${rand}-${i+1}`;
}

export const mockBrands = Array.from({length: 100}, (_, i) => ({
  id: `brand-${i+1}`,
  code: generateBrandCode(i),
  name: `브랜드${i+1}`,
  // preferred classification ids for this brand (example)
  preferredClassificationIds: [`c-${(i % 6) + 1}`],
  // a few brands may map to multiple categories
  preferredCategories: [
    ['의류', '남성', '셔츠']
  ]
}));
