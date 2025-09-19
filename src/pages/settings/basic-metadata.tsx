"use client"
import React, { useState } from 'react'
import { Container, Card, Input, Button, Table } from '../../design-system'

type Item = { id: string; name: string }

const makeId = (prefix = '') => Date.now().toString(36) + Math.random().toString(36).slice(2,6)

export default function BasicMetadataSettings(){
  const [brands, setBrands] = useState<Item[]>([
    { id: 'b1', name: 'ACME' },
    { id: 'b2', name: '오렌지샵' }
  ])
  const [years, setYears] = useState<Item[]>([
    { id: 'y2024', name: '2024' },
    { id: 'y2025', name: '2025' }
  ])
  const [seasons, setSeasons] = useState<Item[]>([
    { id: 's1', name: 'SS' },
    { id: 's2', name: 'FW' }
  ])

  const [newBrand, setNewBrand] = useState('')
  const [newYear, setNewYear] = useState('')
  const [newSeason, setNewSeason] = useState('')

  const addBrand = () => { if (!newBrand.trim()) return; setBrands(s => [{ id: makeId('b'), name: newBrand.trim() }, ...s]); setNewBrand('') }
  const removeBrand = (id:string) => setBrands(s => s.filter(x => x.id !== id))

  const addYear = () => { if (!newYear.trim()) return; setYears(s => [{ id: makeId('y'), name: newYear.trim() }, ...s]); setNewYear('') }
  const removeYear = (id:string) => setYears(s => s.filter(x => x.id !== id))

  const addSeason = () => { if (!newSeason.trim()) return; setSeasons(s => [{ id: makeId('s'), name: newSeason.trim() }, ...s]); setNewSeason('') }
  const removeSeason = (id:string) => setSeasons(s => s.filter(x => x.id !== id))

  return (
    <Container maxWidth="full" centered={false} padding="md">
      <h1 className="text-2xl font-bold mb-4">브랜드 · 연도 · 시즌 관리</h1>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <Card padding="md" className="mb-4">
            <h2 className="text-lg font-medium mb-2">브랜드</h2>
            <div className="flex gap-2">
              <Input placeholder="새 브랜드" value={newBrand} onChange={(e:any)=>setNewBrand(e.target.value)} />
              <Button variant="primary" onClick={addBrand}>추가</Button>
            </div>
            <div className="mt-3 space-y-2">
              {brands.map(b => (
                <div key={b.id} className="flex items-center justify-between p-2 border rounded">
                  <div>{b.name}</div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={()=>removeBrand(b.id)}>삭제</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <h2 className="text-lg font-medium mb-2">연도</h2>
            <div className="flex gap-2">
              <Input placeholder="새 연도 (예: 2026)" value={newYear} onChange={(e:any)=>setNewYear(e.target.value)} />
              <Button variant="primary" onClick={addYear}>추가</Button>
            </div>
            <div className="mt-3 space-y-2">
              {years.map(y => (
                <div key={y.id} className="flex items-center justify-between p-2 border rounded">
                  <div>{y.name}</div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={()=>removeYear(y.id)}>삭제</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-8">
          <Card padding="md">
            <h2 className="text-lg font-medium mb-2">시즌</h2>
            <div className="flex gap-2 mb-3">
              <Input placeholder="새 시즌 (예: SS, FW)" value={newSeason} onChange={(e:any)=>setNewSeason(e.target.value)} />
              <Button variant="primary" onClick={addSeason}>추가</Button>
            </div>

            <div className="space-y-2">
              {seasons.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600">{s.id}</div>
                    <div className="font-medium">{s.name}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={()=>removeSeason(s.id)}>삭제</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="md" className="mt-4">
            <h3 className="text-sm text-gray-600 mb-2">설명</h3>
            <p className="text-sm text-gray-700">브랜드, 연도, 시즌 항목을 한 페이지에서 관리할 수 있습니다. 디자인 시스템 구성요소를 사용해 간단한 CRUD 경험을 제공합니다. 실제 API 연동이 필요하면 알려주세요.</p>
          </Card>
        </div>
      </div>
    </Container>
  )
}
