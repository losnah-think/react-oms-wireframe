import React, { useEffect, useState } from 'react'

interface Props { value: string, size?: number }

const QRImage: React.FC<Props> = ({ value, size = 120 }) => {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const qrcode = await import('qrcode')
        if (cancelled) return
        const data = await (qrcode.toDataURL as any)(value, { width: size })
        if (!cancelled) setSrc(data)
      } catch (err) {
        // fallback: do nothing
        console.error('qrcode render failed', err)
      }
    })()
    return () => { cancelled = true }
  }, [value, size])

  if (!src) return <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">QR</div>
  return <img src={src} alt="qrcode" style={{ width: size, height: size }} />
}

export default QRImage
