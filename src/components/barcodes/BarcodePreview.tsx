import React, { useEffect, useRef } from 'react'
import { BarcodeTemplate } from './TemplateList'

interface Props {
  template?: BarcodeTemplate | null
}

const BarcodePreview: React.FC<Props> = ({ template }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!template) return
    // dynamic import bwip-js for client-side rendering
    let cancelled = false
    ;(async () => {
      try {
        const bwip = await import('bwip-js')
        if (cancelled) return
        if (!canvasRef.current) return

        const opts: any = {
          bcid: template.barcodeType || 'code128',
          text: template.value || '',
          scale: template.scale ?? 3,
          height: template.height ?? 10,
          includetext: template.includetext ?? true,
          textxalign: 'center'
        }

        // type-specific fixes
        if ((opts.bcid === 'ean13' || opts.bcid === 'upca') && opts.text) {
          // ensure numeric-only for those types
          opts.text = (opts.text || '').replace(/[^0-9]/g, '')
        }

        // @ts-ignore bwip to canvas
        bwip.toCanvas(canvasRef.current, opts)
      } catch (err) {
        console.error('bwip-js render error', err)
      }
    })()

    return () => { cancelled = true }
  }, [template])

  return (
    <div className="w-full h-full flex items-center justify-center bg-white border border-dashed border-gray-200">
      {template ? (
        <canvas ref={canvasRef} />
      ) : (
        <div className="text-sm text-gray-400">Select a template to preview</div>
      )}
    </div>
  )
}

export default BarcodePreview
