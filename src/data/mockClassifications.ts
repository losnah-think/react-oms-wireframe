export const mockClassifications = [
  {
    id: 'cl-1',
    name: '의류',
    children: [
      {
        id: 'cl-1-1',
        name: '남성',
        children: [
          { id: 'cl-1-1-1', name: '셔츠' },
          { id: 'cl-1-1-2', name: '팬츠' },
          { id: 'cl-1-1-3', name: '아우터' },
        ],
      },
      {
        id: 'cl-1-2',
        name: '여성',
        children: [
          { id: 'cl-1-2-1', name: '원피스' },
          { id: 'cl-1-2-2', name: '탑' },
          { id: 'cl-1-2-3', name: '스커트' },
        ],
      },
      {
        id: 'cl-1-3',
        name: '아동',
        children: [
          { id: 'cl-1-3-1', name: '유아복' },
          { id: 'cl-1-3-2', name: '키즈웨어' },
        ],
      },
    ],
  },
  {
    id: 'cl-2',
    name: '전자제품',
    children: [
      {
        id: 'cl-2-1',
        name: '가전',
        children: [
          { id: 'cl-2-1-1', name: '냉장고' },
          { id: 'cl-2-1-2', name: '세탁기' },
        ],
      },
      {
        id: 'cl-2-2',
        name: 'IT/디지털',
        children: [
          { id: 'cl-2-2-1', name: '스마트폰' },
          { id: 'cl-2-2-2', name: '노트북' },
          { id: 'cl-2-2-3', name: '액세서리' },
        ],
      },
    ],
  },
  {
    id: 'cl-3',
    name: '잡화',
    children: [
      {
        id: 'cl-3-1',
        name: '가방',
        children: [
          { id: 'cl-3-1-1', name: '토트백' },
          { id: 'cl-3-1-2', name: '크로스백' },
        ],
      },
      {
        id: 'cl-3-2',
        name: '주얼리',
        children: [
          { id: 'cl-3-2-1', name: '목걸이' },
          { id: 'cl-3-2-2', name: '반지' },
        ],
      },
    ],
  },
  {
    id: 'cl-4',
    name: '뷰티',
    children: [
      {
        id: 'cl-4-1',
        name: '스킨케어',
        children: [
          { id: 'cl-4-1-1', name: '클렌징' },
          { id: 'cl-4-1-2', name: '토너' },
        ],
      },
      {
        id: 'cl-4-2',
        name: '메이크업',
        children: [
          { id: 'cl-4-2-1', name: '립' },
          { id: 'cl-4-2-2', name: '아이' },
        ],
      },
    ],
  },
  {
    id: 'cl-5',
    name: '식품',
    children: [
      { id: 'cl-5-1', name: '과자' },
      { id: 'cl-5-2', name: '음료' },
    ],
  },
  {
    id: 'cl-6',
    name: '사무용품',
    children: [
      { id: 'cl-6-1', name: '문구' },
      { id: 'cl-6-2', name: '오피스가구' },
    ],
  },
];

export default mockClassifications;
