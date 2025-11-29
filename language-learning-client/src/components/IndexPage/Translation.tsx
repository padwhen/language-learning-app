import { useTranslationHover } from '@/contexts/TranslationHoverContext';

export const Translation: React.FC<{text: string; highlighted?: boolean; translationKey?: number}> = ({ text, highlighted, translationKey = 0 }) => {
    const { hoveredText } = useTranslationHover();
    
    // Highlight the hovered text in the sentence
    const renderHighlightedText = () => {
        if (!hoveredText || !text) {
            return <em className="text-lg sm:text-xl md:text-2xl" data-testid="translation-result">{text}</em>;
        }
        
        // Normalize the hovered text - trim and handle punctuation
        const normalizedHovered = hoveredText.trim();
        if (!normalizedHovered) {
            return <em className="text-lg sm:text-xl md:text-2xl" data-testid="translation-result">{text}</em>;
        }
        
        // Escape special regex characters
        const escapedText = normalizedHovered.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Create regex that matches whole words/phrases only (not substrings within words)
        // Use word boundaries for single words, or match the phrase as a whole
        const isSingleWord = !normalizedHovered.includes(' ');
        const regexPattern = isSingleWord
            ? `\\b${escapedText}\\b`  // Word boundary for single words
            : escapedText.replace(/\s+/g, '\\s+');  // Phrase matching with flexible whitespace
        
        const regex = new RegExp(`(${regexPattern})`, 'gi');
        const parts = text.split(regex);
        
        return (
            <em className="text-lg sm:text-xl md:text-2xl" data-testid="translation-result">
                {parts.map((part, index) => {
                    // Check if this part matches the hovered text (case-insensitive)
                    // For single words, ensure it's a complete word match
                    if (isSingleWord) {
                        // Use word boundary check to ensure it's not part of another word
                        const wordBoundaryRegex = new RegExp(`\\b${escapedText}\\b`, 'i');
                        if (wordBoundaryRegex.test(part)) {
                            return (
                                <span 
                                    key={index} 
                                    className="bg-yellow-300 text-yellow-900 px-1 rounded transition-all duration-200 font-semibold"
                                >
                                    {part}
                                </span>
                            );
                        }
                    } else {
                        // For phrases, check if it matches (allowing for whitespace variations)
                        if (part.trim().toLowerCase() === normalizedHovered.toLowerCase()) {
                            return (
                                <span 
                                    key={index} 
                                    className="bg-yellow-300 text-yellow-900 px-1 rounded transition-all duration-200 font-semibold"
                                >
                                    {part}
                                </span>
                            );
                        }
                    }
                    return <span key={index}>{part}</span>;
                })}
            </em>
        );
    };
    
    return (
        <div 
            key={translationKey}
            className={`mt-8 w-full px-0 mx-auto transition-all duration-500 animate-fadeInUp ${highlighted ? 'ring-4 ring-blue-500 ring-opacity-75 bg-blue-50 rounded-lg p-6 shadow-lg' : ''}`}
        >
            <blockquote className="relative">
                <div className="relative z-10">
                    <p className="text-gray-800">
                        {renderHighlightedText()}
                    </p>
                </div>
            </blockquote>
        </div>
    )
}