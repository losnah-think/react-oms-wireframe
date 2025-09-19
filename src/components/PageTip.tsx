import React, { useEffect, useState } from "react";
import Card from "../design-system/components/Card";

type PageTipProps = {
  text: string;
  id?: string;
};

export default function PageTip({ text, id = "page-tip" }: PageTipProps) {
  const storageKey = `page_tip_dismissed:${id}`;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const val = localStorage.getItem(storageKey);
      setDismissed(val === "1");
    } catch (e) {
      // ignore
    }
  }, [storageKey]);

  if (dismissed) return null;

  return (
    <Card variant="outlined" padding="md" className="mb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="text-sm text-gray-800">{text}</div>
        <button
          onClick={() => {
            try {
              localStorage.setItem(storageKey, "1");
            } catch (e) {}
            setDismissed(true);
          }}
          className="text-sm text-gray-500 hover:text-gray-700"
          aria-label="Dismiss tip"
        >
          닫기
        </button>
      </div>
    </Card>
  );
}
