import { test } from "@/ChatCompletion";

export const getDictionarySuggestion = async (userLangCard: string): Promise<string> => {
    try {
        const response = await test(userLangCard);
        if (typeof response === 'string') {
            const response_json = JSON.parse(response);
            return response_json.english_translation
        } else {
            console.error('Unexpected response format from test function');
            return ''
        }
    } catch (error) {
        return ''
    } 
}