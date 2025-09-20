import React, { useEffect } from "react";
import { useRouter } from "next/router";
import LoginPage from "@/features/settings/integration-admin/login";

export default function LegacyLoginWrapper() {
  const router = useRouter();
  useEffect(() => {
    // Replace the URL in history so canonical /login is used
    router.replace("/login");
  }, [router]);
  return <LoginPage />;
}
