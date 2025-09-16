"use client"
import React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function UrlBanner(){
  const router = useRouter()
  const [url, setUrl] = useState<string>('')

  useEffect(() => {
    const update = () => {
      try {
        // Prefer the real browser pathname when Next's router.asPath contains
        // dynamic placeholders like '/[...slug]' or '/[id]'. Use window.location
        // as the authoritative source for the visible URL.
        const raw = (router.asPath && !/\[.+\]/.test(router.asPath)) ? router.asPath : window.location.pathname
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
    // also update when user navigates via browser back/forward
    window.addEventListener('popstate', update)
    return () => {
      router.events.off('routeChangeComplete', update)
      window.removeEventListener('popstate', update)
    }
  }, [router.events])

  // Component intentionally disabled — return null to remove URL overlay
  return null
}
