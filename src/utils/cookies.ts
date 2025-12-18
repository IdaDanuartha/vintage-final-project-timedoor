// src/utils/cookies.ts

/**
 * Set a cookie with expiration
 * @param name Cookie name
 * @param value Cookie value (will be encoded)
 * @param days Expiry in days
 */
export const setCookie = (name: string, value: string, days: number): void => {
  try {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    const encodedValue = encodeURIComponent(value);
    document.cookie = `${name}=${encodedValue};${expires};path=/;SameSite=Lax`;
  } catch (error) {
    console.error('Failed to set cookie:', error);
  }
};

/**
 * Get a cookie value by name
 * @param name Cookie name
 * @returns Cookie value or null if not found
 */
export const getCookie = (name: string): string | null => {
  try {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    
    for (const cookie of cookies) {
      if (!cookie) continue;
      
      const c = cookie.trim();
      
      if (c.indexOf(nameEQ) === 0) {
        const value = c.substring(nameEQ.length);
        return decodeURIComponent(value);
      }
    }
  } catch (error) {
    console.error('Failed to get cookie:', error);
  }
  
  return null;
};

/**
 * Delete a cookie by name
 * @param name Cookie name
 */
export const deleteCookie = (name: string): void => {
  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  } catch (error) {
    console.error('Failed to delete cookie:', error);
  }
};

/**
 * Check if a cookie exists
 * @param name Cookie name
 * @returns true if cookie exists
 */
export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null;
};

/**
 * Get all cookies as an object
 * @returns Object with cookie names as keys
 */
export const getAllCookies = (): Record<string, string> => {
  const cookies: Record<string, string> = {};
  
  try {
    const cookieArray = document.cookie.split(';');
    
    for (const cookie of cookieArray) {
      if (!cookie) continue;
      
      const [name, ...valueParts] = cookie.split('=');
      const value = valueParts.join('=');
      
      if (name && value) {
        cookies[name.trim()] = decodeURIComponent(value.trim());
      }
    }
  } catch (error) {
    console.error('Failed to get all cookies:', error);
  }
  
  return cookies;
};

/**
 * Clear all cookies (use with caution!)
 */
export const clearAllCookies = (): void => {
  try {
    const cookies = getAllCookies();
    for (const name in cookies) {
      deleteCookie(name);
    }
  } catch (error) {
    console.error('Failed to clear all cookies:', error);
  }
};

// Cookie names constants
export const COOKIE_NAMES = {
  CART: 'vintage_cart',
  AUTH: 'vintage_auth',
  PREFERENCES: 'vintage_preferences'
} as const;

// Cookie expiry constants (in days)
export const COOKIE_EXPIRY = {
  SESSION: 0,
  SHORT: 7,
  MEDIUM: 30,
  LONG: 365
} as const;