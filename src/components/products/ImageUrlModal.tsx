// src/components/products/ImageUrlModal.tsx
import React, { useState } from 'react';

interface ImageUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (imageUrl: string) => void;
}

const ImageUrlModal: React.FC<ImageUrlModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePreview = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      // URL 유효성 검사
      new URL(imageUrl);
      
      // 이미지 로드 테스트
      const img = new Image();
      img.onload = () => {
        setPreviewUrl(imageUrl);
        setIsLoading(false);
      };
      img.onerror = () => {
        setError('이미지를 불러올 수 없습니다. URL을 확인해주세요.');
        setIsLoading(false);
      };
      img.src = imageUrl;
    } catch (err) {
      setError('유효하지 않은 URL입니다.');
      setIsLoading(false);
    }
  };

  const handleUpload = () => {
    if (previewUrl) {
      onUpload(previewUrl);
      handleClose();
    }
  };

  const handleClose = () => {
    setImageUrl('');
    setPreviewUrl('');
    setError('');
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && imageUrl && !previewUrl) {
      handlePreview();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">이미지 URL 입력</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="px-6 py-4">
          {/* URL 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지 URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handlePreview}
                disabled={!imageUrl || isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '로딩...' : '미리보기'}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* 미리보기 영역 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              미리보기
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[300px] flex items-center justify-center bg-gray-50">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="max-w-full max-h-[400px] object-contain"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>URL을 입력하고 미리보기 버튼을 눌러주세요</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleUpload}
            disabled={!previewUrl}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            업로드
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUrlModal;

