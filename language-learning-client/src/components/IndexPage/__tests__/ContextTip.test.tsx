/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { ContextTip } from '../ContextTip';
import * as cookieUtils from '../../../utils/cookie';

// Mock the cookie utilities
vi.mock('../../../utils/cookie', () => ({
  dismissContextTip: vi.fn(),
}));

const mockDismissContextTip = cookieUtils.dismissContextTip as ReturnType<typeof vi.fn>;

describe('ContextTip Component', () => {
  const defaultProps = {
    surfaceForm: 'matematiikan',
    lemma: 'matematiikka',
    en: 'of mathematics',
    en_base: 'mathematics',
    defaultSaveAs: 'original' as const,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the tip with correct content', () => {
      render(<ContextTip {...defaultProps} />);
      
      expect(screen.getByRole('note')).toBeInTheDocument();
      expect(screen.getByText(/You can choose to save the word in its base form/)).toBeInTheDocument();
      expect(screen.getAllByText('matematiikka')).toHaveLength(2); // In text and radio label
      expect(screen.getByText(/\(mathematics\)/)).toBeInTheDocument(); // In parentheses
      expect(screen.getAllByText('matematiikan')).toHaveLength(2); // In text and radio label
      expect(screen.getByText(/\(of mathematics\)/)).toBeInTheDocument(); // In parentheses
    });

    it('should render radio buttons with correct labels', () => {
      render(<ContextTip {...defaultProps} />);
      
      expect(screen.getByLabelText(/Base form: matematiikka/)).toBeInTheDocument();
      expect(screen.getByLabelText(/This form: matematiikan/)).toBeInTheDocument();
    });

    it('should render dismiss checkbox', () => {
      render(<ContextTip {...defaultProps} />);
      
      expect(screen.getByLabelText("Don't show this again")).toBeInTheDocument();
    });

    it('should have correct accessibility attributes', () => {
      render(<ContextTip {...defaultProps} />);
      
      const tipContainer = screen.getByRole('note');
      expect(tipContainer).toHaveAttribute('aria-labelledby', 'context-tip-title');
    });
  });

  describe('Default Selection', () => {
    it('should select "original" option by default when defaultSaveAs is "original"', () => {
      render(<ContextTip {...defaultProps} defaultSaveAs="original" />);
      
      const originalRadio = screen.getByDisplayValue('original');
      const baseRadio = screen.getByDisplayValue('base');
      
      expect(originalRadio).toBeChecked();
      expect(baseRadio).not.toBeChecked();
    });

    it('should select "base" option by default when defaultSaveAs is "base"', () => {
      render(<ContextTip {...defaultProps} defaultSaveAs="base" />);
      
      const originalRadio = screen.getByDisplayValue('original');
      const baseRadio = screen.getByDisplayValue('base');
      
      expect(baseRadio).toBeChecked();
      expect(originalRadio).not.toBeChecked();
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when radio selection changes', () => {
      const mockOnChange = vi.fn();
      render(<ContextTip {...defaultProps} onChange={mockOnChange} />);
      
      const baseRadio = screen.getByDisplayValue('base');
      fireEvent.click(baseRadio);
      
      expect(mockOnChange).toHaveBeenCalledWith('base');
    });

    it('should update selection when different radio is clicked', () => {
      const mockOnChange = vi.fn();
      render(<ContextTip {...defaultProps} onChange={mockOnChange} defaultSaveAs="original" />);
      
      // Initially original should be selected
      expect(screen.getByDisplayValue('original')).toBeChecked();
      
      // Click base radio
      const baseRadio = screen.getByDisplayValue('base');
      fireEvent.click(baseRadio);
      
      expect(mockOnChange).toHaveBeenCalledWith('base');
      expect(baseRadio).toBeChecked();
      expect(screen.getByDisplayValue('original')).not.toBeChecked();
    });

    it('should call dismissContextTip when dismiss checkbox is checked', async () => {
      render(<ContextTip {...defaultProps} />);
      
      const dismissCheckbox = screen.getByLabelText("Don't show this again");
      fireEvent.click(dismissCheckbox);
      
      expect(mockDismissContextTip).toHaveBeenCalled();
    });

    it('should hide tip after dismiss checkbox is checked', async () => {
      render(<ContextTip {...defaultProps} />);
      
      const tipContainer = screen.getByRole('note');
      expect(tipContainer).toBeInTheDocument();
      
      const dismissCheckbox = screen.getByLabelText("Don't show this again");
      fireEvent.click(dismissCheckbox);
      
      await waitFor(() => {
        expect(tipContainer).not.toBeInTheDocument();
      });
    });

    it('should not call dismissContextTip when dismiss checkbox is unchecked', () => {
      render(<ContextTip {...defaultProps} />);
      
      const dismissCheckbox = screen.getByLabelText("Don't show this again");
      
      // Check and then uncheck
      fireEvent.click(dismissCheckbox);
      fireEvent.click(dismissCheckbox);
      
      // Should only be called once (when checked)
      expect(mockDismissContextTip).toHaveBeenCalledTimes(1);
    });
  });

  describe('Content Variations', () => {
    it('should handle different word forms correctly', () => {
      const props = {
        ...defaultProps,
        surfaceForm: 'lukijoiden',
        lemma: 'lukija',
        en: 'readers\'',
        en_base: 'reader',
      };
      
      render(<ContextTip {...props} />);
      
      expect(screen.getAllByText('lukija')).toHaveLength(2); // In text and radio label
      expect(screen.getByText(/\(reader\)/)).toBeInTheDocument(); // In parentheses
      expect(screen.getAllByText('lukijoiden')).toHaveLength(2); // In text and radio label
      expect(screen.getByText(/\(readers'\)/)).toBeInTheDocument(); // In parentheses
    });

    it('should handle special characters in word forms', () => {
      const props = {
        ...defaultProps,
        surfaceForm: 'ääntä',
        lemma: 'ääni',
        en: 'sound (partitive)',
        en_base: 'sound',
      };
      
      render(<ContextTip {...props} />);
      
      expect(screen.getAllByText('ääni')).toHaveLength(2); // In text and radio label
      expect(screen.getAllByText('ääntä')).toHaveLength(2); // In text and radio label
    });
  });

  describe('State Management', () => {
    it('should maintain internal state correctly', () => {
      const mockOnChange = vi.fn();
      render(<ContextTip {...defaultProps} onChange={mockOnChange} defaultSaveAs="original" />);
      
      // Switch to base
      fireEvent.click(screen.getByDisplayValue('base'));
      expect(mockOnChange).toHaveBeenCalledWith('base');
      
      // Switch back to original
      fireEvent.click(screen.getByDisplayValue('original'));
      expect(mockOnChange).toHaveBeenCalledWith('original');
      
      expect(mockOnChange).toHaveBeenCalledTimes(2);
    });

    it('should handle visibility state correctly', async () => {
      render(<ContextTip {...defaultProps} />);
      
      const tipContainer = screen.getByRole('note');
      expect(tipContainer).toBeVisible();
      
      // Dismiss the tip
      const dismissCheckbox = screen.getByLabelText("Don't show this again");
      fireEvent.click(dismissCheckbox);
      
      await waitFor(() => {
        expect(screen.queryByRole('note')).not.toBeInTheDocument();
      });
    });
  });
}); 