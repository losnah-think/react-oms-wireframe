// src/features/users/components/AutoCompleteSearch.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '../../../design-system';
import { User } from '../types';

interface AutoCompleteSearchProps {
  onUserSelect: (user: User) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface SearchSuggestion {
  type: 'user' | 'department' | 'email';
  value: string;
  user?: User;
  count?: number;
}

const AutoCompleteSearch: React.FC<AutoCompleteSearchProps> = ({
  onUserSelect,
  placeholder = "사용자 검색...",
  disabled = false,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // 검색 실행
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
      const data = await response.json();
      
      if (data.users) {
        const userSuggestions: SearchSuggestion[] = data.users.map((user: User) => ({
          type: 'user',
          value: `${user.name} (${user.email})`,
          user: user
        }));

        // 부서별 제안 추가
        const departmentSuggestions: SearchSuggestion[] = data.suggestions
          ?.filter((suggestion: string) => suggestion.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((dept: string) => ({
            type: 'department',
            value: `${dept} 부서`,
            count: data.users.filter((u: User) => u.department === dept).length
          })) || [];

        setSuggestions([...userSuggestions, ...departmentSuggestions]);
      }
    } catch (error) {
      console.error('검색 실패:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 디바운스된 검색
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
  }, [performSearch]);

  // 입력 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.length >= 2) {
      setShowSuggestions(true);
      debouncedSearch(value);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // 제안 클릭 처리
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'user' && suggestion.user) {
      onUserSelect(suggestion.user);
      
      // 검색 히스토리에 추가
      const historyKey = `userSearchHistory_${suggestion.user.id}`;
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const newHistory = [suggestion.user.name, ...history.filter((item: string) => item !== suggestion.user!.name)].slice(0, 5);
      localStorage.setItem(historyKey, JSON.stringify(newHistory));
    }
    
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setSuggestions([]);
  };

  // 포커스 처리
  const handleFocus = () => {
    if (query.length >= 2) {
      setShowSuggestions(true);
    }
  };

  // 외부 클릭 처리
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 검색 히스토리 로드
  useEffect(() => {
    const savedHistory = localStorage.getItem('userSearchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('검색 히스토리 로드 실패:', error);
      }
    }
  }, []);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        disabled={disabled}
        className="w-full"
      />
      
      {/* 로딩 인디케이터 */}
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* 제안 목록 */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {suggestions.length > 0 ? (
            <>
              {/* 검색 결과 헤더 */}
              <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
                <span className="text-xs text-gray-600">
                  {suggestions.length}개 결과
                </span>
              </div>
              
              {/* 제안 목록 */}
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-3 ${
                    index === selectedIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    {suggestion.type === 'user' ? (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {(suggestion.user?.name || '').charAt(0) || '?'}
                      </div>
                    ) : suggestion.type === 'department' ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                        🏢
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">
                        📧
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {suggestion.value}
                    </div>
                    {suggestion.type === 'user' && suggestion.user && (
                      <div className="text-xs text-gray-500 truncate">
                        {suggestion.user.department} • {suggestion.user.role}
                      </div>
                    )}
                    {suggestion.type === 'department' && suggestion.count && (
                      <div className="text-xs text-gray-500">
                        {suggestion.count}명의 사용자
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    <span className="text-xs text-gray-400">
                      {suggestion.type === 'user' ? 'Enter' : 'Tab'}
                    </span>
                  </div>
                </button>
              ))}
            </>
          ) : query.length >= 2 && !loading ? (
            <div className="px-3 py-4 text-center text-gray-500 text-sm">
              검색 결과가 없습니다
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AutoCompleteSearch;
