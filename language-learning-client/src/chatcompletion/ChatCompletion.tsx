import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import { franc } from 'franc'

const googleKey = import.meta.env.VITE_GOOGLE_KEY
const API_KEY = import.meta.env.VITE_GPT_KEY
const PROMPT_1 = import.meta.env.VITE_PROMPT_1
const PROMPT_2 = import.meta.env.VITE_PROMPT_2
const PROMPT_3 = import.meta.env.VITE_PROMPT_3
const PROMPT_4 = import.meta.env.VITE_PROMPT_4
const PROMPT_LEARNING_MODE = import.meta.env.VITE_PROMPT_LEARNING_MODE
const FIX_LEARNING_MODE_1 = import.meta.env.VITE_FIX_LEARNING_MODE_1
const FIX_LEARNING_MODE_2 = import.meta.env.VITE_FIX_LEARNING_MODE_2

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

const progressiveJSONParse = (jsonStr: string): any => {
    if (!jsonStr || typeof jsonStr !== 'string') {
        return {};
    }

    // Try to find the longest valid JSON prefix
    let validLength = 0;
    let result = {};
    
    // Start from the full string and work backwards
    for (let i = jsonStr.length; i > 0; i--) {
        try {
            const partial = jsonStr.substring(0, i);
            result = JSON.parse(partial);
            validLength = i;
            break;
        } catch (e) {
            // Continue trying shorter prefixes
            continue;
        }
    }
    
    if (validLength === 0) {
        // If no valid JSON found, try to extract what we can
        return extractPartialData(jsonStr);
    }
    
    return result;
};

const extractPartialData = (text: string): any => {
    const result: any = {};
    
    // Try to extract sentence
    const sentence = extractSentence(text);
    if (sentence) {
        result.sentence = sentence;
    }
    
    // Try to extract words
    const words = extractCompleteWords(text);
    if (words.length > 0) {
        result.words = words;
    }
    
    return result;
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
                const cleanedMatch = progressiveJSONParse(match[0]);
                const wordObj = cleanedMatch;
                
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

// Learning mode processing pipeline
const processLearningModeStep1 = async (initialData: any): Promise<any> => {
    const openai = new OpenAI({apiKey: API_KEY, dangerouslyAllowBrowser: true});
    const aiModel = 'gpt-4o-mini';
    
    const completion = await openai.chat.completions.create({
        model: aiModel,
        messages: [{
            role: 'system',
            content: 'you are a helpful assistant'
        }, {
            role: 'user',
            content: `${JSON.stringify(initialData)} <--- ${FIX_LEARNING_MODE_1}`
        }]
    });
    
    let aiResponse = completion.choices[0].message.content;
    const jsonRegex = /{(.|\n)*}/;
    const match = aiResponse?.match(jsonRegex);
    
    if (match) {
        return progressiveJSONParse(match[0]);
    } else {
        throw new Error('No valid JSON object found in FIX_LEARNING_MODE_1 response');
    }
};

const processLearningModeStep2 = async (step1Data: any): Promise<any> => {
    const openai = new OpenAI({apiKey: API_KEY, dangerouslyAllowBrowser: true});
    const aiModel = 'gpt-4o-mini';
    
    const completion = await openai.chat.completions.create({
        model: aiModel,
        messages: [{
            role: 'system',
            content: 'you are a helpful assistant'
        }, {
            role: 'user',
            content: `${JSON.stringify(step1Data)} <--- ${FIX_LEARNING_MODE_2}`
        }]
    });
    
    let aiResponse = completion.choices[0].message.content;
    const jsonRegex = /{(.|\n)*}/;
    const match = aiResponse?.match(jsonRegex);
    
    if (match) {
        const result = progressiveJSONParse(match[0]);
        
        // If step 2 has autofixed data, use that; otherwise use step1Data
        if (result.autofixed) {
            return { ...result.autofixed, details: true };
        } else {
            return { ...step1Data, details: true };
        }
    } else {
        // If no valid response, return step1Data with details flag
        return { ...step1Data, details: true };
    }
};

const runLearningModePipeline = async (language: string, text: string, onProgress?: (step: number) => void): Promise<any> => {
    const openai = new OpenAI({apiKey: API_KEY, dangerouslyAllowBrowser: true});
    const aiModel = 'gpt-4o-mini';
    
    // Step 1: Initial learning mode processing
    onProgress?.(0);
    const completion = await openai.chat.completions.create({
        model: aiModel,
        messages: [{
            role: 'system',
            content: 'you are a helpful assistant'
        }, {
            role: 'user',
            content: `${text} in ${language} <--- ${PROMPT_LEARNING_MODE}`
        }]
    });
    
    let aiResponse = completion.choices[0].message.content;
    const jsonRegex = /{(.|\n)*}/;
    const match = aiResponse?.match(jsonRegex);
    
    if (!match) {
        throw new Error('No valid JSON object found in PROMPT_LEARNING_MODE response');
    }
    
    const initialData = progressiveJSONParse(match[0]);
    
    // Step 2: Fix and refine the data
    onProgress?.(1);
    const step1Data = await processLearningModeStep1(initialData);
    
    // Step 3: Final validation and auto-fixing
    onProgress?.(2);
    const finalData = await processLearningModeStep2(step1Data);
    
    // Don't modify the sentence - render as-is from the AI response
    // The sentence should be whatever the AI returns, not re-translated
    
    return finalData;
};

// Streaming chat completion with progressive results
export const chatCompletionStream = async function* (
    data: { language: string, text: string, learningMode?: boolean},
    onPartialResult?: (sentence: string | null, words: any[]) => void
) {
    const {language, text, learningMode = false} = data;

    // Validate user input
    const validation = validateUserInput(text, language);
    if (!validation.isValid) {
        throw new Error(validation.error);
    }
    
    // If learning mode is requested, use the learning mode pipeline (non-streaming)
    if (learningMode) {
        try {
            const learningResult = await runLearningModePipeline(language, text, (step: number) => {
                // Progress callback - this would need to be passed from the hook
                // For now, we'll handle this in the hook level
            });
            
            // Yield the complete result immediately for learning mode
            yield {
                sentence: learningResult.sentence,
                words: learningResult.words || [],
                isComplete: true,
                originalText: text,
                currentWordIndex: -1
            };
            return;
        } catch (error) {
            console.error('Learning mode pipeline failed in streaming:', error);
            // Fall back to regular streaming mode
        }
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
        // Try to find the most complete JSON object in the response
        const jsonRegex = /{(.|\n)*}/;
        const match = fullResponse.match(jsonRegex);
        
        if (match) {
            const finalResult = progressiveJSONParse(match[0]);
            
            yield {
                sentence: finalResult.sentence || extractedSentence,
                words: finalResult.words || extractedWords,
                isComplete: true,
                originalText: text,
                currentWordIndex: -1 // No current word when complete
            };
        } else {
            // No JSON object found, use extracted data
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

        // Last resort: return whatever we extracted during streaming
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
export const chatCompletion = async (data: { language: string, text: string, learningMode?: boolean, existingData?: any }) => {
    const {language, text, learningMode = false, existingData} = data

    // Validate user input
    const validation = validateUserInput(text, language);
    if (!validation.isValid) {
        throw new Error(validation.error);
    }
    
    // If learning mode is requested and we have existing data without details, run learning mode pipeline
    if (learningMode && existingData && !existingData.details) {
        try {
            const learningResult = await runLearningModePipeline(language, text);
            return JSON.stringify(learningResult);
        } catch (error) {
            console.error('Learning mode pipeline failed:', error);
            // Fall back to regular mode
        }
    }
    
    // If learning mode is requested but no existing data, run learning mode pipeline
    if (learningMode && !existingData) {
        try {
            const learningResult = await runLearningModePipeline(language, text);
            return JSON.stringify(learningResult);
        } catch (error) {
            console.error('Learning mode pipeline failed:', error);
            // Fall back to regular mode
        }
    }
    
    // Regular mode (default)
    const openai = new OpenAI({apiKey: API_KEY, dangerouslyAllowBrowser: true})
    const aiModel = 'gpt-4o-mini'
    const completion = await openai.chat.completions.create({
        model: aiModel,
        messages: [{role: 'system',content: 'you are a helpful assistant'},{role: 'user',content: `${text} in ${language} <--- ${PROMPT_1}`}]
    })
    let aiResponse = completion.choices[0].message.content
    
    try {
        const jsonRegex = /{(.|\n)*}/; 
        const match = aiResponse?.match(jsonRegex);
        if (match) {
            const finalResult = progressiveJSONParse(match[0]);
            
            // Try to parse the result to validate it
            try {
                // If progressiveJSONParse returns a valid object, use it
                if (finalResult && typeof finalResult === 'object') {
                    // Add details: false for regular mode
                    const resultWithDetails = { ...finalResult, details: false };
                    aiResponse = JSON.stringify(resultWithDetails);
                } else {
                    throw new Error('Invalid result from progressive parsing');
                }
            } catch (parseError) {
                console.warn('Failed to parse result in non-streaming function:', parseError);
                // If parsing fails, try to return a minimal valid JSON
                aiResponse = JSON.stringify({
                    sentence: "Translation failed",
                    words: [],
                    details: false
                });
            }
        } else {
            throw new Error('No valid JSON object found in response');
        }
        return aiResponse;
    } catch (error) {
        console.error('JSON parsing error:', error);
        // Return a minimal valid JSON instead of throwing
        return JSON.stringify({
            sentence: "Translation failed",
            words: [],
            details: false
        });
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
