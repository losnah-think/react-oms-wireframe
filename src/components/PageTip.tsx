import React from 'react'

type PageTipProps = {
  text: string
}

export default function PageTip({ text }: PageTipProps) {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
      <div className="text-sm text-yellow-800">Tip: {text}</div>
    </div>
  )
}
