import React, { useEffect } from 'react'

interface ToastProps {
  message: string | null;
  onClose?: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 2500 }) => {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className="bg-black text-white px-4 py-2 rounded shadow-lg text-sm">{message}</div>
    </div>
  );
}

export default Toast;
