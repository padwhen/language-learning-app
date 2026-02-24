import { useState, useEffect } from "react";
import { chatCompletion } from "@/chatcompletion/ChatCompletion";
import { v4 as uuidv4 } from 'uuid'
import jsonData from '../../../words.json'

const useTranslation = () => {
    const [fromLanguage, setFromLanguage] = useState('Finnish')
    const [inputText, setInputText] = useState('')
    const [ready, setReady] = useState(true)
    const [isStreaming, setIsStreaming] = useState(false)
    const [validationError, setValidationError] = useState<string | null>(null)
    const [response, setResponse] = useState(() => {
        const storedResponse = localStorage.getItem('response')
        return storedResponse ? JSON.parse(storedResponse) : null
    })

    const handleTranslation = async () => {
        // Clear localStorage when starting new translation
        localStorage.removeItem('response');
        setValidationError(null); // Clear any previous errors

        setReady(false);
        setIsStreaming(true);
        setResponse(null);

        if (inputText.trim().toLowerCase() === 'test') {
            const parsedResponse: any = jsonData;
            const { sentence, words } = parsedResponse;
            const confidence = (parsedResponse as any).confidence;
            const confidenceDetails = (parsedResponse as any).confidenceDetails;
            const testResponse: any = { originalText: inputText };
            
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
                const response_json = await chatCompletion({ language: fromLanguage, text: inputText })
                if (response_json !== null) {
                    const parsedResponse = JSON.parse(response_json)
                    const { sentence, words, confidence, confidenceDetails } = parsedResponse
                    const finalResponse: any = { originalText: inputText };
                    
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
                setIsStreaming(false);
            } catch (error) {
                console.error('Translation error:', error);
                if (error instanceof Error) {
                    setValidationError(error.message);
                }
                setReady(true);
                setIsStreaming(false);
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
        currentWordIndex: -1,
        validationError,
        response, 
        handleTranslation,
        refreshResponseFromStorage
    }
}

export default useTranslation