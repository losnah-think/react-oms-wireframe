"use client"
import { useRouter } from 'next/router'

export default function UrlBanner(){
  const router = useRouter()
  const url = typeof window !== 'undefined' ? window.location.href : router.asPath
  return (
    <div style={{position:'fixed', right:12, bottom:12, zIndex:9999, background:'#111827', color:'#fff', padding:'6px 10px', borderRadius:6, fontSize:12, opacity:0.9}}>
      <strong>URL:</strong>&nbsp;<span style={{wordBreak:'break-all'}}>{url}</span>
    </div>
  )
}
