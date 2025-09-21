import React from "react";
import Link from "next/link";

const BarcodesIndexPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">위치 바코드 관리</h1>
      <div className="space-y-2">
        <Link href="/barcodes/product" className="text-primary-600 hover:underline">
          상품 바코드 관리
        </Link>
        <Link href="/barcodes/option" className="text-primary-600 hover:underline">
          위치 바코드 관리
        </Link>
        <Link href="/barcodes/settings" className="text-primary-600 hover:underline">
          바코드 환경 설정
        </Link>
      </div>
    </div>
  );
};

export default BarcodesIndexPage;
