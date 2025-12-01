import OpenAI from "openai"
import Cerebras from "@cerebras/cerebras_cloud_sdk"
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import { franc } from 'franc'

const googleKey = import.meta.env.VITE_GOOGLE_KEY
const API_KEY = import.meta.env.VITE_GPT_KEY
const PROMPT_1 = import.meta.env.VITE_PROMPT_1
const PROMPT_1_REVIEW = import.meta.env.VITE_PROMPT_1_REVIEW
const PROMPT_2 = import.meta.env.VITE_PROMPT_2
const PROMPT_3 = import.meta.env.VITE_PROMPT_3
const PROMPT_4 = import.meta.env.VITE_PROMPT_4
const LANGUAGE_KEY = import.meta.env.VITE_LANGUAGE_KEY

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

// Prefer non-partial words and merge details based on Finnish surface form
const normalizeSurface = (fi: string) => (fi || '').toLowerCase().trim();

const mergeRecords = (base: any, extra: any) => {
    const merged = { ...base };
    for (const key of ['en', 'en_base', 'type', 'original_word', 'pronunciation', 'comment']) {
        if ((merged[key] === undefined || merged[key] === '' || merged[key] === 'Loading...') && extra[key] !== undefined) {
            merged[key] = extra[key];
        }
    }
    // If either record is non-partial, mark final as non-partial
    if (base.isPartial === true && extra.isPartial !== true) merged.isPartial = false;
    if (!merged.original_word) merged.original_word = merged.fi;
    return merged;
};

const mergeWords = (partialWords: any[], completeWords: any[]): any[] => {
    const byFi: Record<string, any> = {};
    // Seed with complete words first
    for (const w of completeWords) {
        const key = normalizeSurface(w.fi);
        byFi[key] = mergeRecords({ ...w, isPartial: false }, {});
    }
    // Merge partials where we have no complete or to fill missing fields
    for (const p of partialWords) {
        const key = normalizeSurface(p.fi);
        if (!byFi[key]) {
            byFi[key] = { ...p };
        } else {
            byFi[key] = mergeRecords(byFi[key], p);
        }
    }
    return Object.values(byFi);
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

// Helper function to extract confidence score from response
const extractConfidence = (text: string): number | null => {
    // Look for confidence in various formats
    const patterns = [
        /"confidence"\s*:\s*(\d+)/i,
        /confidence[:\s]+(\d+)/i,
        /rated[:\s]+(\d+)%/i,
        /(\d+)%\s+confidence/i
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            const confidence = parseInt(match[1], 10);
            if (confidence >= 0 && confidence <= 100) {
                return confidence;
            }
        }
    }
    
    return null;
};

// Helper function to parse and extract translation result from API response
const parseTranslationResponse = (fullResponse: string, originalText: string) => {
    try {
        // Try to find the most complete JSON object in the response
        const jsonRegex = /{(.|\n)*}/;
        const match = fullResponse.match(jsonRegex);
        
        if (match) {
            const finalResult = progressiveJSONParse(match[0]);
            const finalWords = Array.isArray(finalResult.words) ? mergeWords([], finalResult.words) : [];
            const confidence = finalResult.confidence || extractConfidence(fullResponse);
            
            // Extract confidence details with concerns
            let confidenceDetails = null;
            if (finalResult.confidenceDetails) {
                confidenceDetails = {
                    accuracy: finalResult.confidenceDetails.accuracy,
                    completeness: finalResult.confidenceDetails.completeness,
                    naturalness: finalResult.confidenceDetails.naturalness,
                    grammar: finalResult.confidenceDetails.grammar,
                    concerns: Array.isArray(finalResult.confidenceDetails.concerns) 
                        ? finalResult.confidenceDetails.concerns 
                        : (Array.isArray(finalResult.concerns) ? finalResult.concerns : [])
                };
            } else if (finalResult.concerns && Array.isArray(finalResult.concerns)) {
                // If concerns are at top level, include them
                confidenceDetails = {
                    concerns: finalResult.concerns
                };
            }
            
            return {
                sentence: finalResult.sentence || null,
                words: finalWords,
                isComplete: true,
                originalText: originalText,
                currentWordIndex: -1,
                confidence: confidence,
                confidenceDetails: confidenceDetails
            };
        } else {
            // No JSON object found, try to extract what we can
            const extractedSentence = extractSentence(fullResponse);
            const completeWords = extractCompleteWords(fullResponse);
            const partialWords = extractPartialWords(fullResponse);
            const extractedWords = mergeWords(partialWords, completeWords);
            const confidence = extractConfidence(fullResponse);
            
            return {
                sentence: extractedSentence,
                words: extractedWords,
                isComplete: true,
                originalText: originalText,
                currentWordIndex: -1,
                confidence: confidence,
                confidenceDetails: null
            };
        }
    } catch (error) {
        console.error('❌ JSON parsing failed:', error);
        
        // Last resort: try to extract what we can
        const extractedSentence = extractSentence(fullResponse);
        const completeWords = extractCompleteWords(fullResponse);
        const partialWords = extractPartialWords(fullResponse);
        const extractedWords = mergeWords(partialWords, completeWords);
        const confidence = extractConfidence(fullResponse);
        
        return {
            sentence: extractedSentence,
            words: extractedWords,
            isComplete: true,
            originalText: originalText,
            currentWordIndex: -1,
            confidence: confidence,
            confidenceDetails: null
        };
    }
};

// Non-streaming chat completion with two-pass translation (initial + review)
export const chatCompletionStream = async function* (
    data: { language: string, text: string}
) {
    const {language, text} = data;

    // Validate user input
    const validation = validateUserInput(text, language);
    if (!validation.isValid) {
        throw new Error(validation.error);
    }
    
    const cerebras = new Cerebras({
        apiKey: LANGUAGE_KEY
    });
    const aiModel = 'gpt-oss-120b';

    // PASS 1: Initial translation
    const firstPassCompletion = await cerebras.chat.completions.create({
        model: aiModel,
        messages: [{
            role: 'system',
            content: 'you are a helpful assistant'
        }, {
            role: 'user',
            content: `Important: Translate the ENTIRE input (all sentences/paragraphs) into ${language}. Do not summarize, omit, or shorten. Return JSON where "sentence" contains the full translation string covering the whole input. For each word in the "words" array, include a "sentenceText" field that contains the specific part(s) of the English sentence that corresponds to this Finnish word (e.g., if the word is "perjantai-illalta", the sentenceText might be "on Friday evening"). This helps users understand which part of the translation corresponds to each word.\n\nINPUT:\n${text}\n\n<--- ${PROMPT_1}`
        }],
        stream: false
    });

    const firstPassResponse = (firstPassCompletion as any).choices[0].message.content || '';
    const firstPassResult = parseTranslationResponse(firstPassResponse, text);
    
    // If first pass failed to get a valid result, yield it and return
    if (!firstPassResult.sentence || firstPassResult.words.length === 0) {
        yield firstPassResult;
        return;
    }

    // PASS 2: Review and improve the translation
    try {
        const reviewPrompt = `ORIGINAL TEXT:\n${text}\n\nFIRST TRANSLATION RESULT:\n${JSON.stringify(firstPassResult, null, 2)}\n\nReview and improve the translation. Ensure each word in the "words" array has a "sentenceText" field that accurately identifies which part(s) of the English sentence corresponds to that Finnish word. The sentenceText should be the exact phrase or words from the "sentence" field that translate this specific word.\n\nIMPORTANT: After reviewing, provide a comprehensive confidence assessment:\n1. Include a "confidence" field (0-100) representing overall confidence in the translation.\n2. Include a "confidenceDetails" object with individual scores (0-100) for:\n   - "accuracy": How correct are the word choices? Are technical terms, idioms, and context-specific words translated accurately?\n   - "completeness": Is all content from the original translated? Nothing omitted or summarized?\n   - "naturalness": How natural does the English phrasing sound? Is it idiomatic and fluent?\n   - "grammar": Are there any grammatical errors? Is the sentence structure correct?\n3. Include a "concerns" array with specific, detailed explanations for why the confidence is not 100%. For each concern, explain:\n   - What specific aspect is uncertain or could be improved\n   - Why it affects the confidence score\n   - What the potential issue might be\n\nExample format:\n"confidence": 85,\n"confidenceDetails": {\n  "accuracy": 90,\n  "completeness": 85,\n  "naturalness": 80,\n  "grammar": 95\n},\n"concerns": [\n  "Some technical terms (e.g., 'lastensuojeluilmoitus') may need domain-specific verification as child protection terminology can vary by jurisdiction",\n  "The phrase 'viime lukukausi' could be more naturally rendered as 'last school year' but the exact academic period context might need clarification",\n  "The compound word 'flunssakierteiden' is translated but the medical/idiomatic nuance might be slightly different in English"\n]\n\nAlways provide detailed, specific concerns that explain what contributes to the missing percentage (100 - confidence).\n\n<--- ${PROMPT_1_REVIEW}`;
        
        const reviewCompletion = await cerebras.chat.completions.create({
            model: aiModel,
            messages: [{
                role: 'system',
                content: 'you are a helpful assistant'
            }, {
                role: 'user',
                content: reviewPrompt
            }],
            stream: false
        });

        const reviewResponse = (reviewCompletion as any).choices[0].message.content || '';
        const reviewedResult = parseTranslationResponse(reviewResponse, text);
        
        // If review pass produced a valid result, use it; otherwise fall back to first pass
        if (reviewedResult.sentence && reviewedResult.words.length > 0) {
            // Ensure confidence is included (from review or fallback to first pass)
            reviewedResult.confidence = reviewedResult.confidence ?? firstPassResult.confidence ?? null;
            yield reviewedResult;
        } else {
            console.warn('Review pass failed, using first pass result');
            yield firstPassResult;
        }
    } catch (reviewError) {
        console.error('Review pass error:', reviewError);
        // If review fails, yield the first pass result
        yield firstPassResult;
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
    
    const cerebras = new Cerebras({
        apiKey: LANGUAGE_KEY
    });
    const aiModel = 'gpt-oss-120b';
    const completion = await cerebras.chat.completions.create({
        model: aiModel,
        messages: [
            { role: 'system', content: 'you are a helpful assistant' },
            { role: 'user', content: `Important: Translate the ENTIRE input (all sentences/paragraphs) into ${language}. Do not summarize, omit, or shorten. Return JSON where "sentence" contains the full translation string covering the whole input.\n\nINPUT:\n${text}\n\n<--- ${PROMPT_1}` }
        ],
        stream: false
    })
    let aiResponse = (completion as any).choices[0].message.content
    
    try {
        const jsonRegex = /{(.|\n)*}/; 
        const match = aiResponse?.match(jsonRegex);
        if (match) {
            const finalResult = progressiveJSONParse(match[0]);
            
            // Try to parse the result to validate it
            try {
                // If progressiveJSONParse returns a valid object, use it
                if (finalResult && typeof finalResult === 'object') {
                    aiResponse = JSON.stringify(finalResult);
                } else {
                    throw new Error('Invalid result from progressive parsing');
                }
            } catch (parseError) {
                console.warn('Failed to parse result in non-streaming function:', parseError);
                // If parsing fails, try to return a minimal valid JSON
                aiResponse = JSON.stringify({
                    sentence: "Translation failed",
                    words: []
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
            words: []
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
    const cerebras = new Cerebras({
        apiKey: LANGUAGE_KEY
    });
    const aiModel = 'gpt-oss-120b'
    const completion = await cerebras.chat.completions.create({
        model: aiModel,
        messages: [{role: 'system',content: 'you are a helpful assistant'},{role: 'user',content: `${jsonString} <--- ${PROMPT_4}`}],
        stream: false
    })
    let aiResponse = (completion as any).choices[0].message.content
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