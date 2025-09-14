"use client"
import React, { createContext, useContext, useState, useCallback } from 'react'

type Toast = { id: string; message: string; type?: 'info'|'error'|'success' }

const ToastContext = createContext<any>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2,6)
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 8000)
  }, [])

  const remove = useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), [])

  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}
      <div style={{ position: 'fixed', right: 16, top: 16, zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ marginBottom: 8, padding: '10px 14px', borderRadius: 6, background: t.type === 'error' ? '#fee2e2' : t.type === 'success' ? '#ecfccb' : '#eef2ff', color: '#111', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ fontWeight: 600 }}>{t.type?.toUpperCase()}</div>
            <div style={{ marginTop: 4 }}>{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
