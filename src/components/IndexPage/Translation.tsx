import { useTranslationHover } from '@/contexts/TranslationHoverContext';
import { Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';

export const Translation: React.FC<{text: string; highlighted?: boolean; translationKey?: number; onClear?: () => void}> = ({ text, highlighted, translationKey = 0, onClear }) => {
    const { hoveredText } = useTranslationHover();
    const [copied, setCopied] = useState(false);
    
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
                                    className="bg-yellow-300 text-yellow-900 rounded transition-all duration-200"
                                    style={{ boxShadow: '0 0 0 2px rgba(253, 224, 71, 0.5)' }}
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
                                    className="bg-yellow-300 text-yellow-900 rounded transition-all duration-200"
                                    style={{ boxShadow: '0 0 0 2px rgba(253, 224, 71, 0.5)' }}
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

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <div 
            key={translationKey}
            className={`relative w-full bg-blue-50 border border-gray-200 rounded-lg p-6 transition-all duration-500 ${highlighted ? 'ring-4 ring-blue-500 ring-opacity-75 shadow-lg' : ''}`}
        >
            {/* Icons in top right */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                    onClick={onClear}
                    disabled={!onClear}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Clear"
                >
                    <Trash2 className="w-5 h-5 text-gray-600" />
                </button>
                <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Copy"
                >
                    <Copy className="w-5 h-5 text-gray-600" />
                </button>
            </div>
            {copied && (
                <div className="absolute top-12 right-4 bg-green-500 text-white px-3 py-1 rounded text-sm">
                    Copied!
                </div>
            )}
            <div className="pr-20">
                <p className="text-gray-800 text-lg whitespace-pre-wrap">
                    {renderHighlightedText()}
                </p>
            </div>
        </div>
    )
}