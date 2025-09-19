"use client"
import React, { useMemo, useState } from 'react'
import { Container, Card, Button, Input } from '../../design-system'

type Row = {
  seq: number
  source: string
  datetime: string
  total: number
  success: number
  failed: number
}

const PLATFORMS = ['카페24','메이크샵','고도몰','스마트스토어']

const mkDate = (d: Date) => d.toISOString().slice(0,10)

const generateMock = (count = 40) => {
  const rows: Row[] = []
  for (let i=0;i<count;i++){
    const total = Math.floor(Math.random()*20)
    const success = Math.floor(Math.random()*(total+1))
    const failed = total - success
    const dt = new Date(Date.now() - Math.floor(Math.random()*1000*60*60*24*30))
    rows.push({ seq: i+1, source: `${PLATFORMS[i%PLATFORMS.length]} 상품등록`, datetime: dt.toLocaleString(), total, success, failed })
  }
  return rows
}

export default function RegistrationHistoryPage(){
  const [rows] = useState<Row[]>(() => generateMock(48))
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [platform, setPlatform] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const perPage = 10

  const filtered = useMemo(()=>{
    return rows.filter(r => {
      if (platform && !r.source.includes(platform)) return false
      if (from){
        const dFrom = new Date(from)
        if (new Date(r.datetime) < dFrom) return false
      }
      if (to){
        const dTo = new Date(to)
        if (new Date(r.datetime) > dTo) return false
      }
      return true
    })
  },[rows, from, to, platform])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageRows = filtered.slice((page-1)*perPage, page*perPage)

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">차수별 상품등록 내역</h1>
        <div className="flex gap-2 items-center">
          <select value={platform} onChange={e=>setPlatform(e.target.value)} className="border p-2 rounded">
            <option value="">전체 플랫폼</option>
            {PLATFORMS.map(p=> <option key={p} value={p}>{p}</option>)}
          </select>
          <Input type="date" value={from} onChange={(e:any)=>setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e:any)=>setTo(e.target.value)} />
          <Button onClick={()=>{ setPage(1) }}>검색</Button>
          <Button variant="secondary" onClick={()=>{ setFrom(''); setTo(''); setPlatform(''); setPage(1) }}>리셋</Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-600">
                <th className="px-3 py-2 w-40">입력차수</th>
                <th className="px-3 py-2">입력처</th>
                <th className="px-3 py-2 w-40">건수</th>
                <th className="px-3 py-2 w-36">비고</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(r => (
                <tr key={r.seq} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2 align-top">
                    <div className="font-medium">{r.seq} 차</div>
                    <div className="text-xs text-gray-500">{r.datetime}</div>
                  </td>
                  <td className="px-3 py-2 align-top">{r.source}</td>
                  <td className="px-3 py-2 align-top">
                    <div className="text-sm font-medium mb-1">총 {r.total}건</div>
                    <div className="h-2 bg-gray-100 rounded overflow-hidden w-48">
                      <div className="h-2 bg-blue-500" style={{ width: `${r.total? Math.round((r.success/r.total)*100):0}%` }} />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">성공 {r.success} / 실패 {r.failed}</div>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <Button variant="secondary">리스트보기</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">총 {filtered.length}건</div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>이전</Button>
            <div className="text-sm">{page} / {totalPages}</div>
            <Button variant="secondary" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}>다음</Button>
          </div>
        </div>
      </Card>
    </Container>
  )
}
