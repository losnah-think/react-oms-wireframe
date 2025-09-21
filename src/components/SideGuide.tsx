import React from 'react';

type SideGuideProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number | string;
  children?: React.ReactNode;
};

const SideGuide: React.FC<SideGuideProps> = ({ open, onClose, title, width = 380, children }) => {
  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 transition-opacity ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity ${open ? 'opacity-40' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={`absolute right-0 top-0 bottom-0 bg-white shadow-xl transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="text-lg font-semibold">{title || '도움말'}</div>
          <button className="px-2 py-1 text-gray-600" onClick={onClose}>닫기</button>
        </div>
        <div className="p-4 overflow-auto h-full">{children}</div>
      </aside>
    </div>
  );
};

export default SideGuide;
