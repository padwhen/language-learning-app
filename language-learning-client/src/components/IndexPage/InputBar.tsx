import { textToSpeech } from "@/chatcompletion/ChatCompletion";
import { useState, useEffect } from "react";

interface InputBarProps {
    inputText: string;
    setInputText: (text: string) => void;
    handleTranslation: () => void;
    ready: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ inputText, setInputText, handleTranslation, ready }) => {
    const [countdown, setCountdown] = useState(60);
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [loadingTTS, setLoadingTTS] = useState(false)

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

    return (
        <div className="mt-5 w-full max-w-3xl px-4">
            <div className="w-full">
                <textarea   rows={6}
                            className="placeholder:italic appearance-none block w-full text-base sm:text-lg text-gray-700 border border-gray-200 rounded py-4 px-4 mb-3 leading-relaxed focus:outline-none focus:bg-white focus:border-gray-500"
                            value={inputText}
                            onChange={handleInputChange}
                            placeholder={ready ? "Type in your sentence here. Note: A sentence is better for us to handle." :  "Approximately wait time is 60 seconds. Please be patient. It's gonna worth the wait. So basically the words will appear below, when the 'Loading' button is not 'Loading' anymore. Pss: I'm making this long so that you have something to do while waiting. Enjoyyyy"}
                            disabled={!ready}
                            data-testid="input-bar"
                />
            </div>
            <div className="flex flex-col sm:flex-row justify-between w-full items-center">
                {ready ? (
                    <>
                        <button onClick={handleTranslation} className="w-full sm:w-auto shadow bg-indigo-600 hover:bg-indigo-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-6 rounded mt-2 sm:mt-0" type="submit">
                            Translate
                        </button>      
                        <button onClick={handleSpeak} className="w-full sm:w-auto shadow bg-indigo-600 hover:bg-indigo-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-6 rounded mt-2 sm:mt-0" type="button" disabled={loadingTTS}>
                            {loadingTTS ? "Speaking..." : "Speak"}
                        </button>              
                    </>

                ) : (
                    <div className="flex flex-col sm:flex-row justify-between w-full items-center mt-2 sm:mt-0">
                        <span className="mb-2 sm:mb-0 sm:mr-4 text-center sm:text-left">
                            It will take approximately {countdown} seconds for us to translate.
                        </span> 
                        <button type="button" className="w-full sm:w-auto inline-flex items-center shadow bg-indigo-600 hover:bg-indigo-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-6 rounded disabled:opacity-50 disabled:pointer-events-none" disabled>
                            <span className="mr-2 animate-spin inline-block size-4 border-[3px] border-current border-t-transparent text-white rounded-full" role="status" aria-label="loading"></span>
                            Loading
                        </button>                    
                    </div>
                )}
            </div>
        </div>
    );
};
