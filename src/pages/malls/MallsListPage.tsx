import React from "react";

import { Container } from "../../design-system";

const MallsListPage: React.FC = () => {
  return (
    <Container maxWidth="full">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">쇼핑몰 목록</h1>
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">연동된 쇼핑몰</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: "네이버 스마트스토어", status: "연동됨", orders: 45 },
                { name: "쿠팡 판매자센터", status: "연동됨", orders: 32 },
                { name: "11번가", status: "대기중", orders: 0 },
                { name: "지마켓", status: "연동됨", orders: 18 },
              ].map((mall, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded"></div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {mall.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        주문 {mall.orders}건
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        mall.status === "연동됨"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {mall.status}
                    </span>
                    <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      설정
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default MallsListPage;
