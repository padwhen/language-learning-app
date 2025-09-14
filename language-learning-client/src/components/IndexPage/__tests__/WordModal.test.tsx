/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Modal } from '../WordModal';
import { UserContext } from '../../../contexts/UserContext';
import { Word } from '../../../types';
import * as cookieUtils from '../../../utils/cookie';
import axios from 'axios';

// Mock Lottie to prevent canvas errors
vi.mock('lottie-react', () => ({
  default: () => <div data-testid="lottie-mock" />
}));

vi.mock('react-lottie', () => ({
  default: () => <div data-testid="lottie-mock" />
}));

// Mock dependencies
vi.mock('axios');
vi.mock('../../../utils/cookie');
vi.mock('../../../components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockedAxios = axios as any;
const mockCookieDismissed = cookieUtils.cookieDismissed as any;

const mockWord: Word = {
  id: '1',
  fi: 'matematiikan',
  en: 'of mathematics',
  en_base: 'mathematics',
  type: 'noun',
  original_word: 'matematiikka',
  pronunciation: 'ma-te-maa-tii-kka',
  comment: 'Genitive singular form',
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
  lastActiveDate: undefined,
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

const renderWithUserContext = (user: typeof mockUser | null = mockUser) => {
  return render(
    <UserContext.Provider value={{ user, setUser: vi.fn() }}>
      <Modal word={mockWord} />
    </UserContext.Provider>
  );
};

describe('WordModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieDismissed.mockReturnValue(false);
    
    // Mock axios responses
    mockedAxios.post.mockResolvedValue({ data: { _id: 'card123' } });
    mockedAxios.put.mockResolvedValue({ data: {} });
    mockedAxios.get.mockResolvedValue({ data: { deckName: 'Test Deck' } });
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => '{"words": []}'),
        setItem: vi.fn(),
      },
      writable: true,
    });
  });

  describe('Context Tip Gating Logic', () => {
    it('should show tip when words are different and conditions are met', () => {
      renderWithUserContext();
      
      fireEvent.click(screen.getByRole('button', { name: 'matematiikan' }));
      
      expect(screen.getByRole('note')).toBeInTheDocument();
      expect(screen.getByText(/You can choose to save the word in its base form/)).toBeInTheDocument();
    });

    it('should hide tip when words are the same', () => {
      const sameWord = { ...mockWord, fi: 'matematiikka', original_word: 'matematiikka' };
      
      render(
        <UserContext.Provider value={{ user: mockUser, setUser: vi.fn() }}>
          <Modal word={sameWord} />
        </UserContext.Provider>
      );
      
      fireEvent.click(screen.getAllByText('matematiikka')[0]);
      
      expect(screen.queryByRole('note')).not.toBeInTheDocument();
    });

    it('should hide tip when user preference is "base"', () => {
      const userWithBasePref = { ...mockUser, flashcardWordForm: 'base' as const };
      
      render(
        <UserContext.Provider value={{ user: userWithBasePref, setUser: vi.fn() }}>
          <Modal word={mockWord} />
        </UserContext.Provider>
      );
      
      fireEvent.click(screen.getByRole('button', { name: 'matematiikan' }));
      
      expect(screen.queryByRole('note')).not.toBeInTheDocument();
    });

    it('should hide tip when cookie is dismissed', () => {
      mockCookieDismissed.mockReturnValue(true);
      
      renderWithUserContext();
      fireEvent.click(screen.getByRole('button', { name: 'matematiikan' }));
      
      expect(screen.queryByRole('note')).not.toBeInTheDocument();
    });

    it('should show tip when user is not logged in but other conditions are met', () => {
      renderWithUserContext(null);
      fireEvent.click(screen.getByRole('button', { name: 'matematiikan' }));
      
      expect(screen.getByRole('note')).toBeInTheDocument();
    });
  });

  describe('Word Display', () => {
    it('should display word information correctly', () => {
      renderWithUserContext();
      fireEvent.click(screen.getByRole('button', { name: 'matematiikan' }));
      
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument(); // Title
      expect(screen.getByText('matematiikka - mathematics')).toBeInTheDocument(); // Base word
      expect(screen.getByText('ma-te-maa-tii-kka')).toBeInTheDocument(); // Pronunciation
      expect(screen.getByText('of mathematics')).toBeInTheDocument(); // Meaning
      expect(screen.getByText('Genitive singular form')).toBeInTheDocument(); // Explanation
    });

    it('should handle missing en_base gracefully', () => {
      const wordWithoutEnBase = { ...mockWord, en_base: undefined };
      
      render(
        <UserContext.Provider value={{ user: mockUser, setUser: vi.fn() }}>
          <Modal word={wordWithoutEnBase} />
        </UserContext.Provider>
      );
      
      fireEvent.click(screen.getByRole('button', { name: 'matematiikan' }));
      
      expect(screen.getAllByText('matematiikka')[0]).toBeInTheDocument(); // Should not show "- undefined"
    });

    it('should not show en_base when it equals en', () => {
      const wordWithSameEn = { ...mockWord, en_base: 'of mathematics' };
      
      render(
        <UserContext.Provider value={{ user: mockUser, setUser: vi.fn() }}>
          <Modal word={wordWithSameEn} />
        </UserContext.Provider>
      );
      
      fireEvent.click(screen.getByRole('button', { name: 'matematiikan' }));
      
      expect(screen.getAllByText('matematiikka')[0]).toBeInTheDocument(); // Should not show "- of mathematics"
    });
  });

  describe('Modal Interaction', () => {
    it('should open modal when word button is clicked', () => {
      renderWithUserContext();
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      
      fireEvent.click(screen.getByRole('button', { name: 'matematiikan' }));
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should close modal when close button is clicked', () => {
      renderWithUserContext();
      
      fireEvent.click(screen.getByRole('button', { name: 'matematiikan' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[0]);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('User Context Integration', () => {
    it('should handle logged out user', () => {
      renderWithUserContext(null);
      
      fireEvent.click(screen.getByRole('button', { name: 'matematiikan' }));
      
      // Modal should still open and show word details
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('matematiikka - mathematics')).toBeInTheDocument();
      
      // Tip should still show if conditions are met
      expect(screen.getByRole('note')).toBeInTheDocument();
    });

    it('should respect user flashcard preferences', () => {
      const userWithOriginalPref = { ...mockUser, flashcardWordForm: 'original' as const };
      
      render(
        <UserContext.Provider value={{ user: userWithOriginalPref, setUser: vi.fn() }}>
          <Modal word={mockWord} />
        </UserContext.Provider>
      );
      
      fireEvent.click(screen.getByRole('button', { name: 'matematiikan' }));
      
      // Tip should show because flashcardWordForm is 'original', not 'base'
      expect(screen.getByRole('note')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes applied', () => {
      renderWithUserContext();
      
      fireEvent.click(screen.getByRole('button', { name: 'matematiikan' }));
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('max-w-[95vw]', 'sm:max-w-[600px]', 'md:max-w-[700px]');
    });
  });
});
