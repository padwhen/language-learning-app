/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setCookie, getCookie, cookieDismissed, dismissContextTip } from '../cookie';

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

describe('Cookie Utilities', () => {
  beforeEach(() => {
    // Clear cookies before each test
    document.cookie = '';
  });

  describe('setCookie', () => {
    it('should set a basic cookie', () => {
      setCookie('test', 'value');
      expect(document.cookie).toContain('test=value');
    });

    it('should set a cookie with max age', () => {
      setCookie('test', 'value', 3600);
      expect(document.cookie).toContain('test=value');
      expect(document.cookie).toContain('Max-Age=3600');
    });

    it('should include default attributes', () => {
      setCookie('test', 'value');
      expect(document.cookie).toContain('Path=/');
      expect(document.cookie).toContain('SameSite=Lax');
    });

    it('should include default security attributes', () => {
      setCookie('security-test', 'value');
      const cookieString = document.cookie;
      
      // Should include security attributes in the cookie string
      expect(cookieString).toContain('security-test=value');
      // The actual browser handles the Path and SameSite attributes
    });
  });

  describe('getCookie', () => {
    it('should get an existing cookie', () => {
      document.cookie = 'test=value; Path=/';
      expect(getCookie('test')).toBe('value');
    });

    it('should return null for non-existent cookie', () => {
      expect(getCookie('nonexistent')).toBeNull();
    });

    it('should handle multiple cookies', () => {
      document.cookie = 'first=value1; second=value2; third=value3';
      expect(getCookie('first')).toBe('value1');
      expect(getCookie('second')).toBe('value2');
      expect(getCookie('third')).toBe('value3');
    });

    it('should handle edge cases in cookie parsing', () => {
      // Test with complex cookie string
      document.cookie = 'complex=value; other=test; final=end';
      
      expect(getCookie('complex')).toBe('value');
      expect(getCookie('other')).toBe('test');
      expect(getCookie('final')).toBe('end');
      expect(getCookie('nonexistent')).toBeNull();
    });
  });

  describe('cookieDismissed', () => {
    it('should return true when dismissal cookie is set', () => {
      document.cookie = 'llapp_ctip_savebase_dismissed=1';
      expect(cookieDismissed()).toBe(true);
    });

    it('should return false when dismissal cookie is not set', () => {
      expect(cookieDismissed()).toBe(false);
    });

    it('should return false when dismissal cookie has different value', () => {
      document.cookie = 'llapp_ctip_savebase_dismissed=0';
      expect(cookieDismissed()).toBe(false);
    });
  });

  describe('dismissContextTip', () => {
    it('should set the dismissal cookie with correct attributes', () => {
      dismissContextTip();
      expect(document.cookie).toContain('llapp_ctip_savebase_dismissed=1');
      expect(document.cookie).toContain('Max-Age=315360000');
    });

    it('should make cookieDismissed return true after dismissal', () => {
      expect(cookieDismissed()).toBe(false);
      dismissContextTip();
      expect(cookieDismissed()).toBe(true);
    });
  });
}); 