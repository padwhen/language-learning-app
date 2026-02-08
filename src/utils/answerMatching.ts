export type MatchResult = 'exact' | 'partial' | 'wrong';

/**
 * Normalize text for comparison:
 * - Trim whitespace
 * - Lowercase
 * - Strip parenthetical content: "hello (noun)" → "hello"
 */
function normalize(text: string): string {
    return text
        .replace(/\s*\([^)]*\)\s*/g, ' ')  // strip (anything in parens)
        .replace(/\s+/g, ' ')               // collapse multiple spaces
        .trim()
        .toLowerCase();
}

/**
 * Split an answer into its acceptable parts.
 * "abcdef, xyz" → ["abcdef", "xyz"]
 * "hello / world" → ["hello", "world"]
 */
function splitParts(text: string): string[] {
    return text
        .split(/[,\/]/)
        .map(part => normalize(part))
        .filter(part => part.length > 0);
}

/**
 * Compare user input against the correct answer.
 *
 * - 'exact': user typed the full normalized answer
 * - 'partial': user typed one acceptable part of a multi-part answer
 * - 'wrong': no match
 */
export function matchAnswer(userInput: string, correctAnswer: string): MatchResult {
    const normalizedInput = normalize(userInput);
    const normalizedFull = normalize(correctAnswer);

    // Exact match (after stripping parens, etc.)
    if (normalizedInput === normalizedFull) return 'exact';

    // Check if the answer has multiple parts
    const parts = splitParts(correctAnswer);

    if (parts.length > 1) {
        // User typed one of the acceptable parts
        if (parts.some(part => normalizedInput === part)) return 'partial';
    }

    // Also check: if user typed the full answer without parens content
    // but the parts split differently, still check individual parts
    if (parts.length === 1 && normalizedInput === parts[0]) return 'exact';

    return 'wrong';
}

/**
 * Check if a card's content is suitable for audio/listening questions.
 * Returns false for cards with:
 * - Parenthetical annotations like (3), (noun), (informal)
 * - Mostly numbers or special characters
 * - Very short content (single character)
 */
export function isSuitableForAudio(text: string): boolean {
    // Has parenthetical content
    if (/\([^)]*\)/.test(text)) return false;

    // Mostly numbers
    if (/^\d+$/.test(text.trim())) return false;

    // Has special characters that aren't part of natural language
    if (/[#@$%^&*+={}[\]|\\<>]/.test(text)) return false;

    // Too short (single char)
    if (text.trim().length <= 1) return false;

    return true;
}
