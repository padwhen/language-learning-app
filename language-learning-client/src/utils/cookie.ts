/**
 * Cookie utilities for context tip preferences
 */

export const setCookie = (name: string, value: string, maxAge?: number): void => {
  try {
    let cookieString = `${name}=${value}; Path=/; SameSite=Lax`;
    if (maxAge) {
      cookieString += `; Max-Age=${maxAge}`;
    }
    document.cookie = cookieString;
  } catch (error) {
    console.warn('Failed to set cookie:', error);
  }
};

export const getCookie = (name: string): string | null => {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
  } catch (error) {
    console.warn('Failed to get cookie:', error);
  }
  return null;
};

export const cookieDismissed = (): boolean => {
  return getCookie('llapp_ctip_savebase_dismissed') === '1';
};

export const dismissContextTip = (): void => {
  // Set cookie for ~10 years (315360000 seconds)
  setCookie('llapp_ctip_savebase_dismissed', '1', 315360000);
}; 