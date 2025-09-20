import React from "react";
import { useRouter } from "next/router";
import OptionEditPage from "./OptionEditPage";

export default function ProductOptionEditRoute() {
  const router = useRouter();
  const { id, productId, variantId } = router.query;

  const resolvedProductId = (() => {
    const candidates = [productId, id];
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate) return candidate;
      if (Array.isArray(candidate) && candidate.length > 0)
        return candidate[0];
    }
    return "";
  })();
  const resolvedVariantId =
    typeof variantId === "string"
      ? variantId
      : Array.isArray(variantId)
      ? variantId[0]
      : "";

  return (
    <OptionEditPage
      productId={resolvedProductId}
      variantId={resolvedVariantId}
    />
  );
}
