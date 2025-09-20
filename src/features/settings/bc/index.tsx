import React, { useMemo, useRef, useState } from "react";
import Head from "next/head";
import BarcodeBuilder from "../../../components/barcodes/BarcodeBuilder";
import TemplateList from "../../../components/barcodes/TemplateList";
import TemplateEditor from "../../../components/barcodes/TemplateEditor";
import BarcodePreview from "../../../components/barcodes/BarcodePreview";
import type { BarcodeTemplate } from "../../../components/barcodes/TemplateList";
import { mockProducts } from "../../../data/mockProducts";
import { mockSuppliers } from "../../../data/mockSuppliers";
import { mockWarehouses } from "../../../data/mockWarehouses";
import BarcodePrintSettingsSection from "../../../features/products/components/BarcodePrintSettingsSection";
// ProductBarcodeSettings type is embedded in the component's props; avoid direct import mismatch
import QRImage from "../../../components/barcodes/QRImage";
import { useSession } from "next-auth/react";
import { shouldSkipAuth } from "../../../lib/devAuth";
import GeneralSettingsModal from "../../../components/settings/GeneralSettingsModal";

export default function BarcodeSettingsPage() {
  const sess = useSession();
  const skip = shouldSkipAuth();

  // local template state/hook (persisted to localStorage)
  const { templates, create, update, remove, duplicate } = useLocalTemplates();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const {
    formats,
    createFormat,
    updateFormat,
    removeFormat,
    generateNextForFormat,
  } = useCodeFormats();
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);
  const [generalOpen, setGeneralOpen] = useState(false);
  const [generalSettings, setGeneralSettings] = useState<any>(() => {
    try {
      if (typeof window === "undefined") return {};
      const raw = localStorage.getItem("general_settings_v1");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  });

  const [barcodeSettings, setBarcodeSettings] = useState(() => {
    try {
      if (typeof window === "undefined") return { policyAcknowledged: false, vendors: [] };
      const raw = localStorage.getItem("barcode_settings_v1");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { policyAcknowledged: false, vendors: [] };
  });

  React.useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem("barcode_settings_v1", JSON.stringify(barcodeSettings || { policyAcknowledged: false, vendors: [] }));
    } catch (e) {}
  }, [barcodeSettings]);

  const selectedTemplate = useMemo<BarcodeTemplate | null>(() => {
    return templates.find((t: BarcodeTemplate) => t.id === selectedId) ?? null;
  }, [templates, selectedId]);

  const handleCreate = () => {
    const id = create();
    setSelectedId(id);
  };

  const handleDelete = (id: string) => {
    remove(id);
    setSelectedId((prev) => (prev === id ? (templates[0]?.id ?? null) : prev));
  };

  const handleChange = (patch: Partial<any>) => {
    if (!selectedId) return;
    update(selectedId, patch);
  };

  React.useEffect(() => {
    if (!selectedId && templates.length > 0) {
      setSelectedId(templates[0].id);
    }
  }, [templates, selectedId]);

  if (!skip && sess.status !== "authenticated") {
    return (
      <div className="min-h-screen p-6 bg-gray-50 text-center">
        <Head>
          <title>Barcode Management · Settings</title>
        </Head>
        <div className="max-w-md mx-auto mt-20 bg-white p-6 rounded shadow">
          <h2 className="text-lg font-medium">로그인이 필요합니다</h2>
          <p className="text-sm text-gray-600 mt-2">
            이 페이지는 관리자 전용입니다. 로그인 후 접근하세요.
          </p>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="min-h-screen p-6 bg-gray-50">
        <Head>
          <title>Barcode Management · Settings</title>
        </Head>

        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-2xl font-semibold mb-4">바코드 관리</h1>
          <div className="flex items-center justify-between mb-4">
            <div />
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const raw = localStorage.getItem("barcode_templates_v1");
                  const blob = new Blob([raw || "[]"], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `barcode-templates-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-2 border rounded text-sm"
              >
                내보내기
              </button>
              <label className="px-3 py-2 border rounded text-sm cursor-pointer bg-white">
                가져오기
                <input
                  type="file"
                  accept="application/json"
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      try {
                        const parsed = JSON.parse(
                          String(ev.target?.result || "[]"),
                        );
                        if (Array.isArray(parsed)) {
                          localStorage.setItem(
                            "barcode_templates_v1",
                            JSON.stringify(parsed),
                          );
                          window.location.reload();
                        } else alert("올바른 포맷의 파일이 아닙니다");
                      } catch (err) {
                        alert("파일 파싱 실패");
                      }
                    };
                    reader.readAsText(f);
                  }}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 bg-white p-4 rounded shadow">
              <BarcodeBuilder.Sidebar />
              <div className="mt-4">
                <h4 className="font-medium mb-2">Code Formats</h4>
                <div className="space-y-2">
                  {formats.map((f) => (
                    <div
                      key={f.id}
                      className={`p-2 rounded ${selectedFormatId === f.id ? "bg-primary-50" : "bg-gray-50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm">{f.name}</div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedFormatId(f.id)}
                            className="text-xs px-2 py-1 border rounded"
                          >
                            Select
                          </button>
                          <button
                            onClick={() => {
                              const next = generateNextForFormat(f.id);
                              if (selectedId)
                                update(selectedId, { value: next });
                            }}
                            className="text-xs px-2 py-1 border rounded"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => removeFormat(f.id)}
                            className="text-xs px-2 py-1 text-red-600"
                          >
                            Del
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {f.pattern}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const id = createFormat();
                      setSelectedFormatId(id);
                    }}
                    className="text-sm text-primary-600"
                  >
                    New format
                  </button>
                </div>

                {selectedFormatId &&
                  (() => {
                    const fmt = formats.find((x) => x.id === selectedFormatId);
                    if (!fmt) return null;
                    return (
                      <div className="mt-4 p-3 border rounded bg-white">
                        <div className="text-sm font-medium mb-2">
                          Edit Format
                        </div>
                        <label className="block text-xs text-gray-500">
                          Name
                        </label>
                        <input
                          className="w-full border px-2 py-1 rounded mb-2"
                          value={fmt.name}
                          onChange={(e) =>
                            updateFormat(fmt.id, { name: e.target.value })
                          }
                        />
                        <label className="block text-xs text-gray-500">
                          Pattern
                        </label>
                        <input
                          className="w-full border px-2 py-1 rounded mb-2"
                          value={fmt.pattern}
                          onChange={(e) =>
                            updateFormat(fmt.id, { pattern: e.target.value })
                          }
                        />
                        <label className="block text-xs text-gray-500">
                          Next Sequence
                        </label>
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="number"
                            className="w-24 border px-2 py-1 rounded"
                            value={fmt.seq ?? 1}
                            onChange={(e) =>
                              updateFormat(fmt.id, {
                                seq: Number(e.target.value) || 1,
                              })
                            }
                          />
                          <button
                            onClick={() => updateFormat(fmt.id, { seq: 1 })}
                            className="text-xs px-2 py-1 border rounded"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => {
                              const next = generateNextForFormat(fmt.id);
                              alert("Preview: " + next);
                            }}
                            className="text-xs px-2 py-1 border rounded"
                          >
                            Preview Next
                          </button>
                        </div>
                      </div>
                    );
                  })()}
              </div>
            </div>
            <div className="mt-4">
              <TemplateList
                templates={templates}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId(id)}
                onCreate={() => handleCreate()}
                onDelete={(id) => handleDelete(id)}
                onDuplicate={(id) => {
                  const nid = duplicate(id);
                  setSelectedId(nid);
                }}
              />
            </div>
          </div>
          <div className="col-span-6 bg-white p-4 rounded shadow">
            <BarcodePreview template={selectedTemplate} />
          </div>
          <div className="col-span-3 bg-white p-4 rounded shadow">
            <TemplateEditor
              template={selectedTemplate}
              onChange={handleChange}
            />
            <div className="mt-4">
              <BarcodePrintSettingsSection
                settings={barcodeSettings}
                onChange={(next) => setBarcodeSettings(next)}
                suppliers={(mockSuppliers || []).map((s) => ({ id: String(s.id), name: s.name }))}
              />
            </div>
            <div className="mt-4">
              <h4 className="font-medium">Actions</h4>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleGeneratePdf()}
                    className="px-3 py-2 bg-primary-600 text-white rounded"
                  >
                    Generate PDF
                  </button>
                  <button
                    onClick={() => handleExportPng()}
                    className="px-3 py-2 border rounded"
                  >
                    Export PNG
                  </button>
                  <button
                    onClick={() => setPreviewOpen(true)}
                    className="px-3 py-2 border rounded"
                  >
                    Preview Label
                  </button>
                  <button
                    onClick={() => setGeneralOpen(true)}
                    className="px-3 py-2 border rounded"
                  >
                    기초 설정
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        template={selectedTemplate}
      />
      <GeneralSettingsModal
        open={generalOpen}
        initial={generalSettings}
        onClose={() => setGeneralOpen(false)}
        onSave={(p) => {
          setGeneralSettings(p);
          try {
            localStorage.setItem("general_settings_v1", JSON.stringify(p));
          } catch (e) {}
        }}
      />
    </>
  );
}

// --- Preview modal implementation ---
function PreviewModal({
  open,
  onClose,
  template,
}: {
  open: boolean;
  onClose: () => void;
  template?: BarcodeTemplate | null;
}) {
  if (!open || !template) return null;
  const product = mockProducts[0];

  const renderContent = (tmpl: string) => {
    if (!tmpl) return "";
    const supplier = mockSuppliers[product.supplier_id % mockSuppliers.length];
    const warehouse = mockWarehouses[0];
    return tmpl
      .replace(/\{barcode\}/g, template.value || "")
      .replace(/\{qrcode\}/g, template.value || "")
      .replace(/\{seq\}/g, "1")
      .replace(/\{name\}/g, product.name || "")
      .replace(
        /\{supplier\}/g,
        supplier?.name || String(product.supplier_id || ""),
      )
      .replace(/\{cost\}/g, String(product.cost_price || ""))
      .replace(/\{price\}/g, String(product.selling_price || ""))
      .replace(/\{unitPrice\}/g, String(product.supply_price || ""))
      .replace(/\{warehouse\}/g, warehouse?.location || "")
      .replace(
        /\{vendor\}/g,
        supplier?.name || String(product.supplier_id || ""),
      )
      .replace(
        /\{option\}/g,
        product.variants && product.variants[0]
          ? product.variants[0].variant_name
          : "",
      );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[800px] p-6 rounded shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Label Preview</h3>
          <button onClick={onClose} className="text-sm text-gray-600">
            Close
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="p-4 border h-64">
              <div className="mb-2 text-sm text-gray-700">
                Barcode ({template.barcodeType || "code128"})
              </div>
              <div className="w-full h-40 bg-white flex items-center justify-center barcode-preview-root">
                <div className="flex items-center space-x-4">
                  <div>
                    <BarcodePreview template={template} />
                  </div>
                  <div>
                    {template.content &&
                    template.content.includes("{qrcode}") ? (
                      <QRImage value={template.value || ""} size={96} />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="p-4 border h-64 overflow-auto text-sm">
              <div className="font-medium mb-2">Rendered Content</div>
              <pre className="whitespace-pre-wrap">
                {renderContent(String(template.content || ""))}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helpers and local state (below component because page is default export) ---
function useLocalTemplates() {
  const STORAGE_KEY = "barcode_templates_v1";

  const [templates, setTemplates] = useState<BarcodeTemplate[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as BarcodeTemplate[];
    } catch (e) {
      // ignore
    }
    return [
      {
        id: "t-default",
        name: "Default - 1up",
        value: "012345678901",
        barcodeType: "code128",
        scale: 3,
        height: 10,
        includetext: true,
        quantity: 1,
      },
      {
        id: "t-small",
        name: "Small Label",
        value: "ABC-0001",
        barcodeType: "code128",
        scale: 2,
        height: 8,
        includetext: false,
        quantity: 1,
      },
    ];
  });

  // persist
  React.useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch (e) {
      // ignore
    }
  }, [templates]);

  const create = () => {
    const id = "t-" + Math.random().toString(36).slice(2, 9);
    const t: BarcodeTemplate = {
      id,
      name: "New Template",
      value: "",
      barcodeType: "code128",
      scale: 3,
      height: 10,
      includetext: true,
      quantity: 1,
    };
    setTemplates((s: BarcodeTemplate[]) => [t, ...s]);
    return id;
  };

  const update = (id: string, patch: Partial<BarcodeTemplate>) => {
    setTemplates((s: BarcodeTemplate[]) =>
      s.map((t: BarcodeTemplate) => (t.id === id ? { ...t, ...patch } : t)),
    );
  };

  const remove = (id: string) => {
    setTemplates((s: BarcodeTemplate[]) =>
      s.filter((t: BarcodeTemplate) => t.id !== id),
    );
  };

  const duplicate = (id: string) => {
    let newId = "";
    setTemplates((s: BarcodeTemplate[]) => {
      const found = s.find((x: BarcodeTemplate) => x.id === id);
      if (!found) return s;
      newId = "t-" + Math.random().toString(36).slice(2, 9);
      const dup: BarcodeTemplate = {
        ...found,
        id: newId,
        name: found.name + " (copy)",
      };
      return [dup, ...s];
    });
    return newId;
  };

  return { templates, create, update, remove, duplicate };
}

// Code format management: persist patterns and sequence counters
type CodeFormat = {
  id: string;
  name: string;
  pattern: string;
  seq?: number;
};

function useCodeFormats() {
  const KEY = "barcode_code_formats_v1";
  const [formats, setFormats] = React.useState<CodeFormat[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw) as CodeFormat[];
    } catch (e) {}
    return [
      {
        id: "fmt-default",
        name: "Default",
        pattern: "{DATE:yyyyMMdd}-{SEQ:4}",
        seq: 1,
      },
    ];
  });

  React.useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(KEY, JSON.stringify(formats));
    } catch (e) {}
  }, [formats]);

  const createFormat = () => {
    const id = "fmt-" + Math.random().toString(36).slice(2, 9);
    const f: CodeFormat = {
      id,
      name: "New format",
      pattern: "{DATE:yyyyMMdd}-{SEQ:4}",
      seq: 1,
    };
    setFormats((s) => [f, ...s]);
    return id;
  };

  const updateFormat = (id: string, patch: Partial<CodeFormat>) =>
    setFormats((s) => s.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const removeFormat = (id: string) =>
    setFormats((s) => s.filter((f) => f.id !== id));

  // helper: format date according to simple tokens (yyyy, MM, dd)
  const fmtDate = (d: Date, fmt: string) => {
    const map: Record<string, string> = {
      yyyy: String(d.getFullYear()),
      yy: String(d.getFullYear()).slice(-2),
      MM: String(d.getMonth() + 1).padStart(2, "0"),
      dd: String(d.getDate()).padStart(2, "0"),
      HH: String(d.getHours()).padStart(2, "0"),
      mm: String(d.getMinutes()).padStart(2, "0"),
      ss: String(d.getSeconds()).padStart(2, "0"),
    };
    return fmt.replace(/yyyy|yy|MM|dd|HH|mm|ss/g, (m) => map[m] ?? m);
  };

  const generateNextForFormat = (id: string, sku?: string) => {
    let out = "";
    setFormats((s) =>
      s.map((f) => {
        if (f.id !== id) return f;
        const pattern = f.pattern || "";
        let result = pattern.replace(/\{DATE:([^}]+)\}/g, (_, p) =>
          fmtDate(new Date(), p),
        );
        result = result.replace(/\{SEQ:(\d+)\}/g, (_, w) => {
          const width = Number(w) || 4;
          const seq = f.seq || 1;
          const sStr = String(seq).padStart(width, "0");
          return sStr;
        });
        result = result.replace(/\{SKU\}/g, sku || "");
        out = result;
        return { ...f, seq: (f.seq || 1) + 1 };
      }),
    );
    return out;
  };

  return {
    formats,
    createFormat,
    updateFormat,
    removeFormat,
    generateNextForFormat,
  };
}

// The following functions are used in the page via closures; we define them here to keep the top component small
function handleGeneratePdf() {
  // Try to generate PDF from the preview area if html2canvas + jspdf are available, otherwise fallback to print
  const el = document.querySelector(
    ".barcode-preview-root",
  ) as HTMLElement | null;
  if (!el) {
    window.print();
    return;
  }

  (async () => {
    try {
      const [html2canvas, jspdfModule] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await (html2canvas.default || html2canvas)(el);
      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = jspdfModule as any;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("labels.pdf");
    } catch (err) {
      console.error("PDF export failed", err);
      window.print();
    }
  })();
}

function handleExportPng() {
  // find first canvas on page and open as PNG in new tab
  const canvas = document.querySelector("canvas") as HTMLCanvasElement | null;
  if (!canvas) {
    alert("No barcode to export");
    return;
  }
  const url = canvas.toDataURL("image/png");
  const w = window.open("about:blank");
  if (w) w.document.write(`<img src="${url}" alt="barcode"/>`);
}
