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


export const IndexPage = () => {
    const { fromLanguage, setFromLanguage, inputText, setInputText, ready, response, handleTranslation } = useTranslation();
    const [showOnboarding, setShowOnboarding] = useState(false);
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
        const stepHighlights = [
            null, 'translation-bar', 'input-bar', 'translation', 
            'word-details', 'user-header', 'deck-info', null
        ];
        setHighlightedElement(stepHighlights[currentStep]);
    }, [currentStep]);

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
        setShowOnboarding(false);
        setCurrentStep(0);
        setHighlightedElement(null);
    };

    const handleFinish = () => {
        setShowOnboarding(false);
        setCurrentStep(0);
        setHighlightedElement(null);
    };

    const startOnboarding = () => {
        setShowOnboarding(true);
        setCurrentStep(0);
    };

    return (
        <>
            <Header 
                onStartTour={startOnboarding} 
                highlightUser={highlightedElement === 'user-header'}
            />
            <div className="flex flex-col lg:flex-row">
                <div className="w-full px-4 lg:px-16 flex flex-col items-center">
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
                    {(response?.sentence || showOnboarding) && (
                        <div 
                            className={`transition-all duration-700 ease-out transform ${
                                showOnboarding && !response?.sentence 
                                    ? 'animate-in fade-in slide-in-from-bottom-4' 
                                    : ''
                            }`}
                            style={{ 
                                animationDelay: showOnboarding && !response?.sentence ? '0.3s' : '0s',
                                animationFillMode: 'both'
                            }}
                        >
                            <Translation 
                                text={showOnboarding ? mockTranslation : response?.sentence}
                                highlighted={highlightedElement === 'translation'}
                            />
                        </div>
                    )}
                    {(response?.words || showOnboarding) && (
                        <div 
                            className={`transition-all duration-700 ease-out transform ${
                                showOnboarding && !response?.words 
                                    ? 'animate-in fade-in slide-in-from-bottom-4' 
                                    : ''
                            }`}
                            style={{ 
                                animationDelay: showOnboarding && !response?.words ? '0.6s' : '0s',
                                animationFillMode: 'both'
                            }}
                        >
                            <WordDetails 
                                words={showOnboarding ? mockWords : response?.words}
                                highlighted={highlightedElement === 'word-details'}
                                isMockData={showOnboarding && !response?.words}
                            />
                        </div>
                    )}
                </div>
                <div className="w-full lg:w-1/4 flex flex-col mr-4">
                    <div className="mt-2">
                        <DeckInfo 
                            mockData={showOnboarding}
                            highlighted={highlightedElement === 'deck-info'}
                        />
                    </div>
                </div>
            </div>

            {/* Welcome Tour Modal */}
            <WelcomeTourModal onStartTour={startOnboarding} />

            {/* Onboarding Coach Marks */}
            {showOnboarding && (
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
