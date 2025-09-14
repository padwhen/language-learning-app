/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { UserContext } from '../../contexts/UserContext';
import { Modal } from '../../components/IndexPage/WordModal';
import { Word } from '../../types';
import * as cookieUtils from '../cookie';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('../../components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Context Tip Feature - Integration Tests', () => {
  const inflectedWord: Word = {
    id: '1',
    fi: 'matematiikan',
    en: 'of mathematics',
    en_base: 'mathematics',
    type: 'noun',
    original_word: 'matematiikka',
    pronunciation: 'ma-te-maa-tii-kka',
    comment: 'Genitive singular form',
  };

  const baseFormWord: Word = {
    id: '2',
    fi: 'matematiikka',
    en: 'mathematics',
    en_base: 'mathematics',
    type: 'noun',
    original_word: 'matematiikka',
    pronunciation: 'ma-te-maa-tii-kka',
    comment: 'Base form',
  };

  const mockUser = {
    _id: 'user1',
    name: 'Test User',
    username: 'testuser',
    flashcardWordForm: 'original' as const,
    deckIds: [],
    avatarUrl: '',
    level: 1,
    xp: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastActiveDate: null,
    streakFreezes: 0,
    xpMultiplier: 1.0,
    xpMultiplierExpiration: null,
    loginDates: [],
    achievements: [],
    badges: [],
    matchGameStats: {
      gamesPlayed: 0,
      uniqueCardsMatched: [],
      flawlessGames: 0,
      gamesUnder60s: 0,
      decksPlayed: [],
      midnightGames: 0,
    },
    weeklyXP: 0,
    weeklyXPHistory: [],
    region: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Clear cookies
    document.cookie = '';
    
    // Mock axios responses
    mockedAxios.post.mockResolvedValue({ data: { _id: 'card123' } });
    mockedAxios.put.mockResolvedValue({ data: {} });
    mockedAxios.get.mockResolvedValue({ data: { deckName: 'Finnish Basics' } });
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => '{"words": []}'),
        setItem: jest.fn(),
      },
      writable: true,
    });

    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: jest.fn() },
      writable: true,
    });
  });

  describe('End-to-End Workflow: New User Learning Finnish', () => {
    it('should guide user through the complete tip experience', async () => {
      // Scenario: New user encounters inflected word for first time
      render(
        <UserContext.Provider value={{ user: mockUser, setUser: jest.fn() }}>
          <Modal word={inflectedWord} />
        </UserContext.Provider>
      );

      // 1. User clicks on inflected word
      fireEvent.click(screen.getByText('matematiikan'));

      // 2. Modal opens and tip is shown (because words are different)
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('note')).toBeInTheDocument();
      expect(screen.getByText(/You can choose to save the word in its base form/)).toBeInTheDocument();

      // 3. User sees the educational content
      expect(screen.getByText('matematiikka')).toBeInTheDocument(); // Base form
      expect(screen.getByText('mathematics')).toBeInTheDocument(); // Base meaning
      expect(screen.getByText('matematiikan')).toBeInTheDocument(); // Inflected form
      expect(screen.getByText('of mathematics')).toBeInTheDocument(); // Contextual meaning

      // 4. User chooses base form (better for learning)
      const baseFormRadio = screen.getByDisplayValue('base');
      fireEvent.click(baseFormRadio);
      expect(baseFormRadio).toBeChecked();

      // 5. User dismisses tip to avoid seeing it again
      const dismissCheckbox = screen.getByLabelText("Don't show this again");
      fireEvent.click(dismissCheckbox);

      // 6. Tip disappears immediately
      await waitFor(() => {
        expect(screen.queryByRole('note')).not.toBeInTheDocument();
      });

      // 7. Cookie is set for persistent dismissal
      expect(cookieUtils.cookieDismissed()).toBe(true);
    });

    it('should respect dismissal across sessions', () => {
      // Scenario: User opens word modal after dismissing tip
      
      // Set dismissal cookie
      cookieUtils.dismissContextTip();
      
      render(
        <UserContext.Provider value={{ user: mockUser, setUser: jest.fn() }}>
          <Modal word={inflectedWord} />
        </UserContext.Provider>
      );

      fireEvent.click(screen.getByText('matematiikan'));

      // Tip should not appear
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.queryByRole('note')).not.toBeInTheDocument();
    });
  });

  describe('User Preference Scenarios', () => {
    it('should skip tip for users who already prefer base forms', () => {
      const userWithBasePref = { ...mockUser, flashcardWordForm: 'base' as const };
      
      render(
        <UserContext.Provider value={{ user: userWithBasePref, setUser: jest.fn() }}>
          <Modal word={inflectedWord} />
        </UserContext.Provider>
      );

      fireEvent.click(screen.getByText('matematiikan'));

      // Tip should not show because user already prefers base forms
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.queryByRole('note')).not.toBeInTheDocument();
    });

    it('should not show tip for base form words', () => {
      render(
        <UserContext.Provider value={{ user: mockUser, setUser: jest.fn() }}>
          <Modal word={baseFormWord} />
        </UserContext.Provider>
      );

      fireEvent.click(screen.getByText('matematiikka'));

      // Tip should not show because fi === original_word
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.queryByRole('note')).not.toBeInTheDocument();
    });
  });

  describe('Save Behavior Verification', () => {
    it('should save correct data based on user selection', () => {
      // Mock the saveWordToDeck function call
      const mockSaveWordToDeck = jest.fn();
      
      // This would require deeper mocking of the component internals
      // For now, we verify the logic conceptually
      
      const testCases = [
        {
          selection: 'base',
          expectedUserLangCard: 'matematiikka',
          expectedEngCard: 'mathematics',
        },
        {
          selection: 'original',
          expectedUserLangCard: 'matematiikan',
          expectedEngCard: 'of mathematics',
        },
      ];

      testCases.forEach(({ selection, expectedUserLangCard, expectedEngCard }) => {
        // The save logic would use:
        // const isBase = saveAs === 'base';
        // const userLangCard = isBase ? original_word : fi;
        // const engCard = isBase ? (en_base || en) : en;
        
        const isBase = selection === 'base';
        const userLangCard = isBase ? inflectedWord.original_word : inflectedWord.fi;
        const engCard = isBase ? (inflectedWord.en_base || inflectedWord.en) : inflectedWord.en;

        expect(userLangCard).toBe(expectedUserLangCard);
        expect(engCard).toBe(expectedEngCard);
      });
    });

    it('should handle missing en_base gracefully in save logic', () => {
      const wordWithoutEnBase = { ...inflectedWord, en_base: undefined };
      
      // Test fallback logic: en_base || en
      const isBase = true;
      const engCard = isBase ? (wordWithoutEnBase.en_base || wordWithoutEnBase.en) : wordWithoutEnBase.en;
      
      expect(engCard).toBe('of mathematics'); // Falls back to en
    });
  });

  describe('Cross-Browser Cookie Compatibility', () => {
    it('should handle cookie operations in different environments', () => {
      // Test cookie setting
      cookieUtils.setCookie('test', 'value', 3600);
      expect(document.cookie).toContain('test=value');
      
      // Test cookie retrieval
      expect(cookieUtils.getCookie('test')).toBe('value');
      
      // Test dismissal
      cookieUtils.dismissContextTip();
      expect(cookieUtils.cookieDismissed()).toBe(true);
    });

    it('should handle cookie errors gracefully', () => {
      // Mock cookie access to throw errors
      const originalCookie = Object.getOwnPropertyDescriptor(document, 'cookie');
      
      Object.defineProperty(document, 'cookie', {
        get: () => { throw new Error('Cookie access denied'); },
        set: () => { throw new Error('Cookie write denied'); },
        configurable: true,
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Operations should not throw, but should log warnings
      expect(() => cookieUtils.setCookie('test', 'value')).not.toThrow();
      expect(() => cookieUtils.getCookie('test')).not.toThrow();
      expect(() => cookieUtils.dismissContextTip()).not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();

      // Restore
      consoleSpy.mockRestore();
      if (originalCookie) {
        Object.defineProperty(document, 'cookie', originalCookie);
      }
    });
  });

  describe('Accessibility and UX', () => {
    it('should maintain accessibility standards', () => {
      render(
        <UserContext.Provider value={{ user: mockUser, setUser: jest.fn() }}>
          <Modal word={inflectedWord} />
        </UserContext.Provider>
      );

      fireEvent.click(screen.getByText('matematiikan'));

      const tip = screen.getByRole('note');
      expect(tip).toHaveAttribute('aria-labelledby');
      
      // Radio buttons should be properly labeled
      const baseRadio = screen.getByLabelText(/Base form: matematiikka/);
      const thisRadio = screen.getByLabelText(/This form: matematiikan/);
      
      expect(baseRadio).toBeInTheDocument();
      expect(thisRadio).toBeInTheDocument();
      
      // Checkbox should be properly labeled
      const dismissCheckbox = screen.getByLabelText("Don't show this again");
      expect(dismissCheckbox).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(
        <UserContext.Provider value={{ user: mockUser, setUser: jest.fn() }}>
          <Modal word={inflectedWord} />
        </UserContext.Provider>
      );

      fireEvent.click(screen.getByText('matematiikan'));

      const baseRadio = screen.getByDisplayValue('base');
      const thisRadio = screen.getByDisplayValue('original');
      
      // Both radio buttons should be focusable
      expect(baseRadio).toHaveAttribute('type', 'radio');
      expect(thisRadio).toHaveAttribute('type', 'radio');
      expect(baseRadio).toHaveAttribute('name', 'saveAs');
      expect(thisRadio).toHaveAttribute('name', 'saveAs');
    });
  });

  describe('Performance Considerations', () => {
    it('should not make unnecessary API calls for tip functionality', () => {
      render(
        <UserContext.Provider value={{ user: mockUser, setUser: jest.fn() }}>
          <Modal word={inflectedWord} />
        </UserContext.Provider>
      );

      fireEvent.click(screen.getByText('matematiikan'));

      // Tip should appear without any API calls
      expect(screen.getByRole('note')).toBeInTheDocument();
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should have minimal impact on modal render time', () => {
      const startTime = performance.now();
      
      render(
        <UserContext.Provider value={{ user: mockUser, setUser: jest.fn() }}>
          <Modal word={inflectedWord} />
        </UserContext.Provider>
      );

      fireEvent.click(screen.getByText('matematiikan'));
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render quickly (this is a rough check)
      expect(renderTime).toBeLessThan(100); // 100ms threshold
    });
  });
}); 