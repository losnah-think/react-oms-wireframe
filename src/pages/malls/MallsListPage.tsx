import React, { useState } from "react";

import { Container } from "../../design-system";
import MallSettingsModal from '../../components/malls/MallSettingsModal'
import GeneralSettingsModal from '../../components/settings/GeneralSettingsModal'

const initialMalls = [
  { id: 'm1', name: "네이버 스마트스토어", status: "연동됨", orders: 45 },
  { id: 'm2', name: "쿠팡 판매자센터", status: "연동됨", orders: 32 },
  { id: 'm3', name: "11번가", status: "대기중", orders: 0 },
  { id: 'm4', name: "지마켓", status: "연동됨", orders: 18 },
]

const MallsListPage: React.FC = () => {
  const [malls, setMalls] = useState<any[]>(() => {
    try {
      if (typeof window === 'undefined') return initialMalls
      const raw = window.localStorage.getItem('malls_v1')
      if (raw) return JSON.parse(raw)
    } catch (e) {}
    return initialMalls
  })
  const [editing, setEditing] = useState<any | null>(null)
  const [generalOpen, setGeneralOpen] = useState(false)
  const [generalSettings, setGeneralSettings] = useState<any>(() => {
    try {
      if (typeof window === 'undefined') return {}
      const raw = localStorage.getItem('general_settings_v1')
      if (raw) return JSON.parse(raw)
    } catch (e) {}
    return {}
  })

  const handleSave = async (m: any) => {
    // simple in-memory upsert
    setMalls(prev => {
      let next
      if (m.id) {
        next = prev.map(p => p.id === m.id ? { ...p, ...m, status: m.active ? '연동됨' : '대기중' } : p)
      } else {
        const nid = `m_${Date.now()}`
        next = [{ id: nid, ...m, status: m.active ? '연동됨' : '대기중', orders: 0 }, ...prev]
      }
      try { window.localStorage.setItem('malls_v1', JSON.stringify(next)) } catch (e) {}
      // notify listeners
      try { window.dispatchEvent(new CustomEvent('malls:updated')) } catch (e) {}
      return next
    })
  }

  // Listen for external updates (e.g., from integrations page)
  React.useEffect(() => {
    const handler = () => {
      try {
        const raw = window.localStorage.getItem('malls_v1')
        if (raw) setMalls(JSON.parse(raw))
      } catch (e) {}
    }
    window.addEventListener('malls:updated', handler)
    return () => window.removeEventListener('malls:updated', handler)
  }, [])

  return (
    <Container maxWidth="full">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">쇼핑몰 목록</h1>
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">연동된 쇼핑몰</h2>
            <div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 border rounded" onClick={() => setGeneralOpen(true)}>기초 설정</button>
                <button className="px-3 py-2 bg-primary-600 text-white rounded" onClick={() => setEditing({})}>쇼핑몰 추가</button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {malls.map((mall: any) => (
                <div
                  key={mall.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded"></div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {mall.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        주문 {mall.orders}건
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        mall.status === "연동됨"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {mall.status}
                    </span>
                    <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded" onClick={() => setEditing(mall)}>
                      설정
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <MallSettingsModal
        open={!!editing}
        initial={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />

      <GeneralSettingsModal
        open={generalOpen}
        initial={generalSettings}
        onClose={() => setGeneralOpen(false)}
        onSave={(p) => { setGeneralSettings(p); try { localStorage.setItem('general_settings_v1', JSON.stringify(p)) } catch (e) {} setGeneralOpen(false) }}
      />
    </Container>
  );
};

export default MallsListPage;
