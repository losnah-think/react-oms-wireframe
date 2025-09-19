export type Classification = {
  id: string;
  name: string;
  parentId?: string | null;
}

export const MOCK_CLASSIFICATIONS: Classification[] = [
  { id: 'c1', name: '여성의류' },
  { id: 'c2', name: '남성의류' },
  { id: 'c3', name: '잡화' },
  { id: 'c1-1', name: '티셔츠', parentId: 'c1' },
  { id: 'c1-2', name: '원피스', parentId: 'c1' },
  { id: 'c2-1', name: '셔츠', parentId: 'c2' },
  { id: 'c2-2', name: '자켓', parentId: 'c2' },
]

export const fetchMockClassifications = async (): Promise<Classification[]> => {
  // simulate a small delay
  await new Promise(r => setTimeout(r, 80))
  return MOCK_CLASSIFICATIONS
}
