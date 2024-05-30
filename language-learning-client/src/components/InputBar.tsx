import { useState, useEffect } from "react";

interface InputBarProps {
    inputText: string;
    setInputText: (text: string) => void;
    handleTranslation: () => void;
    ready: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ inputText, setInputText, handleTranslation, ready }) => {
    const [countdown, setCountdown] = useState(60);

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

    return (
        <div className="mt-5 w-[830px] gap-x-4">
            <div className="w-full">
                <textarea   rows={5}
                            className="placeholder:italic appearance-noneplaceholder:italic appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                            value={inputText}
                            onChange={handleInputChange}
                            placeholder={ready ? "Type in your sentence here. Note: A sentence is better for us to handle." :  "Approximately wait time is 60 seconds. Please be patient. It's gonna worth the wait. So basically the words will appear below, when the 'Loading' button is not 'Loading' anymore. Pss: I'm making this long so that you have something to do while waiting. Enjoyyyy"}
                            disabled={!ready}
                            data-testid="input-bar"
                />
            </div>
            <div className="flex justify-between w-full">
                <div className="md:flex md:items-center"></div>
                {ready ? (
                    <button onClick={handleTranslation} className="shadow bg-indigo-600 hover:bg-indigo-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-6 rounded" type="submit">
                        Translate
                    </button>
                ) : (
                    <div className="flex justify-between w-full items-center">
                        <span>
                            It will take approximately {countdown} seconds for us to translate.
                        </span> 
                        <button type="button" className="inline-flex items-center shadow bg-indigo-600 hover:bg-indigo-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-6 rounded disabled:opacity-50 disabled:pointer-events-none" disabled>
                            <span className="mr-2 animate-spin inline-block size-4 border-[3px] border-current border-t-transparent text-white rounded-full" role="status" aria-label="loading"></span>
                            Loading
                        </button>                    
                    </div>
                )}
            </div>
        </div>
    );
};
