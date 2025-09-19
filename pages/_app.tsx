"use client";
import React from "react";
import "../src/App.css";
import "react-quill/dist/quill.snow.css";
import type { AppProps } from "next/app";
import { GridStyles } from "../src/design-system/components";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "../src/components/ui/Toast";
import UrlBanner from "../src/components/UrlBanner";
import Layout from "../src/components/layout/Layout";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  // Keep pageProps intact so pages can read `pageProps.session` if they rely
  // on server-calculated session flags (some pages use `props.session`).
  // Compute whether the page opts out of the global layout.
  // Only disable layout when the page explicitly sets `disableLayout = true`.
  // In production, also require `disableLayoutAllowed = true` on the component to permit layout opt-out.
  const comp: any = Component as any;
  const pageRequestedNoLayout = comp && comp.disableLayout === true;
  const disableLayoutAllowed =
    process.env.NODE_ENV !== "production" ||
    (comp && comp.disableLayoutAllowed === true);
  const disableLayout = pageRequestedNoLayout && disableLayoutAllowed;

  return (
    <SessionProvider session={(pageProps as any).session}>
      <ToastProvider>
        <UrlBanner />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <GridStyles />
        {/* Tip banner removed per user request */}
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
  );
}

// Tip functionality removed
