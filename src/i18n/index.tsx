import React from "react";

// Minimal fallback i18n hook used during partial migration.
// Returns a t() function that echoes keys when no real translations are available.

export function useT() {
  const t = React.useCallback((key: string, ...args: any[]) => {
    // very naive: if key looks like msg_xxxx, return a placeholder mapping,
    // otherwise return key itself. This prevents build-time crashes and keeps
    // runtime output readable until a full i18n system is restored.
    if (!key) return "";
    return String(key);
  }, []);
  return t;
}
