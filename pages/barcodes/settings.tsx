import dynamic from "next/dynamic";

const BarcodeSettingsPage = dynamic(
  () => import("@/features/barcodes/settings"),
  { ssr: false },
);

export default BarcodeSettingsPage;
