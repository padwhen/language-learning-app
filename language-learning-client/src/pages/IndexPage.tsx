import { TranslationBar } from "../components/IndexPage/TranslationBar";
import { InputBar } from "../components/IndexPage/InputBar";
import { Translation } from "../components/IndexPage/Translation";
import { WordDetails } from "../components/IndexPage/Details";
import { DeckInfo } from "../components/IndexPage/DeckInfo";
import { Header } from "../components/Header";
import CoachMark from "../components/IndexPage/CoachMark";
import WelcomeTourModal from "../components/IndexPage/WelcomeTourModal";
import useTranslation from "../state/hooks/useTranslation";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";


export const IndexPage = () => {
    const { fromLanguage, setFromLanguage, inputText, setInputText, ready, response, handleTranslation } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    
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

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
                <Header 
                    highlightUser={highlightedElement === 'user-header'}
                />
                <div className="flex flex-col lg:flex-row max-w-7xl mx-auto gap-32">
                    <div className="w-full max-w-4xl px-4 lg:px-7 flex flex-col items-center py-6">
                        <div className="w-full max-w-4xl bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl shadow-sm">
                            <TranslationBar 
                                fromLanguage={fromLanguage} 
                                setFromLanguage={setFromLanguage}
                                highlighted={highlightedElement === 'translation-bar'}
                            />
                            <InputBar 
                                inputText={inputText} 
                                setInputText={setInputText} 
                                handleTranslation={handleTranslation} 
                                ready={ready}
                                highlighted={highlightedElement === 'input-bar'}
                            />
                            {(response?.sentence || isTourActive) && (
                                <div 
                                    className={`transition-all duration-700 ease-out transform ${
                                        isTourActive && !response?.sentence 
                                            ? 'animate-in fade-in slide-in-from-bottom-4' 
                                            : ''
                                    }`}
                                    style={{ 
                                        animationDelay: isTourActive && !response?.sentence ? '0.3s' : '0s',
                                        animationFillMode: 'both'
                                    }}
                                >
                                    <Translation 
                                        text={isTourActive ? mockTranslation : response?.sentence}
                                        highlighted={highlightedElement === 'translation'}
                                    />
                                </div>
                            )}
                            {(response?.words || isTourActive) && (
                                <div 
                                    className={`transition-all duration-700 ease-out transform ${
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
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="w-full lg:w-1/3 flex flex-col px-4 lg:px-0 py-8 lg:ml-8">
                        <div className="lg:sticky lg:top-8">
                            <DeckInfo 
                                mockData={isTourActive}
                                highlighted={highlightedElement === 'deck-info'}
                            />
                        </div>
                    </div>
                </div>
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
        </>
    )
}
