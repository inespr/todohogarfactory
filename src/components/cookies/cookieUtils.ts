export type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_KEY = 'cookie-preferences';

export const getCookiePreferences = (): CookiePreferences | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(COOKIE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const saveCookiePreferences = (prefs: CookiePreferences) => {
  localStorage.setItem(COOKIE_KEY, JSON.stringify(prefs));
};

export const hasConsent = () => {
  return !!getCookiePreferences();
};