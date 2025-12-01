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
        <div className={`flex items-center gap-4 w-full ${highlighted ? 'ring-4 ring-blue-500 ring-opacity-75 bg-blue-50 rounded-lg p-4 shadow-lg' : ''}`}>
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="w-full py-2.5 px-4 border border-gray-300 rounded-lg bg-white text-gray-800 font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <div className="text-base">{fromLanguage}</div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                        <DropdownMenuRadioGroup>
                            {languages.map(language => (
                                language !== fromLanguage && (
                                    <DropdownMenuRadioItem onClick={() => handleLanguageChange(language)} key={language} value={language}>
                                        <div className="text-base">{language}</div>
                                    </DropdownMenuRadioItem>
                                )
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <button type="button" className="w-full py-2.5 px-4 inline-flex items-center justify-center text-base font-medium rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <div className="text-base">English</div>
                </button>
            </div>
        </div>
    );
}
