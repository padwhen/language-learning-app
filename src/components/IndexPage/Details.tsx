import { Word } from "@/types"
import React, { useEffect, useState, useMemo, useContext } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, Sparkles } from "lucide-react";
import { useTranslationHover } from "@/contexts/TranslationHoverContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "../ui/dialog";
import { Button } from "../ui/button";
import { UserContext } from "@/contexts/UserContext";
import { DisplayCurrentDecks } from "./DisplayCurrentDecks";
import { LoginPage } from "../UsersComponents/LoginPage";
import { useToast } from "../ui/use-toast";
import { ContextTip } from "./ContextTip";
import { cookieDismissed } from "@/utils/cookie";
import axios from "axios";

interface WordCategoryProps {
    title: string;
    words: Word[];
    index?: number;
    isMockData?: boolean;
    isStreaming?: boolean;
    translationKey?: number; // Key that changes only on new translations
    onWordRemoved?: () => void;
    isWordSaved?: (word: Word) => boolean;
    getWordDecks?: (word: Word) => string[];
}

// Helper function to check if a string is only punctuation
const isPunctuationOnly = (str: string): boolean => {
    // Remove whitespace and check if remaining is only punctuation
    const trimmed = str.trim();
    if (!trimmed) return true;
    // Check if string contains only punctuation characters
    return /^[^\w\s]+$/.test(trimmed);
};

// Helper function to deduplicate words based on Finnish word (fi) and filter out punctuation
const deduplicateWords = (words: Word[]): Word[] => {
    if (!words || !Array.isArray(words)) return [];
    
    const seen = new Map<string, Word>();
    const seenIds = new Set<string>();
    
    words.forEach(word => {
        if (!word) return;
        
        const key = word.fi?.toLowerCase().trim() || '';
        // Skip if empty, punctuation only, or already seen
        if (key && !isPunctuationOnly(key)) {
            // If we haven't seen this word before, add it
            if (!seen.has(key)) {
                // Use existing ID if available, otherwise generate one
                let uniqueId = word.id || `${word.fi}-${word.en}`;
                
                // If ID already exists, generate a new one
                if (seenIds.has(uniqueId)) {
                    let counter = 0;
                    do {
                        uniqueId = `${word.fi}-${word.en}-${counter}`;
                        counter++;
                    } while (seenIds.has(uniqueId));
                }
                
                seenIds.add(uniqueId);
                seen.set(key, { ...word, id: uniqueId });
            }
        }
    });
    return Array.from(seen.values());
};

// Word pill component with clickable dialog for word details and save functionality
const WordPill: React.FC<{ word: Word; wordIndex: number; onWordRemoved?: () => void; isSaved?: boolean; savedDeckNames?: string[] }> = ({ word, wordIndex, onWordRemoved, isSaved, savedDeckNames }) => {
    const { setHoveredText } = useTranslationHover();
    const { user } = useContext(UserContext);
    const { toast } = useToast();
    const { fi, en, en_base, pronunciation, original_word, comment } = word;
    const [showDeckSelection, setShowDeckSelection] = useState(false);
    const [isCreatingNewDeck, setIsCreatingNewDeck] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState<{ deckName: string; word: string; translation: string } | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    
    // Context tip state
    const defaultSaveAs = (user?.flashcardWordForm as 'original' | 'base') === 'base' ? 'base' : 'original';
    const [saveAs, setSaveAs] = useState<'original' | 'base'>(defaultSaveAs);
    
    // Compute if tip should show
    const shouldShowTip = 
        original_word?.trim().toLowerCase() !== fi?.trim().toLowerCase() &&
        (user?.flashcardWordForm as 'original' | 'base') !== 'base' &&
        !cookieDismissed();

    const fetchDeckName = async (deckId: string): Promise<string> => {
        try {
            const response = await axios.get(`/decks/${deckId}`)
            return response.data.deckName;
        } catch (error) {
            console.error('Error fetching deck name: ', error)
            return ''
        }
    }

    const saveWordToDeck = async (deckId: string) => {
        try {
            // Determine what to save based on user choice
            const isBase = saveAs === 'base';
            const userLangCard = isBase ? original_word : fi;
            const engCard = isBase ? (en_base || en) : en;

            const wordResponse = await axios.post('/cards', { engCard, userLangCard });
            const newCard = { 
                _id: wordResponse.data._id,
                engCard,
                userLangCard,
                cardScore: 0,
                favorite: false
            };
            await axios.put(`/decks/${deckId}/add-card`, newCard);
            
            const deckName = await fetchDeckName(deckId);
            
            // Remove word from localStorage
            const localStorageKey = "response";
            const storedResponse = localStorage.getItem(localStorageKey);
            if (storedResponse) {
                const response = JSON.parse(storedResponse);
                if (response.words) {
                    // Remove the word by matching original_word (to handle both base and surface forms)
                    const updatedWords = response.words.filter((w: Word) => 
                        w.original_word !== original_word && w.fi !== fi
                    );
                    localStorage.setItem(localStorageKey, JSON.stringify({ ...response, words: updatedWords }));
                    
                    // Trigger UI update by calling the callback
                    if (onWordRemoved) {
                        onWordRemoved();
                    }
                }
            }
            
            // Show success state
            setSaveSuccess({
                deckName,
                word: userLangCard,
                translation: engCard
            });
            setShowDeckSelection(false);
            
            // Show toast notification
            toast({
                title: `${userLangCard} just added!`,
                description: `Added to deck ${deckName}: ${userLangCard} - Translated as ${engCard}`
            });
            
            // Auto-close dialog after 2.5 seconds
            setTimeout(() => {
                setSaveSuccess(null);
                setDialogOpen(false);
            }, 2500);
        } catch (error) {
            console.error('Error saving word: ', error);
            toast({
                title: "Error",
                description: "Failed to save word to deck. Please try again.",
                variant: "destructive"
            });
        }
    };
    
    return (
        <div
            className="relative animate-fadeInUp inline-block"
            style={{
                animationDelay: `${wordIndex * 0.05}s`,
                animationFillMode: 'both',
                animationDuration: '0.4s'
            }}
        >
            <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) {
                    // Reset states when dialog closes
                    setSaveSuccess(null);
                    setShowDeckSelection(false);
                    setIsCreatingNewDeck(false);
                }
            }}>
                <DialogTrigger asChild>
                    <button
                        className={`py-1.5 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-full border border-transparent bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer ${isSaved ? 'opacity-50' : ''}`}
                        onMouseEnter={() => {
                            // Highlight the corresponding text in the sentence when hovering
                            if (word.sentenceText) {
                                setHoveredText(word.sentenceText);
                            }
                        }}
                        onMouseLeave={() => {
                            setHoveredText(null);
                        }}
                    >
                        {fi}
                    </button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] w-full max-w-6xl max-h-[90vh] overflow-hidden p-0 flex flex-col bg-white">
                    <DialogHeader className="px-8 pt-6 pb-5 border-b border-gray-200">
                        <DialogTitle className="text-2xl font-bold text-gray-900">{fi}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        {/* Left side - Word Details */}
                        <div className={`${showDeckSelection && !saveSuccess ? 'md:w-1/2' : 'w-full'} p-8 overflow-y-auto transition-all duration-300 flex items-start`}>
                            {saveSuccess ? (
                                <div className="w-full flex flex-col items-center justify-center py-12 space-y-6 animate-in fade-in-0 zoom-in-95 duration-300">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="h-24 w-24 text-yellow-400 animate-pulse opacity-50" />
                                        </div>
                                        <CheckCircle2 className="h-20 w-20 text-green-500 relative z-10" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-bold text-gray-900">Successfully Added!</h3>
                                        <p className="text-lg text-gray-700">
                                            <span className="font-semibold text-blue-600">{saveSuccess.word}</span> has been added to
                                        </p>
                                        <p className="text-xl font-semibold text-green-600">{saveSuccess.deckName}</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {saveSuccess.word} - {saveSuccess.translation}
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={() => {
                                            setSaveSuccess(null);
                                            setDialogOpen(false);
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Close
                                    </Button>
                                </div>
                            ) : (
                            <div className="space-y-6 w-full">
                                <div className="flex flex-col gap-2">
                                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Base word</h4>
                                    <p className="text-base text-gray-900">{original_word} {(en_base && en_base !== en) ? `- ${en_base}` : ''}</p>
                                </div>
                                {pronunciation && (
                                    <div className="flex flex-col gap-2">
                                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Pronunciation</h4>
                                        <p className="text-base text-gray-900">{pronunciation}</p>
                                    </div>
                                )}
                                <div className="flex flex-col gap-2">
                                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Meaning</h4>
                                    <p className="text-base text-gray-900">{en}</p>
                                </div>
                                {comment && (
                                    <div className="flex flex-col gap-2">
                                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Explanation</h4>
                                        <p className="text-sm text-gray-700 break-words">{comment}</p>
                                    </div>
                                )}

                                {/* Duplicate word notice */}
                                {isSaved && (
                                    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex gap-3">
                                        <div className="mt-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-amber-400 text-white text-xs font-bold">
                                            !
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {savedDeckNames && savedDeckNames.length > 0
                                                    ? savedDeckNames.length === 1
                                                        ? `This term is already saved in this deck: ${savedDeckNames[0]}.`
                                                        : `This term is already saved in these decks: ${savedDeckNames.join(", ")}.`
                                                    : "This term is already saved in one of your decks."}
                                            </p>
                                            <p className="text-xs text-amber-800 mt-1">
                                                You can still add it to another deck, but it may appear multiple times.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Context Tip */}
                                {shouldShowTip && (
                                    <ContextTip
                                        surfaceForm={fi}
                                        en={en}
                                        en_base={en_base!}
                                        lemma={original_word}
                                        defaultSaveAs={defaultSaveAs}
                                        onChange={setSaveAs}
                                    />
                                )}
                                
                                {/* Add to deck button */}
                                {!showDeckSelection && (
                                    <div className="pt-2">
                                        {user ? (
                                            <Button 
                                                onClick={() => setShowDeckSelection(true)}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                Add to deck
                                            </Button>
                                        ) : (
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600 text-center">Please log in to save words</p>
                                                <LoginPage />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            )}
                        </div>
                        
                        {/* Right side - Deck Selection (only shown when showDeckSelection is true and not in success state) */}
                        {showDeckSelection && !saveSuccess && (
                            <>
                                <div className="hidden md:block w-px bg-gray-200 flex-shrink-0"></div>
                                <div className="md:w-1/2 p-8 overflow-hidden bg-white flex-shrink-0 flex flex-col">
                                    {!isCreatingNewDeck && (
                                        <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                            <h3 className="text-lg font-semibold text-gray-900">Save to deck</h3>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => setShowDeckSelection(false)}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                ← Back
                                            </Button>
                                        </div>
                                    )}
                                    <DisplayCurrentDecks 
                                        onSelectDeck={saveWordToDeck}
                                        onNewDeckStateChange={setIsCreatingNewDeck}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter className="px-8 py-4 border-t border-gray-200 bg-white">
                        <DialogClose asChild>
                            <Button variant="outline" className="w-full sm:w-auto">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const WordCategory: React.FC<WordCategoryProps> = ({ title, words, index = 0, isMockData = false, isStreaming = false, translationKey = 0, onWordRemoved, isWordSaved, getWordDecks }) => {
    const [visibleWords, setVisibleWords] = useState<Word[]>([]);
    const [lastTranslationKey, setLastTranslationKey] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Deduplicate words
    const uniqueWords = useMemo(() => deduplicateWords(words), [words]);
    const MAX_VISIBLE_WORDS = 12; // Show first 12 words, then allow expansion
    const shouldShowExpandButton = uniqueWords.length > MAX_VISIBLE_WORDS;
    
    const displayedWords = useMemo(() => {
        return isExpanded || !shouldShowExpandButton 
            ? uniqueWords 
            : uniqueWords.slice(0, MAX_VISIBLE_WORDS);
    }, [isExpanded, uniqueWords, shouldShowExpandButton]);
    
    useEffect(() => {
        // Only animate when translationKey changes (new translation started)
        if (!isStreaming && uniqueWords.length > 0 && translationKey !== lastTranslationKey) {
            setLastTranslationKey(translationKey);
            setIsExpanded(false); // Reset expansion on new translation
            setVisibleWords([]);
            
            // Calculate what to show initially
            const initialWords = uniqueWords.length > MAX_VISIBLE_WORDS 
                ? uniqueWords.slice(0, MAX_VISIBLE_WORDS)
                : uniqueWords;
            
            // Clear any existing timeouts
            const timeouts: NodeJS.Timeout[] = [];
            
            // Animate words in with staggered delay for smooth transition
            initialWords.forEach((word, i) => {
                const timeout = setTimeout(() => {
                    setVisibleWords(prev => {
                        // Check if word already exists to prevent duplicates
                        const exists = prev.some(w => w.id === word.id || (w.fi === word.fi && w.en === word.en));
                        if (exists) return prev;
                        return [...prev, word];
                    });
                }, i * 50); // Staggered animation: 50ms per word
                timeouts.push(timeout);
            });
            
            // Cleanup function
            return () => {
                timeouts.forEach(timeout => clearTimeout(timeout));
            };
        } else if (uniqueWords.length === 0) {
            setVisibleWords([]);
        } else if (!isStreaming && uniqueWords.length > 0 && translationKey === lastTranslationKey) {
            // Update visible words when expansion changes or words update
            // Deduplicate displayedWords before setting
            const deduplicated = displayedWords.filter((word, index, self) => 
                index === self.findIndex(w => w.id === word.id || (w.fi === word.fi && w.en === word.en))
            );
            setVisibleWords(deduplicated);
        }
    }, [uniqueWords, displayedWords, isStreaming, translationKey, lastTranslationKey]);
    
    return (
        <div 
            className={`w-full ${
                isMockData ? 'animate-fadeIn' : ''
            }`}
            style={isMockData ? { 
                animationDelay: `${0.1 + (index * 0.1)}s`,
                animationFillMode: 'both'
            } : {}}
        >
            <div className="text-base font-semibold mb-3 flex items-center justify-between">
                <div className="flex items-center">
                    {title}
                    {uniqueWords.length > 0 && (
                        <span className="ml-2 text-sm text-gray-500 font-normal">
                            ({uniqueWords.length})
                        </span>
                    )}
                    {isStreaming && uniqueWords.length === 0 && (
                        <span className="ml-2 text-sm text-gray-500">
                            <div className="inline-block animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                        </span>
                    )}
                </div>
                {shouldShowExpandButton && !isStreaming && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                        aria-label={isExpanded ? "Show less" : "Show more"}
                    >
                        {isExpanded ? (
                            <>
                                <span>Show less</span>
                                <ChevronUp className="h-4 w-4" />
                            </>
                        ) : (
                            <>
                                <span>Show {uniqueWords.length - MAX_VISIBLE_WORDS} more</span>
                                <ChevronDown className="h-4 w-4" />
                            </>
                        )}
                    </button>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {visibleWords
                    .filter((word, index, self) => {
                        // Deduplicate: keep only first occurrence of each unique fi+en combination
                        return index === self.findIndex(w => w.fi === word.fi && w.en === word.en);
                    })
                    .map((word, wordIndex) => {
                        // Create a truly unique key combining multiple fields
                        const uniqueKey = `${word.id || 'no-id'}-${word.fi}-${word.en}-${wordIndex}`;
                        const saved = isWordSaved ? isWordSaved(word) : false;
                        const decks = getWordDecks ? getWordDecks(word) : [];
                        return (
                            <WordPill
                                key={uniqueKey}
                                word={word}
                                wordIndex={wordIndex}
                                onWordRemoved={onWordRemoved}
                                isSaved={saved}
                                savedDeckNames={decks}
                            />
                        );
                    })}
            </div>
        </div>
    );
};

export const WordDetails: React.FC<{
    words: Word[]; 
    highlighted?: boolean; 
    isMockData?: boolean; 
    isStreaming?: boolean; 
    translationKey?: number;
    onWordRemoved?: () => void;
    savedWordKeys?: Set<string>;
    savedWordDecks?: Record<string, string[]>;
}> = ({ words, highlighted, isMockData = false, isStreaming = false, translationKey = 0, onWordRemoved, savedWordKeys, savedWordDecks }) => {
    // Deduplicate words first, then categorize
    const uniqueWords = deduplicateWords(words);

    const isWordSaved = (word: Word) => {
        if (!savedWordKeys) return false;
        const forms = [
            word.fi?.toLowerCase().trim(),
            word.original_word?.toLowerCase().trim()
        ].filter(Boolean) as string[];
        return forms.some(form => savedWordKeys.has(form));
    };
    const getWordDecks = (word: Word): string[] => {
        if (!savedWordDecks) return [];
        const forms = [
            word.fi?.toLowerCase().trim(),
            word.original_word?.toLowerCase().trim()
        ].filter(Boolean) as string[];
        const names = new Set<string>();
        forms.forEach(form => {
            const decks = savedWordDecks[form];
            decks?.forEach(name => names.add(name));
        });
        return Array.from(names);
    };

    const categories = [
        { title: 'Verbs', words: uniqueWords.filter(word => word.type === 'verb' )},
        { title: 'Nouns', words: uniqueWords.filter(word => word.type === 'noun' )},
        { title: 'Adjectives', words: uniqueWords.filter(word => word.type === 'adjective') },
        { title: 'Others', words: uniqueWords.filter(word => !["verb", "noun", "adjective"].includes(word.type))}
    ]
    return (
        <div className={`mt-6 w-full px-0 mx-auto transition-all duration-300 ${highlighted ? 'ring-4 ring-blue-500 ring-opacity-75 bg-blue-50 rounded-lg p-6 shadow-lg' : ''}`}>
            <div className="space-y-6">
                {categories.map((category, index) => (
                    category.words.length > 0 && (
                        <WordCategory 
                            key={index} 
                            title={category.title} 
                            words={category.words} 
                            index={index}
                            isMockData={isMockData}
                            isStreaming={isStreaming}
                            translationKey={translationKey}
                            onWordRemoved={onWordRemoved}
                            isWordSaved={isWordSaved}
                            getWordDecks={getWordDecks}
                        />
                    )
                ))}
            </div>
        </div>
    )
}