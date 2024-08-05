import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"; 

const googleKey = import.meta.env.VITE_GOOGLE_KEY
const API_KEY = import.meta.env.VITE_GPT_KEY
const PROMPT_1 = import.meta.env.VITE_PROMPT_1
const PROMPT_2 = import.meta.env.VITE_PROMPT_2
const PROMPT_3 = import.meta.env.VITE_PROMPT_3
const PROMPT_4 = import.meta.env.VITE_PROMPT_4


export const chatCompletion = async (data: { language: string, text: string}) => {
    const {language, text} = data
    const openai = new OpenAI({apiKey: API_KEY, dangerouslyAllowBrowser: true})
    const aiModel = 'gpt-4o-mini'
    const completion = await openai.chat.completions.create({
        model: aiModel,
        messages: [{role: 'system',content: 'you are a helpful assistant'},{role: 'user',content: `${text} in ${language} <--- ${PROMPT_1}`}]
    })
    let aiResponse = completion.choices[0].message.content
    const jsonRegex = /{(.|\n)*}/; 
    const match = aiResponse?.match(jsonRegex);
    if (match) {
        aiResponse = match[0].trim(); // Use the matched JSON string and trim whitespace
    } else {
        throw new Error('No valid JSON object found in response');
    }
    return aiResponse;
}


export const vocabulariesTailor = async (cards: string) => {
    const genAI = new GoogleGenerativeAI(googleKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const prompt = `${cards} <-- ${PROMPT_2}`
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    const jsonArrayRegex = /\[.*\]/s;
    const match = text?.match(jsonArrayRegex);
    if (match) {
        text = match[0].trim()
    }
    return text
}

export const test = async (word: string) => {
    const genAI = new GoogleGenerativeAI(googleKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const url = `https://www.sanakirja.fi/finnish-english/${word}`
    const prompt = `${url} ${PROMPT_3}`
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    const jsonRegex = /{(.|\n)*}/; 
    const match = text?.match(jsonRegex);
    if (match) {
        text = match[0].trim()
    }
    return text
}

export const createTest = async (data: any) => {
    const jsonString = JSON.stringify(data)
    const openai = new OpenAI({apiKey: API_KEY, dangerouslyAllowBrowser: true})
    const aiModel = 'gpt-4o-mini'
    const completion = await openai.chat.completions.create({
        model: aiModel,
        messages: [{role: 'system',content: 'you are a helpful assistant'},{role: 'user',content: `${jsonString} <--- ${PROMPT_4}`}]
    })
    let aiResponse = completion.choices[0].message.content
    const jsonRegex = /{(.|\n)*}/; 
    const match = aiResponse?.match(jsonRegex);
    if (match) {
        aiResponse = match[0].trim(); // Use the matched JSON string and trim whitespace
    } else {
        throw new Error('No valid JSON object found in response');
    }
    return aiResponse;
}
