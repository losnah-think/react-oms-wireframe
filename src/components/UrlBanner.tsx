"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function UrlBanner(){
  const router = useRouter()
  const [url, setUrl] = useState<string>('')

  useEffect(() => {
    const update = () => {
      try {
        const raw = router.asPath || window.location.pathname
        // remove query and hash
        const clean = raw.split('#')[0].split('?')[0]
        // remove trailing slash unless root
        const path = clean !== '/' ? clean.replace(/\/$/, '') : '/'
        setUrl(window.location.origin + path)
      } catch (e) {
        setUrl(window.location.href)
      }
    }
    // initial
    update()
    // update on client-side navigation
    router.events.on('routeChangeComplete', update)
    return () => {
      router.events.off('routeChangeComplete', update)
    }
  }, [router.events])

  // Render nothing on server / until client sets the URL to avoid hydration mismatch
  if (!url) return null

  return (
    <div style={{position:'fixed', right:12, bottom:12, zIndex:9999, background:'#111827', color:'#fff', padding:'6px 10px', borderRadius:6, fontSize:12, opacity:0.9}}>
      <strong>URL:</strong>&nbsp;<span style={{wordBreak:'break-all'}}>{url}</span>
    </div>
  )
}
