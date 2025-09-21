import { useRouter } from 'next/router';
import VendorDetailPage from '@/features/vendors/VendorDetailPage';

export default function VendorDetailWrapper() {
  const router = useRouter();
  const { id } = router.query;
  const vid = Array.isArray(id) ? Number(id[0]) : Number(id);
  if (!vid) return <div className="p-6">잘못된 판매처 ID</div>;
  return <VendorDetailPage vendorId={vid} />;
}
