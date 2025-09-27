import { useState, useEffect } from "react";
import { chatCompletion, chatCompletionStream } from "@/chatcompletion/ChatCompletion";
import { v4 as uuidv4 } from 'uuid'
import jsonData from '../../../words.json'

const useTranslation = () => {
    const [fromLanguage, setFromLanguage] = useState('Finnish')
    const [inputText, setInputText] = useState('')
    const [ready, setReady] = useState(true)
    const [isStreaming, setIsStreaming] = useState(false)
    const [currentWordIndex, setCurrentWordIndex] = useState(-1)
    const [validationError, setValidationError] = useState<string | null>(null)
    const [learningMode, setLearningMode] = useState(() => {
        // Check if stored response has details flag to auto-enable learning mode
        const storedResponse = localStorage.getItem('response')
        if (storedResponse) {
            try {
                const parsed = JSON.parse(storedResponse)
                return parsed.details === true
            } catch {
                return false
            }
        }
        return false
    })
    const [learningModeStep, setLearningModeStep] = useState(0)
    const [isLearningModeLoading, setIsLearningModeLoading] = useState(false)
    const [showLearningWidget, setShowLearningWidget] = useState(false)
    const [isTranslationCompleted, setIsTranslationCompleted] = useState(false)
    const [response, setResponse] = useState(() => {
        const storedResponse = localStorage.getItem('response')
        return storedResponse ? JSON.parse(storedResponse) : null
    })

    const handleTranslationStream = async () => {
        // Clear localStorage when starting new translation
        localStorage.removeItem('response');
        setValidationError(null); // Clear any previous errors
        
        setReady(false)
        
        // If learning mode is active, show the widget instead of streaming
        if (learningMode) {
            setShowLearningWidget(true)
            setLearningModeStep(0)
        } else {
            setIsStreaming(true)
        }
        
        // Clear previous response
        setResponse(null)
        
        if (inputText.trim().toLowerCase() === 'test') {
            const parsedResponse = jsonData;
            const { sentence, words } = parsedResponse
            
            // Create final response with details flag when learning mode is active
            const finalResponse = {
                sentence,
                words: words?.map(word => ({
                    ...word, id: uuidv4(), isPartial: false
                })) || [],
                details: learningMode // Add details flag to indicate learning mode was used
            };
            
            setResponse(finalResponse);
            localStorage.setItem("response", JSON.stringify(finalResponse));
            localStorage.setItem("fromLanguage", fromLanguage);
            setReady(true);
            setIsStreaming(false);
        } else {
            try {
                // Create a progress callback for learning mode
                const progressCallback = learningMode ? (step: number) => {
                    setLearningModeStep(step);
                } : undefined;

                const stream = chatCompletionStream({ 
                    language: fromLanguage, 
                    text: inputText, 
                    learningMode,
                    onProgress: progressCallback 
                });
                
                let chunkNumber = 0;
                for await (const chunk of stream) {
                    chunkNumber++;
                    const { sentence, words, isComplete, currentWordIndex: streamWordIndex } = chunk;
                    
                    // Update current word index for highlighting
                    if (typeof streamWordIndex === 'number') {
                        setCurrentWordIndex(streamWordIndex);
                    }
                    
                    // Update response progressively
                    setResponse((prevResponse: any) => {
                        const newResponse = { ...prevResponse };
                        
                        if (sentence) {
                            newResponse.sentence = sentence;
                        }
                        
                        if (words && words.length > 0) {
                            const wordsWithUUID = words.map((word: any) => ({
                                ...word, 
                                id: word.id || uuidv4() // Keep existing ID if present
                            }));
                            newResponse.words = wordsWithUUID;
                        }
                        
                        return newResponse;
                    });
                    
                    // If this is the final chunk, save to localStorage
                    if (isComplete) {
                        setCurrentWordIndex(-1); // Reset highlighting
                        const finalResponse = {
                            sentence,
                            words: words?.map((word: any) => ({
                                ...word, 
                                id: word.id || uuidv4(),
                                isPartial: false // Clear partial flag when complete
                            })) || [],
                            details: learningMode // Add details flag to indicate learning mode was used
                        };
                        localStorage.setItem('response', JSON.stringify(finalResponse));
                        localStorage.setItem('fromLanguage', fromLanguage);
                        
                        // Set completion state for learning mode
                        if (learningMode) {
                            setIsTranslationCompleted(true);
                        }
                    }
                }
                
                setReady(true);
                setIsStreaming(false);
                // Don't hide widget immediately if learning mode is active and completed
                if (!learningMode || !isTranslationCompleted) {
                    setShowLearningWidget(false);
                    setLearningModeStep(0);
                }
            } catch (error) {
                console.error('Streaming translation error:', error);
                setReady(true);
                setIsStreaming(false);
                setShowLearningWidget(false);
                setLearningModeStep(0);
                setIsTranslationCompleted(false);
                
                // Check if it's a validation error and show inline
                if (error instanceof Error) {
                    setValidationError(error.message);
                    return; // Don't try fallback for validation errors
                }
                
                // Fallback to non-streaming
                try {
                    const response_json = await chatCompletion({ language: fromLanguage, text: inputText, learningMode });
                    if (response_json !== null) {
                        const parsedResponse = JSON.parse(response_json);
                        const { sentence, words } = parsedResponse;
                        
                        const finalResponse = {
                            sentence,
                            words: words?.map((word: any) => ({
                                ...word, 
                                id: uuidv4(),
                                isPartial: false // Clear partial flag when complete
                            })) || [],
                            details: learningMode // Add details flag to indicate learning mode was used
                        };
                        
                        setResponse(finalResponse);
                        localStorage.setItem('response', JSON.stringify(finalResponse));
                        localStorage.setItem('fromLanguage', fromLanguage);
                        
                        // Set completion state for learning mode fallback
                        if (learningMode) {
                            setIsTranslationCompleted(true);
                        }
                    }
                } catch (fallbackError) {
                    console.error('Fallback translation error:', fallbackError);
                    // Error handling will be done at the UI level
                }
            }
        }
    }

    // Keep the original method for backward compatibility
    const handleTranslation = async () => {
        // Clear localStorage when starting new translation
        localStorage.removeItem('response');
        setValidationError(null); // Clear any previous errors
        
        setReady(false)
        if (inputText.trim().toLowerCase() === 'test') {
            const parsedResponse = jsonData;
            const { sentence, words } = parsedResponse
            
            // Create final response with details flag when learning mode is active
            const finalResponse = {
                sentence,
                words: words?.map(word => ({
                    ...word, id: uuidv4(), isPartial: false
                })) || [],
                details: learningMode // Add details flag to indicate learning mode was used
            };
            
            setResponse(finalResponse);
            localStorage.setItem("response", JSON.stringify(finalResponse));
            localStorage.setItem("fromLanguage", fromLanguage);
            setReady(true);
        } else {
            try {
                const response_json = await chatCompletion({ language: fromLanguage, text: inputText })
                if (response_json !== null) {
                    const parsedResponse = JSON.parse(response_json)
                    const { sentence, words } = parsedResponse
                    if (sentence) {
                        setResponse((prevResponse: any) => ({
                            ...prevResponse, sentence: sentence
                        }))
                    }
                    if (words) {
                        const wordsWithUUID = words.map((word: any) => ({
                            ...word, id: uuidv4(), isPartial: false
                        }))
                        setResponse((prevResponse: any) => ({
                            ...prevResponse, words: wordsWithUUID
                        }))
                    }
                    localStorage.setItem('response', JSON.stringify(parsedResponse))
                    localStorage.setItem('fromLanguage', fromLanguage)
                }
                setReady(true)
            } catch (error) {
                console.error('Translation error:', error);
                if (error instanceof Error) {
                    setValidationError(error.message);
                }
                setReady(true);
            }
        }
    }

    useEffect(() => {
        const storedFromLanguage = localStorage.getItem('fromLanguage')
        if (storedFromLanguage) {
            setFromLanguage(storedFromLanguage)
        }
    }, [])

    // Enhanced setLearningMode handler that manages localStorage and forces re-processing
    const handleLearningModeToggle = (newLearningMode: boolean) => {
        setLearningMode(newLearningMode);
        
        if (!newLearningMode) {
            // When turning OFF learning mode:
            // 1. Clear the stored response to remove grammar data
            localStorage.removeItem('response');
            // 2. Clear the current response state
            setResponse(null);
        } else {
            // When turning ON learning mode:
            // Check if there's existing translation data without grammar details
            const storedResponse = localStorage.getItem('response');
            if (storedResponse) {
                try {
                    const parsed = JSON.parse(storedResponse);
                    // If the stored response doesn't have details flag or grammar data,
                    // we need to force re-processing
                    if (!parsed.details || !parsed.words?.some((word: any) => word.pattern)) {
                        // Clear the stored response to force re-translation with learning mode
                        localStorage.removeItem('response');
                        setResponse(null);
                    }
                } catch {
                    // If parsing fails, clear the corrupted data
                    localStorage.removeItem('response');
                    setResponse(null);
                }
            }
        }
    };

    const closeWidget = () => {
        setShowLearningWidget(false);
        setLearningModeStep(0);
        setIsTranslationCompleted(false);
    };

    const handleTranslationComplete = () => {
        // Hide the widget and reset completion state
        setShowLearningWidget(false);
        setIsTranslationCompleted(false);
        setLearningModeStep(0);
        // Optionally scroll to the translation results
        const translationElement = document.querySelector('[data-translation-results]');
        if (translationElement) {
            translationElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return { 
        fromLanguage, 
        setFromLanguage, 
        inputText, 
        setInputText, 
        ready, 
        isStreaming,
        currentWordIndex,
        validationError,
        learningMode,
        setLearningMode: handleLearningModeToggle,
        learningModeStep,
        showLearningWidget,
        closeWidget,
        isTranslationCompleted,
        handleTranslationComplete,
        response, 
        handleTranslation,
        handleTranslationStream
    }
}

export default useTranslation
