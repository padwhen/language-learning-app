import { textToSpeech } from "@/chatcompletion/ChatCompletion";
import { useState, useEffect } from "react";
import { Volume2, Send, Loader2, Sparkles } from "lucide-react";

interface InputBarProps {
    inputText: string;
    setInputText: (text: string) => void;
    handleTranslation: () => void;
    ready: boolean;
    highlighted?: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ inputText, setInputText, handleTranslation, ready, highlighted }) => {
    const [countdown, setCountdown] = useState(60);
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [loadingTTS, setLoadingTTS] = useState(false)
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (!ready) {
            timer = setInterval(() => {
                setCountdown(prevCountdown => prevCountdown - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [!ready]);

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(event.target.value);
    }

    const handleSpeak = async () => {
        if (!inputText) return
        setLoadingTTS(true)
        try {
            const url = await textToSpeech(inputText)
            setAudioUrl(url)
        } catch (error) {
            console.error('Error generating speech:', error)
        } finally {
            setLoadingTTS(false)
        }
    }

    useEffect(() => {
        if (audioUrl) {
            const audio = new Audio(audioUrl)
            audio.play()
        }
    }, [audioUrl])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && ready) {
            event.preventDefault();
            handleTranslation();
        }
    }

    return (
        <div className={`mt-0 w-full px-0 transition-all duration-300 ${highlighted ? 'ring-4 ring-blue-500 ring-opacity-75 bg-blue-50 rounded-lg p-4 shadow-lg' : ''}`}>
            {/* Header with icon and title */}
            <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Enter Your Text</h3>
                    <p className="text-sm text-gray-500">Type or paste text for translation</p>
                </div>
            </div>

            {/* Modern textarea container */}
            <div className={`relative group transition-all duration-300 ${isFocused ? 'transform scale-[1.01]' : ''}`}>
                <div className={`relative rounded-2xl border-2 transition-all duration-300 ${
                    isFocused 
                        ? 'border-blue-500 shadow-lg shadow-blue-500/20 bg-white' 
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                } ${!ready ? 'opacity-75' : ''}`}>
                    
                    {/* Gradient border effect when focused */}
                    {isFocused && (
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl opacity-20 blur-sm"></div>
                    )}
                    
                    <textarea 
                        rows={6}
                        className={`relative w-full text-base sm:text-lg text-gray-700 bg-transparent rounded-2xl py-6 px-6 leading-relaxed placeholder:text-gray-400 placeholder:italic resize-none transition-all duration-300 focus:outline-none ${
                            !ready ? 'cursor-not-allowed' : ''
                        }`}
                        value={inputText}
                        onChange={handleInputChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={handleKeyDown}
                        placeholder={ready ? "Type your sentence here... ✨\n\nTip: Complete sentences work best for accurate translations!" : "Please wait while we prepare the translation service...\n\nThis usually takes about 60 seconds. Thanks for your patience! 🙏"}
                        disabled={!ready}
                        data-testid="input-bar"
                    />
                    
                    {/* Character count and keyboard shortcut hint */}
                    <div className="absolute bottom-3 right-4 flex items-center gap-3">
                        {inputText && (
                            <span className="text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-full">
                                {inputText.length} chars
                            </span>
                        )}
                        {ready && (
                            <span className="text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-full hidden sm:block">
                                ⌘+Enter to translate
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-between w-full items-center mt-6">
                {ready ? (
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button 
                            onClick={handleTranslation} 
                            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                            type="submit"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Send className="w-4 h-4" />
                                Translate
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        </button>      
                        
                        <button 
                            onClick={handleSpeak} 
                            className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
                            type="button" 
                            disabled={loadingTTS || !inputText}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {loadingTTS ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Volume2 className="w-4 h-4" />
                                )}
                                {loadingTTS ? "Speaking..." : "Speak"}
                            </span>
                            {!loadingTTS && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            )}
                        </button>              
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row justify-between w-full items-center">
                        <div className="flex items-center gap-3 mb-4 sm:mb-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                            </div>
                            <div>
                                <p className="text-gray-700 font-medium">Preparing translation service...</p>
                                <p className="text-sm text-gray-500">Approximately {countdown} seconds remaining</p>
                            </div>
                        </div>
                        
                        <button 
                            type="button" 
                            className="bg-gray-300 text-gray-500 font-semibold py-3 px-8 rounded-xl cursor-not-allowed opacity-75 flex items-center gap-2"
                            disabled
                        >
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading...
                        </button>                    
                    </div>
                )}
            </div>
        </div>
    );
};
