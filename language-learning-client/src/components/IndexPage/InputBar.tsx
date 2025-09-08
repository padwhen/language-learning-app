import { textToSpeech } from "@/chatcompletion/ChatCompletion";
import { useState, useEffect } from "react";
import { Volume2, Send, Loader2, Sparkles } from "lucide-react";

interface WordTiming {
    word: string;
    start: number;
    end: number;
}

interface InputBarProps {
    inputText: string;
    setInputText: (text: string) => void;
    handleTranslation: () => void;
    ready: boolean;
    highlighted?: boolean;
    isStreaming?: boolean;
    currentWords?: any[];
    currentWordIndex?: number;
}

const cleanWord = (word: string) => {
    return word.toLowerCase().replace(/[.,!?;:"'()]/g, '')
}

// Helper function to highlight the current word being analyzed
const highlightCurrentWord = (text: string, words: any[], currentIndex: number) => {
    if (!words || words.length === 0 || currentIndex < 0) {
        return <span>{text}</span>;
    }

    const currentWord = words[currentIndex];
    if (!currentWord?.en) { 
        return <span>{text}</span>;
    }

    const segments = text.split(/(\s+|[.,!?;:"'()])/); // Keep spaces and punctuation
    const highlightedElements: JSX.Element[] = [];
    
    segments.forEach((segment, index) => {
        if (segment.trim() && !/^[.,!?;:"'()]+$/.test(segment)) {
            const cleanSegment = cleanWord(segment);
            const cleanCurrentWord = cleanWord(currentWord.en); // use current analyzed word (en)
            
            // Check if this segment matches the current word being analyzed
            const isCurrentWord = cleanSegment === cleanCurrentWord || 
                                  cleanSegment.includes(cleanCurrentWord) ||
                                  cleanCurrentWord.includes(cleanSegment);
            
            if (isCurrentWord) {
                highlightedElements.push(
                    <span 
                        key={index}
                        className="bg-red-200 px-2 py-1 rounded-md animate-pulse border-2 border-red-400 text-red-800 font-semibold shadow-sm"
                    >
                        {segment}
                    </span>
                );
            } else {
                // Check if this word was already analyzed (before current)
                const wasAnalyzed = words.slice(0, currentIndex).some(w => {
                    const cleanAnalyzedWord = w.en.toLowerCase().replace(/[.,!?;:"'()]/g, ''); // Using en field
                    return cleanSegment === cleanAnalyzedWord || 
                           cleanSegment.includes(cleanAnalyzedWord) ||
                           cleanAnalyzedWord.includes(cleanSegment);
                });
                
                if (wasAnalyzed) {
                    highlightedElements.push(
                        <span key={index} className="bg-green-100 px-1 py-0.5 rounded text-green-700 border border-green-200">
                            {segment}
                        </span>
                    );
                } else {
                    highlightedElements.push(<span key={index}>{segment}</span>);
                }
            }
        } else {
            // This is whitespace or punctuation
            highlightedElements.push(<span key={index}>{segment}</span>);
        }
    });

    return <>{highlightedElements}</>;
};

// Helper function to highlight text during speech
const highlightTextForSpeech = (text: string, currentWordIndex: number) => {
    if (currentWordIndex < 0) {
        return <span>{text}</span>;
    }

    const words = text.split(/(\s+)/); // Keep spaces
    const highlightedElements: JSX.Element[] = [];
    
    let wordCount = 0;
    words.forEach((segment, index) => {
        if (segment.trim()) {
            // This is a word
            const isCurrentWord = wordCount === currentWordIndex;
            
            if (isCurrentWord) {
                highlightedElements.push(
                    <span 
                        key={index}
                        className="bg-blue-300 px-2 py-1 rounded-md animate-pulse border-2 border-blue-500 text-blue-900 font-semibold shadow-sm"
                    >
                        {segment}
                    </span>
                );
            } else if (wordCount < currentWordIndex) {
                // Already spoken
                highlightedElements.push(
                    <span key={index} className="bg-gray-200 px-1 py-0.5 rounded text-gray-600">
                        {segment}
                    </span>
                );
            } else {
                // Not yet spoken
                highlightedElements.push(<span key={index} className="text-gray-800">{segment}</span>);
            }
            wordCount++;
        } else {
            // This is whitespace
            highlightedElements.push(<span key={index}>{segment}</span>);
        }
    });

    return <>{highlightedElements}</>;
};

export const InputBar: React.FC<InputBarProps> = ({ 
    inputText, 
    setInputText, 
    handleTranslation, 
    ready, 
    highlighted,
    isStreaming = false,
    currentWords = [],
    currentWordIndex = -1
}) => {
    const [countdown, setCountdown] = useState(60);
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [loadingTTS, setLoadingTTS] = useState(false)
    const [isFocused, setIsFocused] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSpeechWordIndex, setCurrentSpeechWordIndex] = useState(-1);

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
            // Generate TTS audio
            const url = await textToSpeech(inputText)
            setAudioUrl(url)
            
            // Get word timestamps using Whisper (more accurate approach)
            const wordTimings = await getWordTimingsFromAudio(url, inputText);
            
            if (wordTimings && wordTimings.length > 0) {
                // Play audio with accurate word highlighting
                const audio = new Audio(url);
                
                audio.onloadeddata = () => {
                    setIsPlaying(true);
                    setCurrentSpeechWordIndex(0);
                                        
                    // Use actual word timings from Whisper
                    wordTimings.forEach((timing: WordTiming, index: number) => {
                        setTimeout(() => {
                            setCurrentSpeechWordIndex(index);
                        }, timing.start * 1000);
                    });
                    
                    // Reset when audio ends
                    setTimeout(() => {
                        setIsPlaying(false);
                        setCurrentSpeechWordIndex(-1);
                    }, audio.duration * 1000);
                };
                
                audio.onended = () => {
                    setIsPlaying(false);
                    setCurrentSpeechWordIndex(-1);
                };
                
                audio.play();
            } else {
                // Fallback to estimated timing if Whisper fails
                await playWithEstimatedTiming(url);
            }
            
        } catch (error) {
            console.error('Error generating speech:', error)
            setIsPlaying(false);
            setCurrentSpeechWordIndex(-1);
        } finally {
            setLoadingTTS(false)
        }
    }

    // Fallback function for estimated timing
    const playWithEstimatedTiming = async (url: string) => {
        const audio = new Audio(url);
        
        audio.onloadeddata = () => {
            setIsPlaying(true);
            setCurrentSpeechWordIndex(0);
            
            const words = inputText.trim().split(/\s+/);
            const totalDuration = audio.duration;
            const timePerWord = totalDuration / words.length;
            
            words.forEach((_, index) => {
                setTimeout(() => {
                    setCurrentSpeechWordIndex(index);
                }, index * timePerWord * 1000);
            });
            
            setTimeout(() => {
                setIsPlaying(false);
                setCurrentSpeechWordIndex(-1);
            }, totalDuration * 1000);
        };
        
        audio.play();
    }

    // Function to get word timings using Whisper API
    const getWordTimingsFromAudio = async (audioUrl: string, originalText: string): Promise<WordTiming[] | null> => {
        try {
            // Convert audio URL to File object for Whisper
            const response = await fetch(audioUrl);
            const audioBlob = await response.blob();
            const audioFile = new File([audioBlob], 'speech.mp3', { type: 'audio/mp3' });
            
            // Call Whisper API for word-level timestamps
            const formData = new FormData();
            formData.append('file', audioFile);
            formData.append('model', 'whisper-1');
            formData.append('response_format', 'verbose_json');
            formData.append('timestamp_granularities[]', 'word');
            
            const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_GPT_KEY}`,
                },
                body: formData
            });
            
            if (!whisperResponse.ok) {
                throw new Error('Whisper API failed');
            }
            
            const result = await whisperResponse.json();
            
            return result.words; // Returns array of {word, start, end}
            
        } catch (error) {
            console.error('Error getting word timings from Whisper:', error);
            return null; // Fallback to estimated timing
        }
    }

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

            {/* Highlighted text display during streaming */}
            {isStreaming && inputText && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                        <span className="text-sm font-medium text-blue-700">Analyzing:</span>
                    </div>
                    <div className="text-base text-gray-800 leading-relaxed">
                        {highlightCurrentWord(inputText, currentWords, currentWordIndex)}
                    </div>
                    {currentWordIndex >= 0 && currentWords[currentWordIndex] && (
                        <div className="mt-2 text-xs text-blue-600">
                            Current: <strong>{currentWords[currentWordIndex].en}</strong> → {currentWords[currentWordIndex].fi}
                        </div>
                    )}
                </div>
            )}

            {/* Speech highlighting display during playback */}
            {isPlaying && inputText && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="animate-pulse rounded-full h-3 w-3 bg-green-600"></div>
                        <span className="text-sm font-medium text-green-700">Speaking:</span>
                    </div>
                    <div className="text-base text-gray-800 leading-relaxed">
                        {highlightTextForSpeech(inputText, currentSpeechWordIndex)}
                    </div>
                    <div className="mt-2 text-xs text-green-600">
                        🔊 Listen and follow along
                    </div>
                </div>
            )}

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
                            disabled={loadingTTS || !inputText || isPlaying}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {loadingTTS ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : isPlaying ? (
                                    <div className="animate-pulse rounded-full h-4 w-4 bg-white"></div>
                                ) : (
                                    <Volume2 className="w-4 h-4" />
                                )}
                                {loadingTTS ? "Generating..." : isPlaying ? "Playing..." : "Speak"}
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
