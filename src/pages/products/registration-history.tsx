"use client"
import React from 'react'
import { Container, Card, Button, Input } from '../../design-system'

const mockRows = Array.from({length: 12}).map((_,i)=>({
  seq: i+1,
  title: `카페24상품등록`,
  datetime: `2025-09-15 오전 8:3${(i%6).toString().padStart(2,'0')}`,
  count: i%4 === 0 ? 4 : 0,
}))

export default function RegistrationHistoryPage(){
  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">차수별 상품등록 내역</h1>
        <div className="flex gap-2">
          <Input type="date" />
          <Button>검색</Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-600">
                <th className="px-3 py-2">입력차수</th>
                <th className="px-3 py-2">입력처</th>
                <th className="px-3 py-2">건수</th>
                <th className="px-3 py-2">비고</th>
              </tr>
            </thead>
            <tbody>
              {mockRows.map(r => (
                <tr key={r.seq} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{r.seq} 차<br/><div className="text-xs text-gray-500">{r.datetime}</div></td>
                  <td className="px-3 py-2">{r.title}</td>
                  <td className="px-3 py-2">{r.count}</td>
                  <td className="px-3 py-2"><Button variant="secondary">리스트보기</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Container>
  )
}
