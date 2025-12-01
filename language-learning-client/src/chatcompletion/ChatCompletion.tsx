import OpenAI from "openai"
import axios from "axios"

const API_KEY = import.meta.env.VITE_GPT_KEY

// Non-streaming chat completion with two-pass translation (initial + review)
// Now calls backend API instead of directly using Cerebras
export const chatCompletionStream = async function* (
    data: { language: string, text: string}
) {
    const {language, text} = data;

    try {
        // Call backend API for translation
        const response = await axios.post('/translate', {
            language,
            text
        });

        // Yield the result (maintaining the same interface)
        yield response.data;
    } catch (error: any) {
        console.error('Translation API error:', error);
        // If API call fails, throw the error
        throw new Error(error.response?.data?.error || error.message || 'Translation failed');
    }
};

// Original non-streaming function for backward compatibility
// Now calls backend API
export const chatCompletion = async (data: { language: string, text: string}) => {
    const {language, text} = data

    try {
        const response = await axios.post('/translate/simple', {
            language,
            text
        });
        return JSON.stringify(response.data);
    } catch (error: any) {
        console.error('Translation API error:', error);
        // Return a minimal valid JSON instead of throwing
        return JSON.stringify({
            sentence: "Translation failed",
            words: []
        });
    }
}


export const vocabulariesTailor = async (cards: string) => {
    try {
        const response = await axios.post('/vocabularies-tailor', {
            cards
        });
        return JSON.stringify(response.data);
    } catch (error: any) {
        console.error('Vocabularies tailor API error:', error);
        throw new Error(error.response?.data?.error || error.message || 'Vocabularies tailoring failed');
    }
}

export const test = async (word: string) => {
    try {
        const response = await axios.post('/api/test', {
            word
        });
        return JSON.stringify(response.data);
    } catch (error: any) {
        console.error('Test API error:', error);
        throw new Error(error.response?.data?.error || error.message || 'Test failed');
    }
}

export const createTest = async (data: any) => {
    try {
        const response = await axios.post('/create-test', {
            data
        });
        return JSON.stringify(response.data);
    } catch (error: any) {
        console.error('Create test API error:', error);
        throw new Error(error.response?.data?.error || error.message || 'Create test failed');
    }
}

export const textToSpeech = async (text: string) => {
    const openai = new OpenAI({apiKey: API_KEY, dangerouslyAllowBrowser: true})
    const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'nova',
        input: text
    })
    const arrayBuffer = await mp3.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(blob);

    return audioUrl;
}