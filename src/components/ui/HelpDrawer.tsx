import React, { useEffect } from 'react';

type HelpDrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
};

export default function HelpDrawer({ open, onClose, title = '도움말', children }: HelpDrawerProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <aside className="w-[420px] max-w-full bg-white shadow-xl overflow-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-medium">{title}</h3>
          <button aria-label="Close help" onClick={onClose} className="px-2 py-1 rounded bg-gray-100">닫기</button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </aside>
    </div>
  );
}
