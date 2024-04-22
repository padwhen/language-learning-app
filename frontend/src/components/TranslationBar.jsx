import React, { useState } from "react";

export const TranslationBar = () => {
    const [fromLanguage, setFromLanguage] = useState('Finnish');
    const languages = ['Finnish', 'Korean', 'Chinese', 'Vietnamese'];

    const handleLanguageChange = (language) => {
        setFromLanguage(language);
    };

    return (
        <div className="flex items-center gap-x-4">
            <div className="hs-dropdown relative inline-flex">
                <button id="hs-dropdown-default-from" type="button" className="w-96 hs-dropdown-toggle py-3 px-4 inline-flex items-center justify-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800">
                    <div className="text-xl">{fromLanguage}</div>
                </button>
                <div className="w-96 hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-60 bg-white shadow-md rounded-lg p-2 mt-2 dark:bg-neutral-800 dark:border dark:border-neutral-700 dark:divide-neutral-700 after:h-4 after:absolute after:-bottom-4 after:start-0 after:w-full before:h-4 before:absolute before:-top-4 before:start-0 before:w-full" aria-labelledby="hs-dropdown-default-from">
                    {languages.map(language => (
                        language !== fromLanguage && (
                            <div key={language} onClick={() => handleLanguageChange(language)} className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700">
                                <div className="text-xl">{language}</div>
                            </div>
                        )
                    ))}
                </div>
            </div>
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
            </div>
            <div className="hs-dropdown relative inline-flex">
                <button id="hs-dropdown-default-from" type="button" className="w-96 hs-dropdown-toggle py-3 px-4 inline-flex items-center justify-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800">
                    <div className="text-xl">English</div>
                </button>
            </div>
        </div>
    );
};
