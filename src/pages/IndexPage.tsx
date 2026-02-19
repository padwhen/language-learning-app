import { TranslationBar } from "../components/IndexPage/TranslationBar";
import { InputBar } from "../components/IndexPage/InputBar";
import { Translation } from "../components/IndexPage/Translation";
import { WordDetails } from "../components/IndexPage/Details";
import CoachMark from "../components/IndexPage/CoachMark";
import WelcomeTourModal from "../components/IndexPage/WelcomeTourModal";
import useTranslation from "../state/hooks/useTranslation";
import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { useTranslationHover } from "@/contexts/TranslationHoverContext";
import { useLocation, useNavigate } from "react-router-dom";
import { TranslationHoverProvider } from "@/contexts/TranslationHoverContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { useDeckContext } from "@/contexts/DeckContext";
import { UserContext } from "@/contexts/UserContext";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";


const IndexPageContent = () => {
    const { fromLanguage, setFromLanguage, inputText, setInputText, ready, isStreaming, validationError, response, handleTranslationStream, refreshResponseFromStorage } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { decks } = useDeckContext();
    const { user } = useContext(UserContext);
    const { toast } = useToast();
    const { hoveredFlashcardFi } = useTranslationHover();
    const [createFlashcardsOpen, setCreateFlashcardsOpen] = useState(false);
    const [selectedDeckId, setSelectedDeckId] = useState<string>("");
    const [saving, setSaving] = useState(false);
    const lastAutoSavedSentenceRef = useRef<string | null>(null);
    const wordDetailsRef = useRef<HTMLDivElement>(null);
    
    // Check URL for tour parameter
    const isTourActive = new URLSearchParams(location.search).get('tour') === 'true';
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightedElement, setHighlightedElement] = useState<string | null>(null);

    const totalSteps = 8;

    // Mock data for onboarding
    const mockTranslation = "Minä rakastan oppia kieliä ja se on todella hauskaa!";
    const mockWords = [
        { 
            fi: "rakastan", 
            en: "love", 
            original_word: "rakastan",
            type: "verb",
            pronunciation: "/rɑ.kɑs.tɑn/",
            comment: "First person singular present tense of 'rakastaa' (to love)"
        },
        { 
            fi: "oppia", 
            en: "to learn", 
            original_word: "oppia",
            type: "verb",
            pronunciation: "/op.pi.ɑ/",
            comment: "Infinitive form meaning 'to learn' or 'to study'"
        },
        { 
            fi: "kieliä", 
            en: "languages", 
            original_word: "kieliä",
            type: "noun",
            pronunciation: "/ki.e.li.æ/",
            comment: "Partitive plural of 'kieli' (language)"
        },
        { 
            fi: "hauskaa", 
            en: "fun", 
            original_word: "hauskaa",
            type: "adjective",
            pronunciation: "/hɑus.kɑ.ɑ/",
            comment: "Partitive singular of 'hauska' (fun, amusing, nice)"
        }
    ];

    useEffect(() => {
        if (isTourActive) {
            const stepHighlights = [
                null, 'translation-bar', 'input-bar', 'translation', 
                'word-details', 'user-header', 'deck-info', null
            ];
            setHighlightedElement(stepHighlights[currentStep]);
        } else {
            setHighlightedElement(null);
        }
    }, [currentStep, isTourActive]);

    // If navigated from Saved Sentences, restore that sentence and load from localStorage
    useEffect(() => {
        const state = location.state as any;
        if (state?.fromSavedSentence && state.originalText) {
            if (state.fromLanguage) {
                setFromLanguage(state.fromLanguage);
            }
            setInputText(state.originalText);
            // Use existing response saved in localStorage (set by SavedSentencesPage)
            refreshResponseFromStorage();
            // Clear navigation state to avoid re-triggering on back/forward
            navigate(location.pathname, { replace: true, state: {} });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // If response in localStorage includes the original text, populate the input (useful when restoring)
    useEffect(() => {
        const original = (response as any)?.originalText;
        if (original && typeof original === 'string' && inputText.trim() === '') {
            setInputText(original);
        }
    }, [response, inputText, setInputText]);

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        // Remove tour parameter from URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('tour');
        navigate(newUrl.pathname);
        setCurrentStep(0);
        setHighlightedElement(null);
    };

    const handleFinish = () => {
        // Remove tour parameter from URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('tour');
        navigate(newUrl.pathname);
        setCurrentStep(0);
        setHighlightedElement(null);
    };

    const handleSaveAll = async () => {
        if (!selectedDeckId || !response?.words || response.words.length === 0) {
            toast({
                title: "Error",
                description: "Please select a deck and ensure you have words to save.",
                variant: "destructive"
            });
            return;
        }

        setSaving(true);
        try {
            const defaultSaveAs = (user?.flashcardWordForm as 'original' | 'base') === 'base' ? 'base' : 'original';
            
            // Prepare words array and filter out invalid entries
            const wordsToSave = response.words
                .map((word: any) => {
                    const isBase = defaultSaveAs === 'base';
                    return {
                        engCard: isBase ? (word.en_base || word.en) : word.en,
                        userLangCard: isBase ? word.original_word : word.fi
                    };
                })
                .filter((word: any) => 
                    word.engCard && 
                    word.engCard.trim() !== '' && 
                    word.userLangCard && 
                    word.userLangCard.trim() !== ''
                );

            // Use the new save-all endpoint
            const result = await axios.post(`/decks/${selectedDeckId}/save-all`, { words: wordsToSave });

            toast({
                title: "Success!",
                description: `Saved ${result.data.added} flashcards to your deck.`
            });
            
            setCreateFlashcardsOpen(false);
            setSelectedDeckId("");
            // Clear the response to reset the page
            setInputText("");
            window.location.reload();
        } catch (error) {
            console.error('Error saving all words:', error);
            toast({
                title: "Error",
                description: "Failed to save words. Please try again.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    // Filter decks by current language
    const filteredDecks = decks.filter(deck => 
        deck.deckTags && deck.deckTags.length > 0 && 
        deck.deckTags[0].toLowerCase() === fromLanguage.toLowerCase()
    );

    // Pre-compute which decks each saved word appears in (by userLangCard)
    const savedWordDecks = useMemo(() => {
        const map: Record<string, string[]> = {};
        filteredDecks.forEach((deck: any) => {
            (deck.cards || []).forEach((card: any) => {
                if (!card.userLangCard) return;
                const key = String(card.userLangCard).toLowerCase().trim();
                if (!map[key]) {
                    map[key] = [];
                }
                if (!map[key].includes(deck.deckName)) {
                    map[key].push(deck.deckName);
                }
            });
        });
        return map;
    }, [filteredDecks]);

    // Convenience set of saved word keys for quick membership checks
    const savedWordKeys = useMemo(() => {
        return new Set<string>(Object.keys(savedWordDecks));
    }, [savedWordDecks]);

    // Auto-save translated sentence for logged-in users
    useEffect(() => {
        const autoSave = async () => {
            if (!user || !response?.sentence) return;

            if (lastAutoSavedSentenceRef.current === response.sentence) {
                return;
            }

            // IMPORTANT: use the original text that produced this response (prevents mismatched saves)
            const originalText =
                (response as any)?.originalText?.trim?.() ||
                inputText.trim();
            if (!originalText) return;

            // Lock immediately to avoid duplicate POSTs (React 18 StrictMode can run effects twice)
            lastAutoSavedSentenceRef.current = response.sentence;

            // Count how many words are already saved as flashcards
            let wordsSavedCount = 0;
            if (Array.isArray(response.words) && savedWordKeys.size > 0) {
                for (const word of response.words as any[]) {
                    const forms = [
                        word.fi?.toLowerCase?.().trim(),
                        word.original_word?.toLowerCase?.().trim()
                    ].filter(Boolean) as string[];
                    if (forms.some(form => savedWordKeys.has(form))) {
                        wordsSavedCount += 1;
                    }
                }
            }

            try {
                await axios.post('/saved-sentences', {
                    originalText,
                    translatedText: response.sentence,
                    fromLanguage,
                    toLanguage: 'English',
                    wordsSavedCount,
                    responsePayload: response
                });
            } catch (error) {
                console.error('Error auto-saving sentence:', error);
                // Allow retry if the request failed
                if (lastAutoSavedSentenceRef.current === response.sentence) {
                    lastAutoSavedSentenceRef.current = null;
                }
            }
        };

        autoSave();
    }, [user, response, inputText, fromLanguage, savedWordKeys]);

    // Auto-scroll to flashcard section when a word is hovered
    useEffect(() => {
        if (hoveredFlashcardFi && wordDetailsRef.current) {
            // Smooth scroll to the word details section
            wordDetailsRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }
    }, [hoveredFlashcardFi]);

    return (
        <div className="min-h-screen bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-8 md:py-12">
                    {/* Title Section */}
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">Translate & Create</h1>
                        <p className="text-gray-600 text-base sm:text-lg">Enter a sentence to translate and generate flashcards instantly.</p>
                    </div>
                    {/* Language Selection */}
                    <div className="mb-6">
                        <TranslationBar 
                            fromLanguage={fromLanguage} 
                            setFromLanguage={setFromLanguage}
                            highlighted={highlightedElement === 'translation-bar'}
                        />
                    </div>

                    {/* Input Area */}
                    <div className="mb-6">
                        <InputBar 
                            inputText={inputText} 
                            setInputText={setInputText} 
                            handleTranslation={handleTranslationStream} 
                            ready={ready}
                            highlighted={highlightedElement === 'input-bar'}
                            isStreaming={isStreaming}
                            currentWords={response?.words}
                            currentWordIndex={-1}
                            confidence={response?.confidence}
                            confidenceDetails={response?.confidenceDetails}
                            onRerun={handleTranslationStream}
                            onClear={() => {
                                localStorage.removeItem('response');
                                setInputText('');
                                refreshResponseFromStorage();
                            }}
                        />
                    </div>
                    
                    {/* Validation Error Display */}
                    {validationError && (
                        <div className="mb-6">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-sm font-bold">!</span>
                                    </div>
                                    <div>
                                        <p className="text-red-800 font-medium">Input Error</p>
                                        <p className="text-red-600 text-sm">{validationError}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Loading indicator when streaming */}
                    {isStreaming && !response?.sentence && (
                        <div className="mb-6">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-gray-600">Translating...</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Output Translation Area */}
                    {(response?.sentence || isTourActive) && (
                        <div 
                            className={`mb-6 transition-all duration-700 ease-out transform ${
                                isTourActive && !response?.sentence 
                                    ? 'animate-in fade-in slide-in-from-bottom-4' 
                                    : ''
                            }`}
                            style={{ 
                                animationDelay: isTourActive && !response?.sentence ? '0.3s' : '0s',
                                animationFillMode: 'both'
                            }}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <Translation 
                                        text={isTourActive ? mockTranslation : response?.sentence}
                                        highlighted={highlightedElement === 'translation'}
                                        onClear={() => {
                                            localStorage.removeItem('response');
                                            setInputText('');
                                            refreshResponseFromStorage();
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Loading indicator for words when streaming */}
                    {isStreaming && response?.sentence && !response?.words?.length && (
                        <div className="mb-6">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-gray-600">Analyzing words...</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Word Details */}
                    {(response?.words || isTourActive) && (
                        <div 
                            ref={wordDetailsRef}
                            className={`mb-6 transition-all duration-700 ease-out transform ${
                                isTourActive && !response?.words 
                                    ? 'animate-in fade-in slide-in-from-bottom-4' 
                                    : ''
                            }`}
                            style={{ 
                                animationDelay: isTourActive && !response?.words ? '0.6s' : '0s',
                                animationFillMode: 'both'
                            }}
                        >
                                <WordDetails 
                                    words={isTourActive ? mockWords : response?.words}
                                    highlighted={highlightedElement === 'word-details'}
                                    isMockData={isTourActive && !response?.words}
                                    isStreaming={isStreaming}
                                    translationKey={response?.sentence ? response.sentence.length : 0}
                                    onWordRemoved={refreshResponseFromStorage}
                                    savedWordKeys={savedWordKeys}
                                    savedWordDecks={savedWordDecks}
                                />
                        </div>
                    )}

                    {/* Save All Button */}
                    {response?.words && response.words.length > 0 && (
                        <div className="flex justify-end mt-6">
                            <Dialog open={createFlashcardsOpen} onOpenChange={setCreateFlashcardsOpen}>
                                <DialogTrigger asChild>
                                    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Save all
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create Flashcards</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600">
                                            Select a deck to save {response.words.length} flashcards:
                                        </p>
                                        {filteredDecks.length === 0 ? (
                                            <div className="text-center py-4">
                                                <p className="text-gray-500 mb-4">No decks found for {fromLanguage}.</p>
                                                <Button 
                                                    onClick={() => {
                                                        setCreateFlashcardsOpen(false);
                                                        navigate('/view-all-decks');
                                                    }}
                                                    variant="outline"
                                                >
                                                    Create a new deck
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {filteredDecks.map((deck) => (
                                                    <button
                                                        key={deck._id}
                                                        onClick={() => setSelectedDeckId(deck._id)}
                                                        className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                                                            selectedDeckId === deck._id
                                                                ? 'border-blue-500 bg-blue-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <div className="font-medium">{deck.deckName}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {deck.cards?.length || 0} cards
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setCreateFlashcardsOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleSaveAll}
                                                disabled={!selectedDeckId || saving || filteredDecks.length === 0}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                {saving ? "Saving..." : "Save all"}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </div>

                {/* Welcome Tour Modal */}
                <WelcomeTourModal onStartTour={() => {
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.set('tour', 'true');
                    navigate(newUrl.pathname + newUrl.search);
                }} />

                {/* Onboarding Coach Marks */}
                {isTourActive && (
                    <CoachMark
                        step={currentStep}
                        totalSteps={totalSteps}
                        onNext={handleNext}
                        onPrev={handlePrev}
                        onSkip={handleSkip}
                        onFinish={handleFinish}
                    />
                )}
        </div>
    );
}

export const IndexPage = () => {
    return (
        <TranslationHoverProvider>
            <IndexPageContent />
        </TranslationHoverProvider>
    );
}
