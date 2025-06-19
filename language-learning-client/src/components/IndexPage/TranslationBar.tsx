import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import React from 'react';

export const TranslationBar: React.FC<{
    fromLanguage: string;
    setFromLanguage: (language: string) => void;
    highlighted?: boolean;
}> = ({ fromLanguage, setFromLanguage, highlighted }) => {
    const languages = ['Finnish', 'Korean', 'Chinese', 'Vietnamese', 'Greek'];
    const handleLanguageChange = (language: string) => {
        setFromLanguage(language);
    }
    return (
        <div className={`flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 lg:gap-8 w-full mt-4 mb-2 p-2 rounded-lg transition-all duration-300 ${highlighted ? 'ring-4 ring-blue-500 ring-opacity-75 bg-blue-50 shadow-lg' : ''}`}>
            <div className="relative inline-flex w-full md:flex-1">
                <div className="w-full">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full py-2 px-3 lg:py-3 lg:px-4 border border-gray-300 rounded-lg bg-white text-gray-800 font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <div className="text-lg lg:text-xl">{fromLanguage}</div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                            <DropdownMenuRadioGroup>
                                {languages.map(language => (
                                    language !== fromLanguage && (
                                        <DropdownMenuRadioItem onClick={() => handleLanguageChange(language)} key={language} value={language}>
                                            <div className="text-base lg:text-lg">{language}</div>
                                        </DropdownMenuRadioItem>
                                    )
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="flex justify-center md:justify-start flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
            </div>
            <div className="relative inline-flex w-full md:flex-1">
                <button type="button" className="w-full py-2 px-3 lg:py-3 lg:px-4 inline-flex items-center justify-center gap-x-2 text-base lg:text-lg font-medium rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <div className="text-lg lg:text-xl">English</div>
                </button>
            </div>
        </div>
    );
}
