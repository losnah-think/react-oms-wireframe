import React from "react";
import { useRouter } from "next/router";
import ProductDetailPage from "./ProductDetailPage";

export default function ProductDetailRoute() {
  const router = useRouter();
  const { id } = router.query;
  return (
    <ProductDetailPage
      productId={typeof id === "string" ? id : Array.isArray(id) ? id[0] : "1"}
    />
  );
}
