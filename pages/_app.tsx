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
import PageTip from "../src/components/PageTip";
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
        {/* Per-page tip banner: Component.pageTip overrides routeTips mapping */}
        <RouteTip PageComponent={Component as any} />
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

type PageComponentType = React.ComponentType & {
  pageTip?: string;
  pageTipId?: string;
};

function RouteTip({ PageComponent }: { PageComponent?: PageComponentType }) {
  const router = useRouter();
  const route = router.pathname || "";
  const routeTips: Record<string, { text: string; id?: string }> = {
    "/": { text: "환영합니다 — 왼쪽 메뉴로 모듈을 빠르게 이동하세요." },
    "/barcodes/product": {
      text: "바코드 페이지: 여러 행 선택 후 CSV로 내보내기하세요.",
    },
    "/products": { text: "상품목록: 내보내기 전에 필터로 결과를 좁히세요." },
    "/settings": { text: "설정: 전체 계정에 영향을 줍니다. 주의하세요." },
  };

  // per-component override
  const compTip = PageComponent && (PageComponent.pageTip || "");
  const compTipId = PageComponent && (PageComponent.pageTipId || "");
  if (compTip) {
    return (
      <div className="px-6">
        <PageTip text={compTip} id={compTipId || route} />
      </div>
    );
  }

  // pick exact path or fall back to prefix match
  const exact = routeTips[route];
  const prefix = Object.keys(routeTips).find(
    (k) => k !== route && route.startsWith(k),
  );
  const match = exact || (prefix ? routeTips[prefix] : undefined);
  if (!match) return null;
  return (
    <div className="px-6">
      <PageTip text={match.text} id={match.id || route} />
    </div>
  );
}
