import { GrammarPattern, Word } from '@/types';

/**
 * Robust check for whether a pattern contains meaningful grammatical context
 * Handles empty-default patterns that should not show the grammar tab
 * Only shows grammar tab for words with substantial grammatical information
 * @param pattern - The grammar pattern to check
 * @returns true if the pattern has meaningful grammatical content, false otherwise
 */
export function hasGrammaticalContext(pattern: GrammarPattern | undefined | null): boolean {
  if (!pattern) return false;
  
  // REQUIRE morphology data as the ONLY indicator of meaningful grammar content
  // If morphology is empty, don't show grammar tab regardless of other content
  const hasMorphology = (pattern.morphology?.length ?? 0) > 0;
  
  return hasMorphology;
}

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use hasGrammaticalContext instead
 */
export const hasPatternData = (pattern?: GrammarPattern | null): boolean => {
  return hasGrammaticalContext(pattern);
};

/**
 * Checks if a word has themes (semantic domains)
 * @param word - The word to check
 * @returns true if the word has themes, false otherwise
 */
export const hasThemes = (word: Word): boolean => {
  return !!(word.themes && word.themes.length > 0);
};

/**
 * Checks if a word should show grammar highlighting in learning mode
 * Only highlights words with actual grammatical content, not just themes
 * @param word - The word to check
 * @param learningMode - Whether learning mode is enabled
 * @returns true if the word should be highlighted, false otherwise
 */
export const shouldHighlightWord = (word: Word, learningMode: boolean): boolean => {
  return learningMode && hasGrammaticalContext(word.pattern);
};

/**
 * Determines if the grammar tab should be shown in the word modal
 * Only shows tab when there's meaningful grammatical content (not just themes)
 * @param word - The word to check
 * @param learningMode - Whether learning mode is enabled
 * @returns true if grammar tab should be shown, false otherwise
 */
export const shouldShowGrammarTab = (word: Word, learningMode: boolean): boolean => {
  return learningMode && hasGrammaticalContext(word.pattern);
};

/**
 * Determines if inline grammar section should be shown in the normal tab
 * No longer used - we always show 2 tabs when grammar data exists
 * @param word - The word to check
 * @param learningMode - Whether learning mode is enabled
 * @returns false - inline grammar is no longer used
 */
export const shouldShowInlineGrammar = (word: Word, learningMode: boolean): boolean => {
  return false; // Always use tabs now, never inline
};
