import { useState, useEffect } from "react";
import { chatCompletion } from "@/ChatCompletion";
import { v4 as uuidv4 } from 'uuid'
import jsonData from '../../../words.json'

const useTranslation = () => {
    const [fromLanguage, setFromLanguage] = useState('Finnish')
    const [inputText, setInputText] = useState('')
    const [ready, setReady] = useState(true)
    const [response, setResponse] = useState(() => {
        const storedResponse = localStorage.getItem('response')
        return storedResponse ? JSON.parse(storedResponse) : null
    })

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
        }
    }
    useEffect(() => {
        const storedFromLanguage = localStorage.getItem('fromLanguage')
        if (storedFromLanguage) {
            setFromLanguage(storedFromLanguage)
        }
    }, [])
    return { fromLanguage, setFromLanguage, inputText, setInputText, ready, response, handleTranslation }
}

export default useTranslation