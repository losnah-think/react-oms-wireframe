"use client";
import React from 'react'
import '../src/App.css'
import 'react-quill/dist/quill.snow.css'
import type { AppProps } from 'next/app'
import { GridStyles } from '../src/design-system/components'
import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from '../src/components/ui/Toast'
import UrlBanner from '../src/components/UrlBanner'
import Layout from '../src/components/layout/Layout'

export default function App({ Component, pageProps }: AppProps) {
  // Keep pageProps intact so pages can read `pageProps.session` if they rely
  // on server-calculated session flags (some pages use `props.session`).
  // HOTFIX: force layout rendering so Header and LNB are visible in production deployments.
  // If a page explicitly requires no layout, that can be re-enabled after root cause is found.
  const disableLayout = false

  return (
    <SessionProvider session={(pageProps as any).session}>
      <ToastProvider>
        <UrlBanner />
        <a href="#main-content" className="skip-link">Skip to content</a>
        <GridStyles />
        {disableLayout ? (
          <main id="main-content">
            <Component {...pageProps} />
          </main>
        ) : (
          <Layout>
            <main id="main-content">
              <Component {...pageProps} />
            </main>
          </Layout>
        )}
      </ToastProvider>
    </SessionProvider>
  )
}
