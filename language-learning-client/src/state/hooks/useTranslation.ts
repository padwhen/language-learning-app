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
    const [response, setResponse] = useState(() => {
        const storedResponse = localStorage.getItem('response')
        return storedResponse ? JSON.parse(storedResponse) : null
    })

    const handleTranslationStream = async () => {
        setReady(false)
        setIsStreaming(true)
        
        // Clear previous response
        setResponse(null)
        
        if (inputText.trim().toLowerCase() === 'test') {
            const parsedResponse = jsonData;
            const { sentence, words } = parsedResponse
            if (sentence) {
                setResponse((prevResponse: any) => ({
                    ...prevResponse, sentence: sentence 
                }))
            }
            if (words) {
                const wordsWithUUID = words.map(word => ({
                    ...word, id: uuidv4()
                }))
                setResponse((prevResponse: any) => ({
                    ...prevResponse, words: wordsWithUUID
                }))
            }
            localStorage.setItem("response", JSON.stringify(parsedResponse))
            localStorage.setItem("fromLanguage", fromLanguage)
            setReady(true)
            setIsStreaming(false)
        } else {
            try {
                const stream = chatCompletionStream({ language: fromLanguage, text: inputText });
                
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
                                id: word.id || uuidv4()
                            })) || []
                        };
                        localStorage.setItem('response', JSON.stringify(finalResponse));
                        localStorage.setItem('fromLanguage', fromLanguage);
                    }
                }
                
                setReady(true);
                setIsStreaming(false);
            } catch (error) {
                console.error('Streaming translation error:', error);
                setReady(true);
                setIsStreaming(false);
                
                // Fallback to non-streaming
                try {
                    const response_json = await chatCompletion({ language: fromLanguage, text: inputText });
                    if (response_json !== null) {
                        const parsedResponse = JSON.parse(response_json);
                        const { sentence, words } = parsedResponse;
                        
                        const finalResponse = {
                            sentence,
                            words: words?.map((word: any) => ({
                                ...word, 
                                id: uuidv4()
                            })) || []
                        };
                        
                        setResponse(finalResponse);
                        localStorage.setItem('response', JSON.stringify(finalResponse));
                        localStorage.setItem('fromLanguage', fromLanguage);
                    }
                } catch (fallbackError) {
                    console.error('Fallback translation error:', fallbackError);
                    // You might want to show an error message to the user here
                }
            }
        }
    }

    // Keep the original method for backward compatibility
    const handleTranslation = async () => {
        setReady(false)
        if (inputText.trim().toLowerCase() === 'test') {
            const parsedResponse = jsonData;
            const { sentence, words } = parsedResponse
            if (sentence) {
                setResponse((prevResponse: any) => ({
                    ...prevResponse, sentence: sentence 
                }))
            }
            if (words) {
                const wordsWithUUID = words.map(word => ({
                    ...word, id: uuidv4()
                }))
                setResponse((prevResponse: any) => ({
                    ...prevResponse, words: wordsWithUUID
                }))
            }
            localStorage.setItem("response", JSON.stringify(parsedResponse))
            localStorage.setItem("fromLanguage", fromLanguage)
            setReady(true)
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
                            ...word, id: uuidv4()
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

    return { 
        fromLanguage, 
        setFromLanguage, 
        inputText, 
        setInputText, 
        ready, 
        isStreaming,
        currentWordIndex,
        response, 
        handleTranslation,
        handleTranslationStream
    }
}

export default useTranslation