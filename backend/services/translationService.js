const Cerebras = require('@cerebras/cerebras_cloud_sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const francModule = require('franc');
const franc = francModule.franc;

// Load environment variables
const LANGUAGE_KEY = process.env.VITE_LANGUAGE_KEY;
const GOOGLE_KEY = process.env.VITE_GOOGLE_KEY;
const PROMPT_1 = process.env.VITE_PROMPT_1;
const PROMPT_1_REVIEW = process.env.VITE_PROMPT_1_REVIEW;
const PROMPT_2 = process.env.VITE_PROMPT_2;
const PROMPT_3 = process.env.VITE_PROMPT_3;
const PROMPT_4 = process.env.VITE_PROMPT_4;

// Simple validation function for supported languages
const validateUserInput = (text, selectedLanguage) => {
    // Check if input is too short
    if (!text || text.trim().length < 3) {
        return {
            isValid: false,
            error: 'Your input is too short'
        };
    }

    // Language mapping for our 5 supported languages
    const languageMap = {
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

const progressiveJSONParse = (jsonStr) => {
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

const extractPartialData = (text) => {
    const result = {};
    
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

const extractCompleteWords = (text) => {
    const words = [];
    
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

const extractPartialWords = (text) => {
    const words = [];
    
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
const normalizeSurface = (fi) => (fi || '').toLowerCase().trim();

const mergeRecords = (base, extra) => {
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

const mergeWords = (partialWords, completeWords) => {
    const byFi = {};
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
const extractSentence = (text) => {
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
const extractConfidence = (text) => {
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
const parseTranslationResponse = (fullResponse, originalText) => {
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

/**
 * Main translation function with two-pass approach (initial + review)
 * @param {string} language - Target language for translation
 * @param {string} text - Text to translate
 * @returns {Promise<Object>} Translation result with sentence, words, confidence, etc.
 */
const translateText = async (language, text) => {
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

    const firstPassResponse = firstPassCompletion.choices[0].message.content || '';
    const firstPassResult = parseTranslationResponse(firstPassResponse, text);
    
    // If first pass failed to get a valid result, return it
    if (!firstPassResult.sentence || firstPassResult.words.length === 0) {
        return firstPassResult;
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

        const reviewResponse = reviewCompletion.choices[0].message.content || '';
        const reviewedResult = parseTranslationResponse(reviewResponse, text);
        
        // If review pass produced a valid result, use it; otherwise fall back to first pass
        if (reviewedResult.sentence && reviewedResult.words.length > 0) {
            // Ensure confidence is included (from review or fallback to first pass)
            reviewedResult.confidence = reviewedResult.confidence ?? firstPassResult.confidence ?? null;
            return reviewedResult;
        } else {
            console.warn('Review pass failed, using first pass result');
            return firstPassResult;
        }
    } catch (reviewError) {
        console.error('Review pass error:', reviewError);
        // If review fails, return the first pass result
        return firstPassResult;
    }
};

/**
 * Simple translation without review pass (for backward compatibility)
 */
const translateTextSimple = async (language, text) => {
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
    });
    
    let aiResponse = completion.choices[0].message.content;
    
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
};

/**
 * Vocabulary tailoring using Google Gemini
 */
const vocabulariesTailor = async (cards) => {
    const genAI = new GoogleGenerativeAI(GOOGLE_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `${cards} <-- ${PROMPT_2}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    const jsonArrayRegex = /\[.*\]/s;
    const match = text?.match(jsonArrayRegex);
    if (match) {
        text = match[0].trim();
    }
    return text;
};

/**
 * Test word lookup using Google Gemini
 */
const test = async (word) => {
    const genAI = new GoogleGenerativeAI(GOOGLE_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const url = `https://www.sanakirja.fi/finnish-english/${word}`;
    const prompt = `${url} ${PROMPT_3}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    const jsonRegex = /{(.|\n)*}/; 
    const match = text?.match(jsonRegex);
    if (match) {
        text = match[0].trim();
    }
    return text;
};

/**
 * Create test using Cerebras
 */
const createTest = async (data) => {
    const jsonString = JSON.stringify(data);
    const cerebras = new Cerebras({
        apiKey: LANGUAGE_KEY
    });
    const aiModel = 'gpt-oss-120b';
    const completion = await cerebras.chat.completions.create({
        model: aiModel,
        messages: [
            { role: 'system', content: 'you are a helpful assistant' },
            { role: 'user', content: `${jsonString} <--- ${PROMPT_4}` }
        ],
        stream: false
    });
    let aiResponse = completion.choices[0].message.content;
    const jsonRegex = /{(.|\n)*}/; 
    const match = aiResponse?.match(jsonRegex);
    if (match) {
        aiResponse = match[0].trim(); // Use the matched JSON string and trim whitespace
    } else {
        throw new Error('No valid JSON object found in response');
    }
    return aiResponse;
};

module.exports = {
    translateText,
    translateTextSimple,
    vocabulariesTailor,
    test,
    createTest
};

