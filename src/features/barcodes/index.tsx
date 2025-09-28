import React from "react";
import Link from "next/link";

const BarcodesIndexPage: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">바코드 관리</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/barcodes/product"
          className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
        >
          <h2 className="text-lg font-medium text-gray-900 mb-2">상품 바코드</h2>
          <p className="text-sm text-gray-600">상품별 바코드 조회 및 관리</p>
        </Link>

        <Link
          href="/barcodes/option"
          className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
        >
          <h2 className="text-lg font-medium text-gray-900 mb-2">위치 바코드</h2>
          <p className="text-sm text-gray-600">창고 위치 바코드 관리</p>
        </Link>
      </div>
    </div>
  );
};

export default BarcodesIndexPage;
