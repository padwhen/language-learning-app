import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import React from 'react';

export const TranslationBar: React.FC<{
    fromLanguage: string;
    setFromLanguage: (language: string) => void;
}> = ({ fromLanguage, setFromLanguage }) => {
    const languages = ['Finnish', 'Korean', 'Chinese', 'Vietnamese', 'Greek'];
    const handleLanguageChange = (language: string) => {
        setFromLanguage(language);
    }
    return (
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 lg:gap-8 w-full md:w-auto mt-8 p-4 rounded-lg">
            <div className="relative inline-flex w-full md:w-auto">
                <div className="w-full md:w-64 lg:w-80">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full py-2 px-3 lg:py-3 lg:px-4 border border-gray-300 rounded-lg bg-white text-gray-800 font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                <div className="text-lg lg:text-xl">{fromLanguage}</div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full md:w-64 lg:w-80">
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
            <div className="flex justify-center md:justify-start w-full md:w-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
            </div>
            <div className="relative inline-flex w-full md:w-auto">
                <button type="button" className="w-full md:w-64 lg:w-80 py-2 px-3 lg:py-3 lg:px-4 inline-flex items-center justify-center gap-x-2 text-base lg:text-lg font-medium rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <div className="text-lg lg:text-xl">English</div>
                </button>
            </div>
        </div>
    );
}
