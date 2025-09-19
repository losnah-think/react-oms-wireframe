import React from "react";
import { Container } from "../../design-system";
import MallsListPage from "../malls/MallsListPage";
import VendorsIndex from "./vendors/index";

export default function ShoppingMallIndex() {
  return (
    <Container maxWidth="full">
      <div className="p-6">
  <h1 className="text-2xl font-bold mb-4">판매처 관리</h1>
  <p className="text-gray-600 mb-6">쇼핑몰과 판매처를 하나의 관리 화면에서 확인하고 이동하세요.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-3">쇼핑몰 관리</h2>
            <MallsListPage />
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-3">판매처 관리</h2>
            <VendorsIndex />
          </div>
        </div>
      </div>
    </Container>
  );
}

export { default as VendorsIndexPage } from "./vendors/index";
