// Lightweight i18n shim used to avoid pulling in a full i18n runtime.
// All translations fall back to returning the key.
import { useCallback } from "react";

export const t = (key: string, ...args: any[]) => {
  // If args provided and first arg is an object with values, simple interpolation could be implemented.
  return String(key);
};

export const useT = () => {
  return useCallback((k: string, ...a: any[]) => t(k, ...a), []);
};

export default useT;
