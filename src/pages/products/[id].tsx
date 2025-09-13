import { useRouter } from 'next/router';
import ProductDetailPage from './ProductDetailPage';

export default function ProductDetailRoute() {
  const router = useRouter();
  // id는 [id].tsx에서 자동으로 params로 전달됨
  const { id } = router.query;
  // ProductDetailPage에 productId prop으로 전달
  return <ProductDetailPage productId={typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '1'} />;
}
