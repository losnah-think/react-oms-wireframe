import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';

import LoginPage from "@/features/auth/LoginPage";
import { Router } from "@/lib/Router";
import { NavigationService } from "@/lib/NavigationService";
import { PageRenderer } from "@/lib/PageRenderer";
import { AppController } from "@/lib/AppController";

export default function Home(props: any) {
  // If no session, render the login UI inline at '/'
  const sessionExists = !!props.session;
  // If mocks are enabled in production, show the app even without a session so the mock UI renders.
  const useMocksInProd = process.env.NEXT_PUBLIC_USE_MOCKS === "1";
  // Hide login inline unless explicitly enabled in production.
  // For local/dev use, prefer explicit opt-in via `NEXT_PUBLIC_HIDE_LOGIN=1`.
  const hideLogin = process.env.NEXT_PUBLIC_HIDE_LOGIN === "1";
  const initialPage = props.initialPage ?? "dashboard";

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const router = useRouter();

  const showLoginInline = !sessionExists && !hideLogin && !useMocksInProd;

  // Initialize OO architecture components (memoized)
  const appController = React.useMemo(() => AppController.getInstance(), []);
  const navigationService = React.useMemo(() => NavigationService.getInstance(), []);
  const pageRenderer = React.useMemo(() => PageRenderer.getInstance(), []);

  // Update currentPage when router.pathname changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { page, id } = Router.parsePathToPage(router.pathname);
      setCurrentPage(page);
      setSelectedProductId(id || "");
    }
  }, [router.pathname]);

  // One-time setup
  useEffect(() => {
    // Set up navigation service with router
    navigationService.setRouter(router);
    appController.setNavigationService(navigationService);

    // Set up route change listeners
    const onRouteChange = (url: string) => {
      const { page, id } = Router.parsePathToPage(new URL(url, window.location.origin).pathname);
      setCurrentPage(page);
      setSelectedProductId(id || "");
    };

    const onPopState = () => {
      const { page, id } = Router.parsePathToPage(window.location.pathname);
      setCurrentPage(page);
      setSelectedProductId(id || "");
    };

    router.events?.on?.("routeChangeComplete", onRouteChange);
    window.addEventListener("popstate", onPopState);

    return () => {
      router.events?.off?.("routeChangeComplete", onRouteChange);
      window.removeEventListener("popstate", onPopState);
    };
  }, []); // Empty array - only run once on mount

  const handleNavigate = (page: string, productId?: string) => {
    setCurrentPage(page);
    setSelectedProductId(productId || "");
    appController.navigateTo(page, productId);
  };

  const renderCurrentPage = () => {
    return pageRenderer.renderPage(currentPage, selectedProductId, handleNavigate);
  };

  return (
    <>
      {/* If login UI should be shown inline, render only the login page. Otherwise render Breadcrumbs + page. */}
      {showLoginInline ? (
        <LoginPage />
      ) : (
        <>
          {/* Breadcrumbs are rendered in the global Layout */}
          {renderCurrentPage()}
        </>
      )}
    </>
  );
}

export async function getServerSideProps(ctx: any) {
  const page = ctx.query?.page ?? null;

  if (process.env.NEXT_PUBLIC_DEV_NO_AUTH === "1") {
    return { props: { session: true, initialPage: page } };
  }

  try {
    const { getServerSession } = await import("next-auth/next");
    const { authOptions } = await import("./api/auth/[...nextauth]");
    const session = await (getServerSession as any)(ctx.req, ctx.res, authOptions as any);

    const useMocksInProd = process.env.NEXT_PUBLIC_USE_MOCKS === "1";
    const hideLogin = process.env.NEXT_PUBLIC_HIDE_LOGIN === "1";

    if (!session && !hideLogin && !useMocksInProd) {
      return { redirect: { destination: "/login", permanent: false } };
    }

    return { props: { session: !!session, initialPage: page } };
  } catch (e) {
    if (process.env.NODE_ENV === "test") {
      return { props: { session: false, initialPage: page } };
    }
    return { redirect: { destination: "/login", permanent: false } };
  }
}
