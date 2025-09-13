import React, { useState, useCallback } from 'react';
import type { ProductTag, TagCategory } from '../../types/multitenant';

interface TagManagerProps {
  tags: ProductTag[];
  onChange: (tags: ProductTag[]) => void;
  disabled?: boolean;
  maxTags?: number;
}

interface TagSuggestion {
  id: string;
  name: string;
  category: TagCategory;
  usage: number;
}

const TagManager: React.FC<TagManagerProps> = ({
  tags = [],
  onChange,
  disabled = false,
  maxTags = 20
}) => {
  // 상태 관리
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TagCategory>('general');
  
  // 태그 카테고리 옵션
  const tagCategories: { value: TagCategory; label: string; color: string }[] = [
    { value: 'general', label: '일반', color: 'bg-gray-100 text-gray-800' },
    { value: 'brand', label: '브랜드', color: 'bg-blue-100 text-blue-800' },
    { value: 'season', label: '시즌', color: 'bg-green-100 text-green-800' },
    { value: 'style', label: '스타일', color: 'bg-purple-100 text-purple-800' },
    { value: 'feature', label: '특징', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'target', label: '타겟', color: 'bg-pink-100 text-pink-800' },
    { value: 'event', label: '이벤트', color: 'bg-red-100 text-red-800' }
  ];
  
  // 추천 태그 데이터 (실제로는 API에서 가져옴)
  const getTagSuggestions = useCallback(async (query: string): Promise<TagSuggestion[]> => {
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockSuggestions: TagSuggestion[] = [
      { id: '1', name: '신상품', category: 'general', usage: 1520 },
      { id: '2', name: '베스트셀러', category: 'general', usage: 980 },
      { id: '3', name: '할인상품', category: 'event', usage: 750 },
      { id: '4', name: '무료배송', category: 'feature', usage: 650 },
      { id: '5', name: '여름', category: 'season', usage: 420 },
      { id: '6', name: '겨울', category: 'season', usage: 380 },
      { id: '7', name: '캐주얼', category: 'style', usage: 320 },
      { id: '8', name: '포멀', category: 'style', usage: 280 },
      { id: '9', name: '여성용', category: 'target', usage: 890 },
      { id: '10', name: '남성용', category: 'target', usage: 720 },
      { id: '11', name: '유니섹스', category: 'target', usage: 450 },
      { id: '12', name: '프리미엄', category: 'feature', usage: 320 }
    ];
    
    return mockSuggestions.filter(suggestion =>
      suggestion.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);
  }, []);
  
  // 카테고리별 색상 가져오기
  const getCategoryColor = (category: TagCategory): string => {
    return tagCategories.find(cat => cat.value === category)?.color || 'bg-gray-100 text-gray-800';
  };
  
  // 입력 변경 처리
  const handleInputChange = async (value: string) => {
    setInputValue(value);
    
    if (value.trim().length >= 2) {
      const suggestions = await getTagSuggestions(value);
      setSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  // 태그 추가
  const addTag = (name: string, category: TagCategory = selectedCategory) => {
    if (!name.trim() || tags.length >= maxTags) return;
    
    // 중복 체크
    const exists = tags.some(tag => 
      tag.name.toLowerCase() === name.toLowerCase()
    );
    
    if (!exists) {
      const newTag: ProductTag = {
        id: `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        category,
        createdAt: new Date().toISOString()
      };
      
      onChange([...tags, newTag]);
    }
    
    setInputValue('');
    setShowSuggestions(false);
  };
  
  // 태그 제거
  const removeTag = (tagId: string) => {
    onChange(tags.filter(tag => tag.id !== tagId));
  };
  
  // Enter 키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue, selectedCategory);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1].id);
    }
  };
  
  // 추천 태그 선택
  const selectSuggestion = (suggestion: TagSuggestion) => {
    addTag(suggestion.name, suggestion.category);
  };
  
  // 카테고리별 태그 그룹화
  const groupedTags = tags.reduce((groups, tag) => {
    const category = tag.category || 'general';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(tag);
    return groups;
  }, {} as Record<TagCategory, ProductTag[]>);
  
  // 인기 태그 표시 (예시)
  const popularTags = [
    { name: '신상품', category: 'general' as TagCategory },
    { name: '베스트셀러', category: 'general' as TagCategory },
    { name: '할인상품', category: 'event' as TagCategory },
    { name: '무료배송', category: 'feature' as TagCategory },
    { name: '여성용', category: 'target' as TagCategory },
    { name: '캐주얼', category: 'style' as TagCategory }
  ];
  
  return (
    <div className="space-y-4">
      {/* 태그 입력 영역 */}
      <div className="relative">
        <div className="flex items-center space-x-2 mb-2">
          <label className="text-sm font-medium text-gray-700">
            태그 추가
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as TagCategory)}
            disabled={disabled}
            className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          >
            {tagCategories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-500">
            ({tags.length}/{maxTags})
          </span>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || tags.length >= maxTags}
            placeholder="태그명을 입력하세요 (최소 2자)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            maxLength={20}
          />
          
          {/* 추천 태그 드롭다운 */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  onClick={() => selectSuggestion(suggestion)}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(suggestion.category)}`}>
                      {tagCategories.find(cat => cat.value === suggestion.category)?.label}
                    </span>
                    <span className="text-sm">{suggestion.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    사용 {suggestion.usage}회
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 인기 태그 */}
      {tags.length === 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            인기 태그
          </label>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag, index) => (
              <button
                key={index}
                onClick={() => addTag(tag.name, tag.category)}
                disabled={disabled}
                className={`px-3 py-1 rounded-full text-sm border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${getCategoryColor(tag.category)} border-0`}
              >
                + {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* 현재 태그 목록 */}
      {tags.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            현재 태그 ({tags.length})
          </label>
          
          {Object.entries(groupedTags).map(([category, categoryTags]) => (
            <div key={category} className="mb-3">
              <div className="text-xs text-gray-500 mb-2">
                {tagCategories.find(cat => cat.value === category)?.label} ({categoryTags.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {categoryTags.map((tag) => (
                  <div
                    key={tag.id}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getCategoryColor(tag.category)}`}
                  >
                    <span>{tag.name}</span>
                    {!disabled && (
                      <button
                        onClick={() => removeTag(tag.id)}
                        className="ml-2 text-current hover:text-red-600 font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 도움말 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Enter 키를 누르거나 추천 태그를 클릭하여 추가</p>
        <p>• 백스페이스 키로 마지막 태그 삭제</p>
        <p>• 태그는 상품 검색 및 필터링에 활용됩니다</p>
        <p>• 최대 {maxTags}개까지 추가 가능합니다</p>
      </div>
      
      {/* 태그 분석 */}
      {tags.length > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">태그 분석</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-blue-700">총 태그 수:</span>
              <span className="ml-2 font-medium">{tags.length}개</span>
            </div>
            <div>
              <span className="text-blue-700">카테고리:</span>
              <span className="ml-2 font-medium">{Object.keys(groupedTags).length}개</span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(groupedTags).map(([category, categoryTags]) => (
              <span key={category} className="text-xs text-blue-700">
                {tagCategories.find(cat => cat.value === category)?.label}: {categoryTags.length}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;
