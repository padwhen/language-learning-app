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
    const [response, setResponse] = useState(() => {
        const storedResponse = localStorage.getItem('response')
        return storedResponse ? JSON.parse(storedResponse) : null
    })

    const handleTranslationStream = async () => {
        // Clear localStorage when starting new translation
        localStorage.removeItem('response');
        setValidationError(null); // Clear any previous errors
        
        setReady(false)
        setIsStreaming(true)
        
        // Clear previous response
        setResponse(null)
        
        if (inputText.trim().toLowerCase() === 'test') {
            const parsedResponse: any = jsonData;
            const { sentence, words } = parsedResponse;
            const confidence = (parsedResponse as any).confidence;
            const confidenceDetails = (parsedResponse as any).confidenceDetails;
            const testResponse: any = {};
            
            if (sentence) {
                testResponse.sentence = sentence;
            }
            if (words) {
                const wordsWithUUID = words.map((word: any) => ({
                    ...word, id: uuidv4()
                }))
                testResponse.words = wordsWithUUID;
            }
            if (confidence !== undefined && confidence !== null) {
                testResponse.confidence = confidence;
            }
            if (confidenceDetails) {
                testResponse.confidenceDetails = confidenceDetails;
            }
            
            setResponse(testResponse);
            localStorage.setItem("response", JSON.stringify(testResponse));
            localStorage.setItem("fromLanguage", fromLanguage);
            setReady(true);
            setIsStreaming(false);
        } else {
            try {
                const stream = chatCompletionStream({ language: fromLanguage, text: inputText });
                
                let chunkNumber = 0;
                for await (const chunk of stream) {
                    chunkNumber++;
                    const { sentence, words, isComplete, currentWordIndex: streamWordIndex, confidence, confidenceDetails } = chunk;
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
                            
                            // Deduplicate words based on fi (Finnish word) to prevent duplicates
                            const existingWords = newResponse.words || [];
                            const seenFi = new Set(existingWords.map((w: any) => w.fi?.toLowerCase().trim()).filter(Boolean));
                            
                            const newUniqueWords = wordsWithUUID.filter((word: any) => {
                                const key = word.fi?.toLowerCase().trim();
                                if (!key) return false;
                                if (seenFi.has(key)) return false;
                                seenFi.add(key);
                                return true;
                            });
                            
                            newResponse.words = [...existingWords, ...newUniqueWords];
                        }
                        
                        // Update confidence and confidenceDetails if present
                        if (confidence !== undefined && confidence !== null) {
                            newResponse.confidence = confidence;
                        }
                        if (confidenceDetails) {
                            newResponse.confidenceDetails = confidenceDetails;
                        }
                        
                        return newResponse;
                    });
                    
                    // If this is the final chunk, save to localStorage
                    if (isComplete) {
                        setCurrentWordIndex(-1); // Reset highlighting
                        
                        // Use the accumulated response state to ensure we have all data including confidence details
                        setResponse((prevResponse: any) => {
                            const finalResponse: any = {
                                sentence: prevResponse?.sentence || sentence,
                                words: prevResponse?.words || []
                            };
                            
                            // Include confidence and confidenceDetails from accumulated state or current chunk
                            const finalConfidence = prevResponse?.confidence ?? confidence;
                            const finalConfidenceDetails = prevResponse?.confidenceDetails ?? confidenceDetails;
                            
                            if (finalConfidence !== undefined && finalConfidence !== null) {
                                finalResponse.confidence = finalConfidence;
                            }
                            if (finalConfidenceDetails) {
                                finalResponse.confidenceDetails = finalConfidenceDetails;
                            }
                            
                            // Save to localStorage with all data including confidence details
                            localStorage.setItem('response', JSON.stringify(finalResponse));
                            localStorage.setItem('fromLanguage', fromLanguage);
                            
                            return finalResponse;
                        });
                    }
                }
                
                setReady(true);
                setIsStreaming(false);
            } catch (error) {
                console.error('Streaming translation error:', error);
                setReady(true);
                setIsStreaming(false);
                
                // Check if it's a validation error and show inline
                if (error instanceof Error) {
                    setValidationError(error.message);
                    return; // Don't try fallback for validation errors
                }
                
                // Fallback to non-streaming
            try {
                const response_json = await chatCompletion({ language: fromLanguage, text: inputText });
                if (response_json !== null) {
                    const parsedResponse = JSON.parse(response_json);
                    const { sentence, words, confidence, confidenceDetails } = parsedResponse;
                    
                    const finalResponse: any = {
                        sentence,
                        words: words?.map((word: any) => ({
                            ...word, 
                            id: uuidv4()
                        })) || []
                    };
                    
                    // Include confidence and confidenceDetails if present
                    if (confidence !== undefined && confidence !== null) {
                        finalResponse.confidence = confidence;
                    }
                    if (confidenceDetails) {
                        finalResponse.confidenceDetails = confidenceDetails;
                    }
                    
                    setResponse(finalResponse);
                    localStorage.setItem('response', JSON.stringify(finalResponse));
                    localStorage.setItem('fromLanguage', fromLanguage);
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
            const parsedResponse: any = jsonData;
            const { sentence, words } = parsedResponse;
            const confidence = (parsedResponse as any).confidence;
            const confidenceDetails = (parsedResponse as any).confidenceDetails;
            const testResponse: any = {};
            
            if (sentence) {
                testResponse.sentence = sentence;
            }
            if (words) {
                const wordsWithUUID = words.map((word: any) => ({
                    ...word, id: uuidv4()
                }))
                testResponse.words = wordsWithUUID;
            }
            if (confidence !== undefined && confidence !== null) {
                testResponse.confidence = confidence;
            }
            if (confidenceDetails) {
                testResponse.confidenceDetails = confidenceDetails;
            }
            
            setResponse(testResponse);
            localStorage.setItem("response", JSON.stringify(testResponse));
            localStorage.setItem("fromLanguage", fromLanguage);
            setReady(true);
        } else {
            try {
                const response_json = await chatCompletion({ language: fromLanguage, text: inputText })
                if (response_json !== null) {
                    const parsedResponse = JSON.parse(response_json)
                    const { sentence, words, confidence, confidenceDetails } = parsedResponse
                    const finalResponse: any = {};
                    
                    if (sentence) {
                        finalResponse.sentence = sentence;
                    }
                    if (words) {
                        const wordsWithUUID = words.map((word: any) => ({
                            ...word, id: uuidv4()
                        }))
                        finalResponse.words = wordsWithUUID;
                    }
                    if (confidence !== undefined && confidence !== null) {
                        finalResponse.confidence = confidence;
                    }
                    if (confidenceDetails) {
                        finalResponse.confidenceDetails = confidenceDetails;
                    }
                    
                    setResponse(finalResponse);
                    localStorage.setItem('response', JSON.stringify(finalResponse));
                    localStorage.setItem('fromLanguage', fromLanguage);
                }
                setReady(true);
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

    // Function to refresh response from localStorage
    const refreshResponseFromStorage = () => {
        const storedResponse = localStorage.getItem('response');
        if (storedResponse) {
            setResponse(JSON.parse(storedResponse));
        } else {
            setResponse(null);
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
        response, 
        handleTranslation,
        handleTranslationStream,
        refreshResponseFromStorage
    }
}

export default useTranslation