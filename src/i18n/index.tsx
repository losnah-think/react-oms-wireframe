// stub: i18n removed. If any code still imports useT, this stub will
// throw at runtime to make the remaining import visible during testing.
export function useT() {
  return function t(key: string) {
    if (typeof key === 'string' && key.startsWith('msg_')) {
      // indicate missing mapping
      throw new Error(`i18n token used at runtime: ${key}`);
    }
    return String(key || '');
  };
}
