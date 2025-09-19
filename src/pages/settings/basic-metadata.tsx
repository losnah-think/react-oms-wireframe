"use client"
import React, { useEffect, useState } from 'react'
import { Container, Card, Input, Button } from '../../design-system'

type Brand = { id: string; name: string }
type Year = { id: string; name: string }
type Season = { id: string; name: string; yearId?: string }

const makeId = (prefix = '') => Date.now().toString(36) + Math.random().toString(36).slice(2,6)

const LS_KEYS = {
  BRANDS: 'basic_brands_v1',
  YEARS: 'basic_years_v1',
  SEASONS: 'basic_seasons_v1'
}

const defaultBrands: Brand[] = [{ id: 'b1', name: 'ACME' }, { id: 'b2', name: '오렌지샵' }]
const defaultYears: Year[] = [{ id: 'y2024', name: '2024' }, { id: 'y2025', name: '2025' }]
const defaultSeasons: Season[] = [{ id: 's1', name: 'SS', yearId: 'y2024' }, { id: 's2', name: 'FW', yearId: 'y2024' }]

function loadOrDefault<T>(key: string, fallback: T) : T {
  try {
    if (typeof window === 'undefined') return fallback
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch (e) { return fallback }
}

export default function BasicMetadataSettings(){
  const [brands, setBrands] = useState<Brand[]>(() => loadOrDefault<Brand[]>(LS_KEYS.BRANDS, defaultBrands))
  const [years, setYears] = useState<Year[]>(() => loadOrDefault<Year[]>(LS_KEYS.YEARS, defaultYears))
  const [seasons, setSeasons] = useState<Season[]>(() => loadOrDefault<Season[]>(LS_KEYS.SEASONS, defaultSeasons))

  const [newBrand, setNewBrand] = useState('')
  const [newYear, setNewYear] = useState('')
  const [newSeason, setNewSeason] = useState('')
  const [newSeasonYear, setNewSeasonYear] = useState<string | ''>('')

  const [brandSearch, setBrandSearch] = useState('')

  // editing states
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null)
  const [editingBrandName, setEditingBrandName] = useState('')

  useEffect(() => { localStorage.setItem(LS_KEYS.BRANDS, JSON.stringify(brands)) }, [brands])
  useEffect(() => { localStorage.setItem(LS_KEYS.YEARS, JSON.stringify(years)) }, [years])
  useEffect(() => { localStorage.setItem(LS_KEYS.SEASONS, JSON.stringify(seasons)) }, [seasons])

  const addBrand = () => {
    const val = newBrand.trim()
    if (!val) return
    setBrands(s => [{ id: makeId('b'), name: val }, ...s])
    setNewBrand('')
  }

  const startEditBrand = (b: Brand) => { setEditingBrandId(b.id); setEditingBrandName(b.name) }
  const saveEditBrand = () => {
    if (!editingBrandId) return
    setBrands(s => s.map(x => x.id === editingBrandId ? { ...x, name: editingBrandName.trim() || x.name } : x))
    setEditingBrandId(null); setEditingBrandName('')
  }
  const cancelEditBrand = () => { setEditingBrandId(null); setEditingBrandName('') }

  const removeBrand = (id:string) => setBrands(s => s.filter(x => x.id !== id))

  const addYear = () => {
    const val = newYear.trim()
    if (!val) return
    setYears(s => [{ id: makeId('y'), name: val }, ...s])
    setNewYear('')
  }
  const removeYear = (id:string) => {
    // when removing a year, also clear yearId from seasons
    setYears(s => s.filter(x => x.id !== id))
    setSeasons(s => s.map(se => se.yearId === id ? { ...se, yearId: undefined } : se))
  }

  const addSeason = () => {
    const val = newSeason.trim()
    if (!val) return
    setSeasons(s => [{ id: makeId('s'), name: val, yearId: newSeasonYear || undefined }, ...s])
    setNewSeason(''); setNewSeasonYear('')
  }
  const removeSeason = (id:string) => setSeasons(s => s.filter(x => x.id !== id))

  const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()))

  return (
    <Container maxWidth="full" centered={false} padding="md">
      <h1 className="text-2xl font-bold mb-4">브랜드 · 연도 · 시즌 관리</h1>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <Card padding="md" className="mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium mb-2">브랜드</h2>
              <Input className="w-40" placeholder="검색" value={brandSearch} onChange={(e:any)=>setBrandSearch(e.target.value)} />
            </div>

            <div className="flex gap-2 mb-2">
              <Input placeholder="새 브랜드" value={newBrand} onChange={(e:any)=>setNewBrand(e.target.value)} />
              <Button variant="primary" onClick={addBrand}>추가</Button>
            </div>

            <div className="mt-3 space-y-2 max-h-72 overflow-auto">
              {filteredBrands.map(b => (
                <div key={b.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    {editingBrandId === b.id ? (
                      <div className="flex gap-2">
                        <Input value={editingBrandName} onChange={(e:any)=>setEditingBrandName(e.target.value)} />
                        <Button variant="primary" onClick={saveEditBrand}>저장</Button>
                        <Button variant="ghost" onClick={cancelEditBrand}>취소</Button>
                      </div>
                    ) : (
                      <div className="font-medium">{b.name}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editingBrandId !== b.id && <Button variant="ghost" onClick={()=>startEditBrand(b)}>수정</Button>}
                    <Button variant="ghost" onClick={()=>removeBrand(b.id)}>삭제</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <h2 className="text-lg font-medium mb-2">연도</h2>
            <div className="flex gap-2 mb-2">
              <Input placeholder="새 연도 (예: 2026)" value={newYear} onChange={(e:any)=>setNewYear(e.target.value)} />
              <Button variant="primary" onClick={addYear}>추가</Button>
            </div>
            <div className="mt-3 space-y-2 max-h-40 overflow-auto">
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium mb-2">시즌</h2>
              <div className="text-sm text-gray-600">연도와 연동해 시즌을 관리할 수 있습니다.</div>
            </div>

            <div className="flex gap-2 mb-3">
              <Input placeholder="새 시즌 (예: SS, FW)" value={newSeason} onChange={(e:any)=>setNewSeason(e.target.value)} />
              <select className="rounded border p-2" value={newSeasonYear} onChange={(e)=>setNewSeasonYear(e.target.value)}>
                <option value="">연도 선택 (선택사항)</option>
                {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
              <Button variant="primary" onClick={addSeason}>추가</Button>
            </div>

            <div className="space-y-2">
              {seasons.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600">{s.id}</div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-gray-500">{s.yearId ? (years.find(y => y.id === s.yearId)?.name ?? '삭제된 연도') : '연도 미지정'}</div>
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
            <p className="text-sm text-gray-700">브랜드, 연도, 시즌 항목을 한 페이지에서 관리합니다. 변경사항은 로컬 브라우저 저장소에 저장되어 새로고침 후에도 유지됩니다.</p>
          </Card>
        </div>
      </div>
    </Container>
  )
}
