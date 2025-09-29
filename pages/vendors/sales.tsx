import React from "react";
import ShoppingMallIndex, { VendorsIndexPage } from "../../src/features/partners";

export default function SalesPage() {
  // prefer VendorsIndexPage if available
  const Page = VendorsIndexPage || ShoppingMallIndex;
  return <Page />;
}