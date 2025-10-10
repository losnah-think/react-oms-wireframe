import dynamic from "next/dynamic";

const BarcodeTemplateEditorPage = dynamic(
  () => import("@/features/barcodes/TemplateEditorPage"),
  { ssr: false },
);

export default BarcodeTemplateEditorPage;

