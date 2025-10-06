import React from 'react';
import { useRouter } from 'next/router';
import ProductDetailPage from '../../../src/features/products/ProductDetailPage';

const ProductDetailRoute: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  return <ProductDetailPage productId={id as string} />;
};

export default ProductDetailRoute;
