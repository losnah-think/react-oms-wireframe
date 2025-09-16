"use client";
import React from 'react'
import '../src/App.css'
import 'react-quill/dist/quill.snow.css'
import type { AppProps } from 'next/app'
import { GridStyles } from '../src/design-system/components'
import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from '../src/components/ui/Toast'
import UrlBanner from '../src/components/UrlBanner'

export default function App({ Component, pageProps }: AppProps) {
  // Keep pageProps intact so pages can read `pageProps.session` if they rely
  // on server-calculated session flags (some pages use `props.session`).
  return (
    <SessionProvider session={(pageProps as any).session}>
      <ToastProvider>
        <UrlBanner />
        <a href="#main-content" className="skip-link">Skip to content</a>
        <GridStyles />
        <main id="main-content">
          <Component {...pageProps} />
        </main>
      </ToastProvider>
    </SessionProvider>
  )
}
