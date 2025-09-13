import React, { useEffect, useState } from 'react'

type Mapping = Record<string, string>

const STORAGE_KEY = 'mallCategoryMappings'

function readMappings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

function writeMappings(val: any) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}

let XLSX: any
try { XLSX = require('xlsx') } catch (e) { XLSX = null }

const MallCategoryMapping: React.FC<{
  mallId: string
  internalCategories?: string[]
  products?: Array<{ productId?: string; name?: string; mallProductName?: string; category?: string }>
  onClose: () => void
  onApply?: (m: Mapping) => void
}> = ({ mallId, internalCategories = [], products = [], onClose, onApply }) => {
  const [map, setMap] = useState<Mapping>({})
  const [internalFilter, setInternalFilter] = useState('')
  const [suggested, setSuggested] = useState<Mapping>({})

  useEffect(() => {
    const all = readMappings()
    setMap(all[mallId] || {})
  }, [mallId])

  const [platform, setPlatform] = useState<string>('custom')
  const [colInternal, setColInternal] = useState<string>('internalCategory')
  const [colMall, setColMall] = useState<string>('mallCategory')

  const platformPresets: Record<string, { internal: string; mall: string }> = {
    custom: { internal: 'internalCategory', mall: 'mallCategory' },
    naver: { internal: 'internalCategory', mall: 'mallCategory' },
    coupang: { internal: 'internal', mall: 'mall' },
    gmarket: { internal: '내부카테고리', mall: '쇼핑몰카테고리' },
  }

  useEffect(() => {
    const p = platformPresets[platform] || platformPresets['custom']
    setColInternal(p.internal)
    setColMall(p.mall)
  }, [platform])

  const handleSet = (internal: string, mallCat: string) => {
    setMap((s) => ({ ...s, [internal]: mallCat }))
  }

  const handleSave = () => {
    const all = readMappings()
    all[mallId] = map
    writeMappings(all)
    onApply && onApply(map)
    onClose()
  }

  const tokenize = (text: string) => {
    if (!text) return []
    return text
      .toLowerCase()
      .split(/[^a-z0-9가-힣]+/i)
      .filter((t) => t && t.length > 1 && !['및', '기타', '제품', '상품', '용'].includes(t))
  }

  const suggestFor = (internal: string) => {
    const docs: string[] = []
    products.forEach((p) => {
      if (p.mallProductName) docs.push(p.mallProductName)
    })
    if (docs.length === 0) return ''

    const allTokens = docs.map((d) => tokenize(d))
    const df: Record<string, number> = {}
    allTokens.forEach((tokens) => {
      const seen = new Set(tokens)
      seen.forEach((t) => (df[t] = (df[t] || 0) + 1))
    })

    const tfidfDocs = allTokens.map((tokens) => {
      const tf: Record<string, number> = {}
      tokens.forEach((t) => (tf[t] = (tf[t] || 0) + 1))
      const vec: Record<string, number> = {}
      Object.keys(tf).forEach((k) => {
        const tfv = tf[k]
        const idf = Math.log((1 + docs.length) / (1 + (df[k] || 0))) + 1
        vec[k] = tfv * idf
      })
      return vec
    })

    const qTokens = tokenize(internal)
    const qtf: Record<string, number> = {}
    qTokens.forEach((t) => (qtf[t] = (qtf[t] || 0) + 1))
    const qvec: Record<string, number> = {}
    Object.keys(qtf).forEach((k) => {
      const idf = Math.log((1 + docs.length) / (1 + (df[k] || 0))) + 1
      qvec[k] = qtf[k] * idf
    })

    const dot = (a: Record<string, number>, b: Record<string, number>) => {
      let s = 0
      Object.keys(a).forEach((k) => {
        if (b[k]) s += a[k] * b[k]
      })
      return s
    }
    const norm = (a: Record<string, number>) => Math.sqrt(Object.values(a).reduce((acc, v) => acc + v * v, 0))

    const scores = tfidfDocs.map((docVec) => {
      const sc = dot(docVec, qvec) / ((norm(docVec) || 1) * (norm(qvec) || 1))
      return sc
    })

    const bestIdx = scores.indexOf(Math.max(...scores))
    if (bestIdx < 0) return ''
    const bestTokens = Object.keys(tfidfDocs[bestIdx] || {}).sort((a, b) => (tfidfDocs[bestIdx][b] || 0) - (tfidfDocs[bestIdx][a] || 0))
    return bestTokens.slice(0, 2).join(' ')
  }

  const runSuggest = () => {
    const out: Mapping = {}
    internalCategories.forEach((c) => {
      const s = suggestFor(c)
      if (s) out[c] = s
    })
    setSuggested(out)
  }

  const applySuggested = () => {
    setMap((s) => ({ ...s, ...suggested }))
  }

  const handleUploadFile = (f: File | null) => {
    if (!f) return
    if (!XLSX) return alert('xlsx 라이브러리가 설치되어 있지 않습니다. npm install xlsx 필요')
    const reader = new FileReader()
    reader.onload = (ev: any) => {
      try {
        const arrayBuffer = ev.target.result as ArrayBuffer
        const data = new Uint8Array(arrayBuffer)
        const arr = [] as any[]
        for (let i = 0; i < data.length; ++i) arr[i] = String.fromCharCode(data[i])
        const bstr = arr.join('')
        const wb = XLSX.read(bstr, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json: any[] = XLSX.utils.sheet_to_json(ws)
        const imported: Mapping = {}
        json.forEach((row: any) => {
          const internal = row[colInternal] || row['internalCategory'] || row['internal'] || row['내부카테고리']
          const mall = row[colMall] || row['mallCategory'] || row['mall'] || row['쇼핑몰카테고리']
          if (internal && mall) imported[String(internal)] = String(mall)
        })
        setMap((s) => ({ ...s, ...imported }))
        alert('업로드 완료: ' + Object.keys(imported).length + '개 항목 적용')
      } catch (err) {
        console.error(err)
        alert('파일을 읽는 중 오류가 발생했습니다.')
      }
    }
    reader.readAsArrayBuffer(f)
  }

  const items = internalCategories.filter((c) => c.toLowerCase().includes(internalFilter.toLowerCase()))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-3xl bg-white rounded shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{mallId} - 카테고리 매핑</h3>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1 border rounded">취소</button>
            <button onClick={handleSave} className="px-3 py-1 bg-blue-600 text-white rounded">저장</button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <input value={internalFilter} onChange={(e) => setInternalFilter(e.target.value)} placeholder="내부 카테고리 필터" className="px-2 py-1 border flex-1" />
          <button onClick={runSuggest} className="px-3 py-1 border rounded text-sm">추천 생성</button>
          <button onClick={applySuggested} className="px-3 py-1 bg-green-600 text-white rounded text-sm">추천 적용</button>
          <label className="px-3 py-1 border rounded text-sm inline-block">
            플랫폼
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="ml-2 px-2 py-1 border">
              <option value="custom">Custom</option>
              <option value="naver">Naver</option>
              <option value="coupang">Coupang</option>
              <option value="gmarket">Gmarket</option>
            </select>
          </label>
          <div className="flex items-center gap-2">
            <div className="text-xs">내부 컬럼</div>
            <input value={colInternal} onChange={(e) => setColInternal(e.target.value)} className="px-2 py-1 border" />
            <div className="text-xs">쇼핑몰 컬럼</div>
            <input value={colMall} onChange={(e) => setColMall(e.target.value)} className="px-2 py-1 border" />
            <label className="px-3 py-1 border rounded text-sm cursor-pointer inline-block">
              업로드
              <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => handleUploadFile(e.target.files?.[0] ?? null)} className="hidden" />
            </label>
          </div>
        </div>

        <div className="space-y-3 max-h-64 overflow-auto">
          {Object.keys(suggested).length > 0 && (
            <div className="p-2 mb-2 border rounded bg-yellow-50">
              <div className="text-sm font-medium">추천 결과</div>
              {Object.entries(suggested).map(([k, v]) => (
                <div key={k} className="text-xs text-gray-700">{k} → {v}</div>
              ))}
            </div>
          )}
          {items.length === 0 && <div className="text-sm text-gray-500">내부 카테고리가 없습니다.</div>}
          {items.map((c) => (
            <div key={c} className="p-2 border rounded flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{c}</div>
                <div className="text-xs text-gray-500">매핑: {map[c] || '미지정'}</div>
              </div>
              <input placeholder="쇼핑몰 카테고리 입력" value={map[c] || ''} onChange={(e) => handleSet(c, e.target.value)} className="px-2 py-1 border" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MallCategoryMapping
