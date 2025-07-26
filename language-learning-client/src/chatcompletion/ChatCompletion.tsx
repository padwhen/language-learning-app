import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import { franc } from 'franc'

const googleKey = import.meta.env.VITE_GOOGLE_KEY
const API_KEY = import.meta.env.VITE_GPT_KEY
const PROMPT_1 = import.meta.env.VITE_PROMPT_1
const PROMPT_2 = import.meta.env.VITE_PROMPT_2
const PROMPT_3 = import.meta.env.VITE_PROMPT_3
const PROMPT_4 = import.meta.env.VITE_PROMPT_4

// Simple validation function for supported languages
const validateUserInput = (text: string, selectedLanguage: string): { isValid: boolean; error?: string } => {
    // Check if input is too short
    if (!text || text.trim().length < 3) {
        return {
            isValid: false,
            error: 'Your input is too short'
        };
    }

    // Language mapping for our 5 supported languages
    const languageMap: { [key: string]: string } = {
        'Finnish': 'fin',
        'Korean': 'kor', 
        'Greek': 'ell',
        'Vietnamese': 'vie',
        'Chinese': 'cmn'
    };

    const expectedCode = languageMap[selectedLanguage];
    if (!expectedCode) {
        // If language not in our list, skip validation
        return { isValid: true };
    }

    // Detect language with franc
    const detectedCode = franc(text.trim(), { minLength: 3 });
    
    // If franc can't detect or detects wrong language
    if (detectedCode === 'und' || detectedCode !== expectedCode) {
        return {
            isValid: false,
            error: `Please write in ${selectedLanguage} as you've selected. We'd love to help you learn!`
        };
    }

    return { isValid: true };
};

const cleanJSON = (jsonStr: string): string => {
    // Remove trailing commas before closing brackets/braces
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix common issues with quotes in property names
    jsonStr = jsonStr.replace(/(['"])?([a-zA-Z_][a-zA-Z0-9_]*)\1?\s*:/g, '"$2":');
    
    // Remove any trailing commas at the end
    jsonStr = jsonStr.replace(/,\s*$/, '');
    
    // Fix missing commas between objects in arrays
    jsonStr = jsonStr.replace(/}\s*{/g, '}, {');
    
    // Remove any control characters that might break JSON parsing
    jsonStr = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    return jsonStr;
};

const extractCompleteWords = (text: string): any[] => {
    const words: any[] = [];
    
    const patterns = [
        // Standard word object pattern
        /\{[^{}]*"fi"\s*:\s*"[^"]*"[^{}]*"en"\s*:\s*"[^"]*"[^{}]*"type"\s*:\s*"[^"]*"[^{}]*\}/g,
        // Alternative pattern with different field order
        /\{[^{}]*"en"\s*:\s*"[^"]*"[^{}]*"fi"\s*:\s*"[^"]*"[^{}]*"type"\s*:\s*"[^"]*"[^{}]*\}/g,
        // Pattern for objects with type first
        /\{[^{}]*"type"\s*:\s*"[^"]*"[^{}]*"fi"\s*:\s*"[^"]*"[^{}]*"en"\s*:\s*"[^"]*"[^{}]*\}/g
    ];
    
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            try {
                const cleanedMatch = cleanJSON(match[0]);
                const wordObj = JSON.parse(cleanedMatch);
                
                // Validate it has required fields and isn't a duplicate
                if (wordObj.fi && wordObj.en && wordObj.type && 
                    !words.some(w => w.fi === wordObj.fi && w.en === wordObj.en)) {
                    words.push(wordObj);
                }
            } catch (e) {
                // Skip malformed objects
                continue;
            }
        }
    }
    
    return words;
};

const extractPartialWords = (text: string): any[] => {
    const words: any[] = [];
    
    // Look for partial word objects with at least fi and en fields
    const partialPatterns = [
        // Partial with fi and en, maybe missing other fields
        /\{[^{}]*"fi"\s*:\s*"([^"]*)"[^{}]*"en"\s*:\s*"([^"]*)"[^{}]*(?:"type"\s*:\s*"([^"]*)")?/g,
        // Partial with en and fi
        /\{[^{}]*"en"\s*:\s*"([^"]*)"[^{}]*"fi"\s*:\s*"([^"]*)"[^{}]*(?:"type"\s*:\s*"([^"]*)")?/g
    ];
    
    for (const pattern of partialPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const [, first, second, type] = match;
            
            const isFirstFi = pattern.source.includes('"fi".*"en"');
            const fi = isFirstFi ? first : second;
            const en = isFirstFi ? second : first;
            
            if (fi && en && fi.length > 0 && en.length > 0) {
                const partialWord = {
                    fi,
                    en,
                    type: type || 'unknown',
                    original_word: fi,
                    pronunciation: '',
                    comment: 'Loading...',
                    isPartial: true
                };
                
                // Avoid duplicates
                if (!words.some(w => w.fi === fi && w.en === en)) {
                    words.push(partialWord);
                }
            }
        }
    }
    
    return words;
};

const mergeWords = (partialWords: any[], completeWords: any[]): any[] => {
    const result = [...completeWords];
    
    // Add partial words that don't have complete versions
    partialWords.forEach(partial => {
        const hasComplete = completeWords.some(complete => 
            complete.fi === partial.fi && complete.en === partial.en
        );
        
        if (!hasComplete) {
            result.push(partial);
        }
    });
    
    return result;
};

// Enhanced sentence extraction
const extractSentence = (text: string): string | null => {
    // Try multiple patterns for sentence extraction
    const patterns = [
        /"sentence"\s*:\s*"([^"]+)"/,
        /"translation"\s*:\s*"([^"]+)"/,
        /"translated"\s*:\s*"([^"]+)"/,
        /"result"\s*:\s*"([^"]+)"/
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
};

// Streaming chat completion with progressive results
export const chatCompletionStream = async function* (
    data: { language: string, text: string},
    onPartialResult?: (sentence: string | null, words: any[]) => void
) {
    const {language, text} = data;

    // Validate user input
    const validation = validateUserInput(text, language);
    if (!validation.isValid) {
        throw new Error(validation.error);
    }
    
    const openai = new OpenAI({apiKey: API_KEY, dangerouslyAllowBrowser: true});
    const aiModel = 'gpt-4o-mini';
    
    let fullResponse = '';
    let extractedSentence: string | null = null;
    let extractedWords: any[] = [];
    let chunkCount = 0;

    const stream = await openai.chat.completions.create({
        model: aiModel,
        messages: [{
            role: 'system',
            content: 'you are a helpful assistant'
        }, {
            role: 'user',
            content: `${text} in ${language} <--- ${PROMPT_1}`
        }],
        stream: true
    });

    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        chunkCount++;
        
        // Try to extract sentence if we haven't found it yet
        const previousSentence = extractedSentence;
        if (!extractedSentence) {
            extractedSentence = extractSentence(fullResponse);
        }
        
        // Extract words
        const completeWords = extractCompleteWords(fullResponse);
        const partialWords = extractPartialWords(fullResponse);
        const newWords = mergeWords(partialWords, completeWords);

        // Yield if we have new sentence OR new words
        const hasNewSentence = extractedSentence && extractedSentence !== previousSentence;
        const hasNewWords = newWords.length > extractedWords.length;
        
        if (hasNewSentence || hasNewWords) {
            extractedWords = newWords;
            
            console.log('🔄 Yielding update:', {
                hasNewSentence,
                hasNewWords,
                sentence: extractedSentence,
                wordsCount: extractedWords.length
            });
            
            if (onPartialResult) {
                onPartialResult(extractedSentence, extractedWords);
            }
            
            yield {
                sentence: extractedSentence,
                words: extractedWords,
                isComplete: false,
                originalText: text,
                currentWordIndex: extractedWords.length - 1
            };
        }
    }
    try {
        const jsonRegex = /{(.|\n)*}/;
        const match = fullResponse.match(jsonRegex);
        
        if (match) {
            const cleanedJson = cleanJSON(match[0]);         
            const finalResult = JSON.parse(cleanedJson);
            
            yield {
                sentence: finalResult.sentence || extractedSentence,
                words: finalResult.words || extractedWords,
                isComplete: true,
                originalText: text,
                currentWordIndex: -1 // No current word when complete
            };
        } else {
            yield {
                sentence: extractedSentence,
                words: extractedWords,
                isComplete: true,
                originalText: text,
                currentWordIndex: -1
            };
        }
    } catch (error) {
        console.error('❌ Final JSON parsing failed:', error);

        yield {
            sentence: extractedSentence,
            words: extractedWords,
            isComplete: true,
            originalText: text,
            currentWordIndex: -1
        };
    }
};

// Original non-streaming function for backward compatibility
export const chatCompletion = async (data: { language: string, text: string}) => {
    const {language, text} = data

    // Validate user input
    const validation = validateUserInput(text, language);
    if (!validation.isValid) {
        throw new Error(validation.error);
    }
    
    const openai = new OpenAI({apiKey: API_KEY, dangerouslyAllowBrowser: true})
    const aiModel = 'gpt-4o-mini'
    const completion = await openai.chat.completions.create({
        model: aiModel,
        messages: [{role: 'system',content: 'you are a helpful assistant'},{role: 'user',content: `${text} in ${language} <--- ${PROMPT_1}`}]
    })
    let aiResponse = completion.choices[0].message.content
    console.log(aiResponse)
    
    try {
        const jsonRegex = /{(.|\n)*}/; 
        const match = aiResponse?.match(jsonRegex);
        if (match) {
            const cleanedJson = cleanJSON(match[0]);
            aiResponse = cleanedJson;
        } else {
            throw new Error('No valid JSON object found in response');
        }
        return aiResponse;
    } catch (error) {
        console.error('JSON parsing error:', error);
        throw new Error('Failed to parse AI response as JSON');
    }
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