import React from 'react'
import dynamic from 'next/dynamic'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { 
  ssr: false,
  loading: () => <div className="p-4">Loading API documentation...</div>
})

const ApiDocsPage: React.FC = () => {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="p-4">
        <div className="mb-3 text-sm text-gray-600">
          API Docs (Mock) — API 문서(모의)
          <div className="text-xs text-gray-500">English &amp; 한국어</div>
        </div>
        <div className="text-center py-8">Loading API documentation...</div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-3 text-sm text-gray-600">
        API Docs (Mock) — API 문서(모의)
        <div className="text-xs text-gray-500">English &amp; 한국어</div>
      </div>
      {/* SwaggerUI has no types in this project; cast to any */}
      {React.createElement(SwaggerUI as any, { url: '/api/openapi.json' } as any)}
    </div>
  )
}

// Opt out of global app layout so the docs render as a full standalone page
(ApiDocsPage as any).disableLayout = true
;(ApiDocsPage as any).disableLayoutAllowed = true

export default ApiDocsPage
