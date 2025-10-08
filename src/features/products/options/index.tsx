// src/features/products/options/index.tsx
import React from 'react';
import { useRouter } from 'next/router';
import OptionEditPage from './OptionEditPage';

export default function OptionEditRoute() {
  const router = useRouter();
  const { productId, optionId } = router.query;
  
  const handleSave = async (data: any) => {
    console.log('옵션 저장:', data);
    // 실제 저장 로직
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <OptionEditPage
      productId={typeof productId === 'string' ? productId : '1'}
      optionId={typeof optionId === 'string' ? optionId : undefined}
      mode={optionId ? 'edit' : 'create'}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
