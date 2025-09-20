import React, { useEffect } from "react";
import { useRouter } from "next/router";

export default function SettingsBarcodesRedirect() {
  const router = useRouter();
  useEffect(() => {
    if (router && typeof (router as any).replace === "function") {
      (router as any).replace("/settings/bc");
    } else if (router && typeof (router as any).push === "function") {
      (router as any).push("/settings/bc");
    } else {
      // fallback for test envs without a router mock
      if (typeof window !== "undefined") window.location.assign("/settings/bc");
    }
  }, [router]);
  return <div />;
}
