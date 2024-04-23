import 'preline'
export const Modal = ({ word, index }) => {
    const { fi, en, type, pronunciation, original_word, comment } = word;
    const modalId = `hs-basic-modal-${type}-${index}`;
    return (
        <div>
            <button type="button" className="m-1 py-1 px-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none" data-hs-overlay={`#${modalId}`}>
                {fi}
            </button>
            <div id={modalId} className="mt-[120px] hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-[80] opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none">
                <div className="sm:max-w-lg sm:w-full m-3 sm:mx-auto">
                    <div className="flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-neutral-700/70">
                        <div className="flex justify-between items-center py-3 px-4 border-b dark:border-neutral-700">
                            <h2 className="font-bold text-lg text-gray-800 dark:text-white">
                                {fi}
                            </h2>
                            <button type="button" className="flex justify-center items-center size-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700" data-hs-overlay={`#${modalId}`}>
                                <span className="sr-only">Close</span>
                                <svg className="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            <div className="flex mt-1 gap-2">
                                <h4 className="font-bold text-gray-800 min-w-[120px]">Original word</h4>
                                <p className="text-gray-800 dark:text-neutral-400">{original_word}</p>
                            </div>
                            <div className="flex mt-1 gap-2">
                                <h4 className="font-bold text-gray-800 min-w-[120px]">Pronunciation</h4>
                                <p className="text-gray-800 dark:text-neutral-400">{pronunciation}</p>
                            </div>
                            <div className="flex mt-1 gap-2">
                                <h4 className="font-bold text-gray-800 min-w-[120px]">Meaning</h4>
                                <p className="text-gray-800 dark:text-neutral-400">{en}</p>
                            </div>
                            <div className="flex mt-1 gap-2">
                                <h4 className="font-bold text-gray-800 min-w-[120px]">Explanation</h4>
                                <p className="text-gray-800 dark:text-neutral-400">{comment}</p>
                            </div>
                        </div>
                        <div className="flex justify-end items-center gap-x-2 py-3 px-4 border-t dark:border-neutral-700">
                            <button type="button" className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800" data-hs-overlay={`#${modalId}`}>
                                Close
                            </button>
                            <button type="button" className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                                Add this word to a deck
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
